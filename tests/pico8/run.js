"use strict";

// Runs builds of the PICO-8 cartridge in the PICO-8 web export (see
// harness.js) and collects what they print.

const { harnessExport, probeExport, routePico8, parseTrace } = require("./harness.js");

async function open(page, exportSource, lines) {
  page.on("console", (message) => lines.push(message.text()));
  await routePico8(page, exportSource);
  await page.goto("http://pico8.test/");
  // The play button of the web export
  await page.click("#p8_container");
}

// Runs a scenario (see scenarios.js) with the test harness. The clock of the
// page is faked to run PICO-8 as fast as possible.
async function runHarness(page, { seed, script, last, setup, dump }) {
  const lines = [];
  await page.clock.install();
  await open(page, harnessExport({ seed, script, last, setup, dump }), lines);
  const done = () => lines.some((line) => line.startsWith(`frame ${last} `));
  while (!done()) {
    await page.clock.runFor(2000);
  }
  return parseTrace(lines);
}

// Runs Lua code (with the data of the game) until it prints "done", and
// returns the printed lines
async function runProbe(page, code) {
  const lines = [];
  await page.clock.install();
  await open(page, probeExport(code), lines);
  while (!lines.includes("done")) {
    await page.clock.runFor(2000);
  }
  return lines;
}

// Runs Lua code in real time and records the sound of the web export. Returns
// the samples, their rate and the sample count at each "mark ..." line.
async function captureAudio(page, code) {
  await page.addInitScript(() => {
    window.__audio = { rate: 0, chunks: [], count: 0 };
    const create = AudioContext.prototype.createScriptProcessor;
    AudioContext.prototype.createScriptProcessor = function (...args) {
      const node = create.apply(this, args);
      window.__audio.rate = this.sampleRate;
      const property =
        Object.getOwnPropertyDescriptor(AudioNode.prototype, "onaudioprocess") ||
        Object.getOwnPropertyDescriptor(ScriptProcessorNode.prototype, "onaudioprocess");
      // Records what the export writes to the output buffer
      Object.defineProperty(node, "onaudioprocess", {
        configurable: true,
        get() {
          return this.__handler;
        },
        set(handler) {
          this.__handler = handler;
          property.set.call(this, (event) => {
            handler(event);
            const samples = event.outputBuffer.getChannelData(0);
            window.__audio.chunks.push(Array.from(samples));
            window.__audio.count += samples.length;
          });
        }
      });
      return node;
    };
  });

  const lines = [];
  const marks = {};
  page.on("console", async (message) => {
    const text = message.text();
    if (text.startsWith("mark ")) {
      marks[text.slice(5)] = await page.evaluate(() => window.__audio.count);
    }
  });
  await open(page, probeExport(code), lines);
  while (!lines.includes("done")) {
    await page.waitForTimeout(500);
  }
  const { rate, samples } = await page.evaluate(() => ({
    rate: window.__audio.rate,
    samples: window.__audio.chunks.flat()
  }));
  return { rate, samples, marks };
}

module.exports = { runHarness, runProbe, captureAudio };
