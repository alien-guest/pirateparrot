import Phaser from "phaser";
import { GAME_W, GAME_H } from "../ui";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("Preload");
  }

  preload(): void {
    const bar = this.add.graphics();
    this.load.on("progress", (v: number) => {
      bar.clear();
      bar.fillStyle(0x0e4d7a, 1).fillRect(0, 0, GAME_W, GAME_H);
      bar.fillStyle(0xffffff, 0.25).fillRoundedRect(GAME_W / 2 - 260, GAME_H / 2 - 18, 520, 36, 18);
      bar.fillStyle(0xffd94d, 1).fillRoundedRect(GAME_W / 2 - 260, GAME_H / 2 - 18, 520 * v, 36, 18);
    });
    this.add
      .text(GAME_W / 2, GAME_H / 2 - 70, "Загружаем корабль…", {
        fontFamily: "Arial, sans-serif",
        fontSize: "34px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.load.image("bg_title", "assets/bg_title.png");
    this.load.image("bg_sea", "assets/bg_sea.png");
    this.load.image("bg_deck", "assets/bg_deck.png");
    this.load.image("pirate", "assets/pirate.png");
    this.load.image("parrot", "assets/parrot.png");
    this.load.image("shark_net", "assets/shark_net.png");
    this.load.image("shark_free", "assets/shark_free.png");
    this.load.image("fish", "assets/fish.png");
    this.load.image("shell", "assets/shell.png");
    this.load.image("star", "assets/star.png");
    this.load.image("barrel", "assets/barrel.png");
    this.load.image("tea_table", "assets/tea_table.png");
  }

  create(): void {
    // tiny white dot texture for particles (splash / confetti)
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xffffff, 1).fillCircle(8, 8, 8);
    g.generateTexture("dot", 16, 16);
    g.destroy();
    this.scene.start("Title");
  }
}
