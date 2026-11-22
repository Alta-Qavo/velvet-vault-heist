// Velvet Vault — Midnight Heist. Entry point: wires the world, the input,
// the sound and the renderer into one requestAnimationFrame loop, and
// stages screenshot poses from `?shot=` when the maker asks for one.

import { makeWorld, resetWorld, updateWorld, throwCoin, tryGrab, flashMessage } from './world.js';
import { render } from './render.js';
import { makeInput, attachInput } from './input.js';
import { applyShot } from './shots.js';
import * as sfx from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const world = makeWorld();
const input = makeInput();
let best = 0;
try { best = Number(localStorage.getItem('velvet-vault-best') || 0); } catch (e) { /* private mode */ }

world.onStep = (sneak) => sfx.sfxStep(sneak);
world.onPickup = (loot) => {
  sfx.sfxPickup();
  flashMessage(world, `${loot.name} lifted — $${loot.value.toLocaleString()}`);
};
world.onExitOpen = () => {
  sfx.sfxExitOpen();
  flashMessage(world, 'All six treasures lifted — the exit is open. RUN!');
};
world.onSpotted = () => sfx.sfxSpotted();
world.onCaught = () => sfx.sfxCaught();
world.onWin = () => {
  sfx.sfxWin();
  if (world.score > best) {
    best = world.score;
    try { localStorage.setItem('velvet-vault-best', String(best)); } catch (e) { /* private mode */ }
  }
};

function startGame() {
  resetWorld(world);
  sfx.sfxClick();
}

input.onKey = (kind) => {
  if (kind === 'start' && world.state === 'menu') startGame();
  else if (kind === 'restart' && (world.state === 'caught' || world.state === 'win' || world.state === 'playing')) startGame();
  else if (kind === 'pause') {
    if (world.state === 'playing') { world.state = 'paused'; sfx.sfxClick(); }
    else if (world.state === 'paused') { world.state = 'playing'; sfx.sfxClick(); }
  } else if (kind === 'mute') {
    const m = sfx.toggleMute();
    flashMessage(world, m ? 'Sound off' : 'Sound on');
  } else if (kind === 'grab' && world.state === 'playing') {
    const loot = tryGrab(world);
    if (loot) { sfx.sfxPickup(); flashMessage(world, `${loot.name} lifted — $${loot.value.toLocaleString()}`); }
  }
};

input.onThrow = (x, y) => {
  if (world.state !== 'playing') return;
  if (throwCoin(world, x, y)) {
    sfx.sfxCoin();
    flashMessage(world, 'Coin tossed — a guard goes to look.');
  } else if (world.coinsLeft <= 0) {
    flashMessage(world, 'No coins left. Move quietly.');
  }
};

attachInput(canvas, input, () => world.state);

// Stage a screenshot pose when the URL asks for one, e.g. ?shot=play.
// The play pose is frozen: the alarm and the chasing guard are staged
// mid-drama, and the simulation would catch the thief before the shutter.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
applyShot(world, shot);
const frozenPose = shot === 'play';

// Small test hook for the maker's own play-tests: read the state, move the
// thief, set the alarm. The game never calls it on its own.
window.__velvet = {
  world,
  state: () => world.state,
  alarm: () => world.alarm,
  loot: () => world.lootTaken.size,
  teleport: (x, y) => { world.thief.x = x; world.thief.y = y; },
  setAlarm: (v) => { world.alarm = v; },
};

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (world.state === 'playing' && !frozenPose) updateWorld(world, input, dt);
  sfx.updateAlarmLoop(world.state === 'playing' ? world.alarm : 0);
  render(ctx, world, input.mouse);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
