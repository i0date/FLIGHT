import { useEffect, useState } from 'react';
import type { Level } from '../types';

// The flight you just flew, climbing left to right: a filled light for each right answer, an empty one for a miss.
export function FlightPath({ results, levels }: { results: boolean[]; levels: Level[] }) {
  const W = 320;
  const H = 96;
  const x = (i: number) => 16 + (i * (W - 32)) / Math.max(1, results.length - 1);
  const y = (l: Level) => H - 18 - ((l - 1) / 5) * (H - 36);
  const points = results.map((_, i) => `${x(i)},${y(levels[i] ?? 1)}`).join(' ');
  const right = results.filter(Boolean).length;
  return (
    <svg className="flight-path" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${right} of ${results.length} right, climbing from take-off to the stratosphere`}>
      <line x1="8" x2={W - 8} y1={H - 6} y2={H - 6} className="fp-ground" />
      <polyline points={points} className="fp-route" />
      {results.map((ok, i) => (
        <circle key={i} cx={x(i)} cy={y(levels[i] ?? 1)} r={ok ? 7 : 6} className={`fp-light ${ok ? 'fp-good' : 'fp-miss'}`} style={{ animationDelay: `${0.25 + i * 0.09}s` }} />
      ))}
    </svg>
  );
}

// The score counts up as the lights come on (straight to the total when motion is reduced).
export function useCountUp(target: number, ms = 900) {
  const still = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [n, setN] = useState(still ? target : 0);
  useEffect(() => {
    if (still) return setN(target);
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      setN(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, ms, still]);
  return n;
}
