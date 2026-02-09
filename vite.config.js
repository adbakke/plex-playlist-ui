import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const plexUrl = (env.PLEX_URL || 'http://localhost:32400').replace(/\/$/, '');

  return {
    plugins: [
      vue(),
      federation({
        name: 'plexPlaylistUI',
        filename: 'remoteEntry.js',
        exposes: {
          './mount': './src/mount.js',
        },
        // No shared modules — the remote bundles its own Vue + PrimeVue.
        // This avoids shared-module path issues with Nuxt's dev server.
        shared: [],
      }),
    ],
    build: {
      modulePreload: false,
      target: 'esnext',
      minify: false,
      cssCodeSplit: false,
    },
    server: {
      proxy: {
        '/api': {
          target: plexUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('X-Plex-Token', env.PLEX_TOKEN || '');
              proxyReq.setHeader('Accept', 'application/json');
            });
          },
        },
      },
    },
  }
})
