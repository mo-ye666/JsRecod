<template>
  <el-popover
    v-model="visible"
    placement="bottom-start"
    width="580"
    trigger="hover"
  >
    <el-button slot="reference" type="text"> {{ label }}</el-button>
    <div class="flex-row" style="flex-wrap:wrap">
      <div v-for="action in list" :key="action.value" class="action-item flex-row" :class="{seleted:action.value===value}" @click="selectHandler(action)">
        <svg-icon :icon-class="action.icon" />
        <div class="flex-col" style="justify-content:center">
          <span class=""> {{ action.label }}</span>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<script>
export default {
  name: 'ActionSelect',
  components: { },
  props: {
    value: {
      type: String,
      default: ''
    },
    params: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      visible: false,
      list: [
        { value: 'api', label: '调用服务', icon: 'api' },
        { value: 'model', label: '调用模型', icon: 'model-lib' },
        { value: 'callMethod', label: '函数调用', icon: 'fx' },
        { value: 'setValue', label: '数据对象', icon: 'val' },
        { value: 'formValidate', label: '表单校验', icon: 'validate' },
        { value: 'pushMessage', label: '消息推送', icon: 'pushmsg' },
        { value: 'message', label: '提示消息', icon: 'message' },
        { value: 'confirm', label: '操作确认', icon: 'confirm' },
        { value: 'openUrl', label: '打开页面', icon: 'open' },
        { value: 'dialog', label: '弹出窗口', icon: 'dialog' },
        { value: 'close', label: '关闭页面', icon: 'close' },
        { value: 'export', label: '数据导出', icon: 'export' },
        { value: 'compMethod', label: '组件方法', icon: 'component' },
        { value: 'waterMark', label: '添加水印', icon: 'water' },
        { value: 'reFreshTemplate', label: '刷新模板', icon: 'table' }]
    }
  },
  computed: {
    label() {
      return this.value ? this.list.find(item => item.value === this.value).label : '请选择动作类型'
    }
  },
  methods: {
    selectHandler(action) {
      this.$emit('input', action.value)
      this.visible = false
    },
    visibleHandler(bool) {

    }
  }
}
</script>

<style scoped lang="scss">
.svg-icon {
  width: 38px;
  height: 40px;
  margin-right:10px;
}
.action-item{
  width:100px;
  padding:8px 15px 8px 10px;
  border-radius: 4px;
  background: #a3a6b3;
  margin:10px;
  color:#fff;
  font-size: 12px;
  &:hover,&.seleted{
    background: #536edc;
  }
  cursor: pointer;
}
</style>
