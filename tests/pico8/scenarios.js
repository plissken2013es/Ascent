"use strict";

// Scripted runs that are compared frame by frame between PICO-8 and the
// Phaser version (see reference.spec.js). A script is a list of
// [frames, buttons]; a setup skips the title and places the player (see
// setupLua() in harness.js).

const L = 1;
const R = 2;
const U = 4;
const D = 8;
const O = 16;
const X = 32;

// Deterministic random inputs: holds of 1-20 frames
function fuzz(seed, count, { dash = true } = {}) {
  let r = seed;
  const rand = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  const script = [];
  for (let i = 0; i < count; i++) {
    let buttons = Math.floor(rand() * 64);
    if (!dash || rand() < 0.5) {
      buttons &= ~X;
    }
    script.push([1 + Math.floor(rand() * 20), buttons]);
  }
  return script;
}

// Presses ❎ every n frames, to go through speech bubbles and lore screens
function talk(frames, every = 10) {
  const script = [];
  for (let f = 0; f < frames; f += every) {
    script.push([every - 1, 0], [1, X]);
  }
  return script;
}

const ALL = ["grab", "stomp", "vines", "scale", "rush"];

// Where the player stands at each checkpoint
const CHECKPOINTS = [
  [10, 1],
  [105, 3],
  [86, 4],
  [57, 11],
  [78, 12],
  [34, 13],
  [49, 18],
  [83, 22],
  [1, 26],
  [62, 26],
  [29, 30]
];

const scenarios = [
  {
    name: "title, intro and first steps",
    seed: 1,
    script: [[30, 0], [1, O], [150, 0], ...talk(40), [40, R], [10, 0], [1, O | L], [20, L], [30, 0]]
  },
  {
    name: "random play from the start",
    seed: 2,
    script: [[30, 0], [1, O], [150, 0], ...talk(40), ...fuzz(2, 60)]
  },
  {
    name: "ladder",
    seed: 3,
    setup: { x: 531, y: 61 },
    script: [[40, D], [10, 0], [20, U], ...fuzz(3, 40, { dash: false })]
  },
  {
    name: "death on spikes and respawn",
    seed: 4,
    setup: { x: 604, y: 45 },
    script: [[120, 0], ...talk(40), ...fuzz(4, 30)]
  },
  {
    name: "upgrade",
    seed: 5,
    setup: { x: 532, y: 181 },
    script: [[80, 0], ...talk(60), ...fuzz(5, 30)]
  },
  {
    name: "lore orb",
    seed: 6,
    setup: { x: 540, y: 21 },
    script: [[60, 0], ...talk(60), ...fuzz(6, 30)]
  },
  {
    name: "mushroom",
    seed: 7,
    setup: { x: 332, y: 20, upgrades: ["stomp"] },
    script: [[60, 0], ...fuzz(7, 40, { dash: false })]
  },
  {
    name: "fan",
    seed: 8,
    setup: { x: 292, y: 170 },
    script: [[60, 0], ...fuzz(8, 40, { dash: false })]
  },
  {
    name: "blobs and dash",
    seed: 9,
    setup: { x: 770, y: 165, upgrades: ALL },
    script: [[20, R], [1, X | R], [30, R], ...fuzz(9, 50)]
  },
  {
    name: "vines",
    seed: 10,
    setup: { x: 756, y: 140 },
    script: fuzz(10, 30, { dash: false })
  },
  {
    name: "vines with the upgrade",
    seed: 11,
    setup: { x: 756, y: 140, upgrades: ["vines"] },
    script: fuzz(11, 30, { dash: false })
  },
  ...CHECKPOINTS.map(([x, y], i) => ({
    name: `all upgrades around checkpoint ${x},${y}`,
    seed: 20 + i,
    setup: { x: x * 8 + 4, y: y * 8 + 5, upgrades: ALL },
    script: fuzz(20 + i, 40)
  })),
  // Both endings reach the end screen without restarting: a button there
  // runs the cartridge again (see smoke.spec.js)
  {
    name: "good ending",
    seed: 40,
    setup: { x: 908, y: 109, lore: 8 },
    script: [...talk(290), [110, 0]]
  },
  {
    name: "bad ending",
    seed: 41,
    setup: { x: 908, y: 109, lore: 3 },
    script: [...talk(680), [100, 0]]
  }
];

for (const scenario of scenarios) {
  scenario.last = scenario.script.reduce((sum, [frames]) => sum + frames, 0);
}

module.exports = { scenarios, L, R, U, D, O, X };
