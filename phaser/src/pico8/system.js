// Runs a ported cartridge like PICO-8 does: _init() once, then _update() and
// _draw() at 30 frames per second, with t(), flip() and run().

import { loadGfx, resetDrawState, screenPalette } from "./gfx.js";
import { setButtons, resetButtons } from "./input.js";
import { stopAudio } from "./audio.js";

export const FPS = 30;

// Frames since the start, which t() is computed from: it is already 1 at the
// first _update() on PICO-8, and doesn't count the frames shown by flip()
let timeFrames = 0;

// Screen palettes of the frames shown by flip() during the current callback
const flips = [];

// Thrown by run() to abandon the running callback, like PICO-8 does
const RUN = { run: true };

export function t() {
  return Math.floor((timeFrames / FPS) * 65536) / 65536;
}

// Shows the current screen for one frame. Only called by the game while
// nothing is drawn (to fade out the last frame), so the screen palette is all
// that changes.
export function flip() {
  flips.push(screenPalette());
}

export function run() {
  throw RUN;
}

export class Console {
  // program: { reset(), _init(), _update(), _draw() }
  constructor(cart, program) {
    this.cart = cart;
    this.program = program;
    this.queue = [];
    this.drawAfterFlips = false;
    this.restartAfterFlips = false;
    this.frameCount = 0;
    this.updateCount = 0;
    this.drawCount = 0;
    // The screen palette to display the screen with, null until drawn
    this.palette = null;
  }

  boot() {
    loadGfx(this.cart);
    resetDrawState();
    resetButtons();
    stopAudio();
    timeFrames = 1;
    flips.length = 0;
    this.program.reset();
    this.program._init();
  }

  // Runs one frame with the given buttons (bit field)
  frame(buttons) {
    this.frameCount++;

    // Frames shown by flip() inside the previous _update()
    if (this.queue.length) {
      this.palette = this.queue.shift();
      return;
    }
    if (this.restartAfterFlips) {
      this.restartAfterFlips = false;
      this.boot();
      return;
    }
    if (this.drawAfterFlips) {
      this.drawAfterFlips = false;
      this.draw();
      return;
    }

    setButtons(buttons);
    timeFrames++;
    this.updateCount++;

    let restart = false;
    try {
      this.program._update();
    } catch (e) {
      if (e !== RUN) {
        throw e;
      }
      restart = true;
    }

    if (flips.length) {
      this.queue.push(...flips);
      flips.length = 0;
      this.palette = this.queue.shift();
      this.restartAfterFlips = restart;
      this.drawAfterFlips = !restart;
      return;
    }
    if (restart) {
      this.boot();
      return;
    }
    this.draw();
  }

  // Whether the next frame runs _update() (and reads the buttons)
  nextIsUpdate() {
    return !this.queue.length && !this.restartAfterFlips && !this.drawAfterFlips;
  }

  draw() {
    this.drawCount++;
    this.program._draw();
    this.palette = screenPalette();
  }
}
