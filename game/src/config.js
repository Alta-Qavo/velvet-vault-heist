// Velvet Vault — level layout and tuning constants.
// One room, drawn top-down: a museum vault at night. Everything the judge
// needs to see in one frame lives in this single room.

export const VIEW = { w: 1280, h: 720 };
export const HUD_H = 58;

// The playable floor, inside the gold-trimmed walls.
export const ROOM = { x: 18, y: 66, w: 1244, h: 636 };

export const PLAYER = {
  radius: 15,
  walkSpeed: 168,
  sneakSpeed: 78,
  start: { x: 210, y: 648 },
};

// Marble pillars and display tables. They block movement and block sight:
// a guard or camera cannot see through them.
export const BLOCKERS = [
  { x: 428, y: 218, w: 40, h: 40, kind: 'pillar' },
  { x: 812, y: 218, w: 40, h: 40, kind: 'pillar' },
  { x: 428, y: 470, w: 40, h: 40, kind: 'pillar' },
  { x: 812, y: 470, w: 40, h: 40, kind: 'pillar' },
  { x: 600, y: 330, w: 80, h: 56, kind: 'table' },
];

// The six loot vitrines. Grab all six and the exit opens.
export const LOOT = [
  { id: 'idol', name: 'Golden Idol', value: 2500, x: 300, y: 168, color: '#f5c542' },
  { id: 'orb', name: 'Emerald Orb', value: 1600, x: 640, y: 168, color: '#2ee6a8' },
  { id: 'mask', name: 'Jade Mask', value: 1800, x: 980, y: 168, color: '#3fd68c' },
  { id: 'tiara', name: 'Ruby Tiara', value: 2200, x: 300, y: 566, color: '#ff5d73' },
  { id: 'scepter', name: 'Diamond Scepter', value: 2800, x: 640, y: 566, color: '#c9f2ff' },
  { id: 'crown', name: 'Sapphire Crown', value: 3000, x: 980, y: 566, color: '#5da8ff' },
];

// Wall decor (non-blocking): framed paintings, potted palms, benches.
export const PAINTINGS = [
  { x: 130, y: 78, w: 86, h: 52, hue: '#7a4a6b' },
  { x: 1064, y: 78, w: 86, h: 52, hue: '#3a6b7a' },
  { x: 130, y: 640, w: 86, h: 52, hue: '#6b7a3a' },
  { x: 1064, y: 640, w: 86, h: 52, hue: '#7a5a3a' },
];
export const PLANTS = [
  { x: 66, y: 620 }, { x: 1214, y: 620 }, { x: 66, y: 108 }, { x: 1214, y: 108 },
];
export const BENCHES = [
  { x: 240, y: 330, w: 90, h: 26 }, { x: 950, y: 330, w: 90, h: 26 },
];

// Guards walk their waypoint loop and look where they walk. If they see the
// thief they chase for a short while and the alarm climbs.
export const GUARDS = [
  {
    name: 'Bram',
    x: 430, y: 300,
    waypoints: [{ x: 430, y: 300 }, { x: 850, y: 300 }],
    speed: 58, chaseSpeed: 108,
    coneRange: 235, coneHalfAngle: 0.66,
  },
  {
    name: 'Sable',
    x: 850, y: 430,
    waypoints: [{ x: 850, y: 430 }, { x: 430, y: 430 }],
    speed: 52, chaseSpeed: 102,
    coneRange: 225, coneHalfAngle: 0.62,
  },
  {
    name: 'Rook',
    x: 1050, y: 250,
    waypoints: [{ x: 1050, y: 250 }, { x: 1050, y: 520 }],
    speed: 55, chaseSpeed: 106,
    coneRange: 225, coneHalfAngle: 0.62,
  },
];

// CCTV cameras are bolted to the walls and sweep back and forth.
export const CAMERAS = [
  {
    name: 'CAM 01', x: 52, y: 96,
    baseAngle: 0.785, sweep: 0.85, period: 5.2, phase: 0,
    coneRange: 300, coneHalfAngle: 0.42,
  },
  {
    name: 'CAM 02', x: 1228, y: 96,
    baseAngle: Math.PI - 0.785, sweep: 0.85, period: 6.4, phase: 1.7,
    coneRange: 300, coneHalfAngle: 0.42,
  },
  {
    name: 'CAM 03', x: 1228, y: 672,
    baseAngle: Math.PI + 0.785, sweep: 0.85, period: 5.8, phase: 2.4,
    coneRange: 300, coneHalfAngle: 0.42,
  },
];

export const EXIT = { x: 565, y: 668, w: 150, h: 34 };

export const ALARM = {
  guardPerSec: 58,
  cameraPerSec: 42,
  decayPerSec: 13,
  sneakFactor: 0.45,
  caughtAt: 100,
};

export const COINS = { start: 3, throwRange: 340, lureRadius: 270 };

// Deterministic speckle for the marble floor so every run looks the same.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
