import { useEffect, useState } from 'react';
import { disablePush, emailEnabled, enablePush, pushEnabled, pushSupport, saveTimeZone, setEmail } from '../lib/reminders';
import { MAILING_ADDRESS } from '../lib/legal';

// Streak reminders at 8 pm (final boarding call) and 9 am after a missed day.
export function Reminders({ userId }: { userId: string }) {
  const support = pushSupport();
  const emailReady = !!MAILING_ADDRESS;
  const [push, setPush] = useState<boolean | null>(null);
  const [email, setEmailState] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    Promise.all([support === 'ok' ? pushEnabled() : false, emailReady ? emailEnabled(userId) : false]).then(([p, e]) => {
      if (!live) return;
      setPush(p);
      setEmailState(e);
      // Keep the time zone current, so reminders follow a traveller who moves.
      if (p || e) saveTimeZone(userId);
    });
    return () => {
      live = false;
    };
  }, [userId, support, emailReady]);

  if (support === 'unsupported' && !emailReady) return null;

  const toggle = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card reminders">
      <p className="small muted">A final boarding call at 8 pm if your streak is waiting on today, and a note the morning after if you miss one.</p>

      {support === 'ok' && (
        <label className="switch-row reminder-row">
          <span>
            <strong>Notifications on this device</strong>
          </span>
          <input
            type="checkbox"
            checked={!!push}
            disabled={busy || push === null}
            onChange={(e) => {
              const on = e.target.checked;
              toggle(async () => {
                if (on) await enablePush(userId);
                else await disablePush();
                setPush(on);
              });
            }}
          />
        </label>
      )}
      {support === 'install-first' && (
        <p className="small reminder-hint">To get notifications on iPhone, add FLIGHT to your Home Screen (Share → Add to Home Screen), open it from there and turn them on here.</p>
      )}

      {emailReady && (
        <label className="switch-row reminder-row">
          <span>
            <strong>Email reminders</strong>
            <span className="small muted">Unsubscribe any time from the email or here.</span>
          </span>
          <input
            type="checkbox"
            checked={!!email}
            disabled={busy || email === null}
            onChange={(e) => {
              const on = e.target.checked;
              toggle(async () => {
                await setEmail(userId, on);
                setEmailState(on);
              });
            }}
          />
        </label>
      )}
      {error && <p className="form-error small">{error}</p>}
    </section>
  );
}
