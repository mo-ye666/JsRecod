<template>
  <div class="v-chart-warp">
    <div ref="dom" class="v-chart-item" />
  </div>
</template>

<script>
import chart from './chart'
export default {
  name: 'VChart',
  components: {},
  props: {
    type: {
      type: String,
      default: ''
    },
    data: {
      type: Array,
      default: () => []
    },
    config: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      chartIns: null
    }
  },
  watch: {
    data() {
      this.render()
    },
    config: {
      deep: true,
      handler(newVal) {
        this.render()
      }
    }
  },
  created() {},
  mounted() {
    this.render()
  },
  methods: {
    render() {
      if (this.$refs.dom) {
        const conf = JSON.parse(JSON.stringify(this.config))
        conf.data = this.data || []
        conf.getOption = this.getOption
        this.chartIns = chart.render(this.type, conf, this.$refs.dom)
        this.$nextTick(() => {
          this.resize()
        })
      }
    },
    resize() {
      this.chartIns.resize()
    }
  }
}
</script>

<style lang="scss" scoped >
.v-chart-warp {
  background: #fff;
  min-height: 50px;
  .v-chart-item {
    width: 100%;
    height: 100%;
  }
}
::v-deep .a-b {
  background: red;
}
</style>
