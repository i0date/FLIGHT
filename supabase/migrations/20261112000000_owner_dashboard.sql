-- The owner's dashboard: how FLIGHT is doing, for the people who run it. Only accounts listed in
-- app_owners can call these functions; everyone else gets an error and sees nothing.

create table public.app_owners (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.app_owners enable row level security;
revoke all on public.app_owners from anon, authenticated;

insert into public.app_owners (user_id)
select id from auth.users where lower(email) = 'adeotifash@gmail.com'
on conflict do nothing;

create function public.is_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.app_owners o where o.user_id = auth.uid());
$$;

-- Everything on the dashboard in one call. Days are Toronto days. Counts only: no emails or names, except the
-- question reports (which show the question and the note, not who sent it).
create function public.owner_stats() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  today date := (now() at time zone 'America/Toronto')::date;
begin
  if not public.is_owner() then raise exception 'Not allowed.'; end if;
  return jsonb_build_object(
    'generated_at', now(),
    'today', today,
    'accounts', jsonb_build_object(
      'total', (select count(*) from auth.users),
      'new_today', (select count(*) from auth.users u where (u.created_at at time zone 'America/Toronto')::date = today),
      'new_7d', (select count(*) from auth.users u where u.created_at > now() - interval '7 days'),
      'active_today', (select count(distinct d.user_id) from public.daily_results d where d.day = today),
      'active_7d', (select count(distinct d.user_id) from public.daily_results d where d.day > today - 7),
      'signups_by_day', (select coalesce(jsonb_agg(jsonb_build_object('day', g.day, 'n', coalesce(c.n, 0)) order by g.day), '[]')
                         from generate_series(today - 13, today, interval '1 day') as g(day)
                         left join (select (u.created_at at time zone 'America/Toronto')::date as day, count(*) as n from auth.users u group by 1) c on c.day = g.day::date)
    ),
    'daily', jsonb_build_object(
      'by_day', (select coalesce(jsonb_agg(jsonb_build_object('day', g.day, 'flights', coalesce(c.n, 0), 'avg', c.avg) order by g.day), '[]')
                 from generate_series(today - 13, today, interval '1 day') as g(day)
                 left join (select d.day, count(*) as n, round(avg(d.score), 1) as avg from public.daily_results d group by d.day) c on c.day = g.day::date),
      'total', (select count(*) from public.daily_results),
      'perfect', (select count(*) from public.daily_results d where d.score = 10),
      'scores', (select coalesce(jsonb_object_agg(s.score, s.n), '{}') from (select d.score, count(*) as n from public.daily_results d group by d.score) s)
    ),
    'streaks', jsonb_build_object(
      'live', (select count(*) from public.profiles p where p.streak > 0 and p.last_daily >= today - 1),
      'longest_live', (select coalesce(max(p.streak), 0) from public.profiles p where p.last_daily >= today - 1),
      'best_ever', (select coalesce(max(p.best_streak), 0) from public.profiles p),
      'buckets', jsonb_build_object(
        '1', (select count(*) from public.profiles p where p.last_daily >= today - 1 and p.streak = 1),
        '2-6', (select count(*) from public.profiles p where p.last_daily >= today - 1 and p.streak between 2 and 6),
        '7-29', (select count(*) from public.profiles p where p.last_daily >= today - 1 and p.streak between 7 and 29),
        '30+', (select count(*) from public.profiles p where p.last_daily >= today - 1 and p.streak >= 30)
      )
    ),
    'book_club', jsonb_build_object(
      'travellers', (select count(distinct b.user_id) from public.book_results b),
      'books_started', (select count(*) from public.book_results),
      'books_earned', (select count(*) from public.book_results b where b.earned_at is not null),
      'top_books', (select coalesce(jsonb_agg(t order by t.n desc, t.book_id), '[]') from (
                      select b.book_id, count(*) as n, count(*) filter (where b.earned_at is not null) as earned
                      from public.book_results b group by b.book_id order by count(*) desc, b.book_id limit 5) t)
    ),
    'club', jsonb_build_object(
      'by_plan', (select coalesce(jsonb_object_agg(s.plan, s.n), '{}') from (
                    select sub.plan, count(*) as n from public.subscriptions sub
                    where sub.status in ('active', 'trialing', 'past_due') and sub.active_until > now() group by sub.plan) s),
      'seat_members', (select count(*) from public.subscription_members m join public.subscriptions sub on sub.id = m.subscription_id
                       where sub.status in ('active', 'trialing', 'past_due') and sub.active_until > now()),
      'past_due', (select count(*) from public.subscriptions sub where sub.status = 'past_due' and sub.active_until > now())
    ),
    'reminders', jsonb_build_object(
      'devices', (select count(*) from public.push_subscriptions),
      'travellers_with_devices', (select count(distinct s.user_id) from public.push_subscriptions s),
      'email_opt_ins', (select count(*) from public.profiles p where p.remind_email)
    ),
    'connecting', jsonb_build_object(
      'flights_7d', (select count(*) from public.cf_rooms r where r.created_at > now() - interval '7 days'),
      'players_7d', (select count(*) from public.cf_players c where c.joined_at > now() - interval '7 days')
    ),
    'reports', jsonb_build_object(
      'open', (select count(*) from public.question_reports r where r.status = 'open'),
      'recent', (select coalesce(jsonb_agg(t order by t.created_at desc), '[]') from (
                   select r.id, r.question_id, r.reason, r.note, r.prompt, r.shown_answer, r.created_at, (r.user_id is not null) as signed_in
                   from public.question_reports r where r.status = 'open' order by r.created_at desc limit 25) t)
    )
  );
end;
$$;

-- Close a question report from the dashboard: fixed, or not a mistake.
create function public.owner_close_report(report_id bigint, new_status text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_owner() then raise exception 'Not allowed.'; end if;
  if new_status not in ('fixed', 'dismissed', 'open') then raise exception 'Unknown status.'; end if;
  update public.question_reports r set status = new_status where r.id = report_id;
end;
$$;

revoke all on function public.is_owner(), public.owner_stats(), public.owner_close_report(bigint, text) from public;
grant execute on function public.is_owner(), public.owner_stats(), public.owner_close_report(bigint, text) to authenticated;
