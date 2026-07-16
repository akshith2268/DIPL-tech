alter table public.contacts
  add column if not exists notification_email_sent_at timestamptz,
  add column if not exists acknowledgement_email_sent_at timestamptz,
  add column if not exists email_delivery_error text;

comment on column public.contacts.notification_email_sent_at is
  'When Resend accepted the internal contact notification.';

comment on column public.contacts.acknowledgement_email_sent_at is
  'When Resend accepted the visitor acknowledgement.';

comment on column public.contacts.email_delivery_error is
  'Most recent server-side email delivery error, cleared after full success.';
