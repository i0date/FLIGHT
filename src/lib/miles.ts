import { books } from '../data/books';
import { dayKey, weekMonday } from './dates';
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
  perGateChange: 500,
};

export function milesFor(p: Profile): number {
  const daily = Object.values(p.daily).reduce((sum, score) => sum + MILES.perDailyFlight + score * MILES.perDailyCorrect, 0);
  const book = Object.values(p.bookClub).reduce(
    (sum, r) => sum + r.legs.reduce<number>((s, l) => s + (l === null ? 0 : MILES.perBookLeg + l * MILES.perBookCorrect), 0) + (r.earnedAt ? MILES.perStampEarned : 0),
    0,
  );
  const night = Object.values(p.nightFlights).reduce((sum, score) => sum + score * MILES.perNightCorrect, 0);
  const gate = Object.values(p.gateChanges).filter(Boolean).length * MILES.perGateChange;
  return daily + book + night + gate + p.bestStreak * MILES.perBestStreakDay;
}

// Status, like an airline's: reach a tier with lifetime miles, and keep Gold or Platinum by flying
// enough in the last 90 days. Lifetime miles never go down; status can.
export const STATUS_DAYS = 90;
export type Tier = { name: string; from: number; keep: number; color: string };
export const TIERS: Tier[] = [
  { name: 'Blue', from: 0, keep: 0, color: '#8fb8d8' },
  { name: 'Silver', from: 5_000, keep: 0, color: '#b9c0ca' },
  { name: 'Gold', from: 20_000, keep: 15_000, color: '#f2b544' },
  { name: 'Platinum', from: 50_000, keep: 40_000, color: '#dfe6ee' },
];

// Miles from flights in the last STATUS_DAYS days, today included. Book Club legs count by the day the
// book was last flown, stamps by the day they were earned; best-streak miles are lifetime only.
export function recentMiles(p: Profile, today = dayKey()): number {
  const [y, m, d] = today.split('-').map(Number);
  const since = dayKey(new Date(y, m - 1, d - (STATUS_DAYS - 1)));
  const daily = Object.entries(p.daily).reduce((sum, [day, score]) => (day >= since ? sum + MILES.perDailyFlight + score * MILES.perDailyCorrect : sum), 0);
  const book = Object.values(p.bookClub).reduce(
    (sum, r) =>
      sum +
      (r.lastFlown >= since ? r.legs.reduce<number>((s, l) => s + (l === null ? 0 : MILES.perBookLeg + l * MILES.perBookCorrect), 0) : 0) +
      (r.earnedAt && r.earnedAt >= since ? MILES.perStampEarned : 0),
    0,
  );
  const night = Object.entries(p.nightFlights).reduce((sum, [week, score]) => (weekMonday(week) >= since ? sum + score * MILES.perNightCorrect : sum), 0);
  const gate = Object.entries(p.gateChanges).filter(([day, ok]) => ok && day >= since).length * MILES.perGateChange;
  return daily + book + night + gate;
}

export function statusFor(p: Profile, today = dayKey()) {
  const lifetime = milesFor(p);
  const recent = recentMiles(p, today);
  const index = TIERS.filter((t) => lifetime >= t.from && recent >= t.keep).length - 1;
  return { tier: TIERS[index], next: TIERS[index + 1] ?? null, lifetime, recent };
}

// Visas: book visas need stamps (Frequent Flyers); streak visas are free for everyone.
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
