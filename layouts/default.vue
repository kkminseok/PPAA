<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
      width="30%"
    >
    <v-toolbar
      dense
      floating
      width="100%"
    >
      <v-text-field
          hide-details
          prepend-icon="mdi-magnify"
          single-line
          label="지역을 검색하세요."
          clearable
        ></v-text-field>
    </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="cities"
        hide-default-header
        hide-default-footer
        class="elevation-1"
        height="100%" @click:row="test">
          <template #item="{ item }">
            <tr>
              <td @click="cellClickHandler(item, 'name1')">{{ item.name1 }}</td>
              <td @click="cellClickHandler(item, 'name2')">{{ item.name2 }}</td>
              <td @click="cellClickHandler(item, 'name3')">{{ item.name3 }}</td>
            </tr>
          </template>
      </v-data-table>

      <v-divider color="#64B5F6"></v-divider>

      지역 최고 평단가 : {{ $store.state.maxPrice }} 만원 <br>

      지역 70% 평단가 : {{$store.state.maxPrice * 0.7}} 만원 <br>
      <v-btn block
        v-on:click="showInvestApart">70%이상만 보기</v-btn>
      <v-btn block
        v-on:click="showAllApart">전체 보기</v-btn>  
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-btn
        icon
        @click.stop="miniVariant = !miniVariant"
      >
        <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="clipped = !clipped"
      >
        <v-icon>mdi-application</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="fixed = !fixed"
      >
        <v-icon>mdi-minus</v-icon>
      </v-btn>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer />
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <v-footer
      :absolute="!fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }} KMS</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire'
        }
      ],
      //초기 메뉴바 축소 확대
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Price Per Area Apartment',
      headers: [
        { text: 'Column 1', value: 'name1' },
        { text: 'Column 2', value: 'name2' },
        { text: 'Column 3', value: 'name3' }
      ],
      cities: [
          { name1: '서울시', name2: '경기도', name3: '부산시' },
          { name1: '대구시', name2: '인천시', name3: '광주시' },
          { name1: '대전시', name2: '울산시', name3: '세종시' },
          { name1: '강원도', name2: '추가 예정..'},
        ],
      seoul: [
        {name1: '강남구', name2: '강동구', name3: '강북구'},
        {name1: '강서구', name2: '관악구', name3: '광진구'},
        {name1: '구로구', name2: '금천구', name3: '노원구'},
        {name1: '도봉구', name2: '동대문구', name3: '동작구'},
        {name1: '마포구', name2: '서대문구', name3: '서초구'},
        {name1: '성동구', name2: '성북구', name3: '송파구'},
        {name1: '양천구', name2: '영등포구', name3: '용산구'},
        {name1: '은평구', name2: '종로구', name3: '중구'},
        {name1: '중랑구'},
      ]
    }
  },
  computed: {
    dividedCities() {
      const divided = [];
      const rows = 6;
      const cols = 3;
      let currentRow = 0;

      for (let i = 0; i < this.cities.length; i += cols) {
        divided.push(this.cities.slice(i, i + cols));
      }

      return divided;
    }
  },
  methods: {
    async showInvestApart(){
      this.$store.commit('hideAllSpot')
      this.$store.commit('showInvestSpot')
    },
    async showAllApart(){
      this.$store.commit('showAllSpot')
    },
    async test(value){
      console.log(value);
    },
    async cellClickHandler(item, columnName) {
      if(item[columnName] === '서울시'){
        this.cities = this.seoul;
      }
      console.log(`Clicked cell in column ${columnName}:`, item[columnName]);
    }
  }
}
</script>
