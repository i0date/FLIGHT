import { useMemo, useState } from 'react';
import { Customs } from '../components/Customs';
import { books, bookById } from '../data/books';
import { LEGS, LEG_SIZE, STAMP_PASS, STAMP_TOTAL, bookClubQuestions, legQuestions } from '../data/bookClubQuestions';
import { bookScore, legsFlown, recordLeg, useProfile } from '../lib/profile';
import { toPlay } from '../lib/random';
import { Quiz } from '../components/Quiz';
import { Landing } from '../components/Aircraft';
import { Lock } from '../components/Icons';
import { Postcard } from '../components/Postcard';
import type { Screen } from '../types';

// Each book flies to the next one; Revelation lands in the New Jerusalem.
const nextCode = (id: string) => {
  const i = books.findIndex((b) => b.id === id);
  return books[i + 1]?.code ?? 'NJR';
};

export function BookQuiz({ bookId, go }: { bookId: string; go: (s: Screen) => void }) {
  const { profile, update } = useProfile();
  const book = bookById(bookId);
  const progress = profile.bookClub[bookId];
  const [leg, setLeg] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ leg: number; score: number; justEarned: boolean; answers: boolean[] } | null>(null);
  const questions = useMemo(() => (leg === null ? [] : legQuestions(bookId, leg).map((q) => toPlay(q))), [bookId, leg, attempt]);

  if (!book || !bookClubQuestions[bookId]) {
    return (
      <div className="screen">
        <p>This route isn't open yet.</p>
        <button className="btn btn-ghost" onClick={() => go({ name: 'bookclub' })}>Back to Book Club</button>
      </div>
    );
  }

  const total = bookScore(progress);
  const flown = legsFlown(progress);
  const fly = (l: number) => { setResult(null); setLeg(l); setAttempt((a) => a + 1); };

  // After a leg: score, running total and stamp status.
  if (result) {
    const nextLeg = result.leg + 1 < LEGS.length && progress?.legs[result.leg + 1] === null ? result.leg + 1 : null;
    return (
      <div className="screen landed">
        {result.justEarned && profile.premium ? (
          <div className="big-stamp">
            <span className="mono">{book.code}</span>
            <small>BOOK CLUB · STAMPED</small>
          </div>
        ) : (
          <Landing />
        )}
        <p className="mono muted small">{book.name.toUpperCase()} · LEG {result.leg + 1} · {LEGS[result.leg].name.toUpperCase()}</p>
        <h1 className="landed-score">{result.score}<span>/{LEG_SIZE}</span></h1>
        <p className="landed-msg">
          {result.justEarned
            ? `${total}/${STAMP_TOTAL} — you earned the ${book.name} stamp!`
            : flown < LEGS.length
              ? `${LEGS.length - flown} leg${LEGS.length - flown === 1 ? '' : 's'} to go. Running total ${total}/${STAMP_TOTAL}.`
              : progress?.earnedAt
                ? `Stamp already earned. Best total ${total}/${STAMP_TOTAL}.`
                : `${total}/${STAMP_TOTAL} — you need ${STAMP_PASS}. Re-fly any leg to raise your score.`}
        </p>
        {result.justEarned && progress?.earnedAt && (
          <section className="pc-arrival">
            <p className="mono small muted">✉ YOU'VE GOT MAIL · A POSTCARD FROM {book.name.toUpperCase()}</p>
            <Postcard book={book} name={profile.name} earnedAt={progress.earnedAt} score={total} />
          </section>
        )}
        {result.justEarned && !profile.premium && (
          <button className="upsell" onClick={() => go({ name: 'premium' })}>
            <Lock /> <span>Stamp earned! Become a Frequent Flyer to put {book.name} in your passport.</span>
          </button>
        )}
        <Customs questions={questions} results={result.answers} />
        {nextLeg !== null && <button className="btn btn-primary" onClick={() => fly(nextLeg)}>Fly leg {nextLeg + 1} · {LEGS[nextLeg].name}</button>}
        <button className={nextLeg !== null ? 'btn btn-ghost' : 'btn btn-primary'} onClick={() => { setResult(null); setLeg(null); }}>Back to {book.name}</button>
      </div>
    );
  }

  if (leg !== null) {
    return (
      <div className="screen">
        <header className="page-head compact">
          <p className="mono muted small">BOOK CLUB · {book.code} · LEG {leg + 1} OF 3</p>
          <h1>{book.name}: {LEGS[leg].name}</h1>
        </header>
        <Quiz
          key={attempt}
          questions={questions}
          route={{ from: book.code, to: nextCode(book.id) }}
          onFinish={(score, answers) => {
            const before = profile.bookClub[bookId]?.earnedAt;
            const next = recordLeg(profile, bookId, leg, score);
            update((p) => recordLeg(p, bookId, leg, score));
            setResult({ leg, score, justEarned: !before && !!next.bookClub[bookId].earnedAt, answers });
          }}
        />
      </div>
    );
  }

  // Choose a leg.
  return (
    <div className="screen">
      <header className="page-head compact">
        <p className="mono muted small">BOOK CLUB · {book.code}</p>
        <h1>{book.name}</h1>
        <p>{book.chapters} chapters · 21 questions in three legs. Score {STAMP_PASS} of {STAMP_TOTAL} for the stamp.</p>
      </header>
      <div className="leg-total">
        <div className="passport-bar"><div className="passport-fill" style={{ width: `${(total / STAMP_TOTAL) * 100}%` }} /></div>
        <span className="mono small">{total}/{STAMP_TOTAL} {progress?.earnedAt ? '· STAMP EARNED' : `· NEED ${STAMP_PASS}`}</span>
      </div>
      <div className="legs">
        {LEGS.map((l, i) => {
          const best = progress?.legs[i] ?? null;
          const locked = i > 0 && (progress?.legs[i - 1] ?? null) === null;
          return (
            <button key={l.name} className={`leg ${locked ? 'leg-locked' : ''}`} disabled={locked} onClick={() => fly(i)}>
              <span className="leg-num mono">{i + 1}</span>
              <span className="leg-body">
                <strong>{l.name}</strong>
                <span>{locked ? `Fly leg ${i} first` : l.blurb}</span>
              </span>
              <span className="leg-score mono">{best === null ? (locked ? '🔒' : 'FLY') : `${best}/${LEG_SIZE}`}</span>
            </button>
          );
        })}
      </div>
      {progress?.earnedAt && (
        <section className="pc-arrival">
          <h3 className="section-title">Your postcard</h3>
          <Postcard book={book} name={profile.name} earnedAt={progress.earnedAt} score={total} />
        </section>
      )}
      <button className="btn btn-ghost" onClick={() => go({ name: 'bookclub' })}>Back to Book Club</button>
    </div>
  );
}
