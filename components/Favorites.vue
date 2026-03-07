<template>
  <div>
    <v-sheet color="grey darken-3" class="px-3 pt-2 pb-1">
      <div class="d-flex align-center justify-space-between mb-1">
        <span class="text-caption grey--text">즐겨찾기</span>
        <v-btn
          icon
          x-small
          :color="isCurrentFavorited ? 'amber' : 'grey'"
          :disabled="!currentRegion || !currentRegion.code"
          :title="isCurrentFavorited ? '즐겨찾기 제거' : '즐겨찾기 추가'"
          @click="toggleFavorite"
        >
          <v-icon x-small>
            {{ isCurrentFavorited ? 'mdi-star' : 'mdi-star-outline' }}
          </v-icon>
        </v-btn>
      </div>

      <div v-if="favorites.length === 0" class="text-caption grey--text text-center py-1">
        별표 버튼으로 즐겨찾기를 추가하세요
      </div>

      <div v-else class="d-flex flex-wrap" style="gap:4px; padding-bottom:6px;">
        <v-chip
          v-for="(fav, idx) in favorites"
          :key="fav.code + '_' + idx"
          x-small
          :color="currentRegion && currentRegion.code === fav.code ? 'primary' : 'grey darken-1'"
          class="white--text"
          style="cursor:pointer;"
          @click="selectFavorite(fav)"
        >
          {{ fav.name }}
          <v-icon
            x-small
            right
            style="margin-left:2px; cursor:pointer;"
            @click.stop="removeFavorite(idx)"
          >
            mdi-close
          </v-icon>
        </v-chip>
      </div>
    </v-sheet>
  </div>
</template>

<script>
const STORAGE_KEY = 'ppaa_favorites'

export default {
  name: 'Favorites',

  props: {
    currentRegion: {
      type: Object,
      default: null
      // expected shape: { name: String, code: String }
    }
  },

  data() {
    return {
      favorites: []
    }
  },

  computed: {
    isCurrentFavorited() {
      if (!this.currentRegion || !this.currentRegion.code) return false
      return this.favorites.some(f => f.code === this.currentRegion.code)
    }
  },

  mounted() {
    this.loadFromStorage()
  },

  methods: {
    loadFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            this.favorites = parsed
          }
        }
      } catch (e) {
        this.favorites = []
      }
    },

    saveToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.favorites))
      } catch (e) {
        // localStorage not available (e.g. SSR or private mode)
      }
    },

    toggleFavorite() {
      if (!this.currentRegion || !this.currentRegion.code) return

      const idx = this.favorites.findIndex(f => f.code === this.currentRegion.code)
      if (idx >= 0) {
        this.favorites.splice(idx, 1)
      } else {
        this.favorites.push({
          name: this.currentRegion.name,
          code: this.currentRegion.code
        })
      }
      this.saveToStorage()
    },

    removeFavorite(idx) {
      this.favorites.splice(idx, 1)
      this.saveToStorage()
    },

    selectFavorite(fav) {
      this.$emit('region-select', { name: fav.name, code: fav.code })
    }
  }
}
</script>
