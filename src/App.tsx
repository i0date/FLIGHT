import { lazy, Suspense, useEffect, useState } from 'react';
import { ProfileProvider } from './lib/profile';
import { Home } from './screens/Home';
import { Daily } from './screens/Daily';
import { BookClub, BookQuiz } from './screens/BookClub';
import { Leaderboard } from './screens/Leaderboard';
import { Premium } from './screens/Premium';
import { Passport as PassportScreen } from './screens/Passport';
import { NightFlight } from './screens/NightFlight';
import { Archive } from './screens/Archive';
import { Practice } from './screens/Practice';
import { ConnectingFlights } from './screens/ConnectingFlights';
import { Privacy, Terms } from './screens/Legal';
import { Unsubscribe } from './screens/Unsubscribe';
// Loaded only when opened, so the owner's dashboard isn't part of everyone's download.
const Owner = lazy(() => import('./screens/Owner').then((m) => ({ default: m.Owner })));
import { Book, Home as HomeIcon, Passport, Seat, Trophy } from './components/Icons';
import type { Screen } from './types';

const TABS: { screen: Screen; label: string; Icon: typeof HomeIcon }[] = [
  { screen: { name: 'home' }, label: 'Terminal', Icon: HomeIcon },
  { screen: { name: 'bookclub' }, label: 'Book Club', Icon: Book },
  { screen: { name: 'passport' }, label: 'Passport', Icon: Passport },
  { screen: { name: 'leaderboard' }, label: 'Ranks', Icon: Trophy },
  { screen: { name: 'premium' }, label: 'Lounge', Icon: Seat },
];

export default function App() {
  // Coming back from Stripe (?checkout=success|cancel|return) opens the Club page.
  const [checkout] = useState(() => new URLSearchParams(window.location.search).get('checkout'));
  // An invite link (?flight=ABCD) opens Connecting Flights with the code filled in.
  const [flightCode] = useState(() => new URLSearchParams(window.location.search).get('flight'));
  // The "Unsubscribe" link in reminder emails (?unsubscribe=<token>).
  const [unsubToken] = useState(() => new URLSearchParams(window.location.search).get('unsubscribe'));
  // The legal pages have their own addresses (/privacy, /terms) so they can be linked from Stripe and elsewhere.
  const [screen, setScreen] = useState<Screen>(() => {
    const path = window.location.pathname.replace(/\/$/, '');
    if (path === '/privacy') return { name: 'privacy' };
    if (path === '/terms') return { name: 'terms' };
    if (path === '/owner') return { name: 'owner' };
    if (unsubToken) return { name: 'unsubscribe', token: unsubToken };
    return checkout ? { name: 'premium' } : flightCode ? { name: 'connecting', code: flightCode } : { name: 'home' };
  });
  useEffect(() => {
    if (checkout || flightCode || unsubToken) window.history.replaceState(null, '', '/');
  }, [checkout, flightCode, unsubToken]);
  useEffect(() => {
    window.scrollTo(0, 0);
    const path = screen.name === 'privacy' || screen.name === 'terms' || screen.name === 'owner' ? `/${screen.name}` : '/';
    if (window.location.pathname !== path) window.history.replaceState(null, '', path);
  }, [screen]);
  const go = (s: Screen) => setScreen(s);
  const tabActive = screen.name === 'book' ? 'bookclub' : ['daily', 'practice', 'night', 'archive', 'connecting'].includes(screen.name) ? 'home' : screen.name === 'owner' ? 'passport' : screen.name;

  return (
    <ProfileProvider>
      <div className="app">
        <main>
          {screen.name === 'home' && <Home go={go} />}
          {screen.name === 'daily' && <Daily go={go} />}
          {screen.name === 'bookclub' && <BookClub go={go} />}
          {screen.name === 'book' && <BookQuiz key={screen.bookId} bookId={screen.bookId} go={go} />}
          {screen.name === 'passport' && <PassportScreen go={go} />}
          {screen.name === 'night' && <NightFlight go={go} />}
          {screen.name === 'archive' && <Archive go={go} />}
          {screen.name === 'practice' && <Practice go={go} />}
          {screen.name === 'leaderboard' && <Leaderboard go={go} crewId={screen.crewId} />}
          {screen.name === 'premium' && <Premium go={go} checkout={checkout} />}
          {screen.name === 'connecting' && <ConnectingFlights go={go} code={screen.code} />}
          {screen.name === 'privacy' && <Privacy go={go} />}
          {screen.name === 'terms' && <Terms go={go} />}
          {screen.name === 'unsubscribe' && <Unsubscribe token={screen.token} go={go} />}
          {screen.name === 'owner' && <Suspense fallback={null}><Owner go={go} /></Suspense>}
        </main>
        <nav className="tabbar">
          {TABS.map(({ screen: s, label, Icon }) => (
            <button key={label} className={tabActive === s.name ? 'active' : ''} onClick={() => go(s)}>
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </ProfileProvider>
  );
}
