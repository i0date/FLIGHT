import { useState } from 'react';
import { bookScore, useProfile } from '../lib/profile';
import { milesFor, tierFor, VISAS } from '../lib/miles';
import { books, bookById } from '../data/books';
import { PlaneMascot } from '../components/Aircraft';
import { Lock } from '../components/Icons';
import type { Screen } from '../types';

export function Passport({ go }: { go: (s: Screen) => void }) {
  const { profile, update, account, sync, accountsEnabled, signOut } = useProfile();
  const [name, setName] = useState(profile.name);
  const miles = milesFor(profile);
  const { tier, next } = tierFor(miles);
  const earned = books.filter((b) => profile.bookClub[b.id]?.earnedAt);
  const stamped = profile.premium ? earned : [];
  const log = [
    ...Object.entries(profile.daily).map(([day, score]) => ({ day, what: 'Daily Flight', score: `${score}/10` })),
    ...Object.entries(profile.bookClub).map(([id, r]) => ({ day: r.lastFlown, what: `Book Club · ${bookById(id)?.name ?? id}${r.earnedAt ? ' · stamp earned' : ''}`, score: `${bookScore(r)}/21` })),
  ]
    .sort((a, b) => b.day.localeCompare(a.day))
    .slice(0, 12);
  const surname = profile.name.toUpperCase().replace(/[^A-Z]/g, '<').padEnd(20, '<').slice(0, 20);

  return (
    <div className="screen">
      {!account && <SignIn enabled={accountsEnabled} />}

      <section className="passport-page">
        <div className="pp-head">
          <span className="mono">PASSPORT · FLIGHT</span>
          <span className="pp-tier" style={{ background: tier.color }}>{tier.name}</span>
        </div>
        <div className="pp-body">
          <div className="pp-photo" aria-hidden="true">
            <span>{profile.name.slice(0, 1).toUpperCase()}</span>
          </div>
          <dl className="pp-fields">
            <div><dt>Name</dt><dd>{profile.name}</dd></div>
            <div><dt>Passenger no.</dt><dd className="mono">{account?.passengerNo ?? 'Not issued'}</dd></div>
            <div><dt>Member since</dt><dd className="mono">{account?.memberSince ?? '—'}</dd></div>
            <div><dt>Citizenship</dt><dd>Heaven <small>Phil 3:20</small></dd></div>
          </dl>
        </div>
        <div className="pp-mrz mono" aria-hidden="true">
          P&lt;FLT{surname}<br />
          {(account?.passengerNo ?? 'FL0000000').padEnd(9, '<')}&lt;{String(miles).padStart(7, '0')}&lt;{tier.name.toUpperCase().padEnd(8, '<')}&lt;&lt;&lt;
        </div>
        {account && (
          <p className="pp-sync">
            {sync === 'saved' ? 'Saved to your account' : sync === 'syncing' ? 'Saving…' : sync === 'error' ? 'Could not save — will retry on your next flight' : ''}
          </p>
        )}
      </section>

      <section className="ff-card">
        <div className="ff-top">
          <div>
            <p className="mono small">FREQUENT FLYER</p>
            <strong className="ff-miles">{miles.toLocaleString('en-GB')} miles</strong>
          </div>
          <PlaneMascot width={110} />
        </div>
        {next ? (
          <>
            <div className="ff-bar"><div style={{ width: `${((miles - tier.from) / (next.from - tier.from)) * 100}%` }} /></div>
            <p className="small">{(next.from - miles).toLocaleString('en-GB')} miles to {next.name}</p>
          </>
        ) : (
          <p className="small">Platinum: the highest status there is.</p>
        )}
        <p className="ff-earn small">Earn 250 per daily flight + 100 per correct answer · 300 per Book Club leg + 150 per correct answer · 1,500 per stamp earned · 50 per day of your best streak</p>
      </section>

      <h3 className="section-title">Stamps · {stamped.length} / {books.length}</h3>
      {profile.premium ? (
        stamped.length ? (
          <div className="pp-stamps">
            {stamped.map((b, i) => (
              <div key={b.id} className="pp-stamp" style={{ transform: `rotate(${((i * 37) % 24) - 12}deg)` }}>
                <span className="mono">{b.code}</span>
                <small>{profile.bookClub[b.id].earnedAt}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No stamps yet. Score 15 of 21 across a book's three Book Club legs to earn your first.</p>
        )
      ) : (
        <button className="upsell" onClick={() => go({ name: 'premium' })}>
          <Lock /> <span>Stamps are a Flight Club perk. {earned.length ? `${earned.length} earned stamp${earned.length === 1 ? ' is' : 's are'} waiting to go in your passport.` : 'Earn them in Book Club: 15 of 21 on a book.'}</span>
        </button>
      )}

      <h3 className="section-title">Visas</h3>
      <div className="visas">
        {VISAS.map((v) => {
          const earned = v.earned(profile);
          return (
            <div key={v.id} className={`visa ${earned ? 'visa-earned' : ''}`}>
              <strong>{v.name}</strong>
              <span>{v.detail}</span>
              {!earned && v.needsStamps && !profile.premium && <span className="visa-lock"><Lock size={12} /> Flight Club</span>}
            </div>
          );
        })}
      </div>

      <h3 className="section-title">Flight log</h3>
      {log.length ? (
        <div className="log">
          {log.map((l, i) => (
            <div key={i} className="log-row">
              <span className="mono">{l.day}</span>
              <span>{l.what}</span>
              <span className="mono">{l.score}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">No flights yet — your first boards from the terminal.</p>
      )}

      <h3 className="section-title">Passenger name</h3>
      <form className="card row" onSubmit={(e) => { e.preventDefault(); update((p) => ({ ...p, name: name.trim() || 'Traveller' })); }}>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} aria-label="Passenger name" />
        <button className="btn btn-primary" disabled={name.trim() === profile.name}>Save</button>
      </form>

      {account && (
        <div className="card">
          <p className="small muted">Signed in as {account.email}</p>
          <button className="btn btn-ghost" onClick={signOut}>Sign out</button>
        </div>
      )}
    </div>
  );
}

function SignIn({ enabled }: { enabled: boolean }) {
  const { sendLink } = useProfile();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!enabled) {
    return (
      <div className="card signin">
        <strong>Accounts are on their way</strong>
        <p className="small muted">For now your passport is saved on this device.</p>
      </div>
    );
  }

  const send = async () => {
    setBusy(true);
    setError('');
    try {
      await sendLink(email.trim());
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="card signin">
        <strong>Check your email</strong>
        <p className="small muted">
          We sent a sign-in link to <strong>{email}</strong>. Open it on this device and you'll land back here, signed in. Progress on this device comes with you.
        </p>
        {error && <p className="form-error small">{error}</p>}
        <button className="btn btn-ghost" disabled={busy} onClick={send}>{busy ? 'Sending…' : 'Send it again'}</button>
        <button className="btn btn-ghost" onClick={() => { setSent(false); setError(''); }}>Use a different email</button>
      </div>
    );
  }

  return (
    <form className="card signin" onSubmit={(e) => { e.preventDefault(); send(); }}>
      <strong>Get your passport issued</strong>
      <p className="small muted">Sign in to save your streak, miles and stamps to your account and keep them on any device. No password — we email you a link.</p>
      <input type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      {error && <p className="form-error small">{error}</p>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Please wait…' : 'Email me a sign-in link'}</button>
    </form>
  );
}
