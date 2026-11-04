import { useMemo, useState } from 'react';
import { Quiz } from '../components/Quiz';
import { PlaneWindow } from '../components/Aircraft';
import { Lock } from '../components/Icons';
import { dailyQuestions } from '../data/dailyQuestions';
import { bookClubQuestions } from '../data/bookClubQuestions';
import { weekKey } from '../lib/dates';
import { useProfile } from '../lib/profile';
import { seeded, shuffle, toPlay } from '../lib/random';
import type { Screen } from '../types';

const NIGHT_SIZE = 10;

// Ten stratosphere questions drawn from every level-6 question in the app — the same ten for
// everyone each ISO week.
export function nightSet(week = weekKey()) {
  const pool = [...dailyQuestions, ...Object.values(bookClubQuestions).flat()].filter((q) => q.level === 6);
  const rand = seeded(`flight-night-${week}`);
  return shuffle(pool, rand).slice(0, NIGHT_SIZE).map((q) => toPlay(q, rand));
}

export function NightFlight({ go }: { go: (s: Screen) => void }) {
  const { profile, update } = useProfile();
  const week = weekKey();
  const questions = useMemo(() => nightSet(week), [week]);
  const flown = profile.nightFlights[week];
  const [justLanded, setJustLanded] = useState<number | null>(null);
  const [flying, setFlying] = useState(false);

  const header = (
    <header className="night-head">
      <PlaneWindow streak={60} hour={23} />
      <div>
        <p className="mono small">NIGHT FLIGHT · {week}</p>
        <h1>Ten questions in the stratosphere</h1>
        <p>A new flight every Monday. Every question is level 6, drawn from the whole Bible. One flight per week.</p>
      </div>
    </header>
  );

  if (!profile.premium) {
    return (
      <div className="screen">
        {header}
        <button className="upsell" onClick={() => go({ name: 'premium' })}>
          <Lock /> <span>Night Flight is a Flight Club perk.</span>
        </button>
      </div>
    );
  }

  const score = justLanded ?? flown;
  if (score !== undefined) {
    return (
      <div className="screen">
        {header}
        <div className="card night-result">
          <p className="mono small muted">THIS WEEK</p>
          <h2 className="landed-score">{score}<span>/{NIGHT_SIZE}</span></h2>
          <p>{score >= 8 ? 'Remarkable. Few fly this high.' : score >= 5 ? 'A strong showing in thin air.' : 'Thin air up here. The next Night Flight boards on Monday.'}</p>
          <p className="small muted">+{score * 200} Frequent Flyer miles</p>
        </div>
        <button className="btn btn-ghost" onClick={() => go({ name: 'home' })}>Back to the terminal</button>
      </div>
    );
  }

  if (!flying) {
    return (
      <div className="screen">
        {header}
        <button className="btn btn-primary" onClick={() => setFlying(true)}>Take off</button>
      </div>
    );
  }

  return (
    <div className="screen">
      <Quiz
        questions={questions}
        route={{ from: 'DSK', to: 'DWN' }}
        onFinish={(s) => {
          update((p) => ({ ...p, nightFlights: { ...p.nightFlights, [week]: s } }));
          setJustLanded(s);
        }}
      />
    </div>
  );
}
