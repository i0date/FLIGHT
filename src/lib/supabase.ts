import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Without these the app still runs, saving progress on this device only.
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;

export type Provider = 'google' | 'apple';

// Which one-tap providers are switched on in Supabase (Authentication → Providers), so a button
// only shows once its keys are in place. Asked once per visit.
let enabled: Promise<Provider[]> | null = null;
export function enabledProviders(): Promise<Provider[]> {
  if (!supabase || !url || !key) return Promise.resolve([]);
  enabled ??= fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
    .then((r) => (r.ok ? r.json() : { external: {} }))
    .then((s: { external?: Record<string, boolean> }) => (['google', 'apple'] as const).filter((p) => s.external?.[p]))
    .catch(() => []);
  return enabled;
}
