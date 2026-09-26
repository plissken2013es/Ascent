"use strict";

// Builds a web export of the PICO-8 cartridge with the test harness of
// harness.lua appended: fixed seed, scripted buttons and a printh() trace of
// each frame, which the web export writes to the browser console.
//
// Requires shrinko8 (pip install shrinko), like scripts/cart.js.

const fs = require("fs");
const path = require("path");
const { buildRom, injectCartdat, CART, EXPORT } = require("../../scripts/cart.js");

const ROOT = path.join(__dirname, "..", "..");
const HARNESS = fs.readFileSync(path.join(__dirname, "harness.lua"), "utf8");

// Lua code of a setup: { x, y, upgrades: ["grab", ...], lore } skips the title
// and starts at the given position (see setupPhaser() in trace.js)
function setupLua(setup) {
  if (!setup) {
    return "";
  }
  const code = ["intro=-32 pl.state=0 tips.woken_up=true"];
  code.push(`pl.x,pl.y=${setup.x},${setup.y}`);
  for (const upgrade of setup.upgrades || []) {
    code.push(`pl.upg_${upgrade}=true`);
  }
  if (setup.lore) {
    code.push(`pl.lore=${setup.lore}`);
  }
  code.push("set_cam(64*(pl.x\\64),64*(pl.y\\64)) swap_room(camtx\\64,camty\\64)");
  return code.join(" ");
}

// script: [[frames, buttons], ...], run-length encoded buttons
// dump: a frame to write the screen of (as "row" lines)
function harnessCart({ seed, script, last, dump = -1, setup }) {
  const cart = fs.readFileSync(CART, "utf8");
  const code = HARNESS.replace("$SEED", String(seed))
    .replace("$SCRIPT", script.flat().join(","))
    .replace("$LAST", String(last))
    .replace("$DUMP", String(dump))
    .replace("$SETUP", setupLua(setup));
  // The harness goes at the end of the code, before the data sections
  return cart.replace(/\n__gfx__\n/, "\n" + code + "\n__gfx__\n");
}

function harnessExport(options) {
  const rom = buildRom(harnessCart(options));
  return injectCartdat(fs.readFileSync(EXPORT, "utf8"), rom);
}

// A web export of a cartridge with the given Lua code (and the data of the
// game), to probe what PICO-8 itself does (e.g. how it draws a shape)
function probeExport(code) {
  const data = fs.readFileSync(CART, "utf8").replace(/^[\s\S]*?\n__gfx__\n/, "__gfx__\n");
  const cart = "pico-8 cartridge // http://www.pico-8.com\nversion 42\n__lua__\n" + code + "\n" + data;
  return injectCartdat(fs.readFileSync(EXPORT, "utf8"), buildRom(cart));
}

// Serves the PICO-8 web export from the repository under http://pico8.test/,
// with the harness build instead of the original cartridge
async function routePico8(page, exportSource) {
  await page.route("http://pico8.test/**", async (route) => {
    const url = new URL(route.request().url());
    const file = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    if (file === "js/ascent_1.1.js") {
      await route.fulfill({ body: exportSource, contentType: "text/javascript" });
      return;
    }
    const full = path.join(ROOT, file);
    if (!full.startsWith(ROOT) || !fs.existsSync(full)) {
      await route.fulfill({ status: 404, body: "" });
      return;
    }
    await route.fulfill({ path: full });
  });
}

// Parses the printh() lines of the harness
function parseTrace(lines) {
  const frames = [];
  const sounds = [];
  const rows = [];
  for (const line of lines) {
    const parts = line.trim().split(" ");
    if (parts[0] === "row") {
      rows[Number(parts[1])] = parts[2];
    } else if (parts[0] === "frame") {
      frames[Number(parts[1])] = { x: parts[2], y: parts[3], hash: parts[4], t: parts[5] };
    } else if (parts[0] === "sfx" || parts[0] === "music") {
      sounds.push(`${parts[0]} ${parts[1]} ${parts[2]}`);
    }
  }
  return { frames, sounds, rows };
}

module.exports = { harnessCart, harnessExport, probeExport, routePico8, parseTrace };
