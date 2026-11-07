import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { PlayQuestion } from '../types';
import { Altimeter, FlightMap } from './Aircraft';
import { curly } from '../lib/text';
import { chime, setSound, soundOn, testChime } from '../lib/sound';

type Props = {
  questions: PlayQuestion[];
  route: { from: string; to: string };
  onFinish: (score: number, results: boolean[]) => void;
  // A stop between questions (the Gate change): shown once, after question `after`.
  interlude?: { after: number; render: (resume: () => void) => ReactNode };
};

// Shared quiz engine: one question at a time, reveal + reference, seat-back map progress.
export function Quiz({ questions, route, onFinish, interlude }: Props) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [choice, setChoice] = useState<number | null>(null);
  const [sequence, setSequence] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [sound, setSoundState] = useState(soundOn);
  const q = questions[index];
  const revealed = results[index] !== undefined;
  const correct = results[index];
  const revealRef = useRef<HTMLDivElement>(null);
  const [stopover, setStopover] = useState<'ahead' | 'now' | 'done'>(interlude ? 'ahead' : 'done');

  // On a phone the answer card lands below the tab bar: bring it into view, and start each new question at the top.
  useEffect(() => {
    if (revealed) revealRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [revealed]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [index]);

  const settle = (ok: boolean) => {
    const next = [...results];
    next[index] = ok;
    setResults(next);
    chime(ok);
    if (!ok) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  const pick = (i: number) => {
    if (revealed) return;
    setChoice(i);
    settle(i === q.answer);
  };

  const tapOrderItem = (item: string) => {
    if (revealed) return;
    setSequence((s) => (s.includes(item) ? s.filter((x) => x !== item) : [...s, item]));
  };

  const advance = () => {
    setChoice(null);
    setSequence([]);
    if (interlude && stopover === 'ahead' && index + 1 === interlude.after) {
      setStopover('now');
      window.scrollTo({ top: 0 });
      return;
    }
    if (index + 1 < questions.length) setIndex(index + 1);
    else onFinish(results.filter(Boolean).length, results);
  };

  const toggleSound = () => {
    setSound(!sound);
    setSoundState(!sound);
    if (!sound) testChime();
  };

  if (interlude && stopover === 'now') {
    return (
      <>
        {interlude.render(() => {
          setStopover('done');
          setIndex(index + 1);
        })}
      </>
    );
  }

  return (
    <div className={`quiz ${shake ? 'turbulence' : ''}`}>
      <FlightMap from={route.from} to={route.to} progress={(index + (revealed ? 1 : 0)) / questions.length} step={index + 1} total={questions.length} level={q.level} />

      <div className="quiz-meta">
        <Altimeter level={q.level} />
        <div className="quiz-meta-side">
          {q.tag && <span className="pill">{q.tag}</span>}
          <button className="sound-toggle" onClick={toggleSound} aria-pressed={sound} title="Cabin sounds">
            {sound ? '🔔 On' : '🔕 Off'}
          </button>
        </div>
      </div>

      <h2 className="quiz-prompt">{curly(q.prompt)}</h2>

      {q.kind === 'choice' ? (
        <div className="options">
          {q.options.map((opt, i) => {
            let cls = 'option';
            if (revealed && i === q.answer) cls += ' correct';
            else if (revealed && i === choice) cls += ' wrong';
            else if (revealed) cls += ' dim';
            return (
              <button key={i} className={cls} onClick={() => pick(i)} disabled={revealed}>
                <span className="option-key mono">{'ABCD'[i]}</span>
                <span>{curly(opt)}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="options">
          <p className="hint">Tap the items in order — first to last. Tap again to undo.</p>
          {(revealed ? q.order : q.options).map((item) => {
            const pos = sequence.indexOf(item);
            let cls = 'option';
            if (revealed) cls += sequence[q.order.indexOf(item)] === item ? ' correct' : ' wrong';
            else if (pos >= 0) cls += ' placed';
            return (
              <button key={item} className={cls} onClick={() => tapOrderItem(item)} disabled={revealed}>
                <span className="option-key mono">{revealed ? q.order.indexOf(item) + 1 : pos >= 0 ? pos + 1 : '·'}</span>
                <span>{item}</span>
              </button>
            );
          })}
          {!revealed && (
            <button className="btn btn-primary" disabled={sequence.length < q.order.length} onClick={() => settle(sequence.every((s, i) => s === q.order[i]))}>
              Lock in order
            </button>
          )}
        </div>
      )}

      {revealed && (
        <div ref={revealRef} className={`reveal ${correct ? 'reveal-good' : 'reveal-bad'}`}>
          <strong>{correct ? 'Smooth air.' : 'Turbulence.'}</strong>
          {q.kind === 'order' && !correct && <p>The list above now shows the correct order.</p>}
          <span className="mono ref">{q.ref}</span>
          {q.note && <p>{curly(q.note)}</p>}
          <button className="btn btn-primary" onClick={advance}>
            {index + 1 < questions.length ? 'Next question' : 'Begin descent'}
          </button>
        </div>
      )}
    </div>
  );
}
