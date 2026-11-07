// Read the "Something wrong?" reports players have sent about questions.
//   npm run reports                  open reports, newest first
//   npm run reports -- --all         every report, including closed ones
//   npm run reports -- --fixed 12    mark report 12 as fixed (several ids are fine: 12 13 14)
//   npm run reports -- --dismiss 12  mark report 12 as not a mistake
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Needs VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.');
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });
const args = process.argv.slice(2);
const REASON = { wrong_answer: 'Wrong answer', typo: 'Typo', unclear: 'Unclear', other: 'Something else' };

const close = args.includes('--fixed') ? 'fixed' : args.includes('--dismiss') ? 'dismissed' : null;
if (close) {
  const ids = args.filter((a) => /^\d+$/.test(a)).map(Number);
  if (!ids.length) {
    console.error(`Give the report number(s) to mark ${close}.`);
    process.exit(1);
  }
  const { data, error } = await db.from('question_reports').update({ status: close }).in('id', ids).select('id');
  if (error) throw error;
  console.log(`Marked ${data.length} report${data.length === 1 ? '' : 's'} ${close}: ${data.map((r) => r.id).join(', ')}`);
  process.exit(0);
}

let query = db.from('question_reports').select('*').order('created_at', { ascending: false }).limit(200);
if (!args.includes('--all')) query = query.eq('status', 'open');
const { data, error } = await query;
if (error) throw error;
if (!data.length) {
  console.log('No reports. Clear skies.');
  process.exit(0);
}

// Group by question, so a question several people flagged shows up once with every note.
const byQuestion = new Map();
for (const r of data) byQuestion.set(r.question_id, [...(byQuestion.get(r.question_id) ?? []), r]);
console.log(`${data.length} report${data.length === 1 ? '' : 's'} on ${byQuestion.size} question${byQuestion.size === 1 ? '' : 's'}\n`);
for (const [qid, reports] of [...byQuestion].sort((a, b) => b[1].length - a[1].length)) {
  const first = reports[0];
  console.log(`■ ${qid}  (${reports.length} report${reports.length === 1 ? '' : 's'})`);
  console.log(`  Q: ${first.prompt}`);
  console.log(`  Marked correct: ${first.shown_answer ?? '—'}`);
  for (const r of reports) {
    const when = new Date(r.created_at).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' });
    const tag = r.status === 'open' ? '' : ` [${r.status}]`;
    console.log(`  #${r.id} ${REASON[r.reason] ?? r.reason} · ${when}${r.user_id ? ' · signed in' : ' · guest'}${tag}`);
    if (r.note) console.log(`     "${r.note}"`);
  }
  console.log('');
}
