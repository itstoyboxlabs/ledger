-- Usage events: which screen or tool was used, by a random id. Run once in the Supabase SQL editor, after visits.sql.
-- Stores no amounts, merchants, names, notes or dates of birth. Only the event key, the route, a random user id
-- (kept in the browser), a random session id (one per page load), the country and state from the request header and,
-- for a crash, a short scrubbed message. See api/usage.js for what the server accepts.
-- Retention: rows older than 90 days are not needed. Run `select prune_usage_events();` now and then, or schedule it
-- with pg_cron (select cron.schedule('prune-usage', '17 3 * * *', 'select prune_usage_events()');).
create table if not exists usage_events (
  id bigint generated always as identity primary key,
  day date not null default current_date,
  ts timestamptz not null default now(),
  user_id uuid not null,
  session_id uuid not null,
  event text not null,
  route text not null,
  country text not null default '',
  region text not null default '',
  error text
);

create index if not exists usage_events_day_event_idx on usage_events (day, event);
create index if not exists usage_events_day_user_idx on usage_events (day, user_id);

alter table usage_events enable row level security;

-- p_events: [{ "event": "...", "route": "/app/spending", "error": null }, ...]. The function checks the shapes
-- again, so a bad row is skipped rather than stored. Up to 25 rows per call.
create or replace function record_usage(p_user uuid, p_session uuid, p_country text, p_region text, p_events jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  insert into usage_events (user_id, session_id, event, route, country, region, error)
  select p_user, p_session, e.event, e.route, left(coalesce(p_country, ''), 2), left(coalesce(p_region, ''), 3), left(e.error, 300)
  from jsonb_to_recordset(case when jsonb_typeof(p_events) = 'array' then p_events else '[]'::jsonb end)
    as e(event text, route text, error text)
  where e.event ~ '^[a-z0-9_]{1,40}$' and e.route ~ '^/[a-z0-9/_-]{0,60}$'
  limit 25;
$$;

create or replace function prune_usage_events()
returns void
language sql
security definer
set search_path = public
as $$
  delete from usage_events where day < current_date - 90;
$$;

-- Reads for the dashboard. p_days is how far back to look, counted in days including today.
create or replace function usage_by_day(p_days int default 30)
returns table (day date, users bigint, sessions bigint, events bigint)
language sql
security definer
set search_path = public
as $$
  select e.day, count(distinct e.user_id), count(distinct e.session_id), count(*)
  from usage_events e
  where e.day > current_date - greatest(least(p_days, 90), 1)
  group by e.day
  order by e.day;
$$;

create or replace function usage_by_event(p_days int default 30)
returns table (event text, hits bigint, users bigint)
language sql
security definer
set search_path = public
as $$
  select e.event, count(*), count(distinct e.user_id)
  from usage_events e
  where e.day > current_date - greatest(least(p_days, 90), 1)
  group by e.event
  order by count(*) desc;
$$;

create or replace function usage_events_by_day(p_days int default 30)
returns table (day date, event text, hits bigint)
language sql
security definer
set search_path = public
as $$
  select e.day, e.event, count(*)
  from usage_events e
  where e.day > current_date - greatest(least(p_days, 90), 1)
  group by e.day, e.event
  order by e.day, count(*) desc;
$$;

create or replace function usage_top_routes(p_days int default 30)
returns table (route text, hits bigint, users bigint)
language sql
security definer
set search_path = public
as $$
  select e.route, count(*), count(distinct e.user_id)
  from usage_events e
  where e.day > current_date - greatest(least(p_days, 90), 1)
  group by e.route
  order by count(*) desc
  limit 20;
$$;

create or replace function usage_recent_errors(p_limit int default 25)
returns table (ts timestamptz, route text, error text, country text, region text)
language sql
security definer
set search_path = public
as $$
  select e.ts, e.route, e.error, e.country, e.region
  from usage_events e
  where e.error is not null
  order by e.ts desc
  limit greatest(least(p_limit, 100), 1);
$$;

do $$
declare f text;
begin
  foreach f in array array[
    'record_usage(uuid, uuid, text, text, jsonb)',
    'prune_usage_events()',
    'usage_by_day(int)',
    'usage_by_event(int)',
    'usage_events_by_day(int)',
    'usage_top_routes(int)',
    'usage_recent_errors(int)'
  ] loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;
