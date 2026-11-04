import { useMemo, useState } from 'react';
import { Quiz } from '../components/Quiz';
import { dailyQuestions } from '../data/dailyQuestions';
import { dayKey, flightNumber } from '../lib/dates';
import { liveStreak, recordDaily, useProfile } from '../lib/profile';
import { seeded, shuffle, toPlay } from '../lib/random';
import { Flame } from '../components/Icons';
import type { Screen } from '../types';

const QUESTIONS_PER_FLIGHT = 10;

export function dailySet(day = dayKey()) {
  const rand = seeded(`flight-daily-${day}`);
  return shuffle(dailyQuestions, rand)
    .slice(0, QUESTIONS_PER_FLIGHT)
    .map((q) => toPlay(q, rand));
}

export function Daily({ go }: { go: (s: Screen) => void }) {
  const { profile, update } = useProfile();
  const today = dayKey();
  const questions = useMemo(() => dailySet(today), [today]);
  const already = profile.daily[today];
  const [justLanded, setJustLanded] = useState<number | null>(null);

  if (already !== undefined || justLanded !== null) {
    const score = justLanded ?? already;
    const streak = liveStreak(profile);
    return (
      <div className="screen landed">
        <p className="mono muted">{flightNumber()} · ARRIVED</p>
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
        <button className="btn btn-primary" onClick={() => go({ name: 'bookclub' })}>
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
        onFinish={(score) => {
          update((p) => recordDaily(p, score, today));
          setJustLanded(score);
        }}
      />
    </div>
  );
}

function verdict(score: number) {
  if (score === 10) return 'A perfect landing. The cabin crew applauds.';
  if (score >= 8) return 'Smooth flight — barely a bump.';
  if (score >= 5) return 'Solid journey. A few pockets of turbulence.';
  return 'Bumpy ride, but you landed. Back on board tomorrow.';
}
