// Virtual gamepad for touch screens (see #touch in index.html): returns the
// pressed PICO-8 buttons as a bit field.

import { DOWN, LEFT, O, RIGHT, UP, X } from "./pico8/input.js";

const pointers = new Map(); // pointer id -> bits
// Buttons pressed since the last frame, so that a quick tap still counts
let latched = 0;

function dpadBits(element, event) {
  const box = element.getBoundingClientRect();
  const dx = event.clientX - (box.left + box.width / 2);
  const dy = event.clientY - (box.top + box.height / 2);
  const dead = box.width * 0.15;
  let bits = 0;
  // 8 directions: a direction counts when it is at least half of the other one
  if (dx < -dead && -dx >= Math.abs(dy) / 2) bits |= 1 << LEFT;
  if (dx > dead && dx >= Math.abs(dy) / 2) bits |= 1 << RIGHT;
  if (dy < -dead && -dy >= Math.abs(dx) / 2) bits |= 1 << UP;
  if (dy > dead && dy >= Math.abs(dx) / 2) bits |= 1 << DOWN;
  return bits;
}

function track(element, bitsOf) {
  const update = (event) => {
    if (event.type === "pointerdown") {
      element.setPointerCapture(event.pointerId);
    }
    if (event.type === "pointerdown" || pointers.has(event.pointerId)) {
      const bits = bitsOf(event);
      pointers.set(event.pointerId, bits);
      latched |= bits;
    }
    event.preventDefault();
  };
  const release = (event) => {
    pointers.delete(event.pointerId);
    event.preventDefault();
  };
  element.addEventListener("pointerdown", update);
  element.addEventListener("pointermove", update);
  element.addEventListener("pointerup", release);
  element.addEventListener("pointercancel", release);
}

export function setupTouch() {
  const dpad = document.getElementById("dpad");
  const o = document.getElementById("button-o");
  const x = document.getElementById("button-x");
  if (!dpad || !o || !x) {
    return;
  }
  track(dpad, (event) => dpadBits(dpad, event));
  track(o, () => 1 << O);
  track(x, () => 1 << X);
}

// Called once per frame
export function touchButtons() {
  let bits = latched;
  latched = 0;
  for (const b of pointers.values()) {
    bits |= b;
  }
  return bits;
}
