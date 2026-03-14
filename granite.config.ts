import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'if-bought',
  brand: {
    displayName: '그때 샀더라면',
    primaryColor: '#3182F6',
    icon: '/appicon.png',
  },
  web: {
    host: '172.30.1.26',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'vite build',
    },
  },
  permissions: [],
});
