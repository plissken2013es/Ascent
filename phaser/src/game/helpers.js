// helpers

import { g } from "./state.js";
import { max, min, sgn, fx } from "../pico8/lib.js";
import { mget, pal, print } from "../pico8/gfx.js";
import { flip } from "../pico8/system.js";

export function _mget(x, y) {
  if (y < 0 || y > 31) return 0;
  return mget(x, y);
}

// Fields set to undefined are skipped: they don't exist in a Lua table
export function add_params(src, dst) {
  for (const [k, v] of Object.entries(src)) {
    if (v !== undefined) {
      dst[k] = v;
    }
  }
}

export function ssgn(x) {
  if (x === 0) return 0;
  return sgn(x);
}

export function aabb(e1, e2) {
  if (e1.x + e1.w / 2 < e2.x - e2.w / 2) return false;
  if (e2.x + e2.w / 2 < e1.x - e1.w / 2) return false;
  if (e1.y + e1.h / 2 < e2.y - e2.h / 2) return false;
  if (e2.y + e2.h / 2 < e1.y - e1.h / 2) return false;
  return true;
}

export function prc(str, x, y, c1, c2) {
  pr(str, x - tlen(str)[0] / 2, y, c1, c2);
}

// Prints with the kerning of the custom font: "\n" starts a new line, "&"
// switches to white and "#" to grey without shadow
export function pr(str, x, y, c1, c2) {
  let x0 = x;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === "\n") {
      x0 = x;
      y += 6;
    } else if (char === "&") {
      c1 = 7;
    } else if (char === "#") {
      c1 = 13;
      c2 = undefined;
    } else {
      if (c2 !== undefined) {
        print(char, x0, y + 1, c2);
      }
      print(char, x0, y, c1);
      x0 += 4;
      if (g.kerning[char] !== undefined) {
        x0 -= g.kerning[char];
      }
    }
  }
}

// Returns the width and the number of lines of a text
export function tlen(str) {
  let len = 0;
  let max_len = 0;
  let lines = 1;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === "\n") {
      if (len > max_len) {
        max_len = len;
        len = 0;
        lines += 1;
      }
    } else if (c === "#" || c === "&") {
      // do nothing
    } else {
      len += 4;
      if (g.kerning[c] !== undefined) {
        len -= g.kerning[c];
      }
    }
  }

  return [max(max_len, len), lines];
}

export function reset_pal() {
  pal();
  pal(14, 131, 1);
  pal(15, 139, 1);
}

export function decrease(e, p) {
  if (e[p] > 0) {
    e[p] -= 1;
  }
}

export function update_fade() {
  for (let i = 0; i <= 15; i++) {
    let col = i;
    const k = 6 * g.fade_progress;
    for (let j = 1; j <= k; j++) {
      col = g.fade_pal[col];
    }
    if (col === 14) col = 131;
    if (col === 15) col = 139;

    pal(i, col, 1);
  }
}

export function fadeout() {
  while (g.fade_progress < 1) {
    g.fade_progress = min(g.fade_progress + fx(0.05), 1);
    update_fade();
    flip();
  }
}
