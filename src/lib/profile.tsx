import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { dayKey, daysBetween, weekKey } from './dates';

export type Crew = { id: string; name: string; code: string; createdAt: string };

export type Profile = {
  name: string;
  premium: boolean;
  streak: number;
  bestStreak: number;
  lastDaily: string | null;
  shieldUsedWeek: string | null;
  daily: Record<string, number>; // dayKey -> score out of 10
  bookClub: Record<string, { best: number; completedAt: string; attempts: number }>;
  joinedBooks: string[];
  crews: Crew[];
};

const KEY = 'flight.profile.v1';

const fresh: Profile = {
  name: 'Traveller',
  premium: false,
  streak: 0,
  bestStreak: 0,
  lastDaily: null,
  shieldUsedWeek: null,
  daily: {},
  bookClub: {},
  joinedBooks: [],
  crews: [],
};

function load(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...fresh, ...JSON.parse(raw) } : fresh;
  } catch {
    return fresh;
  }
}

// The streak shown on screen: it lapses once a full day has been missed
// (or two for First Class with an unused shield this week).
export function liveStreak(p: Profile, today = dayKey()): number {
  if (!p.lastDaily) return 0;
  const gap = daysBetween(p.lastDaily, today);
  if (gap <= 1) return p.streak;
  if (gap === 2 && p.premium && p.shieldUsedWeek !== weekKey()) return p.streak;
  return 0;
}

export function recordDaily(p: Profile, score: number, today = dayKey()): Profile {
  if (p.daily[today] !== undefined) return p;
  let streak = 1;
  let shieldUsedWeek = p.shieldUsedWeek;
  if (p.lastDaily) {
    const gap = daysBetween(p.lastDaily, today);
    if (gap === 1) streak = p.streak + 1;
    else if (gap === 2 && p.premium && p.shieldUsedWeek !== weekKey()) {
      streak = p.streak + 1;
      shieldUsedWeek = weekKey();
    }
  }
  return {
    ...p,
    streak,
    bestStreak: Math.max(p.bestStreak, streak),
    lastDaily: today,
    shieldUsedWeek,
    daily: { ...p.daily, [today]: score },
  };
}

export function recordBook(p: Profile, bookId: string, score: number): Profile {
  const prev = p.bookClub[bookId];
  return {
    ...p,
    bookClub: {
      ...p.bookClub,
      [bookId]: {
        best: Math.max(prev?.best ?? 0, score),
        completedAt: prev?.completedAt ?? dayKey(),
        attempts: (prev?.attempts ?? 0) + 1,
      },
    },
  };
}

type Ctx = { profile: Profile; update: (fn: (p: Profile) => Profile) => void };
const ProfileContext = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(profile));
    } catch {
      /* storage unavailable: progress lasts for this session only */
    }
  }, [profile]);
  return <ProfileContext.Provider value={{ profile, update: setProfile }}>{children}</ProfileContext.Provider>;
}

export function useProfile(): Ctx {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
