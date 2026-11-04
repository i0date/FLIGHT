import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { dayKey, daysBetween, weekKey } from './dates';
import { LEGS, STAMP_PASS } from '../data/bookClubQuestions';
import { supabase } from './supabase';
import { loadMembership, loadRemote, merge, pushChanges, type Account } from './sync';

// A book's three legs: best score out of 7 on each (null until flown), and the
// day its stamp was earned (all three flown, 15 of 21 or better).
export type BookProgress = { legs: (number | null)[]; attempts: number; lastFlown: string; earnedAt: string | null };

export type Profile = {
  name: string;
  premium: boolean; // set from the account's Flight Club membership
  streak: number;
  bestStreak: number;
  lastDaily: string | null;
  shieldUsedWeek: string | null;
  daily: Record<string, number>; // dayKey -> score out of 10
  bookClub: Record<string, BookProgress>;
  joinedBooks: string[];
  onLeaderboard: boolean; // shown on the public leaderboard
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
  onLeaderboard: true,
};

function load(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    // Membership is never trusted from the device; it's confirmed after sign-in.
    if (!raw) return fresh;
    const saved = { ...fresh, ...JSON.parse(raw), premium: false } as Profile;
    // Drop Book Club results from the old 5-question format.
    saved.bookClub = Object.fromEntries(Object.entries(saved.bookClub).filter(([, r]) => Array.isArray(r?.legs)));
    return saved;
  } catch {
    return fresh;
  }
}

// The streak shown on screen: it lapses once a full day has been missed
// (or two for Flight Club with an unused shield this week).
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

export const bookScore = (r?: BookProgress) => (r ? r.legs.reduce<number>((sum, l) => sum + (l ?? 0), 0) : 0);
export const legsFlown = (r?: BookProgress) => (r ? r.legs.filter((l) => l !== null).length : 0);

export function recordLeg(p: Profile, bookId: string, leg: number, score: number): Profile {
  const prev = p.bookClub[bookId];
  const legs = prev ? [...prev.legs] : LEGS.map(() => null);
  legs[leg] = Math.max(legs[leg] ?? 0, score);
  const next: BookProgress = { legs, attempts: (prev?.attempts ?? 0) + 1, lastFlown: dayKey(), earnedAt: prev?.earnedAt ?? null };
  if (!next.earnedAt && legsFlown(next) === LEGS.length && bookScore(next) >= STAMP_PASS) next.earnedAt = dayKey();
  return { ...p, bookClub: { ...p.bookClub, [bookId]: next } };
}

type SyncState = 'local' | 'syncing' | 'saved' | 'error';

type Ctx = {
  profile: Profile;
  update: (fn: (p: Profile) => Profile) => void;
  account: Account | null;
  sync: SyncState;
  accountsEnabled: boolean;
  sendLink: (email: string) => Promise<void>;
  refreshMembership: () => Promise<void>;
  signOut: () => Promise<void>;
};
const ProfileContext = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(load);
  const [account, setAccount] = useState<Account | null>(null);
  const [sync, setSync] = useState<SyncState>('local');
  // The last version known to be saved on the server, so only changes are sent.
  const saved = useRef<Profile | null>(null);
  const connecting = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(profile));
    } catch {
      /* storage unavailable: progress lasts for this session only */
    }
  }, [profile]);

  // On sign-in: load the account, fold in this device's progress, save the result.
  useEffect(() => {
    if (!supabase) return;
    const connect = async (userId: string, email: string) => {
      if (connecting.current || saved.current) return;
      connecting.current = true;
      setSync('syncing');
      try {
        const { account, remote } = await loadRemote(userId, email);
        const merged = merge(load(), remote);
        await pushChanges(userId, { ...merged, ...remote } as Profile, merged);
        saved.current = merged;
        setAccount(account);
        setProfile({ ...merged, premium: !!account.membership });
        setSync('saved');
      } catch {
        setSync('error');
      } finally {
        connecting.current = false;
      }
    };
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) connect(data.session.user.id, data.session.user.email ?? '');
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) connect(session.user.id, session.user.email ?? '');
      if (event === 'SIGNED_OUT') {
        saved.current = null;
        setAccount(null);
        setSync('local');
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // After sign-in, every change is saved to the account.
  useEffect(() => {
    if (!account || !saved.current || saved.current === profile) return;
    const prev = saved.current;
    setSync('syncing');
    pushChanges(account.userId, prev, profile)
      .then(() => {
        saved.current = profile;
        setSync('saved');
      })
      .catch(() => setSync('error'));
  }, [profile, account]);

  const sendLink = useCallback(async (email: string) => {
    const { error } = await supabase!.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    if (error) throw error;
  }, []);

  // After checkout or joining a plan, re-read the membership the server recorded.
  const refreshMembership = useCallback(async () => {
    if (!supabase) return;
    const membership = await loadMembership();
    setAccount((a) => (a ? { ...a, membership } : a));
    setProfile((p) => ({ ...p, premium: !!membership }));
  }, []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    // Progress stays with the account; this device starts fresh.
    setProfile(fresh);
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, update: setProfile, account, sync, accountsEnabled: !!supabase, sendLink, refreshMembership, signOut }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): Ctx {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
