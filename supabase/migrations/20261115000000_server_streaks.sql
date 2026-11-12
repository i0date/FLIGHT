-- Streaks, shields and Daily Flight results are worked out here, not trusted from the app, so the
-- boards can't be filled with made-up scores or streaks. The rules mirror src/lib/profile.tsx.

-- The app can no longer write these directly; it goes through the functions below.
revoke update (streak, best_streak, last_daily, shields, shield_week) on public.profiles from authenticated;
drop policy "own daily: insert" on public.daily_results;
revoke insert, update, delete on public.daily_results from authenticated, anon;

-- The streak a board shows on a day: alive after a flight yesterday, or while shields can still cover every
-- missed day (as the app shows it).
create function public.board_streak(streak int, last_daily date, for_day date, shields int) returns int
language sql immutable set search_path = '' as $$
  select case
    when last_daily is null then 0
    when for_day - last_daily - 1 <= shields then streak
    else 0
  end;
$$;

-- Which ISO week a moment falls in (in UTC), written the way the app writes it ("2026-W46").
create function public.iso_week(at timestamptz) returns text
language sql immutable set search_path = '' as $$
  select extract(isoyear from at at time zone 'UTC')::int || '-W' || extract(week from at at time zone 'UTC')::int;
$$;

-- What the app needs back after any change.
create type public.streak_state as (streak int, best_streak int, last_daily date, shields int, shield_week text);

-- Save today's Daily Flight. Only the traveller's today (anywhere on earth) is accepted, once.
create function public.submit_daily(p_day date, p_score int) returns public.streak_state
language plpgsql security definer set search_path = '' as $$
declare
  p public.profiles;
  utc date := (now() at time zone 'UTC')::date;
  missed int;
  new_streak int;
  new_shields int;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if p_score is null or p_score not between 0 and 10 then raise exception 'That score is not possible.'; end if;
  if p_day is null or p_day not between utc - 1 and utc + 1 then raise exception 'Only today''s flight can be saved.'; end if;

  select * into p from public.profiles where id = auth.uid() for update;
  if not exists (select 1 from public.daily_results d where d.user_id = p.id and d.day = p_day) then
    if p.last_daily is not null and p_day <= p.last_daily then raise exception 'Only today''s flight can be saved.'; end if;

    new_shields := p.shields;
    missed := case when p.last_daily is null then null else p_day - p.last_daily - 1 end;
    if missed = 0 then new_streak := p.streak + 1;
    elsif missed > 0 and p.shield_auto and missed <= p.shields then
      new_streak := p.streak + 1;
      new_shields := p.shields - missed;
    else new_streak := 1;
    end if;
    if new_streak % 30 = 0 then new_shields := least(3, new_shields + 1); end if;

    insert into public.daily_results (user_id, day, score) values (p.id, p_day, p_score);
    update public.profiles pr
      set streak = new_streak, best_streak = greatest(pr.best_streak, new_streak), last_daily = p_day, shields = new_shields
      where pr.id = p.id
      returning * into p;
  end if;
  return (p.streak, p.best_streak, p.last_daily, p.shields, p.shield_week)::public.streak_state;
end;
$$;

-- Spend shields by hand on the days missed before p_today, so the streak waits on today again.
create function public.spend_shields(p_today date) returns public.streak_state
language plpgsql security definer set search_path = '' as $$
declare
  p public.profiles;
  utc date := (now() at time zone 'UTC')::date;
  missed int;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if p_today is null or p_today not between utc - 1 and utc + 1 then raise exception 'Shields can only cover the days just missed.'; end if;
  select * into p from public.profiles where id = auth.uid() for update;
  missed := p_today - p.last_daily - 1;
  if p.last_daily is not null and missed > 0 and missed <= p.shields and p.streak > 0 then
    update public.profiles pr set shields = pr.shields - missed, last_daily = p_today - 1 where pr.id = p.id returning * into p;
  end if;
  return (p.streak, p.best_streak, p.last_daily, p.shields, p.shield_week)::public.streak_state;
end;
$$;

-- A Frequent Flyer's shield for this week, once per ISO week. The week is the traveller's own, so it is
-- accepted if it is the current week anywhere on earth.
create function public.claim_weekly_shield(p_week text) returns public.streak_state
language plpgsql security definer set search_path = '' as $$
declare
  p public.profiles;
  wk text := p_week;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if wk is null or wk not in (public.iso_week(now() - interval '12 hours'), public.iso_week(now()), public.iso_week(now() + interval '14 hours')) then
    raise exception 'That is not this week.';
  end if;
  select * into p from public.profiles where id = auth.uid() for update;
  if exists (select 1 from public.my_membership()) and p.shield_week is distinct from wk then
    update public.profiles pr set shields = least(3, pr.shields + 1), shield_week = wk where pr.id = p.id returning * into p;
  end if;
  return (p.streak, p.best_streak, p.last_daily, p.shields, p.shield_week)::public.streak_state;
end;
$$;

-- Bring Daily Flights played on this device before signing up into a brand-new account: once only,
-- within a day of the account being made, for the last 60 days. The streak is worked out from those days.
create function public.import_history(p_days jsonb) returns public.streak_state
language plpgsql security definer set search_path = '' as $$
declare
  p public.profiles;
  utc date := (now() at time zone 'UTC')::date;
  r record;
  missed int;
  s int := 0;
  best int := 0;
  held int := 0;
  last date := null;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  select * into p from public.profiles where id = auth.uid() for update;
  if p.created_at < now() - interval '1 day' or exists (select 1 from public.daily_results d where d.user_id = p.id) then
    return (p.streak, p.best_streak, p.last_daily, p.shields, p.shield_week)::public.streak_state;
  end if;

  for r in
    select (e.key)::date as day, (e.value)::int as score
    from jsonb_each_text(p_days) e
    where e.key ~ '^\d{4}-\d{2}-\d{2}$' and e.value ~ '^\d{1,2}$'
      and (e.key)::date between utc - 60 and utc + 1 and (e.value)::int between 0 and 10
    order by 1
  loop
    missed := case when last is null then null else r.day - last - 1 end;
    if missed = 0 then s := s + 1;
    elsif missed > 0 and missed <= held then s := s + 1; held := held - missed;
    else s := 1;
    end if;
    if s % 30 = 0 then held := least(3, held + 1); end if;
    best := greatest(best, s);
    last := r.day;
    insert into public.daily_results (user_id, day, score) values (p.id, r.day, r.score) on conflict do nothing;
  end loop;

  if last is not null then
    update public.profiles pr
      set streak = s, best_streak = greatest(pr.best_streak, best), last_daily = last, shields = greatest(pr.shields, held)
      where pr.id = p.id returning * into p;
  end if;
  return (p.streak, p.best_streak, p.last_daily, p.shields, p.shield_week)::public.streak_state;
end;
$$;

revoke all on function public.submit_daily(date, int), public.spend_shields(date), public.claim_weekly_shield(text),
  public.import_history(jsonb), public.board_streak(int, date, date, int), public.iso_week(timestamptz) from public;
grant execute on function public.submit_daily(date, int), public.spend_shields(date), public.claim_weekly_shield(text),
  public.import_history(jsonb) to authenticated;

-- The boards count shields too, so a covered streak isn't shown as broken.
create or replace function public.leaderboard(board text, for_day date)
returns table (pos bigint, name text, streak int, today int, is_me boolean)
language sql stable security definer set search_path = '' as $$
  with entries as (
    select p.id,
           public.board_name(p.display_name, p.passenger_no) as name,
           public.board_streak(p.streak, p.last_daily, for_day, p.shields) as streak,
           d.score as today,
           d.created_at as flown_at
    from public.profiles p
    left join public.daily_results d on d.user_id = p.id and d.day = for_day
    where p.on_leaderboard or p.id = auth.uid()
  ),
  ranked as (
    select e.*, row_number() over (
             order by case when board = 'today' then e.today end desc nulls last,
                      case when board = 'today' then e.flown_at end asc,
                      case when board = 'streak' then e.streak end desc,
                      e.today desc nulls last, e.name) as pos
    from entries e
    where (board = 'today' and e.today is not null) or (board = 'streak' and e.streak > 0)
  )
  select r.pos, r.name, r.streak, r.today, r.id = auth.uid()
  from ranked r
  where r.pos <= 50 or r.id = auth.uid()
  order by r.pos;
$$;

create or replace function public.crew_board(crew uuid, for_day date)
returns table (pos bigint, name text, streak int, today int, is_me boolean)
language sql stable security definer set search_path = '' as $$
  select row_number() over (order by d.score desc nulls last, public.board_streak(p.streak, p.last_daily, for_day, p.shields) desc, d.created_at),
         public.board_name(p.display_name, p.passenger_no),
         public.board_streak(p.streak, p.last_daily, for_day, p.shields),
         d.score,
         p.id = auth.uid()
  from public.crew_members m
  join public.profiles p on p.id = m.user_id
  left join public.daily_results d on d.user_id = p.id and d.day = for_day
  where m.crew_id = crew
    and exists (select 1 from public.crew_members me where me.crew_id = crew and me.user_id = auth.uid())
  order by 1;
$$;
