"use strict";

// Runs the scenarios of pico8/scenarios.js in PICO-8 (the web export with a
// test harness) and in the Phaser version, and compares them frame by frame:
// player position, a hash of the screen and screen palette, t() and the
// sounds played.

const { test, expect } = require("@playwright/test");
const { openGame, hasShrinko8 } = require("./helpers");
const { runHarness } = require("./pico8/run");
const { phaserTrace } = require("./pico8/trace");
const { scenarios } = require("./pico8/scenarios");

test.skip(!hasShrinko8(), "needs shrinko8 (pip install shrinko) to build the PICO-8 test cartridges");

for (const scenario of scenarios) {
  test(`${scenario.name} (${scenario.last} frames) is the same as on PICO-8`, async ({ browser }) => {
    const pico8Page = await browser.newPage();
    const expected = await runHarness(pico8Page, scenario);
    await pico8Page.close();

    const page = await browser.newPage();
    const errors = await openGame(page, { seed: scenario.seed });
    const actual = await page.evaluate(phaserTrace, scenario);
    expect(errors).toEqual([]);

    let mismatch = null;
    for (let f = 1; f <= scenario.last && !mismatch; f++) {
      const a = expected.frames[f];
      const b = actual.frames[f];
      if (!a || !b || a.x !== b.x || a.y !== b.y || a.t !== b.t || a.hash.toLowerCase() !== b.hash.toLowerCase()) {
        mismatch = { frame: f, pico8: a, phaser: b };
      }
    }
    expect(mismatch, "first frame that differs").toBeNull();
    expect(actual.sounds).toEqual(expected.sounds);
  });
}
