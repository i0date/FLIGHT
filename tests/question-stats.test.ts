// Counting right and wrong answers per Daily Flight question (supabase/migrations/…_question_stats.sql).
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';

const db = new PGlite();
const rows = async (sql: string) => (await db.query<Record<string, unknown>>(sql)).rows;
const A = '00000000-0000-0000-0000-00000000000a';
const B = '00000000-0000-0000-0000-00000000000b';
const as = (uid: string) => db.exec(`set app.uid = '${uid}'`);
const today = `(now() at time zone 'UTC')::date`;
const count = (day: string, answers: object) => db.exec(`select public.count_daily_answers(${day}, '${JSON.stringify(answers)}'::jsonb)`);
const stats = async () => Object.fromEntries((await rows(`select * from public.question_stats order by question_id`)).map((r) => [r.question_id, [r.asked, r.correct]]));

beforeAll(async () => {
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('app.uid', true), '')::uuid $$;
    create table public.app_owners (user_id uuid primary key);
    create function public.is_owner() returns boolean language sql stable as $$ select exists (select 1 from public.app_owners o where o.user_id = auth.uid()) $$;
  `);
  await db.exec(readFileSync('supabase/migrations/20261116000000_question_stats.sql', 'utf8'));
  await db.exec(`insert into auth.users values ('${A}'), ('${B}'); insert into public.app_owners values ('${A}');`);
});

describe('Question stats', () => {
  it('counts each traveller once per day, without saying who', async () => {
    await as(A);
    await count(today, { k101: true, k205: false });
    await count(today, { k101: true, k205: true }); // a second try the same day is ignored
    await as(B);
    await count(today, { k101: false, k205: true });
    expect(await stats()).toEqual({ k101: [2, 1], k205: [2, 1] });
    expect((await rows(`select column_name from information_schema.columns where table_name = 'question_stats'`)).map((r) => r.column_name).sort()).toEqual(['asked', 'correct', 'question_id']);
  });

  it('ignores old days, signed-out calls and anything that is not an answer', async () => {
    await as(B);
    await count(`${today} - 5`, { x1: true });
    await count(`${today} + 1`, { 'bad id!': true, k300: 'yes' });
    await db.exec(`set app.uid = ''`);
    await count(today, { x2: true });
    expect(Object.keys(await stats())).toEqual(['k101', 'k205']);
  });

  it('reports easiest and hardest to the owner only', async () => {
    await as(A);
    const report = (await rows(`select public.question_report(1) as r`))[0].r as { counted: number; easiest: { id: string }[] };
    expect(report.counted).toBe(4);
    expect(report.easiest).toHaveLength(2);
    await as(B);
    await expect(rows(`select public.question_report(1)`)).rejects.toThrow('Not allowed');
  });
});
