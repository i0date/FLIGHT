import { useMemo, useState } from 'react';
import { Customs } from '../components/Customs';
import { books, bookById } from '../data/books';
import { LEGS, LEG_SIZE, STAMP_PASS, STAMP_TOTAL, bookClubQuestions, legQuestions } from '../data/bookClubQuestions';
import { bookScore, legsFlown, recordLeg, useProfile, type BookProgress } from '../lib/profile';
import { toPlay } from '../lib/random';
import { Quiz } from '../components/Quiz';
import { Landing } from '../components/Aircraft';
import { Lock } from '../components/Icons';
import type { Screen } from '../types';

const sections = [...new Set(books.map((b) => b.section))];

// Each book flies to the next one; Revelation lands in the New Jerusalem.
const nextCode = (id: string) => {
  const i = books.findIndex((b) => b.id === id);
  return books[i + 1]?.code ?? 'NJR';
};

export function BookClub({ go }: { go: (s: Screen) => void }) {
  const { profile, update } = useProfile();
  const earned = Object.values(profile.bookClub).filter((r) => r.earnedAt).length;
  const studying = profile.joinedBooks.map(bookById).filter(Boolean);

  const toggleJoin = (id: string) =>
    update((p) => ({
      ...p,
      joinedBooks: p.joinedBooks.includes(id) ? p.joinedBooks.filter((b) => b !== id) : [...p.joinedBooks, id],
    }));

  return (
    <div className="screen">
      <header className="page-head">
        <h1>Book Club</h1>
        <p>Join the club for the book you're studying. Each book is 21 questions over three flights of 7, each harder than the last. Score {STAMP_PASS} of {STAMP_TOTAL} to earn its stamp — collect all 66.</p>
        <div className="passport-bar">
          <div className="passport-fill" style={{ width: `${(earned / books.length) * 100}%` }} />
        </div>
        <p className="mono muted small">
          {earned} / {books.length} {profile.premium ? 'STAMPS' : 'STAMPS EARNED'}
        </p>
      </header>

      {!profile.premium && (
        <button className="upsell" onClick={() => go({ name: 'premium' })}>
          <Lock /> <span>Passport stamps are a Flight Club perk. {earned > 0 ? `Your ${earned} earned stamp${earned === 1 ? '' : 's'} will go into your passport the moment you join.` : 'Earn stamps by flying, then join to put them in your passport.'}</span>
        </button>
      )}

      {studying.length > 0 && (
        <>
          <h3 className="section-title">Currently studying</h3>
          <div className="studying">
            {studying.map((b) => (
              <button key={b!.id} className="chip" onClick={() => go({ name: 'book', bookId: b!.id })}>
                {b!.name}
              </button>
            ))}
          </div>
        </>
      )}

      {sections.map((section) => (
        <section key={section}>
          <h3 className="section-title">{section}</h3>
          <div className="stamps">
            {books
              .filter((b) => b.section === section)
              .map((b) => {
                const open = !!bookClubQuestions[b.id];
                const result = profile.bookClub[b.id];
                const stamped = !!result?.earnedAt && profile.premium;
                const joined = profile.joinedBooks.includes(b.id);
                return (
                  <div key={b.id} className={`stamp ${stamped ? 'stamp-done' : ''} ${result && !stamped ? 'stamp-flown' : ''} ${open ? '' : 'stamp-soon'}`}>
                    <button className="stamp-face" disabled={!open} onClick={() => go({ name: 'book', bookId: b.id })}>
                      <span className="stamp-code mono">{b.code}</span>
                      <span className="stamp-name">{b.name}</span>
                      <span className={`stamp-state ${result ? '' : 'quiet'}`}>{stampState(result, open, profile.premium, b.chapters)}</span>
                    </button>
                    {open && (
                      <button className={`stamp-join ${joined ? 'on' : ''}`} onClick={() => toggleJoin(b.id)} aria-pressed={joined}>
                        {joined ? 'Studying' : 'Join'}
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}

function stampState(r: BookProgress | undefined, open: boolean, premium: boolean, chapters: number) {
  if (!open) return 'Soon';
  if (!r) return `${chapters} ${chapters === 1 ? 'chapter' : 'chapters'}`;
  if (r.earnedAt) return premium ? `${bookScore(r)}/21 ✓` : `${bookScore(r)}/21 · unstamped`;
  if (legsFlown(r) < LEGS.length) return `Leg ${legsFlown(r)}/3`;
  return `${bookScore(r)}/21 · retry`;
}

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
        {result.justEarned && !profile.premium && (
          <button className="upsell" onClick={() => go({ name: 'premium' })}>
            <Lock /> <span>Stamp earned! Join Flight Club to put {book.name} in your passport.</span>
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
      <button className="btn btn-ghost" onClick={() => go({ name: 'bookclub' })}>Back to Book Club</button>
    </div>
  );
}
