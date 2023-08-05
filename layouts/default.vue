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
      <v-simple-table height="100%">
        <tbody>
          <tr v-for="(row, index) in dividedCities" :key="index">
            <td v-for="(city, cityIndex) in row" :key="cityIndex">{{ city.name }} &nbsp;</td>
          </tr>
        </tbody>
      </v-simple-table>

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
      cities: [
          { name: '서울시' },
          { name: '경기도' },
          { name: '부산시' },
          { name: '대구시' },
          { name: '인천시' },
          { name: '광주시' },
          { name: '대전시' },
          { name: '울산시' },
          { name: '세종시' },
          { name: '강원도' },
        ],
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
  }
}
</script>
