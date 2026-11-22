// Velvet Vault — every pixel the judge sees. Canvas 2D, drawn fresh each
// frame: marble floor, gold trim, red carpet, glowing vitrines, vision
// cones, the thief, the guards, the cameras and the HUD with its alarm meter.

import { VIEW, HUD_H, ROOM, BLOCKERS, LOOT, EXIT, GUARDS, mulberry32 } from './config.js';
import { lootTotal, exitOpen } from './world.js';

export const BTN_START = { x: 490, y: 470, w: 300, h: 62 };
export const BTN_AGAIN = { x: 490, y: 486, w: 300, h: 62 };

const speckles = (() => {
  const rnd = mulberry32(20261122);
  const pts = [];
  for (let i = 0; i < 420; i++) {
    pts.push({ x: ROOM.x + rnd() * ROOM.w, y: ROOM.y + rnd() * ROOM.h, r: rnd() * 1.6 + 0.4, a: 0.05 + rnd() * 0.12 });
  }
  return pts;
})();

function cone(ctx, x, y, angle, range, half, color, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - half, angle + half);
  ctx.closePath();
  const g = ctx.createRadialGradient(x, y, 8, x, y, range);
  g.addColorStop(0, color.replace('A', String(alpha)));
  g.addColorStop(1, color.replace('A', '0'));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFloor(ctx) {
  ctx.fillStyle = '#141428';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  // Marble tiles.
  for (let ty = 0; ty < 9; ty++) {
    for (let tx = 0; tx < 19; tx++) {
      const x = ROOM.x + tx * 65.5, y = ROOM.y + ty * 70.7;
      ctx.fillStyle = (tx + ty) % 2 === 0 ? '#1b1b33' : '#191930';
      ctx.fillRect(x + 1, y + 1, 63.5, 68.7);
    }
  }
  for (const s of speckles) {
    ctx.fillStyle = `rgba(212,175,105,${s.a})`;
    ctx.fillRect(s.x, s.y, s.r, s.r);
  }
  // Red carpet: a runner down the middle and one across.
  ctx.fillStyle = '#5e1220';
  ctx.fillRect(600, ROOM.y, 80, ROOM.h);
  ctx.fillRect(ROOM.x, 348, ROOM.w, 46);
  ctx.fillStyle = '#7a1a2c';
  ctx.fillRect(608, ROOM.y, 64, ROOM.h);
  ctx.fillRect(ROOM.x, 356, ROOM.w, 30);
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 2;
  ctx.strokeRect(608, ROOM.y, 64, ROOM.h);
  // Gold-trimmed walls.
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 5;
  ctx.strokeRect(ROOM.x - 6, ROOM.y - 6, ROOM.w + 12, ROOM.h + 12);
  ctx.strokeStyle = 'rgba(201,162,39,0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(ROOM.x - 12, ROOM.y - 12, ROOM.w + 24, ROOM.h + 24);
}

function drawLootShape(ctx, loot, t) {
  const { x, y, color } = loot;
  const pulse = 1 + Math.sin(t * 3 + x) * 0.06;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pulse, pulse);
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = color;
  ctx.strokeStyle = '#fff8dc';
  ctx.lineWidth = 1.5;
  if (loot.id === 'idol') {
    ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(10, 6); ctx.lineTo(5, 14); ctx.lineTo(-5, 14); ctx.lineTo(-10, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -20, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (loot.id === 'mask') {
    ctx.beginPath(); ctx.ellipse(0, 0, 13, 16, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0c2b1a';
    ctx.beginPath(); ctx.ellipse(-5, -3, 3, 2, 0, 0, Math.PI * 2); ctx.ellipse(5, -3, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
  } else if (loot.id === 'tiara') {
    ctx.beginPath(); ctx.moveTo(-14, 10); ctx.lineTo(-10, -10); ctx.lineTo(-4, 2); ctx.lineTo(0, -14); ctx.lineTo(4, 2); ctx.lineTo(10, -10); ctx.lineTo(14, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(-14, 10); ctx.lineTo(-14, -8); ctx.lineTo(-7, 0); ctx.lineTo(0, -14); ctx.lineTo(7, 0); ctx.lineTo(14, -8); ctx.lineTo(14, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, -14, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawVitrine(ctx, loot, taken, t) {
  const { x, y } = loot;
  // Gold plinth.
  ctx.fillStyle = '#3a2f14';
  ctx.fillRect(x - 30, y + 16, 60, 14);
  ctx.fillStyle = '#c9a227';
  ctx.fillRect(x - 30, y + 16, 60, 3);
  if (!taken) {
    // Glass case.
    ctx.fillStyle = 'rgba(160,200,255,0.10)';
    ctx.strokeStyle = 'rgba(220,235,255,0.55)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, x - 26, y - 30, 52, 48, 4);
    ctx.fill(); ctx.stroke();
    drawLootShape(ctx, loot, t);
    ctx.fillStyle = '#ffe9a8';
    ctx.font = '11px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(loot.name.toUpperCase(), x, y + 46);
  } else {
    // Emptied: cracked glass, nothing inside.
    ctx.strokeStyle = 'rgba(220,235,255,0.35)';
    ctx.lineWidth = 1;
    roundRect(ctx, x - 26, y - 30, 52, 48, 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 20, y - 24); ctx.lineTo(x - 4, y - 6); ctx.lineTo(x + 8, y - 20);
    ctx.moveTo(x - 4, y - 6); ctx.lineTo(x + 2, y + 12);
    ctx.stroke();
    ctx.fillStyle = '#7a7a92';
    ctx.font = '11px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('EMPTY', x, y + 46);
  }
}

function drawGuard(ctx, g, def, t) {
  // Vision cone, warm yellow.
  cone(ctx, g.x, g.y, g.angle, def.coneRange, def.coneHalfAngle, 'rgba(255,214,90,A)', g.seen ? 0.5 : 0.3);
  ctx.save();
  ctx.translate(g.x, g.y);
  ctx.rotate(g.angle);
  // Flashlight beam edge.
  ctx.strokeStyle = 'rgba(255,230,140,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(def.coneRange, -def.coneRange * Math.sin(def.coneHalfAngle)); ctx.moveTo(0, 0); ctx.lineTo(def.coneRange, def.coneRange * Math.sin(def.coneHalfAngle)); ctx.stroke();
  ctx.restore();
  // Body: navy uniform, cap, belt.
  ctx.fillStyle = g.seen ? '#8c1f28' : '#2b3a67';
  ctx.beginPath(); ctx.arc(g.x, g.y, 15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1d2745';
  ctx.beginPath(); ctx.arc(g.x, g.y - 3, 10, Math.PI, 0); ctx.fill();
  ctx.fillRect(g.x - 10, g.y - 6, 20, 4);
  ctx.fillStyle = '#d8c26a';
  ctx.fillRect(g.x - 7, g.y + 4, 14, 3);
  // Facing tick.
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(g.x, g.y); ctx.lineTo(g.x + Math.cos(g.angle) * 18, g.y + Math.sin(g.angle) * 18); ctx.stroke();
  if (g.seen || g.alertT > 0) {
    ctx.fillStyle = '#ff4d4d';
    ctx.font = 'bold 26px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('!', g.x, g.y - 24);
  }
  ctx.fillStyle = '#cfd6ff';
  ctx.font = '11px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(g.name.toUpperCase(), g.x, g.y + 30);
}

function drawCamera(ctx, cam) {
  cone(ctx, cam.x, cam.y, cam.angle, cam.coneRange, cam.coneHalfAngle, 'rgba(255,80,80,A)', cam.seen ? 0.5 : 0.3);
  // Wall mount + dome.
  ctx.fillStyle = '#3c3c55';
  ctx.fillRect(cam.x - 16, cam.y - 8, 32, 10);
  ctx.fillStyle = '#e8e8f2';
  ctx.beginPath(); ctx.arc(cam.x, cam.y + 6, 9, 0, Math.PI * 2); ctx.fill();
  const blink = Math.sin(cam.angle * 4) > 0;
  ctx.fillStyle = cam.seen ? '#ff2222' : (blink ? '#ff5555' : '#a02020');
  ctx.beginPath(); ctx.arc(cam.x, cam.y + 6, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffb3b3';
  ctx.font = '10px Georgia';
  ctx.textAlign = cam.x < 640 ? 'left' : 'right';
  ctx.fillText(cam.name, cam.x + (cam.x < 640 ? 22 : -22), cam.y + 4);
}

function drawThief(ctx, w, t) {
  const th = w.thief;
  // Soft shadow-light pool so the eye finds the thief at once.
  const g = ctx.createRadialGradient(th.x, th.y, 4, th.x, th.y, 90);
  g.addColorStop(0, 'rgba(190,160,255,0.20)');
  g.addColorStop(1, 'rgba(190,160,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(th.x, th.y, 90, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.translate(th.x, th.y);
  if (th.sneaking) ctx.scale(1, 0.82);
  // Hooded cloak.
  ctx.fillStyle = '#241a33';
  ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3a2a55';
  ctx.beginPath(); ctx.arc(0, -2, 10, 0, Math.PI * 2); ctx.fill();
  // Purple scarf.
  ctx.strokeStyle = '#b06fd6';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(0, 1, 9, 0.3, Math.PI - 0.3); ctx.stroke();
  // Masked eyes.
  ctx.fillStyle = '#ffe9a8';
  const ex = Math.cos(th.dir) * 4, ey = Math.sin(th.dir) * 4;
  ctx.beginPath(); ctx.arc(-3 + ex, -3 + ey, 1.8, 0, Math.PI * 2); ctx.arc(3 + ex, -3 + ey, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#e8d9ff';
  ctx.font = '11px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('YOU', th.x, th.y + 30);
  if (th.sneaking) {
    ctx.fillStyle = '#b06fd6';
    ctx.font = '11px Georgia';
    ctx.fillText('sneaking…', th.x, th.y + 44);
  }
}

function drawExit(ctx, w, t) {
  const open = exitOpen(w);
  const pulse = open ? 0.55 + Math.sin(t * 4) * 0.3 : 0.18;
  ctx.fillStyle = open ? `rgba(80,255,140,${pulse})` : 'rgba(120,120,140,0.25)';
  ctx.fillRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.strokeStyle = open ? '#50ff8c' : '#8888a0';
  ctx.lineWidth = 3;
  ctx.strokeRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.fillStyle = open ? '#d8ffe2' : '#b9b9cc';
  ctx.font = 'bold 15px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(open ? 'EXIT — GO!' : 'EXIT · LOCKED', EXIT.x + EXIT.w / 2, EXIT.y + 22);
}

function drawHud(ctx, w) {
  ctx.fillStyle = '#0d0d1e';
  ctx.fillRect(0, 0, VIEW.w, HUD_H);
  ctx.fillStyle = '#c9a227';
  ctx.fillRect(0, HUD_H - 2, VIEW.w, 2);
  ctx.fillStyle = '#f5d76e';
  ctx.font = 'bold 22px Georgia';
  ctx.textAlign = 'left';
  ctx.fillText('VELVET VAULT', 20, 36);
  ctx.fillStyle = '#8a8aa8';
  ctx.font = '13px Georgia';
  ctx.fillText('midnight heist', 212, 36);

  // Loot tally.
  ctx.fillStyle = '#e8e8f2';
  ctx.font = '15px Georgia';
  ctx.textAlign = 'left';
  const taken = w.lootTaken.size;
  ctx.fillText(`LOOT  ${taken} / ${LOOT.length}`, 400, 36);
  for (let i = 0; i < LOOT.length; i++) {
    ctx.fillStyle = w.lootTaken.has(LOOT[i].id) ? LOOT[i].color : '#33334d';
    ctx.beginPath(); ctx.arc(500 + i * 22, 30, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 1; ctx.stroke();
  }
  ctx.fillStyle = '#e8e8f2';
  ctx.fillText(`$${lootTotal(w).toLocaleString()}`, 600, 36);
  ctx.fillStyle = '#8a8aa8';
  ctx.font = '13px Georgia';
  ctx.fillText(`coins ${w.coinsLeft} · ${Math.floor(w.time / 60)}:${String(Math.floor(w.time % 60)).padStart(2, '0')}`, 700, 36);

  // Alarm meter.
  const ax = 950, ay = 16, aw = 250, ah = 26;
  const lvl = w.alarm / 100;
  const col = lvl < 0.4 ? '#3fd68c' : lvl < 0.7 ? '#f5c542' : '#ff4d4d';
  ctx.fillStyle = '#1c1c30';
  roundRect(ctx, ax, ay, aw, ah, 5); ctx.fill();
  ctx.fillStyle = col;
  if (aw * lvl > 10) { roundRect(ctx, ax + 2, ay + 2, (aw - 4) * lvl, ah - 4, 4); ctx.fill(); }
  ctx.strokeStyle = lvl >= 0.7 && Math.sin(w.time * 10) > 0 ? '#ff8080' : '#c9a227';
  ctx.lineWidth = 2;
  roundRect(ctx, ax, ay, aw, ah, 5); ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(`ALARM ${Math.round(w.alarm)}%`, ax + aw / 2, ay + 18);
}

function drawButton(ctx, btn, label, hot) {
  ctx.fillStyle = hot ? '#e8c84a' : '#c9a227';
  roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 8); ctx.fill();
  ctx.fillStyle = '#1a1405';
  ctx.font = 'bold 22px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(label, btn.x + btn.w / 2, btn.y + 40);
}

function drawVeil(ctx) {
  ctx.fillStyle = 'rgba(6,6,16,0.78)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
}

export function render(ctx, w, mouse) {
  const t = w.time;
  drawFloor(ctx);
  drawExit(ctx, w, t);
  for (const b of BLOCKERS) {
    ctx.fillStyle = b.kind === 'pillar' ? '#2e2e4a' : '#33291a';
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
    if (b.kind === 'pillar') {
      ctx.fillStyle = '#c9a227';
      ctx.fillRect(b.x + 6, b.y + 6, b.w - 12, 3);
      ctx.fillRect(b.x + 6, b.y + b.h - 9, b.w - 12, 3);
    } else {
      ctx.fillStyle = '#5a4a2a';
      ctx.font = '11px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('DISPLAY', b.x + b.w / 2, b.y + b.h / 2 + 4);
    }
  }
  for (const l of LOOT) drawVitrine(ctx, l, w.lootTaken.has(l.id), t);
  for (const cam of w.cameras) drawCamera(ctx, cam);
  for (let i = 0; i < w.guards.length; i++) drawGuard(ctx, w.guards[i], GUARDS[i], t);
  if (w.coin) {
    const c = w.coin;
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath(); ctx.arc(c.x, c.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,217,77,0.7)';
    ctx.beginPath(); ctx.arc(c.x, c.y, 10 + Math.sin(c.t * 6) * 4, 0, Math.PI * 2); ctx.stroke();
  }
  drawThief(ctx, w, t);

  // Vignette: night closes in at the edges.
  const vg = ctx.createRadialGradient(640, 360, 300, 640, 360, 760);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);

  drawHud(ctx, w);

  if (w.messageT > 0) {
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 18px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(w.message, 640, 96);
  }

  if (w.state === 'menu') {
    drawVeil(ctx);
    ctx.fillStyle = '#f5d76e';
    ctx.font = 'bold 64px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('VELVET VAULT', 640, 190);
    ctx.fillStyle = '#e8e8f2';
    ctx.font = 'italic 26px Georgia';
    ctx.fillText('a midnight heist', 640, 232);
    ctx.fillStyle = '#cfd6ff';
    ctx.font = '18px Georgia';
    ctx.fillText('Slip through the museum, lift all four treasures, and reach the exit', 640, 300);
    ctx.fillText('before the guards, the cameras and the alarm catch you.', 640, 328);
    ctx.fillStyle = '#8a8aa8';
    ctx.font = '16px Georgia';
    ctx.fillText('WASD / arrows — move      Shift — sneak      Click — toss a coin to lure a guard', 640, 380);
    ctx.fillText('Walk over a vitrine to grab its loot      E — grab      R — restart      M — mute', 640, 408);
    const hot = mouse.x >= BTN_START.x && mouse.x <= BTN_START.x + BTN_START.w && mouse.y >= BTN_START.y && mouse.y <= BTN_START.y + BTN_START.h;
    drawButton(ctx, BTN_START, 'START THE HEIST', hot);
    ctx.fillStyle = '#8a8aa8';
    ctx.font = '14px Georgia';
    ctx.fillText('one room · two guards · two cameras · four treasures · one way out', 640, 580);
  } else if (w.state === 'paused') {
    drawVeil(ctx);
    ctx.fillStyle = '#f5d76e';
    ctx.font = 'bold 48px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', 640, 320);
    ctx.fillStyle = '#cfd6ff';
    ctx.font = '18px Georgia';
    ctx.fillText('Press P or click to keep sneaking.', 640, 360);
  } else if (w.state === 'caught') {
    drawVeil(ctx);
    ctx.fillStyle = '#ff5d5d';
    ctx.font = 'bold 56px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('CAUGHT!', 640, 240);
    ctx.fillStyle = '#e8e8f2';
    ctx.font = '20px Georgia';
    ctx.fillText(w.caughtReason, 640, 292);
    ctx.fillStyle = '#cfd6ff';
    ctx.font = '18px Georgia';
    ctx.fillText(`Loot lifted: ${w.lootTaken.size} / ${LOOT.length}   ·   $${lootTotal(w).toLocaleString()}   ·   survived ${Math.floor(w.time)}s`, 640, 340);
    ctx.fillText('The vault keeps its treasures — this time.', 640, 372);
    const hot = mouse.x >= BTN_AGAIN.x && mouse.x <= BTN_AGAIN.x + BTN_AGAIN.w && mouse.y >= BTN_AGAIN.y && mouse.y <= BTN_AGAIN.y + BTN_AGAIN.h;
    drawButton(ctx, BTN_AGAIN, 'TRY AGAIN  (R)', hot);
  } else if (w.state === 'win') {
    drawVeil(ctx);
    ctx.fillStyle = '#50ff8c';
    ctx.font = 'bold 56px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('CLEAN GETAWAY!', 640, 240);
    ctx.fillStyle = '#ffe9a8';
    ctx.font = '22px Georgia';
    ctx.fillText('Every treasure lifted. The vault never saw you coming.', 640, 292);
    ctx.fillStyle = '#e8e8f2';
    ctx.font = '20px Georgia';
    ctx.fillText(`Haul: $${lootTotal(w).toLocaleString()}   ·   Score: ${w.score.toLocaleString()}   ·   Time: ${Math.floor(w.time / 60)}:${String(Math.floor(w.time % 60)).padStart(2, '0')}`, 640, 340);
    ctx.fillText('Press R to run it again — faster, quieter.', 640, 372);
    const hot = mouse.x >= BTN_AGAIN.x && mouse.x <= BTN_AGAIN.x + BTN_AGAIN.w && mouse.y >= BTN_AGAIN.y && mouse.y <= BTN_AGAIN.y + BTN_AGAIN.h;
    drawButton(ctx, BTN_AGAIN, 'HEIST AGAIN  (R)', hot);
  }
}
