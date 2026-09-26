// AudioWorklet running the synthesizer at 22050 Hz, resampled to the rate of
// the audio context by linear interpolation.

import { Synth, SAMPLE_RATE } from "./synth.js";

class Pico8SynthProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const { sfx, music } = options.processorOptions;
    this.synth = new Synth(sfx, music);
    this.previous = 0;
    this.current = 0;
    this.position = 0;
    this.port.onmessage = ({ data }) => {
      if (data.type === "sfx") this.synth.sfx(...data.args);
      else if (data.type === "music") this.synth.music(...data.args);
      else if (data.type === "stop") this.synth.stop();
    };
  }

  process(inputs, outputs) {
    const output = outputs[0];
    const step = SAMPLE_RATE / sampleRate;
    const left = output[0];
    for (let i = 0; i < left.length; i++) {
      this.position += step;
      while (this.position >= 1) {
        this.position -= 1;
        this.previous = this.current;
        this.current = this.synth.sample();
      }
      left[i] = this.previous + (this.current - this.previous) * this.position;
    }
    for (let c = 1; c < output.length; c++) {
      output[c].set(left);
    }
    return true;
  }
}

registerProcessor("pico8-synth", Pico8SynthProcessor);
