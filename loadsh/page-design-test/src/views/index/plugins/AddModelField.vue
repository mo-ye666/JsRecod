<template>

  <el-dialog
    title="添加模型字段"
    :visible.sync="visible"
    custom-class="create-popup"
    width="420px"
  >
    <div class="title-info">
      {{ title }}
    </div>
    <el-form ref="form" :model="field" label-width="90px">
      <el-form-item label="字段名">
        <el-input v-model="field.name" size="mini" />
      </el-form-item>
      <el-form-item label="字段类型">
        <el-select
          v-model="field.dataType"
          size="mini"
          placeholder="请选择"
          style="width:100%"
        >
          <el-option
            v-for="item in fieldTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div style="text-align: right; margin: 10px 0 0 0">
      <el-button
        size="mini"
        type="default"
        @click="visible = false"
      >取消</el-button>
      <el-button
        type="primary"
        size="mini"
        @click="saveField"
      >确定</el-button>
    </div>
  </el-dialog>

</template>
<script>
import { bus, EVENTS } from '@/common/eventBus'
import { options } from '@/utils/util'
export default {
  name: 'AddModelField',
  data() {
    return {
      visible: false,
      callback: null,
      model: null,
      title: '',
      fieldTypes: options({
        'String': '字符串',
        'Integer': '数字',
        'Date': '日期',
        'Object': '对象',
        'Array': '数组(集合)'
      }),
      field: {
        name: '',
        dataType: ''
      }
    }
  },
  watch: {
    value(value) {
      this.val = value
    }
  },
  created() {
    bus.$on(EVENTS.SHOW_ADD_FIELD, (param) => {
      this.callback = param.callback
      this.model = param.model
      this.visible = true
      this.field.name = ''
      this.field.dataType = 'String'
      this.title = '提示: 将在 ' + (this.model.name.indexOf('.') > 1 ? this.model.id : this.model.name) + ' 下添加字段'
    })
  },
  methods: {
    saveField() {
      const field = this.field
      if (!field.name || /^[A-Za-z]+[_A-Za-z0-9]*$/.test(field.name) === false) {
        this.$message.warning(`请填写有效的字段名称`)
        return
      }
      const ret = {
        id: this.model.id.indexOf('.') > 0 ? this.model.id + '.' + field.name : this.model.name + '.' + field.name,
        name: field.name,
        label: field.name,
        dataType: field.dataType,
        custom: true
      }
      this.callback(ret)
      this.visible = false
    },
    iconClick() {
      this.field.name = ''
      this.field.dataType = 'String'
      this.visible = true
    }
  }
}
</script>

<style lang="scss" scoped>

::v-deep .create-popup {
  width: 260px;
  box-sizing: border-box;
  right: 10px !important;
  .el-form-item {
    margin-bottom: 10px !important;
  }
  .el-input__inner {
    padding: 0 6px !important;
  }
  .el-popover__title {
    color: #5d5861;
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 12px;
    text-align: center;
  }
}
::v-deep .el-dialog__body {
  padding: 10px 20px 20px 20px;
}
::v-deep .el-dialog__title{
  font-size: 16px;
  font-weight: bold;
  color: #777;
}
.title-info{
  line-height: 40px;
    padding: 0 20px;
    background: #f6f6f6;
    font-size: 12px;
    color: #aba9a6;
    margin-bottom: 10px;
}
</style>
