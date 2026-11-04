-- Accounts for Flight: a profile per traveller, their daily flights and Book Club routes.
-- Every table is locked down with row-level security so travellers only touch their own rows.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Traveller' check (char_length(display_name) between 1 and 24),
  passenger_no text not null unique default ('FL' || upper(substr(md5(gen_random_uuid()::text), 1, 7))),
  streak int not null default 0 check (streak >= 0),
  best_streak int not null default 0 check (best_streak >= 0),
  last_daily date,
  shield_used_week text,
  joined_books text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Membership is written only by the server (the payments webhook, later), never by the app.
create table public.memberships (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null check (plan in ('individual', 'family', 'group')),
  active_until timestamptz not null,
  updated_at timestamptz not null default now()
);

create table public.daily_results (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  score int not null check (score between 0 and 10),
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);

create table public.book_results (
  user_id uuid not null references auth.users (id) on delete cascade,
  book_id text not null,
  best int not null check (best between 0 and 5),
  attempts int not null default 1 check (attempts >= 1),
  completed_at date not null default current_date,
  primary key (user_id, book_id)
);

alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.daily_results enable row level security;
alter table public.book_results enable row level security;

create policy "own profile: read" on public.profiles for select using (auth.uid() = id);
create policy "own profile: update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
-- The passenger number and creation date are fixed once issued: travellers may
-- only change these columns.
revoke update on public.profiles from authenticated, anon;
grant update (display_name, streak, best_streak, last_daily, shield_used_week, joined_books) on public.profiles to authenticated;
revoke insert, update, delete on public.memberships from authenticated, anon;

create policy "own membership: read" on public.memberships for select using (auth.uid() = user_id);

create policy "own daily: read" on public.daily_results for select using (auth.uid() = user_id);
create policy "own daily: insert" on public.daily_results for insert with check (auth.uid() = user_id);

create policy "own books: read" on public.book_results for select using (auth.uid() = user_id);
create policy "own books: insert" on public.book_results for insert with check (auth.uid() = user_id);
create policy "own books: update" on public.book_results for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Issue a passport (profile) the moment someone signs up.
create function public.issue_passport() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.issue_passport();
