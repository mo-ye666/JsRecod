<template>
  <el-dialog
    title="组件配置"
    :visible.sync="visible"
    width="85vw"
    custom-class="design-dialog"
    :close-on-click-modal="false"
    @close="cancel"
  >
    <div class="flex-col dialog-content">
      <el-collapse v-model="activeCol" accordion class="i-collapse">
        <el-collapse-item title="1、可配置属性定义" name="1">
          <div style="padding:10px 0">
            <el-button-group>
              <el-button
                type="default"
                icon="el-icon-plus"
                size="small"
                @click="addField()"
              >添加属性</el-button>
            </el-button-group>
          </div>
          <el-table ref="fieldTable" max-height="360px" :data="fields" border size="mini" row-key="id">
            <el-table-column
              type="index"
              width="40"
            />
            <el-table-column label="属性名称" prop="name" width="150" class-name="mycell">
              <div slot-scope="scope" class="flex-row flex-grow" style="display:inline-block">
                <el-input v-model="scope.row.name" size="mini" />
              </div>
            </el-table-column>
            <el-table-column label="属性中文名" prop="label" width="150">
              <template slot-scope="scope">
                <el-input v-model="scope.row.label" size="mini" />
              </template>
            </el-table-column>
            <el-table-column label="属性配置器" prop="editor" width="150">
              <template slot-scope="scope">
                <div class="flex-row">
                  <el-select
                    v-model="scope.row.editor"
                    size="mini"
                    placeholder="请选择"
                  >
                    <el-option
                      v-for="item in editorTypes"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <el-popover
                    placement="bottom"
                    width="300"
                    trigger="click"
                  >
                    <div v-for="(data,index) in scope.row.options" :key="index" class="flex-row option-row">
                      <el-input
                        v-model="data.value"
                        placeholder="选项值"
                        size="mini"
                        clearable
                      />
                      <el-input
                        v-model="data.label"
                        placeholder="选项名称"
                        size="mini"
                        clearable
                      />
                      <el-button v-show="scope.row.editor==='select'" slot="reference" type="default" icon="el-icon-delete" size="mini" @click="delOption(scope.row.options,index)" />

                    </div>
                    <el-button
                      style="margin-top:10px"
                      type="default"
                      icon="el-icon-plus"
                      size="mini"
                      @click="addOptions(scope.row)"
                    >添加选项</el-button>
                    <el-button v-show="scope.row.editor==='select'" slot="reference" type="default" icon="el-icon-setting" size="mini" />
                  </el-popover>

                </div>
              </template>
            </el-table-column>
            <el-table-column label="帮助描述" prop="help" width="300">
              <template slot-scope="scope">
                <el-input v-model="scope.row.help" size="mini" />
              </template>
            </el-table-column>
            <el-table-column label="数据类型" prop="dataType" width="150">
              <template slot-scope="scope">
                <el-select
                  v-model="scope.row.dataType"
                  size="mini"
                  placeholder="请选择"
                  @change="typeChangeHandler(scope.row)"
                >
                  <el-option
                    v-for="item in fieldTypes"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>

              </template>
            </el-table-column>
            <el-table-column label="默认值" prop="defaultValue" align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.defaultValue" size="mini" />
              </template>
            </el-table-column>

            <el-table-column label="操作" prop="name" width="110">
              <template slot-scope="scope">
                <el-button-group>
                  <el-button type="default" plain icon="el-icon-delete" size="mini" @click="removeRow(scope.row)" />
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
        <el-collapse-item title="2、可配置事件定义" name="2">
          <div style="padding:10px 0">
            <el-button-group>
              <el-button
                type="default"
                icon="el-icon-plus"
                size="small"
                @click="addEvent()"
              >添加事件</el-button>
            </el-button-group>
          </div>
          <el-table ref="eventsTable" max-height="360px" :data="events" border size="mini" row-key="id">
            <el-table-column
              type="index"
              width="40"
            />
            <el-table-column label="事件名称" prop="name" width="150" class-name="mycell">
              <div slot-scope="scope" class="flex-row flex-grow" style="display:inline-block">
                <el-input v-model="scope.row.name" size="mini" />
              </div>
            </el-table-column>
            <el-table-column label="事件描述" prop="label">
              <template slot-scope="scope">
                <el-input v-model="scope.row.label" size="mini" />
              </template>
            </el-table-column>
            <el-table-column label="操作" prop="name" width="120">
              <template slot-scope="scope">
                <el-button-group>
                  <el-button type="default" plain icon="el-icon-delete" size="mini" @click="removeRow(scope.row,true)" />
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>

      </el-collapse>

    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="cancel">取 消</el-button>
      <span style="display: inline-block; width: 20px" />
      <el-button size="small" type="primary" @click="confirm"> 确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { options, uuid } from '@/utils/util'
import { bus, EVENTS } from '@/common/eventBus'
import metadata from '@/common/metadata'
export default {
  components: {},

  data() {
    return {
      visible: false,
      activeCol: '1',
      events: [],
      editorTypes: options({
        'input': '文本框',
        'i18n': '国际化',
        'bool': '开关',
        'select': '下拉框',
        'method': '页面方法选择',
        'model': '模型选择器',
        'number': '数字输入框'
      }),
      fieldTypes: options({
        'String': '字符串',
        'Number': '数字',
        'Object': '对象',
        'Array': '数组'
      }),

      fields: []
    }
  },

  created() {
    bus.$on(EVENTS.SHOW_COMP_CONFIG, () => {
      // this.callback = meta.callback

      this.fields = metadata.meta.compProps || []
      this.events = metadata.meta.compEvents || []
      this.visible = true
    })
  },
  mounted() {},

  methods: {
    cancel() {
      this.visible = false
    },
    confirm() {
      this.validate(() => {
        this.fields.forEach(field => {
          if (field.editor !== 'select') {
            delete field.options
          }
        })
        metadata.meta.compProps = this.fields
        metadata.meta.compEvents = this.events
        const props = metadata.meta.models.find(m => m.id === 'props')
        props.fields = this.fields.map((field) => {
          return {
            id: field.name,
            name: field.name,
            label: field.label,
            dataType: field.dataType,
            defaultValue: field.defaultValue
          }
        })
        this.visible = false
      })
    },
    addField() {
      this.fields.push({
        id: uuid(12),
        name: '',
        label: '',
        dataType: 'String',
        defaultValue: '',
        editor: 'input'
      })
    },
    addEvent() {
      this.events.push({
        id: uuid(12),
        name: 'eventName' + (this.events.length + 1),
        label: 'xx事件'
      })
    },
    addOptions(data) {
      if (!data.options) {
        this.$set(data, 'options', [])
      }
      data.options.push({
        value: '', label: ''
      })
    },
    delOption(data, index) {
      data.splice(index, 1)
    },
    validate(callback) {
      let error = ''
      const ctx = { rowIndex: 0 }
      this.fields.some((field) => {
        error = this.vaildRow(field, ctx)
        return error
      })
      if (error) {
        this.$message({
          message: error,
          type: 'warning'
        })
      } else {
        callback()
      }
    },
    vaildRow(field, ctx) {
      ctx.rowIndex += 1
      if (!field.name || /^[A-Za-z]+[_A-Za-z0-9]*$/.test(field.name) === false) {
        return `第${ctx.rowIndex}行,请填写有效的属性名称`
      }
      if (!field.dataType) {
        return (`第${ctx.rowIndex}行,请选择字段的数据类型`)
      }
      if (!field.label.trim()) {
        return (`第${ctx.rowIndex}行,请输入中文名称`)
      }
    },
    typeChangeHandler(row) {
      if (row.dataType === 'Array' || row.dataType === 'Object') {
        this.$set(row, 'children', row.children || [])
      } else {
        delete row.children
      }
      this.fields.splice(1, 0)
    },
    removeRow(row, isEvent) {
      if (isEvent) {
        this.events = this.events.filter(item => {
          return item !== row
        })
      } else {
        this.fields = this.fields.filter(item => {
          return item !== row
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.my-form .layout{
  border: 1px solid #eee;
  padding:5px 10px
}
.content-layout {
  padding: 0 0 0 10px;
  line-height: 30px;
  font-size: 13px;
  overflow: hidden;
}
.dialog-content {
  height: 530px
}
.dialog-footer {
  margin-bottom: -8px;
}
.option-row{
  padding:5px 5px 0 0;
  >*{
    margin-right:10px;
  }
}
::v-deep .i-collapse .el-collapse-item__header {
    display: flex;
    flex-direction: row;
    background: #e9ecef;
    font-weight: bold;
    color:#666;
    height: 40px;
    line-height: 40px;
    padding-left: 5px;
}
::v-deep .design-dialog {
  margin: 60px auto 0 !important;
}
::v-deep .el-dialog__body {
  padding: 0 20px;
}
::v-deep  .el-button--mini, .el-button--mini.is-round {
    padding: 7px 8px;
}
::v-deep .mycell .cell{
  display: flex;
  flex-direction: row;
}
</style>
