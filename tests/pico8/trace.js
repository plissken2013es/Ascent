"use strict";

// The trace of harness.lua, produced by the Phaser version: runs in the page
// (window.ascent, started with ?test&seed=n) with the same scripted buttons.

function phaserTrace({ script, last, dump = -1, setup }) {
  const { pico8, gfx, audioLog, state } = window.ascent;

  // The same setup as setupLua() in harness.js
  if (setup) {
    const g = state();
    g.intro = -32;
    g.pl.state = 0;
    g.tips.woken_up = true;
    g.pl.x = setup.x;
    g.pl.y = setup.y;
    for (const upgrade of setup.upgrades || []) {
      g.pl["upg_" + upgrade] = true;
    }
    if (setup.lore) {
      g.pl.lore = setup.lore;
    }
    pico8.program.set_cam(64 * Math.floor(g.pl.x / 64), 64 * Math.floor(g.pl.y / 64));
    pico8.program.swap_room(Math.floor(g.camtx / 64), Math.floor(g.camty / 64));
  }

  // tostr(n, true): the 16:16 bits in hexadecimal
  const hex = (n) => {
    const bits = Math.round(n * 65536) >>> 0;
    const h = bits.toString(16).padStart(8, "0");
    return `0x${h.slice(0, 4)}.${h.slice(4)}`;
  };
  const rotl = (v, n) => ((v << n) | (v >>> (32 - n))) >>> 0;

  // The hash of harness.lua: peek4() of the visible 64x64 pixels (2 pixels
  // per byte, low nibble first) and of the screen palette
  const screenHash = () => {
    const screen = gfx.screen;
    const palette = gfx.screenPalette();
    let h = 0;
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x += 8) {
        let v = 0;
        for (let k = 0; k < 4; k++) {
          const byte = screen[y * 128 + x + 2 * k] | (screen[y * 128 + x + 2 * k + 1] << 4);
          v |= byte << (8 * k);
        }
        h = rotl((h ^ v) >>> 0, 3);
      }
    }
    for (let a = 0; a < 16; a += 4) {
      const v = palette[a] | (palette[a + 1] << 8) | (palette[a + 2] << 16) | (palette[a + 3] << 24);
      h = rotl((h ^ v) >>> 0, 3);
    }
    return hex(h / 65536);
  };

  // The screen as harness.lua dumps it: 2 hex digits per byte (high nibble first)
  const dumpScreen = () => {
    const rows = [];
    for (let y = 0; y < 64; y++) {
      let s = "";
      for (let x = 0; x < 64; x += 2) {
        s += gfx.screen[y * 128 + x + 1].toString(16) + gfx.screen[y * 128 + x].toString(16);
      }
      rows.push(s);
    }
    return rows;
  };

  const frames = [];
  const sounds = [];
  let rows = [];
  let index = 0;
  let left = 0;
  let buttons = 0;
  const nextButtons = () => {
    if (left <= 0) {
      const entry = script[index++];
      left = entry ? entry[0] : 32767;
      buttons = entry ? entry[1] : 0;
    }
    left--;
    return buttons;
  };

  const start = pico8.updateCount;
  while (pico8.updateCount - start < last || !pico8.nextIsUpdate()) {
    const b = pico8.nextIsUpdate() ? nextButtons() : 0;
    const draws = pico8.drawCount;
    const logged = audioLog().length;
    pico8.frame(b);
    const f = pico8.updateCount - start;
    for (const [type, n] of audioLog().slice(logged)) {
      sounds.push(`${type} ${f} ${n}`);
    }
    if (pico8.drawCount > draws) {
      const pl = state().pl;
      frames[f] = { x: hex(pl.x), y: hex(pl.y), hash: screenHash(), t: hex(window.ascent.t()) };
      if (f === dump) {
        rows = dumpScreen();
      }
    }
  }
  window.ascent.scene.present();
  return { frames, sounds, rows };
}

module.exports = { phaserTrace };
