# Supabase contact inbox setup

The website uses the `contacts` table for public contact-form inserts and the
`/admin` page for allowlisted, MFA-verified reads.

1. Open the Supabase SQL editor for project `ovqxuakoekllsxzvnmvx`.
2. Run `migrations/202607150001_create_contacts.sql`.
3. In Supabase Authentication, create the admin email/password user.
4. Add that user to the allowlist from the SQL editor:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'your-admin@example.com'
on conflict (user_id) do nothing;
```

5. Copy `.env.example` to `.env.local` and replace `VITE_SUPABASE_ANON_KEY` with the project's public anon key.
6. Restart the Vite development server after changing environment variables.

The first migration allows anonymous inserts but prevents anonymous reads.
Admin 2.0 adds mandatory TOTP MFA and analytics as described below.

## Admin 2.0

1. Run `migrations/202607240001_admin_2_0.sql` after the contact migrations.
2. Keep each administrator in both Supabase Authentication and
   `public.admin_users`.
3. The administrator signs in at `/admin` and enrols an authenticator app on
   first login. Contacts and analytics require both allowlist membership and an
   `aal2` session.
4. Deploy first-party production analytics:

```powershell
npx supabase functions deploy track-analytics --use-api
```

The function uses the automatically provided `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY`. Those values must never be added to Vite
environment variables.

See `ADMIN-HANDOVER.md` for administrator onboarding, removal, authenticator
reset, and deployment steps.

## Resend contact email automation

The `contact-email` Edge Function sends an internal inbox notification and an acknowledgement to the visitor. It reads the stored contact row server-side, so neither the Resend key nor the Supabase service-role key enters the browser.

1. Run `migrations/202607170001_add_contact_email_delivery.sql` in the Supabase SQL editor.
2. Verify `drithinfra.in` in Resend and create a Resend API key.
3. In Supabase Dashboard, open **Edge Functions -> Secrets** and add:

```text
RESEND_API_KEY=re_your_key
RESEND_FROM_EMAIL=Drith Infra <contact@drithinfra.in>
CONTACT_NOTIFICATION_TO=drithinfra.pvt@gmail.com
```

4. Deploy the function from the project root:

```powershell
npx supabase login
npx supabase link --project-ref ovqxuakoekllsxzvnmvx
npx supabase functions deploy contact-email --use-api
```

5. Rebuild and redeploy the Hostinger frontend after the function is live:

```powershell
npm run build
```

For local function testing, copy `supabase/functions/.env.example` to a git-ignored environment file and use `supabase functions serve --env-file <path>`.
