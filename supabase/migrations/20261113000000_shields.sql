-- Streak shields you collect: up to three held at once. Frequent Flyers get one a week and everyone earns one
-- at every 30-day streak (worked out in the app, src/lib/profile.tsx). Each shield covers one missed day,
-- used automatically or, with shield_auto off, only when the traveller chooses to.
alter table public.profiles
  add column shields int not null default 0 check (shields between 0 and 3),
  add column shield_week text,
  add column shield_auto boolean not null default true;

grant update (shields, shield_week, shield_auto) on public.profiles to authenticated;

-- Reminders follow the new rule: a streak is held when every missed day can be covered by a shield
-- that will be used automatically.
create or replace function public.reminder_candidates()
returns table (user_id uuid, email text, name text, streak int, kind text, shielded boolean, mark text, remind_email boolean, unsub_token uuid)
language sql stable security definer set search_path = '' as $$
  with p as (
    select pr.*, u.email, (now() at time zone pr.tz) as local_ts
    from public.profiles pr
    join auth.users u on u.id = pr.id
    where pr.tz is not null and pr.streak > 0 and pr.last_daily is not null
      and (pr.remind_email or exists (select 1 from public.push_subscriptions s where s.user_id = pr.id))
  ), d as (
    select p.*, (p.local_ts::date - p.last_daily) as gap,
      extract(hour from p.local_ts)::int as local_hour,
      p.local_ts::date::text as today
    from p
  ), s as (
    select d.*, (d.gap >= 2 and d.shield_auto and d.gap - 1 <= d.shields) as shield_holds from d
  )
  select s.id, s.email, s.display_name, s.streak, 'final', s.shield_holds, s.today, s.remind_email, s.unsub_token
  from s
  where s.local_hour = 20 and (s.gap = 1 or s.shield_holds)
    and s.reminders_sent->>'final' is distinct from s.today
  union all
  select s.id, s.email, s.display_name, s.streak, 'missed', false, s.last_daily::text, s.remind_email, s.unsub_token
  from s
  where s.local_hour = 9 and s.gap >= 2 and not s.shield_holds and s.streak >= 2
    and s.reminders_sent->>'missed' is distinct from s.last_daily::text;
$$;

revoke all on function public.reminder_candidates() from public, anon, authenticated;
grant execute on function public.reminder_candidates() to service_role;
