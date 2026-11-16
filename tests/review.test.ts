import { beforeEach, describe, expect, it } from 'vitest';
import { dueForReview, noteAnswer, noteReview, waitingForReview } from '../src/lib/review';

const store = new Map<string, string>();
globalThis.localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: () => null,
  length: 0,
} as Storage;

describe('Review flight', () => {
  beforeEach(() => store.clear());

  it('brings a missed question back two days later', () => {
    noteAnswer('k101', false, '2026-11-10');
    noteAnswer('k102', true, '2026-11-10');
    expect(dueForReview('2026-11-11')).toEqual([]);
    expect(dueForReview('2026-11-12')).toEqual(['k101']);
  });

  it('asks once more a week after a right answer, then retires it', () => {
    noteAnswer('k101', false, '2026-11-10');
    noteReview('k101', true, '2026-11-12');
    expect(dueForReview('2026-11-18')).toEqual([]);
    expect(dueForReview('2026-11-19')).toEqual(['k101']);
    noteReview('k101', true, '2026-11-19');
    expect(waitingForReview()).toBe(0);
  });

  it('starts a question over when it is missed again', () => {
    noteAnswer('k101', false, '2026-11-10');
    noteReview('k101', true, '2026-11-12');
    noteReview('k101', false, '2026-11-19');
    expect(dueForReview('2026-11-21')).toEqual(['k101']);
  });
});
