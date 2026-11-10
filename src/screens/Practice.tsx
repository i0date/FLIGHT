import { useState } from 'react';
import { Customs } from '../components/Customs';
import { Quiz } from '../components/Quiz';
import { dailyQuestions } from '../data/dailyQuestions';
import { bookClubQuestions } from '../data/bookClubQuestions';
import { bookById } from '../data/books';
import { LEVELS, formatFt } from '../lib/levels';
import { shuffle, toPlay } from '../lib/random';
import type { Level, PlayQuestion, RawQuestion, Screen } from '../types';

// Practice: pick an altitude and fly ten questions from it, as often as you like. Difficulty is how
// high you fly, never where you sit. Practice never touches streaks, scores, miles or stamps.

type Band = { id: 'low' | 'cruise' | 'high'; code: string; name: string; levels: [Level, Level]; blurb: string };

export const BANDS: Band[] = [
  { id: 'low', code: 'LO', name: 'Low altitude', levels: [1, 2], blurb: 'Well-known verses, people and places.' },
  { id: 'cruise', code: 'CR', name: 'Cruising', levels: [3, 4], blurb: 'Connections, order of events and the details.' },
  { id: 'high', code: 'HI', name: 'High altitude', levels: [5, 6], blurb: 'Deep cuts and the whole Bible at once.' },
];

const SIZE = 10;
const BEST_KEY = 'flight-practice-best';

// Every question in the app, each Book Club one tagged with its book so it reads on its own.
const BANK: { raw: RawQuestion; book?: string }[] = [
  ...dailyQuestions.map((raw) => ({ raw })),
  ...Object.entries(bookClubQuestions).flatMap(([id, qs]) => qs.map((raw) => ({ raw, book: bookById(id)?.name }))),
];

const poolSize = (band: Band) => BANK.filter((q) => band.levels.includes(q.raw.level)).length;

// Five from each of the band's two levels, easier first.
function practiceSet(band: Band): PlayQuestion[] {
  return band.levels.flatMap((level) =>
    shuffle(BANK.filter((q) => q.raw.level === level))
      .slice(0, SIZE / 2)
      .map(({ raw, book }) => {
        const q = toPlay(raw);
        return book ? { ...q, tag: book } : q;
      }),
  );
}

// Best scores live on this device only: practice is for you, not the boards.
function loadBest(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) ?? '{}');
  } catch {
    return {};
  }
}
function saveBest(best: Record<string, number>) {
  try {
    localStorage.setItem(BEST_KEY, JSON.stringify(best));
  } catch {
    // Private browsing: the best score just isn't kept.
  }
}

export function Practice({ go }: { go: (s: Screen) => void }) {
  const [band, setBand] = useState<Band | null>(null);
  const [questions, setQuestions] = useState<PlayQuestion[]>([]);
  const [flight, setFlight] = useState(0);
  const [landed, setLanded] = useState<{ score: number; answers: boolean[] } | null>(null);
  const [best, setBest] = useState(loadBest);

  const board = (b: Band) => {
    setBand(b);
    setQuestions(practiceSet(b));
    setFlight((n) => n + 1);
    setLanded(null);
  };

  if (band && landed) {
    const record = landed.score >= (best[band.id] ?? 0);
    return (
      <div className="screen landed">
        <p className="mono muted small">PRACTICE · {band.name.toUpperCase()}</p>
        <h1 className="landed-score">{landed.score}<span>/10</span></h1>
        <p className="landed-msg">
          {record && landed.score > 0 ? `Your best at ${band.name.toLowerCase()} so far.` : `Your best here is ${best[band.id]}/10.`} Practice doesn't change your streak, scores or miles.
        </p>
        <Customs questions={questions} results={landed.answers} />
        <button className="btn btn-primary" onClick={() => board(band)}>Fly again at {band.name.toLowerCase()}</button>
        <button className="btn btn-ghost" onClick={() => { setBand(null); setLanded(null); }}>Choose another altitude</button>
      </div>
    );
  }

  if (band) {
    return (
      <div className="screen">
        <p className="mono muted small">PRACTICE · {band.name.toUpperCase()}</p>
        <Quiz
          key={flight}
          questions={questions}
          route={{ from: 'GEN', to: 'REV' }}
          onFinish={(score, answers) => {
            if (score > (best[band.id] ?? -1)) {
              const next = { ...best, [band.id]: score };
              setBest(next);
              saveBest(next);
            }
            setLanded({ score, answers });
          }}
        />
        <button className="btn btn-ghost" onClick={() => setBand(null)}>Leave this flight</button>
      </div>
    );
  }

  return (
    <div className="screen">
      <header className="page-head">
        <h1>Practice</h1>
        <p>Choose how high to fly. Ten questions every time, as often as you like. Practice doesn't change your streak, scores or miles.</p>
      </header>
      <div className="practice-bands">
        {BANDS.map((b) => {
          const [lo, hi] = b.levels.map((l) => LEVELS[l]);
          return (
            <button key={b.id} className={`practice-band practice-${b.id}`} onClick={() => board(b)}>
              <span className="practice-code mono">{b.code}</span>
              <span className="practice-body">
                <strong>{b.name}</strong>
                <span>{b.blurb}</span>
                <span className="mono small">{lo.ft.toLocaleString('en-GB')}–{formatFt(hi.ft)} · {lo.skill}, {hi.skill.toLowerCase()} · {poolSize(b)} questions</span>
              </span>
              <span className="practice-best mono">{best[b.id] !== undefined ? `BEST ${best[b.id]}/10` : 'BOARD'}</span>
            </button>
          );
        })}
      </div>
      <button className="btn btn-ghost" onClick={() => go({ name: 'home' })}>Back to the terminal</button>
    </div>
  );
}
