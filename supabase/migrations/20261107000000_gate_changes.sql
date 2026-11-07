-- Gate change: an occasional bonus question during the Daily Flight. One result per day.
alter table public.profiles add column gate_changes jsonb not null default '{}';
grant update (gate_changes) on public.profiles to authenticated;
