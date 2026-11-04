import type { PlayQuestion, RawQuestion } from '../types';

function hash(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

// Small deterministic PRNG so every traveller gets the same daily flight.
export function seeded(seed: string): () => number {
  let a = hash(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], rand: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function toPlay(raw: RawQuestion, rand: () => number = Math.random): PlayQuestion {
  const base = { id: raw.id, prompt: raw.q, level: raw.level, ref: raw.ref, note: raw.note, tag: raw.cat };
  if (raw.kind === 'order') {
    let options = shuffle(raw.order, rand);
    // Never hand out the items already in the right order.
    while (options.every((o, i) => o === raw.order[i])) options = shuffle(raw.order, rand);
    return { ...base, kind: 'order', options, answer: -1, order: raw.order, tag: raw.cat ?? 'Order' };
  }
  const options = shuffle([raw.a, ...raw.wrong], rand);
  return { ...base, kind: 'choice', options, answer: options.indexOf(raw.a), order: [] };
}
