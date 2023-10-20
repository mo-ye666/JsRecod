<template>
  <div>
    <el-input v-model="value" v-bind="$attrs" size="mini" v-on="$listeners">
      <el-button slot="append" icon="el-icon-search" @click="visible=true" />
    </el-input>
    <selector v-if="visible" :visible.sync="visible" :current="value" @select="selectHandler" />
  </div>
</template>

<script>
import selector from './selector'
export default {
  name: 'IconSelect',
  components: { selector },
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false
    }
  },
  methods: {
    selectHandler(icon) {
      this.$emit('input', icon)
      this.visible = false
    }
  }
}
</script>

<style scoped>

</style>
