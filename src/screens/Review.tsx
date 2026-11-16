import { useState } from 'react';
import { Customs } from '../components/Customs';
import { Quiz } from '../components/Quiz';
import { dailyBank } from '../data/dailyBank';
import { dailyQuestions } from '../data/dailyQuestions';
import { bookClubQuestions } from '../data/bookClubQuestions';
import { bookById } from '../data/books';
import { REVIEW_SIZE, dueForReview, noteReview, waitingForReview } from '../lib/review';
import { toPlay } from '../lib/random';
import type { PlayQuestion, RawQuestion, Screen } from '../types';

// Every question a flight can ask, by id, each Book Club one tagged with its book.
const byId = new Map<string, { raw: RawQuestion; book?: string }>([
  ...[...dailyQuestions, ...dailyBank].map((raw) => [raw.id, { raw }] as const),
  ...Object.entries(bookClubQuestions).flatMap(([id, qs]) => qs.map((raw) => [raw.id, { raw, book: bookById(id)?.name }] as const)),
]);

function reviewSet(): PlayQuestion[] {
  return dueForReview()
    .map((id) => byId.get(id))
    .filter((q): q is { raw: RawQuestion; book?: string } => !!q)
    .slice(0, REVIEW_SIZE)
    .sort((a, b) => a.raw.level - b.raw.level)
    .map(({ raw, book }) => (book ? { ...toPlay(raw), tag: book } : toPlay(raw)));
}

export function Review({ go }: { go: (s: Screen) => void }) {
  const [questions] = useState(reviewSet);
  const [landed, setLanded] = useState<{ score: number; answers: boolean[] } | null>(null);

  if (landed) {
    const left = waitingForReview();
    return (
      <div className="screen landed">
        <p className="mono muted small">REVIEW FLIGHT</p>
        <h1 className="landed-score">{landed.score}<span>/{questions.length}</span></h1>
        <p className="landed-msg">
          Questions you got right come back once more in a week, then they’re yours to keep. The ones you missed come back in two days.
          {left > 0 ? ` ${left} question${left === 1 ? '' : 's'} in review.` : ' Nothing left in review.'}
        </p>
        <Customs questions={questions} results={landed.answers} />
        <button className="btn btn-primary" onClick={() => go({ name: 'home' })}>Back to the terminal</button>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="screen">
        <header className="page-head">
          <h1>Review flight</h1>
          <p>Nothing due today. Questions you miss come back here two days later, and again a week after you get them right.</p>
        </header>
        <button className="btn btn-ghost" onClick={() => go({ name: 'home' })}>Back to the terminal</button>
      </div>
    );
  }

  return (
    <div className="screen">
      <p className="mono muted small">REVIEW FLIGHT · {questions.length} QUESTION{questions.length === 1 ? '' : 'S'}</p>
      <Quiz
        questions={questions}
        route={{ from: 'GEN', to: 'REV' }}
        review
        onFinish={(score, answers) => {
          questions.forEach((q, i) => noteReview(q.id, answers[i]));
          setLanded({ score, answers });
        }}
      />
      <button className="btn btn-ghost" onClick={() => go({ name: 'home' })}>Leave this flight</button>
    </div>
  );
}
