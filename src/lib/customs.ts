// Which Daily Flight answers were right, kept on this device so Customs still shows after a reload.
// The day's questions are fixed, so the right/wrong list is all that needs keeping.
const key = (day: string) => `flight.results.${day}`;

export function saveResults(day: string, results: boolean[]) {
  try {
    localStorage.setItem(key(day), results.map(Number).join(''));
  } catch {
    /* not kept this time */
  }
}

export function loadResults(day: string): boolean[] {
  try {
    return [...(localStorage.getItem(key(day)) ?? '')].map((c) => c === '1');
  } catch {
    return [];
  }
}
