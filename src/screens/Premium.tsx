import { useState } from 'react';
import { useProfile } from '../lib/profile';

const PERKS = [
  { title: 'Crew leaderboards', body: 'Create private boards for your church, group or family.' },
  { title: 'Streak shield', body: 'Miss a day? One shield a week keeps your streak alive.' },
  { title: 'Early boarding', body: 'New games and Book Club routes before everyone else.' },
  { title: 'No ads, ever', body: 'A quiet cabin for study.' },
];

export function Premium() {
  const { profile, update } = useProfile();
  const [name, setName] = useState(profile.name);

  return (
    <div className="screen">
      <header className="page-head first-class">
        <p className="mono small">CABIN UPGRADE</p>
        <h1>First Class</h1>
        <p>Everything in Economy, plus:</p>
      </header>

      <div className="perks">
        {PERKS.map((p) => (
          <div key={p.title} className="perk">
            <strong>{p.title}</strong>
            <span>{p.body}</span>
          </div>
        ))}
      </div>

      {profile.premium ? (
        <div className="card">
          <p><strong>You're in First Class.</strong> Welcome aboard.</p>
          <button className="btn btn-ghost" onClick={() => update((p) => ({ ...p, premium: false }))}>
            Return to Economy (demo)
          </button>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={() => update((p) => ({ ...p, premium: true }))}>
          Upgrade (demo — no payment taken)
        </button>
      )}

      <h3 className="section-title">Your passenger name</h3>
      <div className="card row">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} />
        <button className="btn btn-primary" onClick={() => update((p) => ({ ...p, name: name.trim() || 'Traveller' }))}>
          Save
        </button>
      </div>
    </div>
  );
}
