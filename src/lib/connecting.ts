import { supabase } from './supabase';
import { dailyQuestions } from '../data/dailyQuestions';
import { seeded, shuffle, toPlay } from './random';
import type { ChoiceQuestion, Level, PlayQuestion } from '../types';

// Connecting Flights: the live group game. See supabase/migrations/*_connecting_flights.sql.
export const CF_SECONDS = 60;
export const CF_SIZE = 10;
// Quick-fire, so mostly mid-altitude questions and no put-in-order ones.
const LEVELS: Level[] = [1, 2, 2, 3, 3, 3, 4, 4, 4, 5];

export type CfPlayer = { name: string; answered: number; score: number; finished_ms: number | null; is_me: boolean };
export type CfState = { code: string; server_now: string; started_at: string | null; seed: string | null; is_host: boolean; players: CfPlayer[] };

// Each device keeps one random token: it is how a guest is recognised in a flight.
const TOKEN_KEY = 'flight.cf.token';
let memoryToken: string | null = null;
export function playerToken(): string {
  try {
    let t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      t = crypto.randomUUID();
      localStorage.setItem(TOKEN_KEY, t);
    }
    return t;
  } catch {
    return (memoryToken ??= crypto.randomUUID());
  }
}

async function rpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  if (!supabase) throw new Error('Connecting Flights needs the online service.');
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export const cfCreate = () => rpc<string>('cf_create');
export const cfJoin = (code: string, name: string) => rpc<void>('cf_join', { room_code: code, player_name: name, player_token: playerToken() });
export const cfStart = (code: string) => rpc<void>('cf_start', { room_code: code });
export const cfState = (code: string) => rpc<CfState | null>('cf_state', { room_code: code, player_token: playerToken() });
export const cfProgress = (code: string, answered: number, score: number, doneMs: number | null) =>
  rpc<void>('cf_progress', { room_code: code, player_token: playerToken(), answered_n: answered, score_n: score, done_ms: doneMs });

// Everyone gets the same ten questions from the flight's seed, each in their own scrambled order.
export function cfQuestions(seed: string): PlayQuestion[] {
  const rand = seeded(`cf-${seed}`);
  const pool = shuffle(dailyQuestions.filter((q): q is ChoiceQuestion => q.kind !== 'order'), rand);
  const picked = LEVELS.map((level) => pool.splice(pool.findIndex((q) => q.level === level), 1)[0]);
  const mine = seeded(`cf-${seed}-${playerToken()}`);
  return shuffle(picked, mine).map((q) => toPlay(q, mine));
}

// Codes come from the link (?flight=ABCD) or are typed in.
export const cleanCode = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
export const flightLink = (code: string) => `${window.location.origin}/?flight=${code}`;
