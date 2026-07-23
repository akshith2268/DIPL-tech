alter table public.contacts
  add column if not exists read_at timestamptz,
  add column if not exists read_by uuid references auth.users(id) on delete set null;

create index if not exists contacts_read_at_idx
  on public.contacts (read_at, created_at desc);

comment on column public.contacts.read_at is
  'When an allowlisted administrator first opened this enquiry.';

comment on column public.contacts.read_by is
  'The allowlisted administrator who most recently marked this enquiry read.';

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin_user() from public, anon;
grant execute on function public.is_admin_user() to authenticated;

drop policy if exists "Admins can read contact enquiries" on public.contacts;
create policy "MFA admins can read contact enquiries"
on public.contacts
for select
to authenticated
using (
  public.is_admin_user()
  and coalesce((select auth.jwt()->>'aal'), '') = 'aal2'
);

drop policy if exists "Admins can update contact enquiries" on public.contacts;
create policy "MFA admins can update contact enquiries"
on public.contacts
for update
to authenticated
using (
  public.is_admin_user()
  and coalesce((select auth.jwt()->>'aal'), '') = 'aal2'
)
with check (
  public.is_admin_user()
  and coalesce((select auth.jwt()->>'aal'), '') = 'aal2'
);

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  event_id uuid not null unique,
  event_type text not null check (event_type in ('page_view', 'web_vital')),
  path text not null check (
    path like '/%'
    and char_length(path) between 1 and 200
    and position('?' in path) = 0
    and path not like '/admin%'
  ),
  page_title text check (page_title is null or char_length(page_title) <= 160),
  session_id uuid not null,
  referrer_domain text check (
    referrer_domain is null or char_length(referrer_domain) <= 180
  ),
  device_category text not null check (
    device_category in ('mobile', 'tablet', 'desktop', 'other')
  ),
  country_code text check (
    country_code is null or country_code ~ '^[A-Z]{2}$'
  ),
  navigation_ms integer check (
    navigation_ms is null or navigation_ms between 0 and 600000
  ),
  lcp_ms integer check (
    lcp_ms is null or lcp_ms between 0 and 600000
  ),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_occurred_at_idx
  on public.analytics_events (occurred_at desc);

create index if not exists analytics_events_path_occurred_at_idx
  on public.analytics_events (path, occurred_at desc);

create index if not exists analytics_events_session_occurred_at_idx
  on public.analytics_events (session_id, occurred_at desc);

alter table public.analytics_events enable row level security;

revoke all on public.analytics_events from public, anon, authenticated;
grant insert, select on public.analytics_events to service_role;
grant usage, select on sequence public.analytics_events_id_seq to service_role;

create or replace function public.admin_analytics_dashboard(
  range_key text default '7d'
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  range_start timestamptz;
  bucket_size interval;
begin
  if not public.is_admin_user()
    or coalesce((select auth.jwt()->>'aal'), '') <> 'aal2' then
    raise exception 'Administrator MFA is required.'
      using errcode = '42501';
  end if;

  range_start := case range_key
    when '1h' then now() - interval '1 hour'
    when '6h' then now() - interval '6 hours'
    when '24h' then now() - interval '24 hours'
    when '7d' then now() - interval '7 days'
    else now() - interval '7 days'
  end;

  bucket_size := case range_key
    when '1h' then interval '5 minutes'
    when '6h' then interval '30 minutes'
    when '24h' then interval '1 hour'
    else interval '1 day'
  end;

  return (
    with events as materialized (
      select *
      from public.analytics_events
      where occurred_at >= range_start
    )
    select jsonb_build_object(
      'rangeKey', case
        when range_key in ('1h', '6h', '24h', '7d') then range_key
        else '7d'
      end,
      'generatedAt', now(),
      'summary', (
        select jsonb_build_object(
          'pageViews', count(*) filter (where event_type = 'page_view'),
          'sessions', count(distinct session_id) filter (where event_type = 'page_view'),
          'blogViews', count(*) filter (
            where event_type = 'page_view' and path = '/blogs'
          ),
          'blogSessions', count(distinct session_id) filter (
            where event_type = 'page_view' and path = '/blogs'
          ),
          'medianLoadMs', (
            percentile_cont(0.5) within group (order by navigation_ms)
              filter (where event_type = 'web_vital' and navigation_ms is not null)
          )::integer,
          'p75LcpMs', (
            percentile_cont(0.75) within group (order by lcp_ms)
              filter (where event_type = 'web_vital' and lcp_ms is not null)
          )::integer
        )
        from events
      ),
      'trend', (
        select coalesce(
          jsonb_agg(
            jsonb_build_object(
              'bucket', bucket,
              'pageViews', page_views,
              'blogViews', blog_views
            )
            order by bucket
          ),
          '[]'::jsonb
        )
        from (
          select
            date_bin(
              bucket_size,
              occurred_at,
              '2000-01-01 00:00:00+00'::timestamptz
            ) as bucket,
            count(*) filter (where event_type = 'page_view') as page_views,
            count(*) filter (
              where event_type = 'page_view' and path = '/blogs'
            ) as blog_views
          from events
          group by 1
        ) trend_rows
      ),
      'topPages', (
        select coalesce(
          jsonb_agg(
            jsonb_build_object('label', path, 'value', total)
            order by total desc, path asc
          ),
          '[]'::jsonb
        )
        from (
          select path, count(*) as total
          from events
          where event_type = 'page_view'
          group by path
          order by total desc, path asc
          limit 8
        ) page_rows
      ),
      'topCountries', (
        select coalesce(
          jsonb_agg(
            jsonb_build_object('label', country_code, 'value', total)
            order by total desc, country_code asc
          ),
          '[]'::jsonb
        )
        from (
          select country_code, count(*) as total
          from events
          where event_type = 'page_view' and country_code is not null
          group by country_code
          order by total desc, country_code asc
          limit 8
        ) country_rows
      ),
      'topDevices', (
        select coalesce(
          jsonb_agg(
            jsonb_build_object('label', device_category, 'value', total)
            order by total desc, device_category asc
          ),
          '[]'::jsonb
        )
        from (
          select device_category, count(*) as total
          from events
          where event_type = 'page_view'
          group by device_category
          order by total desc, device_category asc
          limit 8
        ) device_rows
      ),
      'topReferrers', (
        select coalesce(
          jsonb_agg(
            jsonb_build_object('label', referrer, 'value', total)
            order by total desc, referrer asc
          ),
          '[]'::jsonb
        )
        from (
          select
            coalesce(nullif(referrer_domain, ''), 'Direct') as referrer,
            count(*) as total
          from events
          where event_type = 'page_view'
          group by 1
          order by total desc, referrer asc
          limit 8
        ) referrer_rows
      ),
      'blogReferrers', (
        select coalesce(
          jsonb_agg(
            jsonb_build_object('label', referrer, 'value', total)
            order by total desc, referrer asc
          ),
          '[]'::jsonb
        )
        from (
          select
            coalesce(nullif(referrer_domain, ''), 'Direct') as referrer,
            count(*) as total
          from events
          where event_type = 'page_view' and path = '/blogs'
          group by 1
          order by total desc, referrer asc
          limit 8
        ) blog_referrer_rows
      )
    )
  );
end;
$$;

revoke all on function public.admin_analytics_dashboard(text)
  from public, anon;
grant execute on function public.admin_analytics_dashboard(text)
  to authenticated;

