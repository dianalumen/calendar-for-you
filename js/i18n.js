// Translations (English and Polish) and locale-aware date formatting.

const LANG_KEY = 'cfy-lang';
export const LANGUAGES = { en: 'English', pl: 'Polski' };

const en = {
  appName: 'Calendar for You',
  loading: 'Loading…',

  'tab.nav': 'Main navigation',
  'tab.calendar': 'Calendar',
  'tab.add': 'Add',
  'tab.settings': 'Settings',

  'login.intro': 'Sign in with your email and password.',
  'login.emailLabel': 'Email',
  'login.emailPlaceholder': 'you@example.com',
  'login.passwordLabel': 'Password',
  'login.signIn': 'Sign in',
  'login.checking': 'Signing in…',
  'login.noAccount': 'Accounts are created by the app owner in Supabase.',

  'name.title': 'What’s your name?',
  'name.hint': 'Your partner will see this name next to your events.',
  'name.label': 'Name',
  'name.next': 'Continue',

  'cal.today': 'Today',
  'cal.prevMonth': 'Previous month',
  'cal.nextMonth': 'Next month',
  'cal.month': 'Month',
  'cal.shared': 'Shared',
  'cal.occasions': 'Birthdays & anniversaries',
  'cal.eventsCount': '{n} events',

  'agenda.label': 'Day plan',
  'agenda.add': 'Add',
  'agenda.freeTogether': 'Both free: {ranges}',
  'agenda.noFree': 'No free time together (min. 1 h)',
  'agenda.empty': 'Nothing planned.',
  'agenda.addEvent': 'Add event',

  'busy.mine': 'Work meeting',
  'busy.partner': '{name} — busy',
  'busy.workCalendar': 'work calendar',
  'busy.work': 'Work',
  'busy.private': 'private',
  'event.allDay': 'all day',
  'event.sharedTag': 'shared',
  'event.yearly': ' · every year',
  'travel.to': '{min} min there ({mode})',
  'travel.back': '{min} min back',

  'settings.title': 'Settings',
  'settings.demoBanner': 'Demo mode with sample data. Once published, each of you signs in with your own account.',
  'settings.account': 'My account',
  'settings.name': 'Name',
  'settings.email': 'Email',
  'settings.logout': 'Sign out',
  'settings.partner': 'Partner',
  'settings.connectedWith': 'Connected with',
  'settings.shareCode': 'Give your partner this code:',
  'settings.shareHint': 'Your partner signs in to their own account, opens Settings → Partner and enters the code.',
  'settings.createCode': 'Create a code for your partner',
  'settings.haveCode': 'I have a code from my partner',
  'settings.connect': 'Connect',
  'settings.privacy': 'Privacy',
  'settings.partnerSees': 'Partner sees',
  'settings.privacyNote': 'Default for your private events — you can change it on each event. Your partner always sees work meetings only as “Busy”.',
  'settings.notifications': 'Notifications',
  'settings.defaultReminder': 'Default reminder',
  'settings.occasionReminder': 'Birthdays & anniversaries',
  'settings.partnerAdds': 'When my partner adds a shared event',
  'settings.notificationsNote': 'Phone notifications will start working once the server part is connected.',
  'settings.workCalendars': 'My work calendars',
  'settings.addWorkCalendar': 'Add work calendar',
  'settings.workCalendarsNote': 'Working hours define when Out of office can be added. The Google Calendar connection (meetings as “Busy” and adding OOO) comes in the next step.',
  'settings.partnerWorkCalendars': 'Work calendars: {name}',
  'settings.resetDemo': 'Restore sample data',
  'settings.language': 'Language',

  'days.weekdays': 'Mon–Fri',
  'days.none': 'no days',
  'days.short': ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  'days.abbr': { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 0: 'Sun' },

  'workCal.nameLabel': 'Calendar name',
  'workCal.days': 'Working days',
  'workCal.from': 'From',
  'workCal.to': 'To',
  'workCal.delete': 'Delete calendar',
  'workCal.newName': 'New work calendar',

  'editor.cancel': 'Cancel',
  'editor.save': 'Save',
  'editor.saving': 'Saving…',
  'editor.viewTitle': '{name}’s event',
  'editor.edit': 'Edit',
  'editor.new': 'New event',
  'editor.titlePlaceholder': 'Title',
  'editor.type': 'Type',
  'editor.whose': 'Whose',
  'editor.mine': 'Mine',
  'editor.shared': 'Shared',
  'editor.allDay': 'All day',
  'editor.date': 'Date',
  'editor.start': 'Starts',
  'editor.end': 'Ends',
  'editor.yearly': 'Repeat every year',
  'editor.location': 'Location',
  'editor.travel': 'Travel',
  'editor.travelTo': 'There (min)',
  'editor.travelToMode': 'How you get there',
  'editor.travelBack': 'Back (min)',
  'editor.travelBackMode': 'How you get back',
  'editor.ooo': 'Out of office at work',
  'editor.oooWill': 'Will be added: {range}',
  'editor.oooOutside': 'Outside working hours — nothing will be added',
  'editor.oooNote': 'OOO window = start minus travel there, end plus travel back, trimmed to working hours.',
  'editor.partnerSees': 'Partner sees',
  'editor.visibilityDefault': 'Default: {value}',
  'editor.reminder': 'Reminder',
  'editor.notes': 'Notes',
  'editor.delete': 'Delete event',
  'editor.readOnlyNote': 'This is {name}’s private event. Only its author can edit it.',
  'editor.confirmDelete': 'Delete “{title}”?',
  'editor.untitled': 'event',
  'editor.endAfterStart': 'The end must be later than the start.',

  'confirm.resetDemo': 'Discard all changes and load the sample data?',
  'confirm.logout': 'Sign out on this device?',
  'confirm.deleteWorkCalendar': 'Remove this work calendar from the app?',
  'alert.connected': 'Connected with your partner.',

  'error.loadTitle': 'Couldn’t load the app',
  'error.retry': 'Try again',
  'error.badLogin': 'Wrong email or password.',
  'error.notConfirmed': 'This account is not confirmed yet. Tick “Auto Confirm User” when creating it in Supabase.',
  'error.rateLimit': 'Too many attempts. Wait a minute and try again.',
  'error.offline': 'No internet connection.',
  'error.invalidInvite': 'That invite code is not valid.',
  'error.alreadyPaired': 'Your account is already connected to a partner.',
  'error.coupleFull': 'This couple already has two people.',
  'error.generic': 'Something went wrong: {message}',

  'user.noName': 'No name',
  'user.partner': 'Partner',
  'user.you': 'You',

  travelModes: { car: 'Car', transit: 'Public transport', bike: 'Bike', walk: 'Walk', taxi: 'Taxi' },
  visibility: { full: 'Details', busy: 'Only “Busy”', hidden: 'Nothing (hidden)' },
  eventTypes: { event: 'Event', birthday: 'Birthday', anniversary: 'Anniversary' },
  reminders: { 0: 'None', 10: '10 min before', 30: '30 min before', 60: '1 hour before', 120: '2 hours before', 1440: '1 day before' },
  occasionReminders: { 0: 'On the day', 1: '1 day before', 3: '3 days before', 7: '1 week before' },

  'demo.workA': 'Work — company A',
  'demo.workProject': 'Work — project',
  'demo.workB': 'Work — company B',
  'demo.workShifts': 'Work — on call',
  'demo.dentist': 'Dentist',
  'demo.dentistPlace': '5 Long Street',
  'demo.workout': 'Workout',
  'demo.gym': 'Gym',
  'demo.date': 'Date night — cinema',
  'demo.cinema': 'City Cinema',
  'demo.hairdresser': 'Hairdresser',
  'demo.momBirthday': 'Mum’s birthday',
  'demo.anniversary': 'Our anniversary',
};

const pl = {
  appName: 'Calendar for You',
  loading: 'Wczytuję…',

  'tab.nav': 'Główna nawigacja',
  'tab.calendar': 'Kalendarz',
  'tab.add': 'Dodaj',
  'tab.settings': 'Ustawienia',

  'login.intro': 'Zaloguj się e-mailem i hasłem.',
  'login.emailLabel': 'E-mail',
  'login.emailPlaceholder': 'twoj@email.pl',
  'login.passwordLabel': 'Hasło',
  'login.signIn': 'Zaloguj',
  'login.checking': 'Loguję…',
  'login.noAccount': 'Konta zakłada właściciel aplikacji w Supabase.',

  'name.title': 'Jak masz na imię?',
  'name.hint': 'Partner będzie widzieć to imię przy Twoich wydarzeniach.',
  'name.label': 'Imię',
  'name.next': 'Dalej',

  'cal.today': 'Dziś',
  'cal.prevMonth': 'Poprzedni miesiąc',
  'cal.nextMonth': 'Następny miesiąc',
  'cal.month': 'Miesiąc',
  'cal.shared': 'Wspólne',
  'cal.occasions': 'Urodziny i rocznice',
  'cal.eventsCount': '{n} wydarz.',

  'agenda.label': 'Plan dnia',
  'agenda.add': 'Dodaj',
  'agenda.freeTogether': 'Wspólnie wolni: {ranges}',
  'agenda.noFree': 'Brak wspólnego wolnego czasu (min. 1 godz.)',
  'agenda.empty': 'Nic nie zaplanowano.',
  'agenda.addEvent': 'Dodaj wydarzenie',

  'busy.mine': 'Spotkanie w pracy',
  'busy.partner': '{name} — zajęty',
  'busy.workCalendar': 'kalendarz pracowy',
  'busy.work': 'Praca',
  'busy.private': 'prywatne',
  'event.allDay': 'cały dzień',
  'event.sharedTag': 'wspólne',
  'event.yearly': ' · co roku',
  'travel.to': '{min} min tam ({mode})',
  'travel.back': '{min} min powrót',

  'settings.title': 'Ustawienia',
  'settings.demoBanner': 'Tryb próbny z przykładowymi danymi. Po publikacji każde z Was zaloguje się na swoje konto.',
  'settings.account': 'Moje konto',
  'settings.name': 'Imię',
  'settings.email': 'E-mail',
  'settings.logout': 'Wyloguj',
  'settings.partner': 'Partner',
  'settings.connectedWith': 'Połączono z',
  'settings.shareCode': 'Przekaż partnerowi ten kod:',
  'settings.shareHint': 'Partner loguje się na swoje konto, wchodzi w Ustawienia → Partner i wpisuje kod.',
  'settings.createCode': 'Utwórz kod dla partnera',
  'settings.haveCode': 'Mam kod od partnera',
  'settings.connect': 'Połącz',
  'settings.privacy': 'Prywatność',
  'settings.partnerSees': 'Partner widzi',
  'settings.privacyNote': 'Domyślne ustawienie dla prywatnych wydarzeń. Przy każdym wydarzeniu możesz je zmienić. Spotkania z pracy partner zawsze widzi tylko jako „Zajęty”.',
  'settings.notifications': 'Powiadomienia',
  'settings.defaultReminder': 'Domyślne przypomnienie',
  'settings.occasionReminder': 'Urodziny i rocznice',
  'settings.partnerAdds': 'Gdy partner doda wspólne wydarzenie',
  'settings.notificationsNote': 'Powiadomienia na telefon zaczną działać po podłączeniu serwera.',
  'settings.workCalendars': 'Moje kalendarze pracowe',
  'settings.addWorkCalendar': 'Dodaj kalendarz pracowy',
  'settings.workCalendarsNote': 'Godziny pracy decydują, w jakim zakresie wstawiamy Out of office. Połączenie z Google Calendar (spotkania jako „Zajęty” i wstawianie OOO) dojdzie w kolejnym kroku.',
  'settings.partnerWorkCalendars': 'Kalendarze pracowe: {name}',
  'settings.resetDemo': 'Przywróć dane przykładowe',
  'settings.language': 'Język',

  'days.weekdays': 'pon–pt',
  'days.none': 'brak dni',
  'days.short': ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'],
  'days.abbr': { 1: 'pn', 2: 'wt', 3: 'śr', 4: 'cz', 5: 'pt', 6: 'so', 0: 'nd' },

  'workCal.nameLabel': 'Nazwa kalendarza',
  'workCal.days': 'Dni pracy',
  'workCal.from': 'Od',
  'workCal.to': 'Do',
  'workCal.delete': 'Usuń kalendarz',
  'workCal.newName': 'Nowy kalendarz pracowy',

  'editor.cancel': 'Anuluj',
  'editor.save': 'Zapisz',
  'editor.saving': 'Zapisuję…',
  'editor.viewTitle': 'Wydarzenie: {name}',
  'editor.edit': 'Edytuj',
  'editor.new': 'Nowe wydarzenie',
  'editor.titlePlaceholder': 'Tytuł',
  'editor.type': 'Rodzaj',
  'editor.whose': 'Czyje',
  'editor.mine': 'Moje',
  'editor.shared': 'Wspólne',
  'editor.allDay': 'Cały dzień',
  'editor.date': 'Data',
  'editor.start': 'Początek',
  'editor.end': 'Koniec',
  'editor.yearly': 'Powtarzaj co roku',
  'editor.location': 'Miejsce',
  'editor.travel': 'Dojazd',
  'editor.travelTo': 'Tam (min)',
  'editor.travelToMode': 'Sposób dojazdu tam',
  'editor.travelBack': 'Powrót (min)',
  'editor.travelBackMode': 'Sposób powrotu',
  'editor.ooo': 'Out of office w pracy',
  'editor.oooWill': 'Zostanie wstawione: {range}',
  'editor.oooOutside': 'Poza godzinami pracy, nic nie zostanie wstawione',
  'editor.oooNote': 'Okno OOO = początek minus dojazd tam, koniec plus powrót, przycięte do godzin pracy.',
  'editor.partnerSees': 'Partner widzi',
  'editor.visibilityDefault': 'Domyślnie: {value}',
  'editor.reminder': 'Przypomnienie',
  'editor.notes': 'Notatka',
  'editor.delete': 'Usuń wydarzenie',
  'editor.readOnlyNote': 'To prywatne wydarzenie: {name}. Edytować może tylko autor.',
  'editor.confirmDelete': 'Usunąć „{title}”?',
  'editor.untitled': 'wydarzenie',
  'editor.endAfterStart': 'Koniec musi być później niż początek.',

  'confirm.resetDemo': 'Usunąć wszystkie zmiany i wczytać dane przykładowe?',
  'confirm.logout': 'Wylogować się z tego telefonu?',
  'confirm.deleteWorkCalendar': 'Usunąć ten kalendarz pracowy z aplikacji?',
  'alert.connected': 'Połączono z partnerem.',

  'error.loadTitle': 'Nie udało się wczytać',
  'error.retry': 'Spróbuj ponownie',
  'error.badLogin': 'Nieprawidłowy e-mail lub hasło.',
  'error.notConfirmed': 'To konto nie jest jeszcze potwierdzone. Przy zakładaniu w Supabase zaznacz „Auto Confirm User”.',
  'error.rateLimit': 'Za dużo prób. Odczekaj minutę i spróbuj ponownie.',
  'error.offline': 'Brak połączenia z internetem.',
  'error.invalidInvite': 'Nieprawidłowy kod zaproszenia.',
  'error.alreadyPaired': 'Twoje konto jest już połączone z partnerem.',
  'error.coupleFull': 'Ta para ma już dwie osoby.',
  'error.generic': 'Coś poszło nie tak: {message}',

  'user.noName': 'Bez imienia',
  'user.partner': 'Partner',
  'user.you': 'Ty',

  travelModes: { car: 'Samochód', transit: 'Komunikacja', bike: 'Rower', walk: 'Pieszo', taxi: 'Taxi' },
  visibility: { full: 'Szczegóły', busy: 'Tylko „Zajęty”', hidden: 'Nic (ukryte)' },
  eventTypes: { event: 'Wydarzenie', birthday: 'Urodziny', anniversary: 'Rocznica' },
  reminders: { 0: 'Brak', 10: '10 min przed', 30: '30 min przed', 60: '1 godz. przed', 120: '2 godz. przed', 1440: '1 dzień przed' },
  occasionReminders: { 0: 'W dniu', 1: '1 dzień przed', 3: '3 dni przed', 7: 'Tydzień przed' },

  'demo.workA': 'Praca — firma A',
  'demo.workProject': 'Praca — projekt',
  'demo.workB': 'Praca — firma B',
  'demo.workShifts': 'Praca — dyżury',
  'demo.dentist': 'Dentysta',
  'demo.dentistPlace': 'ul. Długa 5',
  'demo.workout': 'Trening',
  'demo.gym': 'Siłownia',
  'demo.date': 'Randka — kino',
  'demo.cinema': 'Kino Muranów',
  'demo.hairdresser': 'Fryzjer',
  'demo.momBirthday': 'Urodziny mamy',
  'demo.anniversary': 'Nasza rocznica',
};

const DICTS = { en, pl };

function detect() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && DICTS[saved]) return saved;
  } catch { /* storage unavailable */ }
  return (navigator.language || 'en').toLowerCase().startsWith('pl') ? 'pl' : 'en';
}

let lang = detect();
document.documentElement.lang = lang;

export const getLang = () => lang;

export function setLang(next) {
  if (!DICTS[next]) return;
  lang = next;
  document.documentElement.lang = lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* storage unavailable */ }
}

/** Translate a key; `{name}` placeholders are replaced from `vars`. */
export function t(key, vars) {
  const value = DICTS[lang][key] ?? en[key] ?? key;
  if (typeof value !== 'string' || !vars) return value;
  return value.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
}

// ---------- dates ----------
const fmt = (opts) => new Intl.DateTimeFormat(lang === 'pl' ? 'pl-PL' : 'en-GB', opts);

/** "November" / "listopad" */
export const monthName = (d) => fmt({ month: 'long' }).format(d);
/** "Monday, 23 November" / "poniedziałek, 23 listopada" */
export const dayHeading = (d) => fmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(d);
/** "23 November" / "23 listopada" */
export const dayLabel = (d) => fmt({ day: 'numeric', month: 'long' }).format(d);
/** "Monday" / "poniedziałek" — `weekday` is 0 (Sunday) … 6 (Saturday) */
export const weekdayName = (weekday) => fmt({ weekday: 'long' }).format(new Date(2024, 0, 7 + weekday));
