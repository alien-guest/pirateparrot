/**
 * sfx.ts — Web Audio synthesized sound effects (no audio files needed).
 * The AudioContext is created lazily on the first user-gesture sound so
 * autoplay policy never blocks us; every entry point honours the mute setting.
 */

import { loadSettings } from "./settings";

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", gain = 0.14, delay = 0): void {
  if (loadSettings().muted) return;
  const c = ac();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const g = c.createGain();
    const t0 = c.currentTime + delay;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch {
    /* ignore */
  }
}

function noise(dur: number, gain = 0.12, delay = 0): void {
  if (loadSettings().muted) return;
  const c = ac();
  if (!c) return;
  try {
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.setValueAtTime(gain, c.currentTime + delay);
    src.connect(g).connect(c.destination);
    src.start(c.currentTime + delay);
  } catch {
    /* ignore */
  }
}

export const sfx = {
  click(): void {
    tone(660, 0.07, "triangle", 0.1);
  },
  good(): void {
    tone(523, 0.12, "sine", 0.14, 0);
    tone(659, 0.12, "sine", 0.14, 0.11);
    tone(784, 0.22, "sine", 0.16, 0.22);
  },
  bad(): void {
    tone(233, 0.18, "sawtooth", 0.05, 0);
    tone(196, 0.22, "sawtooth", 0.05, 0.12);
  },
  snip(): void {
    tone(1400, 0.04, "square", 0.06, 0);
    noise(0.06, 0.08, 0.01);
  },
  splash(): void {
    noise(0.45, 0.16, 0);
    tone(300, 0.2, "sine", 0.06, 0.05);
    tone(200, 0.3, "sine", 0.05, 0.18);
  },
  win(): void {
    const seq = [523, 587, 659, 784, 1047];
    seq.forEach((f, i) => tone(f, 0.18, "triangle", 0.13, i * 0.13));
  },
};
