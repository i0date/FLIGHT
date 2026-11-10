import { useState } from 'react';
import { unsubscribe } from '../lib/reminders';
import type { Screen } from '../types';

// Opened from the "Unsubscribe" link in a reminder email. It asks first, because some email
// services open every link in a message to check it, and that alone shouldn't unsubscribe anyone.
export function Unsubscribe({ token, go }: { token: string; go: (s: Screen) => void }) {
  const [state, setState] = useState<'ask' | 'busy' | 'done' | 'unknown'>('ask');
  const [error, setError] = useState('');

  const confirm = async () => {
    setState('busy');
    setError('');
    try {
      setState((await unsubscribe(token)) ? 'done' : 'unknown');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
      setState('ask');
    }
  };

  return (
    <div className="screen">
      <header className="page-head compact">
        <p className="mono small muted">FLIGHT · REMINDERS</p>
        <h1>{state === 'done' ? 'You’re unsubscribed' : state === 'unknown' ? 'Link not recognised' : 'Stop reminder emails?'}</h1>
      </header>
      <div className="card">
        {state === 'done' ? (
          <p>You won’t get FLIGHT reminder emails any more. You can turn them back on in your Passport.</p>
        ) : state === 'unknown' ? (
          <p>This unsubscribe link doesn’t match an account. If you’re signed in, you can turn email reminders off in your Passport.</p>
        ) : (
          <>
            <p>You’ll stop getting the final boarding call and missed-flight emails. Notifications on your phone aren’t affected.</p>
            {error && <p className="form-error small">{error}</p>}
            <button className="btn btn-primary" disabled={state === 'busy'} onClick={confirm}>{state === 'busy' ? 'Unsubscribing…' : 'Unsubscribe'}</button>
          </>
        )}
      </div>
      <button className="btn btn-ghost" onClick={() => go({ name: 'home' })}>Back to the terminal</button>
    </div>
  );
}
