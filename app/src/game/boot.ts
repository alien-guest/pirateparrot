/**
 * boot.ts — Phaser bootstrap. Keeps the template contract:
 *   startGame(canvas) mounts the game onto the existing <canvas id="game-canvas">
 *   stopGame() tears it down (safe to call repeatedly; startGame re-entry safe)
 *   window.__GAME_READY__ is raised by the Title scene on its first frame.
 *
 * The game is a 2D story quest for 5–6 year olds, so there is no WASD movement
 * and no __gameProbe — the self-check skips direction assertions without one.
 */

import Phaser from "phaser";
import { PreloadScene } from "./scenes/PreloadScene";
import { TitleScene } from "./scenes/TitleScene";
import { SeaScene } from "./scenes/SeaScene";
import { DeckScene } from "./scenes/DeckScene";
import { PauseScene } from "./scenes/PauseScene";
import { stopSpeak } from "./tts";

declare global {
  interface Window {
    __GAME_READY__?: boolean;
  }
}

let game: Phaser.Game | null = null;

export function startGame(canvas: HTMLCanvasElement): void {
  stopGame();
  window.__GAME_READY__ = false;

  game = new Phaser.Game({
    // CANVAS renderer: plenty for a 2D quest and lets the self-check read
    // pixels back without preserveDrawingBuffer.
    type: Phaser.CANVAS,
    canvas,
    width: 1280,
    height: 720,
    backgroundColor: "#0e4d7a",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [PreloadScene, TitleScene, SeaScene, DeckScene, PauseScene],
    disableContextMenu: true,
  });
}

export function stopGame(): void {
  stopSpeak();
  if (game) {
    game.destroy(true);
    game = null;
  }
  window.__GAME_READY__ = false;
}
