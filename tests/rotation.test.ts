import { describe, expect, it } from 'vitest';
import { PER_DAY, ROTATION_START, dailyBank, dailyRotation, dailySpare, daysOfCover } from '../src/data/dailyBank';
import { daysFrom } from './helpers';

describe('Daily Flight rotation', () => {
  it('gives ten questions a day that climb through the levels', () => {
    for (const day of daysFrom(ROTATION_START, 30)) {
      expect(dailyRotation(day).map((q) => q.level)).toEqual([1, 2, 3, 3, 4, 4, 5, 5, 6, 6]);
    }
  });

  it('never repeats a question, flight or Gate change bonus, until a level runs out', () => {
    const days = Math.min(...Object.values(daysOfCover(PER_DAY)));
    expect(days).toBeGreaterThanOrEqual(75);
    const seen = new Set<string>();
    for (const day of daysFrom(ROTATION_START, days)) {
      const spare = dailySpare(day);
      for (const q of [...dailyRotation(day), ...(spare ? [spare] : [])]) {
        expect(seen.has(q.id), `${q.id} came back on ${day}`).toBe(false);
        seen.add(q.id);
      }
    }
  });

  // Days already flown must keep their questions when new batches are added.
  it('keeps the questions of days already flown', () => {
    expect(dailyRotation('2026-11-12').map((q) => q.id)).toMatchSnapshot();
    expect(dailyRotation('2026-11-14').map((q) => q.id)).toMatchSnapshot();
    expect(daysFrom(ROTATION_START, 4).map((d) => dailySpare(d)?.id ?? null)).toMatchSnapshot();
  });

  it('has well-formed questions with unique ids', () => {
    const ids = new Set<string>();
    for (const q of dailyBank) {
      expect(ids.has(q.id), `duplicate id ${q.id}`).toBe(false);
      ids.add(q.id);
      if (q.kind === 'order') {
        expect(new Set(q.order).size).toBe(q.order.length);
      } else {
        expect(q.wrong).toHaveLength(3);
        expect(new Set([q.a, ...q.wrong]).size, q.id).toBe(4);
      }
    }
  });
});
