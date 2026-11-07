import { useInstall } from '../lib/install';
import { Plane } from './Icons';

// Offered on the home screen once someone has flown, so FLIGHT opens like an app.
export function InstallCard() {
  const { mode, install, dismiss } = useInstall();
  if (!mode) return null;

  return (
    <section className="card install">
      <div className="install-head">
        <img src="/icon-192.png" alt="" width={44} height={44} />
        <div>
          <strong>Put FLIGHT on your Home Screen</strong>
          <span className="small muted">Opens full screen like an app, one tap from your next flight.</span>
        </div>
      </div>
      {mode === 'prompt' ? (
        <button className="btn btn-primary" onClick={install}>
          <Plane size={16} /> Add to Home Screen
        </button>
      ) : (
        <ol className="install-steps small">
          <li>In Safari, tap the <strong>Share</strong> button <ShareIcon /> at the bottom of the screen.</li>
          <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
          <li>Tap <strong>Add</strong>. FLIGHT appears with your other apps.</li>
        </ol>
      )}
      <button className="btn btn-ghost btn-small" onClick={dismiss}>Not now</button>
    </section>
  );
}

// Safari's share symbol: a box with an arrow pointing up.
function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-label="Share" style={{ verticalAlign: '-3px' }}>
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 3v12M8 7l4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
    </svg>
  );
}
