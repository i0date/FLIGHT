-- How often each Daily Flight question is answered right, so the levels can be tuned and weak questions
-- replaced. Only counts are kept: which questions were asked and how many got them right, never who.

create table public.question_stats (
  question_id text primary key,
  asked int not null default 0,
  correct int not null default 0
);
alter table public.question_stats enable row level security;
revoke all on public.question_stats from anon, authenticated;

-- One count per traveller per day, so a flight can't be counted twice. Says only that a day was counted.
create table public.answers_counted (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  primary key (user_id, day)
);
alter table public.answers_counted enable row level security;
revoke all on public.answers_counted from anon, authenticated;

-- Count today's Daily Flight: {"k101": true, "k205": false, ...}. Quietly ignores anything else.
create function public.count_daily_answers(p_day date, p_answers jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare
  utc date := (now() at time zone 'UTC')::date;
  r record;
begin
  if auth.uid() is null or p_day is null or p_day not between utc - 1 and utc + 1 then return; end if;
  if jsonb_typeof(p_answers) is distinct from 'object' or (select count(*) from jsonb_object_keys(p_answers)) > 12 then return; end if;
  insert into public.answers_counted (user_id, day) values (auth.uid(), p_day) on conflict do nothing;
  if not found then return; end if;
  for r in
    select e.key as id, e.value = 'true'::jsonb as ok
    from jsonb_each(p_answers) e
    where e.key ~ '^[a-z0-9]{2,12}$' and jsonb_typeof(e.value) = 'boolean'
  loop
    insert into public.question_stats as s (question_id, asked, correct) values (r.id, 1, case when r.ok then 1 else 0 end)
    on conflict (question_id) do update set asked = s.asked + 1, correct = s.correct + excluded.correct;
  end loop;
end;
$$;

-- For the owner's dashboard: the questions most and least often answered right (with enough answers to tell).
create function public.question_report(p_min int default 10) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_owner() then raise exception 'Not allowed.'; end if;
  return jsonb_build_object(
    'counted', (select coalesce(sum(s.asked), 0) from public.question_stats s),
    'questions', (select count(*) from public.question_stats s where s.asked >= p_min),
    'easiest', (select coalesce(jsonb_agg(x), '[]') from (
      select s.question_id as id, s.asked, s.correct from public.question_stats s where s.asked >= p_min
      order by s.correct::numeric / s.asked desc, s.asked desc limit 15) x),
    'hardest', (select coalesce(jsonb_agg(x), '[]') from (
      select s.question_id as id, s.asked, s.correct from public.question_stats s where s.asked >= p_min
      order by s.correct::numeric / s.asked asc, s.asked desc limit 15) x)
  );
end;
$$;

revoke all on function public.count_daily_answers(date, jsonb), public.question_report(int) from public;
grant execute on function public.count_daily_answers(date, jsonb), public.question_report(int) to authenticated;
