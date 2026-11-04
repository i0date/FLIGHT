// Cabin sounds, made with Web Audio so there are no audio files to ship.
const KEY = 'flight.sound';
let ctx: AudioContext | null = null;

export function soundOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setSound(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* ignore */
  }
}

function tone(freq: number, start: number, length: number, gain = 0.12) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + length);
  osc.connect(g).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + length);
}

// Correct: the two-note seatbelt-sign chime. Wrong: a low single bump.
export function chime(correct: boolean) {
  if (!soundOn()) return;
  try {
    ctx ??= new AudioContext();
    if (correct) {
      tone(988, 0, 0.9);
      tone(784, 0.28, 1.1);
    } else {
      tone(196, 0, 0.35, 0.08);
    }
  } catch {
    /* audio unavailable */
  }
}
