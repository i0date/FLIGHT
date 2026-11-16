import { books } from '../data/books';

// The KJV text behind a question's reference ("Genesis 5:3; 5:6", "Acts 9:3–8", "Jonah 1:1; 2 Kings 14:25").
// Each book is its own file, fetched the first time a question from it comes up and then kept offline.

type Chapters = string[][];
export type Passage = { label: string; verses: { n: number; text: string }[] };

let files: Record<string, () => Promise<Chapters>> | undefined;
const loaded = new Map<string, Promise<Chapters>>();

function bookText(id: string): Promise<Chapters> {
  files ??= import.meta.glob<Chapters>('../data/kjv/*.json', { import: 'default' });
  const load = files[`../data/kjv/${id}.json`];
  if (!load) return Promise.reject(new Error(`No text for ${id}`));
  if (!loaded.has(id)) loaded.set(id, load().catch((e) => (loaded.delete(id), Promise.reject(e))));
  return loaded.get(id)!;
}

const byName = new Map(books.map((b) => [b.name.toLowerCase(), b]));
byName.set('psalm', byName.get('psalms')!);

const MAX_VERSES = 8;

// "1 Kings 7:23; 7:25" → [{ book, chapter: 7, from: 23, to: 23 }, { book, chapter: 7, from: 25, to: 25 }].
// Also "Job 1:1, 1:20–22", "Joshua 13:14, 33" and, for one-chapter books, "Philemon 10–16".
export function parseRef(ref: string) {
  const parts: { book: (typeof books)[number]; chapter: number; from: number; to: number }[] = [];
  let book: (typeof books)[number] | undefined;
  let chapter = 0;
  let afterComma = false;
  for (const raw of ref.split(/([;,])/)) {
    if (raw === ',' || raw === ';') {
      afterComma = raw === ',';
      continue;
    }
    const part = raw.trim().replace(/[–—]/g, '-');
    const m = part.match(/^(?:((?:[123] )?[A-Za-z][A-Za-z ]*?)\s+)?(\d+)(?::(\d+))?(?:-(\d+))?$/);
    if (!m) {
      book = undefined;
      continue;
    }
    const named = m[1] ? byName.get(m[1].toLowerCase()) : undefined;
    if (m[1]) book = named;
    if (!book) continue;
    let from: number;
    if (m[3]) {
      chapter = Number(m[2]);
      from = Number(m[3]);
    } else if (book.chapters === 1) {
      chapter = 1;
      from = Number(m[2]);
    } else if (!m[1] && chapter && afterComma) {
      from = Number(m[2]); // "Joshua 13:14, 33": a verse in the same chapter
    } else continue; // A whole chapter is too long to show; the reference still is.
    parts.push({ book, chapter, from, to: m[4] ? Number(m[4]) : from });
  }
  return parts;
}

export async function passages(ref: string): Promise<Passage[]> {
  const out: Passage[] = [];
  let shown = 0;
  for (const p of parseRef(ref)) {
    if (shown >= MAX_VERSES) break;
    const chapter = (await bookText(p.book.id))[p.chapter - 1];
    if (!chapter) continue;
    const verses = [];
    for (let n = p.from; n <= p.to && shown < MAX_VERSES; n++, shown++) if (chapter[n - 1]) verses.push({ n, text: chapter[n - 1] });
    if (verses.length) out.push({ label: `${p.book.name === 'Psalms' ? 'Psalm' : p.book.name} ${p.chapter}:${p.from}${p.to > p.from ? `–${Math.min(p.to, verses[verses.length - 1].n)}` : ''}`, verses });
  }
  return out;
}

// Start fetching a question's book early, so the verse is ready when the answer is shown.
export function prefetchRef(ref: string) {
  for (const p of parseRef(ref)) bookText(p.book.id).catch(() => undefined);
}
