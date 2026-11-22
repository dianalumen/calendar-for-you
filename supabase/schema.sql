-- Calendar for You — Supabase database
-- Paste all of this into Supabase → SQL Editor → New query → Run. Run it once.
--
-- Privacy rules (enforced by the database, not by the app):
--  * every account sees and changes only its own data;
--  * shared events are visible to and editable by the couple;
--  * the partner's private events are only readable through visible_events(),
--    which hides details according to the event's visibility setting;
--  * work meetings are stored as times only, never titles.

create extension if not exists pgcrypto;

-- ---------- tables ----------

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null default upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6)),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  couple_id uuid references public.couples on delete set null,
  settings jsonb not null default '{"defaultVisibility":"busy","reminder":30,"birthdayReminderDays":3,"notifyPartnerChanges":true}',
  created_at timestamptz not null default now()
);

create table public.work_calendars (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references public.profiles on delete cascade,
  name text not null,
  days int[] not null default '{1,2,3,4,5}',
  start_time text not null default '09:00',
  end_time text not null default '17:00',
  created_at timestamptz not null default now()
);

-- filled later by the work-calendar script (times only)
create table public.work_busy (
  id bigint generated always as identity primary key,
  calendar_id uuid not null references public.work_calendars on delete cascade,
  date date not null,
  start_time text not null,
  end_time text not null
);
create index on public.work_busy (calendar_id, date);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references public.profiles on delete cascade,
  couple_id uuid references public.couples on delete set null,
  shared boolean not null default false,
  type text not null default 'event' check (type in ('event', 'birthday', 'anniversary')),
  title text not null check (length(title) between 1 and 80),
  date date not null,
  start_time text,
  end_time text,
  all_day boolean not null default false,
  yearly boolean not null default false,
  location text not null default '',
  travel_to_min int not null default 0 check (travel_to_min between 0 and 600),
  travel_to_mode text not null default 'transit',
  travel_back_min int not null default 0 check (travel_back_min between 0 and 600),
  travel_back_mode text not null default 'transit',
  ooo uuid[] not null default '{}',
  visibility text not null default 'default' check (visibility in ('default', 'full', 'busy', 'hidden')),
  reminders int[] not null default '{}',
  notes text not null default '',
  updated_at timestamptz not null default now()
);
create index on public.events (owner);
create index on public.events (couple_id);

-- ---------- helper functions ----------

create or replace function public.my_couple() returns uuid
language sql stable security definer set search_path = public as $$
  select couple_id from profiles where id = auth.uid()
$$;

create or replace function public.partner_id() returns uuid
language sql stable security definer set search_path = public as $$
  select p.id from profiles p
  where p.couple_id is not null and p.couple_id = my_couple() and p.id <> auth.uid()
  limit 1
$$;

-- new account → empty profile
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- create a couple and return the invite code for the partner (or return the existing code)
create or replace function public.create_couple() returns text
language plpgsql security definer set search_path = public as $$
declare c uuid; code text;
begin
  select couple_id into c from profiles where id = auth.uid();
  if c is null then
    insert into couples default values returning id into c;
    update profiles set couple_id = c where id = auth.uid();
    update events set couple_id = c where owner = auth.uid();
  end if;
  select invite_code into code from couples where id = c;
  return code;
end $$;

-- join a couple with the partner's invite code
create or replace function public.join_couple(code text) returns void
language plpgsql security definer set search_path = public as $$
declare c uuid; n int;
begin
  select id into c from couples where invite_code = upper(trim(code));
  if c is null then raise exception 'invalid_invite_code'; end if;
  if (select couple_id from profiles where id = auth.uid()) is not null then
    raise exception 'already_paired';
  end if;
  select count(*) into n from profiles where couple_id = c;
  if n >= 2 then raise exception 'couple_full'; end if;
  update profiles set couple_id = c where id = auth.uid();
  update events set couple_id = c where owner = auth.uid();
end $$;

-- every event I may see; the partner's private events with details hidden
create or replace function public.visible_events() returns setof public.events
language sql stable security definer set search_path = public as $$
  select * from events
  where owner = auth.uid() or (shared and couple_id is not null and couple_id = my_couple())
  union all
  select e.id, e.owner, e.couple_id, e.shared, e.type,
         case when r.v = 'full' then e.title else 'Busy' end,
         e.date, e.start_time, e.end_time, e.all_day, e.yearly,
         case when r.v = 'full' then e.location else '' end,
         case when r.v = 'full' then e.travel_to_min else 0 end, e.travel_to_mode,
         case when r.v = 'full' then e.travel_back_min else 0 end, e.travel_back_mode,
         '{}'::uuid[], r.v, '{}'::int[],
         case when r.v = 'full' then e.notes else '' end,
         e.updated_at
  from events e
  join profiles p on p.id = e.owner
  cross join lateral (
    select case when e.visibility = 'default'
                then coalesce(p.settings->>'defaultVisibility', 'busy')
                else e.visibility end as v
  ) r
  where e.owner = partner_id() and not e.shared and r.v <> 'hidden'
$$;

-- ---------- security (Row Level Security) ----------

alter table public.couples enable row level security;
alter table public.profiles enable row level security;
alter table public.work_calendars enable row level security;
alter table public.work_busy enable row level security;
alter table public.events enable row level security;

create policy "couple members see their couple" on public.couples
  for select using (id = public.my_couple());

create policy "see myself and my partner" on public.profiles
  for select using (id = auth.uid() or id = public.partner_id());
create policy "update only myself" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
-- couple membership changes only through create_couple / join_couple
revoke update on public.profiles from authenticated, anon;
grant update (name, settings) on public.profiles to authenticated;

create policy "see my and my partner's work calendars" on public.work_calendars
  for select using (owner = auth.uid() or owner = public.partner_id());
create policy "manage my own work calendars" on public.work_calendars
  for all using (owner = auth.uid()) with check (owner = auth.uid());

create policy "see my and my partner's busy times" on public.work_busy
  for select using (exists (
    select 1 from public.work_calendars w
    where w.id = calendar_id and (w.owner = auth.uid() or w.owner = public.partner_id())
  ));

create policy "my events" on public.events
  for all using (owner = auth.uid())
  with check (owner = auth.uid() and (couple_id is null or couple_id = public.my_couple()));
create policy "shared events: read" on public.events
  for select using (shared and couple_id is not null and couple_id = public.my_couple());
create policy "shared events: update" on public.events
  for update using (shared and couple_id is not null and couple_id = public.my_couple())
  with check (shared and couple_id = public.my_couple());
create policy "shared events: delete" on public.events
  for delete using (shared and couple_id is not null and couple_id = public.my_couple());
-- an event's owner and couple are set only when it is created
revoke update on public.events from authenticated, anon;
grant update (shared, type, title, date, start_time, end_time, all_day, yearly, location,
              travel_to_min, travel_to_mode, travel_back_min, travel_back_mode,
              ooo, visibility, reminders, notes, updated_at)
  on public.events to authenticated;

revoke execute on function public.create_couple() from public, anon;
revoke execute on function public.join_couple(text) from public, anon;
revoke execute on function public.visible_events() from public, anon;
grant execute on function public.create_couple() to authenticated;
grant execute on function public.join_couple(text) to authenticated;
grant execute on function public.visible_events() to authenticated;

-- ---------- API access ----------
-- Explicit grants, so the app works whether or not the project's
-- "Grant API access to new tables automatically" option is enabled.
-- Signed-out visitors (anon) get nothing; row-level security above still applies to everyone.
revoke all on public.couples, public.profiles, public.work_calendars, public.work_busy, public.events from anon;
grant select on public.couples to authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.work_calendars to authenticated;
grant select on public.work_busy to authenticated;
grant select, insert, delete on public.events to authenticated;
grant execute on function public.my_couple() to authenticated;
grant execute on function public.partner_id() to authenticated;
