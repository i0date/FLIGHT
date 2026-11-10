import type { ChoiceQuestion, Level, RawQuestion } from '../types';
import { seeded } from '../lib/random';
import { dailyQuestions } from './dailyQuestions';
import { dailyBatch2 } from './dailyBatch2';

// The Daily Flight's questions from 12 November 2026 on. Instead of a fresh random draw each day,
// every level is a fixed queue that each day takes the next few from, so a question never comes
// back until its whole level has been flown. New questions go in a new batch at the END, which
// only lengthens the queues: days already flown keep exactly the questions they had.

export const ROTATION_START = '2026-11-12';

// Retired from the Daily Flight because Book Club asks the same thing.
const RETIRED = new Set([
  'd18', 'd33', 'd37', 'd40', 'h416', 'h418', 'h419', 'h512', 'h516', 'h519',
  'h523', 'h602', 'h604', 'h605', 'h608', 'h611', 'h613', 'h617', 'h620',
]);

const BATCHES: RawQuestion[][] = [dailyQuestions.filter((q) => !RETIRED.has(q.id)), dailyBatch2];

export const dailyBank: RawQuestion[] = BATCHES.flat();

// A fixed, well-mixed order inside each batch, so neighbouring days don't share a topic.
function mix(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}

const queues = new Map<Level, RawQuestion[]>();
for (const batch of BATCHES) {
  for (const q of [...batch].sort((a, b) => mix(a.id) - mix(b.id))) queues.set(q.level, [...(queues.get(q.level) ?? []), q]);
}

export const dayIndex = (day: string) => {
  const [y, m, d] = day.split('-').map(Number);
  const [y0, m0, d0] = ROTATION_START.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y0, m0 - 1, d0)) / 86_400_000);
};

// The `count` questions a level gives on a given day.
export function takeFromQueue(level: Level, day: string, count: number): RawQuestion[] {
  const queue = queues.get(level) ?? [];
  const start = dayIndex(day) * count;
  return Array.from({ length: count }, (_, i) => queue[(start + i) % queue.length]);
}

// From ROTATION_START each level is a queue, so nothing repeats until a level runs out. The flight takes
// two level-6 questions a day from the front of its queue; the Gate change bonus, on the days it
// happens, takes one from the back, so the two never meet until the whole level has been flown.
export const PER_DAY: Record<Level, number> = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 2, 6: 2 };
const GATE_CHANCE = 0.4;

export const isGateDay = (day: string) => seeded(`flight-gate-${day}`)() < GATE_CHANCE;

export function dailyRotation(day: string) {
  return ([1, 2, 3, 4, 5, 6] as Level[]).flatMap((l) => takeFromQueue(l, day, PER_DAY[l]));
}

// The Gate change bonus for a day (null on days without one): a level-6 multiple-choice question.
export function dailySpare(day: string): ChoiceQuestion | null {
  if (day < ROTATION_START || !isGateDay(day)) return null;
  const choices = [...(queues.get(6) ?? [])].reverse().filter((q): q is ChoiceQuestion => q.kind !== 'order');
  const [y, m, d] = ROTATION_START.split('-').map(Number);
  let before = 0;
  for (let i = 0; i < dayIndex(day); i++) if (isGateDay(new Date(Date.UTC(y, m - 1, d + i)).toISOString().slice(0, 10))) before++;
  return choices[before % choices.length] ?? null;
}

// How many days each level lasts before its first repeat (for checking the bank's size).
export const daysOfCover = (perDay: Record<Level, number>) =>
  Object.fromEntries(([1, 2, 3, 4, 5, 6] as Level[]).map((l) => [l, Math.floor((queues.get(l)?.length ?? 0) / (perDay[l] + (l === 6 ? GATE_CHANCE : 0)))]));
