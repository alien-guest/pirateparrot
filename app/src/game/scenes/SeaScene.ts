import Phaser from "phaser";
import {
  GAME_W,
  GAME_H,
  addCoverBackground,
  addMuteButton,
  addPauseSupport,
  addBubble,
  hideBubble,
  bigButton,
  say,
} from "../ui";
import { sfx } from "../sfx";
import { speak } from "../tts";

const FONT = "Arial, Helvetica, sans-serif";

/**
 * SeaScene — level 1: rescue the baby shark tangled in a net.
 * Flow: intro dialogue → 5 tasks (counting, more/less, pattern, find-a-pair,
 * counting-action) → rescue animation → tea party scene.
 */
export class SeaScene extends Phaser.Scene {
  private sharkNet!: Phaser.GameObjects.Image;
  private taskObjects: Phaser.GameObjects.GameObject[] = [];
  private instructionText?: Phaser.GameObjects.Text;
  private instructionBox?: Phaser.GameObjects.Graphics;
  private instructionContainer?: Phaser.GameObjects.Container;

  constructor() {
    super("Sea");
  }

  create(): void {
    addCoverBackground(this, "bg_sea");

    // gentle wave sparkles on the water
    for (let i = 0; i < 8; i++) {
      const wx = 120 + i * 150;
      const wy = 480 + (i % 3) * 60;
      const wave = this.add.ellipse(wx, wy, 90, 14, 0xffffff, 0.35);
      this.tweens.add({
        targets: wave,
        x: wx + 24,
        alpha: 0.12,
        duration: 1400 + i * 130,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    // wooden raft under the pirate (feet land at ~y 594)
    const raft = this.add.graphics();
    raft.fillStyle(0x8a5a2b, 1);
    for (let i = 0; i < 4; i++) raft.fillRoundedRect(90 + i * 82, 556, 76, 30, 8);
    raft.fillStyle(0x6d4520, 1).fillRoundedRect(80, 588, 330, 18, 8);

    const pirate = this.add.image(235, 400, "pirate").setScale(0.38);
    this.tweens.add({ targets: pirate, y: 392, duration: 1500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    const parrot = this.add.image(420, 265, "parrot").setScale(0.2);
    this.tweens.add({ targets: parrot, y: 252, duration: 800, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    this.sharkNet = this.add.image(880, 420, "shark_net").setScale(0.5);
    this.tweens.add({ targets: this.sharkNet, y: 408, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    addMuteButton(this);
    addPauseSupport(this);

    this.startIntro();
  }

  // ---------- helpers ----------

  private track<T extends Phaser.GameObjects.GameObject>(obj: T): T {
    this.taskObjects.push(obj);
    return obj;
  }

  private clearTask(): void {
    this.taskObjects.forEach((o) => o.destroy());
    this.taskObjects = [];
    this.instructionContainer?.destroy();
    this.instructionContainer = undefined;
    this.instructionText = undefined;
    this.instructionBox = undefined;
  }

  /** Persistent instruction banner (top centre) that tasks can update. */
  private setInstruction(text: string): void {
    if (!this.instructionContainer) {
      const t = this.add
        .text(0, 0, text, {
          fontFamily: FONT,
          fontSize: "32px",
          fontStyle: "bold",
          color: "#22303c",
          align: "center",
          wordWrap: { width: 820 },
        })
        .setOrigin(0.5);
      const g = this.add.graphics();
      this.instructionContainer = this.add.container(GAME_W / 2, 78, [g, t]).setDepth(60);
      this.instructionText = t;
      this.instructionBox = g;
    }
    this.instructionText!.setText(text);
    const w = this.instructionText!.width + 56;
    const h = this.instructionText!.height + 34;
    this.instructionBox!.clear();
    this.instructionBox!.fillStyle(0xfff6d8, 0.97);
    this.instructionBox!.lineStyle(4, 0x22303c, 0.85);
    this.instructionBox!.fillRoundedRect(-w / 2, -h / 2, w, h, 22);
    this.instructionBox!.strokeRoundedRect(-w / 2, -h / 2, w, h, 22);
  }

  private shake(obj: Phaser.GameObjects.GameObject): void {
    this.tweens.add({ targets: obj, x: "+=10", duration: 60, yoyo: true, repeat: 3 });
  }

  /** Praise bubble from the parrot, then advance. */
  private praise(text: string, next: () => void): void {
    const b = addBubble(this, 520, 190, text, 480);
    speak(text, "parrot");
    this.time.delayedCall(2100, () => hideBubble(this, b, next));
  }

  // ---------- story flow ----------

  private startIntro(): void {
    say(this, "pirate", 330, 170, "Смотри, Кеша! Акулёнок запутался в сетях!", () => {
      say(this, "parrot", 560, 165, "Надо его спасти! Сначала угостим его рыбкой!", () => {
        this.taskCountFish();
      });
    });
  }

  /** Task 1 — counting: how many fish swam past? (7) */
  private taskCountFish(): void {
    const ANSWER = 7;
    const lanes = [270, 330, 390, 450, 510, 360, 480];
    let buttons: Phaser.GameObjects.Container[] = [];

    const showButtons = () => {
      const options = [5, 7, 9];
      options.forEach((n, i) => {
        const btn = bigButton(
          this,
          GAME_W / 2 - 240 + i * 240,
          620,
          String(n),
          () => {
            if (n === ANSWER) {
              sfx.good();
              buttons.forEach((b) => b.destroy());
              buttons = [];
              this.praise("Молодец! Семь рыбок! Акулёнок доволен!", () => {
                this.clearTask();
                this.taskBarrels();
              });
            } else {
              sfx.bad();
              this.shake(btn);
              this.setInstruction("Не-а! Посчитай ещё раз — рыбки проплывут снова!");
              speak("Попробуй ещё раз! Смотри внимательно!", "parrot");
              buttons.forEach((b) => b.destroy());
              buttons = [];
              this.time.delayedCall(1600, runFish);
            }
          },
          { width: 130, height: 110, fontSize: 56, color: 0x3c7dd2 },
        );
        buttons.push(this.track(btn));
      });
    };

    const runFish = () => {
      this.setInstruction("Посчитай рыбок! Сколько их проплывёт мимо?");
      speak("Посчитай рыбок! Сколько их проплывёт мимо?", "parrot");
      let finished = 0;
      lanes.forEach((y, i) => {
        const fish = this.track(this.add.image(GAME_W + 90, y, "fish").setScale(0.085));
        this.tweens.add({
          targets: fish,
          x: -120,
          delay: 500 + i * 480,
          duration: 3200,
          ease: "Linear",
          onComplete: () => {
            fish.destroy();
            finished++;
            if (finished === ANSWER) showButtons();
          },
        });
        this.tweens.add({
          targets: fish,
          y: y + 12,
          delay: 500 + i * 480,
          duration: 400,
          yoyo: true,
          repeat: 7,
          ease: "Sine.easeInOut",
        });
      });
    };

    runFish();
  }

  /** Task 2 — more/less: which barrel holds more fish? */
  private taskBarrels(): void {
    this.setInstruction("В какой бочке БОЛЬШЕ рыбы? Нажми на неё!");
    speak("В какой бочке больше рыбы? Нажми на неё!", "parrot");

    const makeBarrel = (x: number, count: number, correct: boolean) => {
      // fish sit on top of the barrel rim (barrel top edge ≈ y 366)
      for (let i = 0; i < count; i++) {
        const row = Math.floor(i / 3);
        const col = i % 3;
        this.track(this.add.image(x - 55 + col * 55, 350 - row * 60, "fish").setScale(0.06));
      }
      const barrel = this.track(this.add.image(x, 520, "barrel").setScale(0.3));
      barrel.setInteractive({ useHandCursor: true });
      barrel.on("pointerdown", () => {
        if (correct) {
          sfx.good();
          this.tweens.add({ targets: barrel, scale: 0.34, duration: 160, yoyo: true });
          this.praise("Правильно! Тут шесть рыбок — больше, чем три!", () => {
            this.clearTask();
            this.taskPattern();
          });
        } else {
          sfx.bad();
          this.shake(barrel);
          speak("Тут меньше рыбок. Посчитай на обеих бочках!", "parrot");
        }
      });
    };

    makeBarrel(520, 3, false);
    makeBarrel(960, 6, true);
  }

  /** Task 3 — pattern: shell, star, shell, star, …? */
  private taskPattern(): void {
    this.setInstruction("Смотри на узор! Что должно быть дальше?");
    speak("Смотри на узор! Ракушка, звезда, ракушка, звезда… Что дальше?", "parrot");

    const seq = ["shell", "star", "shell", "star"];
    seq.forEach((key, i) => {
      this.track(this.add.image(430 + i * 150, 390, key).setScale(0.13));
    });
    const card = this.track(this.add.graphics());
    card.fillStyle(0xffffff, 0.95).lineStyle(4, 0x22303c, 0.9);
    card.fillRoundedRect(430 + 4 * 150 - 62, 390 - 62, 124, 124, 20);
    card.strokeRoundedRect(430 + 4 * 150 - 62, 390 - 62, 124, 124, 20);
    this.track(
      this.add
        .text(430 + 4 * 150, 390, "?", { fontFamily: FONT, fontSize: "72px", fontStyle: "bold", color: "#d23c3c" })
        .setOrigin(0.5),
    );

    const answer = (key: string, btn: Phaser.GameObjects.Container): void => {
      if (key === "shell") {
        sfx.good();
        this.praise("Верно! Дальше ракушка! Узор собран!", () => {
          this.clearTask();
          this.taskFindPair();
        });
      } else {
        sfx.bad();
        this.shake(btn);
        speak("Посмотри ещё раз: ракушка, звезда, ракушка, звезда…", "parrot");
      }
    };

    const btn1 = this.track(
      bigButton(this, 530, 590, "", () => answer("shell", btn1), { width: 150, height: 130, color: 0xff9ec7, imageKey: "shell", imageScale: 0.1 }),
    );
    const btn2 = this.track(
      bigButton(this, 750, 590, "", () => answer("star", btn2), { width: 150, height: 130, color: 0xffb84d, imageKey: "star", imageScale: 0.1 }),
    );
    void btn1;
    void btn2;
  }

  /** Task 4 — attention: find the two identical shells. */
  private taskFindPair(): void {
    this.setInstruction("Найди ДВЕ ОДИНАКОВЫЕ ракушки! Нажми на них!");
    speak("Найди две одинаковые ракушки! Нажми на них!", "parrot");

    let found = 0;
    const items: { key: string; x: number; match: boolean }[] = [
      { key: "star", x: 460, match: false },
      { key: "shell", x: 670, match: true },
      { key: "fish", x: 880, match: false },
      { key: "shell", x: 1090, match: true },
    ];

    items.forEach((it) => {
      const img = this.track(this.add.image(it.x, 400, it.key).setScale(0.16));
      img.setInteractive({ useHandCursor: true });
      img.on("pointerdown", () => {
        if (!it.match) {
          sfx.bad();
          this.shake(img);
          speak("Это не ракушка! Ищи две одинаковые ракушки!", "parrot");
          return;
        }
        if (img.getData("done")) return;
        img.setData("done", true);
        sfx.good();
        found++;
        this.tweens.add({ targets: img, scale: 0.2, angle: 8, duration: 200, yoyo: true });
        const ring = this.track(this.add.graphics());
        ring.lineStyle(6, 0x2e9e5b, 1).strokeCircle(it.x, 400, 88);
        if (found === 2) {
          this.praise("Ура! Пара найдена! Осталось разрезать сеть!", () => {
            this.clearTask();
            this.taskCutRopes();
          });
        }
      });
    });
  }

  /** Task 5 — counting action: snip the 3 ropes holding the net. */
  private taskCutRopes(): void {
    let left = 3;
    this.setInstruction("Нажми на 3 верёвки и разрежь сеть! Осталось: 3");
    speak("Нажми на три верёвки и разрежь сеть!", "parrot");

    const ropes: { x1: number; y1: number; x2: number; y2: number }[] = [
      { x1: 700, y1: 300, x2: 1060, y2: 480 },
      { x1: 1060, y1: 300, x2: 700, y2: 500 },
      { x1: 880, y1: 260, x2: 880, y2: 560 },
    ];

    ropes.forEach((r) => {
      const g = this.track(this.add.graphics());
      g.lineStyle(12, 0x7a4a1f, 1);
      g.lineBetween(r.x1, r.y1, r.x2, r.y2);
      g.lineStyle(4, 0xa06a35, 1);
      g.lineBetween(r.x1, r.y1, r.x2, r.y2);
      const mx = (r.x1 + r.x2) / 2;
      const my = (r.y1 + r.y2) / 2;
      const zone = this.track(this.add.zone(mx, my, 120, 120).setInteractive({ useHandCursor: true }));
      zone.on("pointerdown", () => {
        if (zone.getData("cut")) return;
        zone.setData("cut", true);
        sfx.snip();
        g.destroy();
        zone.destroy();
        left--;
        if (left > 0) {
          this.setInstruction(`Здорово! Осталось верёвок: ${left}`);
          speak(left === 2 ? "Осталось две верёвки!" : "Осталась одна верёвка!", "parrot");
        } else {
          this.clearTask();
          this.rescue();
        }
      });
    });
  }

  /** Rescue animation + closing dialogue → tea party. */
  private rescue(): void {
    sfx.splash();
    this.sharkNet.destroy();

    const shark = this.add.image(880, 420, "shark_free").setScale(0.5);
    this.tweens.add({ targets: shark, y: 240, angle: -12, duration: 420, ease: "Quad.easeOut" });
    this.tweens.add({
      targets: shark,
      y: 420,
      angle: 0,
      delay: 420,
      duration: 500,
      ease: "Bounce.easeOut",
      onComplete: () => {
        this.tweens.add({ targets: shark, y: 408, duration: 1100, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      },
    });

    const splash = this.add.particles(880, 520, "dot", {
      speed: { min: 120, max: 320 },
      angle: { min: 200, max: 340 },
      lifespan: 700,
      quantity: 26,
      scale: { start: 1.4, end: 0.2 },
      tint: [0x9fd8ff, 0xffffff, 0x5fb8e8],
      emitting: false,
    });
    splash.explode(26, 880, 520);
    sfx.win();

    this.time.delayedCall(1400, () => {
      say(this, "shark", 880, 160, "Спасибо, друзья! Я свободен!", () => {
        say(this, "parrot", 540, 170, "Ура! Мы спасли акулёнка! А теперь — чай с печеньками!", () => {
          this.scene.start("Deck");
        });
      });
    });
  }
}
