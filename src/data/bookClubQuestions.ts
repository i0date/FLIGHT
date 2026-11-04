import type { RawQuestion } from '../types';
import { deuteronomy, exodus, genesis, leviticus, numbers } from './bookclub/law';
import { esther, joshua, judges, ruth, samuel1 } from './bookclub/history';
import { daniel, isaiah, jonah } from './bookclub/prophets';
import { acts, john, luke, mark, matthew } from './bookclub/gospels';
import { corinthians1, ephesians, galatians, hebrews, james, peter1, philippians, revelation, romans } from './bookclub/letters';
import { job, proverbs, psalms } from './bookclub/wisdom';

// Book Club: 21 questions per book, flown as 3 legs of 7 that climb in difficulty.
// A passport stamp needs all three legs flown and at least 15 of 21 correct.
// Books without a set yet show as "Soon" in the passport.
export const bookClubQuestions: Record<string, RawQuestion[]> = {
  genesis, exodus, leviticus, numbers, deuteronomy, joshua, judges, ruth, '1samuel': samuel1, esther, job, psalms, proverbs,
  isaiah, daniel, jonah, matthew, mark, luke, john, acts, romans, '1corinthians': corinthians1, galatians, ephesians,
  philippians, hebrews, james, '1peter': peter1, revelation,
};

export const LEG_SIZE = 7;
export const LEGS = [
  { name: 'Departure', blurb: 'Know the book' },
  { name: 'Cruise', blurb: 'Know the details' },
  { name: 'Final approach', blurb: 'Scholar level' },
];
export const STAMP_PASS = 15;
export const STAMP_TOTAL = LEG_SIZE * LEGS.length;

export const legQuestions = (bookId: string, leg: number) => bookClubQuestions[bookId]?.slice(leg * LEG_SIZE, (leg + 1) * LEG_SIZE) ?? [];
