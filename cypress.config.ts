import { defineConfig } from "cypress";

export default defineConfig({
  fixturesFolder: false,
  e2e: {
    // setupNodeEvents(on, config) {},
    baseUrl: "http://localhost:4455",
  },
  video: false,
  screenshotOnRunFailure: false,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  requestTimeout: 5000,
});
