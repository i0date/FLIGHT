import { useState } from 'react';
import { MAX_SHIELDS, SHIELD_STREAK, useProfile } from '../lib/profile';
import { Shield } from '../components/Icons';
import { callApi } from '../lib/billing';
import { CONTACT_EMAIL } from '../lib/legal';
import { setSound, soundOn } from '../lib/sound';
import { Reminders } from '../components/Reminders';
import { SignIn } from '../components/SignIn';
import type { Screen } from '../types';

// Settings: reminders, sound, privacy on the boards, and the account itself. The Passport keeps only the passport.
export function Settings({ go }: { go: (s: Screen) => void }) {
  const { profile, update, account, accountsEnabled, signOut } = useProfile();
  const [sound, setSoundState] = useState(soundOn);

  return (
    <div className="screen settings">
      <header className="page-head compact">
        <h1>Settings</h1>
      </header>

      <h3 className="section-title">Streak</h3>
      <section className="card shields">
        <div className="shields-head">
          <strong>Streak shields</strong>
          <span className="shield-row" aria-label={`${profile.shields} of ${MAX_SHIELDS} shields held`}>
            {Array.from({ length: MAX_SHIELDS }, (_, i) => (
              <Shield key={i} size={22} className={i < profile.shields ? 'shield-on' : 'shield-off'} />
            ))}
          </span>
        </div>
        <p className="small muted">
          Each shield covers one missed day. You can hold {MAX_SHIELDS}. Everyone earns one at every {SHIELD_STREAK}-day streak
          {profile.premium ? ', and Frequent Flyers get a new one every Monday.' : '; Frequent Flyers also get one every week.'}
        </p>
        <label className="switch-row">
          <span>
            <strong>Use shields automatically</strong>
            <span className="small muted">{profile.shieldAuto ? 'A missed day is covered without asking.' : 'After a missed day, the Terminal asks before using one.'}</span>
          </span>
          <input type="checkbox" checked={profile.shieldAuto} onChange={(e) => update((p) => ({ ...p, shieldAuto: e.target.checked }))} />
        </label>
      </section>
      {account ? <Reminders userId={account.userId} /> : <p className="small muted">Sign in to get a reminder before your streak runs out.</p>}

      <h3 className="section-title">In flight</h3>
      <label className="card switch-row">
        <span>
          <strong>Sound effects</strong>
          <span className="small muted">A chime for each answer, on this device.</span>
        </span>
        <input
          type="checkbox"
          checked={sound}
          onChange={(e) => {
            setSound(e.target.checked);
            setSoundState(e.target.checked);
          }}
        />
      </label>

      {account && (
        <>
          <h3 className="section-title">Leaderboards</h3>
          <label className="card switch-row">
            <span>
              <strong>Show me on the public leaderboard</strong>
              <span className="small muted">Your passenger name, streak and today's score. Crews always see you.</span>
            </span>
            <input type="checkbox" checked={profile.onLeaderboard} onChange={(e) => update((p) => ({ ...p, onLeaderboard: e.target.checked }))} />
          </label>
        </>
      )}

      <h3 className="section-title">Account</h3>
      {account ? (
        <>
          <div className="card">
            <p className="small muted">Signed in as {account.email}</p>
            <button className="btn btn-ghost" onClick={signOut}>Sign out</button>
          </div>
          <DeleteAccount owner={account.membership?.role === 'owner'} onDeleted={signOut} />
        </>
      ) : (
        <SignIn enabled={accountsEnabled} />
      )}

      <button className="btn btn-ghost" onClick={() => go({ name: 'passport' })}>Back to Passport</button>
      <p className="fineprint legal-links">
        <button onClick={() => go({ name: 'privacy' })}>Privacy</button> · <button onClick={() => go({ name: 'terms' })}>Terms</button>{CONTACT_EMAIL && <> · <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a></>}
      </p>
    </div>
  );
}

function DeleteAccount({ owner, onDeleted }: { owner: boolean; onDeleted: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const remove = async () => {
    setBusy(true);
    setError('');
    try {
      await callApi('delete-account', {});
      // Clear this device too, so nothing of the account is left behind.
      try {
        Object.keys(localStorage).filter((k) => k.startsWith('flight.')).forEach((k) => localStorage.removeItem(k));
      } catch {
        /* nothing stored */
      }
      await onDeleted().catch(() => undefined);
      window.location.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button className="btn btn-ghost danger-link" onClick={() => setOpen(true)}>Delete my account</button>
    );
  }
  return (
    <section className="card danger">
      <strong>Delete your account?</strong>
      <p className="small">This permanently removes your passport: streak, miles, stamps, Book Club progress, photo, crews and leaderboard entries. It cannot be undone.</p>
      {owner && <p className="small"><strong>Your Frequent Flyer plan will be cancelled straight away</strong>, with no further charges, and anyone who joined it with your invite code will lose their membership too.</p>}
      <label className="small">
        Type DELETE to confirm
        <input value={typed} onChange={(e) => setTyped(e.target.value)} autoCapitalize="characters" autoComplete="off" />
      </label>
      {error && <p className="form-error small">{error}</p>}
      <button className="btn btn-danger" disabled={busy || typed.trim().toUpperCase() !== 'DELETE'} onClick={remove}>{busy ? 'Deleting…' : 'Delete my account forever'}</button>
      <button className="btn btn-ghost" disabled={busy} onClick={() => { setOpen(false); setTyped(''); }}>Keep my account</button>
    </section>
  );
}
