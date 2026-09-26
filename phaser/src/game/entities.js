// entities

import { g } from "./state.js";
import { add, fdiv, flr, fmul, min, fx } from "../pico8/lib.js";
import { line, rect, spr } from "../pico8/gfx.js";
import { add_params, pr } from "./helpers.js";
import { collide_floor, collide_roof, collide_side, should_fall } from "./platforming.js";
import { spawn_dust } from "./particles.js";

// create and add entity
export function make_entity(params) {
  const e = {
    tick: 0,
    dx: 0, // delta movement
    dy: 0,
    ix: 1,
    iy: 1,
    w: 8,
    h: 8,
    inair_frames: 0,
    visible: true,

    lastty: -1,
    g: 0,

    hp: 1,

    spr: 0,
    sw: 8,
    sh: 8,
    tw: 1,
    th: 1,

    frame: 1,
    frames: [1],
    fs: 4,
    fc: 0,

    dir: 1,
    collide: true,
    cd: {},

    on_draw: draw_entity,
    on_update: update_entity,
    on_air: entity_air,
    on_hit_floor: entity_hit_floor,
    on_hit_ceiling: entity_hit_ceiling,
    on_hit_wall: entity_hit_wall
    // on_hit_entity: entity_hit_entity
  };

  add_params(params, e);

  return add(g.entities, e);
}

// Animations are compared by identity: a new array restarts the animation
export function set_anim(e, frames, loop) {
  if (e.frames === frames) return;

  e.frames = frames;
  e.frame = 1;
  e.fc = 0;
  e.fs = 4;
  e.anim_loop = loop;
}

export function update_entity_x(e) {
  e.x += e.dx;
  e.dx = fmul(e.dx, e.ix);
}

export function update_entity_y(e) {
  if (e.inair || !e.collide) {
    e.y += e.dy;

    e.dy = min(8, e.dy + e.g);

    e.dy = fmul(e.dy, e.iy);
  }
}

export function update_entity(e) {
  e.tick += 1;

  // clear collision data
  e.cd = {};

  // store old values
  e.odx = e.dx;
  e.ody = e.dy;

  e.ox2 = e.ox;
  e.oy2 = e.oy;
  e.ox = e.x;
  e.oy = e.y;

  // collide with world
  // (the anchor that connect_anchor() handles is never set)
  update_entity_x(e);

  if (e.collide) {
    if (collide_side(e)) {
      e.on_hit_wall(e);
    }

    // store last tile y
    e.lastty = flr(fdiv(e.y + e.h / 2 - fx(0.01), 8));
  }

  update_entity_y(e);
  if (e.collide) {
    if (collide_floor(e)) {
      if (e.inair === true) {
        e.on_hit_floor(e);
      }
      e.inair = false;
    } else {
      // inair is not set on a new entity, which is neither true nor false
      if (e.inair === false && e.dy === 0) {
        if (should_fall(e)) {
          if (e.inair === false) {
            e.on_air(e);
          }
          e.inair = true;
        }
      } else {
        if (e.inair === false) {
          e.on_air(e);
        }
        e.inair = true;
      }
    }

    if (collide_roof(e)) {
      e.on_hit_ceiling(e);
    }
  }

  if (e.inair) {
    e.inair_frames += 1;
  } else {
    e.inair_frames = 0;
  }

  update_entity_anim(e);
}

export function update_entity_anim(e) {
  if (!e.anim_pause) {
    e.fc += 1;
  }

  if (e.fc === e.fs) {
    e.fc = 0;
    e.frame += 1;
    if (e.frame > e.frames.length) {
      if (e.anim_loop) {
        e.frame = 1;
      } else {
        e.frame = e.frames.length;
      }
    }
  }
}

export function draw_entity(e) {
  if (!e.visible) return;

  if (g.debug) {
    const x = e.x - e.w / 2;
    const y = e.y - e.h / 2;
    rect(x, y, x + e.w - 1, y + e.h - 1, e.inair ? 8 : 11);

    // collisions
    if (e.cd.left) {
      line(x, y, x, y + e.h - 1, 7);
    }
    if (e.cd.right) {
      line(x + e.w - 1, y, x + e.w - 1, y + e.h - 1, 7);
    }
    if (e.cd.up) {
      line(x, y, x + e.w - 1, y, 7);
    }
    if (e.cd.down) {
      line(x, y + e.h - 1, x + e.w - 1, y + e.h - 1, 7);
    }

    if (e.state !== undefined) pr("" + e.state, e.x - 4, e.y - 9, 7);
  } else if (e.visible) {
    spr(e.frames[e.frame - 1], e.x - e.sw / 2, e.y - e.sh / 2, e.tw, e.th, e.dir === -1);
  }
}

export function entity_hit_floor(e) {
  if (e.state === 4) {
    // ladder to normal
    e.state = 0;
  } else {
    for (let i = 0; i <= fdiv(e.ody, 2); i++) {
      spawn_dust(e.x, e.y + e.h / 2 - 2, i - fdiv(e.ody, 4));
    }
  }
}

export function entity_hit_ceiling(e) {}

export function entity_hit_wall(e) {}

export function entity_air(e) {}
