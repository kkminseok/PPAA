<template>
  <div id="map"></div>
</template>

<script>
export default {
  name: 'InspirePage',
  data(){
    return {
      map: null,
    };
  },
  setup(){},
  created() {},
  mounted(){
    if(window.kakao && window.kakao.maps){
      this.loadMap();
    } else{
      this.loadScript();
    }
  },
  unmounted() {},
  methods: {
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
    }
  }
}
</script>


