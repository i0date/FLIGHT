import { gates } from '../games/registry';
import { liveStreak, spendShields, useProfile } from '../lib/profile';
import { dayKey, flightNumber } from '../lib/dates';
import { books } from '../data/books';
import { Flame, Lock, Plane } from '../components/Icons';
import { PlaneWindow } from '../components/Aircraft';
import { InstallCard } from '../components/InstallCard';
import { StreakCall } from '../components/StreakCall';
import type { Screen } from '../types';

export function Home({ go }: { go: (s: Screen) => void }) {
  const { profile, update } = useProfile();
  const streak = liveStreak(profile);
  const todayScore = profile.daily[dayKey()];
  const stamps = Object.values(profile.bookClub).filter((r) => r.earnedAt).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="screen">
      <header className="board">
        <div className="board-row">
          <span className="board-brand">
            <Plane size={18} className="tilt" /> FLIGHT
          </span>
          <span className="mono board-flight">{flightNumber()}</span>
        </div>
        <div className="board-body">
          <div className="board-text">
            <p className="board-greet">
              {greeting}, {profile.name}.
            </p>
            <div className="streak">
              <Flame size={28} className={streak > 0 ? 'flame-on' : 'flame-off'} />
              <div>
                <div className="streak-num">
                  {streak} day{streak === 1 ? '' : 's'}
                </div>
                <div className="streak-sub">
                  {todayScore !== undefined ? 'Secured today' : streak > 0 ? 'Fly today to keep it' : 'Take off to start'}
                  {' · best '}
                  {profile.bestStreak}
                </div>
              </div>
            </div>
          </div>
          <PlaneWindow streak={streak} />
        </div>
      </header>

      <StreakCall profile={profile} onBoard={() => go({ name: 'daily' })} onUseShields={() => update((p) => spendShields(p))} />

      <button className="pass" onClick={() => go({ name: 'daily' })}>
        <div className="pass-main">
          <div className="pass-label">Boarding pass · Daily Flight</div>
          <div className="pass-route">
            <div>
              <div className="pass-code">GEN</div>
              <div className="pass-city">Genesis</div>
            </div>
            <div className="pass-line">
              <Plane size={18} className="tilt" />
            </div>
            <div>
              <div className="pass-code">REV</div>
              <div className="pass-city">Revelation</div>
            </div>
          </div>
          <div className="pass-fields">
            <div>
              <span>Flight</span>
              {flightNumber()}
            </div>
            <div>
              <span>Gate</span>A1
            </div>
            <div>
              <span>Questions</span>10
            </div>
          </div>
        </div>
        <div className="pass-stub">
          {todayScore !== undefined ? (
            <>
              <span className="stub-big">{todayScore}/10</span>
              <span>Landed</span>
            </>
          ) : (
            <>
              <span className="stub-big">Board</span>
              <span>now</span>
            </>
          )}
        </div>
      </button>

      {Object.keys(profile.daily).length > 0 && <InstallCard />}

      <h3 className="section-title">Departures</h3>
      <div className="gates">
        {gates.map((g) => {
          const live = g.status === 'live' && g.screen;
          return (
            <button key={g.id} className={`gate ${live ? '' : 'gate-soon'}`} disabled={!live} onClick={() => g.screen && go(g.screen)}>
              <span className="gate-id mono">{g.gate}</span>
              <span className="gate-body">
                <strong>{g.title}</strong>
                <span>{g.id === 'bookclub' ? `${stamps}/${books.length} stamps earned · ${g.blurb}` : g.blurb}</span>
              </span>
              <span className={`gate-status mono ${live ? 'on' : ''}`}>
                {!live ? 'DELAYED' : g.premium && !profile.premium ? <><Lock size={12} /> MEMBERS</> : 'BOARDING'}
              </span>
            </button>
          );
        })}
      </div>

      {!profile.premium && (
        <button className="upsell" onClick={() => go({ name: 'premium' })}>
          <Lock /> <span>Become a Frequent Flyer to stamp your passport, run private leaderboards and shield your streak</span>
        </button>
      )}

      <p className="fineprint">
        All 66 books of the Bible are open in Book Club
      </p>
      <p className="fineprint legal-links">
        <button onClick={() => go({ name: 'privacy' })}>Privacy</button> · <button onClick={() => go({ name: 'terms' })}>Terms</button>
      </p>
    </div>
  );
}
