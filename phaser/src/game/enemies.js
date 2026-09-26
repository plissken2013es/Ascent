// enemies (and the other entities of the map)

import { g } from "./state.js";
import { abs, all, cos, del, fdiv, fmul, idiv, max, min, mod, rnd, sgn, sin, wrap16, fx } from "../pico8/lib.js";
import { sfx } from "../pico8/audio.js";
import { decrease, ssgn } from "./helpers.js";
import { entity_hit_floor, make_entity, set_anim, update_entity } from "./entities.js";
import { hit_player } from "./player.js";
import { speak } from "./main.js";
import { make_blobsplash, make_dot, make_flame, make_smoke, spawn_leaf } from "./particles.js";

export function make_blob(px, py) {
  return make_entity({
    name: "blob",

    x: px,
    y: py,
    g: 0,
    ix: 0,
    w: 2,
    h: 4,
    sh: 10,

    hp: 1,
    frames: [81],

    // px*py overflows the 16-bit integer part of PICO-8 numbers
    delay: mod(wrap16(px * py), 30),
    direction: 1,

    on_update: function (e) {
      e.delay -= 1;
      if (e.delay <= 0) {
        e.delay = 25 + mod(px, 30);
        e.direction = -e.direction;
        e.dy = 2 * e.direction;
        set_anim(e, [82]);
        e.h = 4;
      }

      update_entity(e);
    },

    on_hit_floor: function (e) {
      sfx(59);
      set_anim(e, [81, 80, 81]);
      e.fs = 3;
      e.h = 2;
    },
    on_hit_ceiling: function (e) {
      sfx(59);
      set_anim(e, [83, 84, 83]);
      e.fs = 3;
      e.h = 2;
    },

    on_hit_player: function (e) {
      if (!g.pl.rushing) {
        hit_player(e, 1, -ssgn(e.x - g.pl.x), -1);
      } else {
        make_blobsplash(e.x, e.y, g.pl.dir);
        del(g.entities, e);
      }
    }
  });
}

export function make_upgrader(px, py) {
  return make_entity({
    name: "upgrader",

    x: px,
    y: py,
    g: 0,
    ix: 0,
    w: 2,
    h: 2,
    sh: 14,

    hp: 1,
    frames: [145],
    countdown: 60,

    on_update: function (e) {
      // spawn particles
      if (rnd() < fx(1.1) - fdiv(2 * e.countdown, 120)) make_dot(e.x, e.y - 4);

      update_entity(e);

      if (!e.hitplayer) {
        e.countdown = 60;
      } else {
        e.hitplayer = false;
        g.pl.x = e.x;
        g.shakey = rnd(2) - 1;
        if (e.countdown === 0) {
          del(g.entities, e);

          const x = idiv(g.pl.x, 8);
          if (x === 66) {
            g.pl.upg_grab = true;
            speak(["i FEEL...\ndIFFERENT...", "mY ARMS ARE\nSTRONGER!"]);
          } else if (x === 125) {
            g.pl.upg_stomp = true;
            speak(["aNOTHER\nTRANSFORMATION!", "tHINK i CAN\nCONTROL MY\nJUMPS BETTER!", "#(pRESS z\nTO DIVE.)"]);
          } else if (x === 5) {
            g.pl.upg_scale = true;
            speak(["gENIUS!", "nOW i CAN\nCLIMB THOSE\nWEIRD WALLS."]);
          } else if (x === 51) {
            g.pl.upg_rush = true;
            speak(["oUF. iT HURTS\nMORE AND MORE.", "bUT i FEEL\nFASTER...", "#(pRESS x\nTO DASH.)"]);
          } else if (x === 83) {
            g.pl.upg_vines = true;
            speak(["tHE VINES...\ni CAN FEEL THEM!", "eVEN CONTROL\nTHEM!"]);
          }
        }
      }
    },

    on_hit_player: function (e) {
      if (e.countdown > 0) {
        e.countdown -= 1;
      }
      if (e.countdown === 50) {
        sfx(63);
      }
      e.hitplayer = true;
    }
  });
}

export function make_pod(px, py) {
  return make_entity({
    name: "pod",

    x: px,
    y: py,
    g: 0,
    ix: 0,

    hp: 1,
    frames: [148],

    on_update: function (e) {
      // spawn particles
      if (rnd() < fx(0.15)) make_smoke(e.x + 3, e.y, 4);

      update_entity(e);
    }
  });
}

export function make_vines(px, py) {
  return make_entity({
    name: "vines",

    x: px,
    y: py,
    g: 0,
    ix: 0,

    frames: [116],

    on_update: function (e) {
      if (g.pl.upg_vines) {
        if (abs(e.y - g.pl.y) < 4) {
          const dx = abs(e.x - g.pl.x);
          e.frames = [min(max(116, 120 - idiv(dx, 3)), 120)];
        }
      }
    },

    on_hit_player: function (e) {
      if (!g.pl.upg_vines) {
        const d = ssgn(g.pl.x - e.x);
        g.pl.x = e.x + d * 7;
      }
    }
  });
}

export function make_mushroom(px, py) {
  return make_entity({
    name: "mushroom",

    x: px,
    y: py + 2,
    g: 0,
    ix: 0,
    collide: false,
    h: 4,
    sh: 12,

    frames: [88],

    on_update: function (e) {
      update_entity(e);
    },

    on_hit_player: function (e) {
      const pl = g.pl;
      if (pl.inair && pl.dy > 0 && pl.hp > 0) {
        pl.dy = pl.stomped ? -4 : -3;
        pl.stomped = false;
        set_anim(pl, [76, 76, 77, 78]);

        set_anim(e, [89, 91, 89, 90, 89, 88]);

        sfx(55);
      }
    }
  });
}

export function make_checkpoint(px, py) {
  return make_entity({
    name: "checkpoint",

    x: px,
    y: py,
    g: 0,
    ix: 0,
    collide: false,
    w: 3,

    frames: [96],
    actived: false,

    on_hit_player: function (e) {
      // lit up
      make_flame(e.x, e.y);

      // deactivate all
      for (const e2 of all(g.entities)) {
        if (e2.name === "checkpoint") {
          e2.activated = false;
          set_anim(e2, [96]);
        }
      }

      // activate this
      e.activated = true;
      set_anim(e, [97]);
      if (g.current_cp !== e) {
        sfx(57);
      }

      g.current_cp = e;
    }
  });
}

export function make_bearpig(px, py) {
  return make_entity({
    name: "bearpig",

    x: px,
    y: py + 2,
    g: fx(0.2),
    ix: fx(0.99),
    iy: 1,
    collide: true,
    w: 6,
    h: 4,
    sh: 12,

    frames: [98],
    delay: 0,

    on_update: function (e) {
      decrease(e, "delay");
      if (e.inair) {
        e.dx = 2 * e.dir;
      }
      if (!e.inair && e.delay === 0) {
        const dx = abs(g.pl.x - e.x);
        const dy = abs(idiv(g.pl.y, 8) - idiv(e.y, 8));
        if (dx < 24) {
          if (dy < 2) {
            e.frames = [99];
            e.dir = sgn(g.pl.x - e.x);

            if (dx < 16) {
              e.dx = 2 * e.dir;
              e.dy = -fx(0.8);
              e.inair = true;
              e.frames = [100];
            }
          }
        }
        if (dx > 28) {
          if (dy < 3) {
            e.frames = [98];
          }
        }
      }

      update_entity(e);
    },

    on_hit_floor: function (e) {
      e.dx = 0;
      e.dy = 0;
      e.frames = [99];
      e.delay = 16;
      entity_hit_floor(e);
    },

    on_hit_player: function (e) {
      hit_player(e, 1, -ssgn(e.x - g.pl.x), -1);
    }
  });
}

export function make_lorb(px, py) {
  return make_entity({
    name: "lorb",

    x: px,
    y: py + 1,
    g: 0,
    ix: 0,
    w: 4,
    h: 4,
    sh: 12,

    frames: [121, 122, 123, 124],
    anim_loop: true,
    fs: 5,

    on_hit_player: function (e) {
      sfx(56);

      g.pl.lore += 1;
      del(g.entities, e);
      g.active_lore = true;
      g.lorex = e.x - g.camtx;
      g.lorey = e.y - g.camty;
      g.lore_count = 1;
      if (g.pl.lore === 1) {
        g.lore_reply = ["bRING ME HERE?\nwHAT'S GOING ON?", "wHAT WAS\nTHAT EVEN?"];
      } else if (g.pl.lore === 2) {
        g.lore_reply = ["tHE CORE?\nwHERE COULD\nTHAT BE?"];
      } else if (g.pl.lore === 8) {
        g.lore_reply = ["lET'S DO THIS!"];
      }
    }
  });
}

export function make_twinkle(px, py) {
  return make_entity({
    name: "twinkle",

    x: px,
    y: py,
    g: 0,
    ix: 0,
    collide: false,

    frames: [0],

    twinkling: false,

    on_update: function (e) {
      if (rnd() < fx(0.02) && !e.twinkling) {
        if (rnd() < 0.5) {
          set_anim(e, [195, 196, 197, 197, 197, 197, 196, 195, 0]);
        } else {
          set_anim(e, [195, 196, 196, 195, 0]);
        }
        e.twinkling = true;
      } else {
        if (e.frames[e.frame - 1] === 0) {
          e.twinkling = false;
        }
      }

      update_entity(e);
    }
  });
}

export function make_fan(px, py) {
  return make_entity({
    name: "fan",

    x: px,
    y: py,
    g: 0,
    ix: 0,
    w: 24,
    h: 71,
    collide: false,

    frames: [94],

    on_update: function (e) {
      let r = fx(0.05);
      if (idiv(g.pl.x, 64) === 4 && idiv(g.pl.y, 64) === 2) {
        r = 0.5;
      }
      if (rnd() < r) {
        spawn_leaf(e.x + rnd(20) - 10, e.y + e.h / 2 + 8);
      }
    },

    on_hit_player: function (e) {
      g.pl.dy -= fx(0.45);
      g.pl.inair = true;
      g.pl.frame = 1;
      g.pl.frames = [rnd() < 0.5 ? 77 : 78];
    }
  });
}

export function make_outro(px, py) {
  return make_entity({
    name: "outro",

    x: px,
    y: py,
    g: 0,
    ix: 0,
    collide: false,

    frames: [94],

    on_hit_player: function (e) {
      g.outro = 1;
      g.outro_step = 1;
      g.pl.frames = [64];
      g.pl.frame = 1;
      del(g.entities, e);

      g.lorex = 32;
      g.lorey = 32;

      for (let i = 1; i <= g.pl.lore; i++) {
        make_spin_orb(g.pl.x + 4, g.pl.y - 3, fdiv(i, g.pl.lore));
      }

      if (g.pl.lore === 8) {
        speak(["i THINK WE'RE\nHERE...", "tHIS IS IT,\nRIGHT?"]);
      } else {
        speak(["i HOPE THIS\nIS IT.", "i HAVE NOTHING\nMORE TO GIVE."]);
      }
    }
  });
}

export function make_spin_orb(px, py, a, spd, tween) {
  return make_entity({
    name: "slorb",

    x: px,
    y: py,
    g: 0,
    ix: 0,
    spd: spd ?? 64,
    tween: tween ?? fx(0.05),

    frames: [121, 122, 123, 124],
    anim_loop: true,
    fs: 5,
    a: a,
    tx: px,
    ty: py,
    ry: 0,
    collide: false,

    on_update: function (e) {
      e.tx = 928 + 28 * cos(e.a + fdiv(e.tick, e.spd));
      e.ty = 94 + 28 * sin(e.a + fdiv(e.tick, e.spd)) + e.ry;

      if (g.outro_step === 2) {
        e.spd = max(10, e.spd - 0.25);
      }

      if (g.outro_step === 3) {
        e.ry -= 8;
      }

      e.x += fmul(e.tx - e.x, e.tween);
      e.y += fmul(e.ty - e.y, e.tween);
      update_entity(e);
    }
  });
}
