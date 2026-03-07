<template>
  <div style="position:relative;">
    <!-- 로딩 오버레이 -->
    <v-overlay :value="loading" z-index="10">
      <div class="text-center">
        <v-progress-circular indeterminate color="primary" size="64" />
        <div class="mt-3 white--text text-body-1">{{ loadingMessage }}</div>
      </div>
    </v-overlay>

    <!-- 지도 -->
    <div id="map" style="width:100%; height:calc(100vh - 64px);"></div>
  </div>
</template>

<script>
import axios from "axios";
import { serviceKey } from '~/constants/index';

export default {
  name: 'IndexPage',
  data() {
    return {
      map: null,
      apartData: null,
      apartDetailData: null,
      bounds: null,
      maxPriceApart: null,
      loading: false,
      loadingMessage: '데이터를 불러오는 중...',
    };
  },
  created() {
    this.$nuxt.$on('region-selected', this.onRegionSelected)
  },
  beforeDestroy() {
    this.$nuxt.$off('region-selected', this.onRegionSelected)
  },
  mounted() {
    // nuxt.config.js head script의 appkey가 런타임 config에서 주입됨
    this.waitForKakao();
  },
  methods: {
    waitForKakao() {
      if (window.kakao && window.kakao.maps && window.kakao.maps.Map) {
        this.loadMap();
      } else {
        setTimeout(this.waitForKakao, 100);
      }
    },
    async onRegionSelected(lawdCd, period = 12) {
      if (!window.kakao || !window.kakao.maps) return;
      this.loading = true
      this.loadingMessage = '데이터를 불러오는 중...'
      this.$store.commit('clearSpots')
      this.bounds = null
      try {
        this.apartData = await this.getApartData(lawdCd, period)
        if (this.apartData && this.apartData.size > 0) {
          this.loadingMessage = '지도에 마커를 표시하는 중...'
          await this.searchApartment()
        }
      } finally {
        this.loading = false
      }
    },
    async getApartData(lawdCd = '11110', period = 12) {
      const result = new Map();
      const monthlyAccum = new Map();
      const today = new Date();
      for (var i = -(period - 1); i <= 0; ++i) {
        var tmpDay = new Date(today.getFullYear(), today.getMonth() + i);
        const getMonths = (tmpDay.getMonth() + 1).toString().padStart(2, '0');
        var tmpSearchDay = tmpDay.getFullYear() + "" + getMonths;
        const shortLabel = tmpSearchDay.slice(2, 4) + '.' + tmpSearchDay.slice(4, 6);
        try {
          const res = await axios.get(
            `/api?serviceKey=${serviceKey}&pageNo=1&numOfRows=1000&LAWD_CD=${lawdCd}&DEAL_YMD=${tmpSearchDay}&_type=json`,
            { withCredentials: true, timeout: 10000 }
          )
          var items = res.data.response.body.items.item;
          if (!items) continue;
          const itemList = Array.isArray(items) ? items : [items];
          let monthData = monthlyAccum.get(shortLabel) || { total: 0, count: 0 };
          for (var idx = 0; idx < itemList.length; ++idx) {
            const item = itemList[idx];
            if (item.aptNm && item.dealAmount && item.excluUseAr) {
              result.set(item.aptNm, item);
              const pricePerPyeong = Math.floor(parseInt(item.dealAmount.replace(/,/g, '')) / (item.excluUseAr / 3.3));
              monthData.total += pricePerPyeong;
              monthData.count += 1;
            }
          }
          monthlyAccum.set(shortLabel, monthData);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
      const priceHistory = Array.from(monthlyAccum.entries())
        .filter(([, v]) => v.count > 0)
        .map(([label, v]) => ({ label, value: Math.floor(v.total / v.count) }));
      this.$store.commit('setPriceHistory', priceHistory);
      return result;
    },
    loadMap() {
      const kakao = window.kakao;
      const container = document.getElementById('map');
      const options = {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 7
      };
      var map = new kakao.maps.Map(container, options);
      this.map = map;
      this.$store.commit('setMap', map);

      this.onRegionSelected('11110')
    },
    async searchApartment() {
      const kakao = window.kakao;
      const ps = new kakao.maps.services.Places(this.map);
      this.maxPriceApart = await this.findMaxPricePerArea();
      this.$store.commit('setMaxPrice', this.maxPriceApart);

      for (const [key, value] of this.apartData) {
        var apartAddress = value.umdNm + " " + value.aptNm;
        this.apartDetailData = value;
        if (this.bounds == null) {
          this.bounds = new kakao.maps.LatLngBounds();
        }
        await this.customSearch(ps, apartAddress);
      }
    },
    async findMaxPricePerArea() {
      var max = 0;
      this.apartData.forEach((value) => {
        var price = Math.floor(parseInt(value.dealAmount.replace(/,/g, '')) / (value.excluUseAr / 3.3))
        if (max < price) max = price;
      });

      // 70% 이상인 것만 오름차순 정렬 (가장 저렴한 유망주부터)
      const threshold = max * 0.7;
      const sorted = Array.from(this.apartData.values())
        .map(v => ({
          aptNm: v.aptNm,
          umdNm: v.umdNm,
          dealAmount: v.dealAmount,
          excluUseAr: v.excluUseAr,
          buildYear: v.buildYear,
          pricePerPyeong: Math.floor(parseInt(v.dealAmount.replace(/,/g, '')) / (v.excluUseAr / 3.3))
        }))
        .filter(v => v.pricePerPyeong >= threshold)
        .sort((a, b) => a.pricePerPyeong - b.pricePerPyeong);
      this.$store.commit('setApartList', sorted);

      return max;
    },
    async customSearch(ps, apartAddress) {
      return new Promise((resolve, reject) => {
        ps.keywordSearch(apartAddress, (data, status, pagination) => {
          this.placesSearchCB(data, status, pagination, resolve, reject);
        });
      });
    },
    placesSearchCB(data, status, pagination, resolve, reject) {
      const kakao = window.kakao;
      if (status === kakao.maps.services.Status.OK) {
        for (var i = 0; i < data.length; i++) {
          if (data[i].category_name == "부동산 > 주거시설 > 아파트") {
            this.displayMarker(data[i]);
            this.bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
          }
        }
        this.map.setBounds(this.bounds);
      }
      resolve();
    },
    displayMarker(place) {
      const kakao = window.kakao;
      var isInvest = this.isInvestApart();
      var marker = new kakao.maps.Marker({
        map: isInvest ? this.map : null,
        position: new kakao.maps.LatLng(place.y, place.x),
      });

      var contentHtml = this.createInfoWindowContent(isInvest)
      var infowindow = new kakao.maps.InfoWindow({ zIndex: 1, content: contentHtml });

      if (isInvest) {
        this.$store.commit('addInvestSpot', marker);
        this.$store.commit('addInvestSpotInfoWindow', infowindow);
        infowindow.open(this.map, marker);
      }
      this.$store.commit('addSpot', marker);
      this.$store.commit('addSpotInfoWindow', infowindow);
    },
    isInvestApart() {
      const d = this.apartDetailData
      var apartPrice = Math.floor(
        parseInt(d.dealAmount.replace(/,/g, '')) / (d.excluUseAr / 3.3)
      )
      return apartPrice > this.maxPriceApart * 0.7
    },
    createInfoWindowContent(isInvest) {
      const d = this.apartDetailData
      const price = parseInt(d.dealAmount.replace(/,/g, ''))
      const area = d.excluUseAr
      const pyeong = Math.floor(area / 3.3)
      const pricePerPyeong = Math.floor(price / (area / 3.3))
      const color = isInvest ? '#ef5350' : '#ffffff'
      const badge = isInvest ? '<span style="background:#ef5350;color:#fff;padding:2px 6px;border-radius:10px;font-size:10px;margin-left:6px;">투자유망</span>' : ''

      return `
        <div style="
          background:#1e1e1e;
          color:#fff;
          padding:12px 14px;
          border-radius:10px;
          font-size:12px;
          min-width:180px;
          border:1px solid ${color};
          line-height:1.8;
        ">
          <div style="font-weight:bold;font-size:13px;margin-bottom:6px;color:${color}">
            ${d.aptNm}${badge}
          </div>
          <div>건축: <b>${d.buildYear}년</b></div>
          <div>가격: <b>${(price / 10000).toFixed(2)}억원</b></div>
          <div>면적: <b>${pyeong}평 (${area}㎡)</b></div>
          <div>평당가: <b>${pricePerPyeong.toLocaleString()}만원</b></div>
          <div style="color:#aaa;font-size:11px;margin-top:4px;">
            ${d.dealYear}.${String(d.dealMonth).padStart(2,'0')}.${String(d.dealDay).padStart(2,'0')} 거래
          </div>
        </div>
      `
    }
  }
}
</script>
