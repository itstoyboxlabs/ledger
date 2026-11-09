-- Visit counts by site, day, country and state. Run once in the Supabase SQL editor.
-- A fork only needs the record_visit function; the site name is fixed to 'ledger'.
create table if not exists site_visits (
  site text not null,
  day date not null,
  country text not null,
  region text not null default '',
  hits integer not null default 0,
  primary key (site, day, country, region)
);

alter table site_visits enable row level security;

create or replace function record_site_visit(p_site text, p_country text, p_region text)
returns void
language sql
security definer
as $$
  insert into site_visits (site, day, country, region, hits)
  values (p_site, current_date, p_country, p_region, 1)
  on conflict (site, day, country, region) do update set hits = site_visits.hits + 1;
$$;

revoke all on function record_site_visit(text, text, text) from public, anon, authenticated;
grant execute on function record_site_visit(text, text, text) to service_role;

create or replace function record_visit(p_country text, p_region text)
returns void
language sql
security definer
as $$
  select record_site_visit('ledger', p_country, p_region);
$$;

revoke all on function record_visit(text, text) from public, anon, authenticated;
grant execute on function record_visit(text, text) to service_role;
