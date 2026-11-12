// Book Club: 21 questions per book, flown as 3 legs of 7 that climb in difficulty.
// A passport stamp needs all three legs flown and at least 15 of 21 correct.
// Kept apart from the questions so screens that only need the rules don't download them.
export const LEG_SIZE = 7;
export const LEGS = [
  { name: 'Departure', blurb: 'Know the book' },
  { name: 'Cruise', blurb: 'Know the details' },
  { name: 'Final approach', blurb: 'Scholar level' },
];
export const STAMP_PASS = 15;
export const STAMP_TOTAL = LEG_SIZE * LEGS.length;
