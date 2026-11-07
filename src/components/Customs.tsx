import { curly } from '../lib/text';
import type { PlayQuestion } from '../types';

// After landing, "declare" the questions you missed: the right answer, where to read it, and the note.
export function Customs({ questions, results }: { questions: PlayQuestion[]; results: boolean[] }) {
  const missed = questions.filter((_, i) => results[i] === false);
  if (!results.length) return null;

  return (
    <section className="customs" aria-label="Customs">
      <header className="customs-head">
        <span className="mono small">CUSTOMS</span>
        <strong>{missed.length ? `${missed.length} item${missed.length === 1 ? '' : 's'} to declare` : 'Nothing to declare'}</strong>
      </header>
      {missed.length ? (
        <ol className="customs-list">
          {missed.map((q) => (
            <li key={q.id}>
              <p className="customs-q">{curly(q.prompt)}</p>
              <p className="customs-a">{q.kind === 'choice' ? curly(q.options[q.answer]) : q.order.join(' → ')}</p>
              <span className="mono ref">{q.ref}</span>
              {q.note && <p className="customs-note">{curly(q.note)}</p>}
            </li>
          ))}
        </ol>
      ) : (
        <p className="customs-clear">Every answer cleared. Straight through to arrivals.</p>
      )}
    </section>
  );
}
