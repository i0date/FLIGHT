// The server's rules for scores, streaks and shields (supabase/migrations/…_server_streaks.sql), run against
// an in-memory Postgres with just enough of the real schema around them.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';

const db = new PGlite();
const rows = async (sql: string) => (await db.query<Record<string, unknown>>(sql)).rows;
const A = '00000000-0000-0000-0000-00000000000a';
const B = '00000000-0000-0000-0000-00000000000b';
const as = (uid: string) => db.exec(`set app.uid = '${uid}'`);
const d = (n: number) => `((now() at time zone 'UTC')::date + ${n})`;
type State = { streak: number; best_streak: number; last_daily: Date | null; shields: number; shield_week: string | null };
const call = async (fn: string, args: string) => (await rows(`select (public.${fn}(${args})).*`))[0] as State;
const refused = async (fn: string, args: string) => expect(call(fn, args)).rejects.toThrow();
const reset = (fields: string) => db.exec(`update public.profiles set ${fields} where id = '${A}'; delete from public.daily_results;`);
const dayOf = async (n: number) => ((await rows(`select ${d(n)}::text as t`))[0].t as string);

beforeAll(async () => {
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('app.uid', true), '')::uuid $$;
    create table public.profiles (id uuid primary key, display_name text not null default 'Traveller', passenger_no text not null default 'FL0000123',
      streak int not null default 0, best_streak int not null default 0, last_daily date, joined_books text[] not null default '{}',
      created_at timestamptz not null default now(), on_leaderboard boolean not null default true,
      shields int not null default 0 check (shields between 0 and 3), shield_week text, shield_auto boolean not null default true);
    create table public.daily_results (user_id uuid, day date, score int, created_at timestamptz default now(), primary key (user_id, day));
    alter table public.daily_results enable row level security;
    create policy "own daily: insert" on public.daily_results for insert with check (auth.uid() = user_id);
    grant update (display_name, streak, best_streak, last_daily, shields, shield_week, shield_auto) on public.profiles to authenticated;
    create table public.members (user_id uuid);
    create function public.my_membership() returns table (plan text) language sql stable as $$ select 'family' from public.members where user_id = auth.uid() $$;
    create function public.board_name(display_name text, passenger_no text) returns text language sql immutable as $$ select display_name $$;
    create table public.crews (id uuid primary key); create table public.crew_members (crew_id uuid, user_id uuid);
  `);
  await db.exec(readFileSync('supabase/migrations/20261115000000_server_streaks.sql', 'utf8'));
  await db.exec(`insert into public.profiles (id) values ('${A}'), ('${B}')`);
  await as(A);
});

describe('Saving a Daily Flight on the server', () => {
  it('saves today once, and ignores a second try', async () => {
    expect((await call('submit_daily', `${d(0)}, 7`)).streak).toBe(1);
    expect((await call('submit_daily', `${d(0)}, 10`)).streak).toBe(1);
    expect((await rows(`select score from public.daily_results where user_id = '${A}'`))[0].score).toBe(7);
  });

  it('refuses impossible scores and old days', async () => {
    await refused('submit_daily', `${d(1)}, 11`);
    await refused('submit_daily', `${d(-5)}, 9`);
  });

  it('covers missed days with shields and earns one at 30 days', async () => {
    await reset(`streak = 29, best_streak = 29, last_daily = ${d(-3)}, shields = 2, shield_auto = true`);
    const s = await call('submit_daily', `${d(0)}, 8`);
    expect(s.streak).toBe(30);
    expect(s.shields).toBe(1);
  });

  it('lets a traveller spend shields by hand, or start again without them', async () => {
    await reset(`streak = 40, last_daily = ${d(-2)}, shields = 2, shield_auto = false`);
    expect((await rows(`select public.board_streak(40, ${d(-2)}, ${d(0)}, 2) as s`))[0].s).toBe(40);
    expect((await call('spend_shields', d(0))).shields).toBe(1);
    expect((await call('submit_daily', `${d(0)}, 6`)).streak).toBe(41);

    await reset(`streak = 40, last_daily = ${d(-2)}, shields = 2`);
    const s = await call('submit_daily', `${d(0)}, 6`);
    expect(s.streak).toBe(1);
    expect(s.shields).toBe(2);
  });
});

describe('Weekly shields on the server', () => {
  it('go to members only, once a week, for this week only', async () => {
    await reset(`shields = 0, shield_week = null`);
    const week = (await rows(`select public.iso_week(now()) as w`))[0].w as string;
    expect((await call('claim_weekly_shield', `'${week}'`)).shields).toBe(0);
    await db.exec(`insert into public.members values ('${A}')`);
    expect((await call('claim_weekly_shield', `'${week}'`)).shields).toBe(1);
    expect((await call('claim_weekly_shield', `'${week}'`)).shields).toBe(1);
    await refused('claim_weekly_shield', `'2030-W1'`);
  });
});

describe('Bringing earlier flights into a new account', () => {
  it('imports the last 60 days once and works the streak out itself', async () => {
    await as(B);
    const days: Record<string, number> = { '2020-01-01': 10 };
    for (let i = 35; i >= 1; i--) if (i !== 10) days[await dayOf(-i)] = 8;
    const s = await call('import_history', `'${JSON.stringify(days)}'::jsonb`);
    expect(s.streak).toBe(9);
    expect(s.best_streak).toBe(25);
    expect((await rows(`select count(*)::int as n from public.daily_results where user_id = '${B}'`))[0].n).toBe(34);
    expect((await call('import_history', `'{"${await dayOf(0)}": 10}'::jsonb`)).streak).toBe(9);
  });

  it('refuses direct changes to streaks and scores from the app', async () => {
    await db.exec(`set role authenticated`);
    await expect(db.exec(`update public.profiles set streak = 500 where id = '${B}'`)).rejects.toThrow();
    await expect(db.exec(`insert into public.daily_results (user_id, day, score) values ('${B}', now()::date, 10)`)).rejects.toThrow();
    await db.exec(`reset role`);
  });
});
