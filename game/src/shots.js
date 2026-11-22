// Velvet Vault — screenshot staging. `?shot=start|play|caught|win` puts the
// game in a fixed, lively pose so a screenshot is a real render of the
// running game, not a mockup. Played normally the game never reads this.

import { LOOT } from './config.js';

function setGuard(w, i, x, y, angle, mode = 'patrol') {
  const g = w.guards[i];
  g.x = x; g.y = y; g.angle = angle; g.mode = mode;
  g.chaseT = 0; g.target = null;
}

export function applyShot(w, shot) {
  if (!shot) return;
  if (shot === 'start') {
    w.state = 'menu';
    return;
  }
  if (shot === 'play') {
    w.state = 'playing';
    // Thief frozen mid-room as Bram's cone sweeps onto him: alarm high,
    // a coin still ringing on the floor, two treasures already lifted.
    w.thief.x = 700; w.thief.y = 480; w.thief.dir = -Math.PI / 2;
    w.lootTaken.add('idol'); w.lootTaken.add('mask');
    w.score = 4300;
    w.alarm = 68;
    w.time = 63;
    w.coin = { x: 780, y: 410, t: 1.2 };
    w.coinsLeft = 2;
    setGuard(w, 0, 560, 340, 0.9, 'chase');
    w.guards[0].target = { x: 700, y: 480 };
    w.guards[0].seen = true;
    w.guards[0].alertT = 0.6;
    w.guards[0].chaseT = 2.6;
    setGuard(w, 1, 880, 430, Math.PI);
    setGuard(w, 2, 1050, 300, Math.PI / 2);
    w.cameras[0].angle = 0.9;
    w.cameras[1].angle = Math.PI - 0.9;
    w.cameras[2].angle = Math.PI + 0.6;
    return;
  }
  if (shot === 'caught') {
    w.state = 'playing';
    w.thief.x = 640; w.thief.y = 380; w.thief.dir = Math.PI / 2;
    w.lootTaken.add('idol'); w.lootTaken.add('mask'); w.lootTaken.add('orb');
    w.score = 5900;
    w.alarm = 100;
    w.time = 96;
    setGuard(w, 0, 640, 330, Math.PI / 2, 'chase');
    w.guards[0].target = { x: 640, y: 380 };
    w.guards[0].seen = true;
    setGuard(w, 1, 850, 430, Math.PI);
    setGuard(w, 2, 1000, 380, Math.PI);
    w.cameras[0].angle = 1.2;
    w.state = 'caught';
    w.caughtReason = 'Bram grabbed you in the dark.';
    return;
  }
  if (shot === 'win') {
    w.state = 'playing';
    for (const l of LOOT) w.lootTaken.add(l.id);
    w.score = 14900 + 2600;
    w.alarm = 12;
    w.time = 148;
    w.thief.x = 640; w.thief.y = 668; w.thief.dir = Math.PI / 2;
    setGuard(w, 0, 430, 300, 0.3);
    setGuard(w, 1, 850, 430, Math.PI - 0.3);
    setGuard(w, 2, 1050, 300, Math.PI / 2);
    w.cameras[0].angle = 0.6;
    w.cameras[1].angle = Math.PI - 0.6;
    w.cameras[2].angle = Math.PI + 0.9;
    w.state = 'win';
  }
}
