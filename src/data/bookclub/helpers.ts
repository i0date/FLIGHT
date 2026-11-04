import type { ChoiceQuestion, Level, OrderQuestion } from '../../types';

// Short constructors so each book's 21 questions read as a list.
export const c = (id: string, level: Level, q: string, a: string, wrong: [string, string, string], ref: string, note?: string): ChoiceQuestion => ({ id, level, q, a, wrong, ref, note });

export const o = (id: string, level: Level, q: string, order: string[], ref: string, note?: string): OrderQuestion => ({ id, level, kind: 'order', q, order, ref, note });
