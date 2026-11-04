export type Book = {
  id: string;
  name: string;
  code: string; // three-letter "airport code" shown on stamps and boarding passes
  chapters: number;
  testament: 'OT' | 'NT';
  section: string;
};

const ot = (section: string, list: [string, string, string, number][]): Book[] =>
  list.map(([id, name, code, chapters]) => ({ id, name, code, chapters, testament: 'OT', section }));
const nt = (section: string, list: [string, string, string, number][]): Book[] =>
  list.map(([id, name, code, chapters]) => ({ id, name, code, chapters, testament: 'NT', section }));

export const books: Book[] = [
  ...ot('Law', [
    ['genesis', 'Genesis', 'GEN', 50], ['exodus', 'Exodus', 'EXO', 40], ['leviticus', 'Leviticus', 'LEV', 27],
    ['numbers', 'Numbers', 'NUM', 36], ['deuteronomy', 'Deuteronomy', 'DEU', 34],
  ]),
  ...ot('History', [
    ['joshua', 'Joshua', 'JOS', 24], ['judges', 'Judges', 'JDG', 21], ['ruth', 'Ruth', 'RUT', 4],
    ['1samuel', '1 Samuel', '1SA', 31], ['2samuel', '2 Samuel', '2SA', 24], ['1kings', '1 Kings', '1KI', 22],
    ['2kings', '2 Kings', '2KI', 25], ['1chronicles', '1 Chronicles', '1CH', 29], ['2chronicles', '2 Chronicles', '2CH', 36],
    ['ezra', 'Ezra', 'EZR', 10], ['nehemiah', 'Nehemiah', 'NEH', 13], ['esther', 'Esther', 'EST', 10],
  ]),
  ...ot('Poetry & Wisdom', [
    ['job', 'Job', 'JOB', 42], ['psalms', 'Psalms', 'PSA', 150], ['proverbs', 'Proverbs', 'PRO', 31],
    ['ecclesiastes', 'Ecclesiastes', 'ECC', 12], ['songofsolomon', 'Song of Solomon', 'SNG', 8],
  ]),
  ...ot('Major Prophets', [
    ['isaiah', 'Isaiah', 'ISA', 66], ['jeremiah', 'Jeremiah', 'JER', 52], ['lamentations', 'Lamentations', 'LAM', 5],
    ['ezekiel', 'Ezekiel', 'EZK', 48], ['daniel', 'Daniel', 'DAN', 12],
  ]),
  ...ot('Minor Prophets', [
    ['hosea', 'Hosea', 'HOS', 14], ['joel', 'Joel', 'JOL', 3], ['amos', 'Amos', 'AMO', 9], ['obadiah', 'Obadiah', 'OBA', 1],
    ['jonah', 'Jonah', 'JON', 4], ['micah', 'Micah', 'MIC', 7], ['nahum', 'Nahum', 'NAM', 3], ['habakkuk', 'Habakkuk', 'HAB', 3],
    ['zephaniah', 'Zephaniah', 'ZEP', 3], ['haggai', 'Haggai', 'HAG', 2], ['zechariah', 'Zechariah', 'ZEC', 14],
    ['malachi', 'Malachi', 'MAL', 4],
  ]),
  ...nt('Gospels & Acts', [
    ['matthew', 'Matthew', 'MAT', 28], ['mark', 'Mark', 'MRK', 16], ['luke', 'Luke', 'LUK', 24], ['john', 'John', 'JHN', 21],
    ['acts', 'Acts', 'ACT', 28],
  ]),
  ...nt("Paul's Letters", [
    ['romans', 'Romans', 'ROM', 16], ['1corinthians', '1 Corinthians', '1CO', 16], ['2corinthians', '2 Corinthians', '2CO', 13],
    ['galatians', 'Galatians', 'GAL', 6], ['ephesians', 'Ephesians', 'EPH', 6], ['philippians', 'Philippians', 'PHP', 4],
    ['colossians', 'Colossians', 'COL', 4], ['1thessalonians', '1 Thessalonians', '1TH', 5], ['2thessalonians', '2 Thessalonians', '2TH', 3],
    ['1timothy', '1 Timothy', '1TI', 6], ['2timothy', '2 Timothy', '2TI', 4], ['titus', 'Titus', 'TIT', 3], ['philemon', 'Philemon', 'PHM', 1],
  ]),
  ...nt('General Letters & Revelation', [
    ['hebrews', 'Hebrews', 'HEB', 13], ['james', 'James', 'JAS', 5], ['1peter', '1 Peter', '1PE', 5], ['2peter', '2 Peter', '2PE', 3],
    ['1john', '1 John', '1JN', 5], ['2john', '2 John', '2JN', 1], ['3john', '3 John', '3JN', 1], ['jude', 'Jude', 'JUD', 1],
    ['revelation', 'Revelation', 'REV', 22],
  ]),
];

export const bookById = (id: string) => books.find((b) => b.id === id);
