import { useEffect, useState } from 'react';

// "Add to Home Screen": Android and desktop Chrome offer a prompt we can trigger; iPhone and iPad
// only allow it from Safari's Share menu, so there we show the steps instead.
type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

let deferred: InstallPrompt | null = null;
const listeners = new Set<() => void>();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPrompt;
    listeners.forEach((l) => l());
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    listeners.forEach((l) => l());
  });
}

const DISMISS_KEY = 'flight.install.dismissed';

export const isInstalled = () =>
  matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

// iPhone and iPad (iPadOS reports itself as a Mac, but with touch).
export const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export function useInstall() {
  const [, setTick] = useState(0);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);

  const mode: 'prompt' | 'ios' | null = isInstalled() ? null : deferred ? 'prompt' : isIos() ? 'ios' : null;

  return {
    mode: dismissed ? null : mode,
    install: async () => {
      if (!deferred) return;
      await deferred.prompt();
      await deferred.userChoice;
      deferred = null;
      setTick((t) => t + 1);
    },
    dismiss: () => {
      setDismissed(true);
      try {
        localStorage.setItem(DISMISS_KEY, '1');
      } catch {
        /* shown again next time */
      }
    },
  };
}
