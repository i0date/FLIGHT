import { useEffect, useState } from 'react';
import { ProfileProvider } from './lib/profile';
import { Home } from './screens/Home';
import { Daily } from './screens/Daily';
import { BookClub, BookQuiz } from './screens/BookClub';
import { Leaderboard } from './screens/Leaderboard';
import { Premium } from './screens/Premium';
import { Home as HomeIcon, Passport, Seat, Trophy } from './components/Icons';
import type { Screen } from './types';

const TABS: { screen: Screen; label: string; Icon: typeof HomeIcon }[] = [
  { screen: { name: 'home' }, label: 'Terminal', Icon: HomeIcon },
  { screen: { name: 'bookclub' }, label: 'Book Club', Icon: Passport },
  { screen: { name: 'leaderboard' }, label: 'Ranks', Icon: Trophy },
  { screen: { name: 'premium' }, label: 'Flight Club', Icon: Seat },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);
  const go = (s: Screen) => setScreen(s);
  const tabActive = screen.name === 'book' ? 'bookclub' : screen.name === 'daily' ? 'home' : screen.name;

  return (
    <ProfileProvider>
      <div className="app">
        <main>
          {screen.name === 'home' && <Home go={go} />}
          {screen.name === 'daily' && <Daily go={go} />}
          {screen.name === 'bookclub' && <BookClub go={go} />}
          {screen.name === 'book' && <BookQuiz key={screen.bookId} bookId={screen.bookId} go={go} />}
          {screen.name === 'leaderboard' && <Leaderboard go={go} />}
          {screen.name === 'premium' && <Premium />}
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
