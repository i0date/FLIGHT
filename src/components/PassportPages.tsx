import { useState } from 'react';
import { books, bookById } from '../data/books';
import { LEGS } from '../data/bookClubQuestions';
import { bookClubQuestions } from '../data/bookClubQuestions';
import { bookScore, legsFlown, type Profile } from '../lib/profile';
import { MILES, TIERS, milesFor, tierFor, VISAS } from '../lib/miles';
import type { Account } from '../lib/sync';
import { weekMonday } from '../lib/dates';
import type { Screen } from '../types';
import { Lock, Plane } from './Icons';
import { INK } from '../lib/ink';
import { Postcard, PostcardFront } from './Postcard';

const SECTIONS = [...new Set(books.map((b) => b.section))];
const SHAPES = ['round', 'oval', 'rect', 'octagon'];

function MrzLine({ text }: { text: string }) {
  const line = text.padEnd(30, '<').slice(0, 30);
  return <div className="pp-mrz-line">{[...line].map((ch, i) => <span key={i}>{ch}</span>)}</div>;
}

function Page({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="pp-page" aria-label={title}>
      <header className="pp-page-head mono">
        <span>{title}</span>
        <span>FLIGHT</span>
      </header>
      {children}
      <footer className="pp-page-foot mono">{n}</footer>
    </section>
  );
}

export function IdentityPage({ profile, account, photoUrl, onPhotoTap }: { profile: Profile; account: Account | null; photoUrl: string | null; onPhotoTap?: () => void }) {
  const miles = milesFor(profile);
  const { tier, next } = tierFor(miles);
  const name = profile.name.toUpperCase().replace(/[^A-Z]/g, '<');
  const passportNo = account?.passengerNo ?? 'FL0000000';

  return (
    <Page n={2} title="IDENTITY">
      <div className="pp-id">
        <div className="pp-id-top mono">
          <span><small>TYPE</small>P</span>
          <span><small>CODE</small>FLT</span>
          <span><small>PASSPORT NO.</small>{account ? passportNo : 'NOT ISSUED'}</span>
        </div>
        <div className="pp-id-body">
          <button className={`pp-photo ${photoUrl ? 'has-photo' : ''}`} onClick={onPhotoTap} disabled={!onPhotoTap} aria-label={photoUrl ? 'Change passport photo' : 'Add passport photo'}>
            {photoUrl ? <img src={photoUrl} alt="Passport photo" /> : <span className="pp-photo-initial">{profile.name.slice(0, 1).toUpperCase()}</span>}
            {onPhotoTap && <span className="pp-photo-hint">{photoUrl ? 'Change' : '+ Photo'}</span>}
          </button>
          <dl className="pp-fields">
            <div className="wide"><dt>Name / Nom</dt><dd>{profile.name}</dd></div>
            <div><dt>Status</dt><dd><span className="pp-tier" style={{ background: tier.color }}>{tier.name}</span></dd></div>
            <div><dt>Miles</dt><dd className="mono">{miles.toLocaleString('en-GB')}</dd></div>
            <div><dt>Date of issue</dt><dd className="mono">{account?.memberSince ?? '—'}</dd></div>
            <div><dt>Citizenship</dt><dd>Heaven <small>Phil 3:20</small></dd></div>
            {profile.homeChurch && <div className="wide"><dt>Home church</dt><dd>{profile.homeChurch}</dd></div>}
          </dl>
        </div>
        <div className="pp-signature">
          <span className="pp-sign">{profile.name}</span>
          <small>Holder's signature</small>
        </div>
        <div className="pp-mrz mono" aria-hidden="true">
          {/* Two fixed 30-character lines, like a real machine-readable zone, spread edge to edge. */}
          <MrzLine text={`P<FLT${name}`} />
          <MrzLine text={`${passportNo.padEnd(9, '<')}FLT${String(miles).padStart(7, '0')}<${tier.name.toUpperCase()}`} />
        </div>
        <Plane size={120} className="pp-watermark" />
      </div>
      <div className="pp-ff">
        <p className="mono small">FREQUENT FLYER · {tier.name.toUpperCase()}</p>
        <div className="ff-stages" aria-label="Status stages">
          {TIERS.map((t) => (
            <div key={t.name} className={`ff-stage ${t.name === tier.name ? 'on' : ''} ${miles >= t.from ? 'reached' : ''}`}>
              <span className="ff-dot" style={{ background: t.color }} />
              <strong>{t.name}</strong>
              <small className="mono">{t.from.toLocaleString('en-GB')}</small>
            </div>
          ))}
        </div>
        {next ? (
          <>
            <div className="ff-bar"><div style={{ width: `${((miles - tier.from) / (next.from - tier.from)) * 100}%` }} /></div>
            <p className="small">{(next.from - miles).toLocaleString('en-GB')} miles to {next.name}</p>
          </>
        ) : (
          <p className="small">Platinum: the highest status there is.</p>
        )}
        <details className="ff-how">
          <summary>How miles work</summary>
          <p className="small">Miles are earned by flying — never bought. They're worked out from your flights, so replays in the archive earn nothing.</p>
          <table className="ff-table">
            <tbody>
              <tr><td>Each Daily Flight</td><td className="mono">{MILES.perDailyFlight}</td></tr>
              <tr><td>Each correct Daily Flight answer</td><td className="mono">+{MILES.perDailyCorrect}</td></tr>
              <tr><td>Each Book Club leg flown</td><td className="mono">{MILES.perBookLeg}</td></tr>
              <tr><td>Each correct Book Club answer (best score per leg)</td><td className="mono">+{MILES.perBookCorrect}</td></tr>
              <tr><td>Each Book Club stamp earned (15 of 21)</td><td className="mono">+{MILES.perStampEarned.toLocaleString('en-GB')}</td></tr>
              <tr><td>Each correct Night Flight answer</td><td className="mono">{MILES.perNightCorrect}</td></tr>
              <tr><td>Each bonus question answered right</td><td className="mono">+{MILES.perGateChange}</td></tr>
              <tr><td>Each day of your best streak</td><td className="mono">{MILES.perBestStreakDay}</td></tr>
            </tbody>
          </table>
          <p className="small">A perfect Daily Flight is worth {(MILES.perDailyFlight + 10 * MILES.perDailyCorrect).toLocaleString('en-GB')} miles; a perfect Book Club book, {(3 * MILES.perBookLeg + 21 * MILES.perBookCorrect + MILES.perStampEarned).toLocaleString('en-GB')}.</p>
        </details>
      </div>
    </Page>
  );
}

export function StampsPage({ profile, go }: { profile: Profile; go: (s: Screen) => void }) {
  const stamped = books.filter((b) => profile.premium && profile.bookClub[b.id]?.earnedAt).length;
  const earned = books.filter((b) => profile.bookClub[b.id]?.earnedAt).length;
  return (
    <Page n={3} title="ENTRIES · STAMPS">
      <p className="pp-count mono">{stamped} / {books.length} STAMPED</p>
      {!profile.premium && (
        <button className="upsell" onClick={() => go({ name: 'premium' })}>
          <Lock /> <span>{earned ? `${earned} earned stamp${earned === 1 ? ' is' : 's are'} waiting. ` : ''}Stamps go in your passport with Frequent Flyers. Earn them in Book Club with 15 of 21.</span>
        </button>
      )}
      {SECTIONS.map((section) => (
        <div key={section} className="pp-section">
          <h4 className="mono">{section.toUpperCase()}</h4>
          <div className="pp-stamp-grid">
            {books.filter((b) => b.section === section).map((b) => {
              const r = profile.bookClub[b.id];
              const open = !!bookClubQuestions[b.id];
              const index = books.indexOf(b);
              const style = { color: INK[section], transform: `rotate(${((index * 47) % 22) - 11}deg)` };
              if (r?.earnedAt) {
                return (
                  <button key={b.id} className={`ink-stamp ink-${SHAPES[index % SHAPES.length]} ${profile.premium ? '' : 'ink-locked'}`} style={style} onClick={() => go({ name: 'book', bookId: b.id })} title={b.name}>
                    <span className="ink-code mono">{b.code}</span>
                    <span className="ink-date mono">{r.earnedAt}</span>
                    <span className="ink-score mono">{bookScore(r)}/21</span>
                    {!profile.premium && <Lock size={12} />}
                  </button>
                );
              }
              return (
                <button key={b.id} className={`ink-slot ${open ? '' : 'ink-soon'}`} disabled={!open} onClick={() => go({ name: 'book', bookId: b.id })} title={b.name}>
                  <span className="mono">{b.code}</span>
                  {(!open || r) && <small>{!open ? 'Soon' : `Leg ${legsFlown(r!)}/${LEGS.length}`}</small>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </Page>
  );
}

export function VisasPage({ profile, go }: { profile: Profile; go: (s: Screen) => void }) {
  return (
    <Page n={5} title="VISAS">
      <div className="visa-list">
        {VISAS.map((v) => {
          const granted = v.earned(profile);
          return (
            <div key={v.id} className={`visa-sticker ${granted ? 'granted' : ''}`}>
              <div className="visa-band mono">VISA · {v.needsStamps ? 'BOOK CLUB' : 'STREAK'}</div>
              <strong>{v.name}</strong>
              <span>{v.detail}</span>
              {granted ? (
                <span className="visa-granted mono">GRANTED</span>
              ) : v.needsStamps && !profile.premium ? (
                <button className="visa-lock" onClick={() => go({ name: 'premium' })}><Lock size={12} /> Frequent Flyers</button>
              ) : (
                <span className="visa-pending mono">NOT YET</span>
              )}
            </div>
          );
        })}
      </div>
    </Page>
  );
}

export function LogPage({ profile }: { profile: Profile }) {
  const rows = [
    ...Object.entries(profile.daily).map(([day, score]) => ({ day, route: 'GEN → REV', what: 'Daily Flight', score: `${score}/10` })),
    ...Object.entries(profile.nightFlights).map(([week, score]) => ({ day: weekMonday(week), route: 'DSK → DWN', what: `Night Flight · week ${week.split('-W')[1]}`, score: `${score}/10` })),
    ...Object.entries(profile.bookClub).map(([id, r]) => {
      const b = bookById(id);
      return { day: r.lastFlown, route: `${b?.code ?? id} · ${legsFlown(r)}/3 legs`, what: `Book Club · ${b?.name ?? id}${r.earnedAt ? ' ✓' : ''}`, score: `${bookScore(r)}/21` };
    }),
  ]
    .sort((a, b) => b.day.localeCompare(a.day))
    .slice(0, 40);

  return (
    <Page n={6} title="FLIGHT LOG">
      {rows.length ? (
        <div className="pp-log">
          {rows.map((r, i) => (
            <div key={i} className="pp-log-row">
              <span className="mono">{r.day}</span>
              <span><strong className="mono">{r.route}</strong><small>{r.what}</small></span>
              <span className="mono">{r.score}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">No flights yet. Your first boards from the terminal.</p>
      )}
    </Page>
  );
}

// Postcards: free for everyone, one for each book earned in Book Club. Newest first.
export function PostcardsPage({ profile, go }: { profile: Profile; go: (s: Screen) => void }) {
  const earned = books
    .filter((b) => profile.bookClub[b.id]?.earnedAt)
    .sort((a, b) => profile.bookClub[b.id].earnedAt!.localeCompare(profile.bookClub[a.id].earnedAt!));
  const [open, setOpen] = useState<string | null>(earned[0]?.id ?? null);
  const shown = earned.find((b) => b.id === open);

  return (
    <Page n={4} title="POSTCARDS">
      <p className="pp-count mono">{earned.length} / {books.length} RECEIVED</p>
      {shown ? (
        <Postcard key={shown.id} book={shown} name={profile.name} earnedAt={profile.bookClub[shown.id].earnedAt!} score={bookScore(profile.bookClub[shown.id])} />
      ) : (
        <p className="muted small">Earn a book in Book Club (15 of 21) and its postcard arrives here, with a verse from that book on the back.</p>
      )}
      <div className="postcard-grid">
        {earned.map((b) => (
          <button key={b.id} className="postcard-thumb" onClick={() => setOpen(b.id)} aria-label={`Postcard from ${b.name}`} aria-pressed={open === b.id}>
            <PostcardFront book={b} />
          </button>
        ))}
        {earned.length < books.length && (
          <button className="postcard-empty" onClick={() => go({ name: 'bookclub' })}>
            {earned.length ? `${books.length - earned.length} more to collect` : 'Go to Book Club'}
          </button>
        )}
      </div>
    </Page>
  );
}
