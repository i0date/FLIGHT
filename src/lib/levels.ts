import type { Level } from '../types';

// Difficulty is altitude: each level asks for a different kind of thinking.
export const LEVELS: Record<Level, { name: string; ft: number; skill: string }> = {
  1: { name: 'Take-off', ft: 5_000, skill: 'Recall' },
  2: { name: 'Climb', ft: 12_000, skill: 'Context' },
  3: { name: 'Cruise', ft: 24_000, skill: 'Connections' },
  4: { name: 'High altitude', ft: 33_000, skill: 'Sequence & detail' },
  5: { name: 'Ceiling', ft: 41_000, skill: 'Synthesis' },
  6: { name: 'Stratosphere', ft: 51_000, skill: 'Scholar' },
};

export const formatFt = (ft: number) => `${ft.toLocaleString('en-GB')} ft`;
