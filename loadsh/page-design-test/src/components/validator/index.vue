<template>
  <div class="validators">

    <div v-for="(item,index) in value" :key="index" class="rule-item">
      <span class="close-btn" @click="remove(index)">
        <i class="el-icon-close" />
      </span>
      <div class=" flex-row">
        <span class="rule-label">
          校验类型
        </span>
        <span class="prop-content flex-grow">
          <el-radio-group v-model="item.type" size="mini">
            <el-radio-button :label="0">正则</el-radio-button>
            <el-radio-button :label="1">函数</el-radio-button>
          </el-radio-group>
        </span>
      </div>
      <div v-if="item.type===0" class=" flex-row">
        <span class="rule-label">
          表达式
        </span>
        <span class="prop-content flex-grow">
          <el-input v-model="item.pattern" size="mini" />
        </span>
      </div>
      <div v-else class=" flex-row">
        <span class="rule-label">
          验证方法
        </span>
        <span class="prop-content flex-grow">
          <el-select v-model="item.func" filterable size="mini" @visible-change="visibleChange">
            <el-option
              v-for="method in methods"
              :key="method.name"
              :value="method.name"
            />
          </el-select>
        </span>
      </div>
      <div v-if="item.type===0" class=" flex-row">
        <span class="rule-label">
          错误提示
        </span>
        <span class="prop-content flex-grow">
          <i18n-select v-model="item.message" size="mini" />
        </span>
      </div>
    </div>
    <el-button type="text" icon="el-icon-plus" size="mini" @click="addRule">添加校验规则</el-button>
  </div>
</template>

<script>
export default {
  name: 'Validator',
  props: {
    value: {
      type: Array,
      default() { return [] }
    }
  },
  data() {
    return {
      methods: []
    }
  },
  created() {
  },
  methods: {
    visibleChange(icon) {
      const metadata = window.getMetaManager()
      this.methods = metadata.meta.events.codeMethods.children
    },
    addRule() {
      this.value.push({
        type: 0,
        pattern: '',
        func: ''
      })
      this.$emit('input', this.value)
    },
    remove(index) {
      this.value.splice(index, 1)
      this.$emit('input', this.value)
    }
  }
}
</script>

<style lang="scss" scoped>
.rule-label{
  width: 80px;
  font-size: 13px;
  text-align: right;
  flex-shrink: 0;
  padding-right: 8px;
  color:#6c757d
}
.rule-item{
  position: relative;
  background: #f8f8f8;
  margin-bottom:10px;
  .close-btn{
    position: absolute;
    right: -6px;
    top: -6px;
    display: block;
    width: 16px;
    height: 16px;
    line-height: 16px;
    background:rgb(228 0 0 / 29%);
    border-radius: 50%;
    color: #fff;
    text-align: center;
    z-index: 1;
    cursor: pointer;
    font-size: 12px;
  }
}
::v-deep .el-input__inner{
  padding:0 25px 0 22px !important
}
</style>
