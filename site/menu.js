// The menu of the website: chooses the PICO-8 or the Phaser 4 version. Drawn
// like the title screen of the game, with its map, logo and font (the PICO-8
// functions of the Phaser version).

import cartText from "../src/ascent.p8?raw";
import { parseCart } from "../phaser/src/pico8/cart.js";
import * as gfx from "../phaser/src/pico8/gfx.js";
import { split } from "../phaser/src/pico8/lib.js";
import { FONT, KERNING } from "../phaser/src/game/main.js";

const CHOICES = [
  { text: "pICO-8", href: "pico8/", y: 34 },
  { text: "pHASER 4", href: "phaser4/", y: 44 }
];

const canvas = document.getElementById("screen");
const context = canvas.getContext("2d");
const image = context.createImageData(64, 64);

gfx.loadGfx(parseCart(cartText));
gfx.resetDrawState();
gfx.poke(0x5f2c, 3);
gfx.poke(0x5600, ...split(FONT));
gfx.poke(0x5f58, 0x81);

const kerning = {};
for (const pair of split(KERNING)) {
  const [char, value] = split(pair, "=");
  kerning[char] = value;
}

// pr() of the game: a text with the kerning of the font and a shadow
function width(text) {
  let w = 0;
  for (const char of text) w += 4 - (kerning[char] || 0);
  return w;
}

function pr(text, x, y, color, shadow) {
  for (const char of text) {
    if (shadow !== undefined) gfx.print(char, x, y + 1, shadow);
    gfx.print(char, x, y, color);
    x += 4 - (kerning[char] || 0);
  }
}

let selected = 0;
let tick = 0;

function draw() {
  gfx.cls();
  gfx.pal();
  // the start room, like the title screen
  gfx.camera(320, 64);
  gfx.map();
  gfx.camera();
  gfx.spr(187, 12, 6, 5, 1);

  gfx.rectfill(6, 29, 57, 54, 0);
  gfx.rect(6, 29, 57, 54, 1);
  CHOICES.forEach((choice, i) => {
    const x = 32 - width(choice.text) / 2;
    const active = i === selected;
    pr(choice.text, x, choice.y, active ? 7 : 13, active ? 5 : undefined);
    if (active && Math.floor(tick / 8) % 2 === 0) {
      pr(">", x - 6, choice.y, 7);
      pr("<", x + width(choice.text) + 1, choice.y, 7);
    }
  });

  gfx.pal(14, 131, 1);
  gfx.pal(15, 139, 1);
  gfx.render(image.data);
  context.putImageData(image, 0, 0);
}

function play() {
  location.href = CHOICES[selected].href;
}

window.addEventListener("keydown", (event) => {
  if (event.code === "ArrowUp" || event.code === "ArrowLeft") {
    selected = (selected + CHOICES.length - 1) % CHOICES.length;
  } else if (event.code === "ArrowDown" || event.code === "ArrowRight") {
    selected = (selected + 1) % CHOICES.length;
  } else if (["Enter", "Space", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyN", "KeyM"].includes(event.code)) {
    play();
  } else {
    return;
  }
  event.preventDefault();
  draw();
});

// A click or tap on a choice plays it
function choiceAt(event) {
  const box = canvas.getBoundingClientRect();
  const y = ((event.clientY - box.top) / box.height) * 64;
  return CHOICES.findIndex((choice) => y >= choice.y - 3 && y < choice.y + 8);
}

canvas.addEventListener("pointermove", (event) => {
  const i = choiceAt(event);
  if (i >= 0) selected = i;
});

canvas.addEventListener("click", (event) => {
  const i = choiceAt(event);
  if (i >= 0) {
    selected = i;
    play();
  }
});

// 30 fps like the game (for the blinking cursor)
let last = 0;
function frame(time) {
  if (time - last >= 1000 / 30) {
    last = time;
    tick++;
    draw();
  }
  requestAnimationFrame(frame);
}
draw();
requestAnimationFrame(frame);
