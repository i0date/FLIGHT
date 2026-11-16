import { describe, expect, it } from 'vitest';
import { MAX_SHIELDS, grantWeeklyShield, liveStreak, recordDaily, spendShields, streakStatus } from '../src/lib/profile';
import { weekKey } from '../src/lib/dates';
import { daysFrom, flyDays, traveller } from './helpers';

describe('Daily Flight streak', () => {
  it('starts at one and grows by a day at a time', () => {
    const p = flyDays(traveller(), daysFrom('2026-11-01', 5), recordDaily);
    expect(p.streak).toBe(5);
    expect(p.bestStreak).toBe(5);
    expect(p.lastDaily).toBe('2026-11-05');
  });

  it('counts a day once, however often it is flown', () => {
    const once = recordDaily(traveller(), 9, '2026-11-01');
    const twice = recordDaily(once, 2, '2026-11-01');
    expect(twice).toBe(once);
    expect(twice.daily['2026-11-01']).toBe(9);
  });

  it('starts again after a missed day with no shields, keeping the best', () => {
    let p = flyDays(traveller(), daysFrom('2026-11-01', 4), recordDaily);
    p = recordDaily(p, 5, '2026-11-06');
    expect(p.streak).toBe(1);
    expect(p.bestStreak).toBe(4);
  });

  it('shows a lapsed streak as zero, and a waiting one as itself', () => {
    const p = flyDays(traveller(), daysFrom('2026-11-01', 3), recordDaily);
    expect(liveStreak(p, '2026-11-04')).toBe(3);
    expect(liveStreak(p, '2026-11-05')).toBe(0);
  });
});

describe('Streak shields', () => {
  it('cover missed days automatically, one shield per day', () => {
    let p = flyDays(traveller({ shields: 2 }), daysFrom('2026-11-01', 3), recordDaily);
    expect(liveStreak(p, '2026-11-06')).toBe(3);
    expect(streakStatus(p, '2026-11-06')?.kind).toBe('shielded');
    p = recordDaily(p, 6, '2026-11-06');
    expect(p.streak).toBe(4);
    expect(p.shields).toBe(0);
  });

  it('do not cover more days than are held', () => {
    let p = flyDays(traveller({ shields: 1 }), daysFrom('2026-11-01', 3), recordDaily);
    expect(streakStatus(p, '2026-11-06')?.kind).toBe('missed');
    p = recordDaily(p, 6, '2026-11-06');
    expect(p.streak).toBe(1);
    expect(p.shields).toBe(1);
  });

  it('wait for the traveller when automatic use is off', () => {
    const p = flyDays(traveller({ shields: 1, shieldAuto: false }), daysFrom('2026-11-01', 3), recordDaily);
    expect(streakStatus(p, '2026-11-05')?.kind).toBe('rescue');
    // Flying without using one starts again...
    expect(recordDaily(p, 5, '2026-11-05').streak).toBe(1);
    // ...using one first keeps the streak.
    const saved = spendShields(p, '2026-11-05');
    expect(saved.shields).toBe(0);
    expect(saved.lastDaily).toBe('2026-11-04');
    expect(recordDaily(saved, 5, '2026-11-05').streak).toBe(4);
  });

  it('are earned at every 30 days, up to three', () => {
    const p = flyDays(traveller({ shields: MAX_SHIELDS - 1 }), daysFrom('2026-01-01', 60), recordDaily);
    expect(p.streak).toBe(60);
    expect(p.shields).toBe(MAX_SHIELDS);
  });

  it('come weekly for Frequent Flyers only, once a week', () => {
    expect(grantWeeklyShield(traveller()).shields).toBe(0);
    const once = grantWeeklyShield(traveller({ premium: true }));
    expect(once.shields).toBe(1);
    expect(once.shieldWeek).toBe(weekKey());
    expect(grantWeeklyShield(once).shields).toBe(1);
    expect(grantWeeklyShield(traveller({ premium: true, shields: MAX_SHIELDS })).shields).toBe(MAX_SHIELDS);
  });
});
