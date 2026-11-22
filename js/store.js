// Data storage.
//  * Demo mode: no js/config.js (e.g. when running locally) — data lives in this browser.
//  * Accounts mode: js/config.js exists (the publish workflow creates it from GitHub secrets) — Supabase.

import { demoData, DEFAULT_SETTINGS, uid } from './model.js';
import { t } from './i18n.js';

const LOCAL_KEY = 'cfy-demo-v1';
const SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

let state = null;
let sb = null; // Supabase client
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn(state));

export const store = {
  get: () => state,
  subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
  get isDemo() { return state?.mode === 'demo'; },

  /** Start-up. Returns 'ready' | 'login' | 'name'. */
  async init() {
    let cfg = null;
    try { cfg = await import('./config.js'); } catch { cfg = null; }
    if (!cfg?.SUPABASE_URL || !cfg?.SUPABASE_ANON_KEY) {
      state = loadLocal() || demoData();
      return 'ready';
    }
    const { createClient } = await import(SUPABASE_JS);
    sb = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });
    const { data } = await sb.auth.getSession();
    if (!data.session) return 'login';
    return this.loadCloud();
  },

  // ---------- sign-in with email and password (accounts are created in the Supabase dashboard) ----------
  async signIn(email, password) {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw new Error(friendlyError(error));
    return this.loadCloud();
  },
  async signOut() {
    await sb.auth.signOut();
    state = null;
  },

  async setName(name) {
    if (this.isDemo) { state.users[state.me].name = name; return saveLocal(); }
    await must(sb.from('profiles').update({ name }).eq('id', state.me));
    state.users[state.me].name = name;
    emit();
  },

  // ---------- partner ----------
  async createInvite() {
    const { data, error } = await sb.rpc('create_couple');
    if (error) throw new Error(friendlyError(error));
    state.coupleCode = data;
    emit();
    return data;
  },
  async joinWithCode(code) {
    const { error } = await sb.rpc('join_couple', { code });
    if (error) throw new Error(friendlyError(error));
    return this.loadCloud();
  },

  // ---------- load everything from the database ----------
  async loadCloud() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return 'login';
    const [profiles, cals, busy, events] = await Promise.all([
      sb.from('profiles').select('id,name,couple_id,settings'),
      sb.from('work_calendars').select('*').order('created_at'),
      sb.from('work_busy').select('calendar_id,date,start_time,end_time'),
      sb.rpc('visible_events'),
    ]);
    for (const r of [profiles, cals, busy, events]) if (r.error) throw new Error(friendlyError(r.error));

    const mine = profiles.data.find((p) => p.id === user.id);
    const other = profiles.data.find((p) => p.id !== user.id);
    let coupleCode = null;
    if (mine?.couple_id && !other) {
      const { data } = await sb.from('couples').select('invite_code').eq('id', mine.couple_id).maybeSingle();
      coupleCode = data?.invite_code || null;
    }
    state = {
      mode: 'cloud',
      me: user.id,
      partner: other?.id || null,
      email: user.email,
      coupleId: mine?.couple_id || null,
      coupleCode,
      users: Object.fromEntries(profiles.data.map((p) => [p.id, { name: p.name || t('user.noName') }])),
      settings: Object.fromEntries(profiles.data.map((p) => [p.id, { ...DEFAULT_SETTINGS, ...(p.settings || {}) }])),
      workCalendars: cals.data.map((c) => ({ id: c.id, owner: c.owner, name: c.name, days: c.days, start: c.start_time, end: c.end_time })),
      workBusy: busy.data.map((b) => ({ calendarId: b.calendar_id, date: b.date, start: b.start_time, end: b.end_time })),
      events: events.data.map(rowToEvent),
    };
    if (mine && !mine.name) { state.users[user.id].name = ''; emit(); return 'name'; }
    emit();
    return 'ready';
  },

  async refresh() {
    if (this.isDemo || !sb) return;
    try { await this.loadCloud(); } catch { /* offline — keep what we have */ }
  },

  // ---------- events ----------
  async saveEvent(e) {
    if (this.isDemo) {
      const i = state.events.findIndex((x) => x.id === e.id);
      if (i >= 0) state.events[i] = e; else state.events.push(e);
      return saveLocal();
    }
    const row = eventToRow(e);
    const exists = state.events.some((x) => x.id === e.id);
    if (exists) {
      await must(sb.from('events').update({ ...row, updated_at: new Date().toISOString() }).eq('id', e.id));
    } else {
      await must(sb.from('events').insert({ ...row, id: e.id, owner: state.me, couple_id: state.coupleId }));
    }
    await this.loadCloud();
  },
  async deleteEvent(id) {
    if (this.isDemo) { state.events = state.events.filter((x) => x.id !== id); return saveLocal(); }
    await must(sb.from('events').delete().eq('id', id));
    await this.loadCloud();
  },

  // ---------- settings ----------
  async saveSettings(patch) {
    const next = { ...state.settings[state.me], ...patch };
    state.settings[state.me] = next;
    if (this.isDemo) return saveLocal();
    emit();
    await must(sb.from('profiles').update({ settings: next }).eq('id', state.me));
  },

  // ---------- work calendars ----------
  async addWorkCalendar() {
    const c = { id: uid(), owner: state.me, name: t('workCal.newName'), days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00' };
    if (this.isDemo) { state.workCalendars.push(c); return saveLocal(); }
    await must(sb.from('work_calendars').insert({ id: c.id, name: c.name, days: c.days, start_time: c.start, end_time: c.end }));
    await this.loadCloud();
  },
  async saveWorkCalendar(c) {
    const i = state.workCalendars.findIndex((x) => x.id === c.id);
    state.workCalendars[i] = c;
    if (this.isDemo) return saveLocal();
    emit();
    await must(sb.from('work_calendars').update({ name: c.name, days: c.days, start_time: c.start, end_time: c.end }).eq('id', c.id));
  },
  async deleteWorkCalendar(id) {
    if (this.isDemo) {
      state.workCalendars = state.workCalendars.filter((c) => c.id !== id);
      state.events.forEach((e) => { e.ooo = (e.ooo || []).filter((x) => x !== id); });
      return saveLocal();
    }
    await must(sb.from('work_calendars').delete().eq('id', id));
    await this.loadCloud();
  },

  resetDemo() { state = demoData(); saveLocal(); },
};

// ---------- helpers ----------
function loadLocal() {
  try { const raw = localStorage.getItem(LOCAL_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function saveLocal() {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(state)); } catch { /* storage full or unavailable */ }
  emit();
}
async function must(query) {
  const { error } = await query;
  if (error) throw new Error(friendlyError(error));
}

function rowToEvent(r) {
  return {
    id: r.id, owner: r.owner, shared: r.shared, type: r.type, title: r.title, date: r.date,
    start: r.start_time || '', end: r.end_time || '', allDay: r.all_day, yearly: r.yearly, location: r.location || '',
    travelTo: { minutes: r.travel_to_min || 0, mode: r.travel_to_mode || 'transit' },
    travelBack: { minutes: r.travel_back_min || 0, mode: r.travel_back_mode || 'transit' },
    ooo: r.ooo || [], visibility: r.visibility, reminders: r.reminders || [], notes: r.notes || '',
  };
}
function eventToRow(e) {
  return {
    shared: !!e.shared, type: e.type, title: e.title, date: e.date,
    start_time: e.allDay ? null : e.start, end_time: e.allDay ? null : e.end,
    all_day: !!e.allDay, yearly: !!e.yearly, location: e.location || '',
    travel_to_min: e.travelTo?.minutes || 0, travel_to_mode: e.travelTo?.mode || 'transit',
    travel_back_min: e.travelBack?.minutes || 0, travel_back_mode: e.travelBack?.mode || 'transit',
    ooo: e.ooo || [], visibility: e.visibility || 'default', reminders: e.reminders || [], notes: e.notes || '',
  };
}

function friendlyError(err) {
  const m = err?.message || String(err);
  if (/invalid login credentials|invalid_credentials/i.test(m)) return t('error.badLogin');
  if (/email not confirmed/i.test(m)) return t('error.notConfirmed');
  if (/rate limit|too many/i.test(m)) return t('error.rateLimit');
  if (/Failed to fetch|NetworkError|network/i.test(m)) return t('error.offline');
  // errors raised by the database functions in supabase/schema.sql
  if (m.includes('invalid_invite_code')) return t('error.invalidInvite');
  if (m.includes('already_paired')) return t('error.alreadyPaired');
  if (m.includes('couple_full')) return t('error.coupleFull');
  return t('error.generic', { message: m });
}
