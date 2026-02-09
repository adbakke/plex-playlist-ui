import { ref } from 'vue'

const playlists = ref([])
const loading = ref(false)
const error = ref(null)

// Configurable base path: '/api' standalone, '/api/plex' when federated into music-manager
let basePath = '/api'

export function setApiBase(path) {
  basePath = path.replace(/\/$/, '')
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${basePath}${path}`, {
    headers: { Accept: 'application/json' },
    ...opts,
  })
  if (!res.ok) {
    throw new Error(`Plex API ${res.status}: ${res.statusText}`)
  }
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('json')) {
    return res.json()
  }
  return null
}

export function usePlex() {
  async function fetchPlaylists() {
    loading.value = true
    error.value = null
    try {
      const data = await apiFetch('/playlists')
      // Plex API returns { MediaContainer: { Metadata: [...] } }; some backends return array directly
      const items = Array.isArray(data) ? data : (data?.MediaContainer?.Metadata || [])
      playlists.value = items.map((p) => ({
        id: p.ratingKey,
        title: p.title,
        type: p.playlistType,
        smart: p.smart || false,
        leafCount: p.leafCount || 0,
        duration: p.duration || 0,
        addedAt: p.addedAt ? new Date(p.addedAt * 1000) : null,
        updatedAt: p.updatedAt ? new Date(p.updatedAt * 1000) : null,
        composite: p.composite,
        _raw: p,
      }))
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchPlaylistItems(playlistId) {
    const data = await apiFetch(`/playlists/${playlistId}/items`)
    const items = Array.isArray(data) ? data : (data?.MediaContainer?.Metadata || [])
    return items.map((t) => ({
      id: t.ratingKey,
      playlistItemId: t.playlistItemID,
      title: t.title,
      artist: t.grandparentTitle || t.originalTitle || '',
      album: t.parentTitle || '',
      duration: t.duration || 0,
      userRating: t.userRating || 0,
      ratingCount: t.ratingCount || 0,
      viewCount: t.viewCount || 0,
      lastViewedAt: t.lastViewedAt ? new Date(t.lastViewedAt * 1000) : null,
      addedAt: t.addedAt ? new Date(t.addedAt * 1000) : null,
      year: t.parentYear || null,
      index: t.index,
      thumb: t.parentThumb || t.thumb || '',
      codec: t.Media?.[0]?.audioCodec || '',
      bitrate: t.Media?.[0]?.bitrate || 0,
      _raw: t,
    }))
  }

  async function deletePlaylist(playlistId) {
    await apiFetch(`/playlists/${playlistId}`, { method: 'DELETE' })
    playlists.value = playlists.value.filter((p) => p.id !== playlistId)
  }

  async function rateTrack(ratingKey, rating) {
    const params = new URLSearchParams({
      key: ratingKey,
      identifier: 'com.plexapp.plugins.library',
      rating: String(rating),
    })
    await apiFetch(`/:/rate?${params}`, { method: 'PUT' })
  }

  async function removePlaylistItems(playlistId, playlistItemIds) {
    for (const itemId of playlistItemIds) {
      await apiFetch(`/playlists/${playlistId}/items/${itemId}`, { method: 'DELETE' })
    }
  }

  async function createPlaylist({ title, type = 'audio', uri, sectionId }) {
    const params = new URLSearchParams({
      title,
      type,
      smart: '0',
    })
    if (uri) params.set('uri', uri)
    if (sectionId) params.set('sectionID', sectionId)
    const data = await apiFetch(`/playlists?${params}`, { method: 'POST' })
    await fetchPlaylists()
    return data
  }

  async function fetchLibraries() {
    const data = await apiFetch('/library/sections')
    return (data?.MediaContainer?.Directory || []).map((d) => ({
      id: d.key,
      title: d.title,
      type: d.type,
    }))
  }

  async function testConnection() {
    const data = await apiFetch('/identity')
    return data?.MediaContainer?.friendlyName || 'Connected'
  }

  return {
    playlists,
    loading,
    error,
    fetchPlaylists,
    fetchPlaylistItems,
    deletePlaylist,
    removePlaylistItems,
    rateTrack,
    createPlaylist,
    fetchLibraries,
    testConnection,
  }
}
