// platforming

// code adapted from
// https://www.lexaloffle.com/bbs/?tid=28793
// by matt hugeson

import { fdiv, flr } from "../pico8/lib.js";
import { fget } from "../pico8/gfx.js";
import { _mget } from "./helpers.js";

// check if pushing into side tile and resolve.
export function collide_side(self) {
  const hh = self.h / 2;
  const wh = self.w / 2;
  for (let i = -hh; i <= hh - 1; i++) {
    // check to the right
    if (self.dx >= 0) {
      const t = _mget(fdiv(self.x + wh, 8), fdiv(self.y + i, 8));
      if (fget(t, 0)) {
        self.dx = 0;
        self.x = flr(fdiv(self.x + wh, 8)) * 8 - wh;
        self.cd.right = true;
        return true;
      }
    }

    // check to the left
    if (self.dx <= 0) {
      const t = _mget(fdiv(self.x - wh, 8), fdiv(self.y + i, 8));
      if (fget(t, 0)) {
        self.dx = 0;
        self.x = flr(fdiv(self.x - wh, 8)) * 8 + 8 + wh;
        self.cd.left = true;
        return true;
      }
    }
  }

  // didn't hit a solid tile.
  return undefined;
}

// check if standing on air
export function should_fall(self) {
  if (self.inair) return true;

  let air = true;
  for (let i = -(self.w / 2); i <= self.w / 2 - 1; i++) {
    const newty = flr(fdiv(self.y + self.h / 2 + 1, 8));
    const tile = _mget(fdiv(self.x + i, 8), newty);
    if (fget(tile, 0) || fget(tile, 1)) {
      air = false;
    }
  }

  if (!self.inair && air && self.on_fall) {
    self.on_fall(self);
  }

  return air;
}

// check if pushing into floor tile and resolve.
export function collide_floor(self) {
  // only check for ground when falling.
  if (self.dy < 0) {
    return false;
  }
  let landed = false;
  // check for collision at multiple points along the bottom
  // of the sprite: left, center, and right.
  for (let i = -(self.w / 2); i <= self.w / 2 - 1; i++) {
    const newty = flr(fdiv(self.y + self.h / 2, 8));
    const tile = _mget(fdiv(self.x + i, 8), newty);
    if (fget(tile, 0)) {
      landed = true;
    }
    if (fget(tile, 1)) {
      if (self.lastty < newty) landed = true;
    }
  }

  if (landed) {
    self.dy = 0;
    self.y = flr(fdiv(self.y + self.h / 2, 8)) * 8 - self.h / 2;
    self.ly = self.y;
    self.cd.down = true;
  }

  return landed;
}

// check if pushing into roof tile and resolve.
export function collide_roof(self) {
  // check for collision at multiple points along the top
  // of the sprite: left, center, and right.
  let collided = false;
  for (let i = -(self.w / 2); i <= self.w / 2 - 1; i++) {
    if (fget(_mget(fdiv(self.x + i, 8), fdiv(self.y - self.h / 2, 8)), 0)) {
      self.dy = 0;
      self.y = flr(fdiv(self.y - self.h / 2, 8)) * 8 + 8 + self.h / 2;
      collided = true;
      self.cd.up = true;
    }
  }
  return collided;
}
