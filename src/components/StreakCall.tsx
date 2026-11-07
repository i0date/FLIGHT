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

// "Don't miss your flight" while a streak waits on today; "You missed your flight" once it lapses.
export function StreakCall({ profile, onBoard }: { profile: Profile; onBoard: () => void }) {
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
          ? `Your streak shield is holding your ${days}. Fly today or it’s gone. ${timeLeft(mins)} left.`
          : `Your ${days} departs at midnight. ${timeLeft(mins)} left to board.`}
      </span>
    </button>
  );
}
