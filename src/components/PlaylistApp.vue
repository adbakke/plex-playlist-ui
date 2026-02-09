<template>
  <div class="playlist-app">
    <div v-if="connected">
      <PlaylistTable :playlists="playlists" :loading="loading" @refresh="fetchPlaylists" />
    </div>

    <div v-else-if="connectError" class="error-panel">
      <i class="pi pi-exclamation-triangle error-icon" />
      <h3>Failed to connect to Plex</h3>
      <p class="error-detail">{{ connectError }}</p>
      <Button label="Try Again" icon="pi pi-refresh" @click="connect" class="retry-btn" />
    </div>

    <div v-else class="loading-panel">
      <i class="pi pi-spin pi-spinner loading-icon" />
      <p>Connecting to Plex...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Button from 'primevue/button'
import PlaylistTable from './PlaylistTable.vue'
import { usePlex, setApiBase } from '../composables/usePlex'

const props = defineProps({
  apiBase: { type: String, default: '/api' },
})

// Set the API base path for this instance
setApiBase(props.apiBase)

const { playlists, loading, fetchPlaylists, testConnection } = usePlex()

const connected = ref(false)
const connectError = ref(null)

async function connect() {
  connected.value = false
  connectError.value = null
  try {
    await testConnection()
    connected.value = true
    await fetchPlaylists()
  } catch (e) {
    connectError.value = e.message
  }
}

onMounted(connect)
</script>

<style scoped>
.error-panel {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--bg-secondary, #1a1f2e);
  border: 1px solid var(--border-primary, #3a4556);
  border-radius: 0.5rem;
}
.error-icon {
  font-size: 2.5rem;
  color: var(--color-purple, #a93097);
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
  background: var(--color-purple, #a93097) !important;
  border-color: var(--color-purple, #a93097) !important;
}
.loading-panel {
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
}
.loading-icon {
  font-size: 2rem;
  color: var(--color-purple, #a93097);
  display: block;
  margin-bottom: 1rem;
}
</style>
