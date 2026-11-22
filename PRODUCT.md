# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JavaScript (ES modules, no build step), installable PWA, hosted on GitHub Pages. Backend: Supabase free tier (database, email one-time-code sign-in, row-level security; later edge functions and cron for push notifications). Work-calendar integration is planned through a Google Apps Script bridge installed in each work Google Workspace account. Running costs must stay at zero or close to it, and the project must stay maintainable without a build toolchain.

## Users

Two partners in a relationship, each with their own phone (iOS or Android) and their own account. They may work for different employers and may each have several work calendars in Google Workspace. They plan their private and shared life on their phones, usually on the go.

## Product Purpose

One private calendar for two people that sits beside their work calendars without leaking work details:
- private events, plus yearly reminders for birthdays and anniversaries;
- shared events (dates, workouts) that both can see and edit;
- seeing when the partner is busy at work (as "Busy" only, never titles);
- for events the user marks, automatically placing "Out of office" in a chosen work calendar, widened by the manually entered travel time there and back and trimmed to that calendar's working hours;
- travel time and mode entered manually per event.

Success: the couple can answer "when are we both free?" and "is my work calendar blocked for this appointment?" without opening any other app.

## Positioning

A couples' calendar that understands both people also have jobs. It bridges private life and several work calendars in both directions (busy in, out-of-office out) while keeping work content private.

## Operating Context

Used on phones, one-handed, in short sessions. Work-calendar data will flow through an Apps Script bridge every 10–15 minutes. The UI is available in English and Polish.

## Capabilities and Constraints

- Each person has their own account. Couples are linked with an invite code, and a couple has at most two people.
- Per-event partner visibility, defaulting from the owner's settings (details / only busy / hidden), enforced in the database.
- Out of office is added only for events the user marks. Working hours and days are configurable per work calendar.
- Extra notification settings are wanted, but they are lower priority.
- No import of existing data and no sync to the phone's native calendar.
- Out of scope: automatic travel time from maps, public sharing.

## Evidence on Hand

None yet. Demo data is synthetic.

## Product Principles

1. Work content never leaves work: partners see busy blocks only.
2. Nothing writes to a work calendar unless the user explicitly marked the event.
3. Free to run; every paid dependency is optional.
4. Simple enough to maintain without a build step.

## Accessibility & Inclusion

Mobile touch targets, readable contrast in bright outdoor light, full English and Polish copy.
