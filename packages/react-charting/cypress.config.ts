import { defineConfig } from 'cypress';
const getCompareSnapshotsPlugin = require('cypress-visual-regression/dist/plugin');

export default defineConfig({
  env: {
    screenshotsFolder: 'cypress/snapshots/actual',
    trashAssetsBeforeRuns: true,
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      getCompareSnapshotsPlugin(on, config);
    },
    includeShadowDom: true,
    defaultCommandTimeout: 60000,
    chromeWebSecurity: false,
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
});
