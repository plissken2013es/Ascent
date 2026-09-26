#!/usr/bin/env node
/**
 * Builds the website published on GitHub Pages into dist-site/:
 *
 *   index.html   a menu to choose the version to play (from site/)
 *   pico8/       the PICO-8 web export, from the main branch as it is
 *   phaser4/     the Phaser 4 version (the Vite build), with the level editor
 *                (phaser4/editor.html)
 *
 * Both games and the editor get a link back to the menu.
 *
 * Usage: npm run build:site [-- <git ref of the PICO-8 version>]
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { build } from "vite";

const OUT = path.resolve("dist-site");

// The PICO-8 version is a static site: it needs no build, only these files
const PICO8_REF = process.argv[2] || findRef(["origin/main", "main"]);
const PICO8_FILES = ["index.html", "js", "css", "img", "site.webmanifest"];

fs.rmSync(OUT, { recursive: true, force: true });

// The menu
await build({
  configFile: false,
  root: "site",
  base: "./",
  logLevel: "warn",
  build: { outDir: OUT, emptyOutDir: true }
});

// The Phaser 4 version (vite.config.mjs)
await build({ logLevel: "warn", build: { outDir: path.join(OUT, "phaser4"), emptyOutDir: true } });

// The PICO-8 version
const pico8 = path.join(OUT, "pico8");
fs.mkdirSync(pico8);
const archive = execFileSync("git", ["archive", "--format=tar", PICO8_REF, ...PICO8_FILES], {
  maxBuffer: 256 * 1024 * 1024
});
execFileSync("tar", ["-x", "-C", pico8], { input: archive });

// serve the files as they are (no Jekyll processing)
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");

addMenuLink(path.join(pico8, "index.html"));
addMenuLink(path.join(OUT, "phaser4", "index.html"));
addEditorMenuLink(path.join(OUT, "phaser4", "editor.html"));

console.log(`Site built in ${path.relative(process.cwd(), OUT)}/ (PICO-8 version from ${PICO8_REF})`);

function findRef(candidates) {
  for (const ref of candidates) {
    try {
      execFileSync("git", ["rev-parse", "--verify", "--quiet", ref], { stdio: "ignore" });
      return ref;
    } catch {
      // try the next one
    }
  }
  throw new Error(`None of ${candidates.join(", ")} exists: fetch the main branch first`);
}

// Adds a link back to the menu in the top left corner, over the game
function addMenuLink(file) {
  const html = fs.readFileSync(file, "utf8");
  const link =
    '<a href="../" style="position: fixed; top: 6px; left: 8px; z-index: 100; color: #888; ' +
    'font: 14px sans-serif; text-decoration: none">&larr; Menu</a>';
  const updated = html.replace("</body>", `  ${link}\n  </body>`);
  if (updated === html) {
    throw new Error(`No </body> in ${file}`);
  }
  fs.writeFileSync(file, updated);
}

// The editor fills the window: its link goes in the header, next to the game's
function addEditorMenuLink(file) {
  const html = fs.readFileSync(file, "utf8");
  const updated = html.replace("<!-- menu -->", '<a href="../" title="Back to the menu">Menu</a>');
  if (updated === html) {
    throw new Error(`No menu placeholder in ${file}`);
  }
  fs.writeFileSync(file, updated);
}
