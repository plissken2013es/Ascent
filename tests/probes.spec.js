"use strict";

// Runs the probe cartridges of pico8/probes in PICO-8 and checks that the
// Phaser version computes the same: shapes pixel by pixel, numbers bit by bit.

const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");
const { openGame, hasShrinko8 } = require("./helpers");
const { runProbe } = require("./pico8/run");

test.skip(!hasShrinko8(), "needs shrinko8 (pip install shrinko) to build the PICO-8 probe cartridges");

async function probe(browser, name) {
  const page = await browser.newPage();
  const code = fs.readFileSync(path.join(__dirname, "pico8", "probes", name), "utf8");
  const lines = await runProbe(page, code);
  await page.close();
  return lines;
}

test("ovalfill, circfill, line and fillp draw the same pixels as on PICO-8", async ({ browser }) => {
  const expected = (await probe(browser, "shapes.lua")).filter((line) => /^(ovalfill|circfill|line|fillp) /.test(line));

  const page = await browser.newPage();
  await openGame(page);
  const actual = await page.evaluate(() => {
    const gfx = window.ascent.gfx;
    const bits = (x0, y0, x1, y1) => {
      let s = "";
      for (let y = y0; y <= y1; y++) {
        s += " ";
        for (let x = x0; x <= x1; x++) s += gfx.pget(x, y) === 7 ? "1" : "0";
      }
      return s;
    };
    const lines = [];
    gfx.camera();
    gfx.pal();
    for (let w = 0; w <= 20; w++) {
      for (let h = 0; h <= 20; h++) {
        gfx.cls();
        gfx.ovalfill(10, 10, 10 + w, 10 + h, 7);
        lines.push(`ovalfill ${w} ${h}` + bits(9, 9, 11 + w, 11 + h));
      }
    }
    for (let r = 0; r <= 12; r++) {
      gfx.cls();
      gfx.circfill(20, 20, r, 7);
      lines.push(`circfill ${r}` + bits(19 - r, 19 - r, 21 + r, 21 + r));
    }
    for (let dx = -10; dx <= 10; dx++) {
      for (let dy = -10; dy <= 10; dy++) {
        gfx.cls();
        gfx.line(20, 20, 20 + dx, 20 + dy, 7);
        lines.push(`line ${dx} ${dy}` + bits(9, 9, 31, 31));
      }
    }
    gfx.cls();
    gfx.fillp(0b1010010110100101 + 0.5);
    gfx.rectfill(0, 0, 7, 7, 5);
    gfx.fillp(0b0111111111011111 + 0.5);
    gfx.rectfill(8, 0, 15, 7, 13);
    gfx.fillp(0b0101101001011010);
    gfx.rectfill(16, 0, 23, 7, 0x3b);
    gfx.fillp();
    let s = "fillp";
    for (let y = 0; y < 8; y++) {
      s += " ";
      for (let x = 0; x < 24; x++) s += gfx.pget(x, y).toString(16);
    }
    lines.push(s);
    return lines;
  });

  expect(actual.length).toBe(expected.length);
  const different = actual
    .filter((line, i) => line !== expected[i])
    .map((line) => line.split(" ").slice(0, 3).join(" "));
  expect(different).toEqual([]);
});

test("sin, cos, fixed point arithmetic and rnd give the same bits as on PICO-8", async ({ browser }) => {
  const expected = (await probe(browser, "numbers.lua")).filter((line) =>
    /^(sin|fx|fdiv|idiv|fmul|mod|rnd) /.test(line)
  );

  const page = await browser.newPage();
  await openGame(page);
  const actual = await page.evaluate(() => {
    const { sin, cos, fx, fdiv, idiv, fmul, mod, srand, rnd } = window.ascent.lib;
    // tostr(n, true) without "0x"
    const hex = (n) => {
      const h = (Math.floor(n * 65536) >>> 0).toString(16).padStart(8, "0");
      return `${h.slice(0, 4)}.${h.slice(4)}`;
    };
    const lines = [];
    for (let i = 0; i < 4096; i++) {
      const x = i / 4096 - 0.5;
      lines.push(`sin ${i} ${hex(sin(x))} ${hex(cos(x))}`);
    }
    const h = (...values) => values.map(hex).join(" ");
    lines.push("fx " + h(fx(0.35), fx(2.2), fx(0.075), -fx(0.02), fx(0.01)));
    lines.push("fdiv " + h(fdiv(-7, 3), fdiv(7, 3), fdiv(5 / 65536, 8), fdiv(-5 / 65536, 8), fdiv(1, 30)));
    lines.push("idiv " + h(idiv(-7, 3), idiv(7, 3), idiv(-5 / 65536, 8)));
    lines.push("fmul " + h(fmul(-3 / 65536, 0.5), fmul(3 / 65536, 0.5), fmul(0x1234 / 65536, 0x15678 / 65536)));
    lines.push("mod " + h(mod(-7, 3), mod(-0.5, 3), mod(7.25, 2)));
    srand(12);
    let s = "rnd";
    for (let i = 0; i < 50; i++) s += " " + hex(rnd());
    for (let i = 0; i < 50; i++) s += " " + hex(rnd(48));
    for (let i = 0; i < 50; i++) s += " " + hex(rnd(fx(0.3)));
    for (let i = 0; i < 50; i++) s += " " + rnd([1, 2, 3, 4, 5, 6, 7]);
    lines.push(s);
    return lines;
  });

  expect(actual.length).toBe(expected.length);
  const different = actual
    .map((line, i) => [line, expected[i]])
    .filter(([a, b]) => a !== b)
    .slice(0, 10);
  expect(different).toEqual([]);
});
