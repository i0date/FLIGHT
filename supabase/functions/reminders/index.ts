// Streak reminders, run at the top of every hour by pg_cron (see migrations/*_reminders.sql).
// reminder_candidates() decides who is due in their own time zone; this sends the phone
// notifications and emails, then records what was sent so nothing goes twice.
// Also takes email apps' one-click unsubscribe (POST ?unsubscribe=<token>); the link people tap
// opens theflightgame.com/?unsubscribe=<token>, which asks them to confirm.
//
// Safe to call by anyone: it only ever sends what is due this hour, once.
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import webpush from 'npm:web-push@3.6.7';

const SITE = 'https://theflightgame.com';
const FROM = 'FLIGHT <reminders@theflightgame.com>';
const OPERATOR = "Adeoti's Chrestomathy";
// Canada's anti-spam law: every email carries a mailing address. Email reminders stay off until it's set.
const MAILING_ADDRESS = Deno.env.get('MAILING_ADDRESS') ?? '';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY');
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY');
if (VAPID_PUBLIC && VAPID_PRIVATE) webpush.setVapidDetails(SITE, VAPID_PUBLIC, VAPID_PRIVATE);

type Candidate = { user_id: string; email: string; name: string; streak: number; kind: 'final' | 'missed'; shielded: boolean; mark: string; remind_email: boolean; unsub_token: string };

function message(c: Candidate) {
  const days = `${c.streak}-day streak`;
  if (c.kind === 'missed') {
    return { title: 'You missed your flight', body: `Your ${days} has ended. Today’s Daily Flight is boarding — start a new one.`, button: 'Board today’s flight' };
  }
  return c.shielded
    ? { title: 'Final boarding call ✈', body: `Your streak shield is holding your ${days}. Fly today or it’s gone at midnight.`, button: 'Board now' }
    : { title: 'Final boarding call ✈', body: `Your ${days} departs at midnight. Board today’s Daily Flight to keep it.`, button: 'Board now' };
}

const escape = (s: string) => s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

function emailHtml(c: Candidate, m: ReturnType<typeof message>, unsubscribe: string) {
  return `<div style="font-family: Arial, Helvetica, sans-serif; max-width: 440px; margin: 0 auto; padding: 24px 16px; color: #1b2433;">
  <p style="margin: 0 0 24px; letter-spacing: 0.3em; font-weight: bold; color: #16243b;">&#9992; FLIGHT</p>
  <h2 style="margin: 0 0 12px; color: #16243b;">${escape(m.title)}</h2>
  <p style="margin: 0 0 24px; line-height: 1.5;">${escape(c.name)}, ${escape(m.body.charAt(0).toLowerCase() + m.body.slice(1))}</p>
  <p style="margin: 0 0 32px;"><a href="${SITE}/" style="display: inline-block; background: #16243b; color: #ffffff; text-decoration: none; font-weight: bold; padding: 14px 28px; border-radius: 10px;">${escape(m.button)}</a></p>
  <p style="margin: 0 0 6px; color: #6b7486; font-size: 12px; line-height: 1.5;">You’re getting this because you turned on email reminders in your FLIGHT passport. <a href="${unsubscribe}" style="color: #6b7486;">Unsubscribe</a> any time.</p>
  <p style="margin: 0; color: #6b7486; font-size: 12px; line-height: 1.5;">${escape(OPERATOR)} · ${escape(MAILING_ADDRESS)} · <a href="${SITE}" style="color: #6b7486;">theflightgame.com</a></p>
</div>`;
}

async function sendEmail(c: Candidate, m: ReturnType<typeof message>) {
  const unsubscribe = `${SITE}/?unsubscribe=${c.unsub_token}`;
  const oneClick = `${Deno.env.get('SUPABASE_URL')}/functions/v1/reminders?unsubscribe=${c.unsub_token}`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: c.email,
      subject: m.title,
      html: emailHtml(c, m, unsubscribe),
      text: `${m.title}\n\n${m.body}\n\n${SITE}/\n\nUnsubscribe: ${unsubscribe}\n${OPERATOR} · ${MAILING_ADDRESS}`,
      headers: { 'List-Unsubscribe': `<${oneClick}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function sendPush(c: Candidate, m: ReturnType<typeof message>) {
  const { data: subs } = await db.from('push_subscriptions').select('endpoint, p256dh, auth').eq('user_id', c.user_id);
  let sent = 0;
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({ title: m.title, body: m.body, url: '/', tag: `flight-${c.kind}` }),
        { TTL: 4 * 3600 },
      );
      sent++;
    } catch (e) {
      // 404/410: the device unsubscribed or the app was removed. Forget it.
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) await db.from('push_subscriptions').delete().eq('endpoint', s.endpoint);
      else console.error('push failed', status, e);
    }
  }
  return sent;
}

async function run() {
  const { data, error } = await db.rpc('reminder_candidates');
  if (error) throw error;
  const due = (data ?? []) as Candidate[];
  let pushes = 0, emails = 0;
  for (const c of due) {
    const m = message(c);
    if (VAPID_PUBLIC && VAPID_PRIVATE) pushes += await sendPush(c, m);
    if (c.remind_email && RESEND_API_KEY && MAILING_ADDRESS) {
      try {
        await sendEmail(c, m);
        emails++;
      } catch (e) {
        console.error('email failed', e);
      }
    }
    // Recorded even if a send failed, so a broken device can't cause a reminder every hour.
    const { data: row } = await db.from('profiles').select('reminders_sent').eq('id', c.user_id).single();
    await db.from('profiles').update({ reminders_sent: { ...(row?.reminders_sent ?? {}), [c.kind]: c.mark } }).eq('id', c.user_id);
  }
  return { due: due.length, pushes, emails };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Not found', { status: 404 });
  const token = new URL(req.url).searchParams.get('unsubscribe');
  if (token) {
    if (/^[0-9a-f-]{36}$/i.test(token)) await db.from('profiles').update({ remind_email: false }).eq('unsub_token', token);
    return Response.json({ unsubscribed: true });
  }
  try {
    const result = await run();
    console.log('reminders', result);
    return Response.json(result);
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'failed' }, { status: 500 });
  }
});
