// Question reports (supabase/migrations/…_question_reports.sql and …_guest_report_cap.sql).
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';

const db = new PGlite();
const migration = (suffix: string) => readFileSync(`supabase/migrations/${readdirSync('supabase/migrations').find((f) => f.endsWith(suffix))}`, 'utf8');
const report = (qid: string, token: string) =>
  db.query(`select public.report_question($1, 'typo', null, 'Q?', 'A', $2::uuid)`, [qid, token]);
const token = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`;

beforeAll(async () => {
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('app.uid', true), '')::uuid $$;
  `);
  await db.exec(migration('_question_reports.sql').replace(/create policy[\s\S]*?;/g, ''));
  await db.exec(migration('_guest_report_cap.sql'));
});

describe('Question reports', () => {
  it('take one report per question per device', async () => {
    await report('k101', token(1));
    await report('k101', token(1));
    expect((await db.query(`select count(*)::int as n from public.question_reports`)).rows[0]).toEqual({ n: 1 });
  });

  it('stop guests flooding the dashboard with made-up devices', async () => {
    for (let i = 2; i <= 60; i++) await report(`q${i}`, token(i));
    await expect(report('q-flood', token(999))).rejects.toThrow('Lots of reports');
  });

  it('still take reports from signed-in travellers', async () => {
    await db.exec(`insert into auth.users values ('${token(500)}'); set app.uid = '${token(500)}'`);
    await report('q-signed-in', token(500));
    expect((await db.query(`select count(*)::int as n from public.question_reports where user_id is not null`)).rows[0]).toEqual({ n: 1 });
  });
});
