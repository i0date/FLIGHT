import { supabase } from './supabase';

// After a Daily Flight, tell the server which questions were answered right, so the levels can be tuned.
// Only counts are kept (supabase/migrations/…_question_stats.sql). Signed-in travellers only; never blocks the flight.
export function countDailyAnswers(day: string, ids: string[], results: boolean[]) {
  if (!supabase) return;
  const answers = Object.fromEntries(ids.map((id, i) => [id, results[i] === true]));
  supabase.auth.getSession().then(({ data }) => {
    if (data.session) supabase!.rpc('count_daily_answers', { p_day: day, p_answers: answers }).then(() => undefined, () => undefined);
  });
}
