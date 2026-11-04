import { useState } from 'react';
import { liveStreak, useProfile, type Crew } from '../lib/profile';
import { dayKey } from '../lib/dates';
import { Lock } from '../components/Icons';
import type { Screen } from '../types';

// Until a backend exists, other travellers are sample data so the layout can be judged.
const SAMPLE = [
  { name: 'Grace A.', streak: 41, today: 10 },
  { name: 'Tobi O.', streak: 27, today: 9 },
  { name: 'Hannah K.', streak: 19, today: 9 },
  { name: 'Samuel E.', streak: 12, today: 7 },
  { name: 'Lydia M.', streak: 6, today: 8 },
];

export function Leaderboard({ go }: { go: (s: Screen) => void }) {
  const { profile, update } = useProfile();
  const [crewName, setCrewName] = useState('');
  const me = { name: `${profile.name} (you)`, streak: liveStreak(profile), today: profile.daily[dayKey()] ?? 0 };
  const rows = [...SAMPLE, me].sort((a, b) => b.streak - a.streak || b.today - a.today);

  const createCrew = () => {
    const name = crewName.trim();
    if (!name) return;
    const crew: Crew = {
      id: crypto.randomUUID(),
      name,
      code: Math.random().toString(36).slice(2, 8).toUpperCase(),
      createdAt: dayKey(),
    };
    update((p) => ({ ...p, crews: [...p.crews, crew] }));
    setCrewName('');
  };

  return (
    <div className="screen">
      <header className="page-head">
        <h1>Leaderboard</h1>
        <p>Ranked by streak, then today's score.</p>
      </header>

      <div className="board-table">
        <div className="board-table-head mono">
          <span>#</span>
          <span>Traveller</span>
          <span>Streak</span>
          <span>Today</span>
        </div>
        {rows.map((r, i) => (
          <div key={r.name} className={`board-table-row ${r === me ? 'me' : ''}`}>
            <span className="mono">{i + 1}</span>
            <span>{r.name}</span>
            <span className="mono">{r.streak}</span>
            <span className="mono">{r.today}/10</span>
          </div>
        ))}
      </div>
      <p className="fineprint">Preview: other names are sample travellers until accounts and a server are connected.</p>

      <h3 className="section-title">Crew leaderboards</h3>
      {profile.premium ? (
        <div className="card">
          <p>Create a private leaderboard for your church, small group or family and share its code.</p>
          <div className="row">
            <input value={crewName} onChange={(e) => setCrewName(e.target.value)} placeholder="e.g. Tuesday Bible Study" maxLength={40} />
            <button className="btn btn-primary" onClick={createCrew}>Create</button>
          </div>
          {profile.crews.map((c) => (
            <div key={c.id} className="crew">
              <strong>{c.name}</strong>
              <span className="mono">CODE {c.code}</span>
            </div>
          ))}
        </div>
      ) : (
        <button className="card locked" onClick={() => go({ name: 'premium' })}>
          <Lock /> <span>Flight Club members can create private leaderboards. Tap to join.</span>
        </button>
      )}
    </div>
  );
}
