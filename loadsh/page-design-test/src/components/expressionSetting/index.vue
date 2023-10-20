<template>
  <div>
    <el-input v-model="value" v-bind="$attrs" size="mini" v-on="$listeners">
      <el-button slot="append" icon="el-icon-notebook-2" @click="visible=true" />
    </el-input>
    <settings 
      v-if="visible"
      :showVisible="visible"
      :value="value"
      @closeSettings="visible = false"
      :fieldSrc="varsOptions" @comfirm="confirmHandler" />
  </div>
</template>

<script>
import metadata from '@/common/metadata'
import { clone } from '@/utils/util'
import settings from './settings'
export default {
  name: 'ExpressionSetting',
  components: { settings },
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      varsOptions:[]
    }
  },
  mounted() {
    this.handleVaroptions();
  },
  methods: {
    handleVaroptions() {
      this.varsOptions = clone(metadata.meta.models).filter(item => item.id === 'pageData')[0].fields;
    },
    confirmHandler(rule) {
      this.$emit('input', rule)
      this.visible = false
    }
  }
}
</script>

<style scoped>

</style>
