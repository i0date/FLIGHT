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
  premium: boolean; // set from the account's Frequent Flyers membership
  streak: number;
  bestStreak: number;
  lastDaily: string | null;
  shields: number; // streak shields held, up to MAX_SHIELDS; each covers one missed day
  shieldWeek: string | null; // ISO week of the last Frequent Flyer weekly shield
  shieldAuto: boolean; // use shields without asking when a day is missed
  daily: Record<string, number>; // dayKey -> score out of 10
  bookClub: Record<string, BookProgress>;
  joinedBooks: string[];
  onLeaderboard: boolean; // shown on the public leaderboard
  nightFlights: Record<string, number>; // ISO week -> score out of 10 (Frequent Flyers)
  gateChanges: Record<string, boolean>; // day -> whether the Gate change bonus was answered right
  homeChurch: string;
  photoUpdatedAt: string | null; // set when a passport photo is uploaded (account only)
};

const KEY = 'flight.profile.v1';

const fresh: Profile = {
  name: 'Traveller',
  premium: false,
  streak: 0,
  bestStreak: 0,
  lastDaily: null,
  shields: 0,
  shieldWeek: null,
  shieldAuto: true,
  daily: {},
  bookClub: {},
  joinedBooks: [],
  onLeaderboard: true,
  nightFlights: {},
  gateChanges: {},
  homeChurch: '',
  photoUpdatedAt: null,
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

// Streak shields: held up to three at a time. Frequent Flyers get one each week; everyone earns one
// at every 30-day streak. Each shield covers one missed day, automatically or when the traveller chooses.
export const MAX_SHIELDS = 3;
export const SHIELD_STREAK = 30;
const addShields = (held: number, n: number) => Math.min(MAX_SHIELDS, held + n);

// Days missed between the last flight and today (0 when the streak is waiting on today).
const missedDays = (p: Profile, today: string) => (p.lastDaily ? daysBetween(p.lastDaily, today) - 1 : 0);

// The streak shown on screen: it lapses once a day is missed, unless there are shields enough to cover
// every missed day (used automatically, or still on offer until the traveller decides).
export function liveStreak(p: Profile, today = dayKey()): number {
  if (!p.lastDaily) return 0;
  const missed = missedDays(p, today);
  return missed <= 0 || missed <= p.shields ? p.streak : 0;
}

// What the terminal should say about the streak before today's flight:
// 'due' while a streak is waiting on today, 'shielded' when shields will cover the missed days,
// 'rescue' when shields could cover them but the traveller decides, 'missed' once a streak has lapsed.
export type StreakStatus = { kind: 'due' | 'shielded' | 'rescue' | 'missed'; streak: number; lastDaily: string; missed: number; shields: number } | null;

export function streakStatus(p: Profile, today = dayKey()): StreakStatus {
  if (!p.lastDaily || p.streak === 0 || p.daily[today] !== undefined) return null;
  const missed = missedDays(p, today);
  if (missed < 0) return null;
  const coverable = missed > 0 && missed <= p.shields;
  const kind = missed === 0 ? 'due' : coverable ? (p.shieldAuto ? 'shielded' : 'rescue') : 'missed';
  return { kind, streak: p.streak, lastDaily: p.lastDaily, missed, shields: p.shields };
}

// Spend shields on the missed days by hand, so the streak waits on today again.
export function spendShields(p: Profile, today = dayKey()): Profile {
  const missed = missedDays(p, today);
  if (missed <= 0 || missed > p.shields) return p;
  const [y, m, d] = today.split('-').map(Number);
  return { ...p, shields: p.shields - missed, lastDaily: dayKey(new Date(y, m - 1, d - 1)) };
}

// A Frequent Flyer's weekly shield, once per ISO week.
export function grantWeeklyShield(p: Profile): Profile {
  if (!p.premium || p.shieldWeek === weekKey()) return p;
  return { ...p, shields: addShields(p.shields, 1), shieldWeek: weekKey() };
}

export function recordDaily(p: Profile, score: number, today = dayKey()): Profile {
  if (p.daily[today] !== undefined) return p;
  let streak = 1;
  let shields = p.shields;
  if (p.lastDaily) {
    const missed = missedDays(p, today);
    if (missed === 0) streak = p.streak + 1;
    else if (missed > 0 && p.shieldAuto && missed <= shields) {
      streak = p.streak + 1;
      shields -= missed;
    }
  }
  if (streak % SHIELD_STREAK === 0) shields = addShields(shields, 1);
  return {
    ...p,
    streak,
    bestStreak: Math.max(p.bestStreak, streak),
    lastDaily: today,
    shields,
    daily: { ...p.daily, [today]: score },
  };
}

// The Gate change bonus counts once per day, whatever happens on a replay.
export function recordGateChange(p: Profile, ok: boolean, today = dayKey()): Profile {
  if (p.gateChanges[today] !== undefined) return p;
  return { ...p, gateChanges: { ...p.gateChanges, [today]: ok } };
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
  verifyCode: (email: string, code: string) => Promise<void>;
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

  // Frequent Flyers collect their weekly shield once the account (and its shields) has loaded.
  useEffect(() => {
    if (account && saved.current && profile.premium && profile.shieldWeek !== weekKey()) setProfile(grantWeeklyShield);
  }, [account, profile.premium, profile.shieldWeek]);

  const sendLink = useCallback(async (email: string) => {
    const { error } = await supabase!.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    if (error) throw error;
  }, []);

  // The code from the same email, typed in by hand. Email links always open in the browser,
  // so this is how the home-screen app signs in.
  const verifyCode = useCallback(async (email: string, code: string) => {
    const { error } = await supabase!.auth.verifyOtp({ email, token: code, type: 'email' });
    if (error) throw new Error(/expired|invalid/i.test(error.message) ? 'That code didn’t work. Check it, or send a new one.' : error.message);
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
    <ProfileContext.Provider value={{ profile, update: setProfile, account, sync, accountsEnabled: !!supabase, sendLink, verifyCode, refreshMembership, signOut }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): Ctx {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
