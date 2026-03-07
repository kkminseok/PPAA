<template>
  <div>
    <v-divider class="my-1" />

    <!-- Header -->
    <v-subheader class="text-caption grey--text">
      <v-icon small left color="grey">mdi-compare</v-icon>
      지역 비교
    </v-subheader>

    <!-- Add to compare button -->
    <div class="px-3 pb-2">
      <v-btn
        block
        small
        color="blue darken-3"
        :disabled="!currentRegion"
        @click="handleAddRegion"
        class="text-caption"
      >
        <v-icon left small>mdi-plus-circle-outline</v-icon>
        {{ addButtonLabel }}
      </v-btn>
    </div>

    <!-- Slot indicators -->
    <div class="px-3 pb-2 d-flex" style="gap:6px;">
      <div
        style="flex:1; border-radius:4px; padding:4px 6px; font-size:11px; text-align:center;"
        :style="regionA
          ? 'background:#1565c0; color:#fff;'
          : 'background:#333; color:#888; border:1px dashed #555;'"
      >
        <div class="font-weight-bold" style="font-size:10px; margin-bottom:1px;">A 지역</div>
        <div style="font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          {{ regionA ? regionA.name : '미선택' }}
        </div>
      </div>
      <div
        style="flex:1; border-radius:4px; padding:4px 6px; font-size:11px; text-align:center;"
        :style="regionB
          ? 'background:#4a148c; color:#fff;'
          : 'background:#333; color:#888; border:1px dashed #555;'"
      >
        <div class="font-weight-bold" style="font-size:10px; margin-bottom:1px;">B 지역</div>
        <div style="font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          {{ regionB ? regionB.name : '미선택' }}
        </div>
      </div>
      <v-btn
        v-if="regionA || regionB"
        icon
        x-small
        color="grey"
        @click="handleClear"
        style="align-self:center;"
        title="비교 초기화"
      >
        <v-icon x-small>mdi-close-circle</v-icon>
      </v-btn>
    </div>

    <!-- Comparison table -->
    <div v-if="regionA && regionB" class="px-3 pb-3">
      <v-card color="grey darken-4" rounded="lg" outlined>
        <!-- Table header -->
        <div
          style="display:grid; grid-template-columns:80px 1fr 1fr; font-size:10px;
                 background:#212121; border-radius:8px 8px 0 0; padding:4px 6px;"
          class="grey--text"
        >
          <div></div>
          <div style="text-align:center; color:#90caf9; font-weight:bold;">A: {{ regionA.name }}</div>
          <div style="text-align:center; color:#ce93d8; font-weight:bold;">B: {{ regionB.name }}</div>
        </div>

        <v-divider style="border-color:#333;" />

        <!-- Row: 최고 평당가 -->
        <div
          style="display:grid; grid-template-columns:80px 1fr 1fr;
                 font-size:11px; padding:6px 6px; align-items:center;"
          :style="rowStyle"
        >
          <div class="grey--text" style="font-size:10px; line-height:1.3;">최고<br>평당가</div>
          <div
            style="text-align:center; font-weight:bold;"
            :style="maxPriceWinner === 'A'
              ? 'color:#66bb6a;'
              : maxPriceWinner === 'tie'
              ? 'color:#fff;'
              : 'color:#ef9a9a;'"
          >
            {{ regionA.maxPrice ? regionA.maxPrice.toLocaleString() : '-' }}만
            <v-icon v-if="maxPriceWinner === 'A'" x-small color="green lighten-1" style="vertical-align:middle;">mdi-arrow-down-bold</v-icon>
          </div>
          <div
            style="text-align:center; font-weight:bold;"
            :style="maxPriceWinner === 'B'
              ? 'color:#66bb6a;'
              : maxPriceWinner === 'tie'
              ? 'color:#fff;'
              : 'color:#ef9a9a;'"
          >
            {{ regionB.maxPrice ? regionB.maxPrice.toLocaleString() : '-' }}만
            <v-icon v-if="maxPriceWinner === 'B'" x-small color="green lighten-1" style="vertical-align:middle;">mdi-arrow-down-bold</v-icon>
          </div>
        </div>

        <v-divider style="border-color:#333;" />

        <!-- Row: 투자 기준 (70%) -->
        <div
          style="display:grid; grid-template-columns:80px 1fr 1fr;
                 font-size:11px; padding:6px 6px; align-items:center;"
        >
          <div class="grey--text" style="font-size:10px; line-height:1.3;">투자기준<br>(70%)</div>
          <div
            style="text-align:center; font-weight:bold;"
            :style="investThresholdWinner === 'A'
              ? 'color:#66bb6a;'
              : investThresholdWinner === 'tie'
              ? 'color:#fff;'
              : 'color:#ef9a9a;'"
          >
            {{ investThresholdA }}만
            <v-icon v-if="investThresholdWinner === 'A'" x-small color="green lighten-1" style="vertical-align:middle;">mdi-arrow-down-bold</v-icon>
          </div>
          <div
            style="text-align:center; font-weight:bold;"
            :style="investThresholdWinner === 'B'
              ? 'color:#66bb6a;'
              : investThresholdWinner === 'tie'
              ? 'color:#fff;'
              : 'color:#ef9a9a;'"
          >
            {{ investThresholdB }}만
            <v-icon v-if="investThresholdWinner === 'B'" x-small color="green lighten-1" style="vertical-align:middle;">mdi-arrow-down-bold</v-icon>
          </div>
        </div>

        <v-divider style="border-color:#333;" />

        <!-- Row: 투자유망 아파트 수 -->
        <div
          style="display:grid; grid-template-columns:80px 1fr 1fr;
                 font-size:11px; padding:6px 6px; align-items:center;
                 border-radius:0 0 8px 8px;"
        >
          <div class="grey--text" style="font-size:10px; line-height:1.3;">투자유망<br>아파트</div>
          <div
            style="text-align:center; font-weight:bold;"
            :style="investCountWinner === 'A'
              ? 'color:#66bb6a;'
              : investCountWinner === 'tie'
              ? 'color:#fff;'
              : 'color:#ef9a9a;'"
          >
            {{ regionA.investCount != null ? regionA.investCount : '-' }}개
            <v-icon v-if="investCountWinner === 'A'" x-small color="green lighten-1" style="vertical-align:middle;">mdi-arrow-up-bold</v-icon>
          </div>
          <div
            style="text-align:center; font-weight:bold;"
            :style="investCountWinner === 'B'
              ? 'color:#66bb6a;'
              : investCountWinner === 'tie'
              ? 'color:#fff;'
              : 'color:#ef9a9a;'"
          >
            {{ regionB.investCount != null ? regionB.investCount : '-' }}개
            <v-icon v-if="investCountWinner === 'B'" x-small color="green lighten-1" style="vertical-align:middle;">mdi-arrow-up-bold</v-icon>
          </div>
        </div>
      </v-card>

      <!-- Legend -->
      <div class="mt-1" style="font-size:10px; color:#777; text-align:right;">
        <v-icon x-small color="green lighten-1">mdi-arrow-down-bold</v-icon> 낮을수록 유리 &nbsp;
        <v-icon x-small color="green lighten-1">mdi-arrow-up-bold</v-icon> 많을수록 유리
      </div>
    </div>

    <!-- Empty state: one region selected -->
    <div
      v-else-if="regionA || regionB"
      class="px-3 pb-3 text-caption grey--text text-center"
      style="font-size:11px;"
    >
      비교할 두 번째 지역을 선택해 추가하세요
    </div>

    <!-- Empty state: no regions -->
    <div
      v-else
      class="px-3 pb-3 text-caption grey--text text-center"
      style="font-size:11px;"
    >
      지역을 선택 후 "비교에 추가"를 눌러 비교하세요
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComparePanel',

  props: {
    regionA: {
      type: Object,
      default: null,
      // { name: "강남구", maxPrice: 12000, investCount: 5 }
    },
    regionB: {
      type: Object,
      default: null,
    },
    currentRegion: {
      type: Object,
      default: null,
      // { name: "강남구", code: "11680" }
    },
  },

  computed: {
    // Label for the add button: shows which slot will be filled next
    addButtonLabel() {
      if (!this.currentRegion) return '지역을 선택하세요'
      if (!this.regionA) return `A에 추가: ${this.currentRegion.name}`
      if (!this.regionB) return `B에 추가: ${this.currentRegion.name}`
      return `A/B 교체: ${this.currentRegion.name}`
    },

    investThresholdA() {
      if (!this.regionA || !this.regionA.maxPrice) return '-'
      return Math.floor(this.regionA.maxPrice * 0.7).toLocaleString()
    },

    investThresholdB() {
      if (!this.regionB || !this.regionB.maxPrice) return '-'
      return Math.floor(this.regionB.maxPrice * 0.7).toLocaleString()
    },

    // Lower max price = better investment threshold
    maxPriceWinner() {
      if (!this.regionA || !this.regionB) return null
      const a = this.regionA.maxPrice
      const b = this.regionB.maxPrice
      if (a == null && b == null) return 'tie'
      if (a == null) return 'B'
      if (b == null) return 'A'
      if (a < b) return 'A'
      if (b < a) return 'B'
      return 'tie'
    },

    // Lower invest threshold = better
    investThresholdWinner() {
      if (!this.regionA || !this.regionB) return null
      const a = this.regionA.maxPrice != null ? this.regionA.maxPrice * 0.7 : null
      const b = this.regionB.maxPrice != null ? this.regionB.maxPrice * 0.7 : null
      if (a == null && b == null) return 'tie'
      if (a == null) return 'B'
      if (b == null) return 'A'
      if (a < b) return 'A'
      if (b < a) return 'B'
      return 'tie'
    },

    // More invest-worthy apartments = better
    investCountWinner() {
      if (!this.regionA || !this.regionB) return null
      const a = this.regionA.investCount
      const b = this.regionB.investCount
      if (a == null && b == null) return 'tie'
      if (a == null) return 'B'
      if (b == null) return 'A'
      if (a > b) return 'A'
      if (b > a) return 'B'
      return 'tie'
    },

    rowStyle() {
      return {}
    },
  },

  methods: {
    handleAddRegion() {
      if (!this.currentRegion) return
      this.$emit('add-region', this.currentRegion.name)
    },

    handleClear() {
      this.$emit('clear-compare')
    },
  },
}
</script>
