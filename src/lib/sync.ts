import { supabase } from './supabase';
import type { Profile } from './profile';

export type Membership = {
  plan: 'individual' | 'family' | 'group';
  role: 'owner' | 'member';
  activeUntil: string;
  seats: number;
  members: number;
  inviteCode: string | null;
};

export type Account = { userId: string; email: string; passengerNo: string; memberSince: string; membership: Membership | null };

type MembershipRow = { plan: Membership['plan']; role: Membership['role']; active_until: string; seats: number; members: number; invite_code: string | null };

// The Frequent Flyers membership that applies to the signed-in traveller (their own or a family/group seat).
export async function loadMembership(): Promise<Membership | null> {
  const { data, error } = await supabase!.rpc('my_membership');
  if (error) throw error;
  const row = (data as MembershipRow[] | null)?.[0];
  return row
    ? { plan: row.plan, role: row.role, activeUntil: row.active_until, seats: row.seats, members: row.members, inviteCode: row.invite_code }
    : null;
}

type ProfileRow = {
  display_name: string;
  passenger_no: string;
  streak: number;
  best_streak: number;
  last_daily: string | null;
  shields: number;
  shield_week: string | null;
  shield_auto: boolean;
  joined_books: string[];
  on_leaderboard: boolean;
  night_flights: Record<string, number>;
  gate_changes: Record<string, boolean>;
  home_church: string | null;
  photo_updated_at: string | null;
  created_at: string;
};

// Load everything saved to the account.
export async function loadRemote(userId: string, email: string): Promise<{ account: Account; remote: Partial<Profile> }> {
  const db = supabase!;
  const [profile, daily, books, membership] = await Promise.all([
    db.from('profiles').select('*').eq('id', userId).single<ProfileRow>(),
    db.from('daily_results').select('day, score').eq('user_id', userId),
    db.from('book_results').select('book_id, legs, attempts, last_flown, earned_at').eq('user_id', userId),
    loadMembership(),
  ]);
  if (profile.error) throw profile.error;
  const p = profile.data;
  return {
    account: {
      userId,
      email,
      passengerNo: p.passenger_no,
      memberSince: p.created_at.slice(0, 10),
      membership,
    },
    remote: {
      name: p.display_name,
      streak: p.streak,
      bestStreak: p.best_streak,
      lastDaily: p.last_daily,
      shields: p.shields ?? 0,
      shieldWeek: p.shield_week,
      shieldAuto: p.shield_auto ?? true,
      joinedBooks: p.joined_books,
      onLeaderboard: p.on_leaderboard,
      nightFlights: p.night_flights,
      gateChanges: p.gate_changes ?? {},
      homeChurch: p.home_church ?? '',
      photoUpdatedAt: p.photo_updated_at,
      daily: Object.fromEntries((daily.data ?? []).map((r) => [r.day, r.score])),
      bookClub: Object.fromEntries(
        (books.data ?? []).map((r) => [r.book_id, { legs: r.legs, attempts: r.attempts, lastFlown: r.last_flown, earnedAt: r.earned_at }]),
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
      ? {
          legs: o.legs.map((l, i) => (l === null && r.legs[i] === null ? null : Math.max(l ?? 0, r.legs[i] ?? 0))),
          attempts: Math.max(o.attempts, r.attempts),
          lastFlown: o.lastFlown > r.lastFlown ? o.lastFlown : r.lastFlown,
          earnedAt: [o.earnedAt, r.earnedAt].filter(Boolean).sort()[0] ?? null,
        }
      : r;
  }
  return {
    ...local,
    name: remote.name && remote.name !== 'Traveller' ? remote.name : local.name,
    streak: remoteAhead ? remote.streak ?? 0 : local.streak,
    lastDaily: remoteAhead ? remote.lastDaily ?? null : local.lastDaily,
    // Shields held on the account win, plus any this device earned before signing in.
    shields: Math.min(3, Math.max(remote.shields ?? 0, local.shields)),
    shieldWeek: [remote.shieldWeek, local.shieldWeek].filter(Boolean).sort().pop() ?? null,
    shieldAuto: remote.shieldAuto ?? local.shieldAuto,
    bestStreak: Math.max(local.bestStreak, remote.bestStreak ?? 0),
    joinedBooks: [...new Set([...(remote.joinedBooks ?? []), ...local.joinedBooks])],
    onLeaderboard: remote.onLeaderboard ?? local.onLeaderboard,
    nightFlights: { ...local.nightFlights, ...remote.nightFlights },
    gateChanges: { ...local.gateChanges, ...remote.gateChanges },
    homeChurch: remote.homeChurch || local.homeChurch,
    photoUpdatedAt: remote.photoUpdatedAt ?? null,
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
    shields: p.shields,
    shield_week: p.shieldWeek,
    shield_auto: p.shieldAuto,
    joined_books: p.joinedBooks,
    on_leaderboard: p.onLeaderboard,
    night_flights: p.nightFlights,
    gate_changes: p.gateChanges,
    home_church: p.homeChurch.trim() || null,
    photo_updated_at: p.photoUpdatedAt,
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
        changedBooks.map(([book_id, r]) => ({ user_id: userId, book_id, legs: r.legs, attempts: r.attempts, last_flown: r.lastFlown, earned_at: r.earnedAt })),
        { onConflict: 'user_id,book_id' },
      ),
    );
  }

  const results = await Promise.all(jobs);
  const failed = results.find((r) => (r as { error?: unknown }).error);
  if (failed) throw (failed as { error: unknown }).error;
}
