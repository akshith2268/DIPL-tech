# Drith Infra administrator handover

The `/admin` dashboard is invite-only. A valid Supabase Auth account is not
enough on its own: the user must also appear in `public.admin_users` and must
complete authenticator-app MFA.

## Add an administrator

1. Open the Supabase project and go to **Authentication → Users**.
2. Invite the administrator by their company email, or create the user and
   provide a temporary password through a secure channel.
3. In **SQL Editor**, allowlist that exact user:

   ```sql
   insert into public.admin_users (user_id)
   select id
   from auth.users
   where lower(email) = lower('person@company.com')
   on conflict (user_id) do nothing;
   ```

4. Ask the administrator to visit `https://drithinfra.in/admin`, sign in, and
   scan the displayed QR code with an authenticator app.
5. They must enter the six-digit code before dashboard data becomes available.

## Remove an administrator

Remove access immediately:

```sql
delete from public.admin_users
where user_id = (
  select id from auth.users
  where lower(email) = lower('person@company.com')
);
```

The database policies check the allowlist on every protected request, so an
existing access token cannot continue reading admin data after this row is
removed. Then delete or reset the user from **Authentication → Users** if the
account is no longer needed.

## Reset a lost authenticator

Verify the person's identity outside the website. From Supabase Authentication,
remove the user's old MFA factor or reset the Auth user according to the current
Supabase recovery procedure. On their next login, the dashboard will require a
new TOTP enrolment before showing any private data.

## Deploy Admin 2.0

1. Run `supabase/migrations/202607240001_admin_2_0.sql` in Supabase SQL Editor.
2. Deploy the analytics function:

   ```powershell
   npx supabase functions deploy track-analytics --use-api
   ```

3. Confirm the function has access to the automatically provided
   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` secrets.
4. Build the frontend with `npm run build`.
5. Upload the contents of `dist` to Hostinger.

Never place the service-role key, administrator passwords, TOTP secrets, or
recovery codes in frontend environment variables or source control.
