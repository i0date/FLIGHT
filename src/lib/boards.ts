import { supabase } from './supabase';

export type BoardRow = { pos: number; name: string; streak: number; today: number | null; is_me: boolean | null };
export type CrewInfo = { id: string; name: string; code: string; members: number; is_owner: boolean };

const call = async <T>(fn: string, args: Record<string, unknown> = {}): Promise<T> => {
  const { data, error } = await supabase!.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
};

export const publicBoard = (board: 'today' | 'streak', day: string) => call<BoardRow[]>('leaderboard', { board, for_day: day });
export const crewBoard = (crew: string, day: string) => call<BoardRow[]>('crew_board', { crew, for_day: day });
export const myCrews = () => call<CrewInfo[]>('my_crews');
export const createCrew = (name: string) => call<{ id: string; name: string; code: string }[]>('create_crew', { crew_name: name });
export const joinCrew = (code: string) => call<{ id: string; name: string }[]>('join_crew', { crew_code: code });
export const leaveCrew = (crew: string) => call<void>('leave_crew', { crew });
