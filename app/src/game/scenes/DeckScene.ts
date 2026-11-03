import Phaser from "phaser";
import { GAME_W, GAME_H, addCoverBackground, addMuteButton, addPauseSupport, bigButton } from "../ui";
import { saveSettings } from "../settings";
import { sfx } from "../sfx";
import { speak } from "../tts";

/** DeckScene — happy ending: tea with cookies on the ship. */
export class DeckScene extends Phaser.Scene {
  constructor() {
    super("Deck");
  }

  create(): void {
    addCoverBackground(this, "bg_deck");
    saveSettings({ completed: true });

    this.add.image(GAME_W / 2, 500, "tea_table").setScale(0.55);
    const pirate = this.add.image(260, 430, "pirate").setScale(0.36);
    this.tweens.add({ targets: pirate, y: 422, duration: 1400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    const parrot = this.add.image(1010, 300, "parrot").setScale(0.22);
    this.tweens.add({ targets: parrot, y: 288, duration: 750, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    const shark = this.add.image(1080, 610, "shark_free").setScale(0.22);
    this.tweens.add({ targets: shark, y: 596, duration: 1000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    // confetti rain
    this.add.particles(0, 0, "dot", {
      x: { min: 0, max: GAME_W },
      y: -20,
      speedY: { min: 90, max: 220 },
      speedX: { min: -30, max: 30 },
      lifespan: 6000,
      quantity: 3,
      frequency: 240,
      scale: { start: 1.2, end: 0.9 },
      tint: [0xffd94d, 0xff9ec7, 0x7dd87d, 0x7db8ff, 0xff8a5c],
      angle: { min: 80, max: 100 },
    });

    this.add
      .text(GAME_W / 2, 110, "УРА! Акулёнок спасён!", {
        fontFamily: "Arial, sans-serif",
        fontSize: "60px",
        fontStyle: "bold",
        color: "#ffd94d",
        stroke: "#22303c",
        strokeThickness: 9,
      })
      .setOrigin(0.5);
    this.add
      .text(GAME_W / 2, 175, "Прохор и Кеша пьют чай с печеньками ☕", {
        fontFamily: "Arial, sans-serif",
        fontSize: "30px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#22303c",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    bigButton(this, GAME_W / 2 - 210, GAME_H - 70, "Играть снова", () => this.scene.start("Sea"), {
      width: 340,
      height: 88,
      fontSize: 36,
      color: 0x2e9e5b,
    });
    bigButton(this, GAME_W / 2 + 210, GAME_H - 70, "На главную", () => this.scene.start("Title"), {
      width: 340,
      height: 88,
      fontSize: 36,
      color: 0x3c7dd2,
    });

    addMuteButton(this);
    addPauseSupport(this);

    sfx.win();
    speak("Ура! Акулёнок спасён! Спасибо тебе, дружок! Ты настоящий герой!", "parrot");
  }
}
