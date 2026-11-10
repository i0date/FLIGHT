import { supabase } from './supabase';

// The owner's dashboard (supabase/migrations/*_owner_dashboard.sql). Only accounts in app_owners can read it.
export type DayCount = { day: string; n?: number; flights?: number; avg?: number | null };
export type OpenReport = { id: number; question_id: string; reason: string; note: string | null; prompt: string; shown_answer: string | null; created_at: string; signed_in: boolean };

export type OwnerStats = {
  generated_at: string;
  today: string;
  accounts: { total: number; new_today: number; new_7d: number; active_today: number; active_7d: number; signups_by_day: DayCount[] };
  daily: { by_day: DayCount[]; total: number; perfect: number; scores: Record<string, number> };
  streaks: { live: number; longest_live: number; best_ever: number; buckets: Record<string, number> };
  book_club: { travellers: number; books_started: number; books_earned: number; top_books: { book_id: string; n: number; earned: number }[] };
  club: { by_plan: Record<string, number>; seat_members: number; past_due: number };
  reminders: { devices: number; travellers_with_devices: number; email_opt_ins: number };
  connecting: { flights_7d: number; players_7d: number };
  reports: { open: number; recent: OpenReport[] };
};

export async function isOwner(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.rpc('is_owner');
  return !!data;
}

export async function ownerStats(): Promise<OwnerStats> {
  const { data, error } = await supabase!.rpc('owner_stats');
  if (error) throw new Error(error.message);
  return data as OwnerStats;
}

export async function closeReport(id: number, status: 'fixed' | 'dismissed') {
  const { error } = await supabase!.rpc('owner_close_report', { report_id: id, new_status: status });
  if (error) throw new Error(error.message);
}
