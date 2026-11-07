import { useMemo, useState } from 'react';
import { Quiz } from '../components/Quiz';
import { Landing } from '../components/Aircraft';
import { dailyQuestions } from '../data/dailyQuestions';
import { dayKey, flightNumber } from '../lib/dates';
import { liveStreak, recordDaily, useProfile } from '../lib/profile';
import { seeded, shuffle, toPlay } from '../lib/random';
import { Flame } from '../components/Icons';
import { Customs } from '../components/Customs';
import { loadResults, saveResults } from '../lib/customs';
import { sharePass } from '../lib/share';
import type { Level, Screen } from '../types';

// Ten questions that climb from a warm-up to the stratosphere.
const RAMP: Level[] = [1, 2, 3, 3, 4, 4, 5, 5, 6, 6];

export function dailySet(day = dayKey()) {
  const rand = seeded(`flight-daily-${day}`);
  const pools = new Map<Level, typeof dailyQuestions>();
  for (const q of shuffle(dailyQuestions, rand)) pools.set(q.level, [...(pools.get(q.level) ?? []), q]);
  return RAMP.map((level) => toPlay(pools.get(level)!.pop()!, rand));
}

export function Daily({ go }: { go: (s: Screen) => void }) {
  const { profile, update } = useProfile();
  const today = dayKey();
  const questions = useMemo(() => dailySet(today), [today]);
  const already = profile.daily[today];
  const [justLanded, setJustLanded] = useState<number | null>(null);
  const [results, setResults] = useState(() => loadResults(today));
  const [shareState, setShareState] = useState<'idle' | 'busy' | 'copied'>('idle');

  if (already !== undefined || justLanded !== null) {
    const score = justLanded ?? already;
    const streak = liveStreak(profile);
    const share = async () => {
      setShareState('busy');
      const how = await sharePass({ flight: flightNumber(), date: today, score, results, streak }).catch(() => 'cancelled' as const);
      setShareState(how === 'copied' ? 'copied' : 'idle');
    };
    return (
      <div className="screen landed">
        <Landing />
        <div className="arrivals mono">
          <span>{flightNumber()}</span>
          <span>GEN → REV</span>
          <span className="arrivals-status">LANDED</span>
        </div>
        <h1 className="landed-score">
          {score}
          <span>/10</span>
        </h1>
        <p className="landed-msg">{verdict(score)}</p>
        <div className="landed-streak">
          <Flame size={30} className="flame-on" />
          <div>
            <strong>{streak}-day streak</strong>
            <span>Your next flight boards at midnight.</span>
          </div>
        </div>
        {results.length === 10 && (
          <button className="btn btn-primary" disabled={shareState === 'busy'} onClick={share}>
            {shareState === 'copied' ? 'Copied — paste it anywhere' : 'Share your boarding pass'}
          </button>
        )}
        <Customs questions={questions} results={results} />
        <button className="btn btn-ghost" onClick={() => go({ name: 'bookclub' })}>
          Continue to Book Club
        </button>
        <button className="btn btn-ghost" onClick={() => go({ name: 'home' })}>
          Back to the terminal
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <Quiz
        questions={questions}
        route={{ from: 'GEN', to: 'REV' }}
        onFinish={(score, answers) => {
          saveResults(today, answers);
          setResults(answers);
          update((p) => recordDaily(p, score, today));
          setJustLanded(score);
        }}
      />
    </div>
  );
}

function verdict(score: number) {
  if (score === 10) return 'A perfect landing — all the way through the stratosphere.';
  if (score >= 8) return 'Smooth flight, even at altitude.';
  if (score >= 5) return 'Solid journey. The upper air got bumpy.';
  return 'A rough ride up high, but you landed. Back on board tomorrow.';
}
