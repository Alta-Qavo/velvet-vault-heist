// Velvet Vault — all sound is synthesized with WebAudio. No audio files,
// no licensed samples: every beep, chime and sting is an oscillator.

let ctx = null;
let muted = false;
let alarmNodes = null;

export function isMuted() { return muted; }
export function toggleMute() {
  muted = !muted;
  if (alarmNodes) stopAlarmLoop();
  return muted;
}

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type = 'sine', vol = 0.12, when = 0, slideTo = null) {
  const ac = ensureCtx();
  if (!ac || muted) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function sfxClick() { tone(660, 0.07, 'triangle', 0.08); }
export function sfxCoin() { tone(1320, 0.09, 'sine', 0.1); tone(1760, 0.12, 'sine', 0.08, 0.07); }
export function sfxPickup() {
  tone(523, 0.1, 'triangle', 0.12);
  tone(659, 0.1, 'triangle', 0.12, 0.08);
  tone(784, 0.16, 'triangle', 0.13, 0.16);
  tone(1047, 0.22, 'sine', 0.09, 0.24);
}
export function sfxSpotted() { tone(220, 0.22, 'sawtooth', 0.1, 0, 440); }
export function sfxCaught() {
  tone(392, 0.25, 'sawtooth', 0.12);
  tone(311, 0.25, 'sawtooth', 0.12, 0.2);
  tone(233, 0.5, 'sawtooth', 0.13, 0.4);
}
export function sfxWin() {
  [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.28, 'triangle', 0.11, i * 0.11));
}
export function sfxExitOpen() { tone(880, 0.12, 'sine', 0.1); tone(1175, 0.2, 'sine', 0.1, 0.1); }
export function sfxStep(sneak) { tone(sneak ? 140 : 190, 0.05, 'sine', sneak ? 0.02 : 0.035); }

// A soft two-tone alarm loop while the meter is high. Started and stopped
// by the game loop so it never drones on the menu screen.
export function updateAlarmLoop(level) {
  const ac = ensureCtx();
  if (!ac) return;
  if (muted || level < 45) { stopAlarmLoop(); return; }
  if (alarmNodes) return;
  const osc = ac.createOscillator();
  const lfo = ac.createOscillator();
  const lfoGain = ac.createGain();
  const gain = ac.createGain();
  osc.type = 'square';
  osc.frequency.value = 620;
  lfo.type = 'sine';
  lfo.frequency.value = 1.6;
  lfoGain.gain.value = 180;
  gain.gain.value = 0.018;
  lfo.connect(lfoGain).connect(osc.frequency);
  osc.connect(gain).connect(ac.destination);
  osc.start(); lfo.start();
  alarmNodes = { osc, lfo, gain };
}

function stopAlarmLoop() {
  if (!alarmNodes) return;
  try { alarmNodes.osc.stop(); alarmNodes.lfo.stop(); } catch (e) { /* already stopped */ }
  alarmNodes = null;
}
