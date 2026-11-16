// Writes the King James Version into src/data/kjv/<book>.json (one file per book: chapters of verses),
// so the app can show the verse behind every question. The KJV is in the public domain.
// Usage: node scripts/build-kjv.mjs path/to/en_kjv.json   (from github.com/thiagobodruk/bible)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const source = process.argv[2];
if (!source) throw new Error('Pass the path to en_kjv.json');
const bible = JSON.parse(readFileSync(source, 'utf8').replace(/^﻿/, ''));
const ids = [...readFileSync(new URL('../src/data/books.ts', import.meta.url), 'utf8').matchAll(/\['([a-z0-9]+)', '[^']+', '[A-Z0-9]{3}', (\d+)\]/g)];
if (bible.length !== 66 || ids.length !== 66) throw new Error(`Expected 66 books, got ${bible.length} and ${ids.length}`);

// The source leaves a space before punctuation after small-capital words ("the LORD , even").
const tidy = (v) => v.replace(/\s+([,;:.?!)])/g, '$1').trim();

mkdirSync(new URL('../src/data/kjv/', import.meta.url), { recursive: true });
bible.forEach((book, i) => {
  const [, id, chapters] = ids[i];
  if (book.chapters.length !== Number(chapters)) throw new Error(`${id}: ${book.chapters.length} chapters, books.ts says ${chapters}`);
  writeFileSync(new URL(`../src/data/kjv/${id}.json`, import.meta.url), JSON.stringify(book.chapters.map((c) => c.map(tidy))));
});
console.log('Wrote 66 books');
