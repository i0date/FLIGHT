import { books } from '../data/books';
import type { Profile } from './profile';

// Frequent Flyer miles are earned, never bought, and worked out from what you've flown.
export const MILES = {
  perDailyFlight: 250,
  perDailyCorrect: 100,
  perBookLeg: 300,
  perBookCorrect: 150,
  perStampEarned: 1_500,
  perNightCorrect: 200,
  perBestStreakDay: 50,
};

export function milesFor(p: Profile): number {
  const daily = Object.values(p.daily).reduce((sum, score) => sum + MILES.perDailyFlight + score * MILES.perDailyCorrect, 0);
  const book = Object.values(p.bookClub).reduce(
    (sum, r) => sum + r.legs.reduce<number>((s, l) => s + (l === null ? 0 : MILES.perBookLeg + l * MILES.perBookCorrect), 0) + (r.earnedAt ? MILES.perStampEarned : 0),
    0,
  );
  const night = Object.values(p.nightFlights).reduce((sum, score) => sum + score * MILES.perNightCorrect, 0);
  return daily + book + night + p.bestStreak * MILES.perBestStreakDay;
}

export const TIERS = [
  { name: 'Blue', from: 0, color: '#8fb8d8' },
  { name: 'Silver', from: 5_000, color: '#b9c0ca' },
  { name: 'Gold', from: 20_000, color: '#f2b544' },
  { name: 'Platinum', from: 50_000, color: '#dfe6ee' },
];

export function tierFor(miles: number) {
  const index = TIERS.filter((t) => miles >= t.from).length - 1;
  return { tier: TIERS[index], next: TIERS[index + 1] ?? null };
}

// Visas: book visas need stamps (Flight Club); streak visas are free for everyone.
type Visa = { id: string; name: string; detail: string; earned: (p: Profile) => boolean; needsStamps: boolean };
const sectionDone = (p: Profile, sections: string[]) =>
  books.filter((b) => sections.includes(b.section)).every((b) => p.premium && p.bookClub[b.id]?.earnedAt);

export const VISAS: Visa[] = [
  { id: 'streak7', name: 'Week Flyer', detail: '7-day streak', earned: (p) => p.bestStreak >= 7, needsStamps: false },
  { id: 'streak30', name: 'Month Flyer', detail: '30-day streak', earned: (p) => p.bestStreak >= 30, needsStamps: false },
  { id: 'streak100', name: 'Centurion', detail: '100-day streak', earned: (p) => p.bestStreak >= 100, needsStamps: false },
  { id: 'law', name: 'Pentateuch', detail: 'Stamp all 5 books of the Law', earned: (p) => sectionDone(p, ['Law']), needsStamps: true },
  { id: 'gospels', name: 'Gospels', detail: 'Stamp Matthew to Acts', earned: (p) => sectionDone(p, ['Gospels & Acts']), needsStamps: true },
  { id: 'wisdom', name: 'Wisdom', detail: 'Stamp Job to Song of Solomon', earned: (p) => sectionDone(p, ['Poetry & Wisdom']), needsStamps: true },
  { id: 'prophets', name: 'Prophets', detail: 'Stamp all 17 prophets', earned: (p) => sectionDone(p, ['Major Prophets', 'Minor Prophets']), needsStamps: true },
  { id: 'paul', name: "Paul's Letters", detail: 'Stamp Romans to Philemon', earned: (p) => sectionDone(p, ["Paul's Letters"]), needsStamps: true },
  { id: 'canon', name: 'Whole Canon', detail: 'Stamp all 66 books', earned: (p) => books.every((b) => p.premium && p.bookClub[b.id]?.earnedAt), needsStamps: true },
];
