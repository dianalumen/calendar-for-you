import {
  eventsOn as eventsOnState, busyOn as busyOnState, oooWindow, freeTogether as freeTogetherState,
  ymd, parseYmd, addDays, toMin, uid,
  TRAVEL_MODES, VISIBILITY_LEVELS, EVENT_TYPES,
} from './model.js';
import { store } from './store.js';
import { t, getLang, setLang, LANGUAGES, monthName, dayHeading, dayLabel, weekdayName } from './i18n.js';

const $app = document.getElementById('app');
const $sheet = document.getElementById('sheet');
const $tabbar = document.querySelector('.tabbar');

const eventsOn = (ds) => eventsOnState(store.get(), ds);
const busyOn = (ds, who) => busyOnState(store.get(), ds, who);
const freeTogether = (ds) => freeTogetherState(store.get(), ds);

const ui = {
  screen: 'loading', // loading | login | name | app
  login: { email: '', error: '', busy: false },
  tab: 'calendar',
  selected: ymd(new Date()),
  month: (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); })(),
};

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const name = (id) => store.get().users[id]?.name || t('user.partner');
const me = () => store.get().me;
const partner = () => store.get().partner;
/** <option> list from a { value: label } map. */
const options = (map, selected) => Object.entries(map)
  .map(([k, v]) => `<option value="${k}" ${String(k) === String(selected) ? 'selected' : ''}>${esc(v)}</option>`).join('');
const pick = (labels, keys) => Object.fromEntries(keys.map((k) => [k, labels[k]]));

/** Runs a database write and shows an error message if it fails. */
async function run(fn) {
  try { await fn(); return true; } catch (err) { alert(err.message || String(err)); return false; }
}

const ICON = {
  chevL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  chevR: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
  route: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8 18h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16"/></svg>',
  door: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4.5L14 3v18M14 5h5v16M3 21h18"/><circle cx="11" cy="12" r=".6"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/></svg>',
  info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.8v.4"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>',
};

// ================= navigation =================
document.querySelectorAll('.tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    if (tab === 'add') { openEditor(null, ui.selected); return; }
    ui.tab = tab;
    render();
    window.scrollTo(0, 0);
  });
});
store.subscribe(() => render());

function translateChrome() {
  document.title = t('appName');
  $tabbar.setAttribute('aria-label', t('tab.nav'));
  $tabbar.querySelectorAll('[data-label]').forEach((el) => { el.textContent = t(el.dataset.label); });
}

function render() {
  translateChrome();
  const inApp = ui.screen === 'app';
  $tabbar.hidden = !inApp;
  document.body.classList.toggle('no-tabs', !inApp);
  if (ui.screen === 'loading') { $app.innerHTML = `<div class="center-screen"><p class="hint">${t('loading')}</p></div>`; return; }
  if (ui.screen === 'login') { $app.innerHTML = loginView(); bindLogin(); return; }
  if (ui.screen === 'name') { $app.innerHTML = nameView(); bindName(); return; }
  document.querySelectorAll('.tab').forEach((b) => {
    if (b.dataset.tab === ui.tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  $app.innerHTML = ui.tab === 'settings' ? settingsView() : calendarView();
  bind();
}

const languagePicker = (id) => `<select id="${id}" data-lang aria-label="${t('settings.language')}">${options(LANGUAGES, getLang())}</select>`;

// ================= sign-in =================
function loginView() {
  const l = ui.login;
  return `<div class="center-screen">
    <img src="icons/icon.svg" alt="" width="72" height="72" class="logo">
    <h1>${t('appName')}</h1>
    <p class="hint">${t('login.intro')}</p>
    <form class="login-form">
      <label class="sr" for="l-email">${t('login.emailLabel')}</label>
      <input id="l-email" type="email" name="email" autocomplete="username" inputmode="email" placeholder="${t('login.emailPlaceholder')}" value="${esc(l.email)}" required>
      <label class="sr" for="l-password">${t('login.passwordLabel')}</label>
      <input id="l-password" type="password" name="password" autocomplete="current-password" placeholder="${t('login.passwordLabel')}" required>
      <button class="btn primary" ${l.busy ? 'disabled' : ''}>${l.busy ? t('login.checking') : t('login.signIn')}</button>
    </form>
    ${l.error ? `<p class="error" role="alert">${esc(l.error)}</p>` : ''}
    <p class="hint small">${t('login.noAccount')}</p>
    <div class="lang-corner">${languagePicker('l-lang')}</div>
  </div>`;
}

function bindLogin() {
  bindLanguage();
  const l = ui.login;
  const f = $app.querySelector('form');
  f.onsubmit = async (ev) => {
    ev.preventDefault();
    l.email = f.elements.email.value.trim();
    const password = f.elements.password.value;
    l.error = ''; l.busy = true;
    render();
    try {
      ui.screen = await store.signIn(l.email, password) === 'name' ? 'name' : 'app';
    } catch (err) { l.error = err.message; }
    l.busy = false;
    render();
    if (ui.screen === 'login') $app.querySelector(l.email ? '#l-password' : '#l-email')?.focus();
  };
}

function nameView() {
  return `<div class="center-screen">
    <h1>${t('name.title')}</h1>
    <p class="hint">${t('name.hint')}</p>
    <form class="login-form">
      <label class="sr" for="n-name">${t('name.label')}</label>
      <input id="n-name" name="name" autocomplete="given-name" maxlength="20" required placeholder="${t('name.label')}">
      <button class="btn primary">${t('name.next')}</button>
    </form>
  </div>`;
}
function bindName() {
  const f = $app.querySelector('form');
  f.elements.name.focus();
  f.onsubmit = async (ev) => {
    ev.preventDefault();
    const n = f.elements.name.value.trim();
    if (!n) return;
    if (await run(() => store.setName(n))) { ui.screen = 'app'; render(); }
  };
}

// ================= calendar =================
function calendarView() {
  const m = ui.month;
  const first = new Date(m.getFullYear(), m.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7; // Monday first
  const start = addDays(first, -offset);
  const today = ymd(new Date());
  const weeks = Math.ceil((offset + new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate()) / 7);

  let cells = '';
  for (let i = 0; i < weeks * 7; i++) {
    const d = addDays(start, i);
    const ds = ymd(d);
    const evs = eventsOn(ds);
    const lanes = new Set(evs.filter((e) => !e.allDay).map((e) => e.lane));
    const occasion = evs.some((e) => e.type !== 'event');
    const dots = ['me', 'shared', 'partner'].filter((l) => lanes.has(l)).map((l) => `<i class="${l}"></i>`).join('') + (occasion ? '<i class="bday"></i>' : '');
    const cls = ['day', d.getMonth() !== m.getMonth() && 'other', ds === today && 'today', ds === ui.selected && 'sel', (d.getDay() === 0 || d.getDay() === 6) && 'weekend'].filter(Boolean).join(' ');
    const label = `${dayLabel(d)}${evs.length ? `, ${t('cal.eventsCount', { n: evs.length })}` : ''}`;
    cells += `<button class="${cls}" data-date="${ds}" aria-label="${label}" ${ds === ui.selected ? 'aria-pressed="true"' : ''}><span class="n">${d.getDate()}</span><span class="dots">${dots}</span></button>`;
  }

  return `
    <header class="top">
      <h1>${monthName(m)} <span style="color:var(--ink-3);font-weight:600">${m.getFullYear()}</span></h1>
      <button class="text-btn" data-act="today">${t('cal.today')}</button>
      <button class="icon-btn" data-act="prev" aria-label="${t('cal.prevMonth')}">${ICON.chevL}</button>
      <button class="icon-btn" data-act="next" aria-label="${t('cal.nextMonth')}">${ICON.chevR}</button>
    </header>
    <section class="month" aria-label="${t('cal.month')}">
      <div class="wd">${t('days.short').map((w) => `<span>${w}</span>`).join('')}</div>
      <div class="days">${cells}</div>
    </section>
    <div class="legend" aria-hidden="true">
      <span><i style="background:var(--me)"></i>${esc(name(me()))}</span>
      <span><i style="background:var(--us)"></i>${t('cal.shared')}</span>
      ${partner() ? `<span><i style="background:var(--partner)"></i>${esc(name(partner()))}</span>` : ''}
      <span><i style="box-shadow:inset 0 0 0 1.5px var(--us)"></i>${t('cal.occasions')}</span>
    </div>
    ${agendaView(ui.selected)}
  `;
}

function agendaView(ds) {
  const st = store.get();
  const evs = eventsOn(ds);
  const allDay = evs.filter((e) => e.allDay);
  const timed = evs.filter((e) => !e.allDay);

  const busyItems = [];
  for (const who of [me(), partner()].filter(Boolean)) {
    busyOn(ds, who).forEach((b) => {
      const cal = st.workCalendars.find((c) => c.id === b.calendarId);
      busyItems.push({ kind: 'busy', who, start: b.start, end: b.end, cal });
    });
  }
  const items = [...timed.map((e) => ({ kind: 'event', ev: e, start: e.start })), ...busyItems]
    .sort((a, b) => a.start.localeCompare(b.start));

  const free = freeTogether(ds);
  const freeLine = free.length
    ? `<p class="free">${ICON.heart}${t('agenda.freeTogether', { ranges: free.map((f) => `${f.start}–${f.end}`).join(', ') })}</p>`
    : `<p class="free none">${ICON.heart}${t('agenda.noFree')}</p>`;

  const rows = [...allDay.map(eventRow), ...items.map((it) => (it.kind === 'busy' ? busyRow(it) : eventRow(it.ev)))].join('');

  return `
    <section class="agenda" aria-label="${t('agenda.label')}">
      <div class="agenda-head">
        <h2>${dayHeading(parseYmd(ds))}</h2>
        <button class="text-btn" data-act="add">${t('agenda.add')}</button>
      </div>
      ${freeLine}
      ${rows || `<div class="empty"><p>${t('agenda.empty')}</p><button class="btn ghost" data-act="add">${t('agenda.addEvent')}</button></div>`}
    </section>`;
}

function busyRow(it) {
  const mine = it.who === me();
  const title = mine ? t('busy.mine') : esc(t('busy.partner', { name: name(it.who) }));
  return `<div class="ev busy" role="group" aria-label="${title} ${it.start}–${it.end}">
    <time>${it.start}<small>${it.end}</small></time><span class="bar"></span>
    <div><div class="t">${title}</div><div class="meta"><span>${ICON.lock}${mine ? esc(it.cal?.name || t('busy.work')) : t('busy.workCalendar')}</span></div></div>
  </div>`;
}

function eventRow(e) {
  const st = store.get();
  const when = e.allDay ? t('event.allDay') : `${e.start}<small>${e.end}</small>`;
  if (e.view === 'busy') {
    return `<div class="ev partner busy" role="group"><time>${when}</time><span class="bar"></span>
      <div><div class="t">${esc(t('busy.partner', { name: name(e.owner) }))}</div><div class="meta"><span>${ICON.lock}${t('busy.private')}</span></div></div></div>`;
  }
  const laneClass = e.lane === 'me' ? '' : e.lane;
  const tag = e.lane === 'shared' ? `<span class="who shared">${t('event.sharedTag')}</span>`
    : e.lane === 'partner' ? `<span class="who partner">${esc(name(e.owner))}</span>` : '';
  const meta = [];
  if (e.type !== 'event') meta.push(`<span>${ICON.heart}${t('eventTypes')[e.type]}${e.yearly ? t('event.yearly') : ''}</span>`);
  if (e.location) meta.push(`<span>${ICON.pin}${esc(e.location)}</span>`);
  const there = e.travelTo?.minutes, back = e.travelBack?.minutes;
  if (there || back) {
    const parts = [];
    if (there) parts.push(t('travel.to', { min: there, mode: t('travelModes')[e.travelTo.mode].toLowerCase() }));
    if (back) parts.push(t('travel.back', { min: back }));
    meta.push(`<span>${ICON.route}${parts.join(' · ')}</span>`);
  }

  // OOO is shown only for my own work calendars (on a shared event each person sets their own)
  const oooCals = (e.ooo || []).map((id) => st.workCalendars.find((c) => c.id === id && c.owner === me())).filter(Boolean);
  const windows = oooCals.map((c) => ({ c, w: oooWindow(e, c) })).filter((x) => x.w);
  windows.forEach(({ c, w }) => meta.push(`<span class="chip ooo">${ICON.door}OOO ${w.start}–${w.end} · ${esc(c.name)}</span>`));

  return `<button class="ev ${laneClass}" data-edit="${e.id}">
    <time>${when}</time><span class="bar"></span>
    <div><div class="t">${esc(e.title)}${tag}</div>
      ${meta.length ? `<div class="meta">${meta.join('')}</div>` : ''}
      ${!e.allDay && (there || back || windows.length) ? timeline(e, windows[0]?.w) : ''}
    </div></button>`;
}

/** Timeline strip: travel there (dashed) → event → travel back, framed by the OOO window. */
function timeline(e, w) {
  const s = toMin(e.start), en = toMin(e.end);
  const a = s - (e.travelTo?.minutes || 0), b = en + (e.travelBack?.minutes || 0);
  const lo = Math.min(a, w ? toMin(w.start) : a), hi = Math.max(b, w ? toMin(w.end) : b);
  const span = Math.max(hi - lo, 1);
  const pct = (x) => ((x - lo) / span) * 100;
  return `<div class="strip" aria-hidden="true"><span class="track"></span>
    ${a < s ? `<span class="seg travel" style="left:${pct(a)}%;width:${pct(s) - pct(a)}%"></span>` : ''}
    <span class="seg main" style="left:${pct(s)}%;width:${pct(en) - pct(s)}%"></span>
    ${b > en ? `<span class="seg travel" style="left:${pct(en)}%;width:${pct(b) - pct(en)}%"></span>` : ''}
    ${w ? `<span class="ooo-win" style="left:${pct(toMin(w.start))}%;width:${pct(toMin(w.end)) - pct(toMin(w.start))}%"></span>` : ''}
  </div>`;
}

// ================= settings =================
function settingsView() {
  const st = store.get();
  const s = st.settings[me()];
  const mine = st.workCalendars.filter((c) => c.owner === me());
  const theirs = st.workCalendars.filter((c) => c.owner === partner());

  return `
    <header class="top"><h1>${t('settings.title')}</h1></header>
    ${store.isDemo ? `<div class="demo-banner">${ICON.info}<span>${t('settings.demoBanner')}</span></div>` : ''}
    <div class="screen">
      ${store.isDemo ? '' : `
      <p class="group-title">${t('settings.account')}</p>
      <div class="group">
        <div class="row"><label for="my-name">${t('settings.name')}</label><input id="my-name" type="text" data-my-name value="${esc(name(me()))}" maxlength="20"></div>
        <div class="row"><span class="lbl">${t('settings.email')}</span><span class="hint">${esc(st.email)}</span></div>
        <div class="row"><button class="text-btn" data-act="logout" style="padding-left:0">${t('settings.logout')}</button></div>
      </div>

      <p class="group-title">${t('settings.partner')}</p>
      <div class="group">
        ${partner() ? `<div class="row"><span class="lbl">${t('settings.connectedWith')}</span><b>${esc(name(partner()))}</b></div>`
        : st.coupleCode ? `<div class="row stack"><span class="lbl">${t('settings.shareCode')}</span><span class="invite">${esc(st.coupleCode)}</span>
            <span class="hint">${t('settings.shareHint')}</span></div>`
        : `<div class="row stack"><button class="btn primary" data-act="invite">${t('settings.createCode')}</button></div>
           <form class="row" data-join><label for="join-code" class="lbl">${t('settings.haveCode')}</label>
             <input id="join-code" name="code" placeholder="ABC123" maxlength="6" autocapitalize="characters" autocomplete="off" style="width:90px">
             <button class="text-btn">${t('settings.connect')}</button></form>`}
      </div>`}

      <div class="group" style="margin-top:22px">
        <div class="row"><label for="s-lang">${t('settings.language')}</label>${languagePicker('s-lang')}</div>
      </div>

      <p class="group-title">${t('settings.privacy')}</p>
      <div class="group">
        <div class="row"><label for="vis">${t('settings.partnerSees')}</label><select id="vis" data-set="defaultVisibility">${options(pick(t('visibility'), VISIBILITY_LEVELS), s.defaultVisibility)}</select></div>
      </div>
      <p class="group-note">${t('settings.privacyNote')}</p>

      <p class="group-title">${t('settings.notifications')}</p>
      <div class="group">
        <div class="row"><label for="rem">${t('settings.defaultReminder')}</label><select id="rem" data-set="reminder">${options(t('reminders'), s.reminder)}</select></div>
        <div class="row"><label for="bd">${t('settings.occasionReminder')}</label><select id="bd" data-set="birthdayReminderDays">${options(t('occasionReminders'), s.birthdayReminderDays)}</select></div>
        <div class="row"><label for="pc">${t('settings.partnerAdds')}</label><span class="switch"><input id="pc" type="checkbox" data-set-bool="notifyPartnerChanges" ${s.notifyPartnerChanges ? 'checked' : ''}><span></span></span></div>
      </div>
      <p class="group-note">${t('settings.notificationsNote')}</p>

      <p class="group-title">${t('settings.workCalendars')}</p>
      ${mine.map(workCalendarCard).join('')}
      <button class="btn ghost" data-act="add-cal" style="width:100%">${t('settings.addWorkCalendar')}</button>
      <p class="group-note" style="margin-top:8px">${t('settings.workCalendarsNote')}</p>

      ${theirs.length ? `<p class="group-title">${esc(t('settings.partnerWorkCalendars', { name: name(partner()) }))}</p>
      <div class="group">${theirs.map((c) => `<div class="row cal-row"><span class="sw" style="background:var(--partner)"></span><div class="lbl">${esc(c.name)}<small>${daysLabel(c.days)} · ${c.start}–${c.end}</small></div></div>`).join('')}</div>` : ''}

      ${store.isDemo ? `<div class="actions"><button class="btn danger" data-act="reset">${t('settings.resetDemo')}</button></div>` : ''}
    </div>`;
}

function daysLabel(days) {
  if (days.length === 5 && [1, 2, 3, 4, 5].every((x) => days.includes(x))) return t('days.weekdays');
  const abbr = t('days.abbr');
  return WEEK_ORDER.filter((d) => days.includes(d)).map((d) => abbr[d]).join(', ') || t('days.none');
}

function workCalendarCard(c) {
  const short = t('days.short');
  return `<div class="group" data-cal="${c.id}">
    <div class="row"><input type="text" class="full" data-cal-field="name" value="${esc(c.name)}" aria-label="${t('workCal.nameLabel')}" style="font-weight:600"></div>
    <div class="row stack"><span class="hint">${t('workCal.days')}</span>
      <div class="days-pick">${WEEK_ORDER.map((d, i) => `<label><input type="checkbox" data-cal-day="${d}" ${c.days.includes(d) ? 'checked' : ''} aria-label="${weekdayName(d)}"><span>${short[i]}</span></label>`).join('')}</div></div>
    <div class="row"><label>${t('workCal.from')}</label><input type="time" data-cal-field="start" value="${c.start}"></div>
    <div class="row"><label>${t('workCal.to')}</label><input type="time" data-cal-field="end" value="${c.end}"></div>
    <div class="row"><button class="text-btn" data-del-cal="${c.id}" style="color:var(--danger);padding-left:0">${t('workCal.delete')}</button></div>
  </div>`;
}

// ================= event editor =================
function openEditor(id, date) {
  const st = store.get();
  const existing = id ? st.events.find((e) => e.id === id) : null;
  const readOnly = existing && !existing.shared && existing.owner !== me();
  const e = existing ? structuredClone(existing) : {
    id: uid(), owner: me(), shared: false, type: 'event', title: '', date, start: '18:00', end: '19:00', allDay: false, yearly: false,
    location: '', travelTo: { minutes: 0, mode: 'transit' }, travelBack: { minutes: 0, mode: 'transit' },
    ooo: [], visibility: 'default', reminders: [st.settings[me()].reminder || 0], notes: '',
  };
  e.travelTo ||= { minutes: 0, mode: 'transit' };
  e.travelBack ||= { minutes: 0, mode: 'transit' };
  e.ooo ||= [];

  const draw = () => {
    const myCals = st.workCalendars.filter((c) => c.owner === me());
    const dis = readOnly ? 'disabled' : '';
    const ownerLock = readOnly || (existing && existing.owner !== me()) ? 'disabled' : ''; // only the author changes "Whose"
    const visLabels = t('visibility');
    const travelModes = pick(t('travelModes'), TRAVEL_MODES);
    $sheet.innerHTML = `
      <form method="dialog" class="sheet-form">
        <div class="sheet-head">
          <button type="button" class="text-btn" data-close>${t('editor.cancel')}</button>
          <h2 id="sheet-title">${readOnly ? esc(t('editor.viewTitle', { name: name(e.owner) })) : existing ? t('editor.edit') : t('editor.new')}</h2>
          ${readOnly ? '<span></span>' : `<button type="submit" class="text-btn">${t('editor.save')}</button>`}
        </div>
        <div class="sheet-body">
          <input class="title-input" name="title" placeholder="${t('editor.titlePlaceholder')}" value="${esc(e.title)}" ${dis} required maxlength="80" autocomplete="off">
          <div class="seg-ctl" role="group" aria-label="${t('editor.type')}">${EVENT_TYPES.map((k) => `<button type="button" data-type="${k}" aria-pressed="${e.type === k}" ${dis}>${t('eventTypes')[k]}</button>`).join('')}</div>

          <div class="group">
            <div class="row"><span class="lbl">${t('editor.whose')}</span>
              <div class="seg-ctl" role="group" aria-label="${t('editor.whose')}">
                <button type="button" data-shared="0" aria-pressed="${!e.shared}" ${ownerLock}>${existing && !e.shared && e.owner !== me() ? esc(name(e.owner)) : t('editor.mine')}</button>
                <button type="button" data-shared="1" aria-pressed="${!!e.shared}" ${ownerLock}>${t('editor.shared')}</button>
              </div></div>
            <div class="row"><label for="f-allday">${t('editor.allDay')}</label><span class="switch"><input id="f-allday" type="checkbox" name="allDay" ${e.allDay ? 'checked' : ''} ${dis}><span></span></span></div>
            <div class="row"><label for="f-date">${t('editor.date')}</label><input id="f-date" type="date" name="date" value="${e.date}" ${dis} required></div>
            ${e.allDay ? '' : `
            <div class="row"><label for="f-start">${t('editor.start')}</label><input id="f-start" type="time" name="start" value="${e.start}" ${dis} required></div>
            <div class="row"><label for="f-end">${t('editor.end')}</label><input id="f-end" type="time" name="end" value="${e.end}" ${dis} required></div>`}
            <div class="row"><label for="f-yearly">${t('editor.yearly')}</label><span class="switch"><input id="f-yearly" type="checkbox" name="yearly" ${e.yearly ? 'checked' : ''} ${dis}><span></span></span></div>
          </div>

          <div class="group">
            <div class="row"><input type="text" class="full" name="location" placeholder="${t('editor.location')}" value="${esc(e.location || '')}" ${dis} aria-label="${t('editor.location')}"></div>
          </div>

          ${e.allDay ? '' : `
          <p class="group-title">${t('editor.travel')}</p>
          <div class="group">
            <div class="row"><label for="f-tt">${t('editor.travelTo')}</label><input id="f-tt" type="number" min="0" max="600" step="5" inputmode="numeric" name="travelTo" value="${e.travelTo.minutes || ''}" placeholder="0" ${dis}>
              <select name="travelToMode" aria-label="${t('editor.travelToMode')}" ${dis}>${options(travelModes, e.travelTo.mode)}</select></div>
            <div class="row"><label for="f-tb">${t('editor.travelBack')}</label><input id="f-tb" type="number" min="0" max="600" step="5" inputmode="numeric" name="travelBack" value="${e.travelBack.minutes || ''}" placeholder="0" ${dis}>
              <select name="travelBackMode" aria-label="${t('editor.travelBackMode')}" ${dis}>${options(travelModes, e.travelBack.mode)}</select></div>
          </div>`}

          ${!readOnly && !e.allDay && myCals.length ? `
          <p class="group-title">${t('editor.ooo')}</p>
          <div class="group">
            ${myCals.map((c) => {
              const on = e.ooo.includes(c.id);
              const w = oooWindow(e, c);
              const hint = !on ? `${daysLabel(c.days)} · ${c.start}–${c.end}`
                : w ? t('editor.oooWill', { range: `${w.start}–${w.end}` }) : t('editor.oooOutside');
              return `<div class="row"><label for="o-${c.id}" class="lbl">${esc(c.name)}<br><span class="hint ${on && w ? 'ooo' : on ? 'warn' : ''}">${hint}</span></label>
                <span class="switch"><input id="o-${c.id}" type="checkbox" data-ooo="${c.id}" ${on ? 'checked' : ''}><span></span></span></div>`;
            }).join('')}
          </div>
          <p class="group-note">${t('editor.oooNote')}</p>` : ''}

          <div class="group">
            ${!e.shared && !readOnly ? `<div class="row"><label for="f-vis">${t('editor.partnerSees')}</label><select id="f-vis" name="visibility">${options({
              default: t('editor.visibilityDefault', { value: visLabels[st.settings[me()].defaultVisibility].toLowerCase() }),
              ...pick(visLabels, VISIBILITY_LEVELS),
            }, e.visibility)}</select></div>` : ''}
            <div class="row"><label for="f-rem">${t('editor.reminder')}</label><select id="f-rem" name="reminder" ${dis}>${options(t('reminders'), e.reminders?.[0] ?? 0)}</select></div>
            <div class="row"><textarea name="notes" placeholder="${t('editor.notes')}" aria-label="${t('editor.notes')}" ${dis}>${esc(e.notes || '')}</textarea></div>
          </div>

          ${existing && !readOnly ? `<div class="actions"><button type="button" class="btn danger" data-delete>${t('editor.delete')}</button></div>` : ''}
          ${readOnly ? `<p class="group-note">${esc(t('editor.readOnlyNote', { name: name(e.owner) }))}</p>` : ''}
        </div>
      </form>`;
    bindEditor();
  };

  // copies the current form values into `e` (without saving)
  const collect = () => {
    const f = $sheet.querySelector('form');
    if (!f || readOnly) return;
    const v = (n) => f.elements[n]?.value;
    e.title = v('title')?.trim() ?? e.title;
    e.date = v('date') || e.date;
    if (f.elements.start) e.start = v('start');
    if (f.elements.end) e.end = v('end');
    e.allDay = f.elements.allDay.checked;
    e.yearly = f.elements.yearly.checked;
    e.location = v('location') ?? '';
    if (f.elements.travelTo) {
      e.travelTo = { minutes: Math.max(0, parseInt(v('travelTo'), 10) || 0), mode: v('travelToMode') };
      e.travelBack = { minutes: Math.max(0, parseInt(v('travelBack'), 10) || 0), mode: v('travelBackMode') };
    }
    if (f.elements.visibility) e.visibility = v('visibility');
    e.reminders = [Number(v('reminder')) || 0];
    e.notes = v('notes') ?? '';
  };

  const bindEditor = () => {
    const f = $sheet.querySelector('form');
    $sheet.querySelector('[data-close]').onclick = () => $sheet.close();
    $sheet.querySelectorAll('[data-type]').forEach((b) => b.onclick = () => {
      collect(); e.type = b.dataset.type;
      if (e.type !== 'event') { e.allDay = true; e.yearly = true; e.ooo = []; }
      draw();
    });
    $sheet.querySelectorAll('[data-shared]').forEach((b) => b.onclick = () => { collect(); e.shared = b.dataset.shared === '1'; draw(); });
    ['allDay', 'start', 'end', 'date', 'travelTo', 'travelBack'].forEach((n) => {
      const el = f.elements[n];
      if (el) el.addEventListener('change', () => { collect(); draw(); restoreFocus(n); });
    });
    $sheet.querySelectorAll('[data-ooo]').forEach((cb) => cb.onchange = () => {
      collect();
      const calId = cb.dataset.ooo;
      e.ooo = cb.checked ? [...new Set([...e.ooo, calId])] : e.ooo.filter((x) => x !== calId);
      draw(); restoreFocus(null, `o-${calId}`);
    });
    const del = $sheet.querySelector('[data-delete]');
    if (del) del.onclick = async () => {
      if (!confirm(t('editor.confirmDelete', { title: e.title || t('editor.untitled') }))) return;
      if (await run(() => store.deleteEvent(e.id))) $sheet.close();
    };
    f.onsubmit = async (ev) => {
      ev.preventDefault();
      collect();
      if (!e.title) { f.elements.title.focus(); return; }
      if (!e.allDay && e.end <= e.start) { alert(t('editor.endAfterStart')); f.elements.end.focus(); return; }
      const saveBtn = f.querySelector('button[type="submit"]');
      if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = t('editor.saving'); }
      const ok = await run(() => store.saveEvent(e));
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = t('editor.save'); }
      if (!ok) return;
      ui.selected = e.date;
      const d = parseYmd(e.date); ui.month = new Date(d.getFullYear(), d.getMonth(), 1);
      ui.tab = 'calendar';
      $sheet.close();
      render();
    };
  };
  const restoreFocus = (fieldName, elementId) => {
    const el = elementId ? document.getElementById(elementId) : $sheet.querySelector('form').elements[fieldName];
    el?.focus({ preventScroll: true });
  };

  draw();
  $sheet.showModal();
  if (!existing) setTimeout(() => $sheet.querySelector('.title-input')?.focus(), 50);
}

// close the sheet by tapping the backdrop
$sheet.addEventListener('click', (ev) => { if (ev.target === $sheet) $sheet.close(); });

// ================= event handlers =================
function bindLanguage() {
  $app.querySelectorAll('[data-lang]').forEach((sel) => sel.onchange = () => { setLang(sel.value); render(); });
}

function bind() {
  bindLanguage();
  $app.querySelectorAll('[data-date]').forEach((b) => b.onclick = () => {
    ui.selected = b.dataset.date;
    const d = parseYmd(ui.selected);
    if (d.getMonth() !== ui.month.getMonth()) ui.month = new Date(d.getFullYear(), d.getMonth(), 1);
    render();
  });
  $app.querySelectorAll('[data-edit]').forEach((b) => b.onclick = () => openEditor(b.dataset.edit));
  const act = (action, fn) => $app.querySelectorAll(`[data-act="${action}"]`).forEach((b) => b.onclick = fn);
  act('prev', () => shiftMonth(-1));
  act('next', () => shiftMonth(1));
  act('today', () => { const now = new Date(); ui.selected = ymd(now); ui.month = new Date(now.getFullYear(), now.getMonth(), 1); render(); });
  act('add', () => openEditor(null, ui.selected));
  act('reset', () => { if (confirm(t('confirm.resetDemo'))) store.resetDemo(); });
  act('add-cal', () => run(() => store.addWorkCalendar()));
  act('logout', async () => {
    if (!confirm(t('confirm.logout'))) return;
    await run(() => store.signOut());
    ui.screen = 'login'; ui.login = { email: '', error: '', busy: false };
    render();
  });
  act('invite', () => run(() => store.createInvite()));
  const join = $app.querySelector('[data-join]');
  if (join) join.onsubmit = async (ev) => {
    ev.preventDefault();
    const code = join.elements.code.value.trim();
    if (code.length < 6) { join.elements.code.focus(); return; }
    if (await run(() => store.joinWithCode(code))) alert(t('alert.connected'));
  };

  // settings
  const myName = $app.querySelector('[data-my-name]');
  if (myName) myName.onchange = () => { const n = myName.value.trim(); if (n) run(() => store.setName(n)); };
  $app.querySelectorAll('[data-set]').forEach((sel) => sel.onchange = () => {
    const v = sel.value;
    run(() => store.saveSettings({ [sel.dataset.set]: /^\d+$/.test(v) ? Number(v) : v }));
  });
  $app.querySelectorAll('[data-set-bool]').forEach((cb) => cb.onchange = () => run(() => store.saveSettings({ [cb.dataset.setBool]: cb.checked })));
  $app.querySelectorAll('[data-cal]').forEach((card) => {
    const calId = card.dataset.cal;
    const update = (fn) => {
      const c = structuredClone(store.get().workCalendars.find((x) => x.id === calId));
      fn(c);
      return run(() => store.saveWorkCalendar(c));
    };
    card.querySelectorAll('[data-cal-field]').forEach((inp) => inp.onchange = () => update((c) => { c[inp.dataset.calField] = inp.value || c[inp.dataset.calField]; }));
    card.querySelectorAll('[data-cal-day]').forEach((cb) => cb.onchange = () => update((c) => {
      const d = Number(cb.dataset.calDay);
      c.days = cb.checked ? [...new Set([...c.days, d])] : c.days.filter((x) => x !== d);
    }));
  });
  $app.querySelectorAll('[data-del-cal]').forEach((b) => b.onclick = () => {
    if (!confirm(t('confirm.deleteWorkCalendar'))) return;
    run(() => store.deleteWorkCalendar(b.dataset.delCal));
  });

  // swipe left/right on the month grid
  const month = $app.querySelector('.month');
  if (month) {
    let x0 = null;
    month.addEventListener('touchstart', (ev) => { x0 = ev.touches[0].clientX; }, { passive: true });
    month.addEventListener('touchend', (ev) => {
      if (x0 === null) return;
      const dx = ev.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 60) shiftMonth(dx < 0 ? 1 : -1);
    });
  }
}

function shiftMonth(n) {
  ui.month = new Date(ui.month.getFullYear(), ui.month.getMonth() + n, 1);
  render();
}

// ================= start-up =================
render();
store.init()
  .then((status) => { ui.screen = status === 'ready' ? 'app' : status; render(); })
  .catch((err) => {
    $app.innerHTML = `<div class="center-screen"><h1>${t('error.loadTitle')}</h1><p class="hint">${esc(err.message || String(err))}</p><button class="btn primary" onclick="location.reload()">${t('error.retry')}</button></div>`;
  });

// when the app comes back to the foreground, fetch fresh data (e.g. the partner's changes)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && ui.screen === 'app' && !$sheet.open) store.refresh();
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
