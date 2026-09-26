"use strict";

const { defineConfig, devices } = require("@playwright/test");

const PORT = 8181;

module.exports = defineConfig({
  testDir: "tests",
  // The comparisons run PICO-8 in the browser, which takes a while
  timeout: 300000,
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}/`,
    launchOptions: {
      args: ["--autoplay-policy=no-user-gesture-required"]
    }
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Tests run against the production build of the Phaser version
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: false
  }
});
