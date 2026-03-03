<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :clipped="clipped"
      fixed
      app
      width="280"
    >
      <!-- 검색 -->
      <v-sheet color="grey darken-3" class="pa-3">
        <v-text-field
          v-model="searchText"
          hide-details
          prepend-inner-icon="mdi-magnify"
          single-line
          label="지역 검색"
          outlined
          dense
          clearable
          dark
        />
      </v-sheet>

      <v-divider />

      <!-- 지역 선택 -->
      <v-list dense>
        <v-subheader class="text-caption grey--text">지역 선택</v-subheader>
        <v-row no-gutters class="px-2">
          <v-col
            v-for="(item, i) in filteredCities"
            :key="i"
            cols="4"
            class="pa-1"
          >
            <v-btn
              block
              small
              :color="selectedRegion === item.name ? 'primary' : 'grey darken-2'"
              @click="cellClickHandler(item)"
              class="text-caption"
              style="font-size:11px !important"
            >
              {{ item.name }}
            </v-btn>
          </v-col>
        </v-row>
      </v-list>

      <v-divider class="my-2" />

      <!-- 통계 카드 -->
      <div class="px-3 pb-3">
        <v-card color="grey darken-3" class="mb-2 pa-3" rounded="lg">
          <div class="text-caption grey--text mb-1">지역 최고 평당가</div>
          <div class="text-h6 primary--text font-weight-bold">
            {{ $store.state.maxPrice ? $store.state.maxPrice.toLocaleString() + ' 만원' : '-' }}
          </div>
        </v-card>
        <v-card color="grey darken-3" class="mb-3 pa-3" rounded="lg">
          <div class="text-caption grey--text mb-1">투자 기준 (70%)</div>
          <div class="text-h6 amber--text font-weight-bold">
            {{ $store.state.maxPrice ? Math.floor($store.state.maxPrice * 0.7).toLocaleString() + ' 만원' : '-' }}
          </div>
        </v-card>

        <v-btn block color="error" class="mb-2" @click="showInvestApart">
          <v-icon left small>mdi-fire</v-icon>
          투자 유망만 보기
        </v-btn>
        <v-btn block color="grey darken-1" @click="showAllApart">
          <v-icon left small>mdi-map-marker-multiple</v-icon>
          전체 보기
        </v-btn>
      </div>

      <v-divider class="mb-1" />

      <!-- 아파트 순위 리스트 -->
      <div v-if="$store.state.apartList.length > 0">
        <v-subheader class="text-caption grey--text">투자 유망 순위 (70% 이상, 오름차순)</v-subheader>
        <v-list dense style="overflow-y:auto; max-height:calc(100vh - 480px);">
          <v-list-item
            v-for="(item, idx) in $store.state.apartList"
            :key="idx"
            class="px-3"
            style="min-height:48px; border-bottom:1px solid #333;"
          >
            <v-list-item-avatar size="22" :color="idx < 3 ? 'primary' : 'grey darken-2'" class="mr-2 my-0">
              <span style="font-size:11px;font-weight:bold;color:#fff;">{{ idx + 1 }}</span>
            </v-list-item-avatar>
            <v-list-item-content class="py-1">
              <v-list-item-title style="font-size:12px;" class="white--text">
                {{ item.aptNm }}
              </v-list-item-title>
              <v-list-item-subtitle style="font-size:11px;">
                <span class="error--text font-weight-bold">{{ item.pricePerPyeong.toLocaleString() }}만원</span>
                <span class="grey--text ml-1">/ {{ Math.floor(item.excluUseAr / 3.3) }}평</span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
      <div v-else-if="$store.state.maxPrice === null" class="px-3 py-2 text-caption grey--text text-center">
        지역을 선택하면 순위가 표시됩니다
      </div>
    </v-navigation-drawer>

    <v-app-bar :clipped-left="clipped" fixed app elevation="2" color="grey darken-4">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title class="font-weight-bold">
        <span class="primary--text">PP</span>AA
        <span class="text-caption grey--text ml-2">평당가 아파트 분석</span>
      </v-toolbar-title>
      <v-spacer />
      <v-chip v-if="selectedRegionLabel" color="primary" small class="mr-2">
        <v-icon left small>mdi-map-marker</v-icon>
        {{ selectedRegionLabel }}
      </v-chip>
    </v-app-bar>

    <v-main style="padding:0 !important;">
      <Nuxt />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data() {
    return {
      clipped: true,
      drawer: true,
      searchText: '',
      selectedRegion: null,
      selectedRegionLabel: null,
      currentDepth: 'city',  // 'city' | 'district'
      cities: [
        { name: '서울시', code: null },
        { name: '경기도', code: null },
        { name: '부산시', code: null },
        { name: '대구시', code: null },
        { name: '인천시', code: null },
        { name: '광주시', code: null },
        { name: '대전시', code: null },
        { name: '울산시', code: null },
        { name: '세종시', code: null },
        { name: '강원도', code: null },
      ],
      seoul: [
        { name: '강남구', code: '11680' },
        { name: '강동구', code: '11740' },
        { name: '강북구', code: '11305' },
        { name: '강서구', code: '11500' },
        { name: '관악구', code: '11620' },
        { name: '광진구', code: '11215' },
        { name: '구로구', code: '11530' },
        { name: '금천구', code: '11545' },
        { name: '노원구', code: '11350' },
        { name: '도봉구', code: '11320' },
        { name: '동대문구', code: '11230' },
        { name: '동작구', code: '11590' },
        { name: '마포구', code: '11440' },
        { name: '서대문구', code: '11410' },
        { name: '서초구', code: '11650' },
        { name: '성동구', code: '11200' },
        { name: '성북구', code: '11290' },
        { name: '송파구', code: '11710' },
        { name: '양천구', code: '11470' },
        { name: '영등포구', code: '11560' },
        { name: '용산구', code: '11170' },
        { name: '은평구', code: '11380' },
        { name: '종로구', code: '11110' },
        { name: '중구', code: '11140' },
        { name: '중랑구', code: '11260' },
      ],
      currentList: null,
    }
  },
  computed: {
    filteredCities() {
      const list = this.currentList || this.cities
      if (!this.searchText) return list
      return list.filter(item =>
        item.name.includes(this.searchText)
      )
    }
  },
  mounted() {
    this.currentList = this.cities
  },
  methods: {
    async showInvestApart() {
      this.$store.commit('hideAllSpot')
      this.$store.commit('showInvestSpot')
    },
    async showAllApart() {
      this.$store.commit('showAllSpot')
    },
    async cellClickHandler(item) {
      this.selectedRegion = item.name
      if (item.name === '서울시') {
        this.currentList = this.seoul
        this.selectedRegionLabel = '서울시'
      } else if (item.code) {
        // 구 선택 - 실제 데이터 조회
        this.selectedRegionLabel = item.name
        this.$nuxt.$emit('region-selected', item.code)
      } else {
        console.log('준비 중인 지역:', item.name)
      }
    }
  }
}
</script>
