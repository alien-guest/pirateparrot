import Phaser from "phaser";
import { GAME_W, GAME_H, bigButton } from "../ui";

export class PauseScene extends Phaser.Scene {
  private from = "Sea";

  constructor() {
    super("Pause");
  }

  init(data: { from?: string }): void {
    this.from = data.from ?? "Sea";
  }

  create(): void {
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0b2a44, 0.65);
    this.add
      .text(GAME_W / 2, 220, "Пауза", {
        fontFamily: "Arial, sans-serif",
        fontSize: "64px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#22303c",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    bigButton(this, GAME_W / 2, 380, "Продолжить", () => this.resume(), { width: 380, height: 96, color: 0x2e9e5b });
    bigButton(this, GAME_W / 2, 500, "На главную", () => this.toTitle(), { width: 380, height: 96, color: 0x3c7dd2 });

    this.input.keyboard?.on("keydown-ESC", () => this.resume());
  }

  private resume(): void {
    this.scene.stop();
    this.scene.resume(this.from);
  }

  private toTitle(): void {
    this.scene.stop(this.from);
    this.scene.start("Title");
  }
}
