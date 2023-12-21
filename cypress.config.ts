import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
  },
  includeShadowDom: true,
  chromeWebSecurity: false,
  experimentalFetchPolyfill: true,
  trashAssetsBeforeRuns: true,
  screenshotOnRunFailure: false,
  video: false,
  videoCompression: 32,
  reporter: 'mochawesome',
  env: {
    name: 't5',
    hotel_id: '1001',
    lang: 'en_us',
    products_url: 'http://127.0.0.1:4200/'
}
});
