import { dayKey } from './dates';

// The review flight: questions you missed come back two days later, and again a week after you get them
// right, then retire. Spacing them out like this is what makes them stick. Kept on this device.

const KEY = 'flight-review';
const FIRST_GAP = 2;
const SECOND_GAP = 7;
export const REVIEW_SIZE = 10;

type Card = { box: 1 | 2; due: string };
type Cards = Record<string, Card>;

function load(): Cards {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
}

function save(cards: Cards) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cards));
  } catch {
    // Storage blocked: the review flight just stays empty.
  }
}

const later = (today: string, days: number) => {
  const [y, m, d] = today.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + days));
};

// Any flight: a miss goes into review. A right answer elsewhere leaves a question's review as it is.
export function noteAnswer(id: string, ok: boolean, today = dayKey()) {
  if (ok) return;
  const cards = load();
  cards[id] = { box: 1, due: later(today, FIRST_GAP) };
  save(cards);
}

// The review flight itself: right moves a question on (or retires it), wrong sends it back to the start.
export function noteReview(id: string, ok: boolean, today = dayKey()) {
  const cards = load();
  const card = cards[id];
  if (!ok) cards[id] = { box: 1, due: later(today, FIRST_GAP) };
  else if (card?.box === 1) cards[id] = { box: 2, due: later(today, SECOND_GAP) };
  else delete cards[id];
  save(cards);
}

// Questions due today or earlier, oldest first.
export function dueForReview(today = dayKey()): string[] {
  return Object.entries(load())
    .filter(([, c]) => c.due <= today)
    .sort(([, a], [, b]) => a.due.localeCompare(b.due))
    .map(([id]) => id);
}

export const waitingForReview = () => Object.keys(load()).length;
