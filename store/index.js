import Vuex from 'vuex'

const store = () => new Vuex.Store({

    state: {
        maxPrice: null,
        spotList: [],
        spotInfoWindowList: [],
        investSpot: [],
        investSpotInfoWindowList:[],
        map: null,
        apartList: [],
    },
    mutations: {
        setMaxPrice(state, price) {
            state.maxPrice = price;
        },
        async addSpot(state, spot){
            state.spotList.push(spot);
        },
        async addInvestSpot(state, spot){
            state.investSpot.push(spot);
        },
        async addSpotInfoWindow(state, infoWindow){
            state.spotInfoWindowList.push(infoWindow)
        },
        async addInvestSpotInfoWindow(state, infowindow){
            state.investSpotInfoWindowList.push(infowindow)
        },
        async hideAllSpot(state){
            for(var i=0;i<state.spotList.length; ++i){
                state.spotList[i].setMap(null);
            }
            for(var j=0;j<state.spotInfoWindowList.length; ++j){
                state.spotInfoWindowList[j].close()
            }
        },
        async showInvestSpot(state){
            console.log(state.investSpot.length);
            for(var i=0;i<state.investSpot.length;++i){
                state.investSpot[i].setMap(state.map);
                state.investSpotInfoWindowList[i].open(state.map,state.investSpot[i])   
            }
        },
        async showAllSpot(state){
            for(var i=0;i<state.spotList.length; ++i){
                state.spotList[i].setMap(state.map);
                state.spotInfoWindowList[i].open(state.map, state.spotList[i])
            }
        },
        async setMap(state, map){
            state.map = map;
        },
        setApartList(state, list) {
            state.apartList = list;
        },
        clearSpots(state) {
            for (var i = 0; i < state.spotList.length; i++) {
                state.spotList[i].setMap(null);
            }
            for (var j = 0; j < state.spotInfoWindowList.length; j++) {
                state.spotInfoWindowList[j].close();
            }
            state.spotList = [];
            state.spotInfoWindowList = [];
            state.investSpot = [];
            state.investSpotInfoWindowList = [];
            state.maxPrice = null;
            state.apartList = [];
        },
    }
  })
  
export default store