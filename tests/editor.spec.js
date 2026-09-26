"use strict";

// The level editor (editor.html)

const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");

test.use({ viewport: { width: 1400, height: 860 } });

const ORIGINAL = fs.readFileSync(path.join(__dirname, "..", "src", "ascent.p8"), "utf8");

// The map section of a cartridge, as 32 lines
function mapLines(cart) {
  const lines = cart.split("\n");
  const start = lines.indexOf("__map__");
  return lines.slice(start + 1, start + 33);
}

async function openEditor(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.stack || error.message));
  await page.goto("./editor.html");
  // Start from the map of the game, whatever a previous test left
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => window.editor);
  return errors;
}

// The page position of the center of a map tile
async function tilePosition(page, x, y) {
  return page.evaluate(
    ([x, y]) => {
      const view = window.editor.view;
      const box = view.canvas.getBoundingClientRect();
      return {
        x: box.left + ((x + 0.5) * 8 - view.offsetX) * view.zoom,
        y: box.top + ((y + 0.5) * 8 - view.offsetY) * view.zoom
      };
    },
    [x, y]
  );
}

async function tile(page, x, y) {
  return page.evaluate(([x, y]) => window.editor.level.get(x, y), [x, y]);
}

// Clicks a sprite of the tile sheet: the brush
async function chooseBrush(page, n) {
  const box = await page.locator("#sheet").boundingBox();
  await page.mouse.click(
    box.x + ((n % 16) + 0.5) * (box.width / 16),
    box.y + (Math.floor(n / 16) + 0.5) * (box.height / 16)
  );
}

test("shows the map of the game with no problems", async ({ page }) => {
  const errors = await openEditor(page);
  const map = await page.evaluate(() => window.editor.level.toCart());
  expect(map).toBe(ORIGINAL);
  await expect(page.locator("#problems li")).toHaveText(["None: the game can be played to the end"]);
  const entities = await page.evaluate(() => window.editor.level.entities().map((e) => e.tile));
  expect(entities.filter((t) => t === 64)).toHaveLength(1);
  expect(entities.filter((t) => t === 121)).toHaveLength(8);
  expect(errors).toEqual([]);
});

test("paints with the pencil and the rectangle, erases, undoes and redoes", async ({ page }) => {
  const errors = await openEditor(page);
  await page.evaluate(() => window.editor.view.showRoom(5, 1, 4));

  // A stroke over 3 tiles is one action
  const before = await tile(page, 42, 10);
  await chooseBrush(page, 1);
  const a = await tilePosition(page, 41, 10);
  const b = await tilePosition(page, 43, 10);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 4 });
  await page.mouse.up();
  expect([await tile(page, 41, 10), await tile(page, 42, 10), await tile(page, 43, 10)]).toEqual([1, 1, 1]);

  await page.keyboard.press("Control+z");
  expect(await tile(page, 42, 10)).toBe(before);
  await page.keyboard.press("Control+y");
  expect(await tile(page, 42, 10)).toBe(1);

  // A rectangle of 3x2 tiles
  await page.keyboard.press("r");
  const c = await tilePosition(page, 44, 9);
  const d = await tilePosition(page, 46, 10);
  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  await page.mouse.move(d.x, d.y, { steps: 3 });
  await page.mouse.up();
  for (let y = 9; y <= 10; y++) for (let x = 44; x <= 46; x++) expect(await tile(page, x, y)).toBe(1);

  // The eraser
  await page.keyboard.press("e");
  await page.mouse.click(a.x, a.y);
  expect(await tile(page, 41, 10)).toBe(0);

  // The picker takes the tile under the mouse as the brush
  await page.keyboard.press("i");
  const player = await tilePosition(page, 42, 13);
  await page.mouse.click(player.x, player.y);
  expect(await page.evaluate(() => window.editor.ui.brush)).toBe(64);
  expect(await page.evaluate(() => window.editor.ui.toolName)).toBe("pencil");
  expect(errors).toEqual([]);
});

test("saves the cartridge with the edited map and nothing else changed", async ({ page }) => {
  await openEditor(page);
  await page.evaluate(() => window.editor.level.apply([[3, 4, 7]]));

  const download = page.waitForEvent("download");
  await page.click("#save");
  const file = await (await download).path();
  const saved = fs.readFileSync(file, "utf8");

  const before = mapLines(ORIGINAL);
  const after = mapLines(saved);
  expect(after[4].substr(6, 2)).toBe("07");
  expect(after.filter((line, y) => line !== before[y])).toHaveLength(1);
  expect(saved.replace(mapLines(saved).join("\n"), "")).toBe(ORIGINAL.replace(before.join("\n"), ""));
});

test("keeps the map when the page is opened again", async ({ page }) => {
  await openEditor(page);
  await page.evaluate(() => {
    window.editor.level.apply([[3, 4, 7]]);
    window.editor.ui.changed();
  });
  await page.reload();
  await page.waitForFunction(() => window.editor);
  expect(await tile(page, 3, 4)).toBe(7);
});

test("reports what would not work in the game", async ({ page }) => {
  await openEditor(page);
  const start = await page.evaluate(() => window.editor.level.entities().find((e) => e.tile === 64));
  await page.evaluate(
    ([x, y]) => {
      window.editor.level.apply([
        [x, y, 0],
        [7, 2, 145]
      ]);
      window.editor.ui.changed();
    },
    [start.x, start.y]
  );
  await expect(page.locator("#problems li")).toHaveText([
    "No player start: the game can't start",
    "Upgrader in column 7 gives nothing (columns 5, 51, 66, 83, 125) (7,2)"
  ]);
});

test("plays the edited map from the selected tile and comes back", async ({ page }) => {
  const errors = await openEditor(page);
  await page.evaluate(() => window.editor.view.showRoom(5, 1, 4));

  // A mushroom next to the player, then play from the tile above it
  await page.evaluate(() => window.editor.level.apply([[40, 13, 88]]));
  await page.keyboard.press("e");
  const above = await tilePosition(page, 40, 10);
  await page.mouse.click(above.x, above.y);
  await page.keyboard.press("Shift+p");

  await expect(page.locator("#play-overlay")).toBeVisible();
  const game = page.frameLocator("#play-frame");
  await expect(game.locator("canvas")).toBeVisible();
  const frame = page.frame({ url: /index\.html\?play/ });
  await frame.waitForFunction(() => window.ascent && window.ascent.pico8.updateCount > 5);
  const state = await frame.evaluate(() => {
    const g = window.ascent.state();
    return {
      x: g.pl.x,
      intro: g.intro,
      mushrooms: g.entities.filter((e) => e.name === "mushroom" && e.x === 324).length
    };
  });
  expect(state).toEqual({ x: 324, intro: -32, mushrooms: 1 });

  await page.keyboard.press("Escape");
  await expect(page.locator("#play-overlay")).toBeHidden();
  expect(errors).toEqual([]);
});
