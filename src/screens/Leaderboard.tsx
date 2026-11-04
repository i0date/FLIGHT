import { useCallback, useEffect, useState } from 'react';
import { useProfile } from '../lib/profile';
import { dayKey } from '../lib/dates';
import { createCrew, crewBoard, joinCrew, leaveCrew, myCrews, publicBoard, type BoardRow, type CrewInfo } from '../lib/boards';
import { Lock } from '../components/Icons';
import type { Screen } from '../types';

type View = { kind: 'today' } | { kind: 'streak' } | { kind: 'crew'; crew: CrewInfo };

export function Leaderboard({ go }: { go: (s: Screen) => void }) {
  const { profile, account, accountsEnabled } = useProfile();
  const [view, setView] = useState<View>({ kind: 'today' });
  const [rows, setRows] = useState<BoardRow[] | null>(null);
  const [crews, setCrews] = useState<CrewInfo[]>([]);
  const [crewName, setCrewName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const today = dayKey();

  const loadCrews = useCallback(async () => {
    setCrews(account ? await myCrews().catch(() => []) : []);
  }, [account]);

  useEffect(() => {
    loadCrews();
  }, [loadCrews]);

  useEffect(() => {
    if (!accountsEnabled) return;
    setRows(null);
    const load = view.kind === 'crew' ? crewBoard(view.crew.id, today) : publicBoard(view.kind, today);
    load.then(setRows).catch(() => setRows([]));
  }, [view, today, accountsEnabled, account?.userId, profile.daily[today]]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  if (!accountsEnabled) {
    return (
      <div className="screen">
        <header className="page-head"><h1>Leaderboard</h1></header>
        <p className="muted">Leaderboards arrive with accounts.</p>
      </div>
    );
  }

  const title = view.kind === 'today' ? "Today's flight" : view.kind === 'streak' ? 'Longest streaks' : view.crew.name;

  const join = () =>
    run(async () => {
      const [c] = await joinCrew(code);
      setCode('');
      const list = account ? await myCrews() : [];
      setCrews(list);
      const joined = list.find((x) => x.id === c.id);
      if (joined) setView({ kind: 'crew', crew: joined });
    });

  const create = () =>
    run(async () => {
      const [c] = await createCrew(crewName);
      setCrewName('');
      const list = await myCrews();
      setCrews(list);
      const made = list.find((x) => x.id === c.id);
      if (made) setView({ kind: 'crew', crew: made });
    });

  const leave = (crew: CrewInfo) =>
    run(async () => {
      await leaveCrew(crew.id);
      setView({ kind: 'today' });
      await loadCrews();
    });

  return (
    <div className="screen">
      <header className="page-head">
        <h1>Leaderboard</h1>
        <p>{view.kind === 'streak' ? 'Ranked by current streak.' : "Ranked by today's Daily Flight score; ties go to whoever landed first."}</p>
      </header>

      <div className="board-tabs" role="tablist">
        <button className={view.kind === 'today' ? 'on' : ''} onClick={() => setView({ kind: 'today' })}>Today</button>
        <button className={view.kind === 'streak' ? 'on' : ''} onClick={() => setView({ kind: 'streak' })}>Streaks</button>
        {crews.map((c) => (
          <button key={c.id} className={view.kind === 'crew' && view.crew.id === c.id ? 'on' : ''} onClick={() => setView({ kind: 'crew', crew: c })}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="board-table">
        <div className="board-table-head mono">
          <span>#</span>
          <span>{title}</span>
          <span>Streak</span>
          <span>Today</span>
        </div>
        {rows === null ? (
          <div className="board-table-empty">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="board-table-empty">{view.kind === 'streak' ? 'No one is on a streak yet.' : 'Nobody has landed today yet. Be the first!'}</div>
        ) : (
          rows.map((r) => (
            <div key={`${r.pos}-${r.name}`} className={`board-table-row ${r.is_me ? 'me' : ''}`}>
              <span className="mono">{r.pos}</span>
              <span>{r.name}{r.is_me ? ' (you)' : ''}</span>
              <span className="mono">{r.streak}</span>
              <span className="mono">{r.today === null ? '—' : `${r.today}/10`}</span>
            </div>
          ))
        )}
      </div>

      {view.kind === 'crew' && (
        <div className="card">
          <p className="small">
            Invite others with code <strong className="mono">{view.crew.code}</strong> · {view.crew.members} member{view.crew.members === 1 ? '' : 's'}
          </p>
          <button className="btn btn-ghost" disabled={busy} onClick={() => leave(view.crew)}>
            {view.crew.is_owner ? 'Close this crew' : 'Leave this crew'}
          </button>
        </div>
      )}

      {!account ? (
        <button className="card locked" onClick={() => go({ name: 'passport' })}>
          <span>Sign in on the Passport tab to appear on the board and join crews.</span>
        </button>
      ) : (
        <>
          <h3 className="section-title">Crews</h3>
          {error && <div className="notice notice-error">{error}</div>}
          <form className="card" onSubmit={(e) => { e.preventDefault(); join(); }}>
            <strong>Join a crew</strong>
            <p className="small muted">A private board for your church, family or friends. Ask whoever runs it for the code.</p>
            <div className="row">
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. 7F3K9Q" maxLength={6} className="mono" aria-label="Crew code" />
              <button className="btn btn-primary" disabled={busy || code.length < 6}>Join</button>
            </div>
          </form>
          {profile.premium ? (
            <form className="card" onSubmit={(e) => { e.preventDefault(); create(); }}>
              <strong>Start a crew</strong>
              <p className="small muted">You'll get a code to share. Up to 100 travellers per crew.</p>
              <div className="row">
                <input value={crewName} onChange={(e) => setCrewName(e.target.value)} placeholder="e.g. Tuesday Bible Study" maxLength={40} aria-label="Crew name" />
                <button className="btn btn-primary" disabled={busy || !crewName.trim()}>Create</button>
              </div>
            </form>
          ) : (
            <button className="card locked" onClick={() => go({ name: 'premium' })}>
              <Lock /> <span>Starting a crew is a Flight Club perk. Joining one is free.</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
