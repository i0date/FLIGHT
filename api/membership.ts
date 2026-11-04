// Join someone's family or group plan with their invite code, or leave it.
import { admin, json, userFrom } from './_lib.js';

export async function POST(req: Request) {
  const user = await userFrom(req);
  if (!user) return json({ error: 'Sign in first.' }, 401);
  const body = (await req.json().catch(() => ({}))) as { action?: string; code?: string };
  const db = admin();

  if (body.action === 'join') {
    const code = String(body.code ?? '').trim().toUpperCase();
    const { data: sub } = await db
      .from('subscriptions')
      .select('id, owner_id, plan, seats, status, active_until')
      .eq('invite_code', code)
      .maybeSingle();
    const live = sub && ['active', 'trialing', 'past_due'].includes(sub.status) && new Date(sub.active_until) > new Date();
    if (!live || sub.plan === 'individual') return json({ error: 'That invite code is not valid.' }, 404);
    if (sub.owner_id === user.id) return json({ error: 'This is your own plan.' }, 400);
    const { count } = await db.from('subscription_members').select('*', { count: 'exact', head: true }).eq('subscription_id', sub.id);
    if (1 + (count ?? 0) >= sub.seats) return json({ error: 'This plan is full.' }, 409);
    const { error } = await db.from('subscription_members').upsert({ subscription_id: sub.id, user_id: user.id }, { onConflict: 'subscription_id,user_id', ignoreDuplicates: true });
    if (error) throw error;
    return json({ joined: true, plan: sub.plan });
  }

  if (body.action === 'leave') {
    const { error } = await db.from('subscription_members').delete().eq('user_id', user.id);
    if (error) throw error;
    return json({ left: true });
  }

  return json({ error: 'Unknown action.' }, 400);
}
