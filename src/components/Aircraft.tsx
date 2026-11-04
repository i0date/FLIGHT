import { LEVELS, formatFt } from '../lib/levels';
import type { Level } from '../types';

// The Flight aeroplane: navy livery, coral cheatline, amber tail mark. Faces right.
export function PlaneMascot({ width = 220, className }: { width?: number; className?: string }) {
  return (
    <svg viewBox="0 0 240 90" width={width} className={className} aria-hidden="true">
      {/* far wing */}
      <path d="M126 44 L150 24 L162 24 L146 44 Z" fill="#24395a" />
      {/* tail fin */}
      <path d="M30 42 L16 8 L36 8 L66 40 Z" fill="var(--navy)" />
      <path d="M24 14 L34 14 L40 26 L30 26 Z" fill="var(--amber)" />
      {/* tailplane */}
      <path d="M22 46 L4 38 L16 38 L44 46 Z" fill="#24395a" />
      {/* fuselage */}
      <path d="M22 44 C22 36 40 32 70 32 L192 32 C214 32 230 38 236 46 C230 53 214 58 192 58 L44 58 C30 58 22 52 22 44 Z" fill="#fffdf8" stroke="var(--navy)" strokeWidth="2.5" />
      <path d="M26 50 L232 50 C230 53 214 58 192 58 L44 58 C34 58 28 55 26 50 Z" fill="var(--navy)" />
      <path d="M27 47 L233 47 L231 50 L26 50 Z" fill="var(--coral)" />
      {/* windows */}
      {Array.from({ length: 13 }, (_, i) => (
        <rect key={i} x={70 + i * 9} y={38} width={5} height={6} rx={2} fill="var(--navy)" opacity="0.8" />
      ))}
      <path d="M212 37 L224 37 L230 43 L212 43 Z" fill="var(--navy)" />
      {/* near wing + engine */}
      <path d="M112 54 L150 82 L166 82 L148 54 Z" fill="var(--navy)" />
      <rect x="128" y="60" width="26" height="10" rx="5" fill="#24395a" />
      <rect x="150" y="62" width="4" height="6" rx="1" fill="var(--coral)" />
    </svg>
  );
}

// The view from a window seat: sky follows the time of day; altitude follows the streak.
export function PlaneWindow({ streak, hour = new Date().getHours() }: { streak: number; hour?: number }) {
  const phase = hour >= 5 && hour < 8 ? 'dawn' : hour >= 8 && hour < 17 ? 'day' : hour >= 17 && hour < 20 ? 'dusk' : 'night';
  const skies = {
    dawn: ['#f7c59f', '#f3d9c2', '#cfe3f2'],
    day: ['#7fb2dd', '#b7d6ee', '#e3eff8'],
    dusk: ['#3d3a66', '#c8697a', '#f2b544'],
    night: ['#0c1424', '#16243b', '#2a3d5e'],
  }[phase];
  // Altitude: grounded with no streak, above the clouds after a week, near space after a month.
  const band = streak === 0 ? 'ground' : streak < 7 ? 'clouds' : streak < 30 ? 'above' : 'space';
  const ft = band === 'ground' ? 0 : Math.min(51_000, 8_000 + streak * 1_500);
  const top = band === 'space' ? '#0c1424' : skies[0];
  const stars = phase === 'night' || band === 'space';
  const id = `sky-${phase}-${band}`;

  return (
    <div className="window">
      <svg viewBox="0 0 160 200" className="window-svg" aria-label={`Window view at ${formatFt(ft)}`}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={top} />
            <stop offset="0.55" stopColor={skies[1]} />
            <stop offset="1" stopColor={skies[2]} />
          </linearGradient>
          <clipPath id="pane">
            <rect x="14" y="14" width="132" height="172" rx="58" />
          </clipPath>
        </defs>
        <rect x="0" y="0" width="160" height="200" rx="72" fill="#e9e3d6" />
        <rect x="8" y="8" width="144" height="184" rx="64" fill="#d8d0bf" />
        <g clipPath="url(#pane)">
          <rect x="0" y="0" width="160" height="200" fill={`url(#${id})`} />
          {stars &&
            [[40, 40], [92, 30], [118, 62], [60, 78], [104, 96], [34, 108], [128, 120]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.6 : 1} fill="#fff" opacity="0.85" className="twinkle" style={{ animationDelay: `${i * 0.4}s` }} />
            ))}
          {phase !== 'night' && band !== 'space' && <circle cx="112" cy="58" r="12" fill={phase === 'day' ? '#fff6d8' : '#ffd8a0'} opacity="0.9" />}
          {band === 'ground' && (
            <g>
              <rect x="0" y="150" width="160" height="50" fill="#9bb38a" />
              <rect x="0" y="162" width="160" height="14" fill="#5d6675" />
              {[10, 40, 70, 100, 130].map((x) => <rect key={x} x={x} y="168" width="16" height="2" fill="#f5f1e8" />)}
            </g>
          )}
          {band === 'clouds' && (
            <g className="drift" fill="#fff" opacity="0.92">
              <ellipse cx="40" cy="120" rx="34" ry="12" />
              <ellipse cx="62" cy="112" rx="22" ry="12" />
              <ellipse cx="120" cy="150" rx="40" ry="13" />
              <ellipse cx="100" cy="142" rx="20" ry="10" />
            </g>
          )}
          {(band === 'above' || band === 'space') && (
            <g className="drift" fill="#fff" opacity={band === 'space' ? 0.55 : 0.95}>
              <ellipse cx="30" cy="178" rx="50" ry="16" />
              <ellipse cx="90" cy="186" rx="60" ry="18" />
              <ellipse cx="150" cy="176" rx="40" ry="14" />
            </g>
          )}
          {/* wing tip */}
          <path d="M60 200 L150 150 L162 150 L162 168 L96 200 Z" fill="#fffdf8" />
          <path d="M150 150 L162 132 L166 132 L162 150 Z" fill="var(--coral)" />
        </g>
        <rect x="14" y="14" width="132" height="172" rx="58" fill="none" stroke="#c4baa6" strokeWidth="3" />
        {/* window shade */}
        <rect x="20" y="10" width="120" height="12" rx="6" fill="#efe9dc" />
      </svg>
      <div className="window-readout mono">
        <span>{band === 'ground' ? 'ON THE GROUND' : 'ALTITUDE'}</span>
        <strong>{band === 'ground' ? 'Fly today' : formatFt(ft)}</strong>
      </div>
    </div>
  );
}

// Seat-back moving map: plane follows an arc from origin to destination.
export function FlightMap({ from, to, progress, step, total, level }: { from: string; to: string; progress: number; step: number; total: number; level: Level }) {
  const p0 = { x: 30, y: 92 };
  const c = { x: 160, y: 4 };
  const p1 = { x: 290, y: 92 };
  const t = Math.max(0, Math.min(1, progress));
  const x = (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * c.x + t ** 2 * p1.x;
  const y = (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * c.y + t ** 2 * p1.y;
  const dx = 2 * (1 - t) * (c.x - p0.x) + 2 * t * (p1.x - c.x);
  const dy = 2 * (1 - t) * (c.y - p0.y) + 2 * t * (p1.y - c.y);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const path = `M${p0.x} ${p0.y} Q${c.x} ${c.y} ${p1.x} ${p1.y}`;

  return (
    <div className="seatback">
      <svg viewBox="0 0 320 120" className="seatback-map" aria-label={`Question ${step} of ${total}`}>
        {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="120" className="map-grid" />)}
        {Array.from({ length: 4 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 40} x2="320" y2={i * 40} className="map-grid" />)}
        <path d="M0 96 C40 70 70 108 120 92 S200 70 240 96 S300 110 320 92 L320 120 L0 120 Z" className="map-land" />
        <path d={path} className="map-route" />
        <path d={path} className="map-flown" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - t} />
        <circle cx={p0.x} cy={p0.y} r="4" className="map-dot" />
        <circle cx={p1.x} cy={p1.y} r="4" className="map-dot" />
        <text x={p0.x} y={p0.y + 18} className="map-code" textAnchor="middle">{from}</text>
        <text x={p1.x} y={p1.y + 18} className="map-code" textAnchor="middle">{to}</text>
        <g transform={`translate(${x} ${y}) rotate(${angle + 90})`} className="map-plane">
          <path d="M0 -9 L2 -3 L9 2 L9 4 L2 2 L1.5 7 L4 9 L4 10 L0 9 L-4 10 L-4 9 L-1.5 7 L-2 2 L-9 4 L-9 2 L-2 -3 Z" fill="#f2b544" />
        </g>
      </svg>
      <div className="seatback-strip mono">
        <span>Q {step}/{total}</span>
        <span>ALT {formatFt(LEVELS[level].ft)}</span>
        <span>{total - step} TO GO</span>
      </div>
    </div>
  );
}

// Cockpit altimeter: the needle climbs with the difficulty level.
export function Altimeter({ level }: { level: Level }) {
  const ft = LEVELS[level].ft;
  const angle = (ft / 60_000) * 300 - 150;
  return (
    <div className="altimeter" title={`${LEVELS[level].name} · ${formatFt(ft)}`}>
      <svg viewBox="0 0 100 100" width="76" height="76" aria-hidden="true">
        <circle cx="50" cy="50" r="47" fill="#0f1a2c" stroke="#3a4b66" strokeWidth="3" />
        {Array.from({ length: 13 }, (_, i) => {
          const a = ((-150 + i * 25) * Math.PI) / 180;
          const r1 = i % 2 === 0 ? 33 : 37;
          return <line key={i} x1={50 + Math.sin(a) * r1} y1={50 - Math.cos(a) * r1} x2={50 + Math.sin(a) * 42} y2={50 - Math.cos(a) * 42} stroke="#cfd8e6" strokeWidth={i % 2 === 0 ? 2 : 1} />;
        })}
        <path d={describeArc(50, 50, 42, 100, 150)} stroke="var(--coral)" strokeWidth="4" fill="none" />
        <text x="50" y="70" textAnchor="middle" fontSize="8" fill="#cfd8e6" fontFamily="var(--mono)">FT×1000</text>
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '50px 50px', transition: 'transform 0.8s cubic-bezier(.3,1.4,.5,1)' }}>
          <path d="M50 14 L53 50 L47 50 Z" fill="var(--amber)" />
        </g>
        <circle cx="50" cy="50" r="5" fill="#cfd8e6" />
      </svg>
      <div className="altimeter-label">
        <strong>L{level} · {LEVELS[level].name}</strong>
        <span className="mono">{formatFt(ft)} · {LEVELS[level].skill}</span>
      </div>
    </div>
  );
}

function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const pt = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${cx + Math.sin(a) * r} ${cy - Math.cos(a) * r}`;
  };
  return `M${pt(start)} A${r} ${r} 0 0 1 ${pt(end)}`;
}

// Touchdown: plane glides onto a lit runway.
export function Landing() {
  return (
    <svg viewBox="0 0 320 150" className="landing" aria-hidden="true">
      <defs>
        <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24395a" />
          <stop offset="1" stopColor="#c8697a" />
        </linearGradient>
      </defs>
      <rect width="320" height="150" fill="url(#dusk)" rx="16" />
      <path d="M120 150 L150 92 L170 92 L200 150 Z" fill="#3b4558" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={158.5} y={98 + i * 13} width={3} height={6 + i * 1.5} fill="#f5f1e8" />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} className="runway-light" style={{ animationDelay: `${i * 0.15}s` }}>
          <circle cx={148 - i * 7} cy={96 + i * 12} r={1.6 + i * 0.3} fill="#f2b544" />
          <circle cx={172 + i * 7} cy={96 + i * 12} r={1.6 + i * 0.3} fill="#f2b544" />
        </g>
      ))}
      <rect y="92" width="320" height="2" fill="#16243b" opacity="0.4" />
      <g className="landing-plane">
        <PlaneMascotInline />
      </g>
    </svg>
  );
}

function PlaneMascotInline() {
  return (
    <g transform="scale(0.35)">
      <path d="M30 42 L16 8 L36 8 L66 40 Z" fill="#16243b" />
      <path d="M22 44 C22 36 40 32 70 32 L192 32 C214 32 230 38 236 46 C230 53 214 58 192 58 L44 58 C30 58 22 52 22 44 Z" fill="#fffdf8" />
      <path d="M27 47 L233 47 L231 50 L26 50 Z" fill="#e07a5f" />
      <path d="M112 54 L150 82 L166 82 L148 54 Z" fill="#16243b" />
    </g>
  );
}
