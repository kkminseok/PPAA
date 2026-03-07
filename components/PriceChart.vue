<template>
  <div v-if="chartData && chartData.length > 0" class="price-chart px-3 pb-3">
    <v-card color="grey darken-3" rounded="lg" class="pa-3">
      <div class="text-caption grey--text mb-1">월별 평균 평당가 추이</div>

      <!-- Min / Max labels -->
      <div class="d-flex justify-space-between mb-1">
        <span class="text-caption primary--text font-weight-bold">
          최고 {{ maxValue.toLocaleString() }}만
        </span>
        <span class="text-caption grey--text">
          최저 {{ minValue.toLocaleString() }}만
        </span>
      </div>

      <!-- Sparkline -->
      <v-sparkline
        :value="values"
        :labels="labels"
        color="primary"
        line-width="2"
        padding="8"
        smooth
        auto-draw
        :auto-draw-duration="600"
        show-labels
        label-size="7"
        type="trend"
        height="80"
        style="width:100%;"
      />

      <!-- X-axis first / last label -->
      <div class="d-flex justify-space-between mt-1">
        <span class="text-caption grey--text" style="font-size:10px !important;">
          {{ labels[0] }}
        </span>
        <span class="text-caption grey--text" style="font-size:10px !important;">
          {{ labels[labels.length - 1] }}
        </span>
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'PriceChart',
  props: {
    // Array of { label: "24.01", value: 1234 } objects, sorted oldest to newest
    chartData: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    values() {
      return this.chartData.map(d => d.value)
    },
    labels() {
      return this.chartData.map(d => d.label)
    },
    maxValue() {
      return this.values.length ? Math.max(...this.values) : 0
    },
    minValue() {
      return this.values.length ? Math.min(...this.values) : 0
    }
  }
}
</script>

<style scoped>
.price-chart {
  width: 100%;
}
</style>
