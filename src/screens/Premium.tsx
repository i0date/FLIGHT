import { useEffect, useState } from 'react';
import { useProfile } from '../lib/profile';
import { PlaneMascot } from '../components/Aircraft';
import { PLAN_INFO, callApi, formatPrice, localCurrency, type Interval, type PlanId } from '../lib/billing';
import type { Screen } from '../types';

const PERKS = [
  { title: 'Passport stamps', body: 'Every Book Club route you complete is stamped in your passport.' },
  { title: 'Private leaderboards', body: 'Boards for your friends, family or church.' },
  { title: 'Streak shield', body: 'Miss a day? One shield a week keeps your streak alive.' },
  { title: 'Night Flight', body: 'A weekly challenge flown entirely in the stratosphere.' },
  { title: 'Flight archive', body: 'Replay any of the last 30 Daily Flights.' },
];

const PLAN_NAMES: Record<PlanId, string> = { individual: 'Individual', family: 'Family', group: 'Church & groups' };

export function Premium({ go, checkout }: { go: (s: Screen) => void; checkout?: string | null }) {
  const { profile, update, account, accountsEnabled, refreshMembership } = useProfile();
  const [interval, setInterval] = useState<Interval>('yearly');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [code, setCode] = useState('');
  const currency = localCurrency();
  const membership = account?.membership ?? null;

  // Back from Stripe: the webhook may land a moment after the traveller does, so check a few times.
  useEffect(() => {
    if (!checkout || !account) return;
    if (checkout === 'cancel') return setNotice('Checkout cancelled. Nothing was charged.');
    setNotice(checkout === 'success' ? 'Payment received — confirming your membership…' : '');
    let tries = 0;
    const timer = window.setInterval(async () => {
      tries += 1;
      await refreshMembership().catch(() => undefined);
      if (tries >= 8) window.clearInterval(timer);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [checkout, account?.userId, refreshMembership]);

  useEffect(() => {
    if (membership && checkout === 'success') setNotice('Welcome to Flight Club!');
  }, [membership, checkout]);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(null);
    }
  };

  const startCheckout = (plan: PlanId) =>
    run(plan, async () => {
      const { url } = await callApi<{ url: string }>('checkout', { plan, interval });
      window.location.href = url;
    });

  const openBilling = () =>
    run('billing', async () => {
      const { url } = await callApi<{ url: string }>('billing-portal', {});
      window.location.href = url;
    });

  const join = () =>
    run('join', async () => {
      await callApi('membership', { action: 'join', code });
      await refreshMembership();
      setNotice('You joined the plan. Welcome to Flight Club!');
      setCode('');
    });

  const leave = () =>
    run('leave', async () => {
      await callApi('membership', { action: 'leave' });
      await refreshMembership();
      setNotice('You left the plan.');
    });

  return (
    <div className="screen">
      <header className="page-head flight-club">
        <p className="mono small">MEMBERSHIP</p>
        <h1>Flight Club</h1>
        <p>The daily flight, streaks and miles are free for everyone. Flight Club adds:</p>
        <PlaneMascot width={200} className="club-plane" />
      </header>

      {notice && <div className="notice">{notice}</div>}
      {error && <div className="notice notice-error">{error}</div>}

      {membership && (
        <div className="card member-card">
          <p className="mono small muted">YOUR MEMBERSHIP</p>
          <strong className="member-plan">{PLAN_NAMES[membership.plan]}</strong>
          <p className="small muted">
            {membership.role === 'owner' ? 'Renews or ends' : 'Active until'} {new Date(membership.activeUntil).toLocaleDateString()}
          </p>
          {membership.role === 'owner' && membership.plan !== 'individual' && (
            <div className="invite">
              <p className="small">Share this code so others can join your plan ({membership.members} of {membership.seats} seats used):</p>
              <p className="invite-code mono">{membership.inviteCode}</p>
            </div>
          )}
          {membership.role === 'owner' ? (
            <button className="btn btn-ghost" disabled={busy === 'billing'} onClick={openBilling}>
              {busy === 'billing' ? 'Opening…' : 'Manage billing, switch plan or cancel'}
            </button>
          ) : (
            <button className="btn btn-ghost" disabled={busy === 'leave'} onClick={leave}>
              {busy === 'leave' ? 'Leaving…' : 'Leave this plan'}
            </button>
          )}
        </div>
      )}

      <div className="perks">
        {PERKS.map((p) => (
          <div key={p.title} className="perk">
            <strong>{p.title}</strong>
            <span>{p.body}</span>
          </div>
        ))}
      </div>

      {!membership && (
        <>
          <div className="plans-head">
            <h3 className="section-title">Plans</h3>
            <div className="toggle" role="group" aria-label="Billing period">
              {(['monthly', 'yearly'] as const).map((i) => (
                <button key={i} className={interval === i ? 'on' : ''} onClick={() => setInterval(i)}>
                  {i === 'monthly' ? 'Monthly' : 'Yearly'}
                </button>
              ))}
            </div>
          </div>
          <div className="plans">
            {PLAN_INFO.map((p) => (
              <div key={p.id} className="plan">
                <strong>{p.name}</strong>
                <span className="plan-price">
                  {formatPrice(p.prices[currency][interval], currency)}
                  <small>/{interval === 'monthly' ? 'mo' : 'yr'}</small>
                </span>
                <span>{p.body}</span>
                {account ? (
                  <button className="btn btn-primary btn-small" disabled={!!busy} onClick={() => startCheckout(p.id)}>
                    {busy === p.id ? 'Opening…' : 'Choose'}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          {!account && accountsEnabled && (
            <button className="btn btn-primary" onClick={() => go({ name: 'passport' })}>
              Sign in to join Flight Club
            </button>
          )}
          <p className="fineprint">
            Prices in {currency}. Renews automatically until you cancel; cancel anytime. Payments are handled securely by Stripe. By joining you agree to the{' '}
            <button className="link" onClick={() => go({ name: 'terms' })}>terms</button> and{' '}
            <button className="link" onClick={() => go({ name: 'privacy' })}>privacy policy</button>.
          </p>

          {account && (
            <div className="card">
              <strong>Have an invite code?</strong>
              <p className="small muted">Join a family or church plan someone else pays for.</p>
              <div className="row">
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. 7F3K9Q2A" maxLength={8} className="mono" />
                <button className="btn btn-primary" disabled={code.length < 8 || busy === 'join'} onClick={join}>
                  {busy === 'join' ? 'Joining…' : 'Join'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {import.meta.env.DEV && !account && (
        <button className="btn btn-ghost" onClick={() => update((p) => ({ ...p, premium: !p.premium }))}>
          {profile.premium ? 'Leave' : 'Join'} Flight Club (local demo)
        </button>
      )}
    </div>
  );
}
