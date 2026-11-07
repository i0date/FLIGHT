-- Connecting Flights: a live group game. A Flight Club member opens a flight and shares its
-- 4-letter code; anyone can board with just a name (no account needed). The host starts it,
-- everyone races the same 10 questions in their own scrambled order for 60 seconds.
-- Tables stay locked; everything goes through the functions below.

create table public.cf_rooms (
  code text primary key,
  host_id uuid not null references auth.users (id) on delete cascade,
  seed text not null default md5(gen_random_uuid()::text),
  started_at timestamptz,
  created_at timestamptz not null default now()
);

-- A player is known by a random token kept on their device, so guests can play too.
create table public.cf_players (
  id uuid primary key default gen_random_uuid(),
  room text not null references public.cf_rooms (code) on delete cascade,
  token uuid not null,
  name text not null check (char_length(name) between 1 and 24),
  answered int not null default 0,
  score int not null default 0,
  finished_ms int,
  joined_at timestamptz not null default now(),
  unique (room, token)
);

alter table public.cf_rooms enable row level security;
alter table public.cf_players enable row level security;
revoke all on public.cf_rooms, public.cf_players from anon, authenticated;

-- Opening a flight is a Flight Club perk. Old flights (a day or more) are cleared out as new ones open.
create function public.cf_create() returns text
language plpgsql security definer set search_path = '' as $$
declare
  letters constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ'; -- no I or O, so codes read clearly aloud
  made text;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if not exists (select 1 from public.my_membership()) then raise exception 'Opening a Connecting Flight is a Flight Club perk.'; end if;
  delete from public.cf_rooms r where r.created_at < now() - interval '1 day';
  loop
    made := '';
    for i in 1..4 loop
      made := made || substr(letters, 1 + floor(random() * length(letters))::int, 1);
    end loop;
    exit when not exists (select 1 from public.cf_rooms r where r.code = made);
  end loop;
  insert into public.cf_rooms (code, host_id) values (made, auth.uid());
  return made;
end;
$$;

-- Board before take-off. Boarding again with the same token just changes your name.
create function public.cf_join(room_code text, player_name text, player_token uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare found public.cf_rooms;
begin
  select * into found from public.cf_rooms r where r.code = upper(trim(room_code));
  if found.code is null then raise exception 'No flight has that code.'; end if;
  if exists (select 1 from public.cf_players p where p.room = found.code and p.token = player_token) then
    update public.cf_players p set name = left(trim(player_name), 24) where p.room = found.code and p.token = player_token;
    return;
  end if;
  if found.started_at is not null then raise exception 'That flight has already taken off.'; end if;
  if (select count(*) from public.cf_players p where p.room = found.code) >= 50 then raise exception 'That flight is full.'; end if;
  insert into public.cf_players (room, token, name) values (found.code, player_token, left(trim(player_name), 24));
end;
$$;

-- The host starts the flight; everyone takes off together after a 5-second countdown.
create function public.cf_start(room_code text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.cf_rooms r set started_at = now() + interval '5 seconds'
  where r.code = upper(trim(room_code)) and r.host_id = auth.uid() and r.started_at is null;
  if not found then raise exception 'Only the host can start this flight.'; end if;
end;
$$;

-- Report progress after each answer, and the time taken once done. Only counts while the flight is in the air.
create function public.cf_progress(room_code text, player_token uuid, answered_n int, score_n int, done_ms int) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.cf_players p
  set answered = greatest(p.answered, least(answered_n, 10)),
      score = greatest(p.score, least(score_n, answered_n, 10)),
      finished_ms = coalesce(p.finished_ms, case when done_ms is not null then least(greatest(done_ms, 0), 60000) end)
  from public.cf_rooms r
  where p.room = r.code and r.code = upper(trim(room_code)) and p.token = player_token
    and r.started_at is not null and now() between r.started_at and r.started_at + interval '70 seconds'
    and p.finished_ms is null;
end;
$$;

-- Everything a screen needs, polled while the flight runs. The seed (which picks the questions)
-- is only shared once the flight starts. Ranked by score, then the fastest time.
create function public.cf_state(room_code text, player_token uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'code', r.code,
    'server_now', now(),
    'started_at', r.started_at,
    'seed', case when r.started_at is not null then r.seed end,
    'is_host', r.host_id = auth.uid(),
    'players', coalesce((
      select jsonb_agg(jsonb_build_object(
               'name', p.name, 'answered', p.answered, 'score', p.score,
               'finished_ms', p.finished_ms, 'is_me', p.token = player_token)
             order by p.score desc, coalesce(p.finished_ms, 60001), p.joined_at)
      from public.cf_players p where p.room = r.code), '[]'::jsonb))
  from public.cf_rooms r
  where r.code = upper(trim(room_code));
$$;

revoke execute on function public.cf_create(), public.cf_join(text, text, uuid), public.cf_start(text),
  public.cf_progress(text, uuid, int, int, int), public.cf_state(text, uuid) from public, anon, authenticated;
grant execute on function public.cf_create(), public.cf_start(text) to authenticated;
grant execute on function public.cf_join(text, text, uuid), public.cf_progress(text, uuid, int, int, int), public.cf_state(text, uuid) to anon, authenticated;
