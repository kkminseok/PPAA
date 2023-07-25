<template>
  <div id="map" style="width:100%;height:800px;"></div>
</template>

<script>
import {getApartmentData} from '~/api/apartment';
import axios from "axios";
import { serviceKey } from '~/constants/index';

export default {
  name: 'IndexPage',
  data(){
    return {
      map: null,
    };
  },
  setup(){},
  created() {},
  mounted(){
    this.test();
    if(window.kakao && window.kakao.maps){
      this.loadMap();
    } else{
      this.loadScript();
    }
    this.searchApartment();
  },
  unmounted() {},
  methods: {
    async test(){
      console.log("test")
      await axios.get(`/api?serviceKey=${serviceKey}&pageNo=1&numOfRows=100&LAWD_CD=11110&DEAL_YMD=201512`
      ,{
	      withCredentials: true // 쿠키 cors 통신 설정
      }).then((res) => {
        console.log(res.data)
        console.log(res.data.response.body)
      })
    
    },
    //api 출력
    loadScript(){
      const script = document.createElement("script");
      script.src="//dapi.kakao.com/v2/maps/sdk.js?appkey=ccf0d2c43215087dbc06b1437f0ebf06&autoload=false";
      script.onload = () => window.kakao.maps.load(this.loadMap);

      document.head.appendChild(script);
    },
    //map 출력
    loadMap(){
      const container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
      const options = { //지도를 생성할 때 필요한 기본 옵션
        center: new kakao.maps.LatLng(33.450701, 126.570667), //지도의 중심좌표.
        level: 3 //지도의 레벨(확대, 축소 정도)
      };
      this.map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴
      this.loadMaker();
    },
    //marker 찍기
    loadMaker(){
      const markerPosition = new window.kakao.maps.LatLng(
        33.450701,
        126.570667
      );

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
      });
      marker.setMap(this.map);
    },
    searchApartment(){
      var ps = new kakao.maps.services.Places(); 
      // 키워드로 장소를 검색합니다
      ps.keywordSearch('서울특별시 "롯데미도파광화문빌딩"', placesSearchCB); 

      // 키워드 검색 완료 시 호출되는 콜백함수 입니다
      function placesSearchCB (data, status, pagination) {
          if (status === kakao.maps.services.Status.OK) {

              // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
              // LatLngBounds 객체에 좌표를 추가합니다
              var bounds = new kakao.maps.LatLngBounds();

              for (var i=0; i<data.length; i++) {
                  displayMarker(data[i]);    
                  bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
              }       

              // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
              map.setBounds(bounds);
          } 
      }
    }
  }
}
</script>
