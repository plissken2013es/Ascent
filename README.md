# Ascent

Crashed on a desolate but mysterious planet you find yourself eye to eye with an ancient civilisation. Explore the planet, find powerful upgrades, and uncover its secrets.

## Play Online

- Browser: https://ascent.oklemenz.de
- Keyboard
  - `Cursor keys`: Movement
    - `Left/Right key`: Walk Left/Right
    - `Up/Down key`: Climb Ladders
  - `X/C`: Jump, Dash (when in air), Confirm 

## Play Mobile

- Browser: https://ascent.oklemenz.de
  - Use Landscape Mode (Single Tab, Disable Landscape Tab Bar in Browser Settings)
- Add to Home Screen to start as Fullscreen App
- Touch Controls (tap area on screen)
  - Game:
    - Use Virtual Gamepad

## Play GitHub Version

- Browser: https://oklemenz.github.io/Ascent

## Play Locally

- Install [Node.js](https://nodejs.org)
- Clone: `https://github.com/oklemenz/Ascent.git`
- Terminal:
  - `npm install`
  - `npm start`
- Browser: `localhost:8080`

## Source

The PICO-8 cartridge source (Lua code, sprites, map, sound and music) is located at `src/ascent.p8`.
It is the cartridge embedded in the web export (`_cartdat` in `js/ascent_1.1.js`).

- Install [shrinko8](https://github.com/thisismypassport/shrinko8): `pip install shrinko`
- Edit `src/ascent.p8` (in PICO-8 or any text editor)
- Terminal:
  - `npm run cart:build`: Write `src/ascent.p8` into `js/ascent_1.1.js`
  - `npm run cart:extract`: Write `js/ascent_1.1.js` back into `src/ascent.p8`

## Phaser 4 Version

A port of the game to JavaScript and [Phaser 4](https://phaser.io), in `phaser/`.

- Terminal:
  - `npm install`
  - `npm run dev`: Development server at `localhost:8080`
  - `npm run build`: Production build in `dist/` (works from a subfolder)
  - `npm run preview`: Serve the production build
- Controls: like PICO-8
  - Keyboard: `Cursor keys`, `Z/C/N` (🅾️: Jump, Dive), `X/V/M` (❎: Dash, Confirm)
  - Gamepad: D-Pad or left stick, `A/Y` (🅾️), `B/X` (❎)
  - Touch screens: virtual gamepad

- Website with both versions (as on GitHub Pages):
  - `npm run build:site`: Menu in `dist-site/`, the PICO-8 version (from the `main` branch) in `dist-site/pico8/` and
    the Phaser 4 version in `dist-site/phaser4/`
  - `npm run preview:site`: Serve it at `localhost:8080`
  - `.github/workflows/publish-site.yml` publishes it to the `gh-pages` branch on each push to `phaser4` or `main`

### Structure

- `phaser/src/game/`: The Lua code of `src/ascent.p8`, ported by hand. One file per tab of the cartridge, with the same
  function names, so both can be compared side by side (`⧗` is `tick`, `▒` is `tile`).
- `phaser/src/pico8/`: What the game needs from PICO-8
  - `cart.js`: Reads the sprites, map, flags, sound effects and music from `src/ascent.p8` (at build time), so editing
    the cartridge changes both versions
  - `gfx.js`: 128x128 screen of palette indices, draw and screen palettes, fill patterns and the drawing functions
  - `lib.js`: 16:16 fixed point arithmetic where it matters, `sin`/`cos` (table measured from PICO-8), the PICO-8
    random generator, `all()`, `split()`, ...
  - `system.js`: 30 fps loop with `_init`/`_update`/`_draw`, `t()`, `flip()` and `run()`
  - `synth/`: Sound effects and music, synthesized at 22050 Hz in an `AudioWorklet` (port of the synthesizer of
    [zepto8](https://github.com/samhocevar/zepto8))
- `phaser/src/AscentScene.js`: The Phaser scene: runs the loop, shows the 64x64 screen scaled to the window, reads
  keyboard, gamepad and touch input and plays the sound through Phaser's audio context

### Tests

- Install [shrinko8](https://github.com/thisismypassport/shrinko8) (`pip install shrinko`) for the comparisons with
  PICO-8
- Terminal: `npx playwright install chromium` (once), then `npm test` ([Playwright](https://playwright.dev))
  - `tests/smoke.spec.js`: Boots, plays and restarts the game
  - `tests/reference.spec.js`: Plays scripted scenarios (`tests/pico8/scenarios.js`: intro, random play, ladders,
    death and respawn, upgrades, lore, mushrooms, fan, blobs, vines, all checkpoints, both endings) in the PICO-8 web
    export and in the Phaser version, and compares every frame: player position, screen and screen palette, `t()` and
    the sounds played. The PICO-8 side runs the cartridge with a test harness (`tests/pico8/harness.lua`: fixed seed,
    scripted buttons, `printh` trace).
  - `tests/probes.spec.js`: Compares `ovalfill`, `circfill`, `line`, `fillp`, `sin`, `cos`, the fixed point arithmetic
    and `rnd` with what PICO-8 computes (`tests/pico8/probes/`), pixel by pixel and bit by bit
  - `tests/sound.spec.js`: Records PICO-8 playing each sound effect and the music, and compares duration, volume
    envelope and spectrum with the synthesizer

The game logic and the graphics give the same result as PICO-8 frame by frame. The sound is close but not identical:
the synthesizer follows zepto8, and e.g. PICO-8 fades notes that start with a fade-in from silence instead of from the
previous note.

## Credits

- https://johanpeitz.itch.io/ascent
