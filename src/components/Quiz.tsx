import { useState } from 'react';
import type { PlayQuestion } from '../types';
import { Plane } from './Icons';

type Props = {
  questions: PlayQuestion[];
  stageLabel?: (i: number) => { title: string; sub: string };
  onFinish: (score: number, picks: number[]) => void;
};

// Shared quiz engine: one question at a time, reveal + reference, flight-path progress.
export function Quiz({ questions, stageLabel, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const q = questions[index];
  const picked = picks[index];
  const revealed = picked !== undefined;
  const progress = (index + (revealed ? 1 : 0)) / questions.length;
  const stage = stageLabel?.(index);

  const choose = (i: number) => {
    if (revealed) return;
    const next = [...picks];
    next[index] = i;
    setPicks(next);
  };

  const advance = () => {
    if (index + 1 < questions.length) setIndex(index + 1);
    else onFinish(picks.filter((p, i) => p === questions[i].answer).length, picks);
  };

  return (
    <div className="quiz">
      <div className="flightpath" role="progressbar" aria-valuenow={index + 1} aria-valuemax={questions.length}>
        <div className="flightpath-trail" style={{ width: `${progress * 100}%` }} />
        <div className="flightpath-plane" style={{ left: `${progress * 100}%` }}>
          <Plane size={22} />
        </div>
      </div>
      <div className="quiz-meta">
        <span className="mono">
          Q{index + 1}/{questions.length}
        </span>
        {stage ? (
          <span className="pill pill-sky">
            {stage.title} · {stage.sub}
          </span>
        ) : (
          q.tag && <span className="pill">{q.tag}</span>
        )}
      </div>

      <h2 className="quiz-prompt">{q.prompt}</h2>

      <div className="options">
        {q.options.map((opt, i) => {
          let cls = 'option';
          if (revealed && i === q.answer) cls += ' correct';
          else if (revealed && i === picked) cls += ' wrong';
          else if (revealed) cls += ' dim';
          return (
            <button key={i} className={cls} onClick={() => choose(i)} disabled={revealed}>
              <span className="option-key mono">{'ABCD'[i]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className={`reveal ${picked === q.answer ? 'reveal-good' : 'reveal-bad'}`}>
          <strong>{picked === q.answer ? 'Smooth air.' : 'Turbulence.'}</strong>{' '}
          <span className="mono ref">{q.ref}</span>
          {q.note && <p>{q.note}</p>}
          <button className="btn btn-primary" onClick={advance}>
            {index + 1 < questions.length ? 'Next question' : 'Land the plane'}
          </button>
        </div>
      )}
    </div>
  );
}
