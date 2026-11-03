/**
 * tts.ts — Russian speech synthesis for dialogue and task instructions.
 * Parrot speaks high-pitched, the pirate low-pitched. Everything is guarded:
 * headless browsers / missing voices must never throw.
 */

import { loadSettings } from "./settings";

export type Speaker = "pirate" | "parrot" | "shark";

export function speak(text: string, speaker: Speaker = "parrot"): void {
  try {
    if (loadSettings().muted) return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ru-RU";
    const voices = synth.getVoices();
    const ru = voices.find((v) => v.lang.toLowerCase().startsWith("ru"));
    if (ru) u.voice = ru;
    if (speaker === "parrot") {
      u.pitch = 1.7;
      u.rate = 1.05;
    } else if (speaker === "shark") {
      u.pitch = 1.3;
      u.rate = 1.0;
    } else {
      u.pitch = 0.8;
      u.rate = 0.95;
    }
    synth.speak(u);
  } catch {
    /* no speech available — text on screen still carries the story */
  }
}

export function stopSpeak(): void {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
}
