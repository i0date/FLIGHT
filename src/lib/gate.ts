import { dailyQuestions } from '../data/dailyQuestions';
import { ROTATION_START, dailySpare } from '../data/dailyBank';
import { seeded, shuffle, toPlay } from './random';
import type { ChoiceQuestion, PlayQuestion } from '../types';

// Gate change: on about two days in five the Daily Flight is moved to a new gate after question 5,
// with a stratosphere bonus question worth extra miles. It never changes the score or streak.
export const GATE_AFTER = 5;

export function gateChangeFor(day: string, todays: PlayQuestion[]): { gate: string; question: PlayQuestion } | null {
  const rand = seeded(`flight-gate-${day}`);
  if (rand() >= 0.4) return null;
  const gate = `${'BCDEF'[Math.floor(rand() * 5)]}${1 + Math.floor(rand() * 19)}`;
  if (day >= ROTATION_START) {
    const spare = dailySpare(day);
    return spare ? { gate, question: toPlay(spare, rand) } : null;
  }
  const taken = new Set(todays.map((q) => q.id));
  const pool = dailyQuestions.filter((q): q is ChoiceQuestion => q.kind !== 'order' && q.level === 6 && !taken.has(q.id));
  return { gate, question: toPlay(shuffle(pool, rand)[0], rand) };
}
