// Velvet Vault — keyboard and mouse. WASD / arrows move, Shift sneaks,
// a click tosses a coin, E grabs loot, R restarts, P pauses, M mutes.
// Clicks on the menu and end screens hit their buttons.

import { BTN_START, BTN_AGAIN } from './render.js';

export function makeInput() {
  return {
    up: false, down: false, left: false, right: false, sneak: false,
    mouse: { x: -1, y: -1 },
    onKey: null, // (kind) => void, kinds: start, restart, pause, mute, grab
    onThrow: null, // (x, y) => void
  };
}

function inRect(m, b) {
  return m.x >= b.x && m.x <= b.x + b.w && m.y >= b.y && m.y <= b.y + b.h;
}

export function attachInput(canvas, input, getState) {
  const keyMap = {
    KeyW: 'up', ArrowUp: 'up',
    KeyS: 'down', ArrowDown: 'down',
    KeyA: 'left', ArrowLeft: 'left',
    KeyD: 'right', ArrowRight: 'right',
    ShiftLeft: 'sneak', ShiftRight: 'sneak',
  };

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    const dir = keyMap[e.code];
    if (dir) { input[dir] = true; return; }
    if (e.repeat) return;
    const state = getState();
    if (e.code === 'Enter' || e.code === 'Space') {
      if (state === 'menu' && input.onKey) input.onKey('start');
      else if ((state === 'caught' || state === 'win') && input.onKey) input.onKey('restart');
    } else if (e.code === 'KeyR' && input.onKey) {
      input.onKey('restart');
    } else if (e.code === 'KeyP' && input.onKey) {
      input.onKey('pause');
    } else if (e.code === 'KeyM' && input.onKey) {
      input.onKey('mute');
    } else if (e.code === 'KeyE' && input.onKey) {
      input.onKey('grab');
    }
  });

  window.addEventListener('keyup', (e) => {
    const dir = keyMap[e.code];
    if (dir) input[dir] = false;
  });

  function canvasPos(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    };
  }

  canvas.addEventListener('mousemove', (e) => {
    input.mouse = canvasPos(e);
  });

  canvas.addEventListener('click', (e) => {
    const p = canvasPos(e);
    input.mouse = p;
    const state = getState();
    if (state === 'menu') {
      if (inRect(p, BTN_START) && input.onKey) input.onKey('start');
    } else if (state === 'caught' || state === 'win') {
      if (inRect(p, BTN_AGAIN) && input.onKey) input.onKey('restart');
    } else if (state === 'paused') {
      if (input.onKey) input.onKey('pause');
    } else if (state === 'playing') {
      if (input.onThrow) input.onThrow(p.x, p.y);
    }
  });

  // Losing focus must not leave a key stuck down.
  window.addEventListener('blur', () => {
    input.up = input.down = input.left = input.right = input.sneak = false;
  });
}
