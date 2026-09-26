import { defineConfig } from "vite";

// The Phaser 4 version lives in phaser/ and reads the cartridge data from
// src/ascent.p8. The PICO-8 version at the root is served as is (npm start).
export default defineConfig({
  root: "phaser",
  // Relative paths so the build also works from a subfolder (e.g. GitHub Pages)
  base: "./",
  server: { port: 8080 },
  preview: { port: 8080 },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    // Phaser alone is about 1.3 MB minified
    chunkSizeWarningLimit: 1600
  }
});
