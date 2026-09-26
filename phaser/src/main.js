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

const cart = parseCart(cartText);
const pico8 = new Console(cart, program);

// ?seed=n starts with a fixed random seed (for the tests)
if (params.has("seed")) {
  lib.srand(Number(params.get("seed")));
}
pico8.boot();

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
