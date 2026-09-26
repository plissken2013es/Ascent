"use strict";

// Records the sound of PICO-8 (the web export) playing each sound effect of
// the game and 20 seconds of music, and compares it with the synthesizer of
// the Phaser version: duration, volume envelope and spectrum.
//
// The synthesizer is a port of zepto8's, not a copy of PICO-8's, so the sound
// is not identical: the thresholds below are what it achieves.

const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");
const { openGame, hasShrinko8 } = require("./helpers");
const { captureAudio } = require("./pico8/run");

test.skip(!hasShrinko8(), "needs shrinko8 (pip install shrinko) to build the PICO-8 probe cartridge");

const SFX = [51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63];

// Known differences: 51 is noise (random, and PICO-8's noise is louder at low
// pitches), 60 and 62 start with noise, and the notes of 63 fade in from
// silence on PICO-8 instead of from the previous note
const LOOSE = {
  51: { envelope: -1, level: [0.7, 1.4], spectrum: 0.65, duration: 300 },
  60: { envelope: 0.9, level: [0.7, 1.2] },
  62: { level: [0.7, 1.2] },
  63: { envelope: 0.8, level: [0.8, 1.35] }
};

function onset(samples, threshold = 0.01) {
  return samples.findIndex((v) => Math.abs(v) > threshold);
}

// RMS in windows of 10 ms
function envelope(samples, rate) {
  const w = Math.round(rate / 100);
  const result = [];
  for (let i = 0; i + w <= samples.length; i += w) {
    let sum = 0;
    for (let j = i; j < i + w; j++) sum += samples[j] * samples[j];
    result.push(Math.sqrt(sum / w));
  }
  return result;
}

function correlation(a, b) {
  const n = Math.min(a.length, b.length);
  const mean = (x) => x.slice(0, n).reduce((s, v) => s + v, 0) / n;
  const ma = mean(a);
  const mb = mean(b);
  let ab = 0;
  let aa = 0;
  let bb = 0;
  for (let i = 0; i < n; i++) {
    ab += (a[i] - ma) * (b[i] - mb);
    aa += (a[i] - ma) ** 2;
    bb += (b[i] - mb) ** 2;
  }
  return ab / Math.sqrt(aa * bb);
}

// Magnitudes of the spectrum of a window of 2048 samples (radix 2 FFT)
function spectrum(samples) {
  const n = 2048;
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  for (let i = 0; i < n; i++) re[i] = (samples[i] || 0) * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / n));
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const angle = (-2 * Math.PI) / len;
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < len / 2; k++) {
        const wr = Math.cos(angle * k);
        const wi = Math.sin(angle * k);
        const xr = re[i + k + len / 2] * wr - im[i + k + len / 2] * wi;
        const xi = re[i + k + len / 2] * wi + im[i + k + len / 2] * wr;
        re[i + k + len / 2] = re[i + k] - xr;
        im[i + k + len / 2] = im[i + k] - xi;
        re[i + k] += xr;
        im[i + k] += xi;
      }
    }
  }
  const mags = [];
  for (let i = 0; i < n / 2; i++) mags.push(Math.log1p(50 * Math.hypot(re[i], im[i])));
  return mags;
}

// Average correlation of the spectra of the windows where both are audible
function spectralCorrelation(a, b) {
  const values = [];
  for (let i = 0; i + 2048 <= Math.min(a.length, b.length); i += 2048) {
    const sa = spectrum(a.slice(i, i + 2048));
    const sb = spectrum(b.slice(i, i + 2048));
    if (Math.max(...sa) > 1 && Math.max(...sb) > 1) values.push(correlation(sa, sb));
  }
  return values.reduce((s, v) => s + v, 0) / values.length;
}

// Last 10 ms window above the threshold
function duration(env) {
  let last = -1;
  env.forEach((v, i) => {
    if (v > 0.005) last = i;
  });
  return (last + 1) * 10;
}

test("sound effects and music sound like on PICO-8", async ({ browser }) => {
  test.setTimeout(240000);
  const pico8Page = await browser.newPage();
  const code = fs.readFileSync(path.join(__dirname, "pico8", "probes", "sound.lua"), "utf8");
  const recorded = await captureAudio(pico8Page, code);
  await pico8Page.close();
  const rate = recorded.rate;

  // The same sounds from the synthesizer, resampled like in the worklet
  const page = await browser.newPage();
  await openGame(page);
  const rendered = await page.evaluate(
    ({ sfx, rate }) => {
      const { Synth, cart } = window.ascent;
      const render = (start, seconds) => {
        const synth = new Synth(cart.sfx, cart.music);
        start(synth);
        const raw = new Float32Array(Math.round(22050 * seconds));
        synth.render(raw);
        const out = [];
        const step = 22050 / rate;
        for (let p = 0; p < raw.length - 1; p += step) {
          const i = Math.floor(p);
          out.push(raw[i] + (raw[i + 1] - raw[i]) * (p - i));
        }
        return out;
      };
      const result = {};
      for (const n of sfx) result[n] = render((s) => s.sfx(n), 2.4);
      result.music = render((s) => s.music(0), 20);
      return result;
    },
    { sfx: SFX, rate }
  );

  const report = [];
  for (const name of [...SFX, "music"]) {
    const seconds = name === "music" ? 19 : 2;
    // PICO-8's sound starts a bit after the mark: align on the first sample
    const from = Math.max(0, recorded.marks[name] - rate / 2);
    const segment = recorded.samples.slice(from, from + rate * (seconds + 1));
    const a = segment.slice(onset(segment));
    const b = rendered[name].slice(onset(rendered[name]));
    const n = Math.min(a.length, b.length, rate * seconds);
    const ea = envelope(a.slice(0, n), rate);
    const eb = envelope(b.slice(0, n), rate);
    const level = eb.reduce((s, v) => s + v, 0) / ea.reduce((s, v) => s + v, 0);
    report.push({
      name,
      duration: [duration(ea), duration(eb)],
      envelope: correlation(ea, eb),
      level,
      spectrum: spectralCorrelation(a.slice(0, n), b.slice(0, n))
    });
  }
  console.log(
    report.map((r) => JSON.stringify(r, (k, v) => (typeof v === "number" ? Math.round(v * 100) / 100 : v))).join("\n")
  );

  for (const r of report) {
    const loose = LOOSE[r.name] || {};
    const [low, high] = loose.level || [0.8, 1.2];
    expect(Math.abs(r.duration[0] - r.duration[1]), `duration of ${r.name}`).toBeLessThanOrEqual(loose.duration || 20);
    expect(r.envelope, `envelope of ${r.name}`).toBeGreaterThanOrEqual(loose.envelope ?? 0.95);
    expect(r.level, `volume of ${r.name}`).toBeGreaterThanOrEqual(low);
    expect(r.level, `volume of ${r.name}`).toBeLessThanOrEqual(high);
    expect(r.spectrum, `spectrum of ${r.name}`).toBeGreaterThanOrEqual(loose.spectrum || 0.8);
  }
});
