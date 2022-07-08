import { defineConfig } from "cypress";

export default defineConfig({
  fixturesFolder: false,
  e2e: {
    // setupNodeEvents(on, config) {},
    baseUrl: "http://localhost:4455",
  },
  video: false,
  screenshotOnRunFailure: false,
  responseTimeout: 5000,
});
