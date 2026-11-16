import { describe, expect, it } from 'vitest';
import { MILES, milesFor, recentMiles, statusFor } from '../src/lib/miles';
import { traveller } from './helpers';

describe('Miles and status', () => {
  it('pays for each flight, each right answer and the best streak', () => {
    const p = traveller({ daily: { '2026-11-01': 7, '2026-11-02': 10 }, bestStreak: 2, gateChanges: { '2026-11-01': true, '2026-11-02': false } });
    expect(milesFor(p)).toBe(2 * MILES.perDailyFlight + 17 * MILES.perDailyCorrect + 2 * MILES.perBestStreakDay + MILES.perGateChange);
  });

  it('counts only the last 90 days towards keeping status', () => {
    const p = traveller({ daily: { '2026-01-01': 10, '2026-11-01': 10 } });
    expect(recentMiles(p, '2026-11-10')).toBe(MILES.perDailyFlight + 10 * MILES.perDailyCorrect);
  });

  it('reaches Gold with lifetime miles, but keeps it only with recent flying', () => {
    // 20 perfect flights long ago: plenty of lifetime miles, none recent.
    const old = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`2025-0${1 + Math.floor(i / 10)}-${10 + (i % 10)}`, 10]));
    const lapsed = traveller({ daily: old });
    expect(milesFor(lapsed)).toBeGreaterThanOrEqual(20_000);
    expect(statusFor(lapsed, '2026-11-10').tier.name).toBe('Silver');
    const recent = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`2026-10-${String(10 + i).padStart(2, '0')}`, 10]));
    expect(statusFor(traveller({ daily: recent }), '2026-11-10').tier.name).toBe('Gold');
  });
});
