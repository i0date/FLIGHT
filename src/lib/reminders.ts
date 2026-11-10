import { supabase } from './supabase';
import { isInstalled, isIos } from './install';
import { VAPID_PUBLIC_KEY } from './vapid';

// Streak reminders: phone notifications on this device, and email for the account.
// The server sends them (supabase/functions/reminders); this only switches them on and off.

export const timeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

// Where notifications can work here: iPhone only allows them from the Home Screen app (iOS 16.4+).
export function pushSupport(): 'ok' | 'install-first' | 'unsupported' {
  if (!VAPID_PUBLIC_KEY) return 'unsupported';
  if (isIos() && !isInstalled()) return 'install-first';
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported';
  return 'ok';
}

const keyBytes = (base64url: string) => {
  const raw = atob(base64url.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((base64url.length + 3) % 4));
  return Uint8Array.from(raw, (ch) => ch.charCodeAt(0));
};

async function currentSubscription() {
  const reg = await navigator.serviceWorker.getRegistration();
  return (await reg?.pushManager.getSubscription()) ?? null;
}

// Is this device signed up for this account's notifications?
export async function pushEnabled(): Promise<boolean> {
  if (pushSupport() !== 'ok' || Notification.permission !== 'granted') return false;
  const sub = await currentSubscription();
  if (!sub) return false;
  const { data } = await supabase!.rpc('has_push_subscription', { sub_endpoint: sub.endpoint });
  return !!data;
}

export async function enablePush(userId: string) {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notifications are blocked for FLIGHT. Allow them in your phone’s settings, then try again.');
  const reg = await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID_PUBLIC_KEY) }));
  const json = sub.toJSON();
  const { error } = await supabase!.rpc('save_push_subscription', { sub_endpoint: sub.endpoint, sub_p256dh: json.keys?.p256dh, sub_auth: json.keys?.auth });
  if (error) throw new Error('Could not turn on notifications. Try again.');
  await saveTimeZone(userId);
}

export async function disablePush() {
  const sub = await currentSubscription();
  if (!sub) return;
  await supabase!.rpc('remove_push_subscription', { sub_endpoint: sub.endpoint });
  await sub.unsubscribe();
}

export async function emailEnabled(userId: string): Promise<boolean> {
  const { data } = await supabase!.from('profiles').select('remind_email').eq('id', userId).single();
  return !!data?.remind_email;
}

export async function setEmail(userId: string, on: boolean) {
  const { error } = await supabase!.from('profiles').update({ remind_email: on, tz: timeZone() }).eq('id', userId);
  if (error) throw new Error('Could not save that. Try again.');
}

// Reminders go out at 8 pm and 9 am in the traveller's own time zone.
export async function saveTimeZone(userId: string) {
  await supabase!.from('profiles').update({ tz: timeZone() }).eq('id', userId);
}

export async function unsubscribe(token: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('unsubscribe_reminders', { token });
  if (error) throw new Error('Could not unsubscribe. Try again in a moment.');
  return !!data;
}
