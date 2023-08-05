<template>
  <div id="map" style="width:100%;height:800px;"></div>
</template>

<script>
import axios from "axios";
import { serviceKey } from '~/constants/index';
import { getOneYearsAgo } from "~/utils/date"

export default {
  name: 'IndexPage',
  data(){
    return {
      // 마커를 클릭하면 장소명을 표출할 인포윈도우 입니다
      infowindow: null,
      map: null,
      apartData: null,
      apartDetailData:null,
      bounds: null,
      maxPriceApart: null,
    };
  },
  setup(){},
  async created() {
    this.apartData = await this.getApartData();
    await this.searchApartment();
  },
  mounted(){
    kakao.maps.load(this.loadMap);
  },
  unmounted() {},
  methods: {
    async getApartData(){
        const result = new Map();
        //현재날짜 기준으로 1년 전 날짜 가져오기
        const oneYearsAgo = getOneYearsAgo();
        //처음은 종로구 기준 (11110)
        const splitedDay = oneYearsAgo.split("/");
        const agoYears = splitedDay[0];
        const months = splitedDay[1];
        for(var i=-1; i<12; ++i){
          var tmpDay = new Date(agoYears, parseInt(months) + i);
          const getMonths = (tmpDay.getMonth() + 1).toString().padStart(2, '0');
          var tmpSearchDay = tmpDay.getFullYear()+ ""+ getMonths;
          console.log("searchDay", tmpSearchDay);
          try{
            const res = await axios.get(`/api?serviceKey=${serviceKey}&pageNo=1&numOfRows=1000&LAWD_CD=11110&DEAL_YMD=`+ tmpSearchDay
            ,{
              withCredentials: true, // 쿠키 cors 통신 설정
              timeout: 5000,
            })
            console.log(res)
            console.log(tmpSearchDay);
            var items = res.data.response.body.items.item;
            for(var idx=0; idx<items.length; ++idx){
              console.log(items[idx]);
              result.set(items[idx].아파트,items[idx]);
            }
            
          } catch (error) {
              console.error("Error fetching data:", error);
              return null; // Return a default value or handle the error as needed
            }
          }
          console.log("result: ",result);
          return result;
    },
    //map 출력
    loadMap(){
      // 마커를 클릭하면 장소명을 표출할 인포윈도우 입니다
      this.infowindow = new kakao.maps.InfoWindow({zIndex:1});
      const container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
      const options = { //지도를 생성할 때 필요한 기본 옵션
        center: new kakao.maps.LatLng(33.450701, 126.570667), //지도의 중심좌표.
        level: 3 //지도의 레벨(확대, 축소 정도)
      };
      var map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴
      this.map = map;
      this.$store.commit('setMap',map);
    },
    async searchApartment(){
      const ps = new kakao.maps.services.Places(this.map); 
      console.log("아파트 데이터 : ", this.apartData);
      // 키워드로 장소를 검색합니다
      // 가장 높은금액의 평당가 찾기
      this.maxPriceApart = await this.findMaxPricePerArea();

      this.$store.commit('setMaxPrice', this.maxPriceApart);

      console.log("가장 높은 평당가 : ",this.maxPriceApart);
      for (const [key, value] of this.apartData) {
        var apartAddress = value.법정동 + " " + value.아파트;
        this.apartDetailData = value;
        console.log("apartAddress: ", apartAddress);
        if(this.bounds == null){
          this.bounds = new kakao.maps.LatLngBounds();
        }
        // 검색된 결과를 순차적으로 처리하기 위해 await 사용
        await this.customSearch(ps, apartAddress);
      }
    },
    async findMaxPricePerArea(){
      var max = 0;
      this.apartData.forEach((value, key) => {
        console.log(`Key: ${key}, Value: ${value.거래금액}`);
        var price = Math.floor(parseInt(value.거래금액)/(parseInt(value.전용면적) / 3.3) * 1000)
        if(max < price){
          max = price;
          console.log(max, key);
        }
      });
      return max;
    },
    // 키워드 검색을 Promise로 래핑한 함수
    async customSearch(ps, apartAddress) {
      return new Promise((resolve, reject) => {
        console.log(apartAddress);
        ps.keywordSearch(apartAddress, (data, status, pagination) => {
          // 키워드 검색 완료 시 호출되는 콜백함수
          this.placesSearchCB(data, status, pagination, resolve, reject);
        });
      });
    },
    // 키워드 검색 완료 시 호출되는 콜백함수 입니다
    async placesSearchCB (data, status, pagination, resolve, reject) {
      console.log("data:", data)
        if (status === kakao.maps.services.Status.OK ) {
            // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
            // LatLngBounds 객체에 좌표를 추가합니다
            var bounds = new kakao.maps.LatLngBounds();
            for (var i=0; i<data.length; i++) {
              if(data[i].category_name == "부동산 > 주거시설 > 아파트"){
                console.log("detail data:", this.apartDetailData);
                await this.displayMarker(data[i]);    
                this.bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
              }
            }       
            // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
            this.map.setBounds(this.bounds);
        } else{
          console.log("검색 실패 : ", data);
        } 
        resolve();
    },
     // 지도에 마커를 표시하는 함수입니다
    async displayMarker(place) {
      // 마커를 생성하고 지도에 표시합니다
      console.log("place:", this.apartDetailData.아파트);
      var marker = new kakao.maps.Marker({
          map: this.map,
          position: new kakao.maps.LatLng(place.y, place.x),
      });
      var investApart = await this.isInvestApart();
      var style = "";
      if(investApart){
        style = '<div style="padding:15px;font-size:12px; color: red">';
        this.$store.commit('addInvestSpot', marker);
      } else{
        style = '<div style="padding:15px;font-size:12px; color: black">';
      }
      this.$store.commit('addSpot',marker);
      var infowindow = new kakao.maps.InfoWindow({zIndex:1, content: style + await this.createData() + '</div>'});
      if(investApart){
        this.$store.commit('addInvestSpotInfoWindow', infowindow);
      }
      this.$store.commit('addSpotInfoWindow', infowindow);
      console.log("infowindow: ", infowindow);
      infowindow.open(this.map, marker);
      console.log(this.$store.state.spotList.length);
    },
    async isInvestApart(){
      var apartPrice = Math.floor(parseInt(this.apartDetailData.거래금액)/(parseInt(this.apartDetailData.전용면적) / 3.3) * 1000)
      if(apartPrice > this.maxPriceApart * 0.7)
        return true;
      return false;
    },
    async createData(){
      var html = "";
      html+="아파트명: " + this.apartDetailData.아파트 +"<br/>";
      html+="건축년도: " + this.apartDetailData.건축년도 + "년" + "<br/>";
      html+="가격: " + parseInt(this.apartDetailData.거래금액)/10 + "억원" + "<br/>";
      html+="평수: " + Math.floor(parseInt(this.apartDetailData.전용면적) / 3.3) +"평형 <br/>";
      html+="평당가: " + Math.floor(parseInt(this.apartDetailData.거래금액)/(parseInt(this.apartDetailData.전용면적) / 3.3) * 1000) + "만원<br/>"
      html+="매수일자" + this.apartDetailData.년 + "." + this.apartDetailData.월.toString().padStart(2, '0') + "." + this.apartDetailData.일.toString().padStart(2, '0')
      return html;
    }
  }
}
</script>
