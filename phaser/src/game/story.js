// !spoilers! --

import { g } from "./state.js";
import { cos, del, fdiv, fmul, min, rnd, sin, split, fx } from "../pico8/lib.js";
import { ovalfill, spr } from "../pico8/gfx.js";
import { btnp, O, X } from "../pico8/input.js";
import { sfx } from "../pico8/audio.js";
import { flip, run, t } from "../pico8/system.js";
import { fadeout, pr, tlen } from "./helpers.js";
import { set_anim } from "./entities.js";
import { make_spin_orb } from "./enemies.js";
import { player_walk_anim } from "./player.js";
import { speak } from "./main.js";
import { make_dot } from "./particles.js";

const lore = [
  "WE USED OUR\nLAST POWERS\nTO BRING YOU\nHERE",
  "WE ARE WEAK\nOUR POWER LOST\nTAKE US TO\nTHE CORE",
  "WE THOUGHT\nUS INVINCIBLE\nBUT OUR PLANET\nCOLLAPSED",
  "EIGHT OF US\nSTAYED BEHIND\nSO MILLIONS\nCOULD ESCAPE",
  "EONS HAVE\nPASSED SINCE\nTHE CALAMITY",
  "ALL THAT NOW\nREMAINS ARE\nOUR SPIRITS",
  "OUR WORLD...\nA MIRACLE\nNOW ONLY\nRUINS REMAIN",
  "AT LAST WE\nARE TOGETHER\nHELP US\nMOVE ON",
  "WE ARE\nFINALLY HERE\nREADY\nTO MOVE ON",
  "WE OWE YOU\nOUR ETERNAL\nGRATITUDE",
  "NOTHING\nIS LEFT\nCOME\nWITH US",
  "OUR JOURNEY\nCONTINUES\n\nTOGETHER"
];

export function draw_lore(id) {
  // make wobbly ovals
  const r1 = min(29, g.lore_count * 2);
  const w1 = r1 + 2 * sin(t());
  const h1 = r1 + 2 * cos(fmul(t(), 1.5));
  const w2 = w1 - 2;
  const h2 = h1 - 2;
  ovalfill(g.lorex - w1, g.lorey - h1, g.lorex + w1, g.lorey + h1, 12);
  ovalfill(g.lorex - w2, g.lorey - h2, g.lorex + w2, g.lorey + h2, 7);

  g.lorex += fmul(32 - g.lorex, fx(0.1));
  g.lorey += fmul(32 - g.lorey, fx(0.1));

  if (g.lore_count > 15) {
    const lines = split(lore[id - 1], "\n");
    for (let l = 1; l <= min(lines.length, fdiv(g.lore_count - 15, 8)); l++) {
      pr(lines[l - 1], 32 - tlen(lines[l - 1])[0] / 2, 12 + l * 7, 12);
    }

    spr(126 + sin(t()), 56, 56);
  }
}

export function update_outro() {
  const pl = g.pl;
  if (g.outro_step < 2) {
    if (rnd() < fx(0.05)) {
      make_dot(928, 96);
    }
  } else if (g.outro_step < 4) {
    make_dot(928, 96);
  }

  g.outro += 1;
  if (g.outro === 120) {
    g.outro_step = 2;
    g.active_lore = true;
    g.lore_count = 1;
  } else if (g.outro === 121) {
    if (pl.lore === 8) {
      g.outro_step = 2.5;
      g.active_lore = true;
      g.lore_count = 1;
    }
  } else if (g.outro === 150) {
    if (pl.lore === 8) {
      g.last_orb = make_spin_orb(pl.x + 4, pl.y - 3, fx(15 / 16), 80, fx(0.03));
      g.last_orb.is_player = true;
      set_anim(g.last_orb, [185]);
      del(g.entities, pl);
    } else {
      speak(["i HOPE IT\nWILL WORK!"]);
    }
  } else if (g.outro === 180) {
    if (pl.lore === 8) {
      set_anim(g.last_orb, [185, 169], true);
    }
  } else if (g.outro === 220) {
    if (pl.lore === 8) {
      set_anim(g.last_orb, [121, 122, 123, 124]);
    }
    g.outro_step = 3;
    sfx(51);
  } else if (g.outro === 260) {
    g.outro_step = 4;
    g.lorey = -32;
    g.active_lore = true;
    g.lore_count = 1;
  } else if (g.outro === 261) {
    fadeout();

    if (pl.lore === 8) {
      // good ending
      //  goto end screen
      g.outro_step = 5;
    } else {
      // bad ending
      //  launch animaiton

      // wait a bit
      for (let i = 0; i <= 45; i++) {
        flip();
      }

      // run animatiom
      g.outro_step = 6;
      g.camx = g.camtx = 192;
      g.camy = g.camty = 64;
      pl.x = 255;
      pl.y = 101;
      pl.dir = -1;
      pl.visible = false;
      set_anim(pl, player_walk_anim, true);
    }
  }

  // end screen
  if (g.outro_step === 5) {
    if (g.outro > 300) {
      if (btnp(X) || btnp(O)) {
        fadeout();
        run();
      }
    }
  }

  // handle bad ending
  if (g.outro_step === 6) {
    if (g.outro > 320 && g.outro < 420) {
      // walk into screen
      pl.x -= 0.25;
      pl.fs = 8;
      pl.visible = true;
    }

    if (g.outro === 400) {
      sfx(54);
      set_anim(pl, [72]);
      speak(["gASP!\nmY LUNGS...", "uNBEARABLE.."]);
    } else if (g.outro === 401) {
      set_anim(pl, player_walk_anim, true);
    } else if (g.outro === 421) {
      sfx(54);
      set_anim(pl, [72]);
      speak(["i CAN'T\nCONTINUE.", "mY JOURNEY\nENDS HERE."]);
    } else if (g.outro === 434) {
      set_anim(pl, [71, 184]);
      pl.fs = 30;
      sfx(54);
    } else if (g.outro === 480) {
      g.outro_step = 7;
    }
  }

  if (g.outro_step === 7) {
    if (g.outro === 480) {
      set_anim(pl, [184, 183, 182, 166, 150, 150, 134]);
      pl.fs = 8;
      sfx(57);
    } else if (g.outro > 600) {
      fadeout();
      g.outro_step = 5;
    }
  }
}
