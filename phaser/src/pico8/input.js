// PICO-8 buttons of player 1: btn() and btnp()

export const LEFT = 0; // ⬅️
export const RIGHT = 1; // ➡️
export const UP = 2; // ⬆️
export const DOWN = 3; // ⬇️
export const O = 4; // 🅾️
export const X = 5; // ❎

// Number of frames each button has been held
const held = new Array(6).fill(0);

// Called once per frame with the pressed buttons as a bit field
export function setButtons(bits) {
  for (let i = 0; i < held.length; i++) {
    held[i] = bits & (1 << i) ? held[i] + 1 : 0;
  }
}

export function resetButtons() {
  held.fill(0);
}

export function btn(b) {
  return held[b] > 0;
}

// True when pressed, then every 4 frames after being held for 15 frames
export function btnp(b) {
  const frames = held[b];
  return frames === 1 || (frames > 15 && (frames - 16) % 4 === 0);
}
