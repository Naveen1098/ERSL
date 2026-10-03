# Setup: login, workplan, Box folders, reminders

## 1. Create the free Supabase project (one time)
1. Go to https://supabase.com -> sign in with GitHub -> **New project** (any name, pick a database password, region US East).
2. **SQL Editor -> New query**: paste all of `supabase/schema.sql` -> **Run**.
3. **Project Settings -> API**: copy the **Project URL** and the **anon public** key.
4. **Authentication -> Providers -> Email**: keep enabled. (Optional: turn off "Confirm email" if you do not want members to confirm their address.)
5. **Authentication -> URL Configuration**: set *Site URL* to `https://naveen1098.github.io/ERSL/`.

## 2. Give the website the keys
In GitHub: repo **Settings -> Secrets and variables -> Actions -> Variables tab -> New repository variable**:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | https://qulkwrhajibaddvgjaht.supabase.co |
| `VITE_SUPABASE_ANON_KEY` | sb_publishable_AVEbmVPu3rFKrpD7IFVc2Q_Cn4tWdc6 |
| `SCHOLAR_ID` | the `user=` GN_fGecAAAAJ |

For local testing copy `.env.example` to `.env` and fill the same two values.

## 3. Become the admin
1. Open the site -> **Member Login -> Request access** with your email.
2. In Supabase SQL Editor run:
   `update public.profiles set role = 'admin' where email = 'YOUR_EMAIL';`
3. Log in again. Control Panel (Admin) now shows **Members & Access Requests**: approve each student/postdoc there.

## 4. Box folders
In Box: open the folder -> **Share -> Create shared link -> copy**. On the site: **Box Workspace -> Add folder**, paste the link, choose Members only / Public.
Note: if the link is restricted to "people in UA", the folder only opens for people signed in to UA Box.

## 5. Email reminders for work-plan due dates
Repo **Settings -> Secrets and variables -> Actions**:
- Secrets: `SUPABASE_SERVICE_ROLE_KEY` (Supabase -> Project Settings -> API -> service_role; never share it), `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
  (e.g. Gmail: `smtp.gmail.com`, `587`, your address, and an *App password*).
- Variables: `ADMIN_EMAIL` (gets a daily team digest), `SITE_URL`.

The workflow `Task reminders` runs every day, emails each member whose tasks are overdue or due in 2 days, and sends the admin a digest.
