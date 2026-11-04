-- Night Flight: a weekly all-stratosphere challenge for Flight Club. One score per ISO week.
alter table public.profiles add column night_flights jsonb not null default '{}';
grant update (night_flights) on public.profiles to authenticated;
