import { books, bookById } from '../data/books';
import { LEGS, STAMP_PASS, STAMP_TOTAL } from '../data/bookClubRules';
import { bookScore, legsFlown, useProfile, type BookProgress } from '../lib/profile';
import { Lock } from '../components/Icons';
import type { Screen } from '../types';

const sections = [...new Set(books.map((b) => b.section))];

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
          <Lock /> <span>Passport stamps are a Frequent Flyer perk. {earned > 0 ? `Your ${earned} earned stamp${earned === 1 ? '' : 's'} will go into your passport the moment you join.` : 'Earn stamps by flying, then join to put them in your passport.'}</span>
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
                const result = profile.bookClub[b.id];
                const stamped = !!result?.earnedAt && profile.premium;
                const joined = profile.joinedBooks.includes(b.id);
                return (
                  <div key={b.id} className={`stamp ${stamped ? 'stamp-done' : ''} ${result && !stamped ? 'stamp-flown' : ''}`}>
                    <button className="stamp-face" onClick={() => go({ name: 'book', bookId: b.id })}>
                      <span className="stamp-code mono">{b.code}</span>
                      <span className="stamp-name">{b.name}</span>
                      <span className={`stamp-state ${result ? '' : 'quiet'}`}>{stampState(result, profile.premium, b.chapters)}</span>
                    </button>
                    <button className={`stamp-join ${joined ? 'on' : ''}`} onClick={() => toggleJoin(b.id)} aria-pressed={joined}>
                      {joined ? 'Studying' : 'Join'}
                    </button>
                  </div>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}

function stampState(r: BookProgress | undefined, premium: boolean, chapters: number) {
  if (!r) return `${chapters} ${chapters === 1 ? 'chapter' : 'chapters'}`;
  if (r.earnedAt) return premium ? `${bookScore(r)}/21 ✓` : `${bookScore(r)}/21 · unstamped`;
  if (legsFlown(r) < LEGS.length) return `Leg ${legsFlown(r)}/3`;
  return `${bookScore(r)}/21 · retry`;
}
