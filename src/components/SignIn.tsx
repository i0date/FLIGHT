import { useState } from 'react';
import { useProfile } from '../lib/profile';

// Email sign-in card, shown on the Passport page until a traveller signs in. The email has a link
// and a code: the link suits a browser, the code suits the home-screen app (links open in the browser).
export function SignIn({ enabled }: { enabled: boolean }) {
  const { sendLink, verifyCode } = useProfile();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');

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

  const check = async () => {
    setBusy(true);
    setError('');
    try {
      await verifyCode(email.trim(), code);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <form className="card signin" onSubmit={(e) => { e.preventDefault(); check(); }}>
        <strong>Check your email</strong>
        <p className="small muted">
          We sent a code to <strong>{email}</strong>. Type it here to sign in. Progress on this device comes with you.
        </p>
        <input
          className="signin-code mono"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="Code"
          maxLength={10}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          aria-label="Sign-in code"
        />
        {error && <p className="form-error small">{error}</p>}
        <button className="btn btn-primary" disabled={busy || code.length < 6}>{busy ? 'Checking…' : 'Sign in'}</button>
        <p className="small muted">In a browser, you can tap the link in the email instead.</p>
        <button type="button" className="btn btn-ghost" disabled={busy} onClick={send}>{busy ? 'Sending…' : 'Send a new code'}</button>
        <button type="button" className="btn btn-ghost" onClick={() => { setSent(false); setError(''); setCode(''); }}>Use a different email</button>
      </form>
    );
  }

  return (
    <form className="card signin" onSubmit={(e) => { e.preventDefault(); send(); }}>
      <strong>Get your passport issued</strong>
      <p className="small muted">Sign in to save your streak, miles and stamps to your account and keep them on any device. No password — we email you a code.</p>
      <input type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      {error && <p className="form-error small">{error}</p>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Please wait…' : 'Email me a sign-in code'}</button>
    </form>
  );
}
