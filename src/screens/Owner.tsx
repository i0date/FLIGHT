import { useCallback, useEffect, useState } from 'react';
import { closeReport, ownerStats, type DayCount, type OwnerStats } from '../lib/owner';
import { bookById } from '../data/books';
import { REASONS } from '../lib/report';
import type { Screen } from '../types';

// Control tower: the owner's view of how FLIGHT is doing. Counts only, plus open question reports.
// Only signed-in travellers are counted; guests play on their own device and never reach the server.

const shortDay = (day: string) => {
  const [y, m, d] = day.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
};

function Tile({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="ow-tile">
      <span className="ow-tile-label">{label}</span>
      <span className="ow-tile-value">{typeof value === 'number' ? value.toLocaleString('en-CA') : value}</span>
      {sub && <span className="ow-tile-sub">{sub}</span>}
    </div>
  );
}

// One series, one colour: bars rise from a shared baseline; hover or tap a bar for its value.
function Bars({ title, rows, unit }: { title: string; rows: { label: string; value: number; detail?: string }[]; unit: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((s, r) => s + r.value, 0);
  return (
    <figure className="ow-chart">
      <figcaption>
        <strong>{title}</strong>
        <span className="ow-chart-total">{total.toLocaleString('en-CA')} {unit}</span>
      </figcaption>
      <div className="ow-bars" role="img" aria-label={`${title}: ${rows.map((r) => `${r.label} ${r.value}`).join(', ')}`}>
        {rows.map((r) => (
          <button key={r.label} className="ow-bar" tabIndex={0} aria-label={`${r.label}: ${r.value} ${unit}${r.detail ? `, ${r.detail}` : ''}`}>
            <span className="ow-bar-fill" style={{ height: r.value ? `${Math.max(4, (r.value / max) * 100)}%` : '0%' }} />
            <span className="ow-tip">
              <strong>{r.value}</strong> {unit}
              <br />
              {r.label}
              {r.detail && <><br />{r.detail}</>}
            </span>
          </button>
        ))}
      </div>
      <div className="ow-axis">
        <span>{rows[0]?.label}</span>
        <span>{rows[rows.length - 1]?.label}</span>
      </div>
    </figure>
  );
}

const byDay = (rows: DayCount[], key: 'n' | 'flights') =>
  rows.map((r) => ({ label: shortDay(r.day), value: r[key] ?? 0, detail: key === 'flights' && r.avg != null ? `avg ${r.avg}/10` : undefined }));

// The Passport card that opens the dashboard (shown only to owners).
export function OwnerLink({ go }: { go: (s: Screen) => void }) {
  return (
    <button className="card ow-link" onClick={() => go({ name: 'owner' })}>
      <strong>Control tower</strong>
      <span className="small muted">How FLIGHT is doing: players, flights, Frequent Flyers and question reports.</span>
    </button>
  );
}

export function Owner({ go }: { go: (s: Screen) => void }) {
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(() => {
    setError('');
    ownerStats().then(setStats).catch((e) => setError(e instanceof Error ? e.message : 'Could not load.'));
  }, []);
  useEffect(load, [load]);

  const close = async (id: number, status: 'fixed' | 'dismissed') => {
    setBusy(id);
    try {
      await closeReport(id, status);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update that report.');
    } finally {
      setBusy(null);
    }
  };

  // Anyone else who finds this address just lands on the terminal, with no sign the page exists.
  useEffect(() => {
    if (error && !stats) go({ name: 'home' });
  }, [error, stats, go]);
  if (!stats) return <div className="screen" />;

  const s = stats;
  const plans = Object.entries(s.club.by_plan);
  const paying = plans.reduce((n, [, v]) => n + v, 0);
  const reasonLabel = (id: string) => REASONS.find((r) => r.id === id)?.label ?? id;

  return (
    <div className="screen owner">
      <header className="page-head compact">
        <p className="mono small muted">FLIGHT · CONTROL TOWER · {shortDay(s.today).toUpperCase()}</p>
        <h1>How FLIGHT is doing</h1>
        <p className="small muted">Signed-in travellers only. Guests play on their own devices and aren’t counted. Days are Toronto time.</p>
      </header>

      <section className="ow-grid">
        <Tile label="Accounts" value={s.accounts.total} sub={`+${s.accounts.new_7d} this week · +${s.accounts.new_today} today`} />
        <Tile label="Flew today" value={s.accounts.active_today} sub={`${s.accounts.active_7d} in the last 7 days`} />
        <Tile label="Live streaks" value={s.streaks.live} sub={`longest ${s.streaks.longest_live} · best ever ${s.streaks.best_ever}`} />
        <Tile label="Frequent Flyers" value={paying} sub={`${plans.map(([p, n]) => `${n} ${p}`).join(' · ') || 'no plans yet'}${s.club.seat_members ? ` · +${s.club.seat_members} seats` : ''}`} />
      </section>
      {s.club.past_due > 0 && <p className="notice notice-error small">{s.club.past_due} Frequent Flyer plan{s.club.past_due === 1 ? ' has' : 's have'} a failed payment. Stripe will retry.</p>}

      <Bars title="Daily Flights, last 14 days" unit="flights" rows={byDay(s.daily.by_day, 'flights')} />
      <Bars title="New accounts, last 14 days" unit="sign-ups" rows={byDay(s.accounts.signups_by_day, 'n')} />
      <Bars
        title="Daily Flight scores, all time"
        unit="flights"
        rows={Array.from({ length: 11 }, (_, score) => ({ label: `${score}/10`, value: s.daily.scores[score] ?? 0 }))}
      />

      <section className="ow-grid">
        <Tile label="Book Club books earned" value={s.book_club.books_earned} sub={`${s.book_club.books_started} started by ${s.book_club.travellers}`} />
        <Tile label="Reminders on" value={s.reminders.travellers_with_devices} sub={`${s.reminders.devices} devices · ${s.reminders.email_opt_ins} by email`} />
        <Tile label="Connecting Flights" value={s.connecting.flights_7d} sub={`${s.connecting.players_7d} players this week`} />
        <Tile label="Perfect Daily Flights" value={s.daily.perfect} sub={`of ${s.daily.total.toLocaleString('en-CA')} flown`} />
      </section>

      {s.book_club.top_books.length > 0 && (
        <section className="card">
          <strong>Most-flown books</strong>
          <ol className="ow-list">
            {s.book_club.top_books.map((b) => (
              <li key={b.book_id}>
                <span>{bookById(b.book_id)?.name ?? b.book_id}</span>
                <span className="mono small muted">{b.n} started · {b.earned} earned</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="card">
        <strong>Question reports · {s.reports.open} open</strong>
        {s.reports.recent.length === 0 ? (
          <p className="small muted">No open reports. Clear skies.</p>
        ) : (
          <ul className="ow-reports">
            {s.reports.recent.map((r) => (
              <li key={r.id}>
                <p className="mono small muted">#{r.id} · {r.question_id} · {reasonLabel(r.reason)} · {shortDay(r.created_at)} · {r.signed_in ? 'signed in' : 'guest'}</p>
                <p className="ow-q">{r.prompt}</p>
                {r.shown_answer && <p className="small">Marked correct: <strong>{r.shown_answer}</strong></p>}
                {r.note && <p className="small ow-note">“{r.note}”</p>}
                <div className="ow-actions">
                  <button className="btn btn-small btn-ghost" disabled={busy === r.id} onClick={() => close(r.id, 'dismissed')}>Not a mistake</button>
                  <button className="btn btn-small btn-primary" disabled={busy === r.id} onClick={() => close(r.id, 'fixed')}>Mark fixed</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && <p className="notice notice-error small">{error}</p>}
      <p className="small muted">Updated {new Date(s.generated_at).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })} · <button className="link" onClick={load}>Refresh</button></p>
      <button className="btn btn-ghost" onClick={() => go({ name: 'passport' })}>Back to Passport</button>
    </div>
  );
}
