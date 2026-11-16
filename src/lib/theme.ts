// Day or night colours: following the phone (the default), or chosen in Settings. Kept on this device.
// index.html applies the saved choice before the first paint, so the app never flashes the wrong colours.

export type ThemeChoice = 'auto' | 'light' | 'dark';
const KEY = 'flight-theme';
const night = window.matchMedia('(prefers-color-scheme: dark)');

export function themeChoice(): ThemeChoice {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'auto';
  } catch {
    return 'auto';
  }
}

function apply(choice: ThemeChoice) {
  const dark = choice === 'dark' || (choice === 'auto' && night.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

export function setThemeChoice(choice: ThemeChoice) {
  try {
    if (choice === 'auto') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {
    // Storage blocked: the choice lasts until the page closes.
  }
  apply(choice);
}

// Follow the phone when it switches between day and night, unless a choice was made.
export function followSystemTheme() {
  apply(themeChoice());
  night.addEventListener('change', () => themeChoice() === 'auto' && apply('auto'));
}
