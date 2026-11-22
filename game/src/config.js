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

// The four loot vitrines. Grab all four and the exit opens.
export const LOOT = [
  { id: 'idol', name: 'Golden Idol', value: 2500, x: 300, y: 168, color: '#f5c542' },
  { id: 'mask', name: 'Jade Mask', value: 1800, x: 980, y: 168, color: '#3fd68c' },
  { id: 'tiara', name: 'Ruby Tiara', value: 2200, x: 300, y: 566, color: '#ff5d73' },
  { id: 'crown', name: 'Sapphire Crown', value: 3000, x: 980, y: 566, color: '#5da8ff' },
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
];

export const EXIT = { x: 596, y: 668, w: 88, h: 34 };

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
