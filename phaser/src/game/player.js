// player

import { g } from "./state.js";
import { abs, idiv, fx } from "../pico8/lib.js";
import { fget, line, pal } from "../pico8/gfx.js";
import { btn, btnp, DOWN, LEFT, O, RIGHT, UP, X } from "../pico8/input.js";
import { sfx } from "../pico8/audio.js";
import { _mget, fadeout, reset_pal, ssgn } from "./helpers.js";
import { draw_entity, entity_hit_floor, make_entity, set_anim, update_entity } from "./entities.js";
import { set_cam, speak, swap_room } from "./main.js";

export const player_walk_anim = [67, 64, 65, 66];

export function make_player(px, py) {
  g.player_g = fx(0.35);
  g.player_f = fx(2.2);
  return make_entity({
    name: "player",
    hp: 1,
    max_hp: 1,
    lore: 0,

    x: px,
    y: py,
    g: g.player_g,
    ix: 0,
    w: 4,
    h: 6,
    sh: 10,
    canjump: false,

    // state 0 = free
    // state 1 = ledge
    // state 2 = collapsed
    // state 3 = hit
    // state 4 = ladder
    state: 0,
    ledge_cooldown: 0,
    collapsed_cooldown: 0,
    hit_cooldown: 0,
    ladder_cooldown: 0,
    rush_cooldown: 0,
    jump_cooldown: 0,
    reset_count: 60,

    on_input: get_input,
    on_update: update_player,
    on_draw: draw_player,
    on_air: player_air,
    on_hit_floor: player_hit_floor,
    on_hit_wall: player_hit_wall,
    on_hit: player_hit,
    on_fall: function (e) {
      if (e.rushing) {
        if (e.rush_g === g.player_g) {
          e.rush_g = 0;
        }
      } else {
        if (e.state !== 4) {
          set_anim(e, [78]);
        }
      }
    },

    rush_count: 0

    // cheats
    // upg_grab: true,
    // upg_stomp: true,
    // upg_vines: true,
    // upg_scale: true,
    // upg_rush: true,
  });
}

// player_air and player_hit are not defined in the cartridge (nil in Lua)
const player_air = undefined;
const player_hit = undefined;

export function get_input(e) {
  if (e.state === 0) {
    // normal movement

    if (e.upg_rush && btnp(X) && e.rush_cooldown === 0 && e.rush_count === 0) {
      sfx(62);
      e.dy = 0;
      e.rushing = true;
      e.rush_count = 8;
      e.rush_cooldown = 30;

      if (e.inair) {
        e.rush_g = 0;
      } else {
        e.rush_g = g.player_g;
      }
    }

    if (e.rushing) {
      // full speed ahead
      e.dx = 3 * e.dir;
    } else {
      if (!e.stomped) {
        // player decides
        if (btn(LEFT)) {
          e.dx -= 1;
          e.dir = -1;
        }
        if (btn(RIGHT)) {
          e.dx += 1;
          e.dir = 1;
        }
      }
    }

    if (!e.inair) {
      set_anim(e, abs(e.dx) > fx(0.1) ? player_walk_anim : [64], true);

      // climb down ladder?
      if (btn(DOWN) && !e.inair && fget(_mget(idiv(e.x, 8), idiv(e.y + 4, 8)), 2) && e.ladder_cooldown === 0) {
        e.y += 4;
        grab_ladder(e);
      }
    }

    if (!btn(O)) {
      // and e.dy>=0 then
      e.canjump = true;
    }

    if (e.canjump && btnp(O)) {
      // regular jump
      if (e.inair_frames < 5) {
        jump(e);
        e.inair_frames = 5;
      }

      // stomp
      if (e.upg_stomp && e.inair && !e.stomped && e.jump_cooldown === 0) {
        sfx(61);
        e.stomped = true;
        e.dy = 2;
        set_anim(e, [75]);
        e.canjump = false;
      }
    }

    // grab ladder
    if (e.state !== 4) {
      if (btn(UP) && fget(_mget(idiv(e.x, 8), idiv(e.y, 8)), 2)) {
        if (e.ladder_cooldown === 0) {
          grab_ladder(e);
        }
      } else if (btn(DOWN) && fget(_mget(idiv(e.x, 8), idiv(e.y, 8)), 2)) {
        if (e.ladder_cooldown === 0) {
          grab_ladder(e);
        }
      }
    }
  } else if (e.state === 4) {
    // on a ladder
    if (btn(UP)) {
      e.y -= 0.5;
      e.anim_pause = false;
      // leave ladder if in air
      if (!fget(_mget(idiv(e.x, 8), idiv(e.y, 8)), 2)) {
        set_anim(e, [64]);
        e.y = 8 * idiv(e.y, 8) + 5;
        e.inair = false;
        e.state = 0;
        e.anim_pause = false;
      }
    } else if (btn(DOWN)) {
      e.y += 0.5;
      e.anim_pause = false;

      // leave ladder if in air
      if (!fget(_mget(idiv(e.x, 8), idiv(e.y, 8)), 2)) {
        set_anim(e, [78]);
        e.inair = true;
        e.state = 0;
        e.anim_pause = false;
      }
    } else {
      e.anim_pause = true;
    }
    if (btnp(O)) {
      if (btn(DOWN)) {
        // drop down from ladder
        e.state = 0;
        set_anim(e, [78]);
        e.inair = true;
        e.ladder_cooldown = 15;
      } else {
        jump(e);
        e.ladder_cooldown = 6;
      }
    }
  } else if (e.state === 1) {
    // on ledge
    if ((btn(LEFT) && e.dir === 1) || (btn(RIGHT) && e.dir === -1)) {
      set_anim(e, [68]);
    } else {
      set_anim(e, [69]);
    }

    if (e.ledge_cooldown === 0) {
      // drop?
      if (btn(DOWN)) {
        e.state = 0;
        set_anim(e, [77, 77, 78]);
        e.g = g.player_g;

        e.ledge_cooldown = 7;
        e.dx = 0;
      }
      // jump up
      if (btn(O)) {
        e.ledge_cooldown = 3;
        e.state = 0;
        e.g = g.player_g;
        e.canjump = false;
        set_anim(e, [78]);
        if (btn(RIGHT) || btn(LEFT)) {
          e.dy = -g.player_f;
          if ((btn(LEFT) && e.dir === 1) || (btn(RIGHT) && e.dir === -1)) {
            set_anim(e, [76, 76, 77, 78]);
          }
        } else {
          e.dx = -e.dir;
        }
      }
    }
  }
}

export function player_hit_wall(e) {
  if (g.pl.rushing) {
    g.pl.rushing = false;
    g.pl.rush_count = 0;
    g.pl.rush_cooldown = 0;
    g.shakex = -g.pl.dir;
  }
}

export function grab_ladder(e) {
  e.state = 4;
  e.rushing = false;
  e.rush_count = 0;
  e.rush_cooldown = 0;
  e.g = 0;
  e.dir = 1;
  e.x = idiv(e.x, 8) * 8 + 3;
  e.dx = 0;
  e.dy = 0;
  set_anim(e, [73, 74], true);
}

export function jump(e) {
  e.state = 0;
  e.jump_cooldown = 5;
  e.anim_pause = false;
  e.dy = -g.player_f;
  e.inair = true;
  e.canjump = false;
  set_anim(e, [76, 76, 76, 77, 77, 78], false);
  e.fs = 2;

  sfx(53);
}

export function update_player(e) {
  // todo: use generic function
  //  for cooldowns
  if (e.ledge_cooldown > 0) {
    e.ledge_cooldown -= 1;
  }

  if (e.jump_cooldown > 0) {
    e.jump_cooldown -= 1;
  }

  if (e.rush_cooldown > 0) {
    e.rush_cooldown -= 1;
    if (e.rush_cooldown === 0) {
      e.flash = 7;
    }
  }

  if (e.ladder_cooldown > 0) {
    e.ladder_cooldown -= 1;
  }

  if (e.rush_count > 0) {
    e.rush_count -= 1;
    if (e.rush_count <= 0) {
      e.rushing = false;
    }
  }

  if (!e.inair) {
    e.stomped = false;
    e.jump_cooldown = 0;
  }

  if (e.state === 0) {
    // feels like a hack!
    // todo: solve

    if (e.rushing) {
      e.g = e.rush_g;
    } else {
      e.g = g.player_g;
    }
  }

  if (e.state === 0) {
    // normal movement

    // check for ledge
    if (g.pl.upg_grab) {
      if (e.dy > 0 && e.dx !== 0 && e.ledge_cooldown === 0) {
        const tx = idiv(e.x, 8) + e.dir;
        const dist = abs(tx * 8 + 4 - e.x);

        if (dist < 8) {
          const ty = idiv(e.y, 8);
          let t1 = _mget(tx, ty - 1);
          let t2 = _mget(tx, ty);
          let t3 = _mget(tx - e.dir, ty);
          let t4 = _mget(tx - e.dir, ty + 1);
          t1 = fget(t1, 0);
          if (fget(t2, 4) && e.upg_scale) t1 = false;
          t2 = fget(t2, 0);
          t3 = fget(t3, 0); // or fget(t3,1)
          t4 = fget(t4, 0); // or fget(t4,1)
          if (!t1 && !t3 && t2 && !t4) {
            // grab ledge
            sfx(60);
            e.ledge_cooldown = 7;
            e.state = 1;
            set_anim(e, [69]);
            e.dy = 0;
            e.g = 0;
            e.y = ty * 8 + e.h / 2 + 2;
            if (e.dx > 0) {
              e.x = tx * 8 - e.w / 2;
            } else {
              e.x = tx * 8 + e.w + 7;
            }
          }
        }
      }
    }
  } else if (e.state === 2) {
    if (e.hp > 0) {
      if (g.intro < 0) {
        e.collapsed_cooldown -= 1;
      }
      if (e.collapsed_cooldown === 0) {
        e.state = 0;
        if (!g.tips.woken_up) {
          g.tips.woken_up = true;
          speak(["uHH... wHAT\nHAPPENED?", "sUDDENLY THE \nSHIP SHUT DOWN!", "    ...   ", "wHERE AM i?"]);
        }
      }
    } else {
      if (e.reset_count > 0) {
        e.reset_count -= 1;
      }
      if (e.reset_count === 0) {
        fadeout();
        e.state = 0;
        if (g.current_cp) {
          e.x = g.current_cp.x;
          e.y = g.current_cp.y + 1;
          set_cam(64 * idiv(g.pl.x, 64), 64 * idiv(g.pl.y, 64));
        }
        swap_room(idiv(g.camtx, 64), idiv(g.camty, 64));
        e.hp = e.max_hp;
        // talk to it if first time
        if (!g.tips.respawn) {
          g.tips.respawn = true;
          speak(["wHAT\nHAPPENED?", "hOW AM i\nSTILL ALIVE?"]);
        }
        set_anim(e, [64]);
        e.reset_count = 30;
      }
    }
  } else if (e.state === 3) {
    e.hit_cooldown -= 1;
    if (e.hit_cooldown === 0) {
      // if pl.hp>0 then
      e.state = 0;
      e.ix = 0;
      // end
    }
  }

  const tile = _mget(idiv(e.x, 8), idiv(e.y, 8));
  if (e.state !== 3) {
    if (fget(tile, 3)) {
      if (g.pl.hp > 0) sfx(58);
      hit_player(g.pl, 99, -ssgn(e.x - g.pl.x), -1);
    }
  }

  if (g.pl.state === 0 && !g.pl.inair) {
    if (g.lore_reply) {
      speak(g.lore_reply);
      set_anim(g.pl, [64]);
    }
  }

  update_entity(e);

  if (idiv(e.y, 8) > 31) {
    collapse_player();
    e.hp = 0;
    e.dy = 0;
  }
}

export function player_hit_floor(e) {
  sfx(54);

  if (g.pl.state === 4) {
    e.ladder_cooldown = 8;
    e.state = 0;
  }

  entity_hit_floor(e);

  if ((!e.stomped && e.ody > 6) || e.hp <= 0) {
    hit_player(g.pl, 1);
    collapse_player(true);
    g.pl.ix = 0;
  } else {
    if (g.pl.state === 3) {
      if (g.pl.hp > 0) {
        set_anim(g.pl, [72]);
      }
    }
  }
}

export function collapse_player() {
  g.pl.state = 2;
  g.pl.collapsed_cooldown = 30;
  set_anim(g.pl, g.pl.hp > 0 ? [71, 71, 71, 72] : [71]);
  g.pl.fs = 8;
}

export function hit_player(src, amnt, dx, dy) {
  const pl = g.pl;
  if (pl.hp > 0 && pl.state !== 3) {
    pl.hp -= amnt;

    pl.state = 3;
    pl.inair = true;
    pl.hit_cooldown = 15;

    pl.rushing = false;
    pl.rush_count = 0;

    pl.ix = fx(0.7);

    pl.dx = dx ?? pl.dx;
    pl.dy = dy ?? pl.dy;

    set_anim(pl, [70]);
  }
}

export function draw_player(e) {
  const pl = g.pl;
  if (e.rushing || e.stomped) {
    // globals in the cartridge
    g.ox = pl.x;
    g.oy = pl.y;

    for (let i = 1; i <= 15; i++) pal(i, 12);
    pl.x = pl.ox2;
    pl.y = pl.oy2;
    draw_entity(e);

    for (let i = 1; i <= 15; i++) pal(i, 7);
    pl.x = pl.ox;
    pl.y = pl.oy;
    draw_entity(e);

    pl.x = g.ox;
    pl.y = g.oy;
    reset_pal();
  }

  pal(10, 4);

  if (g.outro_step !== 7) {
    if (pl.upg_grab) {
      pal(10, 3); // hands
    }
    if (pl.upg_stomp) {
      pal(2, 14); // feet
    }
    if (pl.upg_vines) {
      pal(4, 3); // head
    }
    if (pl.upg_scale) {
      pal(7, 11); // torso
      pal(6, 15); // torso
    }
    if (pl.upg_rush) {
      pal(13, 3); // pants
      pal(5, 14); // pants
    }
  }

  draw_entity(e);
  reset_pal();

  if (e.flash) {
    e.flash -= 1;
    line(e.x - 2, e.y - e.flash + 2, e.x + 2, e.y - e.flash + 2, 12);
    if (e.flash === 0) e.flash = undefined;
  }
}
