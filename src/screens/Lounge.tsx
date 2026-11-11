import { useEffect, useState } from 'react';
import { MAX_SHIELDS, useProfile } from '../lib/profile';
import { dayKey, weekKey } from '../lib/dates';
import { crewBoard, myCrews, type BoardRow, type CrewInfo } from '../lib/boards';
import { books } from '../data/books';
import type { Screen } from '../types';

// The Lounge: Frequent Flyers' home. Everything a member has, in one place: this week's Night Flight,
// the streak shield, stamps, the archive, hosting a Connecting Flight, and their crews' boards today.

function Perk({ code, title, status, action, onClick }: { code: string; title: string; status: string; action: string; onClick: () => void }) {
  return (
    <button className="lounge-perk" onClick={onClick}>
      <span className="lounge-perk-code mono">{code}</span>
      <span className="lounge-perk-body">
        <strong>{title}</strong>
        <span>{status}</span>
      </span>
      <span className="lounge-perk-action mono">{action}</span>
    </button>
  );
}

// A crew's board today, cut to the top three, plus where you stand if you're further down.
function CrewCard({ crew, go }: { crew: CrewInfo; go: (s: Screen) => void }) {
  const [rows, setRows] = useState<BoardRow[] | null>(null);
  useEffect(() => {
    crewBoard(crew.id, dayKey()).then(setRows).catch(() => setRows([]));
  }, [crew.id]);
  const top = rows?.slice(0, 3) ?? [];
  const me = rows?.find((r) => r.is_me && r.pos > 3);
  const landed = rows?.filter((r) => r.today !== null).length ?? 0;

  return (
    <div className="card lounge-crew">
      <div className="lounge-crew-head">
        <strong>{crew.name}</strong>
        <span className="small muted">{landed} of {crew.members} landed today</span>
      </div>
      {rows === null ? (
        <p className="small muted">Loading…</p>
      ) : landed === 0 ? (
        <p className="small muted">Nobody has landed today yet. Be the first.</p>
      ) : (
        <ol className="lounge-crew-rows">
          {[...top, ...(me ? [me] : [])].map((r) => (
            <li key={`${r.pos}-${r.name}`} className={r.is_me ? 'me' : ''}>
              <span className="mono">{r.pos}</span>
              <span>{r.name}{r.is_me ? ' (you)' : ''}</span>
              <span className="mono">{r.today === null ? '—' : `${r.today}/10`}</span>
            </li>
          ))}
        </ol>
      )}
      <button className="btn btn-ghost btn-small" onClick={() => go({ name: 'leaderboard', crewId: crew.id })}>Full board · code {crew.code}</button>
    </div>
  );
}

export function Lounge({ go }: { go: (s: Screen) => void }) {
  const { profile } = useProfile();
  const [crews, setCrews] = useState<CrewInfo[] | null>(null);
  useEffect(() => {
    myCrews().then(setCrews).catch(() => setCrews([]));
  }, []);

  const week = weekKey();
  const night = profile.nightFlights[week];
  const stamped = books.filter((b) => profile.bookClub[b.id]?.earnedAt).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <header className="lounge-head">
        <p className="mono small">FREQUENT FLYERS · THE LOUNGE</p>
        <h1>{greeting}, {profile.name}.</h1>
        <p>Welcome to the Lounge. Everything Frequent Flyers get is here.</p>
      </header>

      <section className="lounge-perks">
        <Perk code="N1" title="Night Flight" status={night === undefined ? 'This week’s flight is boarding.' : `Flown this week · ${night}/10. A new one lands Monday.`} action={night === undefined ? 'BOARD' : 'REPLAY'} onClick={() => go({ name: 'night' })} />
        <Perk code="SH" title="Streak shields" status={profile.shields >= MAX_SHIELDS ? `${MAX_SHIELDS} held, the most you can carry. Each covers a missed day.` : `${profile.shields} of ${MAX_SHIELDS} held. Another arrives on Monday.`} action={`${profile.shields}/${MAX_SHIELDS}`} onClick={() => go({ name: 'settings' })} />
        <Perk code="PP" title="Passport stamps" status={`${stamped} of ${books.length} books stamped.`} action="OPEN" onClick={() => go({ name: 'passport' })} />
        <Perk code="A2" title="Flight archive" status="Replay any of the last 30 Daily Flights." action="OPEN" onClick={() => go({ name: 'archive' })} />
        <Perk code="C1" title="Host a Connecting Flight" status="A live 60-second race for your group." action="HOST" onClick={() => go({ name: 'connecting' })} />
      </section>

      <h3 className="section-title">Your crews</h3>
      {crews === null ? (
        <p className="small muted">Loading crews…</p>
      ) : crews.length === 0 ? (
        <button className="card lounge-empty" onClick={() => go({ name: 'leaderboard' })}>
          <strong>Start a crew</strong>
          <span className="small muted">A private board for your church, family or friends. You get a code to share.</span>
        </button>
      ) : (
        <>
          {crews.map((c) => <CrewCard key={c.id} crew={c} go={go} />)}
          <button className="btn btn-ghost" onClick={() => go({ name: 'leaderboard' })}>Start or join another crew</button>
        </>
      )}
    </>
  );
}
