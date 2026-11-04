import { useState } from 'react';
import { useProfile } from '../lib/profile';

// Email-link sign-in card, shown on the Passport page until a traveller signs in.
export function SignIn({ enabled }: { enabled: boolean }) {
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
