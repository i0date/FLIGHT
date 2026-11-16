import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LEVELS, formatFt } from '../lib/levels';
import { PlaneMascot } from './Aircraft';
import type { Level } from '../types';

// Three short cards for someone opening FLIGHT for the first time, ending at their first Daily Flight.
// Shown once per device; a traveller who has already flown never sees it.

const SEEN_KEY = 'flight-welcomed';

export function hasBeenWelcomed() {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return true; // Storage blocked: don't show it every visit.
  }
}

function markWelcomed() {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    // Storage blocked: nothing to remember.
  }
}

const CARDS = [
  {
    title: 'Welcome aboard',
    body: 'FLIGHT is a Bible quiz you take once a day: ten questions, from Genesis to Revelation, the same for everyone.',
  },
  {
    title: 'It climbs as you go',
    body: 'The first questions are well known. Each one is a little harder, up to the stratosphere. Miss one and you’ll see where to read it.',
  },
  {
    title: 'Come back tomorrow',
    body: 'Fly every day to build your streak and earn miles. Book Club takes you through one book at a time, with a passport stamp for each.',
  },
];

export function Welcome({ onBoard, onClose }: { onBoard: () => void; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const last = step === CARDS.length - 1;

  useEffect(() => heading.current?.focus(), [step]);

  const close = () => {
    markWelcomed();
    onClose();
  };
  const board = () => {
    markWelcomed();
    onBoard();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Drawn on the page itself, above every screen and the tab bar.
  return createPortal(
    <div className="welcome-backdrop">
      <div className="welcome" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
        <div className="welcome-art" aria-hidden="true">
          {step === 1 ? (
            <ol className="welcome-levels">
              {([1, 2, 3, 4, 5, 6] as Level[]).map((l) => (
                <li key={l} style={{ marginLeft: `${(l - 1) * 8}%` }}>
                  <span className="mono">{formatFt(LEVELS[l].ft)}</span> {LEVELS[l].name}
                </li>
              ))}
            </ol>
          ) : (
            <PlaneMascot width={step === 0 ? 190 : 150} className="club-plane" />
          )}
        </div>
        <p className="mono small welcome-step">{step + 1} / {CARDS.length}</p>
        <h2 id="welcome-title" ref={heading} tabIndex={-1}>{CARDS[step].title}</h2>
        <p>{CARDS[step].body}</p>
        <div className="welcome-actions">
          {last ? (
            <button className="btn btn-primary" onClick={board}>Board your first flight</button>
          ) : (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Next</button>
          )}
          <button className="btn btn-ghost" onClick={close}>{last ? 'Look around first' : 'Skip'}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
