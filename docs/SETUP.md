# Setup: database, accounts and publishing

Everything below uses free plans. It takes about 30 minutes and you only do it once.

> **About keys and secrets.** You put two values from Supabase into GitHub secrets: the project URL and the **public** key (anon / publishable).
> Keeping them in secrets keeps them out of the repository. The app runs in the browser, though, so the public key still ends up in the published site. That is how Supabase is designed to work, and it is safe because database rules protect your data: each account only sees its own data and its partner's.
> **Never use the secret key (`service_role` / `sb_secret_…`) anywhere.** The publish workflow refuses to run if one is put into the secrets by mistake.

---

## Part 1: Supabase (database and accounts)

1. Go to **supabase.com**, click **Start your project** and sign in with GitHub.
2. Click **New project**:
   - Name: `calendar-for-you`
   - Database Password: click **Generate a password** (you won't need it, but store it in a password manager)
   - Region: choose the one closest to you
   - Data access: tick **Enable Data API** and **Enable RLS on new tables automatically**. Leave **Grant API access to new tables automatically** unticked, because `schema.sql` grants exactly the access the app needs.
   - Click **Create new project** and wait about 2 minutes.
3. **Tables and security:** open **SQL Editor** → **New query**, paste the whole contents of `supabase/schema.sql` and click **Run**. You should see "Success. No rows returned".
4. **Your own email sender (SMTP):** Supabase only lets you edit email templates after you connect your own sender, and its built-in sender only delivers to members of your Supabase organization. Any free SMTP service works. Two easy options:
   - **Gmail:** turn on 2-Step Verification for the Google account, then create an app password at myaccount.google.com/apppasswords.
     Settings: host `smtp.gmail.com`, port `465`, username = the Gmail address, password = the 16-character app password, sender email = the same Gmail address.
   - **Brevo** (free, 300 emails/day): create an account, verify a sender email address, then copy the SMTP host, port, login and SMTP key from **SMTP & API**.

   In Supabase go to **Authentication** → **Emails** → **SMTP Settings**, turn on **Enable custom SMTP**, fill in the values above, set sender name `Calendar for You`, and save.
   Under **Authentication** → **Rate Limits** you can raise the email limit (the default of a few per hour is enough for two people).
5. **Sign-in with an email code:** go to **Authentication** → **Emails** → **Templates**.
   - Open the **Magic Link** template, switch to **Source** and replace its body with:
     ```html
     <h2>Calendar for You</h2>
     <p>Your sign-in code / Twój kod logowania: <strong style="font-size:24px">{{ .Token }}</strong></p>
     <p>The code is valid for one hour.</p>
     ```
   - Paste the same into the **Confirm signup** template, because that one is sent on the very first sign-in.
   - Save both.
6. **App address:** go to **Authentication** → **URL Configuration** and set **Site URL** to the address from Part 2, step 5.
7. **Values to copy:** go to **Project Settings** → **API Keys**. You need:
   - the **Project URL** (looks like `https://<project-id>.supabase.co`; it is also shown under **Data API**);
   - the **anon public** or **publishable** key (starts with `eyJ…` or `sb_publishable_…`).

## Part 2: GitHub (code and publishing)

1. On **github.com** click **+** → **New repository**:
   - Repository name: `calendar-for-you`
   - **Public** (free GitHub Pages needs a public repository; your data is not in the code)
   - Click **Create repository**.
2. **Secrets:** in the repository go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret** and add:
   - `SUPABASE_URL`: the Project URL from Part 1, step 7;
   - `SUPABASE_ANON_KEY`: the anon / publishable key from Part 1, step 7.
3. **Pages:** go to **Settings** → **Pages** and set **Source** to **GitHub Actions**.
4. **Push the code** to the `main` branch of the repository.
5. After about 2 minutes the app is live at `https://<your-github-username>.github.io/calendar-for-you/`.
   You can follow progress in the repository's **Actions** tab. A green check means it's done.

## Part 3: Phones

1. Open the app address: **Safari** on iPhone, **Chrome** on Android.
2. Add the app to the home screen:
   - iPhone: **Share** → **Add to Home Screen**;
   - Android: menu **⋮** → **Install app** (or **Add to Home screen**).
3. Open the app from its icon, enter your email, then the code from the email, then your name.
4. One person opens **Settings** → **Partner** → **Create a code for your partner**. The other person enters that code in the same place on their phone.

Done. Each person has their own account, and both of you see the shared events.

---

### Troubleshooting

- **The code doesn't arrive:** check the spam folder. Check the SMTP settings (Part 1, step 4). Wait a moment, because the hourly email limit applies.
- **The publish run in Actions is red:** open it and read the message. Usually a secret is missing or the wrong key was used.
- **A phone shows an old version:** fully close the app and open it again.
