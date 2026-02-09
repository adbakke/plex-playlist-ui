import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'
import './style.css'
import PlaylistApp from './components/PlaylistApp.vue'

/**
 * Mount the Plex Playlist UI into a host element.
 * Used for micro-frontend integration (e.g. from music-manager-frontend).
 *
 * @param {HTMLElement} el - DOM element to mount into
 * @param {object} opts - Options
 * @param {string} opts.apiBase - API base path (default: '/api')
 * @returns {{ unmount: () => void }} - Cleanup handle
 */
export function mount(el, opts = {}) {
  const app = createApp(PlaylistApp, {
    apiBase: opts.apiBase || '/api',
  })

  app.use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: '.dark',
      },
    },
  })
  app.use(ConfirmationService)
  app.use(ToastService)

  app.mount(el)

  return {
    unmount() {
      app.unmount()
    },
  }
}
