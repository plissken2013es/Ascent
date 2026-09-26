// sfx() and music(), forwarded to the synthesizer (see synth/) once the game
// scene has connected it. Calls are also logged for the tests.

let backend = null;
const log = [];

export function setAudioBackend(b) {
  backend = b;
}

export function audioLog() {
  return log;
}

export function sfx(n, channel = -1, offset = 0, length = 0) {
  log.push(["sfx", n]);
  if (backend) {
    backend.sfx(n, channel, offset, length);
  }
}

export function music(n, fade = 0, mask = 0) {
  log.push(["music", n]);
  if (backend) {
    backend.music(n, fade, mask);
  }
}

export function stopAudio() {
  if (backend) {
    backend.stop();
  }
}
