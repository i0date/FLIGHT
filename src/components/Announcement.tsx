import { announcements } from '../data/announcements';
import { daysBetween } from '../lib/dates';
import { Plane } from './Icons';
import { PlaneMascot } from './Aircraft';
import { LEVELS, formatFt } from '../lib/levels';
import type { Level } from '../types';

// Today's verse, the same for everyone; the list repeats once it runs out.
export function todaysAnnouncement(day: string) {
  return announcements[((daysBetween('2026-01-01', day) % announcements.length) + announcements.length) % announcements.length];
}

// LORD is printed in small capitals, as in the King James Bible.
import { Kjv as Verse } from './Scripture';
export { Verse };

// The verse for the journey, shown before the Daily Flight takes off.
export function Announcement({ day, flight, onBoard }: { day: string; flight: string; onBoard: () => void }) {
  const verse = todaysAnnouncement(day);
  return (
    <div className="screen announcement">
      <p className="mono small muted">{flight} · GEN → REV · NOW BOARDING</p>
      <section className="gate-board" aria-label={`Flight ${flight}, Genesis to Revelation, ten questions climbing from take-off to the stratosphere`}>
        <div className="gate-board-top mono">
          <span>GATE A1</span>
          <span>{flight}</span>
        </div>
        <div className="gate-board-route" aria-hidden="true">
          <span><strong className="mono">GEN</strong>Genesis</span>
          <PlaneMascot width={120} className="gate-board-plane" />
          <span><strong className="mono">REV</strong>Revelation</span>
        </div>
        <ol className="gate-climb" aria-hidden="true">
          {([1, 2, 3, 4, 5, 6] as Level[]).map((l) => (
            <li key={l} style={{ height: `${10 + l * 7}px` }} title={`${formatFt(LEVELS[l].ft)} · ${LEVELS[l].name}`} />
          ))}
        </ol>
        <div className="gate-climb-ends mono" aria-hidden="true">
          <span>{LEVELS[1].name}</span>
          <span>10 questions</span>
          <span>{LEVELS[6].name}</span>
        </div>
      </section>
      <section className="journey">
        <p className="journey-label mono">VERSE FOR THE JOURNEY</p>
        <blockquote>
          <p><Verse text={verse.text} /></p>
          <cite className="mono">{verse.ref}</cite>
        </blockquote>
      </section>
      <button className="btn btn-primary" onClick={onBoard}>
        <Plane size={16} className="tilt" /> Take off
      </button>
    </div>
  );
}
