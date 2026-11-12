import { supabase } from './supabase';

export type Interval = 'monthly' | 'yearly';
export type PlanId = 'individual' | 'family' | 'group' | 'church';

// Shown in the app; Stripe holds the real prices (same amounts, USD with a CAD option).
export const PLAN_INFO: { id: PlanId; name: string; seats: number; body: string; prices: Record<'USD' | 'CAD', Record<Interval, number>> }[] = [
  { id: 'individual', name: 'Individual', seats: 1, body: 'Frequent Flyers for one traveller.', prices: { USD: { monthly: 4.99, yearly: 39.99 }, CAD: { monthly: 6.49, yearly: 49.99 } } },
  { id: 'family', name: 'Family', seats: 6, body: 'Up to 6 travellers. Share an invite code.', prices: { USD: { monthly: 9.99, yearly: 69.99 }, CAD: { monthly: 12.99, yearly: 89.99 } } },
  { id: 'group', name: 'Church & groups', seats: 30, body: 'Up to 30 travellers for a church or study group.', prices: { USD: { monthly: 24.99, yearly: 229.99 }, CAD: { monthly: 32.99, yearly: 299.99 } } },
  { id: 'church', name: 'Large church', seats: 100, body: 'Up to 100 travellers, for a whole church on one invite code.', prices: { USD: { monthly: 59.99, yearly: 549.99 }, CAD: { monthly: 77.99, yearly: 719.99 } } },
];

export const localCurrency = (): 'USD' | 'CAD' => (/-CA$/i.test(navigator.language) ? 'CAD' : 'USD');

export const formatPrice = (amount: number, currency: 'USD' | 'CAD') =>
  new Intl.NumberFormat(currency === 'CAD' ? 'en-CA' : 'en-US', { style: 'currency', currency, currencyDisplay: currency === 'CAD' ? 'symbol' : 'narrowSymbol' }).format(amount);

// Calls one of our /api endpoints as the signed-in traveller.
export async function callApi<T>(path: string, body: unknown): Promise<T> {
  const { data } = await supabase!.auth.getSession();
  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token ?? ''}` },
    body: JSON.stringify(body),
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(result.error ?? 'Something went wrong. Try again.');
  return result as T;
}
