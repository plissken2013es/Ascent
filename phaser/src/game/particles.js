// particles

import { g } from "./state.js";
import { add, all, cos, del, fdiv, flr, fmul, idiv, min, mod, rnd, sin, split, fx } from "../pico8/lib.js";
import { circfill, clip, fillp, ovalfill, pal, pset, spr } from "../pico8/gfx.js";
import { t } from "../pico8/system.js";
import { reset_pal } from "./helpers.js";

export function update_particles(a) {
  for (const p of all(a)) {
    p.dy += p.g;

    p.x += p.dx;
    p.y += p.dy;

    p.dx = fmul(p.dx, p.ix);
    p.dy = fmul(p.dy, p.iy);

    if (p.uf) p.uf(p);
    if (!p.immortal) {
      p.tick += 1;
      if (p.tick > p.life) {
        del(p.tbl, p);
      }
    }
  }
}

export function make_dot(x, y) {
  const r = rnd(16) + 16;
  const a = rnd();
  const f = fx(0.8) + rnd(fx(0.3));

  add(g.particles2, {
    tbl: g.particles2,
    tick: 0,
    x: x + fmul(r, cos(a)),
    y: y + fmul(r, sin(a)),
    dx: fmul(fmul(fmul(-fx(0.02), f), r), cos(a)),
    dy: fmul(fmul(fmul(-fx(0.02), f), r), sin(a)),
    ix: 1,
    iy: 1,
    g: 0,

    life: 45,

    on_draw: function (p) {
      // local cols=split"1,14,3,15,11,10,7,7,7,7,7,11,14"
      const cols = split("1,5,13,12,12,12,7,7,7,12,13,1");
      const r = 2 - fdiv(3 * p.tick, 45);
      // the index is past the end on the last frame: the pen color is kept
      circfill(p.x, p.y, r, cols[flr(idiv(cols.length * p.tick, p.life))]);
    }
  });
}

export function spawn_landing_dust(e) {
  for (let i = 0; i <= fdiv(e.ody, 2); i++) {
    spawn_dust(e.x, e.y + e.h / 2 - 2, i - fdiv(e.ody, 4));
  }
}

export function spawn_dust(x, y, dx) {
  add(g.particles2, {
    tbl: g.particles2,
    tick: 0,
    x: x,
    y: y,
    dx: dx,
    dy: 0,
    ix: fx(0.9),
    iy: 1,
    g: 0,
    c1: 6, // 4,
    c2: 13, // 2,

    life: 8 + rnd(8),

    on_draw: function (e) {
      const r = min(1, fdiv(e.life - e.tick, 16));
      if (e.dy === 0) {
        clip(0, mod(flr(e.y - 9 - g.camy), 128), 127, 11);
      }
      circfill(e.x, e.y + 1, fmul(r, 2.5), e.c2);
      circfill(e.x - 1, e.y + 1, fmul(r, 2.5), e.c1);
      clip();
    }
  });
}

export function make_smoke(px, py) {
  add(g.particles2, {
    tbl: g.particles2,
    tick: 0,
    x: px,
    y: py,
    r: rnd(0.5),
    life: 20 + rnd(20),
    g: -rnd(fx(0.3)) - fx(0.2),
    dx: rnd(fx(0.2)),
    dy: -rnd(fx(0.2)),
    ix: 1,
    iy: 0,

    on_draw: function (pp) {
      pp.r += fx(0.2);
      if (pp.life - pp.tick < 5) {
        fillp(0b1010010110100101 + 0.5); // 0b1010010110100101.1
      }
      if (pp.life - pp.tick < 2) {
        fillp(0b0111111111011111 + 0.5); // 0b0111111111011111.1
      }

      ovalfill(pp.x - fdiv(pp.r, 2), pp.y - fdiv(pp.r, 2), pp.x + fdiv(pp.r, 2), pp.y + fdiv(pp.r, 2), 5);
      ovalfill(pp.x - fdiv(pp.r, 2), pp.y - fdiv(pp.r, 2), pp.x + fdiv(pp.r, 2) - 1, pp.y + fdiv(pp.r, 2) - 1, 13);
      fillp();
    }
  });
}

export function make_blobsplash(x, y, dx) {
  add(g.particles2, {
    tbl: g.particles2,
    tick: 0,
    x: x - 4,
    y: y - 4,
    dx: dx,
    dy: -fx(0.1),
    ix: fx(0.9),
    iy: 1,
    g: fx(0.02),

    life: 15,

    on_draw: function (e) {
      spr(85 + idiv(e.tick - 1, 5), e.x, e.y);
    }
  });
}

// todo:
// make anim particle with splash
export function make_flame(x, y, dx) {
  add(g.particles2, {
    tbl: g.particles2,
    tick: 0,
    x: x - 5 + rnd(3),
    y: y - 4,
    dx: 0,
    dy: -rnd(1),
    ix: 1,
    iy: 1,
    g: 0,

    life: 15,

    on_draw: function (e) {
      spr(112 + idiv(e.tick, 4), e.x, e.y);
    }
  });
}

export function spawn_leaf(x, y) {
  add(g.particles2, {
    tbl: g.particles2,
    tick: 0,
    x: x - 4,
    y: y,
    dx: 0,
    dy: -rnd() - 1,
    ix: 1,
    iy: 1,
    g: 0,
    spd: flr(rnd(4)) + 2,

    life: 72,
    c: rnd() < 0.25,

    on_draw: function (e) {
      if (e.c) {
        pal(14, 2);
        pal(3, 4);
      }
      if (e.tick < 70) {
        spr(107 + mod(idiv(e.tick, e.spd), 4), e.x, e.y);
      } else {
        pset(e.x + 4, e.y + 4, 14);
      }
      if (e.c) {
        reset_pal();
      }
    }
  });
}

export function spawn_sand(x, y, dx) {
  add(g.particles2, {
    tbl: g.particles2,
    tick: 0,
    x: x,
    y: y,
    dx: dx,
    dy: 0,
    ix: 1,
    iy: 1,
    g: 0,
    c: rnd([2, 2, 4, 4, 4, 4, 9]),

    life: 999,

    on_draw: function (e) {
      if (e.x > 252) {
        del(e.tbl, e);
      }
      e.y += sin(fdiv(t(), 100) + fdiv(e.tick, 100) + 0.25);

      pset(e.x, e.y, e.c);
    }
  });
}
