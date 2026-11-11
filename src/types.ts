export type Level = 1 | 2 | 3 | 4 | 5 | 6;

type BaseQuestion = {
  id: string;
  level: Level;
  q: string;
  ref: string;
  note?: string;
  cat?: 'Passages' | 'Books' | 'Themes' | 'People' | 'Places' | 'Connections' | 'Order';
};

// Pick one answer. The correct answer is kept apart from the wrong ones so
// options can be shuffled safely at runtime.
export type ChoiceQuestion = BaseQuestion & { kind?: 'choice'; a: string; wrong: [string, string, string] };

// Put the items in order. `order` is written in the correct sequence.
export type OrderQuestion = BaseQuestion & { kind: 'order'; order: string[] };

export type RawQuestion = ChoiceQuestion | OrderQuestion;

// A question ready to be played: options shuffled.
export type PlayQuestion = {
  id: string;
  kind: 'choice' | 'order';
  prompt: string;
  options: string[];
  answer: number; // choice: index of the correct option
  order: string[]; // order: the correct sequence
  level: Level;
  ref: string;
  note?: string;
  tag?: string;
};

export type Screen =
  | { name: 'home' }
  | { name: 'daily' }
  | { name: 'bookclub' }
  | { name: 'book'; bookId: string }
  | { name: 'passport' }
  | { name: 'night' }
  | { name: 'archive' }
  | { name: 'practice' }
  | { name: 'leaderboard'; crewId?: string }
  | { name: 'premium' }
  | { name: 'connecting'; code?: string }
  | { name: 'privacy' }
  | { name: 'terms' }
  | { name: 'unsubscribe'; token: string }
  | { name: 'owner' };
