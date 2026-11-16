import { useEffect, useState } from 'react';
import { parseRef, passages, type Passage } from '../lib/verses';

// A question's reference, opening onto the KJV text it points to. References to whole chapters or books
// (too long to show here) stay as a plain reference.
export function Verse({ reference, open: startOpen = false }: { reference: string; open?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  const [text, setText] = useState<Passage[] | null>(null);
  const [failed, setFailed] = useState(false);
  const readable = parseRef(reference).length > 0;

  useEffect(() => {
    if (!open || !readable) return;
    let live = true;
    setFailed(false);
    passages(reference)
      .then((p) => live && setText(p))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [open, reference, readable]);

  if (!readable) return <span className="mono ref">{reference}</span>;

  return (
    <div className="verse">
      <button className="verse-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="mono ref">{reference}</span>
        <span className="verse-action">{open ? 'Hide' : 'Read it'}</span>
      </button>
      {open && (
        <blockquote className="verse-text" aria-live="polite">
          {failed ? (
            <p className="muted small">The verse will show once you’re back online.</p>
          ) : !text ? (
            <p className="muted small">Opening the Bible…</p>
          ) : (
            text.map((p) => (
              <div key={p.label}>
                {text.length > 1 && <cite className="mono">{p.label}</cite>}
                <p>
                  {p.verses.map((v) => (
                    <span key={v.n}>
                      <sup>{v.n}</sup>
                      {v.text}{' '}
                    </span>
                  ))}
                </p>
              </div>
            ))
          )}
          <footer className="mono">KJV</footer>
        </blockquote>
      )}
    </div>
  );
}
