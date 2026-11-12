import type { RawQuestion } from '../types';
import { LEG_SIZE } from './bookClubRules';
import { deuteronomy, exodus, genesis, leviticus, numbers } from './bookclub/law';
import { chronicles1, chronicles2, esther, ezra, joshua, judges, kings1, kings2, nehemiah, ruth, samuel1, samuel2 } from './bookclub/history';
import { amos, daniel, ezekiel, habakkuk, haggai, hosea, isaiah, jeremiah, joel, jonah, malachi, micah, nahum, obadiah, zechariah, zephaniah } from './bookclub/prophets';
import { acts, john, luke, mark, matthew } from './bookclub/gospels';
import { colossians, corinthians1, corinthians2, ephesians, galatians, hebrews, james, john1, john2, john3, jude, peter1, peter2, philemon, philippians, revelation, romans, thessalonians1, thessalonians2, timothy1, timothy2, titus } from './bookclub/letters';
import { ecclesiastes, job, lamentations, proverbs, psalms, songOfSolomon } from './bookclub/wisdom';

// Book Club's questions, 21 per book (the rules are in bookClubRules.ts).
export const bookClubQuestions: Record<string, RawQuestion[]> = {
  genesis, exodus, leviticus, numbers, deuteronomy, joshua, judges, ruth, '1samuel': samuel1, '2samuel': samuel2,
  '1kings': kings1, '2kings': kings2, '1chronicles': chronicles1, '2chronicles': chronicles2, ezra, nehemiah, esther, job, psalms, proverbs, ecclesiastes, songofsolomon: songOfSolomon, isaiah, jeremiah, lamentations,
  ezekiel, daniel, hosea, joel, amos, obadiah, jonah, micah, nahum, habakkuk, zephaniah, haggai, zechariah, malachi,
  matthew, mark, luke, john, acts, romans, '1corinthians': corinthians1, '2corinthians': corinthians2, galatians,
  ephesians, philippians, colossians, '1thessalonians': thessalonians1, '2thessalonians': thessalonians2, '1timothy': timothy1, '2timothy': timothy2, titus, philemon, hebrews, james, '1peter': peter1, '2peter': peter2, '1john': john1, '2john': john2, '3john': john3, jude, revelation,
};

export const legQuestions = (bookId: string, leg: number) => bookClubQuestions[bookId]?.slice(leg * LEG_SIZE, (leg + 1) * LEG_SIZE) ?? [];

export { LEGS, LEG_SIZE, STAMP_PASS, STAMP_TOTAL } from './bookClubRules';
