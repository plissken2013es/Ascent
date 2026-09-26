import Phaser from "phaser";
import { FPS } from "./pico8/system.js";
import { render } from "./pico8/gfx.js";
import { DOWN, LEFT, O, RIGHT, UP, X } from "./pico8/input.js";
import { setupTouch, touchButtons } from "./touch.js";
import { setAudioBackend } from "./pico8/audio.js";
import { createSynth } from "./pico8/synth/node.js";

const STEP = 1000 / FPS;

// Keyboard like PICO-8: arrows, Z/C/N for 🅾️ and X/V/M for ❎
const KEYS = {
  LEFT: LEFT,
  RIGHT: RIGHT,
  UP: UP,
  DOWN: DOWN,
  Z: O,
  C: O,
  N: O,
  X: X,
  V: X,
  M: X
};

// Runs the PICO-8 console at 30 fps and shows its 64x64 screen, scaled up to
// fit the window.
export default class AscentScene extends Phaser.Scene {
  constructor(pico8, cart, { manual = false } = {}) {
    super("Ascent");
    this.pico8 = pico8;
    this.cart = cart;
    // Manual stepping for the tests: frames only run through step()
    this.manual = manual;
  }

  create() {
    this.screen = this.textures.createCanvas("screen", 64, 64);
    this.imageData = this.screen.context.createImageData(64, 64);
    this.add.image(0, 0, "screen").setOrigin(0, 0);

    // Keys pressed since the last frame, so that a quick press still counts
    this.latched = 0;
    this.keys = Object.entries(KEYS).map(([name, button]) => {
      const key = this.input.keyboard.addKey(name);
      key.on("down", () => (this.latched |= 1 << button));
      return { key, button };
    });
    setupTouch();

    // The synthesizer plays through Phaser's audio context, which Phaser
    // unlocks at the first user input
    const sound = this.sound;
    if (sound.context) {
      createSynth(sound.context, sound.destination, this.cart).then(
        (backend) => {
          setAudioBackend(backend);
          window.ascent.sound = backend.kind;
        },
        (e) => console.warn("No sound", e)
      );
    }

    this.accumulator = 0;
    this.present();

    window.ascent.scene = this;
    window.ascent.step = (frames = 1, buttons = 0) => this.step(frames, buttons);
  }

  // Called once per frame
  buttons() {
    let bits = touchButtons() | this.latched;
    this.latched = 0;
    for (const { key, button } of this.keys) {
      if (key.isDown) {
        bits |= 1 << button;
      }
    }
    const pad = this.input.gamepad && this.input.gamepad.pad1;
    if (pad) {
      const stick = pad.leftStick;
      if (pad.left || stick.x < -0.5) bits |= 1 << LEFT;
      if (pad.right || stick.x > 0.5) bits |= 1 << RIGHT;
      if (pad.up || stick.y < -0.5) bits |= 1 << UP;
      if (pad.down || stick.y > 0.5) bits |= 1 << DOWN;
      if (pad.A || pad.Y) bits |= 1 << O;
      if (pad.B || pad.X) bits |= 1 << X;
    }
    return bits;
  }

  update(time, delta) {
    if (this.manual) {
      return;
    }
    // Fixed 30 fps steps, without catching up after long pauses
    this.accumulator = Math.min(this.accumulator + delta, STEP * 4);
    let stepped = false;
    while (this.accumulator >= STEP) {
      this.accumulator -= STEP;
      this.pico8.frame(this.buttons());
      stepped = true;
    }
    if (stepped) {
      this.present();
    }
  }

  step(frames, buttons) {
    for (let i = 0; i < frames; i++) {
      this.pico8.frame(buttons);
    }
    this.present();
  }

  present() {
    if (!this.pico8.palette) {
      return;
    }
    render(this.imageData.data, this.pico8.palette);
    this.screen.context.putImageData(this.imageData, 0, 0);
    this.screen.refresh();
  }
}
