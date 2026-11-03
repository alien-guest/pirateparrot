import Phaser from "phaser";
import { GAME_W, GAME_H, addCoverBackground, addMuteButton, bigButton } from "../ui";
import { loadSettings } from "../settings";
import { speak } from "../tts";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("Title");
  }

  create(): void {
    addCoverBackground(this, "bg_title");

    const title = this.add
      .text(GAME_W / 2, 130, "Пират Прохор\nи попугай Кеша", {
        fontFamily: "Arial, sans-serif",
        fontSize: "72px",
        fontStyle: "bold",
        color: "#ffd94d",
        align: "center",
        stroke: "#22303c",
        strokeThickness: 10,
        lineSpacing: 8,
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: title, y: 118, duration: 1600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    this.add
      .text(GAME_W / 2, 262, "Приключение 1: Спасение акулёнка", {
        fontFamily: "Arial, sans-serif",
        fontSize: "34px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#22303c",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    const parrot = this.add.image(GAME_W - 220, GAME_H - 240, "parrot").setScale(0.3);
    this.tweens.add({ targets: parrot, y: parrot.y - 14, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    if (loadSettings().completed) {
      this.add
        .text(GAME_W / 2, 330, "★ Уровень уже пройден! Сыграем ещё раз? ★", {
          fontFamily: "Arial, sans-serif",
          fontSize: "26px",
          fontStyle: "bold",
          color: "#fff2b0",
          stroke: "#22303c",
          strokeThickness: 5,
        })
        .setOrigin(0.5);
    }

    const start = () => this.scene.start("Sea");
    bigButton(this, GAME_W / 2, GAME_H - 180, "Играть!", start, { width: 360, height: 110, fontSize: 52, color: 0x2e9e5b });
    this.input.keyboard?.on("keydown-SPACE", start);
    this.input.keyboard?.on("keydown-ENTER", start);

    addMuteButton(this);

    speak("Привет! Я попугай Кеша! Давай спасать акулёнка!", "parrot");
    window.__GAME_READY__ = true;
  }
}
