<template>
  <div class="app-container">
    <header class="app-header">
      <h1><i class="pi pi-play-circle header-icon" /> Plex Playlist Manager</h1>
      <div class="connection-status">
        <span v-if="connected" class="status-ok">
          <i class="pi pi-check-circle" /> {{ serverName }}
        </span>
        <span v-else-if="connectError" class="status-err">
          <i class="pi pi-times-circle" /> {{ connectError }}
        </span>
        <span v-else class="status-loading">
          <i class="pi pi-spin pi-spinner" /> Connecting...
        </span>
      </div>
    </header>

    <Toast />

    <main v-if="connected">
      <PlaylistTable :playlists="playlists" :loading="loading" @refresh="fetchPlaylists" />
    </main>

    <main v-else-if="connectError" class="error-panel">
      <i class="pi pi-exclamation-triangle error-icon" />
      <h3>Failed to connect to Plex</h3>
      <p class="error-detail">{{ connectError }}</p>
      <Button label="Try Again" icon="pi pi-refresh" @click="connect" class="retry-btn" />
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import PlaylistTable from './components/PlaylistTable.vue'
import { usePlex } from './composables/usePlex'

const { playlists, loading, fetchPlaylists, testConnection } = usePlex()

const connected = ref(false)
const connectError = ref(null)
const serverName = ref('')

async function connect() {
  connected.value = false
  connectError.value = null
  try {
    serverName.value = await testConnection()
    connected.value = true
    await fetchPlaylists()
  } catch (e) {
    connectError.value = e.message
  }
}

onMounted(connect)
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
}
.app-header h1 {
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #f3f4f6;
}
.header-icon {
  color: var(--color-purple);
}
.connection-status {
  font-size: 0.85rem;
}
.status-ok {
  color: #4ade80;
}
.status-err {
  color: #f87171;
}
.status-loading {
  color: #fbbf24;
}
.error-panel {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
}
.error-icon {
  font-size: 2.5rem;
  color: var(--color-purple);
  margin-bottom: 1rem;
}
.error-panel h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f3f4f6;
  margin-bottom: 0.5rem;
}
.error-detail {
  color: #9ca3af;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}
.retry-btn {
  background: var(--color-purple) !important;
  border-color: var(--color-purple) !important;
}
.retry-btn:hover {
  background: #9a2b89 !important;
}
</style>
