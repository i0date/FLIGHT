// Shared server helpers for the payment endpoints. Files starting with "_" are
// not deployed as endpoints themselves.
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const PLANS = {
  individual: { seats: 1 },
  family: { seats: 6 },
  group: { seats: 30 },
} as const;
export type Plan = keyof typeof PLANS;
export const isPlan = (p: unknown): p is Plan => typeof p === 'string' && p in PLANS;

// Stripe prices are found by lookup key, e.g. flight_family_yearly.
export const lookupKey = (plan: Plan, interval: 'monthly' | 'yearly') => `flight_${plan}_${interval}`;

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing server setting ${name}`);
  return value;
}

export const stripe = () => new Stripe(env('STRIPE_SECRET_KEY'));

// Service-role client: bypasses row-level security, so it only ever runs on the server.
export const admin = () =>
  createClient(env('VITE_SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });

// The signed-in traveller, from the Supabase access token the app sends.
export async function userFrom(req: Request) {
  const token = req.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!token) return null;
  const { data } = await admin().auth.getUser(token);
  return data.user ?? null;
}

export async function customerFor(user: { id: string; email?: string }) {
  const db = admin();
  const { data } = await db.from('stripe_customers').select('customer_id').eq('user_id', user.id).maybeSingle();
  if (data) return data.customer_id as string;
  const customer = await stripe().customers.create({ email: user.email, metadata: { user_id: user.id } });
  const { error } = await db.from('stripe_customers').insert({ user_id: user.id, customer_id: customer.id });
  if (error) throw error;
  return customer.id;
}

export const json = (body: unknown, status = 200) => Response.json(body, { status });
