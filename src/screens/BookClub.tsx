import { useMemo, useState } from 'react';
import { books, bookById } from '../data/books';
import { ALTITUDES, bookClubQuestions } from '../data/bookClubQuestions';
import { recordBook, useProfile } from '../lib/profile';
import { toPlay } from '../lib/random';
import { Quiz } from '../components/Quiz';
import type { Screen } from '../types';

const sections = [...new Set(books.map((b) => b.section))];

export function BookClub({ go }: { go: (s: Screen) => void }) {
  const { profile, update } = useProfile();
  const stamped = Object.keys(profile.bookClub).length;
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
        <p>Join the club for the book you're studying, then take its 5-question climb. Stamp all 66 to complete your passport.</p>
        <div className="passport-bar">
          <div className="passport-fill" style={{ width: `${(stamped / books.length) * 100}%` }} />
        </div>
        <p className="mono muted small">
          {stamped} / {books.length} STAMPS
        </p>
      </header>

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
                const joined = profile.joinedBooks.includes(b.id);
                return (
                  <div key={b.id} className={`stamp ${result ? 'stamp-done' : ''} ${open ? '' : 'stamp-soon'}`}>
                    <button className="stamp-face" disabled={!open} onClick={() => go({ name: 'book', bookId: b.id })}>
                      <span className="stamp-code mono">{b.code}</span>
                      <span className="stamp-name">{b.name}</span>
                      <span className="stamp-state">{result ? `${result.best}/5` : open ? 'Open' : 'Soon'}</span>
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

export function BookQuiz({ bookId, go }: { bookId: string; go: (s: Screen) => void }) {
  const { profile, update } = useProfile();
  const book = bookById(bookId);
  const raw = bookClubQuestions[bookId];
  const [attempt, setAttempt] = useState(0);
  const questions = useMemo(() => raw?.map((q) => toPlay(q)) ?? [], [raw, attempt]);
  const [score, setScore] = useState<number | null>(null);

  if (!book || !raw) {
    return (
      <div className="screen">
        <p>This route isn't open yet.</p>
        <button className="btn btn-ghost" onClick={() => go({ name: 'bookclub' })}>Back to Book Club</button>
      </div>
    );
  }

  if (score !== null) {
    const best = profile.bookClub[bookId]?.best ?? score;
    return (
      <div className="screen landed">
        <div className="big-stamp">
          <span className="mono">{book.code}</span>
          <small>BOOK CLUB · STAMPED</small>
        </div>
        <h1 className="landed-score">
          {score}
          <span>/5</span>
        </h1>
        <p className="landed-msg">
          {score === 5 ? `You reached the ceiling over ${book.name}.` : `Best on ${book.name}: ${best}/5. Study on and climb again.`}
        </p>
        <button className="btn btn-primary" onClick={() => { setScore(null); setAttempt(attempt + 1); }}>
          Fly this route again
        </button>
        <button className="btn btn-ghost" onClick={() => go({ name: 'bookclub' })}>Back to passport</button>
      </div>
    );
  }

  return (
    <div className="screen">
      <header className="page-head compact">
        <p className="mono muted small">BOOK CLUB · {book.code}</p>
        <h1>{book.name}</h1>
        <p>{book.chapters} chapters · questions climb from take-off to the ceiling.</p>
      </header>
      <Quiz
        key={attempt}
        questions={questions}
        stageLabel={(i) => ({ title: ALTITUDES[i].label, sub: ALTITUDES[i].ft })}
        onFinish={(s) => {
          update((p) => recordBook(p, bookId, s));
          setScore(s);
        }}
      />
    </div>
  );
}
