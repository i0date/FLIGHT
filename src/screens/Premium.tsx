import { useState } from 'react';
import { useProfile } from '../lib/profile';
import { PlaneMascot } from '../components/Aircraft';

const PERKS = [
  { title: 'Passport stamps', body: 'Every Book Club route you complete is stamped in your passport.' },
  { title: 'Private leaderboards', body: 'Boards for your friends, family or church.' },
  { title: 'Streak shield', body: 'Miss a day? One shield a week keeps your streak alive.' },
  { title: 'Night Flight', body: 'A weekly challenge flown entirely in the stratosphere. Coming soon.' },
  { title: 'Flight archive', body: 'Replay any past Daily Flight. Coming soon.' },
];

const PLANS = [
  { name: 'Individual', body: 'Flight Club for one traveller.' },
  { name: 'Family', body: 'Up to 6 travellers, with a family leaderboard.' },
  { name: 'Church & groups', body: 'Seats for your whole congregation or study group.' },
];

export function Premium() {
  const { profile, update } = useProfile();
  const [name, setName] = useState(profile.name);

  return (
    <div className="screen">
      <header className="page-head flight-club">
        <p className="mono small">MEMBERSHIP</p>
        <h1>Flight Club</h1>
        <p>The daily flight and streaks are free for everyone. Flight Club adds:</p>
        <PlaneMascot width={200} className="club-plane" />
      </header>

      <div className="perks">
        {PERKS.map((p) => (
          <div key={p.title} className="perk">
            <strong>{p.title}</strong>
            <span>{p.body}</span>
          </div>
        ))}
      </div>

      <h3 className="section-title">Plans</h3>
      <div className="plans">
        {PLANS.map((p) => (
          <div key={p.name} className="plan">
            <strong>{p.name}</strong>
            <span>{p.body}</span>
          </div>
        ))}
      </div>

      {profile.premium ? (
        <div className="card">
          <p><strong>You're in Flight Club.</strong> Welcome aboard.</p>
          <button className="btn btn-ghost" onClick={() => update((p) => ({ ...p, premium: false }))}>
            Leave Flight Club (demo)
          </button>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={() => update((p) => ({ ...p, premium: true }))}>
          Join Flight Club (demo — no payment taken)
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
