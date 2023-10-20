<template>
  <el-dialog
    title="参数设置"
    :visible.sync="visible"
    width="85vw"
    custom-class="design-dialog"
    :close-on-click-modal="false"
  >
    <div class="flex-col dialog-content">
      <div style="padding:10px 0">
        <el-button-group>
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="addField()"
          >添加</el-button>
        </el-button-group>
      </div>
      <el-table ref="fieldTable" max-height="480px" :data="params" border size="mini" row-key="id">
        <el-table-column
          type="index"
          width="40"
        />
        <el-table-column label="字段名称" prop="name" width="200" class-name="mycell">
          <div slot-scope="scope" class="flex-row flex-grow" style="display:inline-block">
            <span v-if="scope.row.custom" class="">
              <el-input v-model="scope.row.name" size="mini" />
            </span>
            <span v-else>
              {{ scope.row.name }}
            </span>
          </div>
        </el-table-column>
        <el-table-column label="字段描述" prop="label" width="200">
          <template slot-scope="scope">
            <div v-if="scope.row.custom || scope.row.isFilter" class="">
              <i18n-select v-if="scope.row.isFilter" v-model="scope.row.label" size="mini" />
              <el-input v-else v-model="scope.row.label" size="mini" />
            </div>
            <div v-else>
              {{ scope.row.label }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="数据类型" prop="fieldType" width="130">
          <template slot-scope="scope">
            <div v-if="scope.row.custom" class="">
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
            </div>
            <div v-else>
              {{ scope.row.dataTypeRemark || scope.row.dataType }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="参数值" prop="defaultValue" align="center">
          <template slot-scope="scope">
            <div class="flex-row input-with-select el-input el-input-group el-input-group--append el-input-group--prepend">
              <el-select slot="prepend" v-model="scope.row.valueSource" placeholder="请选择" size="mini" style="width:120px;flex-shrink:0" clearable>
                <el-option label="静态值" value="value" />
                <el-option label="数据模型" value="model" />
                <el-option label="编排上下文" value="context" />
                <el-option label="当前数据行" value="parent" />
                <el-option label="方法获取" value="method" />
                <el-option label="全局对象" value="global" />
              </el-select>
              <el-input v-show="['value','context','global'].includes(scope.row.valueSource)" v-model="scope.row.defaultValue" placeholder="请输入内容" class="input-with-select" size="mini" />
              <model-select v-show="scope.row.valueSource=='model'" v-model="scope.row.defaultValue" :check-strictly="true" style="width:100%" :show-all-levels="true" />
              <el-select
                v-show="scope.row.valueSource=='method'"
                v-model="scope.row.defaultValue"
                filterable
                style="width: 100%"
                clearable
                size="mini"
                @visible-change="loadPageMethods"
              >
                <el-option
                  v-for="item in pageMethods"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
              <el-select
                v-show="scope.row.valueSource=='parent'"
                v-model="scope.row.defaultValue"
                filterable
                style="width: 100%"
                clearable
                size="mini"
                @visible-change="loadDataField"
              >
                <el-option
                  v-for="item in dataFields"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>

          </template>
        </el-table-column>
        <el-table-column label="是否必须" prop="inputRequired" align="center" width="100">
          <template slot-scope="scope">
            <i v-show="scope.row.inputRequired" class="el-icon-check" style="color:green;font-size:16px" />
          </template>
        </el-table-column>
        <el-table-column v-if="showSerach" label="用于筛选条件" prop="isFilter" align="center" width="110">
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.isFilter" />
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="name" width="110">
          <template slot-scope="scope">
            <el-button-group v-if="scope.row.custom">
              <el-button v-show="scope.row.dataType === 'Object' " type="default" icon="el-icon-plus" size="mini" @click="addField(scope.row)" />
              <el-button type="default" plain icon="el-icon-delete" size="mini" @click="removeRow(scope.row)" />
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="visible=false">取 消</el-button>
      <span style="display: inline-block; width: 20px" />
      <el-button size="small" type="primary" @click="confirm"> 确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import service from '@/common/service'
import metadata from '@/common/metadata'
import datamodel from '@/common/datamodel'
import { options, uuid, clone } from '@/utils/util'
import { bus, EVENTS } from '@/common/eventBus'
export default {
  components: {},
  data() {
    return {
      visible: false,
      fieldTypes: options({
        'String': '字符串',
        'Integer': '数字',
        'Date': '日期',
        'Object': '对象',
        'Array': '数组'
      }),
      params: [],
      callback: null,
      pageMethods: [],
      dataFields: [],
      showSerach: false,
      uuid: ''
    }
  },

  created() {
    bus.$on(EVENTS.SHOW_PARAMS_EDITOR, ({ params, callback, apiUcode, showSearch, uuid, pageId, modelCode, funcCode }) => {
      this.showSerach = showSearch
      this.uuid = uuid
      if (apiUcode) {
        service.queryApiInfo(apiUcode).then(({ data }) => {
          let arr = data.requestDetailsResponseVoList || []
          if (data.requestParamType === 2 || data.requestParamType === 3) {
            arr = [
              {
                fieldName: 'baseList',
                fieldRemark: data.requestParamDesc,
                fieldType: data.requestBaseType || `Array`,
                fieldTypeRemark: `Array (${data.requestBaseType || 'Object'})`,
                childNode: arr || []
              }
            ]
          }
          const fields = arr.map(col => {
            return datamodel.columnToField(col)
          })
          if (data.requestParamType === 2 || data.requestParamType === 3) {
            fields[0].dataTypeRemark = `Array (${data.requestBaseType || 'Object'})`
          }
          this.syncParams(fields, params)
          this.params = fields
        })
      } else if(modelCode && funcCode) {
        this.getModelFuncDetail(modelCode, funcCode, params);
      }else if (pageId) {
        this.params = clone(params) || []
        service.queryPageInfo(pageId).then(({ data }) => {
          const params = data.pageRequest ? JSON.parse(data.pageRequest) : []
          if (this.params.length) {
            const arr = params.filter(data => {
              return !this.params.find(p => p.name === data.name)
            })
            this.params.push(...arr)
          } else {
            this.params = params
          }
        })
      } else {
        this.params = clone(params) || []
      }
      this.callback = callback
      this.visible = true
    })
  },

  methods: {
    confirm() {
      this.validate(() => {
        const params = this.params.filter(param => {
          if (param.isFilter || param.defaultValue || param.valueSource === 'parent' || param.dataType === 'Object' && param.children.filter(p => p.defaultValue).length) {
            return true
          }
        })
        this.callback(params)
        this.visible = false
      })
    },
    addField(parent) {
      (parent ? parent.children : this.params).push({
        id: uuid(12),
        name: '',
        label: '',
        dataType: 'String',
        defaultValue: '',
        valueSource: 'value',
        custom: true
      })

      if (parent) {
        this.params.splice(1, 0)
        this.$nextTick(() => {
          this.$refs.fieldTable.toggleRowExpansion(parent, true)
        })
      }
    },

    validate(callback) {
      let error = ''
      const ctx = { rowIndex: 0 }
      this.params.some((field) => {
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
        return `第${ctx.rowIndex}行,请填写有效的字段名称`
      }
      if (!field.dataType) {
        return (`第${ctx.rowIndex}行,请选择字段的数据类型`)
      }
      if (field.children) {
        let error
        field.children.some(item => {
          return (error = this.vaildRow(item, ctx))
        })
        return error
      }
    },
    typeChangeHandler(row) {
      if (row.dataType === 'Array' || row.dataType === 'Object') {
        this.$set(row, 'children', row.children || [])
      } else {
        delete row.children
      }
      this.params.splice(1, 0)
    },
    removeRow(row, parent) {
      if (parent) {
        parent.children = parent.children.filter(item => {
          if (item.children) {
            this.removeRow(row, item)
          }
          return item !== row
        })
      } else {
        this.params = this.params.filter(item => {
          if (item.children) {
            this.removeRow(row, item)
          }
          return item !== row
        })
      }
    },
    loadPageMethods() {
      const metadata = window.getMetaManager()
      this.pageMethods = metadata.meta.events.codeMethods.children.map(item => item.name)
    },
    // 参数同步
    syncParams(fields, params) {
      const newParamMap = {}; const oldParamMap = {}
      params.forEach(param => {
        oldParamMap[param.name] = param
      })
      fields.forEach(field => {
        newParamMap[field.name] = field
        const oldParam = oldParamMap[field.name]
        if (oldParam) {
          field.valueSource = oldParam.valueSource
          field.defaultValue = oldParam.defaultValue
          if (oldParam.isFilter) {
            field.isFilter = true
            field.label = oldParam.label
          }
          if (field.dataType === 'Object' && field.children) {
            this.syncParams(field.children, oldParam.children)
          }
        }
      })

      const customParams = params.filter(param => {
        if (!newParamMap[param.name]) {
          param.custom = true
          return true
        }
      })
      customParams.forEach(p => {
        fields.push(p)
      })
    },
    loadDataField(bool) {
      if (bool) {
        let fields = [{ value: '', label: '整行数据对象' }]
        const comps = metadata.getCompPathById(this.uuid)
        const names = ['tree', 'table']
        const comp = comps.find(item => names.includes(item.name))
        if (comp.design.initApi && comp.design.initApi.apiUcode) {
          const apiUcode = comp.design.initApi.apiUcode
          if (window._fields4api_[apiUcode]) {
            fields = window._fields4api_[apiUcode]
          } else {
            service.queryApiInfo(apiUcode).then(({ data }) => {
              if (!data.responseDetailsResponseVoList) {
                return
              }
              fields = fields.concat(data.responseDetailsResponseVoList.map(col => {
                return {
                  value: col.fieldName,
                  label: col.fieldName
                }
              }))
              window._fields4api_[apiUcode] = fields
              this.dataFields = fields
            })
          }
        }
        this.dataFields = fields
      }
    },
    // 获取模型方法详情
    getModelFuncDetail(modelCode, functionCode, params) {
      service.queryModelFuncDetail({modelCode, functionCode}).then(({ data }) => {
        let arr = data.paramInList || []
          if (data.requestParamType === 2 || data.requestParamType === 3) {
            arr = [
              {
                fieldName: 'baseList',
                fieldRemark: data.requestParamDesc,
                fieldType: data.requestBaseType || `Array`,
                fieldTypeRemark: `Array (${data.requestBaseType || 'Object'})`,
                childNode: arr || []
              }
            ]
          }
          const fields = arr.map(col => {
            return datamodel.columnToFieldByModelFunc(col)
          })
          if (data.requestParamType === 2 || data.requestParamType === 3) {
            fields[0].dataTypeRemark = `Array (${data.requestBaseType || 'Object'})`
          }
          this.syncParams(fields, params)
          this.params = fields
        // const fields = data.paramOutList.map(col => {
        //   return datamodel.columnToFieldByModelFunc(col)
        // })
        // this.allColumns = this.columns = this.syncColumns(fields, clone(columns) || [])
        // this.filterFields()
        // this.loading = false
      })
    },
    setFilter() {
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
