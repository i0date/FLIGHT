-- Streak reminders: "Final boarding call" at 8 pm and "You missed your flight" at 9 am, in each
-- traveller's own time zone, by phone notification and/or email. Signed-in travellers only, opt-in.
-- The reminders edge function runs hourly (scheduled below) and asks reminder_candidates() who is due.

alter table public.profiles
  add column tz text check (char_length(tz) <= 64),           -- IANA time zone, e.g. America/Toronto
  add column remind_email boolean not null default false,       -- ticked by the traveller (express consent)
  add column unsub_token uuid not null default gen_random_uuid(), -- one-click unsubscribe link in each email
  add column reminders_sent jsonb not null default '{}';        -- { final: day, missed: last_daily } so nothing repeats

grant update (tz, remind_email) on public.profiles to authenticated;

-- One row per device that allowed notifications. Written only through the functions below.
create table public.push_subscriptions (
  endpoint text primary key check (char_length(endpoint) <= 1000),
  user_id uuid not null references auth.users (id) on delete cascade,
  p256dh text not null check (char_length(p256dh) <= 200),
  auth text not null check (char_length(auth) <= 100),
  created_at timestamptz not null default now()
);
create index push_subscriptions_user on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon, authenticated;

-- A device can move between accounts (sign out, sign in as someone else), so saving takes it over.
create function public.save_push_subscription(sub_endpoint text, sub_p256dh text, sub_auth text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  insert into public.push_subscriptions (endpoint, user_id, p256dh, auth)
  values (sub_endpoint, auth.uid(), sub_p256dh, sub_auth)
  on conflict (endpoint) do update set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth;
end;
$$;

create function public.remove_push_subscription(sub_endpoint text) returns void
language sql security definer set search_path = '' as $$
  delete from public.push_subscriptions s where s.endpoint = sub_endpoint and s.user_id = auth.uid();
$$;

create function public.has_push_subscription(sub_endpoint text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.push_subscriptions s where s.endpoint = sub_endpoint and s.user_id = auth.uid());
$$;

revoke all on function public.save_push_subscription(text, text, text), public.remove_push_subscription(text), public.has_push_subscription(text) from public;
grant execute on function public.save_push_subscription(text, text, text), public.remove_push_subscription(text), public.has_push_subscription(text) to authenticated;

-- The "Unsubscribe" link in reminder emails (theflightgame.com/?unsubscribe=<token>). No sign-in needed.
create function public.unsubscribe_reminders(token uuid) returns boolean
language sql security definer set search_path = '' as $$
  with done as (update public.profiles p set remind_email = false where p.unsub_token = token returning 1)
  select exists (select 1 from done);
$$;
revoke all on function public.unsubscribe_reminders(uuid) from public;
grant execute on function public.unsubscribe_reminders(uuid) to anon, authenticated;

-- Who is due a reminder this hour. Mirrors the app's streak rules (src/lib/profile.tsx):
-- a streak is alive with a flight yesterday, or two days ago when Flight Club's weekly shield is unused.
create function public.reminder_candidates()
returns table (user_id uuid, email text, name text, streak int, kind text, shielded boolean, mark text, remind_email boolean, unsub_token uuid)
language sql stable security definer set search_path = '' as $$
  with p as (
    select pr.*, u.email,
      (now() at time zone pr.tz) as local_ts,
      exists (select 1 from public.subscriptions sub
              where sub.status in ('active', 'trialing', 'past_due') and sub.active_until > now()
                and (sub.owner_id = pr.id or exists (select 1 from public.subscription_members sm
                                                     where sm.subscription_id = sub.id and sm.user_id = pr.id))) as premium
    from public.profiles pr
    join auth.users u on u.id = pr.id
    where pr.tz is not null and pr.streak > 0 and pr.last_daily is not null
      and (pr.remind_email or exists (select 1 from public.push_subscriptions s where s.user_id = pr.id))
  ), d as (
    select p.*, (p.local_ts::date - p.last_daily) as gap,
      extract(hour from p.local_ts)::int as local_hour,
      p.local_ts::date::text as today,
      extract(isoyear from p.local_ts)::int || '-W' || extract(week from p.local_ts)::int as week
    from p
  ), s as (
    select d.*, (d.gap = 2 and d.premium and d.shield_used_week is distinct from d.week) as shield_holds from d
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

-- Run the reminders function at the top of every hour.
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;
select cron.schedule(
  'flight-reminders',
  '0 * * * *',
  $$ select net.http_post(
       url := 'https://izbtudngvxquegluyums.supabase.co/functions/v1/reminders',
       headers := '{"Content-Type": "application/json"}'::jsonb,
       body := '{}'::jsonb
     ) $$
);
