-- Leaderboards: a public board (today's score, streaks) and private crew boards.
-- Tables stay locked; everything is read and changed through the functions below,
-- which only expose a display name, streak and today's score.

alter table public.profiles add column on_leaderboard boolean not null default true;
grant update (on_leaderboard) on public.profiles to authenticated;

-- Travellers who kept the default name are shown with the end of their passenger number.
create function public.board_name(display_name text, passenger_no text) returns text
language sql immutable set search_path = '' as $$
  select case when display_name = 'Traveller' then 'Traveller ' || right(passenger_no, 3) else display_name end;
$$;

-- A streak only counts if the traveller flew today or yesterday.
create function public.live_streak(streak int, last_daily date, for_day date) returns int
language sql immutable set search_path = '' as $$
  select case when last_daily >= for_day - 1 then streak else 0 end;
$$;

-- Public board. board: 'today' (score, earliest first on ties) or 'streak'.
-- Returns the top 50, plus the caller's own row if they are further down.
create function public.leaderboard(board text, for_day date)
returns table (pos bigint, name text, streak int, today int, is_me boolean)
language sql stable security definer set search_path = '' as $$
  with entries as (
    select p.id,
           public.board_name(p.display_name, p.passenger_no) as name,
           public.live_streak(p.streak, p.last_daily, for_day) as streak,
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

-- Crews: private leaderboards for a church, family or group of friends.
create table public.crews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  code text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  owner_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.crew_members (
  crew_id uuid not null references public.crews (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (crew_id, user_id)
);
create index crew_members_user on public.crew_members (user_id);

alter table public.crews enable row level security;
alter table public.crew_members enable row level security;
revoke all on public.crews, public.crew_members from anon, authenticated;

-- Creating a crew is a Flight Club perk; up to 5 per traveller.
create function public.create_crew(crew_name text)
returns table (id uuid, name text, code text)
language plpgsql security definer set search_path = '' as $$
declare made public.crews;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if not exists (select 1 from public.my_membership()) then raise exception 'Creating a crew is a Flight Club perk.'; end if;
  if (select count(*) from public.crews c where c.owner_id = auth.uid()) >= 5 then raise exception 'You can run up to 5 crews.'; end if;
  insert into public.crews (name, owner_id) values (trim(crew_name), auth.uid()) returning * into made;
  insert into public.crew_members (crew_id, user_id) values (made.id, auth.uid());
  return query select made.id, made.name, made.code;
end;
$$;

-- Anyone signed in can join with a code; a crew holds up to 100 travellers.
create function public.join_crew(crew_code text)
returns table (id uuid, name text)
language plpgsql security definer set search_path = '' as $$
declare found public.crews;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  select * into found from public.crews c where c.code = upper(trim(crew_code));
  if found.id is null then raise exception 'No crew has that code.'; end if;
  if (select count(*) from public.crew_members m where m.crew_id = found.id) >= 100 then raise exception 'That crew is full.'; end if;
  insert into public.crew_members (crew_id, user_id) values (found.id, auth.uid()) on conflict do nothing;
  return query select found.id, found.name;
end;
$$;

-- Leaving a crew you run closes it for everyone.
create function public.leave_crew(crew uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.crews c where c.id = crew and c.owner_id = auth.uid()) then
    delete from public.crews c where c.id = crew;
  else
    delete from public.crew_members m where m.crew_id = crew and m.user_id = auth.uid();
  end if;
end;
$$;

create function public.my_crews()
returns table (id uuid, name text, code text, members int, is_owner boolean)
language sql stable security definer set search_path = '' as $$
  select c.id, c.name, c.code,
         (select count(*)::int from public.crew_members m2 where m2.crew_id = c.id),
         c.owner_id = auth.uid()
  from public.crews c
  join public.crew_members m on m.crew_id = c.id and m.user_id = auth.uid()
  order by c.created_at;
$$;

-- A crew's board: every member, ranked by today's score then streak. Members only.
create function public.crew_board(crew uuid, for_day date)
returns table (pos bigint, name text, streak int, today int, is_me boolean)
language sql stable security definer set search_path = '' as $$
  select row_number() over (order by d.score desc nulls last, public.live_streak(p.streak, p.last_daily, for_day) desc, d.created_at),
         public.board_name(p.display_name, p.passenger_no),
         public.live_streak(p.streak, p.last_daily, for_day),
         d.score,
         p.id = auth.uid()
  from public.crew_members m
  join public.profiles p on p.id = m.user_id
  left join public.daily_results d on d.user_id = p.id and d.day = for_day
  where m.crew_id = crew
    and exists (select 1 from public.crew_members me where me.crew_id = crew and me.user_id = auth.uid())
  order by 1;
$$;

revoke execute on function public.leaderboard(text, date), public.create_crew(text), public.join_crew(text),
  public.leave_crew(uuid), public.my_crews(), public.crew_board(uuid, date) from public;
grant execute on function public.leaderboard(text, date) to anon, authenticated;
grant execute on function public.create_crew(text), public.join_crew(text), public.leave_crew(uuid),
  public.my_crews(), public.crew_board(uuid, date) to authenticated;
