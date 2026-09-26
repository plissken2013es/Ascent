#!/usr/bin/env node
"use strict";

// Converts between the editable PICO-8 cartridge (src/ascent.p8) and the
// cartridge data (_cartdat) embedded in the web export (js/ascent_1.1.js).
//
// Requires shrinko8 (https://github.com/thisismypassport/shrinko8):
//   pip install shrinko
// Set SHRINKO8 to use a different executable (e.g. "python3 /path/to/shrinko8.py").
//
// Usage:
//   node scripts/cart.js extract   js/ascent_1.1.js -> src/ascent.p8
//   node scripts/cart.js build     src/ascent.p8    -> js/ascent_1.1.js (_cartdat)

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const CART = path.join(ROOT, "src", "ascent.p8");
const EXPORT = path.join(ROOT, "js", "ascent_1.1.js");
const ROM_SIZE = 0x8000;
const BYTES_PER_LINE = 256;
const CARTDAT = /(var _cartdat=\[\n)([\s\S]*?)(\];)/;

function shrinko8(...args) {
  const [cmd, ...cmdArgs] = (process.env.SHRINKO8 || "shrinko8").split(" ");
  const result = spawnSync(cmd, [...cmdArgs, ...args], { stdio: "inherit" });
  if (result.error) {
    if (result.error.code === "ENOENT") {
      fail(`'${cmd}' not found. Install it with 'pip install shrinko' or set SHRINKO8.`);
    }
    throw result.error;
  }
  if (result.status !== 0) {
    fail(`shrinko8 exited with code ${result.status}`);
  }
}

function fail(message) {
  throw new Error(message);
}

// Compiles a .p8 cartridge (text) to its 32 KB ROM
function buildRom(cartText) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ascent-"));
  try {
    const cartFile = path.join(dir, "cart.p8");
    const romFile = path.join(dir, "cart.rom");
    fs.writeFileSync(cartFile, cartText);
    shrinko8(cartFile, romFile, "-F", "p8", "-f", "rom");
    const rom = fs.readFileSync(romFile);
    if (rom.length !== ROM_SIZE) {
      fail(`Unexpected ROM size ${rom.length} (expected ${ROM_SIZE})`);
    }
    return rom;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Replaces the cartridge data of the web export source with a ROM
function injectCartdat(exportSource, rom) {
  if (!CARTDAT.test(exportSource)) {
    fail("_cartdat not found in the web export");
  }
  const lines = [];
  for (let i = 0; i < rom.length; i += BYTES_PER_LINE) {
    lines.push(Array.from(rom.subarray(i, i + BYTES_PER_LINE)).join(","));
  }
  return exportSource.replace(CARTDAT, (_, start, data, end) => start + lines.join(",\n") + end);
}

function extract() {
  shrinko8(EXPORT, CART, "-F", "js", "-f", "p8");
  console.log(`Extracted ${path.relative(ROOT, EXPORT)} -> ${path.relative(ROOT, CART)}`);
}

function build() {
  const rom = buildRom(fs.readFileSync(CART, "utf8"));
  fs.writeFileSync(EXPORT, injectCartdat(fs.readFileSync(EXPORT, "utf8"), rom));
  console.log(`Built ${path.relative(ROOT, CART)} -> ${path.relative(ROOT, EXPORT)}`);
}

module.exports = { buildRom, injectCartdat, CART, EXPORT };

if (require.main === module) {
  const commands = { extract, build };
  try {
    const command = commands[process.argv[2]];
    if (!command) {
      fail(`Usage: node scripts/cart.js <${Object.keys(commands).join("|")}>`);
    }
    command();
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exitCode = 1;
  }
}
