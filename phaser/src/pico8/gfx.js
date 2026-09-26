// PICO-8 graphics: a 128x128 screen of palette indices and the drawing
// functions used by the game. The rasterization follows zepto8, a PICO-8
// emulator whose drawing matches PICO-8 closely.

import { flr } from "./lib.js";

// The 16 colors, then the 16 "secret" colors (128-143 in the screen palette)
export const RGB = [
  0x000000, 0x1d2b53, 0x7e2553, 0x008751, 0xab5236, 0x5f574f, 0xc2c3c7, 0xfff1e8, 0xff004d, 0xffa300, 0xffec27,
  0x00e436, 0x29adff, 0x83769c, 0xff77a8, 0xffccaa, 0x291814, 0x111d35, 0x422136, 0x125359, 0x742f29, 0x49333b,
  0xa28879, 0xf3ef7d, 0xbe1250, 0xff6c24, 0xa8e72e, 0x00b543, 0x065ab5, 0x754665, 0xff6e59, 0xff9d81
];

export const screen = new Uint8Array(128 * 128);

// Sprite sheet, map and sprite flags of the cartridge
let gfx = new Uint8Array(128 * 128);
let tiles = new Uint8Array(128 * 32);
let flags = new Uint8Array(256);

// Memory used for the custom font (0x5600-0x5dff) and draw state settings
const fontMemory = new Uint8Array(0x800);
let printAttributes = 0; // 0x5f58
let screenMode = 0; // 0x5f2c

const ds = {
  cameraX: 0,
  cameraY: 0,
  clipX1: 0,
  clipY1: 0,
  clipX2: 128,
  clipY2: 128,
  pen: 6,
  // bit 0x10 marks a transparent color
  drawPalette: new Uint8Array(16),
  screenPalette: new Uint8Array(16),
  fillPattern: 0,
  fillTransparent: false
};

export function loadGfx(cart) {
  gfx = cart.gfx;
  flags = cart.flags;
  tiles = cart.map.slice();
}

// Resets the state of the drawing functions, like at the start of a cartridge
export function resetDrawState() {
  ds.cameraX = ds.cameraY = 0;
  ds.pen = 6;
  clip();
  pal();
  fontMemory.fill(0);
  printAttributes = 0;
  screenMode = 0;
  screen.fill(0);
}

//
// Pixels
//

function setPixel(x, y, color, color2, pattern, transparent) {
  if (x < ds.clipX1 || x >= ds.clipX2 || y < ds.clipY1 || y >= ds.clipY2) {
    return;
  }
  // The fill pattern is aligned to the screen, bit 15 is the top left pixel
  if (pattern && (pattern >> (15 - (x & 3) - 4 * (y & 3))) & 1) {
    if (transparent) {
      return;
    }
    color = color2;
  }
  screen[y * 128 + x] = color;
}

// Selects the pen color (when given) and returns the colors to draw with
function colors(c) {
  if (c !== undefined) {
    ds.pen = flr(c) & 0xff;
  }
  return {
    color: ds.drawPalette[ds.pen & 0xf] & 0xf,
    color2: ds.drawPalette[(ds.pen >> 4) & 0xf] & 0xf,
    pattern: ds.fillPattern,
    transparent: ds.fillTransparent
  };
}

function hline(x1, x2, y, c) {
  if (y < ds.clipY1 || y >= ds.clipY2) {
    return;
  }
  if (x1 > x2) {
    [x1, x2] = [x2, x1];
  }
  x1 = Math.max(x1, ds.clipX1);
  x2 = Math.min(x2, ds.clipX2 - 1);
  for (let x = x1; x <= x2; x++) {
    setPixel(x, y, c.color, c.color2, c.pattern, c.transparent);
  }
}

function vline(x, y1, y2, c) {
  if (x < ds.clipX1 || x >= ds.clipX2) {
    return;
  }
  if (y1 > y2) {
    [y1, y2] = [y2, y1];
  }
  y1 = Math.max(y1, ds.clipY1);
  y2 = Math.min(y2, ds.clipY2 - 1);
  for (let y = y1; y <= y2; y++) {
    setPixel(x, y, c.color, c.color2, c.pattern, c.transparent);
  }
}

//
// Draw state
//

export function camera(x = 0, y = 0) {
  ds.cameraX = flr(x);
  ds.cameraY = flr(y);
}

export function clip(x, y, w, h) {
  if (h === undefined) {
    ds.clipX1 = ds.clipY1 = 0;
    ds.clipX2 = ds.clipY2 = 128;
    return;
  }
  [x, y, w, h] = [flr(x), flr(y), flr(w), flr(h)];
  ds.clipX1 = Math.min(Math.max(0, x), 128);
  ds.clipY1 = Math.min(Math.max(0, y), 128);
  ds.clipX2 = Math.max(0, Math.min(128, x + Math.max(w, 0)));
  ds.clipY2 = Math.max(0, Math.min(128, y + Math.max(h, 0)));
}

// pal(): resets the palettes, pal(c0, c1): draw palette, pal(c0, c1, 1):
// screen palette (c1 may be one of the secret colors 128-143)
export function pal(c0, c1, p = 0) {
  if (c0 === undefined || c1 === undefined) {
    for (let i = 0; i < 16; i++) {
      ds.drawPalette[i] = i | (i ? 0 : 0x10);
      ds.screenPalette[i] = i;
    }
    ds.fillPattern = 0;
    ds.fillTransparent = false;
    return;
  }
  const i = flr(c0) & 0xf;
  if (p === 1) {
    ds.screenPalette[i] = flr(c1) & 0xff;
  } else {
    ds.drawPalette[i] = (ds.drawPalette[i] & 0x10) | (flr(c1) & 0xf);
  }
}

export function palt(c, t) {
  const i = flr(c) & 0xf;
  ds.drawPalette[i] = (ds.drawPalette[i] & 0xf) | (t ? 0x10 : 0);
}

// The integer part is the 4x4 pattern, the 0.5 bit makes its set bits
// transparent (0b0101101001011010.1 in PICO-8 syntax)
export function fillp(p = 0) {
  ds.fillPattern = flr(p) & 0xffff;
  ds.fillTransparent = (flr(p * 2) & 1) === 1;
}

export function cls(c = 0) {
  screen.fill(flr(c) & 0xf);
  clip();
}

//
// Shapes
//

export function pset(x, y, c) {
  const col = colors(c);
  setPixel(flr(x) - ds.cameraX, flr(y) - ds.cameraY, col.color, col.color2, col.pattern, col.transparent);
}

export function pget(x, y) {
  x = flr(x) - ds.cameraX;
  y = flr(y) - ds.cameraY;
  if (x < ds.clipX1 || x >= ds.clipX2 || y < ds.clipY1 || y >= ds.clipY2) {
    return 0;
  }
  return screen[y * 128 + x];
}

// Steps along the major axis from the lower end, with the slope in 16:16 fixed
// point (rounded down for mostly horizontal lines, towards zero for mostly
// vertical ones). Matches PICO-8 for all lines within 10 pixels (see tests/).
export function line(x0, y0, x1, y1, c) {
  const col = colors(c);
  x0 = flr(x0) - ds.cameraX;
  y0 = flr(y0) - ds.cameraY;
  x1 = flr(x1) - ds.cameraX;
  y1 = flr(y1) - ds.cameraY;

  const plot = (x, y) => setPixel(x, y, col.color, col.color2, col.pattern, col.transparent);
  if (Math.abs(x1 - x0) >= Math.abs(y1 - y0)) {
    if (x0 > x1) {
      [x0, y0, x1, y1] = [x1, y1, x0, y0];
    }
    const n = x1 - x0;
    const slope = n ? Math.floor(((y1 - y0) / n) * 65536) / 65536 : 0;
    // only the part that can be on the screen
    for (let k = Math.max(0, -1 - x0); k <= Math.min(n, 128 - x0); k++) {
      plot(x0 + k, Math.floor(y0 + slope * k + 0.5));
    }
  } else {
    if (y0 > y1) {
      [x0, y0, x1, y1] = [x1, y1, x0, y0];
    }
    const n = y1 - y0;
    const slope = Math.trunc(((x1 - x0) / n) * 65536) / 65536;
    for (let k = Math.max(0, -1 - y0); k <= Math.min(n, 128 - y0); k++) {
      plot(Math.floor(x0 + slope * k + 0.5), y0 + k);
    }
  }
}

export function rect(x0, y0, x1, y1, c) {
  x0 = flr(x0) - ds.cameraX;
  y0 = flr(y0) - ds.cameraY;
  x1 = flr(x1) - ds.cameraX;
  y1 = flr(y1) - ds.cameraY;
  if (x0 > x1) {
    [x0, x1] = [x1, x0];
  }
  if (y0 > y1) {
    [y0, y1] = [y1, y0];
  }
  if (x1 < 0 || x0 >= 128 || y1 < 0 || y0 >= 128) {
    return;
  }
  const col = colors(c);
  hline(x0, x1, y0, col);
  hline(x0, x1, y1, col);
  if (y0 + 1 < y1) {
    vline(x0, y0 + 1, y1 - 1, col);
    vline(x1, y0 + 1, y1 - 1, col);
  }
}

export function rectfill(x0, y0, x1, y1, c) {
  x0 = flr(x0) - ds.cameraX;
  y0 = flr(y0) - ds.cameraY;
  x1 = flr(x1) - ds.cameraX;
  y1 = flr(y1) - ds.cameraY;
  if (y0 > y1) {
    [y0, y1] = [y1, y0];
  }
  if (x0 > x1 ? x0 < 0 || x1 >= 128 : x1 < 0 || x0 >= 128) {
    return;
  }
  y0 = Math.max(y0, -1);
  y1 = Math.min(y1, 128);
  const col = colors(c);
  for (let y = y0; y <= y1; y++) {
    hline(x0, x1, y, col);
  }
}

export function circfill(x, y, r, c) {
  x = flr(x) - ds.cameraX;
  y = flr(y) - ds.cameraY;
  r = flr(r);
  if (x + r < 0 || x - r >= 128 || y + r < 0 || y - r >= 128) {
    return;
  }
  const col = colors(c);
  for (let dx = r, dy = 0, err = 0; dx >= dy;) {
    hline(x - dx, x + dx, y - dy, col);
    hline(x - dx, x + dx, y + dy, col);
    hline(x - dy, x + dy, y - dx, col);
    hline(x - dy, x + dy, y + dx, col);
    dy += 1;
    if (err < r - 1) {
      err += 1 + 2 * dy;
    } else {
      dx -= 1;
      err += 1 + 2 * (dy - dx);
    }
  }
}

// PICO-8 draws an ellipse of integer radii (half the size, rounded down) with a
// midpoint algorithm, and doubles its middle column (row) when the width
// (height) is even. Matches PICO-8 for all sizes up to 21x21 (see tests/).
function ovalHalfWidths(rx, ry) {
  // hw[dy]: half width of the row at dy from the center
  const hw = new Array(ry + 1).fill(0);
  const set = (wx, wy) => {
    if (wy >= 0 && wy <= ry && wx > hw[wy]) hw[wy] = wx;
  };
  const asq = rx * rx;
  const bsq = ry * ry;

  let wx = 0;
  let wy = ry;
  let xa = 0;
  let ya = asq * 2 * ry;
  let thresh = Math.trunc(asq / 4) - asq * ry;
  for (;;) {
    thresh += xa + bsq;
    if (thresh >= 0) {
      ya -= asq * 2;
      thresh -= ya;
      wy--;
    }
    xa += bsq * 2;
    wx++;
    if (xa >= ya) break;
    set(wx, wy);
  }

  set(rx, 0);
  wx = rx;
  wy = 0;
  xa = bsq * 2 * rx;
  ya = 0;
  thresh = Math.trunc(bsq / 4) - bsq * rx;
  for (;;) {
    thresh += ya + asq;
    if (thresh >= 0) {
      xa -= bsq * 2;
      thresh -= xa;
      wx--;
    }
    ya += asq * 2;
    wy++;
    if (ya > xa || (ya === 0 && xa === 0)) break;
    set(wx, wy);
  }
  return hw;
}

export function ovalfill(x0, y0, x1, y1, c) {
  x0 = flr(x0) - ds.cameraX;
  y0 = flr(y0) - ds.cameraY;
  x1 = flr(x1) - ds.cameraX;
  y1 = flr(y1) - ds.cameraY;
  if (x0 > x1) {
    [x0, x1] = [x1, x0];
  }
  if (y0 > y1) {
    [y0, y1] = [y1, y0];
  }
  if (x1 < 0 || x0 >= 128 || y1 < 0 || y0 >= 128) {
    return;
  }
  const col = colors(c);

  const rx = (x1 - x0) >> 1;
  const ry = (y1 - y0) >> 1;
  const ex = (x1 - x0) & 1;
  const ey = (y1 - y0) & 1;
  const hw = ovalHalfWidths(rx, ry);
  for (let dy = 0; dy <= ry; dy++) {
    const left = x0 + rx - hw[dy];
    const right = x0 + rx + ex + hw[dy];
    hline(left, right, y0 + ry - dy, col);
    if (dy > 0 || ey) {
      hline(left, right, y0 + ry + ey + dy, col);
    }
  }
}

//
// Sprites and map
//

export function spr(n, x, y, w = 1, h = 1, flipX = false, flipY = false) {
  n = flr(n);
  x = flr(x) - ds.cameraX;
  y = flr(y) - ds.cameraY;
  const w8 = flr(w * 8);
  const h8 = flr(h * 8);
  if (x + w8 <= 0 || x >= 128 || y + h8 <= 0 || y >= 128) {
    return;
  }
  const sx = (n % 16) * 8;
  const sy = flr(n / 16) * 8;
  for (let j = 0; j < h8; j++) {
    for (let i = 0; i < w8; i++) {
      const di = flipX ? w8 - 1 - i : i;
      const dj = flipY ? h8 - 1 - j : j;
      const gx = sx + di;
      const gy = sy + dj;
      const col = gx >= 0 && gx < 128 && gy >= 0 && gy < 128 ? gfx[gy * 128 + gx] : 0;
      const mapped = ds.drawPalette[col];
      if ((mapped & 0x10) === 0) {
        setPixel(x + i, y + j, mapped & 0xf, 0, 0, false);
      }
    }
  }
}

// map() draws the whole 128x32 map at 0,0
export function map(celX = 0, celY = 0, sx = 0, sy = 0, celW = 128, celH = 32, layer = 0) {
  sx = flr(sx) - ds.cameraX;
  sy = flr(sy) - ds.cameraY;
  let srcW = flr(celW) * 8;
  let srcH = flr(celH) * 8;
  let srcX = flr(celX) * 8;
  let srcY = flr(celY) * 8;

  // Clamp to the screen
  const mx = Math.max(-sx, 0);
  const my = Math.max(-sy, 0);
  srcX += mx;
  srcY += my;
  srcW -= mx + Math.max(srcW + sx - 128, 0);
  srcH -= my + Math.max(srcH + sy - 128, 0);
  sx += mx;
  sy += my;
  if (srcW <= 0 || srcH <= 0) {
    return;
  }

  for (let dy = 0; dy < srcH; dy++) {
    for (let dx = 0; dx < srcW; dx++) {
      const cx = srcX + dx;
      const cy = srcY + dy;
      if (cx < 0 || cx >= 128 * 8 || cy < 0 || cy >= 32 * 8) {
        continue;
      }
      const sprite = tiles[(cy >> 3) * 128 + (cx >> 3)];
      if (sprite === 0 || (layer && !(flags[sprite] & layer))) {
        continue;
      }
      const col = gfx[((sprite >> 4) * 8 + (cy & 7)) * 128 + (sprite & 15) * 8 + (cx & 7)];
      const mapped = ds.drawPalette[col];
      if ((mapped & 0x10) === 0) {
        setPixel(sx + dx, sy + dy, mapped & 0xf, 0, 0, false);
      }
    }
  }
}

export function mget(x, y) {
  x = flr(x);
  y = flr(y);
  if (x < 0 || x >= 128 || y < 0 || y >= 32) {
    return 0;
  }
  return tiles[y * 128 + x];
}

export function mset(x, y, n) {
  x = flr(x);
  y = flr(y);
  if (x < 0 || x >= 128 || y < 0 || y >= 32) {
    return;
  }
  tiles[y * 128 + x] = flr(n) & 0xff;
}

// fget(n): all flags, fget(n, f): flag f
export function fget(n, f) {
  n = flr(n);
  const bits = n >= 0 && n < 256 ? flags[n] : 0;
  if (f === undefined) {
    return bits;
  }
  return ((bits >> flr(f)) & 1) === 1;
}

//
// Text (only the custom font mode that the game uses)
//

export function print(str, x, y, c) {
  const col = colors(c);
  str = String(str);
  if ((printAttributes & 0x81) !== 0x81) {
    return;
  }
  const width = fontMemory[0];
  const extWidth = fontMemory[1];
  const height = Math.min(fontMemory[2], 8);
  let cx = flr(x) - ds.cameraX + fontMemory[3];
  const cy = flr(y) - ds.cameraY + fontMemory[4];
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i) & 0xff;
    const w = ch < 0x80 ? width : extWidth;
    for (let dy = 0; dy < height; dy++) {
      const row = fontMemory[ch * 8 + dy];
      for (let dx = 0; dx < w; dx++) {
        if ((row >> dx) & 1) {
          // Text ignores the fill pattern
          setPixel(cx + dx, cy + dy, col.color, 0, 0, false);
        }
      }
    }
    cx += w;
  }
}

//
// Memory mapped settings (only the addresses that the game uses)
//

export function poke(address, ...values) {
  values.forEach((value, i) => {
    const a = address + i;
    if (a >= 0x5600 && a < 0x5e00) {
      fontMemory[a - 0x5600] = value;
    } else if (a === 0x5f58) {
      printAttributes = value;
    } else if (a === 0x5f2c) {
      screenMode = value;
    }
    // 0x5f2e (keep the palette at exit) has no effect here
  });
}

//
// Display
//

// Converts the visible part of the screen to RGBA using the screen palette,
// or the given one. Returns the size of the displayed image.
export function displaySize() {
  return screenMode === 3 ? 64 : 128;
}

export function render(rgba, palette = ds.screenPalette) {
  const size = displaySize();
  let o = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const p = palette[screen[y * 128 + x]];
      const rgb = RGB[(p & 0xf) | (p & 0x80 ? 16 : 0)];
      rgba[o++] = rgb >> 16;
      rgba[o++] = (rgb >> 8) & 0xff;
      rgba[o++] = rgb & 0xff;
      rgba[o++] = 255;
    }
  }
}

export function screenPalette() {
  return ds.screenPalette.slice();
}
