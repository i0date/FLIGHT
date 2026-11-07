import { useState } from 'react';
import { chime } from '../lib/sound';
import { curly } from '../lib/text';
import { MILES } from '../lib/miles';
import type { PlayQuestion } from '../types';

// The Gate change stop: a bonus question mid-flight. Answer it for extra miles; the flight's score is untouched.
export function GateChange({ gate, question, onAnswer, onContinue }: { gate: string; question: PlayQuestion; onAnswer: (ok: boolean) => void; onContinue: () => void }) {
  const [choice, setChoice] = useState<number | null>(null);
  const revealed = choice !== null;
  const correct = choice === question.answer;

  const pick = (i: number) => {
    if (revealed) return;
    setChoice(i);
    chime(i === question.answer);
    onAnswer(i === question.answer);
  };

  return (
    <div className="gate-change">
      <div className="gate-board mono" role="status">
        <span>GATE CHANGE</span>
        <span className="gate-flip">A1 → {gate}</span>
      </div>
      <p className="gate-intro">Attention passengers: this flight now departs from gate {gate}. On your way, one bonus question from the stratosphere, worth <strong>+{MILES.perGateChange} miles</strong>. It won’t change your score.</p>
      <h2 className="quiz-prompt">{curly(question.prompt)}</h2>
      <div className="options">
        {question.options.map((opt, i) => {
          let cls = 'option';
          if (revealed && i === question.answer) cls += ' correct';
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
      {revealed && (
        <div className={`reveal ${correct ? 'reveal-good' : 'reveal-bad'}`}>
          <strong>{correct ? `+${MILES.perGateChange} miles.` : 'No bonus this time.'}</strong>
          <span className="mono ref">{question.ref}</span>
          {question.note && <p>{curly(question.note)}</p>}
          <button className="btn btn-primary" onClick={onContinue}>Continue to gate {gate}</button>
        </div>
      )}
    </div>
  );
}
