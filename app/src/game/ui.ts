/**
 * ui.ts — shared UI helpers: speech bubbles, big child-friendly buttons,
 * the mute toggle and Esc-pause support. All drawn with Phaser primitives,
 * sized for 5–6 year olds (big tap targets, huge fonts).
 */

import Phaser from "phaser";
import { sfx } from "./sfx";
import { loadSettings, saveSettings } from "./settings";
import { speak, stopSpeak, type Speaker } from "./tts";

export const GAME_W = 1280;
export const GAME_H = 720;

const FONT = "Arial, Helvetica, sans-serif";

/** Rounded white speech bubble with wrapped text. Returns the container. */
export function addBubble(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  maxW = 460,
): Phaser.GameObjects.Container {
  const pad = 22;
  const t = scene.add
    .text(0, 0, text, {
      fontFamily: FONT,
      fontSize: "30px",
      fontStyle: "bold",
      color: "#22303c",
      align: "center",
      wordWrap: { width: maxW - pad * 2 },
      lineSpacing: 6,
    })
    .setOrigin(0.5);
  const w = Math.max(t.width + pad * 2, 160);
  const h = t.height + pad * 1.8;
  const g = scene.add.graphics();
  g.fillStyle(0xffffff, 0.97);
  g.lineStyle(4, 0x22303c, 0.9);
  g.fillRoundedRect(-w / 2, -h / 2, w, h, 24);
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, 24);
  const c = scene.add.container(x, y, [g, t]);
  c.setDepth(50);
  c.setScale(0.01);
  scene.tweens.add({ targets: c, scale: 1, duration: 220, ease: "Back.easeOut" });
  return c;
}

/** Pop the bubble away. */
export function hideBubble(scene: Phaser.Scene, bubble: Phaser.GameObjects.Container, onDone?: () => void): void {
  scene.tweens.add({
    targets: bubble,
    scale: 0.01,
    alpha: 0,
    duration: 140,
    ease: "Quad.easeIn",
    onComplete: () => {
      bubble.destroy();
      onDone?.();
    },
  });
}

export interface BigButtonOpts {
  width?: number;
  height?: number;
  color?: number;
  textColor?: string;
  fontSize?: number;
  imageKey?: string;
  imageScale?: number;
}

/** Large rounded button, optionally with an image instead of a text label. */
export function bigButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  opts: BigButtonOpts = {},
): Phaser.GameObjects.Container {
  const w = opts.width ?? 300;
  const h = opts.height ?? 96;
  const color = opts.color ?? 0x2e9e5b;
  const g = scene.add.graphics();
  const draw = (c: number) => {
    g.clear();
    g.fillStyle(0x000000, 0.18);
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 6, w, h, 26);
    g.fillStyle(c, 1);
    g.lineStyle(5, 0xffffff, 0.95);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 26);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 26);
  };
  draw(color);

  let face: Phaser.GameObjects.GameObject;
  if (opts.imageKey) {
    face = scene.add.image(0, 0, opts.imageKey);
    const img = face as Phaser.GameObjects.Image;
    img.setScale(opts.imageScale ?? (Math.min(w, h) * 0.8) / img.width);
  } else {
    face = scene.add
      .text(0, 0, label, {
        fontFamily: FONT,
        fontSize: `${opts.fontSize ?? 44}px`,
        fontStyle: "bold",
        color: opts.textColor ?? "#ffffff",
      })
      .setOrigin(0.5);
  }

  const c = scene.add.container(x, y, [g, face]);
  c.setSize(w, h);
  c.setInteractive({ useHandCursor: true });
  c.on("pointerover", () => scene.tweens.add({ targets: c, scale: 1.07, duration: 110 }));
  c.on("pointerout", () => scene.tweens.add({ targets: c, scale: 1, duration: 110 }));
  c.on("pointerdown", () => {
    sfx.click();
    scene.tweens.add({ targets: c, scale: 0.94, duration: 70, yoyo: true });
    onClick();
  });
  c.setDepth(60);
  return c;
}

/** Speaker toggle in the top-right corner. */
export function addMuteButton(scene: Phaser.Scene): void {
  const draw = (g: Phaser.GameObjects.Graphics, muted: boolean) => {
    g.clear();
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(0, 0, 34);
    g.lineStyle(3, 0x22303c, 0.8);
    g.strokeCircle(0, 0, 34);
    // speaker body
    g.fillStyle(0x22303c, 1);
    g.fillTriangle(-14, -8, -14, 8, -4, 8);
    g.fillTriangle(-14, -8, -4, -8, -4, 8);
    g.fillRect(-4, -14, 12, 28);
    if (muted) {
      g.lineStyle(5, 0xd23c3c, 1);
      g.lineBetween(-20, -20, 20, 20);
    } else {
      g.lineStyle(4, 0x22303c, 1);
      g.beginPath();
      g.arc(8, 0, 12, -Math.PI / 3, Math.PI / 3);
      g.strokePath();
      g.beginPath();
      g.arc(8, 0, 20, -Math.PI / 3, Math.PI / 3);
      g.strokePath();
    }
  };
  const g = scene.add.graphics();
  let muted = loadSettings().muted;
  draw(g, muted);
  const c = scene.add.container(GAME_W - 56, 56, [g]);
  c.setSize(68, 68);
  c.setInteractive({ useHandCursor: true });
  c.setDepth(200);
  c.on("pointerdown", () => {
    muted = !muted;
    saveSettings({ muted });
    if (muted) stopSpeak();
    draw(g, muted);
    sfx.click();
  });
}

/**
 * Blocking dialogue line: bubble near the speaker + TTS; the child taps
 * anywhere (or presses Space) to continue. Calls `next` once dismissed.
 */
export function say(
  scene: Phaser.Scene,
  speaker: Speaker,
  bubbleX: number,
  bubbleY: number,
  text: string,
  next: () => void,
): void {
  const bubble = addBubble(scene, bubbleX, bubbleY, text, 520);
  const hint = scene.add
    .text(GAME_W / 2, GAME_H - 36, "нажми, чтобы продолжить ▸", {
      fontFamily: FONT,
      fontSize: "24px",
      fontStyle: "bold",
      color: "#ffffff",
      stroke: "#22303c",
      strokeThickness: 5,
    })
    .setOrigin(0.5)
    .setDepth(50);
  scene.tweens.add({ targets: hint, alpha: 0.35, duration: 600, yoyo: true, repeat: -1 });

  speak(text, speaker);

  let done = false;
  const advance = () => {
    if (done) return;
    done = true;
    stopSpeak();
    hint.destroy();
    scene.input.off("pointerdown", advance);
    scene.input.keyboard?.off("keydown-SPACE", advance);
    scene.input.keyboard?.off("keydown-ENTER", advance);
    hideBubble(scene, bubble, next);
  };
  scene.time.delayedCall(350, () => {
    scene.input.on("pointerdown", advance);
    scene.input.keyboard?.on("keydown-SPACE", advance);
    scene.input.keyboard?.on("keydown-ENTER", advance);
  });
}

/** Esc pause: launches the Pause scene over the current one. */
export function addPauseSupport(scene: Phaser.Scene): void {
  scene.input.keyboard?.on("keydown-ESC", () => {
    stopSpeak();
    scene.scene.pause();
    scene.scene.launch("Pause", { from: scene.scene.key });
  });
}

/** Cover-fit a background image to 1280x720. */
export function addCoverBackground(scene: Phaser.Scene, key: string): Phaser.GameObjects.Image {
  const img = scene.add.image(GAME_W / 2, GAME_H / 2, key);
  const scale = Math.max(GAME_W / img.width, GAME_H / img.height);
  img.setScale(scale);
  return img;
}
