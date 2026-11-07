import { useEffect, useMemo, useRef, useState } from 'react';
import { useProfile } from '../lib/profile';
import { chime } from '../lib/sound';
import { curly } from '../lib/text';
import { CF_SECONDS, CF_SIZE, cfCreate, cfJoin, cfProgress, cfQuestions, cfStart, cfState, cleanCode, flightLink, type CfPlayer, type CfState } from '../lib/connecting';
import { Lock, Plane } from '../components/Icons';
import type { Screen } from '../types';

const CODE_KEY = 'flight.cf.code';
const remember = (code: string | null) => {
  try {
    if (code) sessionStorage.setItem(CODE_KEY, code);
    else sessionStorage.removeItem(CODE_KEY);
  } catch {
    /* not remembered this time */
  }
};
const remembered = () => {
  try {
    return sessionStorage.getItem(CODE_KEY);
  } catch {
    return null;
  }
};

export function ConnectingFlights({ go, code: linkCode }: { go: (s: Screen) => void; code?: string }) {
  const { profile, account } = useProfile();
  const [code, setCode] = useState<string | null>(() => remembered());
  const [typed, setTyped] = useState(linkCode ?? '');
  const [name, setName] = useState(profile.name === 'Traveller' ? '' : profile.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const enter = (c: string | null) => {
    remember(c);
    setCode(c);
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const join = () =>
    run(async () => {
      const c = cleanCode(typed);
      await cfJoin(c, name.trim());
      enter(c);
    });

  const open = () =>
    run(async () => {
      const c = await cfCreate();
      await cfJoin(c, name.trim() || profile.name);
      enter(c);
    });

  if (code) return <Flight code={code} onLeave={() => enter(null)} />;

  const canHost = !!account && profile.premium;
  return (
    <div className="screen">
      <header className="page-head">
        <p className="mono small muted">GATE C1 · GROUP GAME</p>
        <h1>Connecting Flights</h1>
        <p>Everyone flies the same 10 questions, each in their own scrambled order. You have {CF_SECONDS} seconds. Best score wins; on a tie, the fastest lands first.</p>
      </header>

      <form className="card cf-board" onSubmit={(e) => { e.preventDefault(); join(); }}>
        <strong>Board a flight</strong>
        <label>
          <span className="small muted">Flight code</span>
          <input className="mono cf-code-input" value={typed} onChange={(e) => setTyped(cleanCode(e.target.value))} placeholder="ABCD" autoCapitalize="characters" autoComplete="off" />
        </label>
        <label>
          <span className="small muted">Your name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder="Shown on the board" />
        </label>
        <button className="btn btn-primary" disabled={busy || typed.length < 4 || !name.trim()}>{busy ? 'Boarding…' : 'Board'}</button>
      </form>

      {canHost ? (
        <button className="btn btn-ghost" disabled={busy || !name.trim()} onClick={open}>Open a new flight for your group</button>
      ) : (
        <button className="upsell" onClick={() => go({ name: account ? 'premium' : 'passport' })}>
          <Lock /> <span>{account ? 'Opening a flight for your group is a Flight Club perk. Boarding is free.' : 'Sign in with Flight Club to open a flight. Boarding with a code is free.'}</span>
        </button>
      )}
      {error && <p className="form-error small">{error}</p>}
    </div>
  );
}

// One flight from boarding to arrivals, following the shared state the server holds.
function Flight({ code, onLeave }: { code: string; onLeave: () => void }) {
  const [state, setState] = useState<CfState | null>(null);
  const [offset, setOffset] = useState(0); // server clock minus this device's clock
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const startedAt = state?.started_at ? new Date(state.started_at).getTime() : null;
  const serverNow = now + offset;
  const phase = !startedAt ? 'boarding' : serverNow < startedAt ? 'countdown' : serverNow < startedAt + CF_SECONDS * 1000 ? 'air' : 'landed';
  const me = state?.players.find((p) => p.is_me);
  const everyoneDone = !!state && state.players.every((p) => p.finished_ms !== null);

  // Poll the flight: quickly while in the air, gently while boarding, and stop once everyone has landed.
  useEffect(() => {
    let alive = true;
    let timer = 0;
    const poll = async () => {
      try {
        const asked = Date.now();
        const s = await cfState(code);
        if (!alive) return;
        if (!s) return setError('That flight has closed.');
        setOffset(new Date(s.server_now).getTime() - (asked + Date.now()) / 2);
        setState(s);
        setError('');
        const done = s.started_at && s.players.every((p) => p.finished_ms !== null);
        if (!done) timer = window.setTimeout(poll, s.started_at ? 1000 : 2000);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'Lost contact with the tower. Retrying…');
        timer = window.setTimeout(poll, 3000);
      }
    };
    poll();
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [code]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(t);
  }, []);

  const share = async () => {
    const text = `Board my Connecting Flight on FLIGHT. Code ${code}`;
    try {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) await navigator.share({ text, url: flightLink(code) });
      else {
        await navigator.clipboard.writeText(`${text}: ${flightLink(code)}`);
        setCopied(true);
      }
    } catch {
      /* share sheet closed */
    }
  };

  if (!state) {
    return (
      <div className="screen">
        <p className="muted">{error || 'Contacting the tower…'}</p>
        {error && <button className="btn btn-ghost" onClick={onLeave}>Back</button>}
      </div>
    );
  }

  if (phase === 'air' && me && me.finished_ms === null && state.seed && startedAt) {
    return <Play code={code} seed={state.seed} endsAt={startedAt + CF_SECONDS * 1000 - offset} startedAt={startedAt - offset} resume={me} />;
  }

  if (phase === 'countdown' && startedAt) {
    return (
      <div className="screen cf-countdown">
        <p className="mono small muted">FLIGHT {code} · CLEARED FOR TAKE-OFF</p>
        <div className="cf-count">{Math.max(1, Math.ceil((startedAt - serverNow) / 1000))}</div>
        <Plane size={48} className="tilt" />
      </div>
    );
  }

  const landed = phase === 'landed' || (!!startedAt && everyoneDone);
  return (
    <div className="screen">
      <header className="cf-head">
        <p className="mono small muted">CONNECTING FLIGHT</p>
        <div className="cf-code mono">{code}</div>
        <p className="small muted">
          {phase === 'boarding' ? `${state.players.length} on board · ${state.is_host ? 'take off when everyone is here' : 'waiting for the host to take off'}` : landed ? 'Landed' : 'In the air — waiting for the others'}
        </p>
      </header>

      {phase === 'boarding' && (
        <>
          <button className="btn btn-ghost" onClick={share}>{copied ? 'Link copied — send it to your group' : 'Invite your group'}</button>
          {state.is_host && (
            <button className="btn btn-primary" onClick={() => cfStart(code).catch((e) => setError(e.message))}>Take off · {CF_SECONDS} seconds</button>
          )}
        </>
      )}

      <Board players={state.players} started={!!startedAt} landed={landed} />
      {error && <p className="form-error small">{error}</p>}
      {(phase === 'boarding' || landed) && <button className="btn btn-ghost" onClick={onLeave}>{landed ? 'Done' : 'Leave this flight'}</button>}
    </div>
  );
}

function Board({ players, started, landed }: { players: CfPlayer[]; started: boolean; landed: boolean }) {
  return (
    <ol className="cf-players">
      {players.map((p, i) => (
        <li key={i} className={`${p.is_me ? 'me' : ''} ${landed && i === 0 ? 'winner' : ''}`}>
          <span className="cf-pos mono">{landed && i === 0 ? '★' : started ? i + 1 : '·'}</span>
          <span className="cf-name">
            <strong>{p.name}{p.is_me ? ' (you)' : ''}</strong>
            {started && (
              <span className="cf-track">
                <span style={{ width: `${(p.answered / CF_SIZE) * 100}%` }} />
                <Plane size={14} className="tilt" />
              </span>
            )}
          </span>
          {started && (
            <span className="cf-score mono">
              {p.score}/{CF_SIZE}
              <small>{p.finished_ms !== null ? `${(p.finished_ms / 1000).toFixed(1)}s` : `${p.answered}/${CF_SIZE}`}</small>
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

// The race itself: tap an answer, see right or wrong for a moment, straight on to the next.
function Play({ code, seed, startedAt, endsAt, resume }: { code: string; seed: string; startedAt: number; endsAt: number; resume: CfPlayer }) {
  const questions = useMemo(() => cfQuestions(seed), [seed]);
  const [index, setIndex] = useState(resume.answered);
  const [score, setScore] = useState(resume.score);
  const [picked, setPicked] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const finished = useRef(false);
  const [done, setDone] = useState(false);
  const left = Math.max(0, endsAt - now);
  const q = questions[Math.min(index, CF_SIZE - 1)];

  const finish = (answered: number, total: number) => {
    if (finished.current) return;
    finished.current = true;
    setDone(true);
    cfProgress(code, answered, total, Math.round(Math.min(Date.now(), endsAt) - startedAt)).catch(() => undefined);
  };

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(t);
  }, []);
  useEffect(() => {
    if (left === 0) finish(index, score);
  }, [left === 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (i: number) => {
    if (picked !== null || left === 0) return;
    const ok = i === q.answer;
    const total = score + (ok ? 1 : 0);
    const answered = index + 1;
    setPicked(i);
    setScore(total);
    chime(ok);
    if (answered === CF_SIZE) finish(answered, total);
    else cfProgress(code, answered, total, null).catch(() => undefined);
    window.setTimeout(() => {
      setPicked(null);
      setIndex(answered);
    }, 450);
  };

  if (done) {
    return (
      <div className="screen cf-countdown">
        <p className="mono small muted">FLIGHT {code}</p>
        <div className="cf-count">{score}/{CF_SIZE}</div>
        <p className="muted">{left === 0 ? 'Time! Landing…' : 'Landed. Waiting for the board…'}</p>
      </div>
    );
  }

  return (
    <div className="screen cf-play">
      <div className="cf-timer">
        <span className="mono">{Math.ceil(left / 1000)}s</span>
        <div className="cf-timer-bar"><div style={{ width: `${(left / (CF_SECONDS * 1000)) * 100}%` }} className={left < 10000 ? 'low' : ''} /></div>
        <span className="mono">{Math.min(index + 1, CF_SIZE)}/{CF_SIZE}</span>
      </div>
      <h2 className="quiz-prompt">{curly(q.prompt)}</h2>
      <div className="options">
        {q.options.map((opt, i) => {
          let cls = 'option';
          if (picked !== null && i === q.answer) cls += ' correct';
          else if (picked === i) cls += ' wrong';
          return (
            <button key={`${q.id}-${i}`} className={cls} onClick={() => answer(i)} disabled={picked !== null}>
              <span className="option-key mono">{'ABCD'[i]}</span>
              <span>{curly(opt)}</span>
            </button>
          );
        })}
      </div>
      <p className="small muted cf-play-score">Score {score}</p>
    </div>
  );
}
