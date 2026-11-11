import { useEffect, useState } from 'react';
import { streakStatus, type Profile } from '../lib/profile';
import { Flame } from './Icons';

// Minutes left until the player's own midnight, when today's flight departs for good.
function minutesToMidnight(now: Date) {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Math.max(0, Math.ceil((midnight.getTime() - now.getTime()) / 60_000));
}

function timeLeft(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m} minute${m === 1 ? '' : 's'}`;
}

function longDate(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

// "Don't miss your flight" while a streak waits on today; an offer to spend shields when the traveller
// decides; "You missed your flight" once it lapses.
export function StreakCall({ profile, onBoard, onUseShields }: { profile: Profile; onBoard: () => void; onUseShields: () => void }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const status = streakStatus(profile);
  if (!status) return null;
  const days = `${status.streak}-day streak`;
  const mins = minutesToMidnight(now);
  const final = mins <= 180;

  const shieldWord = (n: number) => (n === 1 ? 'a shield' : `${n} shields`);

  // Shields could save the streak, and the traveller has chosen to decide each time.
  if (status.kind === 'rescue') {
    return (
      <div className="streak-call rescue">
        <Flame size={22} className="flame-on" />
        <span>
          <strong>Save your {days}?</strong>
          You missed {status.missed === 1 ? 'a day' : `${status.missed} days`}. Use {shieldWord(status.missed)} (you hold {status.shields}) to keep it going, or fly today and start again.
          <span className="streak-call-actions">
            <button className="btn btn-primary btn-small" onClick={onUseShields}>Use {shieldWord(status.missed)}</button>
          </span>
        </span>
      </div>
    );
  }

  if (status.kind === 'missed') {
    return (
      <button className="streak-call missed" onClick={onBoard}>
        <Flame size={22} className="flame-off" />
        <span>
          <strong>You missed your flight</strong>
          Your {days} ended after {longDate(status.lastDaily)}. Board today to start a new one.
        </span>
      </button>
    );
  }

  return (
    <button className={`streak-call ${final ? 'final' : ''}`} onClick={onBoard}>
      <Flame size={22} className="flame-on" />
      <span>
        <strong>{final ? 'Final boarding call' : 'Don’t miss your flight'}</strong>
        {status.kind === 'shielded'
          ? `${status.missed === 1 ? 'A shield is' : `${status.missed} shields are`} covering your ${days}. Fly today to keep it. ${timeLeft(mins)} left.`
          : `Your ${days} departs at midnight. ${timeLeft(mins)} left to board.`}
      </span>
    </button>
  );
}
