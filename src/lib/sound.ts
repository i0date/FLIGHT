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

function tone(freq: number, start: number, length: number, gain = 0.2, type: OscillatorType = 'sine') {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + length);
  osc.connect(g).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + length);
}

// Phones start audio paused, pause it again when the app is in the background, and on iPhone
// mute web audio with the silent switch. Ask for media playback and resume before every sound.
function audio(): AudioContext | null {
  try {
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session) session.type = 'playback';
    ctx ??= new AudioContext();
    if (ctx.state !== 'running') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

// Wake the audio on the first tap anywhere, so the first answer already has sound.
if (typeof window !== 'undefined') {
  const unlock = () => {
    if (soundOn()) audio();
  };
  window.addEventListener('pointerdown', unlock, { once: true, capture: true });
}

// Correct: the two-note seatbelt-sign chime. Wrong: a soft low double bump, pitched high enough for phone speakers.
export function chime(correct: boolean) {
  if (!soundOn() || !audio()) return;
  if (correct) {
    tone(988, 0, 0.9);
    tone(784, 0.28, 1.1);
  } else {
    tone(294, 0, 0.22, 0.14, 'triangle');
    tone(220, 0.16, 0.4, 0.14, 'triangle');
  }
}

// Played when sound is switched on, so the traveller hears it working.
export function testChime() {
  if (audio()) tone(988, 0, 0.6, 0.16);
}
