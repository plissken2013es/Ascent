"use strict";

const { spawnSync } = require("child_process");

// Opens the Phaser version, stepped by the test (?test) with a fixed random
// seed. Returns the page errors, which should stay empty.
async function openGame(page, { seed = 1, test = true } = {}) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.stack || error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  await page.goto(test ? `./?test&seed=${seed}` : "./");
  await page.waitForFunction(() => window.ascent && window.ascent.step);
  return errors;
}

// Runs frames with the given buttons (bit field: see BUTTONS)
async function step(page, frames, buttons = 0) {
  await page.evaluate(([frames, buttons]) => window.ascent.step(frames, buttons), [frames, buttons]);
}

const BUTTONS = { LEFT: 1, RIGHT: 2, UP: 4, DOWN: 8, O: 16, X: 32 };

// The comparisons with PICO-8 build cartridges with shrinko8
function hasShrinko8() {
  const [cmd, ...args] = (process.env.SHRINKO8 || "shrinko8").split(" ");
  const result = spawnSync(cmd, [...args, "--version"]);
  return !result.error && result.status === 0;
}

module.exports = { openGame, step, BUTTONS, hasShrinko8 };
