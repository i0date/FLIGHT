import type { Profile } from '../src/lib/profile';

export const traveller = (over: Partial<Profile> = {}): Profile => ({
  name: 'Traveller', premium: false, streak: 0, bestStreak: 0, lastDaily: null, shields: 0, shieldWeek: null,
  shieldAuto: true, daily: {}, bookClub: {}, joinedBooks: [], onLeaderboard: true, nightFlights: {}, gateChanges: {},
  homeChurch: '', photoUpdatedAt: null, ...over,
});

// Fly the Daily Flight on each of these days, in order.
export const flyDays = (p: Profile, days: string[], record: (p: Profile, score: number, day: string) => Profile) =>
  days.reduce((acc, day) => record(acc, 7, day), p);

// Consecutive day keys starting at `start` (YYYY-MM-DD).
export const daysFrom = (start: string, n: number) => {
  const [y, m, d] = start.split('-').map(Number);
  return Array.from({ length: n }, (_, i) => new Date(Date.UTC(y, m - 1, d + i)).toISOString().slice(0, 10));
};
