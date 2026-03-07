<template>
  <div class="px-3 py-2">
    <div class="text-caption grey--text mb-2">조회 기간</div>
    <v-chip-group
      v-model="selectedIndex"
      mandatory
      active-class="primary white--text"
    >
      <v-chip
        v-for="option in periodOptions"
        :key="option.months"
        :value="option.months"
        small
        outlined
        filter
        class="period-chip"
      >
        {{ option.label }}
      </v-chip>
    </v-chip-group>
  </div>
</template>

<script>
export default {
  name: 'DateFilter',
  data() {
    return {
      selectedIndex: 12,
      periodOptions: [
        { label: '1개월', months: 1 },
        { label: '3개월', months: 3 },
        { label: '6개월', months: 6 },
        { label: '1년',   months: 12 },
      ],
    }
  },
  watch: {
    selectedIndex(val) {
      this.$emit('period-change', val)
    },
  },
}
</script>

<style scoped>
.period-chip {
  font-size: 11px !important;
  height: 24px !important;
}
</style>
