// The level editor (editor.html): edits the map of the cartridge

import cartText from "../../../src/ascent.p8?raw";
import { parseCart } from "../pico8/cart.js";
import { Level } from "./model.js";
import { MapView } from "./view.js";
import { DRAFT_KEY, EditorUI } from "./ui.js";

// The map being edited in this browser, or the map of the game
let draft = null;
try {
  draft = localStorage.getItem(DRAFT_KEY);
} catch (e) {
  // no storage
}

let level;
try {
  level = new Level(draft || cartText);
} catch (e) {
  level = new Level(cartText);
}

// The sprites and flags come from the game's cartridge
const cart = parseCart(cartText);
const options = { rooms: true, grid: true, flags: false, entities: true };
const view = new MapView(document.getElementById("map"), level, cart, options);
const ui = new EditorUI({ level, view, cart, original: cartText });

// Starts on the room of the player
const start = level.entities().find((e) => e.tile === 64);
view.showRoom(start ? Math.floor(start.x / 8) : 0, start ? Math.floor(start.y / 8) : 0, 4);

// Exposed for the automated tests in tests/ and for browser dev tools
window.editor = { level, view, ui, cart };
