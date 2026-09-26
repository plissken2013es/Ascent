"use strict";

const { test, expect } = require("@playwright/test");
const { openGame, step, BUTTONS } = require("./helpers");

const { O, X, LEFT, RIGHT } = BUTTONS;

test("boots to the title screen", async ({ page }) => {
  const errors = await openGame(page, { test: false });

  // The game runs by itself at 30 fps
  await page.waitForFunction(() => window.ascent.pico8.updateCount > 30);
  const state = await page.evaluate(() => ({
    intro: window.ascent.state().intro,
    colors: new Set(window.ascent.gfx.screen.subarray(0, 64 * 128)).size
  }));
  expect(state.intro).toBe(20);
  expect(state.colors).toBeGreaterThan(5);
  // The synthesizer is connected to Phaser's audio context
  await page.waitForFunction(() => window.ascent.sound);
  expect(await page.evaluate(() => window.ascent.sound)).toBe("AudioWorklet");
  expect(errors).toEqual([]);
});

test("starts the game and walks and jumps", async ({ page }) => {
  const errors = await openGame(page);

  await step(page, 30);
  await step(page, 1, O);
  expect(await page.evaluate(() => window.ascent.audioLog())).toContainEqual(["music", 0]);

  // Wakes up and talks
  await step(page, 150);
  expect(await page.evaluate(() => window.ascent.state().speech.length)).toBe(4);
  for (let i = 0; i < 4; i++) {
    await step(page, 1, X);
    await step(page, 5);
  }
  expect(await page.evaluate(() => window.ascent.state().speech)).toBeUndefined();

  const start = await page.evaluate(() => window.ascent.state().pl.x);
  await step(page, 20, RIGHT);
  expect(await page.evaluate(() => window.ascent.state().pl.x)).toBeGreaterThan(start);

  await step(page, 1, O | LEFT);
  expect(await page.evaluate(() => window.ascent.state().pl.inair)).toBe(true);
  expect(await page.evaluate(() => window.ascent.audioLog())).toContainEqual(["sfx", 53]);
  expect(errors).toEqual([]);
});

test("restarts after the end screen", async ({ page }) => {
  const errors = await openGame(page);

  // Reach the core with the 8 spirits: the good ending
  await page.evaluate(() => {
    const { state, pico8 } = window.ascent;
    const g = state();
    g.intro = -32;
    g.pl.state = 0;
    g.tips.woken_up = true;
    g.pl.x = 908;
    g.pl.y = 109;
    g.pl.lore = 8;
    pico8.program.set_cam(896, 64);
  });
  for (let i = 0; i < 40 && (await page.evaluate(() => window.ascent.state().outro_step)) !== 5; i++) {
    await step(page, 9);
    await step(page, 1, X);
  }
  expect(await page.evaluate(() => window.ascent.state().outro_step)).toBe(5);
  // (after the fade out, the end screen waits for 40 more frames)
  await step(page, 80);

  // Any button fades out and runs the cartridge again
  await step(page, 1, X);
  await step(page, 40);
  const state = await page.evaluate(() => ({ intro: window.ascent.state().intro, outro: window.ascent.state().outro }));
  expect(state).toEqual({ intro: 20, outro: undefined });
  expect(errors).toEqual([]);
});

test.describe("on a touch screen", () => {
  test.use({ viewport: { width: 863, height: 360 }, hasTouch: true, isMobile: true });

  test("a quick tap on the virtual gamepad starts the game", async ({ page }) => {
    const errors = await openGame(page, { test: false });
    await expect(page.locator("#button-o")).toBeVisible();
    await page.waitForFunction(() => window.ascent.pico8.updateCount > 10);
    const box = await page.locator("#button-o").boundingBox();
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForFunction(() => window.ascent.state().intro < 20);
    expect(errors).toEqual([]);
  });
});
