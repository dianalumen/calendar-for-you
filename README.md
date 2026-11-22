# Calendar for You

A phone calendar for two people. It has private and shared events, yearly birthdays and anniversaries, a "busy" view of each other's work meetings, travel times, and automatic out-of-office blocks. The interface is available in English and Polish.

## Features

- **Separate accounts:** sign in with email and password (the owner creates both accounts in Supabase; there is no public sign-up), then connect with your partner using an invite code.
- **Month view** with a day agenda that shows when you are both free.
- **Private and shared events**, plus birthdays and anniversaries that repeat every year.
- **Travel time** there and back (minutes and mode of transport), entered by hand.
- **Out-of-office toggle** per event and work calendar. The window is start minus travel there to end plus travel back, trimmed to that calendar's working hours. Days off are skipped.
- **Partner visibility** per event (details / only "Busy" / hidden), enforced by the database.
- **Settings:** language, working days and hours for each work calendar, reminder defaults.
- **Installable PWA** that works offline.

Without a `js/config.js` file (for example, when running locally) the app starts in **demo mode** with sample data stored in the browser.
When the app is published, the workflow generates `js/config.js` from the GitHub secrets `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

**First-time setup:** see [docs/SETUP.md](docs/SETUP.md).

## Roadmap

1. **Google work calendars:** an Apps Script bridge that sends meeting times as "Busy" and writes out-of-office events back.
2. **Push notifications.**

## Running locally

Serve the folder with any static file server, for example:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. ES modules don't load from `file://`.

## Project structure

- `index.html`: app shell
- `css/app.css`: styles (light and dark)
- `js/app.js`: screens and interaction
- `js/i18n.js`: English and Polish translations, date formatting
- `js/model.js`: calendar logic (out-of-office window, free time together) and sample data
- `js/store.js`: storage and sign-in (Supabase, or browser storage in demo mode)
- `supabase/schema.sql`: database tables and row-level security
- `.github/workflows/deploy.yml`: publishes to GitHub Pages using repository secrets
- `sw.js`, `manifest.webmanifest`, `icons/`: offline support and home-screen install
- `PRODUCT.md`: product notes
