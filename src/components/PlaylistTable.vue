<template>
  <div>
    <!-- Playlist list view -->
    <div v-if="!selectedPlaylist">
      <DataTable
        :value="filteredPlaylists"
        :loading="loading"
        sortField="title"
        :sortOrder="1"
        :paginator="filteredPlaylists.length > 20"
        :rows="20"
        dataKey="id"
        :pt="{
          root: { style: 'background: var(--bg-secondary); border: 1px solid var(--border-primary); border-radius: 0.5rem; overflow: hidden;' },
          header: { style: 'background: #151a27; border-bottom: 1px solid var(--border-primary); color: #f3f4f6; padding: 1.25rem 1.5rem;' },
          headerRow: { style: 'background: #151a27; border-bottom: 1px solid var(--border-primary);' },
          headerCell: { style: 'padding: 0.875rem 1rem; color: #9ca3af; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; background: #151a27;' },
          bodyCell: { style: 'color: #d1d5db; padding: 0.875rem 1rem;' },
        }"
      >
        <template #header>
          <div class="table-header">
            <div class="table-header-left">
              <span class="header-title">Your Playlists</span>
              <span class="header-count">{{ playlists.length }} playlists</span>
            </div>
            <div class="table-header-right">
              <span class="p-input-icon-left playlist-search">
                <i class="pi pi-search" />
                <InputText
                  v-model="playlistSearch"
                  placeholder="Search playlists..."
                  size="small"
                />
              </span>
              <Button
                icon="pi pi-refresh"
                severity="secondary"
                text
                rounded
                @click="$emit('refresh')"
                :loading="loading"
              />
            </div>
          </div>
        </template>
        <template #empty>
          <div class="empty-message">
            <i class="pi pi-inbox empty-icon" />
            <p>No playlists found</p>
          </div>
        </template>

        <Column field="type" header="Type" :sortable="true" style="width: 7rem">
          <template #body="{ data }">
            <span class="type-cell">
              <i :class="typeIcon(data.type)" :title="data.type" class="type-icon" />
              <span v-if="data.smart" class="smart-badge" title="Smart playlist">
                <i class="pi pi-bolt" style="font-size: 0.6rem" /> Smart
              </span>
            </span>
          </template>
        </Column>

        <Column field="title" header="Name" :sortable="true">
          <template #body="{ data }">
            <span class="playlist-name-link" @click.stop="openPlaylist(data)">{{ data.title }}</span>
          </template>
        </Column>

        <Column field="leafCount" header="Tracks" :sortable="true" style="width: 6rem">
          <template #body="{ data }">
            <span class="track-stat">
              <i class="pi pi-music" /> {{ data.leafCount }}
            </span>
          </template>
        </Column>

        <Column field="duration" header="Duration" :sortable="true" style="width: 8rem">
          <template #body="{ data }">
            <span class="duration-stat">
              <i class="pi pi-clock" /> {{ formatDuration(data.duration) }}
            </span>
          </template>
        </Column>

        <Column field="addedAt" header="Added" :sortable="true" style="width: 9rem">
          <template #body="{ data }">
            {{ formatDate(data.addedAt) }}
          </template>
        </Column>

        <Column field="updatedAt" header="Updated" :sortable="true" style="width: 9rem">
          <template #body="{ data }">
            {{ formatDate(data.updatedAt) }}
          </template>
        </Column>

        <Column header="Actions" style="width: 7rem">
          <template #body="{ data }">
            <Button
              icon="pi pi-eye"
              text
              rounded
              size="small"
              @click.stop="openPlaylist(data)"
              v-tooltip.top="'View'"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              size="small"
              @click.stop="confirmDelete(data)"
              v-tooltip.top="'Delete'"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Playlist detail / track view -->
    <div v-else>
      <div class="detail-header">
        <Button
          icon="pi pi-arrow-left"
          label="Back"
          text
          @click="closePlaylist"
          class="back-btn"
        />
        <div>
          <h2 class="detail-title">{{ selectedPlaylist.title }}</h2>
          <div class="detail-subtitle">
            <template v-if="!tracksLoading">
              {{ filteredTracks.length }}<template v-if="filteredTracks.length !== tracks.length"> of {{ tracks.length }}</template> tracks
              <span> &middot; {{ formatDuration(selectedPlaylist.duration) }}</span>
            </template>
            <template v-else>Loading tracks...</template>
            <span v-if="selectedPlaylist.smart" class="smart-badge" style="margin-left: 0.5rem">
              <i class="pi pi-bolt" style="font-size: 0.6rem" /> Smart
            </span>
          </div>
        </div>
      </div>

      <div v-if="tracksLoading" class="skeleton-table">
        <div class="skeleton-header-row">
          <div class="skeleton-cell" style="width: 3rem"></div>
          <div class="skeleton-cell" style="width: 3.5rem"><Skeleton height="0.65rem" width="1rem" /></div>
          <div class="skeleton-cell" style="flex: 3"><Skeleton height="0.65rem" width="2.5rem" /></div>
          <div class="skeleton-cell" style="flex: 2"><Skeleton height="0.65rem" width="2.5rem" /></div>
          <div class="skeleton-cell" style="flex: 2"><Skeleton height="0.65rem" width="2.5rem" /></div>
          <div class="skeleton-cell" style="width: 8rem"><Skeleton height="0.65rem" width="2.5rem" /></div>
          <div class="skeleton-cell" style="width: 6rem"><Skeleton height="0.65rem" width="3rem" /></div>
          <div class="skeleton-cell" style="width: 5rem"></div>
        </div>
        <div v-for="i in 10" :key="i" class="skeleton-row">
          <div class="skeleton-cell" style="width: 3rem"><Skeleton width="1.1rem" height="1.1rem" shape="square" /></div>
          <div class="skeleton-cell" style="width: 3.5rem"><Skeleton height="0.85rem" width="1.5rem" /></div>
          <div class="skeleton-cell" style="flex: 3"><Skeleton height="0.85rem" :width="35 + (i * 7) % 45 + '%'" /></div>
          <div class="skeleton-cell" style="flex: 2"><Skeleton height="0.85rem" :width="30 + (i * 11) % 40 + '%'" /></div>
          <div class="skeleton-cell" style="flex: 2"><Skeleton height="0.85rem" :width="25 + (i * 13) % 45 + '%'" /></div>
          <div class="skeleton-cell" style="width: 8rem"><Skeleton height="0.85rem" width="5rem" /></div>
          <div class="skeleton-cell" style="width: 6rem"><Skeleton height="0.85rem" width="3rem" /></div>
          <div class="skeleton-cell" style="width: 5rem"><Skeleton height="0.85rem" width="1.5rem" /></div>
        </div>
      </div>

      <template v-else>
        <!-- Filter bar + bulk actions -->
        <div class="filter-bar">
          <div class="filter-bar-left">
            <MultiSelect
              v-model="ratingFilter"
              :options="ratingOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Filter by Rating"
              display="chip"
              :maxSelectedLabels="6"
              :showToggleAll="false"
              class="rating-filter"
            >
              <template #option="{ option }">
                <div class="rating-option">
                  <template v-if="option.value === 0">
                    <span style="color: #6b7280;">Unrated</span>
                  </template>
                  <template v-else>
                    <span class="skulls-display">
                      <span
                        v-for="n in 5"
                        :key="n"
                        class="skull"
                        :class="n <= option.value ? 'skull-filled' : 'skull-empty'"
                      >💀</span>
                    </span>
                  </template>
                </div>
              </template>
            </MultiSelect>
            <Button
              v-if="ratingFilter.length"
              icon="pi pi-filter-slash"
              label="Clear Filters"
              severity="secondary"
              text
              size="small"
              @click="ratingFilter = []"
            />
            <span class="filter-summary">
              <template v-if="ratingFilter.length">Showing {{ filteredTracks.length }} of </template>{{ tracks.length }} tracks
            </span>
          </div>
          <div class="filter-bar-right">
            <Button
              v-if="selectedTracks.length"
              :label="`Delete ${selectedTracks.length} Track${selectedTracks.length > 1 ? 's' : ''}`"
              icon="pi pi-trash"
              severity="danger"
              size="small"
              @click="confirmBulkDelete"
              :loading="deleting"
            />
          </div>
        </div>

        <DataTable
          :value="filteredTracks"
          dataKey="playlistItemId"
          :paginator="filteredTracks.length > 100"
          :rows="100"
          :rowsPerPageOptions="[50, 100, 200]"
          v-model:first="paginatorFirst"
          :pt="{
            root: { style: 'background: var(--bg-secondary); border: 1px solid var(--border-primary); border-radius: 0.5rem; overflow: hidden;' },
            headerRow: { style: 'background: #151a27;' },
            headerCell: { style: 'padding: 0.75rem 1rem; color: #9ca3af; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; background: #151a27; border-bottom: 1px solid var(--border-primary);' },
            bodyCell: { style: 'color: #d1d5db; padding: 0.75rem 1rem;' },
          }"
        >
          <template #empty>
            <div class="empty-message">
              <i class="pi pi-inbox empty-icon" />
              <p v-if="ratingFilter.length">No tracks match the selected rating filter.</p>
              <p v-else>No tracks in this playlist.</p>
            </div>
          </template>

          <Column style="width: 3rem" :pt="{ headerCell: { style: 'background: #151a27; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-primary);' } }">
            <template #header>
              <Checkbox
                :modelValue="selectedTracks.length > 0 && selectedTracks.length === filteredTracks.length"
                :indeterminate="selectedTracks.length > 0 && selectedTracks.length < filteredTracks.length"
                :binary="true"
                @update:modelValue="toggleSelectAll"
              />
            </template>
            <template #body="{ data, index }">
              <div @click.stop.prevent="(e) => handleTrackCheckbox(e, data, paginatorFirst + index)" style="cursor: pointer; display: inline-flex;">
                <Checkbox
                  :modelValue="isTrackSelected(data)"
                  :binary="true"
                  :tabindex="-1"
                  style="pointer-events: none;"
                />
              </div>
            </template>
          </Column>

          <Column header="#" style="width: 3.5rem">
            <template #body="{ index }">
              <span class="track-num">{{ paginatorFirst + index + 1 }}</span>
            </template>
          </Column>

          <Column field="title" header="Title" :sortable="true">
            <template #body="{ data }">
              <div class="track-title-cell">
                <span class="track-title-link" @click="openTrackDetail(data)">{{ data.title }}</span>
                <span v-if="data.codec" class="codec-badge">{{ data.codec.toUpperCase() }}</span>
              </div>
            </template>
          </Column>

          <Column field="artist" header="Artist" :sortable="true">
            <template #body="{ data }">
              <span class="track-artist">{{ data.artist }}</span>
            </template>
          </Column>

          <Column field="album" header="Album" :sortable="true">
            <template #body="{ data }">
              <span class="track-album">{{ data.album }}</span>
            </template>
          </Column>

          <Column field="userRating" header="Rating" :sortable="true" style="width: 8rem">
            <template #body="{ data }">
              <span class="skulls-display" :title="data.userRating ? `${data.userRating / 2} / 5` : 'Unrated'">
                <span
                  v-for="n in 5"
                  :key="n"
                  class="skull"
                  :class="n <= Math.round(data.userRating / 2) ? 'skull-filled' : 'skull-empty'"
                >💀</span>
              </span>
            </template>
          </Column>

          <Column field="duration" header="Duration" :sortable="true" style="width: 6rem">
            <template #body="{ data }">
              <span class="track-num">{{ formatDuration(data.duration) }}</span>
            </template>
          </Column>

          <Column header="Actions" style="width: 7rem">
            <template #body="{ data }">
              <Button
                icon="pi pi-eye"
                text
                rounded
                size="small"
                @click="openTrackDetail(data)"
                v-tooltip.top="'View'"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                size="small"
                @click="confirmTrackDelete(data)"
                :loading="deleting"
                v-tooltip.top="'Delete'"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </div>

    <!-- Track detail modal -->
    <Dialog
      v-model:visible="detailVisible"
      :header="detailTrack?.title || 'Track Details'"
      modal
      :style="{ width: '40rem', maxWidth: '95vw' }"
      :pt="{
        root: { style: 'background: var(--bg-secondary, #1a1f2e); border: 1px solid var(--border-primary, #3a4556); border-radius: 0.75rem; overflow: hidden;' },
        header: { style: 'background: #151a27; color: #f3f4f6; border-bottom: 1px solid var(--border-primary, #3a4556); padding: 1.25rem 1.5rem; border-radius: 0;' },
        title: { style: 'font-size: 1.1rem; font-weight: 600;' },
        content: { style: 'background: var(--bg-secondary, #1a1f2e); padding: 1.5rem; border-radius: 0;' },
        headerActions: { style: 'color: #9ca3af;' },
        mask: { style: 'background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(2px);' },
      }"
    >
      <div v-if="detailTrack" class="track-detail">
        <!-- Artist / Album / Year -->
        <div class="detail-row">
          <span class="detail-label">Artist</span>
          <span class="detail-value">{{ detailTrack.artist || '-' }}</span>
        </div>
        <div class="detail-row" v-if="detailTrack._raw?.originalTitle && detailTrack._raw.originalTitle !== detailTrack.artist">
          <span class="detail-label">Sort Artist</span>
          <span class="detail-value">{{ detailTrack._raw.originalTitle }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Album</span>
          <span class="detail-value">{{ detailTrack.album || '-' }}<span v-if="detailTrack.year" class="detail-muted"> ({{ detailTrack.year }})</span></span>
        </div>
        <div class="detail-row" v-if="detailTrack.index">
          <span class="detail-label">Track #</span>
          <span class="detail-value">
            <template v-if="detailTrack._raw?.parentIndex">Disc {{ detailTrack._raw.parentIndex }}, </template>Track {{ detailTrack.index }}
          </span>
        </div>

        <!-- Genres / Moods -->
        <div class="detail-row" v-if="detailTrack._raw?.Genre?.length">
          <span class="detail-label">Genre</span>
          <span class="detail-value">
            <span v-for="(g, i) in detailTrack._raw.Genre" :key="g.tag" class="tag-badge">{{ g.tag }}</span>
          </span>
        </div>
        <div class="detail-row" v-if="detailTrack._raw?.Mood?.length">
          <span class="detail-label">Mood</span>
          <span class="detail-value">
            <span v-for="(m, i) in detailTrack._raw.Mood" :key="m.tag" class="tag-badge">{{ m.tag }}</span>
          </span>
        </div>
        <div class="detail-row" v-if="detailTrack._raw?.Style?.length">
          <span class="detail-label">Style</span>
          <span class="detail-value">
            <span v-for="(s, i) in detailTrack._raw.Style" :key="s.tag" class="tag-badge">{{ s.tag }}</span>
          </span>
        </div>

        <div class="detail-divider" />

        <!-- Playback stats -->
        <div class="detail-row">
          <span class="detail-label">Duration</span>
          <span class="detail-value">{{ formatDuration(detailTrack.duration) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Rating</span>
          <span class="detail-value">
            <span
              class="skulls-display skulls-interactive"
              @mouseleave="hoverRating = 0"
            >
              <span
                v-for="n in 5"
                :key="n"
                class="skull"
                :class="n <= (hoverRating || Math.round(detailTrack.userRating / 2)) ? 'skull-filled' : 'skull-empty'"
                @mouseenter="hoverRating = n"
                @click="setRating(detailTrack, n)"
              >💀</span>
            </span>
            <span class="detail-muted" style="margin-left: 0.5rem;">
              <template v-if="hoverRating">Set to {{ hoverRating }} / 5</template>
              <template v-else-if="detailTrack.userRating">{{ detailTrack.userRating / 2 }} / 5</template>
              <template v-else>Unrated</template>
            </span>
          </span>
        </div>
        <div class="detail-row" v-if="detailTrack._raw?.rating">
          <span class="detail-label">Audience</span>
          <span class="detail-value">{{ (detailTrack._raw.rating / 2).toFixed(1) }} / 5<span class="detail-muted" v-if="detailTrack.ratingCount"> ({{ detailTrack.ratingCount }} ratings)</span></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Play Count</span>
          <span class="detail-value">{{ detailTrack.viewCount || 0 }}</span>
        </div>
        <div class="detail-row" v-if="detailTrack.lastViewedAt">
          <span class="detail-label">Last Played</span>
          <span class="detail-value">{{ formatDate(detailTrack.lastViewedAt) }}</span>
        </div>
        <div class="detail-row" v-if="detailTrack.addedAt">
          <span class="detail-label">Added</span>
          <span class="detail-value">{{ formatDate(detailTrack.addedAt) }}</span>
        </div>
        <div class="detail-row" v-if="detailTrack._raw?.updatedAt">
          <span class="detail-label">Updated</span>
          <span class="detail-value">{{ formatDate(new Date(detailTrack._raw.updatedAt * 1000)) }}</span>
        </div>

        <div class="detail-divider" />

        <!-- Audio info -->
        <div class="detail-row" v-if="detailTrack.codec">
          <span class="detail-label">Codec</span>
          <span class="detail-value">
            <span class="codec-badge">{{ detailTrack.codec.toUpperCase() }}</span>
            <span v-if="detailTrack._raw?.Media?.[0]?.audioProfile" class="detail-muted" style="margin-left: 0.5rem;">{{ detailTrack._raw.Media[0].audioProfile.toUpperCase() }}</span>
          </span>
        </div>
        <div class="detail-row" v-if="detailTrack.bitrate">
          <span class="detail-label">Bitrate</span>
          <span class="detail-value">{{ detailTrack.bitrate }} kbps</span>
        </div>
        <div class="detail-row" v-if="detailTrack._raw?.Media?.[0]?.audioChannels">
          <span class="detail-label">Channels</span>
          <span class="detail-value">{{ detailTrack._raw.Media[0].audioChannels === 2 ? 'Stereo' : detailTrack._raw.Media[0].audioChannels + ' ch' }}</span>
        </div>
        <div class="detail-row" v-if="rawStream?.samplingRate">
          <span class="detail-label">Sample Rate</span>
          <span class="detail-value">{{ (rawStream.samplingRate / 1000).toFixed(1) }} kHz</span>
        </div>
        <div class="detail-row" v-if="rawStream?.bitDepth">
          <span class="detail-label">Bit Depth</span>
          <span class="detail-value">{{ rawStream.bitDepth }}-bit</span>
        </div>
        <div class="detail-row" v-if="detailTrack._raw?.Media?.[0]?.container">
          <span class="detail-label">Container</span>
          <span class="detail-value">{{ detailTrack._raw.Media[0].container.toUpperCase() }}</span>
        </div>
        <div class="detail-row" v-if="detailTrack._raw?.Media?.[0]?.Part?.[0]?.size">
          <span class="detail-label">File Size</span>
          <span class="detail-value">{{ formatFileSize(detailTrack._raw.Media[0].Part[0].size) }}</span>
        </div>
        <div class="detail-row" v-if="detailTrack._raw?.Media?.[0]?.Part?.[0]?.file">
          <span class="detail-label">File</span>
          <span class="detail-value detail-file">{{ detailTrack._raw.Media[0].Part[0].file }}</span>
        </div>

        <!-- Other playlists -->
        <div class="detail-divider" />
        <div class="detail-row">
          <span class="detail-label">Also In</span>
          <span class="detail-value" v-if="trackPlaylistsLoading">
            <i class="pi pi-spin pi-spinner" style="font-size: 0.85rem; margin-right: 0.4rem;" />
            Checking {{ playlists.length - 1 }} playlists…
          </span>
          <span class="detail-value" v-else-if="trackPlaylists.length">
            <span
              v-for="(pl, i) in trackPlaylists"
              :key="pl.id"
              class="playlist-link"
              @click="detailVisible = false; goToPlaylist(pl)"
            >{{ pl.title }}<template v-if="i < trackPlaylists.length - 1">, </template></span>
          </span>
          <span class="detail-value detail-muted" v-else>No other playlists</span>
        </div>

        <!-- IDs -->
        <div class="detail-divider" />
        <div class="detail-row">
          <span class="detail-label">Plex ID</span>
          <span class="detail-value detail-muted">{{ detailTrack.id }}</span>
        </div>
        <div class="detail-row" v-if="detailTrack._raw?.guid">
          <span class="detail-label">GUID</span>
          <span class="detail-value detail-muted detail-file">{{ detailTrack._raw.guid }}</span>
        </div>
        <div class="detail-row" v-if="detailTrack._raw?.parentGuid">
          <span class="detail-label">Album GUID</span>
          <span class="detail-value detail-muted detail-file">{{ detailTrack._raw.parentGuid }}</span>
        </div>
        <div class="detail-row" v-if="detailTrack._raw?.grandparentGuid">
          <span class="detail-label">Artist GUID</span>
          <span class="detail-value detail-muted detail-file">{{ detailTrack._raw.grandparentGuid }}</span>
        </div>
      </div>
    </Dialog>

    <ConfirmDialog />
    <Toast position="bottom-right" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import Skeleton from 'primevue/skeleton'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { usePlex } from '../composables/usePlex'

const props = defineProps({
  loading: Boolean,
  playlists: Array,
})
defineEmits(['refresh'])

const confirm = useConfirm()
const toast = useToast()
const { fetchPlaylistItems, deletePlaylist, removePlaylistItems, rateTrack } = usePlex()

const selectedPlaylist = ref(null)
const tracks = ref([])
const tracksLoading = ref(false)
const deleting = ref(false)
const paginatorFirst = ref(0)
const selectedTracks = ref([])
const lastClickedTrackIndex = ref(-1)
const detailTrack = ref(null)
const detailVisible = ref(false)
const hoverRating = ref(0)
const trackPlaylists = ref([])
const trackPlaylistsLoading = ref(false)

const rawStream = computed(() => {
  return detailTrack.value?._raw?.Media?.[0]?.Part?.[0]?.Stream?.[0] || null
})

// --- Rating filter ---
const ratingFilter = ref([])
const ratingOptions = [
  { label: 'Unrated', value: 0 },
  { label: '1 Star', value: 1 },
  { label: '2 Stars', value: 2 },
  { label: '3 Stars', value: 3 },
  { label: '4 Stars', value: 4 },
  { label: '5 Stars', value: 5 },
]

const filteredTracks = computed(() => {
  if (!ratingFilter.value.length) return tracks.value
  return tracks.value.filter((t) => {
    const stars = Math.round((t.userRating || 0) / 2)
    return ratingFilter.value.includes(stars)
  })
})

// Reset paginator when filter changes
watch(ratingFilter, () => {
  paginatorFirst.value = 0
})

// --- Track selection with shift-click ---
function isTrackSelected(track) {
  return selectedTracks.value.some((t) => t.playlistItemId === track.playlistItemId)
}

function toggleSelectAll(checked) {
  if (checked) {
    selectedTracks.value = [...filteredTracks.value]
  } else {
    selectedTracks.value = []
  }
  lastClickedTrackIndex.value = -1
}

function handleTrackCheckbox(event, track, absoluteIndex) {
  // Prevent the default checkbox toggle — we handle it manually
  event.preventDefault()
  event.stopPropagation()

  const currentlySelected = isTrackSelected(track)

  if (event.shiftKey && lastClickedTrackIndex.value >= 0) {
    // Shift-click: select range between last clicked and current
    const start = Math.min(lastClickedTrackIndex.value, absoluteIndex)
    const end = Math.max(lastClickedTrackIndex.value, absoluteIndex)
    const rangeItems = filteredTracks.value.slice(start, end + 1)

    // Build a set of currently selected IDs for fast lookup
    const selectedIds = new Set(selectedTracks.value.map((t) => t.playlistItemId))

    // Add all items in the range
    for (const item of rangeItems) {
      if (!selectedIds.has(item.playlistItemId)) {
        selectedTracks.value.push(item)
      }
    }
  } else {
    // Normal click: toggle single item
    if (currentlySelected) {
      selectedTracks.value = selectedTracks.value.filter(
        (t) => t.playlistItemId !== track.playlistItemId
      )
    } else {
      selectedTracks.value = [...selectedTracks.value, track]
    }
  }

  lastClickedTrackIndex.value = absoluteIndex
}

// --- Playlist search ---
const playlistSearch = ref('')
const filteredPlaylists = computed(() => {
  if (!playlistSearch.value) return props.playlists
  const q = playlistSearch.value.toLowerCase()
  return props.playlists.filter((p) => p.title.toLowerCase().includes(q))
})

// --- Hash routing: #/playlist/{id} ---
function getPlaylistIdFromHash() {
  const match = window.location.hash.match(/^#\/playlist\/(\d+)$/)
  return match ? match[1] : null
}

function setHash(playlistId) {
  window.history.pushState(null, '', `#/playlist/${playlistId}`)
}

function clearHash() {
  window.history.pushState(null, '', window.location.pathname + window.location.search)
}

function onHashChange() {
  const id = getPlaylistIdFromHash()
  if (id && props.playlists?.length) {
    const playlist = props.playlists.find((p) => String(p.id) === id)
    if (playlist && playlist.id !== selectedPlaylist.value?.id) {
      openPlaylist(playlist, false)
    }
  } else if (!id && selectedPlaylist.value) {
    selectedPlaylist.value = null
  }
}

// When playlists load, check if URL has a playlist to open
watch(() => props.playlists, (list) => {
  if (list?.length) {
    const id = getPlaylistIdFromHash()
    if (id) {
      const playlist = list.find((p) => String(p.id) === id)
      if (playlist) openPlaylist(playlist, false)
    }
  }
})

onMounted(() => {
  window.addEventListener('hashchange', onHashChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', onHashChange)
})

async function openPlaylist(playlist, updateHash = true) {
  selectedPlaylist.value = playlist
  if (updateHash) setHash(playlist.id)
  tracksLoading.value = true
  tracks.value = []
  ratingFilter.value = []
  paginatorFirst.value = 0
  selectedTracks.value = []
  lastClickedTrackIndex.value = -1
  try {
    tracks.value = await fetchPlaylistItems(playlist.id)
  } catch (e) {
    tracks.value = []
  } finally {
    tracksLoading.value = false
  }
}

function closePlaylist() {
  selectedPlaylist.value = null
  clearHash()
}

function goToPlaylist(pl) {
  const full = playlists.value.find((p) => p.id === pl.id)
  if (full) openPlaylist(full)
}

function confirmDelete(playlist) {
  confirm.require({
    message: `Delete "${playlist.title}"? This cannot be undone.`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await deletePlaylist(playlist.id)
      toast.add({ severity: 'success', summary: 'Playlist Deleted', detail: `"${playlist.title}" has been deleted`, life: 3000 })
    },
  })
}

function confirmTrackDelete(track) {
  confirm.require({
    message: `Remove "${track.title}" from this playlist?`,
    header: 'Remove Track',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      deleting.value = true
      try {
        await removePlaylistItems(selectedPlaylist.value.id, [track.playlistItemId])
        tracks.value = tracks.value.filter((t) => t.playlistItemId !== track.playlistItemId)
        selectedTracks.value = selectedTracks.value.filter((t) => t.playlistItemId !== track.playlistItemId)
        toast.add({ severity: 'success', summary: 'Track Removed', detail: `"${track.title}" removed from playlist`, life: 3000 })
      } finally {
        deleting.value = false
      }
    },
  })
}

function confirmBulkDelete() {
  const count = selectedTracks.value.length
  confirm.require({
    message: `Remove ${count} track${count > 1 ? 's' : ''} from this playlist? This cannot be undone.`,
    header: 'Remove Tracks',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      deleting.value = true
      try {
        const ids = selectedTracks.value.map((t) => t.playlistItemId)
        await removePlaylistItems(selectedPlaylist.value.id, ids)
        const removedSet = new Set(ids)
        tracks.value = tracks.value.filter((t) => !removedSet.has(t.playlistItemId))
        selectedTracks.value = []
        lastClickedTrackIndex.value = -1
        toast.add({ severity: 'success', summary: 'Tracks Removed', detail: `${count} track${count > 1 ? 's' : ''} removed from playlist`, life: 3000 })
      } finally {
        deleting.value = false
      }
    },
  })
}

function openTrackDetail(track) {
  detailTrack.value = track
  hoverRating.value = 0
  trackPlaylists.value = []
  trackPlaylistsLoading.value = true
  detailVisible.value = true
  findTrackInOtherPlaylists(track.id)
}

async function findTrackInOtherPlaylists(ratingKey) {
  const found = []
  const currentId = selectedPlaylist.value?.id
  for (const pl of playlists.value) {
    if (pl.id === currentId) continue
    try {
      const items = await fetchPlaylistItems(pl.id)
      if (items.some((t) => t.id === ratingKey)) {
        found.push({ id: pl.id, title: pl.title })
      }
    } catch {
      // skip playlists we can't fetch
    }
  }
  trackPlaylists.value = found
  trackPlaylistsLoading.value = false
}

async function setRating(track, skulls) {
  const plexRating = skulls * 2
  try {
    await rateTrack(track.id, plexRating)
    track.userRating = plexRating
  } catch (e) {
    console.error('Failed to set rating:', e)
  }
}

function formatFileSize(bytes) {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB'
  return (bytes / 1073741824).toFixed(2) + ' GB'
}

function typeIcon(type) {
  const icons = {
    audio: 'pi pi-headphones',
    video: 'pi pi-video',
    photo: 'pi pi-image',
  }
  return icons[type] || 'pi pi-list'
}

function formatDuration(ms) {
  if (!ms) return '-'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatDate(d) {
  if (!d) return '-'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.table-header-left {
  display: flex;
  align-items: center;
}
.table-header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.playlist-search :deep(.p-inputtext) {
  background: var(--bg-tertiary, #252b3b) !important;
  border-color: var(--border-primary, #3a4556) !important;
  color: #d1d5db !important;
  width: 14rem;
}
.playlist-search :deep(.p-inputtext::placeholder) {
  color: #6b7280 !important;
}
.playlist-search :deep(.pi-search) {
  color: #6b7280;
}
.header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f3f4f6;
}
.header-count {
  margin-left: 0.75rem;
  font-size: 0.85rem;
  color: #9ca3af;
}
.empty-message {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}
.empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}
.type-cell {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.type-icon {
  color: var(--color-purple, #a93097);
  opacity: 0.7;
}
.smart-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.65rem;
  font-weight: 600;
  background: var(--color-purple, #a93097);
  color: #fff;
  border-radius: 9999px;
  padding: 0.1rem 0.5rem;
  vertical-align: middle;
}
.playlist-name-link {
  color: #f3f4f6;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s;
}
.playlist-name-link:hover {
  color: var(--color-purple, #a93097);
}
.track-stat,
.duration-stat {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #9ca3af;
  font-size: 0.85rem;
}

/* Skulls rating */
.skulls-display {
  display: inline-flex;
  gap: 0.15rem;
  font-size: 0.8rem;
}
.skull {
  line-height: 1;
}
.skull-filled {
  opacity: 1;
}
.skull-empty {
  opacity: 0.2;
  filter: grayscale(1);
}
.skulls-interactive .skull {
  cursor: pointer;
  transition: opacity 0.1s, filter 0.1s;
}

/* Back button */
:deep(.back-btn) {
  color: var(--color-cyan, #3ba5d5) !important;
  border: 1px solid transparent !important;
  transition: all 0.15s !important;
}
:deep(.back-btn:hover) {
  background: #151a27 !important;
  border-color: var(--border-primary, #3a4556) !important;
}

/* Filter bar */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}
.filter-bar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.filter-bar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.rating-filter {
  min-width: 14rem;
}
.filter-summary {
  font-size: 0.8rem;
  color: #9ca3af;
}
.rating-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Skeleton loading table */
.skeleton-table {
  background: var(--bg-secondary, #1a1f2e);
  border: 1px solid var(--border-primary, #3a4556);
  border-radius: 0.5rem;
  overflow: hidden;
}
.skeleton-header-row {
  display: flex;
  align-items: center;
  background: #151a27;
  border-bottom: 1px solid var(--border-primary, #3a4556);
  padding: 0.75rem 0;
}
.skeleton-row {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-primary, #3a4556);
}
.skeleton-row:nth-child(even) {
  background: var(--bg-secondary, #1a1f2e);
}
.skeleton-row:nth-child(odd) {
  background: var(--bg-tertiary, #252b3b);
}
.skeleton-row:last-child {
  border-bottom: none;
}
.skeleton-cell {
  padding: 0 1rem;
  display: flex;
  align-items: center;
}
:deep(.p-skeleton) {
  background: var(--border-primary, #3a4556) !important;
}
:deep(.p-skeleton::after) {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent) !important;
}

/* Detail view */
.detail-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.detail-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: #f3f4f6;
}
.detail-subtitle {
  font-size: 0.85rem;
  color: #9ca3af;
  margin-top: 0.15rem;
}

/* Track cells */
.track-num {
  color: #6b7280;
}
.track-title-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.track-title {
  color: #f3f4f6;
}
.track-title-link {
  color: var(--color-pink, #e4198d);
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: rgba(228, 25, 141, 0.4);
  text-underline-offset: 2px;
  transition: color 0.15s, text-decoration-color 0.15s;
}
.track-title-link:hover {
  color: var(--color-purple, #a93097);
  text-decoration-color: var(--color-purple, #a93097);
}
.track-artist {
  color: #9ca3af;
}
.track-album {
  color: #6b7280;
}
.codec-badge {
  font-size: 0.6rem;
  font-weight: 600;
  color: #6b7280;
  background: var(--bg-tertiary, #252b3b);
  border: 1px solid var(--border-primary, #3a4556);
  border-radius: 3px;
  padding: 0.05rem 0.35rem;
  flex-shrink: 0;
}

/* Track detail modal */
.track-detail {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.detail-row {
  display: flex;
  align-items: baseline;
  padding: 0.5rem 0;
}
.detail-label {
  width: 7rem;
  flex-shrink: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.detail-value {
  color: #f3f4f6;
  font-size: 0.9rem;
}
.detail-muted {
  color: #6b7280;
  font-size: 0.85rem;
}
.detail-file {
  font-family: monospace;
  font-size: 0.75rem;
  word-break: break-all;
  color: #9ca3af;
}
.detail-divider {
  border-top: 1px solid var(--border-primary, #3a4556);
  margin: 0.5rem 0;
}
.playlist-link {
  color: var(--color-pink, #e4198d);
  text-decoration: underline;
  cursor: pointer;
  transition: opacity 0.15s;
}
.playlist-link:hover {
  opacity: 0.8;
}
.tag-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #d1d5db;
  background: var(--bg-tertiary, #252b3b);
  border: 1px solid var(--border-primary, #3a4556);
  border-radius: 4px;
  padding: 0.1rem 0.5rem;
  margin-right: 0.35rem;
  margin-bottom: 0.2rem;
}

/* Table header */
:deep(.p-datatable-thead > tr) {
  background: #151a27 !important;
}
:deep(.p-datatable-thead > tr > th) {
  background: #151a27 !important;
  color: #9ca3af !important;
  border-bottom: 1px solid var(--border-primary, #3a4556) !important;
}
:deep(.p-datatable-header) {
  background: #151a27 !important;
}

/* Alternating rows + hover */
:deep(.p-datatable-tbody) {
  user-select: none;
  -webkit-user-select: none;
}
:deep(.p-datatable-tbody > tr:nth-child(odd)) {
  background: var(--bg-secondary, #1a1f2e) !important;
}
:deep(.p-datatable-tbody > tr:nth-child(even)) {
  background: var(--bg-tertiary, #252b3b) !important;
}
:deep(.p-datatable-tbody > tr:hover) {
  background: var(--bg-hover, #2d3548) !important;
}

/* Checkbox styling */
:deep(.p-datatable .p-checkbox .p-checkbox-box) {
  background: var(--bg-tertiary, #252b3b) !important;
  border-color: var(--border-secondary, #4a5568) !important;
}
:deep(.p-datatable .p-checkbox .p-checkbox-box.p-highlight) {
  background: var(--color-purple, #a93097) !important;
  border-color: var(--color-purple, #a93097) !important;
}
:deep(.p-datatable .p-checkbox-icon) {
  color: #fff !important;
}

/* Header checkbox (select all on current page) */
:deep(.p-datatable-thead .p-checkbox .p-checkbox-box) {
  background: var(--bg-tertiary, #252b3b) !important;
  border-color: var(--border-secondary, #4a5568) !important;
}
:deep(.p-datatable-thead .p-checkbox .p-checkbox-box.p-highlight) {
  background: var(--color-purple, #a93097) !important;
  border-color: var(--color-purple, #a93097) !important;
}

/* Paginator dark theme */
:deep(.p-paginator) {
  background: var(--bg-secondary, #1a1f2e) !important;
  border-top: 1px solid var(--border-primary, #3a4556);
  padding: 0.75rem;
}
:deep(.p-paginator .p-paginator-page),
:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-prev),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-last) {
  color: #9ca3af !important;
  background: transparent !important;
  border: 1px solid var(--border-primary, #3a4556) !important;
  min-width: 2rem;
  height: 2rem;
}
:deep(.p-paginator .p-paginator-page:hover),
:deep(.p-paginator .p-paginator-first:hover),
:deep(.p-paginator .p-paginator-prev:hover),
:deep(.p-paginator .p-paginator-next:hover),
:deep(.p-paginator .p-paginator-last:hover) {
  background: var(--bg-hover, #2d3548) !important;
  color: #f3f4f6 !important;
}
:deep(.p-paginator .p-paginator-page.p-highlight) {
  background: var(--color-purple, #a93097) !important;
  border-color: var(--color-purple, #a93097) !important;
  color: #fff !important;
}
:deep(.p-paginator .p-paginator-rpp-options) {
  background: var(--bg-tertiary, #252b3b) !important;
  color: #d1d5db !important;
  border-color: var(--border-primary, #3a4556) !important;
}

/* MultiSelect dark theme overrides */
:deep(.p-multiselect) {
  background: var(--bg-tertiary, #252b3b) !important;
  border-color: var(--border-primary, #3a4556) !important;
  color: #d1d5db !important;
}
:deep(.p-multiselect:hover) {
  border-color: var(--border-secondary, #4a5568) !important;
}
:deep(.p-multiselect-label) {
  color: #d1d5db !important;
}
:deep(.p-multiselect-chip) {
  background: var(--color-purple, #a93097) !important;
  color: #fff !important;
}
</style>
