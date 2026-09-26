// ★ ascent ★
// by @johanpeitz
// audio by @vavmusicmagic
// for lowrez jam 2022
//
// Port of the PICO-8 cartridge (src/ascent.p8, v1.1) to JavaScript. Each file
// is one tab of the cartridge, with the same function names.

import { g, resetState } from "./state.js";
import { add, all, del, idiv, max, min, mod, rnd, sin, split, fx } from "../pico8/lib.js";
import { camera, cls, fget, line, map, mget, mset, poke, rect, rectfill, spr } from "../pico8/gfx.js";
import { btnp, O, X } from "../pico8/input.js";
import { music, sfx } from "../pico8/audio.js";
import { t } from "../pico8/system.js";
import { aabb, pr, prc, reset_pal, ssgn, tlen, update_fade } from "./helpers.js";
import { set_anim } from "./entities.js";
import { get_input, make_player } from "./player.js";
import {
  make_bearpig,
  make_blob,
  make_checkpoint,
  make_fan,
  make_lorb,
  make_mushroom,
  make_outro,
  make_pod,
  make_twinkle,
  make_upgrader,
  make_vines
} from "./enemies.js";
import { spawn_sand, update_particles } from "./particles.js";
import { draw_lore, update_outro } from "./story.js";

// The custom font (poked at 0x5600)
const FONT =
  "6,8,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0," +
  "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0," +
  "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,63,63,63,63,63,63,63,0,0,0,63," +
  "63,63,0,0,0,0,0,63,51,63,0,0,0,0,0,51,12,51,0,0,0,0,0,51,0,51,0,0,0,0,0,51,51,51,0,0,0,0,48,60," +
  "63,60,48,0,0,0,3,15,63,15,3,0,0,62,6,6,6,6,0,0,0,0,0,48,48,48,48,62,0,99,54,28,62,8,62,8,0,0,0," +
  "0,24,0,0,0,0,0,0,0,0,0,12,24,0,0,0,0,0,0,12,12,0,0,0,10,10,0,0,0,0,0,4,10,4,0,0,0,0,0,0,0,0,0,0," +
  "0,0,1,1,1,0,1,0,0,0,5,5,0,0,0,0,0,0,0,0,1,0,0,0,0,0,14,17,21,17,14,0,0,0,1,4,2,1,4,0,0,0,0,5,7," +
  "2,0,0,0,0,1,1,0,0,0,0,0,0,2,1,1,1,2,0,0,0,1,2,2,2,1,0,0,0,0,5,2,5,0,0,0,0,0,2,7,2,0,0,0,0,0,0,0," +
  "0,1,1,0,0,0,0,7,0,0,0,0,0,0,0,0,0,1,0,0,0,4,4,2,2,1,1,0,0,2,5,5,5,2,0,0,0,2,3,2,2,2,0,0,0,3,4,2," +
  "1,7,0,0,0,3,4,2,4,3,0,0,0,5,5,7,4,4,0,0,0,7,1,3,4,3,0,0,0,2,1,3,5,2,0,0,0,7,4,4,2,2,0,0,0,2,5,2," +
  "5,2,0,0,0,2,5,6,4,2,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,1,0,0,4,2,1,2,4,0,0,0,0,7,0,7,0,0,0,0,1,2,4," +
  "2,1,0,0,0,3,4,2,0,2,0,0,0,2,5,5,1,6,0,0,0,0,6,5,5,6,0,0,0,1,3,5,5,3,0,0,0,0,6,1,1,6,0,0,0,4,6,5," +
  "5,6,0,0,0,0,2,7,1,2,0,0,0,2,1,1,3,1,1,0,0,0,6,5,7,4,3,0,0,1,3,5,5,5,0,0,0,1,0,1,1,1,0,0,0,2,0,2," +
  "2,2,1,0,0,1,5,3,5,5,0,0,0,1,1,1,1,1,0,0,0,0,15,21,21,21,0,0,0,0,3,5,5,5,0,0,0,0,2,5,5,2,0,0,0,0," +
  "3,5,5,3,1,0,0,0,6,5,5,6,4,0,0,0,5,3,1,1,0,0,0,0,3,1,2,3,0,0,0,1,3,1,1,2,0,0,0,0,5,5,5,6,0,0,0,0," +
  "5,5,5,2,0,0,0,0,17,21,21,10,0,0,0,0,5,2,2,5,0,0,0,0,5,5,6,4,3,0,0,0,15,4,2,15,0,0,0,3,1,1,1,3,0," +
  "0,0,1,1,2,2,4,4,0,0,3,2,2,2,3,0,0,0,2,5,0,0,0,0,0,0,0,0,0,0,7,0,0,0,1,2,0,0,0,0,0,0,2,5,5,7,5,0," +
  "0,0,3,5,3,5,3,0,0,0,6,1,1,1,6,0,0,0,3,5,5,5,3,0,0,0,7,1,3,1,7,0,0,0,7,1,1,3,1,0,0,0,6,1,1,5,6,0," +
  "0,0,5,5,7,5,5,0,0,0,1,1,1,1,1,0,0,0,2,2,2,2,2,1,0,0,5,5,3,5,5,0,0,0,1,1,1,1,7,0,0,0,17,27,21,17," +
  "17,0,0,0,3,5,5,5,5,0,0,0,2,5,5,5,2,0,0,0,3,5,5,3,1,0,0,0,2,5,5,5,2,4,0,0,3,5,5,3,5,0,0,0,6,1,2," +
  "4,3,0,0,0,7,2,2,2,2,0,0,0,5,5,5,5,6,0,0,0,5,5,5,5,2,0,0,0,17,17,21,27,17,0,0,0,5,5,2,5,5,0,0,0," +
  "5,5,5,6,4,2,0,0,7,4,2,1,7,0,0,0,2,2,2,7,2,0,0,0,1,1,1,1,1,1,0,0,0,7,7,7,2,0,0,0,5,2,0,0,0,0,0,0," +
  "0,0,0,0,0,0,0,0,127,127,127,127,127,127,127,0,85,42,85,42,85,42,85,0,65,99,127,93,93,119,62,0," +
  "62,99,99,119,62,65,62,0,17,68,17,68,17,68,17,0,4,12,124,62,31,24,16,0,28,38,95,95,127,62,28,0," +
  "34,119,127,127,62,28,8,0,42,28,54,119,54,28,42,0,62,15,15,6,0,0,0,0,8,28,62,127,62,42,58,0,62," +
  "103,99,103,62,65,62,0,62,127,93,93,127,99,62,0,24,120,8,8,8,15,7,0,62,99,107,99,62,65,62,0,8,20," +
  "42,93,42,20,8,0,0,0,0,85,0,0,0,0,62,115,99,115,62,65,62,0,8,28,127,28,54,34,0,0,127,34,20,8,20," +
  "34,127,0,62,119,99,99,62,65,62,0,0,10,4,0,80,32,0,0,17,42,68,0,17,42,68,0,62,107,119,107,62,65," +
  "62,0,127,0,127,0,127,0,127,0,85,85,85,85,85,85,85,0";

export function reset() {
  resetState();
}

export function _init() {
  // go into 64x64
  poke(0x5f2c, 3);
  poke(0x5f2c, 3);

  // keep palette
  poke(0x5f2e, 1);
  reset_pal();

  // font
  poke(0x5600, ...split(FONT));
  poke(0x5f58, 0x81);

  // kerning (\x91 ➡️, \x8b ⬅️, \x94 ⬆️, \x83 ⬇️, \x8e 🅾️, \x97 ❎)
  g.kerning = {};
  const kdata = split(
    "(=1,)=1,Z=-1,j=1,J=1,.=2,w=-2,W=-2,m=-2,M=-2,S=1,W=-2,'=2,T=1,I=2, =2,i=2,L=2,F=1,\x91=-4,\x8b=-4,\x94=-4,\x83=-4,\x8e=-4,\x97=-4,:=2"
  );
  for (const pair of all(kdata)) {
    const kv = split(pair, "=");
    g.kerning[kv[0]] = kv[1];
  }

  g.fade_progress = 1;
  g.fade_pal = [0, 0, 1, 14, 2, 1, 13, 6, 4, 4, 9, 15, 13, 5, 1, 3];

  g.particles1 = [];
  g.particles2 = [];
  g.entities = [];

  g.tips = {};

  // scan map
  g.rooms = [];
  for (let ry = 0; ry <= 3; ry++) {
    for (let rx = 0; rx <= 15; rx++) {
      g.rooms[rx + ry * 16] = [];
      const r = g.rooms[rx + ry * 16];
      for (let tx = 0; tx <= 7; tx++) {
        for (let ty = 0; ty <= 7; ty++) {
          const x = rx * 8 + tx;
          const y = ry * 8 + ty;
          const tile = mget(x, y);
          const e = parse_tile(tile, x, y);
          if (e && tile !== 64) {
            add(r, { tile, x, y });
            del(g.entities, e);
          }
        }
      }
    }
  }

  // timer
  g.ticks = 0;
  g.lore_count = 0;

  // put player on top
  add(g.entities, del(g.entities, g.pl));
  // start collapsed
  g.pl.state = 2;
  g.pl.collapsed_cooldown = 60;
  set_anim(g.pl, [71]);
  g.pl.fs = 40;

  // camera
  g.shakex = g.shakey = 0;
  set_cam(64 * idiv(g.pl.x, 64), 64 * idiv(g.pl.y, 64));
}

// Creates the entity of a map tile. Only blobs and bearpigs are returned, they
// are created again each time their room is entered.
export function parse_tile(tile, x, y) {
  if (tile === 64) {
    g.pl = make_player(x * 8 + 4, y * 8 + 5);
    mset(x, y, 0);
  }
  if (tile === 183) {
    make_outro(x * 8 + 4, y * 8 + 4).on_draw = undefined;
    mset(x, y, 0);
  }
  if (tile === 94) {
    make_fan(x * 8 + 4, y * 8 + 4).on_draw = undefined;
    mset(x, y, 0);
  }
  if (tile === 121) {
    make_lorb(x * 8 + 4, y * 8 + 4);
    mset(x, y, 0);
  }
  if (tile === 116) {
    mset(x, y, 0);
    make_vines(x * 8 + 4, y * 8 + 4);
  }
  if (tile === 80) {
    mset(x, y, 0);
    return make_blob(x * 8 + 4, y * 8 + 6);
  }
  if (tile === 197) {
    mset(x, y, 0);
    make_twinkle(x * 8 + 4, y * 8 + 4);
  }
  if (tile === 88) {
    mset(x, y, 0);
    make_mushroom(x * 8 + 4, y * 8 + 4);
  }
  if (tile === 96) {
    mset(x, y, 0);
    make_checkpoint(x * 8 + 4, y * 8 + 4);
  }
  if (tile === 98) {
    mset(x, y, 0);
    return make_bearpig(x * 8 + 4, y * 8 + 4);
  }
  if (tile === 145) {
    make_upgrader(x * 8 + 4, y * 8 + 7);
  }
  if (tile === 148) {
    make_pod(x * 8 + 4, y * 8 + 7);
  }

  g.tick = 0;
  g.intro = 20;
  return undefined;
}

export function swap_room(rx, ry) {
  // remove olds
  for (const e of all(g.room_entities)) {
    del(g.entities, e);
  }

  // add news
  const r = g.rooms[rx + ry * 16];
  g.room_entities = [];
  for (const e of all(r)) {
    const ee = parse_tile(e.tile, e.x, e.y);
    if (ee) {
      add(g.room_entities, ee);
    }
  }
}

export function set_cam(cx, cy) {
  g.camtx = cx;
  g.camty = cy;
  g.camx = g.camtx;
  g.camy = g.camty;
}

export function speak(lines) {
  g.speech_page = 1;
  g.speech = lines;
}

export function _update() {
  g.tick += 1;
  if (g.tick > 32000) {
    g.tick -= 32000;
  }

  // handle speech bubble
  if (g.lore_count > 0 && g.lore_count < 100) {
    g.lore_count += 1;
  }

  // if (btnp(3,1)) debug=not debug

  if (g.fade_progress > 0) {
    g.fade_progress -= fx(0.075);
  }

  if (g.camx === g.camtx && g.camy === g.camty) {
    update_particles(g.particles1);
    update_particles(g.particles2);

    if (g.speech) {
      if (btnp(X)) {
        sfx(52);
        g.speech_page += 1;
        if (g.speech_page > g.speech.length) {
          g.speech = undefined;
          g.lore_reply = undefined;
        }
      }
    } else if (g.active_lore) {
      if (btnp(X)) {
        sfx(52);
        g.active_lore = false;
      }
    } else {
      if (g.intro < 0 && mod(g.tick, 30) === 0 && !g.outro) {
        g.ticks += 1;
      }

      if (g.outro) {
        update_outro();
      } else {
        get_input(g.pl);
      }

      for (const e of all(g.entities)) {
        e.on_update(e);
      }

      for (const e of all(g.entities)) {
        if (e.on_hit_player) {
          if (aabb(e, g.pl)) {
            e.on_hit_player(e);
          }
        }
      }
    }
  }

  const ocx = g.camtx;
  const ocy = g.camty;

  g.camtx = min(960, max(0, 64 * idiv(g.pl.x, 64)));
  g.camty = min(192, max(0, 64 * idiv(g.pl.y, 64)));
  g.camx += 4 * ssgn(g.camtx - g.camx);
  g.camy += 4 * ssgn(g.camty - g.camy);

  if (ocx !== g.camtx || ocy !== g.camty) {
    swap_room(idiv(g.camtx, 64), idiv(g.camty, 64));
  }

  if (g.intro !== 20 && g.intro > -32) {
    g.intro -= 1;
  }

  if (g.intro === 20 && btnp(O)) {
    set_anim(g.pl, [71, 72]);
    g.pl.fs = 60;
    g.intro = 19;
    music(0);
  }

  // desert storm
  for (let i = 1; i <= 4; i++) {
    spawn_sand(-1, 192 + rnd(48) + 24, rnd(3) + 1);
  }
}

export function _draw() {
  cls();

  // fancy bg effects
  if (g.outro_step === 2) {
    const cols = split("0,1,0,0,0,0,0,0,0,1,0,0,0,0,1,1,1,1");
    const c = cols[mod(g.outro, cols.length)];
    cls(c);
  } else if (g.outro_step === 3) {
    const cols = [7, 6, 12, 13, 12, 6, 7];
    const c = cols[mod(g.outro, cols.length)];
    cls(c);
  }

  // show last screen
  if (g.outro_step === 5) {
    prc("sPIRITS SAVED", 32, 10, 12, 5);
    prc(g.pl.lore + "/8", 32, 18, 12, 5);

    prc("tIME PLAYED", 32, 30, 12, 5);
    const mins = idiv(g.ticks, 60);
    const secs = g.ticks - mins * 60;
    prc(mins + ":" + (secs > 9 ? "" : "0") + secs, 32, 38, 12, 5);

    prc("tHANKS FOR PLAYING", 32, 50, 7, 13);
  } else {
    // render game

    // override some stuff

    camera(g.camx + g.shakex, g.camy + g.shakey);
    g.shakex = g.shakey = 0;

    if (!g.debug) {
      map();
    } else {
      // debug map (flags)
      const tx = idiv(g.camx, 8);
      const ty = idiv(g.camy, 8);
      for (let y = 0; y <= 7; y++) {
        for (let x = 0; x <= 7; x++) {
          const tile = mget(tx + x, ty + y);
          const flag = fget(tile);
          if (flag > 0) {
            const px = x * 8 + g.camx;
            const py = y * 8 + g.camy;
            rect(px, py, px + 7, py + 7, flag + 7);
          }
        }
      }
    }

    // particles
    for (const p of all(g.particles1)) {
      if (p.on_draw) p.on_draw(p);
    }

    // entities
    for (const e of all(g.entities)) {
      if (e.on_draw) e.on_draw(e);
    }

    for (const p of all(g.particles2)) {
      if (p.on_draw) p.on_draw(p);
    }

    // hud
    camera();

    if (g.speech) {
      const txt = g.speech[g.speech_page - 1];
      const [w, h] = tlen(txt);
      const x = max(2, min(58 - w, g.pl.x - w / 2 - g.camx));
      const y = max(2, g.pl.y - h * 8 - 16 - g.camy);
      rectfill(x, y - 1, x + w, y + h * 5 + 3, 7);
      rectfill(x - 1, y, x + w + 1, y + h * 5 + 2, 7);
      const cx = x + w / 4;
      for (let i = -6; i <= 6; i++) {
        line(g.pl.x - 3 - g.camx, g.pl.y - 8 - g.camy, cx + i, y, 7);
      }
      pr(txt, x + 1, y, 1, 6);

      spr(126 + sin(t()), x + w, y + h * 5 - 1);
    }

    if (g.active_lore) {
      let loreid = g.pl.lore;
      if (g.outro_step === 2) loreid = 9;
      if (g.outro_step === 4) loreid = g.pl.lore === 8 ? 12 : 10;
      if (g.outro_step === 2.5) loreid = 11;
      draw_lore(loreid);
    }

    // debug
    if (g.debug) {
      const mins = idiv(g.ticks, 60);
      const secs = g.ticks - mins * 60;
      pr(mins + ":" + (secs > 9 ? "" : "0") + secs, 1, 1, 7);
    }

    if (g.intro > -30) {
      spr(187, 12, g.intro, 5, 1);

      const page = mod(g.tick, 200);
      if (page < 50) {
        pr("pEITZ", 39, 76 - g.intro, 14);
        pr("BY jOHAN pEITZ", 8, 77 - g.intro, 4, 1);
      } else if (page < 100) {
        pr("(Z) TO START", 12, 77 - g.intro, 6, 1);
      } else if (page < 150) {
        pr("aUDIO BY vAV", 10, 77 - g.intro, 4, 1);
      } else if (page < 200) {
        pr("(Z) TO START", 12, 77 - g.intro, 6, 1);
      }
    }
  }

  update_fade();

  // if (not debug) print(outro,1,1,8)
}
