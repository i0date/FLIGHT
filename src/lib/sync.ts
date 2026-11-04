import { supabase } from './supabase';
import type { Profile } from './profile';

export type Account = { userId: string; email: string; passengerNo: string; memberSince: string; member: boolean };

type ProfileRow = {
  display_name: string;
  passenger_no: string;
  streak: number;
  best_streak: number;
  last_daily: string | null;
  shield_used_week: string | null;
  joined_books: string[];
  created_at: string;
};

// Load everything saved to the account.
export async function loadRemote(userId: string, email: string): Promise<{ account: Account; remote: Partial<Profile> }> {
  const db = supabase!;
  const [profile, daily, books, membership] = await Promise.all([
    db.from('profiles').select('*').eq('id', userId).single<ProfileRow>(),
    db.from('daily_results').select('day, score').eq('user_id', userId),
    db.from('book_results').select('book_id, best, attempts, completed_at').eq('user_id', userId),
    db.from('memberships').select('active_until').eq('user_id', userId).maybeSingle(),
  ]);
  if (profile.error) throw profile.error;
  const p = profile.data;
  return {
    account: {
      userId,
      email,
      passengerNo: p.passenger_no,
      memberSince: p.created_at.slice(0, 10),
      member: !!membership.data && new Date(membership.data.active_until) > new Date(),
    },
    remote: {
      name: p.display_name,
      streak: p.streak,
      bestStreak: p.best_streak,
      lastDaily: p.last_daily,
      shieldUsedWeek: p.shield_used_week,
      joinedBooks: p.joined_books,
      daily: Object.fromEntries((daily.data ?? []).map((r) => [r.day, r.score])),
      bookClub: Object.fromEntries(
        (books.data ?? []).map((r) => [r.book_id, { best: r.best, attempts: r.attempts, completedAt: r.completed_at }]),
      ),
    },
  };
}

// Combine progress made on this device before signing in with what the account already has.
export function merge(local: Profile, remote: Partial<Profile>): Profile {
  const remoteAhead = (remote.lastDaily ?? '') >= (local.lastDaily ?? '');
  const bookClub = { ...remote.bookClub };
  for (const [id, r] of Object.entries(local.bookClub)) {
    const o = bookClub[id];
    bookClub[id] = o
      ? { best: Math.max(o.best, r.best), attempts: Math.max(o.attempts, r.attempts), completedAt: o.completedAt < r.completedAt ? o.completedAt : r.completedAt }
      : r;
  }
  return {
    ...local,
    name: remote.name && remote.name !== 'Traveller' ? remote.name : local.name,
    streak: remoteAhead ? remote.streak ?? 0 : local.streak,
    lastDaily: remoteAhead ? remote.lastDaily ?? null : local.lastDaily,
    shieldUsedWeek: remoteAhead ? remote.shieldUsedWeek ?? null : local.shieldUsedWeek,
    bestStreak: Math.max(local.bestStreak, remote.bestStreak ?? 0),
    joinedBooks: [...new Set([...(remote.joinedBooks ?? []), ...local.joinedBooks])],
    daily: { ...local.daily, ...remote.daily },
    bookClub,
  };
}

// Save only what changed between two versions of the profile.
export async function pushChanges(userId: string, prev: Profile | null, next: Profile) {
  const db = supabase!;
  const jobs: PromiseLike<unknown>[] = [];

  const fields = (p: Profile) => ({
    display_name: p.name,
    streak: p.streak,
    best_streak: p.bestStreak,
    last_daily: p.lastDaily,
    shield_used_week: p.shieldUsedWeek,
    joined_books: p.joinedBooks,
  });
  if (!prev || JSON.stringify(fields(prev)) !== JSON.stringify(fields(next))) {
    jobs.push(db.from('profiles').update(fields(next)).eq('id', userId));
  }

  const newDays = Object.entries(next.daily).filter(([day]) => prev?.daily[day] === undefined);
  if (newDays.length) {
    jobs.push(
      db.from('daily_results').upsert(newDays.map(([day, score]) => ({ user_id: userId, day, score })), { onConflict: 'user_id,day', ignoreDuplicates: true }),
    );
  }

  const changedBooks = Object.entries(next.bookClub).filter(([id, r]) => JSON.stringify(prev?.bookClub[id]) !== JSON.stringify(r));
  if (changedBooks.length) {
    jobs.push(
      db.from('book_results').upsert(
        changedBooks.map(([book_id, r]) => ({ user_id: userId, book_id, best: r.best, attempts: r.attempts, completed_at: r.completedAt })),
        { onConflict: 'user_id,book_id' },
      ),
    );
  }

  const results = await Promise.all(jobs);
  const failed = results.find((r) => (r as { error?: unknown }).error);
  if (failed) throw (failed as { error: unknown }).error;
}
