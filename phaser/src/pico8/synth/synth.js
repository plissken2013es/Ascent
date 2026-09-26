// PICO-8 sound: sfx() and music() rendered at 22050 Hz, 4 channels.
//
// A port of the synthesizer of zepto8 (https://github.com/samhocevar/zepto8,
// WTFPL), whose waveforms, effects and filters were measured from PICO-8
// exports. No DOM dependencies: runs in an AudioWorklet or in Node.

export const SAMPLE_RATE = 22050;

// Samples per note at speed 1
const SAMPLES_PER_TICK = 183;

const INST_TRIANGLE = 0;
const INST_TILTED_SAW = 1;
const INST_SAW = 2;
const INST_SQUARE = 3;
const INST_PULSE = 4;
const INST_ORGAN = 5;
const INST_NOISE = 6;
const INST_PHASER = 7;

const FX_SLIDE = 1;
const FX_VIBRATO = 2;
const FX_DROP = 3;
const FX_FADE_IN = 4;
const FX_FADE_OUT = 5;
const FX_ARP_FAST = 6;
const FX_ARP_SLOW = 7;

function keyToFreq(key) {
  return 440 * Math.pow(2, (key - 33) / 12);
}

function fmod(a, b) {
  return a % b;
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, lo, hi) {
  return Math.min(Math.max(v, lo), hi);
}

// Biquad filter (https://www.w3.org/TR/audio-eq-cookbook/), high shelf only
class Filter {
  constructor(freq, q, gain) {
    const w0 = (2 * Math.PI * freq) / SAMPLE_RATE;
    const cosw0 = Math.cos(w0);
    const a = Math.pow(10, gain / 40);
    const alpha = (Math.sin(w0) / 2) * Math.sqrt((a + 1 / a) * (1 / q - 1) + 2);
    const sqra = 2 * Math.sqrt(a) * alpha;
    const a0 = a + 1 - (a - 1) * cosw0 + sqra;
    const a1 = 2 * (a - 1 - (a + 1) * cosw0);
    const a2 = a + 1 - (a - 1) * cosw0 - sqra;
    const b0 = a * (a + 1 + (a - 1) * cosw0 + sqra);
    const b1 = -2 * a * (a - 1 + (a + 1) * cosw0);
    const b2 = a * (a + 1 + (a - 1) * cosw0 - sqra);
    this.c1 = b0 / a0;
    this.c2 = b1 / a0;
    this.c3 = b2 / a0;
    this.c4 = a1 / a0;
    this.c5 = a2 / a0;
    this.linput = this.llinput = this.loutput = this.lloutput = 0;
  }

  run(input) {
    const output =
      this.c1 * input +
      this.c2 * this.linput +
      this.c3 * this.llinput -
      this.c4 * this.loutput -
      this.c5 * this.lloutput;
    this.llinput = this.linput;
    this.linput = input;
    this.lloutput = this.loutput;
    this.loutput = output;
    return output;
  }
}

function synthParams(from) {
  return {
    phi: from ? from.phi : 0,
    lastAdvance: from ? from.lastAdvance : 0,
    lastSample: from ? from.lastSample : 0,
    key: 0,
    freq: 0,
    instrument: 0,
    custom: 0,
    filters: 0,
    volume: 0,
    isMusic: false
  };
}

function sfxState() {
  return { sfx: -1, offset: 0, time: 0, prevKey: 24, prevVol: 0 };
}

function channel() {
  return {
    mainSfx: sfxState(),
    customSfx: sfxState(),
    sfxMusic: -1,
    length: 0,
    canLoop: true,
    isMusic: false,
    lastMainInstrument: 0xff,
    lastMainKey: 0xff,
    lastSynth: synthParams(),
    fade: 0,
    fadeSynth: synthParams(),
    reverb2: new Float32Array(366),
    reverb4: new Float32Array(732),
    reverbIndex: 0,
    damp1: new Filter(2400, 1, -6),
    damp2: new Filter(1000, 1, -12)
  };
}

// The waveform of an instrument at phase phi (in periods)
function waveform(params) {
  const advance = params.phi;
  const t = fmod(advance, 1);
  const noiz = params.filters & 0x2;
  const buzz = params.filters & 0x4;
  let ret = 0;

  switch (params.instrument) {
    case INST_TRIANGLE:
      ret = 1 - Math.abs(4 * t - 2);
      if (buzz) {
        const a = 0.875;
        const bret = t < a ? (2 * t) / a - 1 : (2 * (1 - t)) / (1 - a) - 1;
        ret = ret * 0.75 + bret * 0.25;
      }
      return ret * 0.5;
    case INST_TILTED_SAW: {
      const a = buzz ? 0.975 : 0.875;
      ret = t < a ? (2 * t) / a - 1 : (2 * (1 - t)) / (1 - a) - 1;
      return ret * 0.5;
    }
    case INST_SAW:
      ret = t < 0.5 ? t : t - 1;
      if (buzz) ret = ret * 0.83 - (Math.abs(fmod(advance, 2) - 1) < 0.5 ? 0.085 : 0);
      return 0.653 * ret;
    case INST_SQUARE:
      return t < (buzz ? 0.4 : 0.5) ? 0.25 : -0.25;
    case INST_PULSE:
      return t < (buzz ? 0.255 : 0.316) ? 0.25 : -0.25;
    case INST_ORGAN:
      ret = t < 0.5 ? 3 - Math.abs(24 * t - 6) : 1 - Math.abs(16 * t - 12);
      if (buzz) {
        ret = t < 0.5 ? ret * 2 + 3 : ret;
        ret = t < 0.5 && ret > -1.875 ? ret * 0.2 - 1 : ret + 0.5;
      }
      return ret / 9;
    case INST_NOISE: {
      const tscale = 8.858923;
      const scale = (advance - params.lastAdvance) * tscale;
      const sample = (params.lastSample + scale * (Math.random() * 2 - 1)) / (1 + scale);
      const factor = 1 - params.key / 63;
      ret = sample * 1.5 * (1 + factor * factor);
      if (noiz) {
        ret *= 2 * (t < 0.5 ? t : t - 1);
      }
      params.lastAdvance = advance;
      params.lastSample = sample;
      return ret;
    }
    case INST_PHASER:
      // sum of two triangle waves with a slightly different frequency
      ret = 2 - Math.abs(8 * t - 4);
      ret += 1 - Math.abs(4 * fmod((advance * 109) / 110, 1) - 2);
      if (buzz) {
        ret += 0.25 - Math.abs(1 * fmod(advance * 2 + 0.5, 1) - 0.5);
        ret += 0.125 - Math.abs(0.5 * fmod(advance * 4, 1) - 0.25);
      }
      return ret / 6;
  }
  return 0;
}

export class Synth {
  // sfx: the 64 sound effects, music: the 64 patterns (see pico8/cart.js)
  constructor(sfx, music) {
    this.sfxData = sfx;
    this.musicData = music;
    this.channels = [channel(), channel(), channel(), channel()];
    this.musicState = {
      pattern: -1,
      count: -1,
      offset: -1,
      length: 0,
      mask: 0,
      fadeVolume: 1,
      fadeVolumeStep: 0,
      volumeMusic: 1,
      volumeSfx: 1
    };
  }

  //
  // API
  //

  // sfx(n, channel, offset, length): n = -1 stops, n = -2 releases loops
  sfx(n, chan = -1, offset = 0, length = 0) {
    const channels = this.channels;
    if (n < -2 || n > 63 || chan < -1 || chan > 3 || offset > 31) {
      return;
    }

    if (n === -1 || n === -2) {
      for (let i = 0; i < 4; i++) {
        if ((chan === -1 || chan === i) && !channels[i].isMusic) {
          if (n === -1) channels[i].mainSfx.sfx = -1;
          else channels[i].canLoop = false;
        }
      }
      return;
    }

    const reserved = (i) => ((1 << i) & this.musicState.mask) !== 0;

    // The first available channel: one that plays nothing, or that already
    // plays this sound
    if (chan === -1) {
      for (let i = 0; i < 4; i++) {
        if (!reserved(i) && (channels[i].mainSfx.sfx === -1 || channels[i].mainSfx.sfx === n)) {
          chan = i;
          break;
        }
      }
    }
    // Otherwise the first channel that plays music
    if (chan === -1) {
      for (let i = 0; i < 4; i++) {
        if (!reserved(i) && channels[i].isMusic) {
          chan = i;
          break;
        }
      }
    }
    // Otherwise the channel with the fastest sound (the last one if several)
    if (chan === -1) {
      let fastest = 255;
      for (let i = 0; i < 4; i++) {
        const index = channels[i].mainSfx.sfx;
        if (reserved(i) || index < 0 || index >= 64) continue;
        if (this.sfxData[index].speed <= fastest) {
          chan = i;
          fastest = this.sfxData[index].speed;
        }
      }
    }
    if (chan === -1) {
      return;
    }

    // Stop any channel playing the same sound
    for (let i = 0; i < 4; i++) {
      if (channels[i].mainSfx.sfx === n) {
        channels[i].mainSfx.sfx = -1;
      }
    }

    // Keep the interrupted music to resume it when the sound ends
    if (channels[chan].mainSfx.sfx !== -1 && channels[chan].isMusic) {
      channels[chan].sfxMusic = channels[chan].mainSfx.sfx;
    }

    this.launchSfx(n, chan, offset, length, false);
  }

  // music(n, fade length in ms, reserved channels): n = -1 stops
  music(pattern, fadeLen = 0, mask = 0) {
    if (pattern < -1 || pattern > 63) {
      return;
    }
    const music = this.musicState;
    if (pattern === -1) {
      music.fadeVolumeStep = fadeLen <= 0 ? -Infinity : -music.fadeVolume * (1000 / fadeLen);
      return;
    }

    music.count = 0;
    music.mask = mask & 0xf;
    music.fadeVolume = 1;
    music.fadeVolumeStep = 0;
    if (fadeLen > 0) {
      music.fadeVolume = 0;
      music.fadeVolumeStep = 1000 / fadeLen;
    }
    this.setMusicPattern(pattern);
  }

  stop() {
    this.setMusicPattern(-1);
    for (const ch of this.channels) {
      ch.mainSfx.sfx = -1;
      ch.sfxMusic = -1;
    }
  }

  // Fills out with samples at SAMPLE_RATE, between -1 and 1
  render(out, count = out.length) {
    for (let i = 0; i < count; i++) {
      out[i] = this.sample();
    }
  }

  //
  // Internals
  //

  launchSfx(n, chan, offset, length, isMusic) {
    const ch = this.channels[chan];
    ch.mainSfx.sfx = n;
    ch.mainSfx.offset = Math.max(0, offset);
    ch.mainSfx.time = 0;
    ch.length = Math.max(0, length);
    ch.canLoop = true;
    ch.isMusic = isMusic;
    ch.lastMainInstrument = 0xff;
    ch.lastMainKey = 0xff;
    // Playing C-2 with a slide sounds like no slide on PICO-8
    ch.mainSfx.prevKey = 24;
    ch.mainSfx.prevVol = 0;
  }

  setMusicPattern(pattern) {
    const music = this.musicState;
    for (const ch of this.channels) {
      if (ch.isMusic) {
        ch.mainSfx.sfx = -1;
        ch.sfxMusic = -1;
      }
    }

    const stopMusic = () => {
      music.pattern = -1;
      music.count = -1;
      music.offset = -1;
      music.mask = 0;
      music.length = 0;
    };
    if (pattern < 0 || pattern > 63) {
      stopMusic();
      return;
    }

    // The pattern lasts as long as its first non-looping channel, or as the
    // slowest looping one when all of them loop
    const song = this.musicData[pattern];
    let durationLooping = -1;
    let durationNoLoop = -1;
    for (let i = 0; i < 4; i++) {
      const n = song.channels[i] & 0x7f;
      if (n & 0x40) continue;
      const sfx = this.sfxData[n & 0x3f];
      const hasLoop = sfx.loopEnd > 0 && sfx.loopEnd > sfx.loopStart;
      if (hasLoop) {
        durationLooping = Math.max(durationLooping, 32 * sfx.speed);
      } else {
        let endTime = 32;
        if (sfx.loopEnd === 0 && sfx.loopStart > 0) {
          endTime = Math.min(endTime, sfx.loopStart);
        }
        durationNoLoop = endTime * sfx.speed;
        break;
      }
    }
    const duration = durationNoLoop > 0 ? durationNoLoop : durationLooping;
    if (duration <= 0) {
      stopMusic();
      return;
    }

    music.pattern = pattern;
    music.offset = 0;
    music.length = duration;

    for (let i = 0; i < 4; i++) {
      const n = song.channels[i] & 0x7f;
      if (n & 0x40) continue;
      if (this.channels[i].mainSfx.sfx === -1) {
        this.launchSfx(n, i, 0, 0, true);
      } else {
        // A sound effect is playing: start the music on this channel later
        this.channels[i].sfxMusic = n;
      }
    }
  }

  updateSfxState(cur, params, freqFactor, length, isMusic, canLoop, invRate) {
    if (cur.sfx === -1) return;

    const sfx = this.sfxData[cur.sfx];
    const speed = Math.max(1, sfx.speed);
    const offset = cur.offset;
    const offsetPerSecond = SAMPLE_RATE / (SAMPLES_PER_TICK * speed);
    const offsetPerFrame = offsetPerSecond * invRate;
    let nextOffset = offset + offsetPerFrame;
    const nextTime = cur.time + offsetPerFrame;

    // "Looping is turned off when the start index >= end index"
    const loopRange = sfx.loopEnd - sfx.loopStart;
    if (loopRange > 0 && nextOffset >= sfx.loopEnd && canLoop) {
      nextOffset = fmod(nextOffset - sfx.loopStart, loopRange) + sfx.loopStart;
    }

    let hasEnd = false;
    let endTime = 32;
    if (length > 0) {
      hasEnd = true;
      endTime = length;
    }
    // The length of a sound (loop end 0) doesn't apply to music on PICO-8
    if (!isMusic && sfx.loopEnd === 0 && sfx.loopStart > 0) {
      hasEnd = true;
      endTime = Math.min(endTime, sfx.loopStart);
    }
    if (loopRange <= 0) {
      hasEnd = true;
      // A sound effect stops after its last audible note
      if (!isMusic) {
        let lastNote = 0;
        for (let n = 0; n < 32; n++) {
          if (sfx.notes[n].volume > 0) lastNote = Math.min(32, n + 1);
        }
        endTime = Math.min(endTime, lastNote);
      }
    }

    if (offset < 32) {
      const noteId = Math.floor(offset);
      const nextNoteId = Math.floor(nextOffset);
      const note = sfx.notes[noteId];
      const key = note.key;
      let volume = note.volume / 7;
      let freq = keyToFreq(key) * freqFactor;

      if (volume > 0) {
        const fx = note.effect;
        switch (fx) {
          case FX_SLIDE: {
            // Slides from the previous note and volume
            const t = fmod(offset, 1);
            freq = mix(keyToFreq(cur.prevKey), freq, t);
            if (cur.prevVol > 0) volume = mix(cur.prevVol, volume, t);
            break;
          }
          case FX_VIBRATO: {
            const t = Math.abs(fmod((7.5 * offset) / offsetPerSecond, 1) - 0.5) - 0.25;
            // half a semitone
            freq = mix(freq, freq * 1.059463094359, t);
            break;
          }
          case FX_DROP:
            freq *= 1 - fmod(offset, 1);
            break;
          case FX_FADE_IN:
            volume *= fmod(offset, 1);
            break;
          case FX_FADE_OUT:
            volume *= 1 - fmod(offset, 1);
            break;
          case FX_ARP_FAST:
          case FX_ARP_SLOW: {
            // Groups of 4 notes at speed 4 (fast) or 8 (slow), halved when the
            // sound's speed is <= 8
            const m = (speed <= 8 ? 32 : 16) / (fx === FX_ARP_FAST ? 4 : 8);
            const n = Math.trunc((m * 7.5 * offset) / offsetPerSecond);
            const arpNote = (noteId & ~3) | (n & 3);
            freq = keyToFreq(sfx.notes[arpNote].key);
            break;
          }
        }

        params.key = key;
        params.freq = freq;
        params.instrument = note.instrument;
        params.custom = note.custom;
        params.filters = sfx.filters;
        params.volume = volume;
        params.isMusic = isMusic;
        params.phi = params.phi + freq * invRate;
      }

      if (nextNoteId !== noteId) {
        cur.prevKey = note.key;
        cur.prevVol = note.volume / 7;
      }
    }

    cur.offset = nextOffset;
    cur.time = nextTime;
    if (hasEnd && nextTime >= endTime) {
      cur.sfx = -1;
    }
  }

  synthSample(params) {
    let value = waveform(params);

    // detune: a second wave slightly offset
    const detune = Math.floor(params.filters / 8) % 3;
    if (detune !== 0 && params.instrument !== INST_NOISE) {
      let factor;
      if (params.instrument === INST_TRIANGLE) factor = detune === 1 ? 3 / 4 : 3 / 2;
      else if (params.instrument === INST_ORGAN) factor = detune === 1 ? 200 / 199 : 800 / 199;
      else if (params.instrument === INST_PHASER) factor = detune === 1 ? 49 / 50 : 400 / 199;
      else factor = detune === 1 ? 200 / 199 : 400 / 199;

      const second = { ...params, phi: params.phi * factor };
      if (detune === 2 && params.instrument === INST_ORGAN) second.instrument = INST_TRIANGLE;
      value += waveform(second) * 0.5;
    }

    let volume = params.volume;
    if (params.isMusic) {
      volume *= this.musicState.fadeVolume * this.musicState.volumeMusic;
    } else {
      volume *= this.musicState.volumeSfx;
    }
    return clamp(value * volume, -1, 1);
  }

  sample() {
    const invRate = 1 / SAMPLE_RATE;
    const music = this.musicState;
    let mixed = 0;

    for (let chan = 0; chan < 4; chan++) {
      // Advance the music with the first channel
      if (chan === 0 && music.pattern !== -1) {
        music.offset += (SAMPLE_RATE / SAMPLES_PER_TICK) * invRate;
        music.fadeVolume = clamp(music.fadeVolume + music.fadeVolumeStep * invRate, 0, 1);

        if (music.fadeVolumeStep < 0 && music.fadeVolume <= 0) {
          this.setMusicPattern(-1);
        } else if (music.offset >= music.length) {
          let nextPattern = music.pattern + 1;
          let nextCount = music.count + 1;
          const song = this.musicData[music.pattern];
          if (song.stop) {
            nextPattern = -1;
            nextCount = -1;
          } else if (song.loop) {
            while (--nextPattern > 0 && !this.musicData[nextPattern].start);
          }
          music.count = nextCount;
          this.setMusicPattern(nextPattern);
        }
      }

      const ch = this.channels[chan];

      // Resume the music once the sound effect that interrupted it ends
      if (ch.mainSfx.sfx === -1 && ch.sfxMusic !== -1) {
        const index = ch.sfxMusic;
        const sfx = this.sfxData[index];
        const speed = Math.max(1, sfx.speed);
        let newOffset = music.offset / speed;
        let wantPlay = true;
        const loopRange = sfx.loopEnd - sfx.loopStart;
        if (loopRange > 0 && ch.canLoop) {
          if (newOffset > sfx.loopStart) newOffset = fmod(newOffset - sfx.loopStart, loopRange) + sfx.loopStart;
        } else if (newOffset > 32) {
          wantPlay = false;
        }
        if (wantPlay) {
          this.launchSfx(index, chan, newOffset, 0, true);
        }
        ch.sfxMusic = -1;
      }

      const last = ch.lastSynth;
      const next = synthParams(last);
      let value = 0;

      const baseOffset = ch.mainSfx.offset;
      this.updateSfxState(ch.mainSfx, next, 1, ch.length, ch.isMusic, ch.canLoop, invRate);

      let restartCustom = next.instrument !== ch.lastMainInstrument || next.key !== ch.lastMainKey;
      ch.lastMainInstrument = next.instrument;
      ch.lastMainKey = next.key;

      if (next.volume > 0) {
        if (next.custom) {
          // Custom instrument: the sound effect n°instrument, transposed
          if (ch.mainSfx.offset < baseOffset) restartCustom = true;
          if (ch.customSfx.sfx === -1 && Math.floor(baseOffset) !== Math.floor(ch.mainSfx.offset)) {
            restartCustom = true;
          }
          if (restartCustom) {
            ch.customSfx.sfx = next.instrument;
            ch.customSfx.offset = 0;
            ch.customSfx.time = 0;
          }
          next.phi = last.phi;
          const freqFactor = next.freq / keyToFreq(24); // C-2
          const mainVolume = next.volume;
          this.updateSfxState(ch.customSfx, next, freqFactor, 0, false, true, invRate);
          next.volume *= mainVolume;
        }
        value = this.synthSample(next);
      }

      // Smooth abrupt changes with a short fade
      const freqThreshold = Math.min(next.freq, last.freq) * 0.01;
      if (
        Math.abs(next.volume - last.volume) > 0.1 ||
        Math.abs(next.freq - last.freq) > freqThreshold ||
        next.instrument !== last.instrument
      ) {
        if (ch.fade <= 0) {
          ch.fadeSynth = { ...last };
        }
        ch.fade = 1;
        next.phi = fmod(next.phi, 1);
      }
      ch.lastSynth = next;

      const reverb = Math.floor(next.filters / 24) % 3;
      const dampen = Math.floor(next.filters / 72) % 3;
      let reverb1 = reverb === 1 ? 1 : 0;
      let reverb2 = reverb === 2 ? 1 : 0;
      let damp1 = dampen === 1 ? 1 : 0;
      let damp2 = dampen === 2 ? 1 : 0;

      if (ch.fade > 0) {
        const fadeSynth = ch.fadeSynth;
        fadeSynth.phi = fadeSynth.phi + fadeSynth.freq * invRate;
        value = mix(value, this.synthSample(fadeSynth), ch.fade);

        const fadeReverb = Math.floor(fadeSynth.filters / 24) % 3;
        const fadeDampen = Math.floor(fadeSynth.filters / 72) % 3;
        reverb1 = mix(reverb1, fadeReverb === 1 ? 1 : 0, ch.fade);
        reverb2 = mix(reverb2, fadeReverb === 2 ? 1 : 0, ch.fade);
        damp1 = mix(damp1, fadeDampen === 1 ? 1 : 0, ch.fade);
        damp2 = mix(damp2, fadeDampen === 2 ? 1 : 0, ch.fade);

        ch.fade -= 130 * invRate;
      }

      // (zepto8 also scales the second reverb by the first one's amount)
      if (reverb1 > 0) value += reverb1 * ch.reverb2[ch.reverbIndex % 366] * 0.5;
      if (reverb2 > 0) value += reverb1 * ch.reverb4[ch.reverbIndex % 732] * 0.5;
      ch.reverb2[ch.reverbIndex % 366] = value;
      ch.reverb4[ch.reverbIndex % 732] = value;
      ch.reverbIndex++;

      const valueDamp1 = ch.damp1.run(value);
      if (damp1 > 0) value = mix(value, valueDamp1, damp1);
      const valueDamp2 = ch.damp2.run(value);
      if (damp2 > 0) value = mix(value, valueDamp2, damp2);

      // 16-bit channel sample
      mixed += Math.trunc(32767.99 * clamp(value, -0.99, 0.99));
    }

    return clamp(mixed, -32767.9, 32767.9) / 32768;
  }
}
