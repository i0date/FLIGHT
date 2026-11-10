import type { Scene } from '../data/postcards';

// Postcard fronts, drawn as flat travel-poster scenes (600 × 400). Returned as SVG text so the
// same picture shows on screen and in the shared image.
const W = 600;
const H = 400;

const sky = (top: string, bottom: string) =>
  `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>`;
const sun = (cx = 470, cy = 110, r = 46, fill = '#f6c453') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
const day = () => sky('#a9d2ec', '#f7ead0') + sun();
const cloud = (x: number, y: number, s = 1) =>
  `<g fill="#fffaf0" opacity="0.9" transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="38" ry="14"/><ellipse cx="22" cy="-10" rx="24" ry="16"/><ellipse cx="-18" cy="-6" rx="20" ry="12"/></g>`;
const hills = (y: number, fill: string, amp = 30) =>
  `<path d="M0 ${y} C 120 ${y - amp} 220 ${y + amp / 2} 330 ${y - amp / 2} S 520 ${y - amp} ${W} ${y - amp / 3} V ${H} H 0 Z" fill="${fill}"/>`;
const waves = (y: number, fill: string, foam = '#e8f4fb') =>
  `<path d="M0 ${y} q 25 -10 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 V ${H} H 0 Z" fill="${fill}"/>
  <path d="M0 ${y} q 25 -10 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0" fill="none" stroke="${foam}" stroke-width="3" opacity="0.7"/>`;
const stars = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const x = (i * 137.5) % W;
    const y = ((i * 71.3) % 220) + 10;
    const r = i % 7 === 0 ? 2.4 : 1.3;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#fff7dd" opacity="${i % 3 === 0 ? 1 : 0.7}"/>`;
  }).join('');
const tree = (x: number, y: number, s = 1, fill = '#3f7f4f') =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="-6" width="10" height="40" fill="#7a5233"/><circle cx="0" cy="-26" r="30" fill="${fill}"/><circle cx="-20" cy="-10" r="20" fill="${fill}"/><circle cx="20" cy="-10" r="20" fill="${fill}"/></g>`;
const sheep = (x: number, y: number) =>
  `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="16" ry="11" fill="#fffaf0"/><circle cx="15" cy="-4" r="6" fill="#3b3b3b"/><rect x="-9" y="8" width="3" height="8" fill="#3b3b3b"/><rect x="6" y="8" width="3" height="8" fill="#3b3b3b"/></g>`;

const SCENES: Record<Scene, (ink: string) => string> = {
  garden: () =>
    day() + cloud(140, 80) + hills(250, '#9cc69b', 40) + hills(300, '#6fa86b', 24) +
    `<path d="M250 400 C 290 340 360 330 330 290 S 380 250 420 250" fill="none" stroke="#7fb6d9" stroke-width="26" stroke-linecap="round"/>` +
    tree(140, 300, 1.4) + `<g fill="#d94f3d"><circle cx="122" cy="246" r="6"/><circle cx="156" cy="232" r="6"/><circle cx="140" cy="270" r="6"/></g>` +
    tree(500, 300, 1, '#4f8f5a'),
  sea: () =>
    day() + cloud(160, 90) + cloud(330, 60, 0.7) + hills(250, '#c9b48a', 16) +
    waves(270, '#4f8fbf') + waves(320, '#2f6f9f') + waves(365, '#245a85'),
  mountain: () =>
    day() + cloud(120, 70) +
    `<path d="M80 320 L 300 70 L 520 320 Z" fill="#7d8fa8"/><path d="M300 70 L 255 122 L 280 116 L 300 134 L 322 114 L 345 122 Z" fill="#fffaf0"/>
    <path d="M330 320 L 450 160 L 600 320 Z" fill="#94a5bb"/>` +
    hills(320, '#7fae74', 22) + hills(360, '#5f9a5c', 14),
  desert: () =>
    sky('#f3c98b', '#fbecd2') + sun(460, 120, 50, '#f7d27a') +
    `<path d="M120 90 q -16 0 -16 20 v 150 h 32 v -150 q 0 -20 -16 -20 z" fill="#fffaf0" opacity="0.85"/>` +
    hills(270, '#e3c48a', 30) + hills(320, '#d4a85f', 26) +
    `<g transform="translate(330 300)"><path d="M-50 40 L 0 -30 L 50 40 Z" fill="#8a5a3b"/><path d="M-50 40 L 0 -30 L -20 40 Z" fill="#a8744d"/><path d="M-8 40 L 0 8 L 8 40 Z" fill="#3b2a1d"/></g>
    <g transform="translate(450 320) scale(0.7)"><path d="M-50 40 L 0 -30 L 50 40 Z" fill="#8a5a3b"/><path d="M-50 40 L 0 -30 L -20 40 Z" fill="#a8744d"/></g>`,
  city: (ink) =>
    day() + cloud(110, 70) + hills(300, '#b9c98f', 20) +
    `<g fill="#d9b98a"><rect x="120" y="190" width="360" height="130"/>
    ${Array.from({ length: 12 }, (_, i) => `<rect x="${120 + i * 30}" y="178" width="18" height="14"/>`).join('')}
    <rect x="90" y="150" width="60" height="170"/><rect x="450" y="150" width="60" height="170"/>
    <rect x="90" y="138" width="14" height="14"/><rect x="113" y="138" width="14" height="14"/><rect x="136" y="138" width="14" height="14"/>
    <rect x="450" y="138" width="14" height="14"/><rect x="473" y="138" width="14" height="14"/><rect x="496" y="138" width="14" height="14"/></g>
    <path d="M270 320 V 260 a 30 30 0 0 1 60 0 V 320 Z" fill="#5b4330"/>
    <rect x="118" y="104" width="4" height="36" fill="#5b4330"/><path d="M122 104 h 26 l -6 9 l 6 9 h -26 z" fill="${ink}"/>` +
    hills(340, '#8fb06e', 14),
  temple: () =>
    day() + cloud(130, 80) + hills(300, '#c7cf9a', 18) +
    `<g fill="#efe3c6"><path d="M150 160 L 300 100 L 450 160 Z"/><rect x="160" y="160" width="280" height="16"/>
    ${Array.from({ length: 6 }, (_, i) => `<rect x="${172 + i * 48}" y="176" width="22" height="110"/>`).join('')}
    <rect x="140" y="286" width="320" height="14"/><rect x="125" y="300" width="350" height="14"/><rect x="110" y="314" width="380" height="14"/></g>
    <path d="M150 160 L 300 100 L 450 160" fill="none" stroke="#cdb98d" stroke-width="4"/>` +
    hills(350, '#9cba7a', 10),
  fields: () =>
    sky('#f4b183', '#fbe7c6') + sun(300, 250, 70, '#f7c86a') + hills(260, '#c8a24f', 10) +
    `<rect y="260" width="${W}" height="140" fill="#e9c46a"/>` +
    Array.from({ length: 9 }, (_, i) => `<path d="M${-60 + i * 90} 400 L 300 262" stroke="#d4a944" stroke-width="10"/>`).join('') +
    `<g transform="translate(140 330)"><path d="M-14 30 L 0 -40 L 14 30 Z" fill="#c99a3b"/><rect x="-16" y="-4" width="32" height="6" fill="#8a5a3b"/></g>
    <g transform="translate(470 340) scale(0.8)"><path d="M-14 30 L 0 -40 L 14 30 Z" fill="#c99a3b"/><rect x="-16" y="-4" width="32" height="6" fill="#8a5a3b"/></g>`,
  hills: () =>
    day() + cloud(150, 80) + cloud(380, 60, 0.6) + hills(240, '#a7cf98', 36) + hills(290, '#86bb7c', 30) + hills(340, '#6aa56a', 20) +
    sheep(180, 330) + sheep(240, 350) + sheep(390, 335) + sheep(450, 360) +
    `<path d="M520 360 V 290 q 0 -14 12 -14" fill="none" stroke="#7a5233" stroke-width="5" stroke-linecap="round"/>`,
  stars: () =>
    sky('#0f1f3d', '#34507e') + stars(70) +
    `<circle cx="470" cy="90" r="34" fill="#fff3c4"/><circle cx="486" cy="80" r="30" fill="#14264a"/>
    <path d="M150 60 l 8 22 l 22 8 l -22 8 l -8 22 l -8 -22 l -22 -8 l 22 -8 z" fill="#fff3c4"/>` +
    hills(300, '#1d2f52', 30) + hills(340, '#16243b', 20),
  sunrise: () =>
    sky('#f08a5d', '#fde3b0') +
    Array.from({ length: 12 }, (_, i) => {
      const a = (Math.PI * (i + 0.5)) / 12;
      return `<path d="M300 290 L ${300 - Math.cos(a) * 420} ${290 - Math.sin(a) * 420} L ${300 - Math.cos(a + 0.12) * 420} ${290 - Math.sin(a + 0.12) * 420} Z" fill="#fff3c4" opacity="0.25"/>`;
    }).join('') +
    sun(300, 290, 90, '#f9c95c') + waves(290, '#e07a5f', '#fbd3b5') + waves(340, '#c8553d', '#f5b49a'),
  vine: () =>
    day() + hills(280, '#a7c98a', 26) + hills(330, '#86b06a', 16) +
    `<g stroke="#7a5233" stroke-width="6"><path d="M60 360 V 150"/><path d="M300 360 V 150"/><path d="M540 360 V 150"/><path d="M40 160 H 560"/></g>` +
    Array.from({ length: 11 }, (_, i) => `<ellipse cx="${70 + i * 46}" cy="${170 + (i % 2) * 8}" rx="22" ry="14" fill="${i % 2 ? '#4f8f4a' : '#3f7a3d'}"/>`).join('') +
    [110, 250, 390, 500].map((x) => `<g fill="#6b3f8a">${[0, 1, 2, 3, 4, 5].map((j) => `<circle cx="${x + ((j % 3) - 1) * 9 + (j > 2 ? 4 : 0)}" cy="${196 + Math.floor(j / 3) * 10 + (j > 4 ? 8 : 0)}" r="6"/>`).join('')}<circle cx="${x + 4}" cy="${224}" r="6"/></g>`).join(''),
  boat: (ink) =>
    day() + cloud(140, 90) + hills(250, '#b9b48a', 14) + waves(270, '#5a98c4') + waves(330, '#3f7fae') +
    `<g transform="translate(300 300)"><path d="M-90 0 H 90 L 60 34 H -60 Z" fill="#8a5a3b"/><rect x="-3" y="-140" width="6" height="140" fill="#5b4330"/>
    <path d="M6 -134 L 80 -10 H 6 Z" fill="#fff4dc"/><path d="M-6 -120 L -66 -10 H -6 Z" fill="#f1e2bf"/><path d="M6 -150 h 30 l -8 8 l 8 8 h -30 z" fill="${ink}"/></g>` +
    waves(345, '#2f6f9f') +
    `<g fill="none" stroke="#3b3b3b" stroke-width="2.5" stroke-linecap="round"><path d="M120 150 q 8 -8 16 0 q 8 -8 16 0"/><path d="M170 120 q 6 -6 12 0 q 6 -6 12 0"/></g>`,
  lamp: () =>
    sky('#2b3a5e', '#6b5b7e') + stars(30) +
    `<defs><radialGradient id="glow"><stop offset="0" stop-color="#ffd97a" stop-opacity="0.9"/><stop offset="1" stop-color="#ffd97a" stop-opacity="0"/></radialGradient></defs>
    <circle cx="300" cy="215" r="150" fill="url(#glow)"/>
    <rect y="300" width="${W}" height="100" fill="#5b4330"/><rect y="300" width="${W}" height="10" fill="#7a5a40"/>
    <g transform="translate(300 290)"><path d="M-80 0 Q -70 -40 0 -40 Q 50 -40 70 -20 L 100 -30 Q 95 -10 80 0 Z" fill="#c98b3a"/>
    <ellipse cx="0" cy="0" rx="80" ry="10" fill="#a8702c"/><path d="M96 -38 q -14 -30 4 -58 q 18 28 4 58 z" fill="#ffcf5a"/><path d="M99 -42 q -6 -16 2 -30 q 8 14 2 30 z" fill="#fff3c4"/></g>`,
  scroll: (ink) =>
    sky('#e9d6b0', '#c9a37a') +
    `<rect x="380" y="40" width="160" height="200" fill="#f8ecd0" opacity="0.6"/><path d="M460 40 V 240 M380 140 H 540" stroke="#c9a37a" stroke-width="6"/>
    <rect y="300" width="${W}" height="100" fill="#8a5a3b"/>
    <g transform="translate(300 250)"><rect x="-170" y="-90" width="340" height="150" fill="#f6e8c4"/>
    ${Array.from({ length: 7 }, (_, i) => `<rect x="-140" y="${-70 + i * 18}" width="${i === 6 ? 160 : 280}" height="5" rx="2" fill="#a8916a" opacity="0.7"/>`).join('')}
    <rect x="-192" y="-104" width="26" height="178" rx="12" fill="#7a5233"/><rect x="166" y="-104" width="26" height="178" rx="12" fill="#7a5233"/>
    <circle cx="120" cy="40" r="14" fill="${ink}"/></g>`,
  river: () =>
    day() + cloud(160, 70) +
    `<path d="M60 230 L 170 150 L 260 230 Z" fill="#94a5bb"/><path d="M200 230 L 330 120 L 460 230 Z" fill="#7d8fa8"/>` +
    hills(240, '#9cc69b', 14) + `<rect y="240" width="${W}" height="160" fill="#7fb46f"/>` +
    `<path d="M300 240 C 280 280 380 300 330 340 S 220 380 260 400 H 420 C 400 380 470 350 420 320 S 330 270 316 240 Z" fill="#6fb3d6"/>` +
    tree(120, 330, 0.9) + tree(200, 300, 0.6) + tree(500, 320, 0.9, '#4f8f5a') + tree(450, 285, 0.55, '#4f8f5a'),
};

// Night skies, where the "Greetings from" line needs light ink.
export const DARK_SCENES = new Set<Scene>(['stars', 'lamp']);

// Gradient ids are named after the scene, so several postcards on one page don't borrow each other's sky.
export function sceneSvg(scene: Scene, ink: string) {
  const body = SCENES[scene](ink).replace(/id="(sky|glow)"/g, `id="$1-${scene}"`).replace(/url\(#(sky|glow)\)/g, `url(#$1-${scene})`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${body}</svg>`;
}
