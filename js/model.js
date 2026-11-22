// Calendar logic: no UI and no storage.

import { t } from './i18n.js';

export const TRAVEL_MODES = ['car', 'transit', 'bike', 'walk', 'taxi'];
export const VISIBILITY_LEVELS = ['full', 'busy', 'hidden'];
export const EVENT_TYPES = ['event', 'birthday', 'anniversary'];

export const DEFAULT_SETTINGS = { defaultVisibility: 'busy', reminder: 30, birthdayReminderDays: 3, notifyPartnerChanges: true };

// ---------- dates ----------
export const pad = (n) => String(n).padStart(2, '0');
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
export const fromMin = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

// ---------- sample data (demo mode, no database) ----------
export function demoData() {
  const today = new Date();
  const day = (n) => ymd(addDays(today, n));
  const cals = [
    { id: 'w1', owner: 'a', name: t('demo.workA'), days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00' },
    { id: 'w2', owner: 'a', name: t('demo.workProject'), days: [1, 3], start: '10:00', end: '14:00' },
    { id: 'w3', owner: 'b', name: t('demo.workB'), days: [1, 2, 3, 4, 5], start: '08:00', end: '16:00' },
    { id: 'w4', owner: 'b', name: t('demo.workShifts'), days: [6], start: '09:00', end: '13:00' },
  ];
  const slots = { w1: [['09:30', '10:30'], ['13:00', '14:00']], w2: [['11:00', '12:00']], w3: [['08:30', '10:00'], ['14:00', '15:00']], w4: [['09:00', '12:00']] };
  const workBusy = [];
  for (let i = -3; i < 21; i++) {
    const d = addDays(today, i);
    cals.forEach((cal, ci) => {
      if (!cal.days.includes(d.getDay())) return;
      slots[cal.id].forEach(([s, e], si) => {
        if ((i + si + ci) % 4 === 0) return; // some variety between days
        workBusy.push({ calendarId: cal.id, date: ymd(d), start: s, end: e });
      });
    });
  }
  const ev = (o) => ({ id: uid(), shared: false, type: 'event', allDay: false, yearly: false, location: '',
    travelTo: { minutes: 0, mode: 'transit' }, travelBack: { minutes: 0, mode: 'transit' },
    ooo: [], visibility: 'default', reminders: [], notes: '', ...o });
  return {
    mode: 'demo',
    me: 'a',
    partner: 'b',
    email: '',
    coupleCode: null,
    users: { a: { name: t('user.you') }, b: { name: t('user.partner') } },
    settings: { a: { ...DEFAULT_SETTINGS, defaultVisibility: 'full' }, b: { ...DEFAULT_SETTINGS } },
    workCalendars: cals,
    workBusy,
    events: [
      ev({ owner: 'a', title: t('demo.dentist'), date: day(1), start: '14:00', end: '15:00', location: t('demo.dentistPlace'),
        travelTo: { minutes: 40, mode: 'transit' }, travelBack: { minutes: 30, mode: 'transit' }, ooo: ['w1'], visibility: 'busy', reminders: [60] }),
      ev({ owner: 'a', shared: true, title: t('demo.workout'), date: day(1), start: '18:30', end: '19:30', location: t('demo.gym'),
        travelTo: { minutes: 15, mode: 'bike' }, travelBack: { minutes: 15, mode: 'bike' }, visibility: 'full', reminders: [30] }),
      ev({ owner: 'b', shared: true, title: t('demo.date'), date: day(3), start: '20:00', end: '22:30', location: t('demo.cinema'),
        travelTo: { minutes: 25, mode: 'transit' }, travelBack: { minutes: 25, mode: 'taxi' }, visibility: 'full', reminders: [120] }),
      ev({ owner: 'b', title: t('demo.hairdresser'), date: day(2), start: '15:00', end: '16:00',
        travelTo: { minutes: 20, mode: 'walk' }, travelBack: { minutes: 20, mode: 'walk' }, ooo: ['w3'], visibility: 'full' }),
      ev({ owner: 'a', type: 'birthday', title: t('demo.momBirthday'), date: day(5), allDay: true, yearly: true, visibility: 'full' }),
      ev({ owner: 'a', shared: true, type: 'anniversary', title: t('demo.anniversary'), date: day(12), allDay: true, yearly: true, visibility: 'full' }),
    ],
  };
}

// ---------- calendar logic ----------

/** Events I can see on a given day (yearly repeats and partner visibility applied). */
export function eventsOn(st, dateStr) {
  const [, m, d] = dateStr.split('-');
  return st.events
    .filter((e) => e.date === dateStr || (e.yearly && e.date.slice(5) === `${m}-${d}` && e.date <= dateStr))
    .map((e) => {
      const lane = e.shared ? 'shared' : e.owner === st.me ? 'me' : 'partner';
      let view = 'full';
      if (lane === 'partner') {
        const vis = e.visibility === 'default' ? (st.settings[e.owner]?.defaultVisibility || 'busy') : e.visibility;
        if (vis === 'hidden') return null;
        view = vis;
      }
      return { ...e, lane, view };
    })
    .filter(Boolean)
    .sort((a, b) => Number(!!b.allDay) - Number(!!a.allDay) || (a.start || '').localeCompare(b.start || ''));
}

/** "Busy" blocks from one person's work calendars. */
export function busyOn(st, dateStr, owner) {
  const ids = st.workCalendars.filter((c) => c.owner === owner).map((c) => c.id);
  return st.workBusy.filter((b) => b.date === dateStr && ids.includes(b.calendarId));
}

/**
 * Out-of-office window for an event in one work calendar:
 * from (start − travel there) to (end + travel back), trimmed to working hours.
 * Returns null on a day off, or when the window misses working hours entirely.
 */
export function oooWindow(ev, cal) {
  if (ev.allDay || !ev.start || !ev.end) return null;
  const weekday = parseYmd(ev.date).getDay();
  if (!cal.days.includes(weekday)) return null;
  const from = toMin(ev.start) - (ev.travelTo?.minutes || 0);
  const to = toMin(ev.end) + (ev.travelBack?.minutes || 0);
  const s = Math.max(from, toMin(cal.start));
  const e = Math.min(to, toMin(cal.end));
  if (e <= s) return null;
  return { start: fromMin(s), end: fromMin(e) };
}

/** Time when both are free on a day, between 7:00 and 23:00 (gaps of at least 1 hour). */
export function freeTogether(st, dateStr, from = 7 * 60, to = 23 * 60) {
  const blocks = [];
  for (const who of [st.me, st.partner].filter(Boolean)) {
    busyOn(st, dateStr, who).forEach((b) => blocks.push([toMin(b.start), toMin(b.end)]));
  }
  eventsOn(st, dateStr)
    .filter((e) => !e.allDay && e.start)
    .forEach((e) => blocks.push([toMin(e.start) - (e.travelTo?.minutes || 0), toMin(e.end) + (e.travelBack?.minutes || 0)]));
  blocks.sort((x, y) => x[0] - y[0]);
  const free = [];
  let cur = from;
  for (const [s, e] of blocks) {
    if (s > cur) free.push([cur, Math.min(s, to)]);
    cur = Math.max(cur, e);
    if (cur >= to) break;
  }
  if (cur < to) free.push([cur, to]);
  return free.filter(([s, e]) => e - s >= 60).map(([s, e]) => ({ start: fromMin(s), end: fromMin(e) }));
}
