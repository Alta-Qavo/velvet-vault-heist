// Velvet Vault — the simulation: movement, collision, line of sight,
// guard patrols and chases, sweeping cameras, the alarm meter, coins,
// loot and the win / caught conditions. No drawing lives here.

import { ROOM, BLOCKERS, LOOT, GUARDS, CAMERAS, EXIT, PLAYER, ALARM, COINS } from './config.js';

export function makeWorld() {
  return {
    time: 0,
    state: 'menu', // menu | playing | paused | caught | win
    caughtReason: '',
    alarm: 0,
    lootTaken: new Set(),
    coinsLeft: COINS.start,
    coin: null, // {x, y, t} a coin still ringing on the floor
    thief: { x: PLAYER.start.x, y: PLAYER.start.y, dir: -Math.PI / 2, sneaking: false, moving: false },
    guards: GUARDS.map((g) => ({
      name: g.name, x: g.x, y: g.y, angle: 0,
      wp: 0, mode: 'patrol', // patrol | chase | investigate
      chaseT: 0, invT: 0, target: null, seen: false, alertT: 0,
    })),
    cameras: CAMERAS.map((c) => ({ ...c, angle: c.baseAngle, seen: false })),
    score: 0,
    message: '',
    messageT: 0,
  };
}

export function resetWorld(w) {
  const fresh = makeWorld();
  Object.assign(w, fresh);
  w.state = 'playing';
}

function clampRoom(p, r) {
  p.x = Math.max(ROOM.x + r, Math.min(ROOM.x + ROOM.w - r, p.x));
  p.y = Math.max(ROOM.y + r, Math.min(ROOM.y + ROOM.h - r, p.y));
}

function circleHitsBlocker(x, y, r) {
  for (const b of BLOCKERS) {
    const cx = Math.max(b.x, Math.min(x, b.x + b.w));
    const cy = Math.max(b.y, Math.min(y, b.y + b.h));
    if ((x - cx) * (x - cx) + (y - cy) * (y - cy) < r * r) return b;
  }
  return null;
}

function moveWithCollision(p, dx, dy, r) {
  const nx = p.x + dx;
  if (!circleHitsBlocker(nx, p.y, r)) p.x = nx;
  const ny = p.y + dy;
  if (!circleHitsBlocker(p.x, ny, r)) p.y = ny;
  clampRoom(p, r);
}

// Liang-Barsky segment clip: true when the segment crosses the rect.
function segmentHitsRect(x1, y1, x2, y2, b) {
  let t0 = 0, t1 = 1;
  const dx = x2 - x1, dy = y2 - y1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - b.x, b.x + b.w - x1, y1 - b.y, b.y + b.h - y1];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) { if (q[i] < 0) return false; }
    else {
      const t = q[i] / p[i];
      if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
      else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
  }
  return true;
}

export function hasLineOfSight(x1, y1, x2, y2) {
  for (const b of BLOCKERS) {
    if (segmentHitsRect(x1, y1, x2, y2, b)) return false;
  }
  return true;
}

function angleTo(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); }

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// True when the watcher can see the thief: in range, inside the cone,
// and no pillar or table in between.
export function canSee(watcher, range, halfAngle, tx, ty) {
  const dx = tx - watcher.x, dy = ty - watcher.y;
  const d = Math.hypot(dx, dy);
  if (d > range) return false;
  if (Math.abs(angleDiff(Math.atan2(dy, dx), watcher.angle)) > halfAngle) return false;
  return hasLineOfSight(watcher.x, watcher.y, tx, ty);
}

function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }

export function lootTotal(w) {
  return LOOT.filter((l) => w.lootTaken.has(l.id)).reduce((s, l) => s + l.value, 0);
}

export function exitOpen(w) { return w.lootTaken.size === LOOT.length; }

export function throwCoin(w, x, y) {
  if (w.state !== 'playing' || w.coinsLeft <= 0) return false;
  const t = w.thief;
  const d = dist(t.x, t.y, x, y);
  const max = COINS.throwRange;
  const tx = d > max ? t.x + ((x - t.x) / d) * max : x;
  const ty = d > max ? t.y + ((y - t.y) / d) * max : y;
  w.coinsLeft -= 1;
  w.coin = { x: tx, y: ty, t: 0 };
  for (const g of w.guards) {
    if (dist(g.x, g.y, tx, ty) < COINS.lureRadius && g.mode !== 'chase') {
      g.mode = 'investigate';
      g.target = { x: tx, y: ty };
      g.invT = 0;
    }
  }
  return true;
}

export function tryGrab(w) {
  if (w.state !== 'playing') return false;
  for (const l of LOOT) {
    if (!w.lootTaken.has(l.id) && dist(w.thief.x, w.thief.y, l.x, l.y) < 46) {
      w.lootTaken.add(l.id);
      w.score += l.value;
      return l;
    }
  }
  return false;
}

function updateGuard(w, g, def, dt) {
  const t = w.thief;
  g.seen = false;
  const seenNow = w.state === 'playing' && canSee(g, def.coneRange, def.coneHalfAngle, t.x, t.y);
  if (seenNow) {
    g.seen = true;
    g.alertT = 0.6;
    g.mode = 'chase';
    g.chaseT = 2.6;
    g.target = { x: t.x, y: t.y };
    const gain = ALARM.guardPerSec * (t.sneaking ? ALARM.sneakFactor : 1);
    w.alarm = Math.min(ALARM.caughtAt, w.alarm + gain * dt);
  } else if (g.alertT > 0) {
    g.alertT -= dt;
  }

  if (g.mode === 'chase') {
    g.chaseT -= dt;
    if (g.target) {
      const a = angleTo(g.x, g.y, g.target.x, g.target.y);
      g.angle = a;
      const step = def.chaseSpeed * dt;
      const d = dist(g.x, g.y, g.target.x, g.target.y);
      if (d > 4) moveWithCollision(g, Math.cos(a) * Math.min(step, d), Math.sin(a) * Math.min(step, d), 15);
      if (seenNow) { g.target = { x: t.x, y: t.y }; g.chaseT = 2.6; }
    }
    if (g.chaseT <= 0) { g.mode = 'patrol'; g.target = null; }
    if (w.state === 'playing' && dist(g.x, g.y, t.x, t.y) < 26) {
      w.state = 'caught';
      w.caughtReason = `${g.name} grabbed you in the dark.`;
    }
  } else if (g.mode === 'investigate' && g.target) {
    const a = angleTo(g.x, g.y, g.target.x, g.target.y);
    g.angle = a;
    const step = def.speed * 1.25 * dt;
    const d = dist(g.x, g.y, g.target.x, g.target.y);
    if (d > 6) moveWithCollision(g, Math.cos(a) * Math.min(step, d), Math.sin(a) * Math.min(step, d), 15);
    else {
      g.invT += dt;
      g.angle += dt * 1.4; // looks around, puzzled
      if (g.invT > 2.2) { g.mode = 'patrol'; g.target = null; g.invT = 0; }
    }
  } else {
    const wp = def.waypoints[g.wp];
    const a = angleTo(g.x, g.y, wp.x, wp.y);
    g.angle = a;
    const step = def.speed * dt;
    const d = dist(g.x, g.y, wp.x, wp.y);
    if (d < 6) g.wp = (g.wp + 1) % def.waypoints.length;
    else moveWithCollision(g, Math.cos(a) * Math.min(step, d), Math.sin(a) * Math.min(step, d), 15);
  }
}

function updateCamera(w, cam, dt) {
  cam.angle = cam.baseAngle + Math.sin((w.time + cam.phase) * (Math.PI * 2 / cam.period)) * cam.sweep;
  cam.seen = false;
  if (w.state === 'playing' && canSee(cam, cam.coneRange, cam.coneHalfAngle, w.thief.x, w.thief.y)) {
    cam.seen = true;
    const gain = ALARM.cameraPerSec * (w.thief.sneaking ? ALARM.sneakFactor : 1);
    w.alarm = Math.min(ALARM.caughtAt, w.alarm + gain * dt);
  }
}

export function updateWorld(w, input, dt) {
  if (w.state !== 'playing') return;
  w.time += dt;
  const t = w.thief;

  // Movement: WASD or arrows, Shift to sneak.
  const mx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const my = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  t.sneaking = !!input.sneak;
  t.moving = mx !== 0 || my !== 0;
  if (t.moving) {
    const len = Math.hypot(mx, my);
    const speed = t.sneaking ? PLAYER.sneakSpeed : PLAYER.walkSpeed;
    const dx = (mx / len) * speed * dt;
    const dy = (my / len) * speed * dt;
    t.dir = Math.atan2(dy, dx);
    moveWithCollision(t, dx, dy, PLAYER.radius);
    if (Math.floor(w.time * 3.2) !== Math.floor((w.time - dt) * 3.2)) {
      if (w.onStep) w.onStep(t.sneaking);
    }
  }

  // Walk over a vitrine to lift its loot.
  for (const l of LOOT) {
    if (!w.lootTaken.has(l.id) && dist(t.x, t.y, l.x, l.y) < 40) {
      w.lootTaken.add(l.id);
      w.score += l.value;
      if (w.onPickup) w.onPickup(l);
      if (exitOpen(w) && w.onExitOpen) w.onExitOpen();
    }
  }

  // Guards and cameras.
  let anySeen = false;
  w.guards.forEach((g, i) => {
    updateGuard(w, g, GUARDS[i], dt);
    if (g.seen) anySeen = true;
  });
  w.cameras.forEach((c) => { updateCamera(w, c, dt); if (c.seen) anySeen = true; });
  if (anySeen && w.onSpotted && !w._spottedFlag) { w.onSpotted(); w._spottedFlag = true; }
  if (!anySeen) w._spottedFlag = false;

  // Alarm cools down when nobody sees the thief.
  if (!anySeen) w.alarm = Math.max(0, w.alarm - ALARM.decayPerSec * dt);

  if (w.coin) {
    w.coin.t += dt;
    if (w.coin.t > 4) w.coin = null;
  }

  if (w.alarm >= ALARM.caughtAt) {
    w.state = 'caught';
    w.caughtReason = 'The alarm hit 100% — the vault sealed shut around you.';
    if (w.onCaught) w.onCaught();
    return;
  }

  // The getaway: reach the glowing exit once every vitrine is empty.
  if (exitOpen(w) && t.x > EXIT.x && t.x < EXIT.x + EXIT.w && t.y > EXIT.y - 6 && t.y < EXIT.y + EXIT.h + 10) {
    w.state = 'win';
    w.score += Math.max(0, Math.round(3000 - w.time * 8));
    if (w.onWin) w.onWin();
  }

  if (w.messageT > 0) w.messageT -= dt;
}

export function flashMessage(w, text) {
  w.message = text;
  w.messageT = 2.4;
}
