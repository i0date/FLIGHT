import { useState } from 'react';
import { postcards } from '../data/postcards';
import type { Book } from '../data/books';
import { INK } from '../lib/ink';
import { DARK_SCENES, sceneSvg } from '../lib/scenes';
import { sharePostcard } from '../lib/share';
import { Verse } from './Announcement';

type Props = { book: Book; name: string; earnedAt: string; score: number };

// Big letters that still fit the card: long names (2 Thessalonians) get smaller type, in % of card width.
const nameSize = (name: string) => Math.min(14, 88 / (0.68 * name.length));

// The picture side: a travel-poster scene with "Greetings from" and the book's name.
export function PostcardFront({ book }: { book: Book }) {
  const card = postcards[book.id];
  return (
    <div className={`pc-front ${DARK_SCENES.has(card.scene) ? 'pc-night' : ''}`}>
      <div className="pc-scene" aria-hidden="true" dangerouslySetInnerHTML={{ __html: sceneSvg(card.scene, INK[book.section]) }} />
      <div className="pc-title">
        <span className="pc-greetings">Greetings from</span>
        <span className="pc-name" style={{ color: INK[book.section], fontSize: `${nameSize(book.name)}cqw` }}>{book.name}</span>
      </div>
    </div>
  );
}

function postmark(day: string) {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
}

// A postcard sent when you earn a Book Club book: tap to turn it over, then share it.
export function Postcard({ book, name, earnedAt, score }: Props) {
  const [back, setBack] = useState(false);
  const [note, setNote] = useState('');
  const card = postcards[book.id];
  const ink = INK[book.section];

  const share = async () => {
    const result = await sharePostcard({ book, verse: card, earnedAt }).catch(() => 'cancelled' as const);
    if (result === 'copied') setNote('Copied — paste it anywhere.');
  };

  return (
    <div className="postcard-wrap">
      <button className={`postcard ${back ? 'flipped' : ''}`} onClick={() => setBack(!back)} aria-label={back ? 'Turn to the picture' : 'Turn the postcard over'}>
        <span className="pc-inner">
          <PostcardFront book={book} />
          <span className="pc-back">
            <span className="pc-message">
              <span className={`pc-verse ${card.text.length > 180 ? 'pc-long' : card.text.length > 120 ? 'pc-mid' : ''}`}><Verse text={card.text} /></span>
              <span className="pc-ref mono">{card.ref}</span>
            </span>
            <span className="pc-address">
              <span className="pc-stamp" style={{ borderColor: ink, color: ink }}>
                <span className="mono">{book.code}</span>
                <small className="mono">{score}/21</small>
              </span>
              <span className="pc-postmark mono" style={{ color: ink, borderColor: ink }}>
                BOOK CLUB<br />{postmark(earnedAt)}
              </span>
              <span className="pc-lines">
                <span className="pc-to">{name}</span>
                <span className="pc-line mono">PASSENGER · FLIGHT</span>
                <span className="pc-line mono">{book.chapters} CHAPTERS FLOWN</span>
              </span>
            </span>
          </span>
        </span>
      </button>
      <p className="small muted pc-hint">{back ? 'Tap to see the picture.' : 'Tap the postcard to turn it over.'}</p>
      <button className="btn btn-ghost" onClick={share}>Share postcard</button>
      {note && <p className="small muted">{note}</p>}
    </div>
  );
}
