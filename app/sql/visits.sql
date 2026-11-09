-- Visit counts by day, country and state. Run once in the Supabase SQL editor.
create table if not exists ledger_visits (
  day date not null,
  country text not null,
  region text not null default '',
  hits integer not null default 0,
  primary key (day, country, region)
);

alter table ledger_visits enable row level security;

create or replace function record_visit(p_country text, p_region text)
returns void
language sql
security definer
as $$
  insert into ledger_visits (day, country, region, hits)
  values (current_date, p_country, p_region, 1)
  on conflict (day, country, region) do update set hits = ledger_visits.hits + 1;
$$;

revoke all on function record_visit(text, text) from public, anon, authenticated;
grant execute on function record_visit(text, text) to service_role;
