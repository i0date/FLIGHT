import { announcements } from '../data/announcements';
import { daysBetween } from '../lib/dates';
import { Plane } from './Icons';

// Today's verse, the same for everyone; the list repeats once it runs out.
export function todaysAnnouncement(day: string) {
  return announcements[((daysBetween('2026-01-01', day) % announcements.length) + announcements.length) % announcements.length];
}

// LORD is printed in small capitals, as in the King James Bible.
function Verse({ text }: { text: string }) {
  return (
    <>
      {text.split(/(LORD)/).map((part, i) => (part === 'LORD' ? <span key={i} className="smallcaps">Lord</span> : part))}
    </>
  );
}

// The verse for the journey, shown before the Daily Flight takes off.
export function Announcement({ day, flight, onBoard }: { day: string; flight: string; onBoard: () => void }) {
  const verse = todaysAnnouncement(day);
  return (
    <div className="screen announcement">
      <p className="mono small muted">{flight} · GEN → REV · NOW BOARDING</p>
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
