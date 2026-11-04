import { useMemo, useState } from 'react';
import { Quiz } from '../components/Quiz';
import { Lock } from '../components/Icons';
import { dailySet } from './Daily';
import { dayKey } from '../lib/dates';
import { useProfile } from '../lib/profile';
import type { Screen } from '../types';

const DAYS_BACK = 30;

// The last 30 Daily Flights, replayable for practice. Replays never touch streaks, scores or miles.
function pastDays(): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 1; i <= DAYS_BACK; i++) {
    d.setDate(d.getDate() - 1);
    out.push(dayKey(d));
  }
  return out;
}

export function Archive({ go }: { go: (s: Screen) => void }) {
  const { profile } = useProfile();
  const days = useMemo(pastDays, []);
  const [day, setDay] = useState<string | null>(null);
  const [replay, setReplay] = useState<number | null>(null);
  const questions = useMemo(() => (day ? dailySet(day) : []), [day]);

  if (!profile.premium) {
    return (
      <div className="screen">
        <header className="page-head"><h1>Flight archive</h1><p>Replay any of the last {DAYS_BACK} Daily Flights.</p></header>
        <button className="upsell" onClick={() => go({ name: 'premium' })}>
          <Lock /> <span>The flight archive is a Flight Club perk.</span>
        </button>
      </div>
    );
  }

  if (day && replay !== null) {
    return (
      <div className="screen landed">
        <p className="mono muted small">REPLAY · {day}</p>
        <h1 className="landed-score">{replay}<span>/10</span></h1>
        <p className="landed-msg">
          {profile.daily[day] !== undefined ? `On the day you scored ${profile.daily[day]}/10.` : 'You didn\'t fly this one on the day.'} Replays don't change your streak or miles.
        </p>
        <button className="btn btn-primary" onClick={() => { setDay(null); setReplay(null); }}>Back to the archive</button>
      </div>
    );
  }

  if (day) {
    return (
      <div className="screen">
        <p className="mono muted small">REPLAY · {day}</p>
        <Quiz questions={questions} route={{ from: 'GEN', to: 'REV' }} onFinish={setReplay} />
      </div>
    );
  }

  return (
    <div className="screen">
      <header className="page-head">
        <h1>Flight archive</h1>
        <p>Replay any of the last {DAYS_BACK} Daily Flights for practice. Replays don't change your streak, scores or miles.</p>
      </header>
      <div className="log">
        {days.map((d) => (
          <button key={d} className="log-row archive-row" onClick={() => setDay(d)}>
            <span className="mono">{d}</span>
            <span>{new Date(`${d}T12:00`).toLocaleDateString(undefined, { weekday: 'long' })}</span>
            <span className="mono">{profile.daily[d] !== undefined ? `${profile.daily[d]}/10` : 'Not flown'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
