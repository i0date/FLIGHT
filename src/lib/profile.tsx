import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { dayKey, daysBetween, weekKey } from './dates';
import { supabase } from './supabase';
import { loadRemote, merge, pushChanges, type Account } from './sync';

export type Crew = { id: string; name: string; code: string; createdAt: string };

export type Profile = {
  name: string;
  premium: boolean; // demo switch until payments arrive; account members are premium too
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

type SyncState = 'local' | 'syncing' | 'saved' | 'error';

type Ctx = {
  profile: Profile;
  update: (fn: (p: Profile) => Profile) => void;
  account: Account | null;
  sync: SyncState;
  accountsEnabled: boolean;
  sendCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
};
const ProfileContext = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(load);
  const [account, setAccount] = useState<Account | null>(null);
  const [sync, setSync] = useState<SyncState>('local');
  // The last version known to be saved on the server, so only changes are sent.
  const saved = useRef<Profile | null>(null);

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
      setSync('syncing');
      try {
        const { account, remote } = await loadRemote(userId, email);
        const merged = merge(load(), remote);
        await pushChanges(userId, { ...merged, ...remote } as Profile, merged);
        saved.current = merged;
        setAccount(account);
        setProfile((p) => ({ ...merged, premium: p.premium || account.member }));
        setSync('saved');
      } catch {
        setSync('error');
      }
    };
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) connect(data.session.user.id, data.session.user.email ?? '');
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session && saved.current === null) connect(session.user.id, session.user.email ?? '');
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

  const sendCode = useCallback(async (email: string) => {
    const { error } = await supabase!.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    if (error) throw error;
  }, []);

  const verifyCode = useCallback(async (email: string, code: string) => {
    const { error } = await supabase!.auth.verifyOtp({ email, token: code, type: 'email' });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    // Progress stays with the account; this device starts fresh.
    setProfile(fresh);
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, update: setProfile, account, sync, accountsEnabled: !!supabase, sendCode, verifyCode, signOut }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): Ctx {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
