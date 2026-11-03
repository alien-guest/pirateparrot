/**
 * settings.ts — defensive localStorage persistence for game settings and progress.
 * Every call is wrapped: blocked storage degrades to defaults instead of throwing.
 */

const KEY = "pirate-parrot-quest-v1";

export interface Settings {
  muted: boolean;
  completed: boolean;
}

const DEFAULTS: Settings = { muted: false, completed: false };

export function loadSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      muted: typeof parsed.muted === "boolean" ? parsed.muted : DEFAULTS.muted,
      completed: typeof parsed.completed === "boolean" ? parsed.completed : DEFAULTS.completed,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(patch: Partial<Settings>): Settings {
  const next = { ...loadSettings(), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked — settings just won't persist */
  }
  return next;
}
