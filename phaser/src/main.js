import Phaser from "phaser";
import cartText from "../../src/ascent.p8?raw";
import { parseCart } from "./pico8/cart.js";
import { Console, t } from "./pico8/system.js";
import * as lib from "./pico8/lib.js";
import * as program from "./game/main.js";
import { g } from "./game/state.js";
import * as gfx from "./pico8/gfx.js";
import { audioLog } from "./pico8/audio.js";
import { Synth } from "./pico8/synth/synth.js";
import AscentScene from "./AscentScene.js";

const params = new URLSearchParams(location.search);

// ?play: plays the map of the level editor (see editor/ui.js), from the start
// or from a given position
let play = null;
if (params.has("play")) {
  try {
    play = JSON.parse(localStorage.getItem("ascent-editor-play"));
  } catch (e) {
    play = null;
  }
}

const cart = parseCart(play ? play.cart : cartText);
const pico8 = new Console(cart, program);

// ?seed=n starts with a fixed random seed (for the tests)
if (params.has("seed")) {
  lib.srand(Number(params.get("seed")));
}
pico8.boot();

// Esc in the game goes back to the level editor, which shows it in a frame
if (play && window.parent !== window) {
  window.addEventListener("keydown", (event) => {
    if (event.code === "Escape") window.parent.postMessage({ type: "ascent-editor-close" }, location.origin);
  });
}

// Skips the title and the wake up, and starts at the given position
if (play && play.from) {
  g.intro = -32;
  g.pl.state = 0;
  g.tips.woken_up = true;
  g.pl.x = play.from.x;
  g.pl.y = play.from.y;
  program.set_cam(64 * Math.floor(g.pl.x / 64), 64 * Math.floor(g.pl.y / 64));
  program.swap_room(Math.floor(g.camtx / 64), Math.floor(g.camty / 64));
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 64,
  height: 64,
  parent: "game",
  backgroundColor: "#000000",
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  input: { gamepad: true },
  scene: [new AscentScene(pico8, cart, { manual: params.has("test") })]
});

// Exposed for the automated tests in tests/ and for browser dev tools
window.ascent = { game, pico8, cart, gfx, lib, audioLog, Synth, t, state: () => g };
