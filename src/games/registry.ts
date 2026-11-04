import type { Screen } from '../types';

// Every game lives behind a "gate". To add a new game (e.g. the crossword):
// build its screen, add a Screen variant in types.ts, route it in App.tsx,
// then list it here with status 'live'.
export type Gate = {
  id: string;
  gate: string;
  title: string;
  blurb: string;
  status: 'live' | 'soon';
  premium?: boolean;
  screen?: Screen;
};

export const gates: Gate[] = [
  { id: 'daily', gate: 'A1', title: 'Daily Flight', blurb: '10 questions on passages, books & themes. Keeps your streak alive.', status: 'live', screen: { name: 'daily' } },
  { id: 'bookclub', gate: 'B4', title: 'Book Club', blurb: 'Studying a book? 5 tough questions that climb in difficulty.', status: 'live', screen: { name: 'bookclub' } },
  { id: 'crossword', gate: 'C2', title: 'Crossword', blurb: 'Scripture crossword. Arriving soon.', status: 'soon' },
];
