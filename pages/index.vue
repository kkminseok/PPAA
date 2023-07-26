<template>
  <div id="map" style="width:100%;height:800px;"></div>
</template>

<script>
import axios from "axios";
import { serviceKey } from '~/constants/index';

export default {
  name: 'IndexPage',
  data(){
    return {
      // 마커를 클릭하면 장소명을 표출할 인포윈도우 입니다
      infowindow: null,
      map: null,
      apartData: null,
    };
  },
  setup(){},
  async created() {
    this.apartData = await this.test();
    await this.searchApartment();
  },
  mounted(){
    //this.test();
    kakao.maps.load(this.loadMap);
  },
  unmounted() {},
  methods: {
    async test(){
      try{
        const res = await axios.get(`/api?serviceKey=${serviceKey}&pageNo=1&numOfRows=100&LAWD_CD=11110&DEAL_YMD=201512`
        ,{
          withCredentials: true, // 쿠키 cors 통신 설정
          timeout: 5000,
        })
        console.log("response : ", res.data);
        debugger;
        return res.data.response.body;
      } catch (error) {
          console.error("Error fetching data:", error);
          return null; // Return a default value or handle the error as needed
        }
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
    },
    async searchApartment(){
      const ps = new kakao.maps.services.Places(this.map); 
      console.log("아파트 데이터 : ", this.apartData);
      // 키워드로 장소를 검색합니다
      debugger;
      for(var i=0; i< this.apartData.items.item.length; i++){
        console.log(this.apartData.items.item[i].도로명);
      }
      ps.keywordSearch('서울특별시 광화문스페이스본', this.placesSearchCB); 
      
    },
    // 키워드 검색 완료 시 호출되는 콜백함수 입니다
      placesSearchCB (data, status, pagination) {
          if (status === kakao.maps.services.Status.OK) {

              // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
              // LatLngBounds 객체에 좌표를 추가합니다
              var bounds = new kakao.maps.LatLngBounds();

              for (var i=0; i<data.length; i++) {
                  this.displayMarker(data[i]);    
                  bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
              }       

              // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
              this.map.setBounds(bounds);
          } 
      },
     // 지도에 마커를 표시하는 함수입니다
      displayMarker(place) {
      // 마커를 생성하고 지도에 표시합니다
      const marker = new kakao.maps.Marker({
          map: this.map,
          position: new kakao.maps.LatLng(place.y, place.x) 
      });

      // 마커에 클릭이벤트를 등록합니다
      kakao.maps.event.addListener(marker, 'click', function() {
          // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
          infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
          infowindow.open(map, marker);
      });
  }

  }
}
</script>
