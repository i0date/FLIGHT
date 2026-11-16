import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseRef } from '../src/lib/verses';
import { dailyBank } from '../src/data/dailyBank';
import { bookClubQuestions } from '../src/data/bookClubQuestions';

const short = (ref: string) => parseRef(ref).map((p) => `${p.book.id} ${p.chapter}:${p.from}-${p.to}`);

describe('Verse references', () => {
  it('reads the forms questions use', () => {
    expect(short('Genesis 5:3; 5:6')).toEqual(['genesis 5:3-3', 'genesis 5:6-6']);
    expect(short('Acts 9:3–8')).toEqual(['acts 9:3-8']);
    expect(short('Jonah 1:1; 2 Kings 14:25')).toEqual(['jonah 1:1-1', '2kings 14:25-25']);
    expect(short('Job 1:1, 1:20–22')).toEqual(['job 1:1-1', 'job 1:20-22']);
    expect(short('Joshua 13:14, 33')).toEqual(['joshua 13:14-14', 'joshua 13:33-33']);
    expect(short('Philemon 10–16')).toEqual(['philemon 1:10-16']);
    expect(short('Psalm 110:4')).toEqual(['psalms 110:4-4']);
  });

  it('leaves whole chapters and lists of books as references', () => {
    expect(short('Matthew 5–7')).toEqual([]);
    expect(short('Hosea to Malachi')).toEqual([]);
  });

  it('points every question at verses that exist', () => {
    const text = new Map<string, string[][]>();
    const book = (id: string) => text.get(id) ?? (text.set(id, JSON.parse(readFileSync(`src/data/kjv/${id}.json`, 'utf8'))), text.get(id)!);
    for (const q of [...dailyBank, ...Object.values(bookClubQuestions).flat()]) {
      for (const p of parseRef(q.ref)) {
        const chapter = book(p.book.id)[p.chapter - 1];
        expect(chapter?.[p.from - 1], `${q.id}: ${q.ref}`).toBeTruthy();
        expect(chapter?.[p.to - 1], `${q.id}: ${q.ref}`).toBeTruthy();
      }
    }
  });
});

describe('Book Club', () => {
  it('has 21 questions for each of the 66 books', () => {
    expect(Object.keys(bookClubQuestions)).toHaveLength(66);
    for (const [id, qs] of Object.entries(bookClubQuestions)) expect(qs, id).toHaveLength(21);
  });
});
