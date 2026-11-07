// The boarding pass you share after a Daily Flight: an image where the phone can share one, and text everywhere.
export type PassResult = { flight: string; date: string; score: number; results: boolean[]; streak: number };

const SITE = 'https://flight-roan-three.vercel.app';
const C = { paper: '#f5f1e8', card: '#fffdf8', navy: '#16243b', muted: '#6b7486', line: '#e4ddcf', good: '#3d8a85', bad: '#c8553d', amber: '#f2b544' };

// Smooth air or turbulence for each question, climbing from take-off to the stratosphere.
export function shareText(r: PassResult) {
  const row = r.results.map((ok) => (ok ? '🟦' : '🟧')).join('');
  return [`FLIGHT ✈️ ${r.flight} · GEN → REV`, `${r.score}/10${r.streak > 0 ? ` · 🔥 ${r.streak}-day streak` : ''}`, row, SITE].join('\n');
}

export async function shareImage(r: PassResult): Promise<Blob | null> {
  await document.fonts?.ready;
  const W = 1200;
  const H = 630;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d');
  if (!g) return null;
  const sans = (size: number, weight = 700) => `${weight} ${size}px 'DM Sans', system-ui, sans-serif`;
  const mono = (size: number, weight = 700) => `${weight} ${size}px 'JetBrains Mono', ui-monospace, monospace`;

  // Paper background and the pass itself, with a tear-off stub on the right.
  g.fillStyle = C.paper;
  g.fillRect(0, 0, W, H);
  const x = 50, y = 50, w = W - 100, h = H - 100, stubX = x + w - 300;
  g.fillStyle = C.card;
  g.beginPath();
  g.roundRect(x, y, w, h, 28);
  g.fill();
  g.fillStyle = C.navy;
  g.beginPath();
  g.roundRect(x, y, w, 84, [28, 28, 0, 0]);
  g.fill();
  g.fillStyle = '#fff';
  g.font = sans(30);
  g.fillText('✈  FLIGHT', x + 40, y + 54);
  g.font = mono(22, 500);
  g.textAlign = 'right';
  g.fillText('BOARDING PASS · DAILY FLIGHT', x + w - 40, y + 52);
  g.textAlign = 'left';

  // Perforation between the pass and the stub.
  g.strokeStyle = C.line;
  g.lineWidth = 3;
  g.setLineDash([10, 10]);
  g.beginPath();
  g.moveTo(stubX, y + 104);
  g.lineTo(stubX, y + h - 20);
  g.stroke();
  g.setLineDash([]);

  // Route.
  const label = (text: string, lx: number, ly: number) => {
    g.fillStyle = C.muted;
    g.font = sans(18, 500);
    g.fillText(text.toUpperCase(), lx, ly);
  };
  g.fillStyle = C.navy;
  g.font = mono(76);
  g.fillText('GEN', x + 40, y + 190);
  g.fillText('REV', x + 440, y + 190);
  g.font = sans(40);
  g.fillText('✈', x + 300, y + 178);
  label('Genesis', x + 42, y + 222);
  label('Revelation', x + 442, y + 222);

  // Altitude bars: one per question, taller as the flight climbs.
  const barW = 46, gap = 12, base = y + h - 70;
  r.results.forEach((ok, i) => {
    const bh = 40 + i * 12;
    g.fillStyle = ok ? C.good : C.bad;
    g.beginPath();
    g.roundRect(x + 40 + i * (barW + gap), base - bh, barW, bh, 8);
    g.fill();
  });
  label('Take-off', x + 40, base + 36);
  g.textAlign = 'right';
  label('Stratosphere', x + 40 + 10 * (barW + gap) - gap, base + 36);
  g.textAlign = 'left';

  // Stub: flight, date, score and streak.
  const sx = stubX + 40;
  label('Flight', sx, y + 140);
  g.fillStyle = C.navy;
  g.font = mono(30);
  g.fillText(r.flight, sx, y + 176);
  label('Date', sx, y + 222);
  g.fillStyle = C.navy;
  g.font = mono(26, 500);
  g.fillText(r.date, sx, y + 256);
  label('Score', sx, y + 304);
  g.fillStyle = C.navy;
  g.font = mono(64);
  g.fillText(`${r.score}/10`, sx, y + 368);
  if (r.streak > 0) {
    g.fillStyle = C.amber;
    g.beginPath();
    g.roundRect(sx, y + 396, 220, 52, 26);
    g.fill();
    g.fillStyle = C.navy;
    g.font = sans(24);
    g.fillText(`🔥 ${r.streak}-day streak`, sx + 18, y + 431);
  }

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

// Share the image where the phone allows it, otherwise the text; on desktop, copy the text.
export async function sharePass(r: PassResult): Promise<'shared' | 'copied' | 'cancelled'> {
  const text = shareText(r);
  const blob = await shareImage(r).catch(() => null);
  const file = blob && new File([blob], `flight-${r.date}.png`, { type: 'image/png' });
  try {
    if (file && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text });
      return 'shared';
    }
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      await navigator.share({ text });
      return 'shared';
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
  }
  await navigator.clipboard.writeText(text);
  return 'copied';
}
