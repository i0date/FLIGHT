import { supabase } from './supabase';
import { playerToken } from './connecting';
import type { PlayQuestion } from '../types';

// "Something wrong?": flag a question for review. See supabase/migrations/*_question_reports.sql.
export const REASONS = [
  { id: 'wrong_answer', label: 'Wrong answer' },
  { id: 'typo', label: 'Typo' },
  { id: 'unclear', label: 'Unclear' },
  { id: 'other', label: 'Something else' },
] as const;
export type Reason = (typeof REASONS)[number]['id'];

export const canReport = !!supabase;

export async function reportQuestion(q: PlayQuestion, reason: Reason, note: string) {
  if (!supabase) throw new Error('Reporting needs the online service.');
  const { error } = await supabase.rpc('report_question', {
    qid: q.id,
    why: reason,
    detail: note,
    question_prompt: q.prompt,
    answer: q.kind === 'choice' ? q.options[q.answer] : q.order.join(' → '),
    reporter_token: playerToken(),
  });
  // P0001 is our own message (the daily limit); anything else is a hiccup the player can't act on.
  if (error) throw new Error(error.code === 'P0001' ? error.message : 'Could not send the report. Try again in a moment.');
}
