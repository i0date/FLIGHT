import { useEffect, useState } from 'react';
import { ProfileProvider } from './lib/profile';
import { Home } from './screens/Home';
import { Daily } from './screens/Daily';
import { BookClub, BookQuiz } from './screens/BookClub';
import { Leaderboard } from './screens/Leaderboard';
import { Premium } from './screens/Premium';
import { Passport as PassportScreen } from './screens/Passport';
import { NightFlight } from './screens/NightFlight';
import { Archive } from './screens/Archive';
import { Book, Home as HomeIcon, Passport, Seat, Trophy } from './components/Icons';
import type { Screen } from './types';

const TABS: { screen: Screen; label: string; Icon: typeof HomeIcon }[] = [
  { screen: { name: 'home' }, label: 'Terminal', Icon: HomeIcon },
  { screen: { name: 'bookclub' }, label: 'Book Club', Icon: Book },
  { screen: { name: 'passport' }, label: 'Passport', Icon: Passport },
  { screen: { name: 'leaderboard' }, label: 'Ranks', Icon: Trophy },
  { screen: { name: 'premium' }, label: 'Club', Icon: Seat },
];

export default function App() {
  // Coming back from Stripe (?checkout=success|cancel|return) opens the Club page.
  const [checkout] = useState(() => new URLSearchParams(window.location.search).get('checkout'));
  const [screen, setScreen] = useState<Screen>(checkout ? { name: 'premium' } : { name: 'home' });
  useEffect(() => {
    if (checkout) window.history.replaceState(null, '', window.location.pathname);
  }, [checkout]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);
  const go = (s: Screen) => setScreen(s);
  const tabActive = screen.name === 'book' ? 'bookclub' : ['daily', 'night', 'archive'].includes(screen.name) ? 'home' : screen.name;

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
          {screen.name === 'leaderboard' && <Leaderboard go={go} />}
          {screen.name === 'premium' && <Premium go={go} checkout={checkout} />}
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
