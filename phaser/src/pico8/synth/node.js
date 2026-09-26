// Connects the synthesizer to an audio context: an AudioWorklet when available,
// otherwise a ScriptProcessorNode on the main thread. Returns the backend for
// sfx() and music() (see pico8/audio.js).

import workletUrl from "./worklet.js?worker&url";
import { Synth, SAMPLE_RATE } from "./synth.js";

export async function createSynth(context, destination, cart) {
  const data = { sfx: cart.sfx, music: cart.music };

  if (context.audioWorklet) {
    try {
      await context.audioWorklet.addModule(workletUrl);
      const node = new AudioWorkletNode(context, "pico8-synth", {
        numberOfInputs: 0,
        outputChannelCount: [1],
        processorOptions: data
      });
      node.connect(destination);
      return {
        kind: "AudioWorklet",
        sfx: (...args) => node.port.postMessage({ type: "sfx", args }),
        music: (...args) => node.port.postMessage({ type: "music", args }),
        stop: () => node.port.postMessage({ type: "stop" })
      };
    } catch (e) {
      console.warn("AudioWorklet unavailable, falling back to ScriptProcessorNode", e);
    }
  }

  const synth = new Synth(data.sfx, data.music);
  const node = context.createScriptProcessor(2048, 0, 1);
  const step = SAMPLE_RATE / context.sampleRate;
  let previous = 0;
  let current = 0;
  let position = 0;
  node.onaudioprocess = ({ outputBuffer }) => {
    const out = outputBuffer.getChannelData(0);
    for (let i = 0; i < out.length; i++) {
      position += step;
      while (position >= 1) {
        position -= 1;
        previous = current;
        current = synth.sample();
      }
      out[i] = previous + (current - previous) * position;
    }
  };
  node.connect(destination);
  return {
    kind: "ScriptProcessorNode",
    sfx: (...args) => synth.sfx(...args),
    music: (...args) => synth.music(...args),
    stop: () => synth.stop()
  };
}
