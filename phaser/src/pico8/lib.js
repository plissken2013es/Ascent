// PICO-8 math, random numbers, strings and tables, with PICO-8 semantics where
// they differ from JavaScript.

import { SIN_TABLE } from "./sintable.js";

// PICO-8 numbers are 16:16 fixed point. Fractional literals are truncated to a
// multiple of 1/65536 (0.35 is 0x0.5999), which also keeps additions exact.
export function fx(n) {
  return Math.floor(n * 65536) / 65536;
}

// Fixed point multiplication and division, which drop the bits below 1/65536
// (exact for the magnitudes used by the game)
export function fmul(a, b) {
  return Math.floor(a * b * 65536) / 65536;
}

export function fdiv(a, b) {
  return Math.trunc((a / b) * 65536) / 65536;
}

// Wraps an integer to the signed 16-bit range of PICO-8 numbers
export function wrap16(n) {
  return ((((n + 32768) % 65536) + 65536) % 65536) - 32768;
}

export const flr = Math.floor;
export const abs = Math.abs;
export const min = Math.min;
export const max = Math.max;

export function ceil(x) {
  return -Math.floor(-x);
}

// sgn(0) is 1 on PICO-8
export function sgn(x) {
  return x < 0 ? -1 : 1;
}

export function mid(x, y, z) {
  return Math.max(Math.min(x, y), Math.min(Math.max(x, y), z));
}

// Angles are in turns and the y axis points down. Computed from a table
// measured from PICO-8, like z8lua does, to get the same bits:
//  - sin(x) = -sin(x + 0.5)
//  - sin(x) equals sin(~x) rather than sin(-x)
//  - the last two bits are rounded
const SIN = new Int32Array(4097);
for (let i = 0; i <= 4096; i++) {
  SIN[i] = (i << 4) + parseInt(SIN_TABLE.substr(i * 4, 4), 16);
}

function sinBits(x) {
  const bits = Math.floor(x * 65536) | 0;
  const a = ((bits & 0x4000 ? ~bits : bits) & 0x3fff) + 2;
  const ret = SIN[a >> 2];
  return (bits & 0x8000 ? ret : -ret) / 65536;
}

export function sin(x) {
  return sinBits(x);
}

export function cos(x) {
  return sinBits(x - 0.25);
}

// Integer division: the floor of the (truncated) fixed point division
export function idiv(a, b) {
  return Math.floor(fdiv(a, b));
}

export function mod(a, b) {
  return a - Math.floor(a / b) * b;
}

//
// Random numbers: the PICO-8 generator, so a given seed gives the same
// sequence as on PICO-8 (see zepto8)
//

const prng = { a: 0, b: 0 };

function updatePrng() {
  prng.a = ((((prng.a >>> 16) | (prng.a << 16)) >>> 0) + prng.b) >>> 0;
  prng.b = (prng.b + prng.a) >>> 0;
}

export function srand(seed = 0) {
  const bits = (Math.round(seed * 65536) & 0x7fffffff) >>> 0;
  prng.b = bits ? bits : 0xdeadbeef;
  prng.a = (prng.b ^ 0xbead29ba) >>> 0;
  for (let i = 0; i < 32; i++) {
    updatePrng();
  }
}

srand(Math.floor(Math.random() * 0x7fff0000) / 65536);

// rnd(n): 0 <= x < n, rnd(): 0 <= x < 1, rnd(table): a random element
export function rnd(range = 1) {
  // A table element is picked from other bits than rnd(#t) (measured from
  // PICO-8, see tests/pico8/probes/numbers.lua)
  if (Array.isArray(range)) {
    if (!range.length) {
      return undefined;
    }
    updatePrng();
    return range[Math.floor((prng.a % (range.length * 256)) / 256)];
  }
  const bits = Math.round(range * 65536) >>> 0;
  if (bits === 0) {
    return 0;
  }
  updatePrng();
  return (prng.a % bits) / 65536;
}

//
// Tables
//

export function add(t, v) {
  t.push(v);
  return v;
}

export function del(t, v) {
  const i = t.indexOf(v);
  if (i >= 0) {
    t.splice(i, 1);
    return v;
  }
  return undefined;
}

// Iterates like PICO-8's all(): the current element may be deleted during the
// iteration without skipping the next one, and appended elements are visited
export function* all(t) {
  let i = 0;
  let prev;
  if (!t) {
    return;
  }
  for (;;) {
    if (i < t.length && t[i] === prev) {
      i++;
    }
    prev = t[i];
    if (prev === undefined) {
      return;
    }
    yield prev;
  }
}

//
// Strings
//

// Splits a string, converting the parts that are numbers
export function split(str, sep = ",", convert = true) {
  return str.split(sep).map((part) => {
    if (convert && part !== "" && part.trim() === part && !isNaN(Number(part))) {
      return Number(part);
    }
    return part;
  });
}
