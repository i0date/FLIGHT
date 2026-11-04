// A question as authored in the data files. The correct answer is kept apart
// from the wrong ones so options can be shuffled safely at runtime.
export type RawQuestion = {
  id: string;
  q: string;
  a: string;
  wrong: [string, string, string];
  ref: string;
  note?: string;
  cat?: 'Passages' | 'Books' | 'Themes' | 'People';
};

// A question ready to be played: options shuffled, answer as an index.
export type PlayQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  ref: string;
  note?: string;
  tag?: string;
};

export type Screen =
  | { name: 'home' }
  | { name: 'daily' }
  | { name: 'bookclub' }
  | { name: 'book'; bookId: string }
  | { name: 'leaderboard' }
  | { name: 'premium' };
