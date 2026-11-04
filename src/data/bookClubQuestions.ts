import type { RawQuestion } from '../types';
import { deuteronomy, exodus, genesis, leviticus, numbers } from './bookclub/law';
import { esther, ezra, joshua, judges, kings1, kings2, nehemiah, ruth, samuel1, samuel2 } from './bookclub/history';
import { amos, daniel, ezekiel, hosea, isaiah, jeremiah, jonah, malachi, micah } from './bookclub/prophets';
import { acts, john, luke, mark, matthew } from './bookclub/gospels';
import { colossians, corinthians1, corinthians2, ephesians, galatians, hebrews, james, john1, peter1, philippians, revelation, romans, thessalonians1, timothy1, timothy2 } from './bookclub/letters';
import { ecclesiastes, job, proverbs, psalms } from './bookclub/wisdom';

// Book Club: 21 questions per book, flown as 3 legs of 7 that climb in difficulty.
// A passport stamp needs all three legs flown and at least 15 of 21 correct.
// Books without a set yet show as "Soon" in the passport.
export const bookClubQuestions: Record<string, RawQuestion[]> = {
  genesis, exodus, leviticus, numbers, deuteronomy, joshua, judges, ruth, '1samuel': samuel1, '2samuel': samuel2,
  '1kings': kings1, '2kings': kings2, ezra, nehemiah, esther, job, psalms, proverbs, ecclesiastes, isaiah, jeremiah,
  ezekiel, daniel, hosea, amos, jonah, micah, malachi,
  matthew, mark, luke, john, acts, romans, '1corinthians': corinthians1, '2corinthians': corinthians2, galatians,
  ephesians, philippians, colossians, '1thessalonians': thessalonians1, '1timothy': timothy1, '2timothy': timothy2, hebrews, james, '1peter': peter1, '1john': john1, revelation,
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
