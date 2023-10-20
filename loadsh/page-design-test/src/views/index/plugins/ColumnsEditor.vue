<template>
  <el-dialog
    title="表格列设置"
    :visible.sync="visible"
    width="90vw"
    custom-class="design-dialog"
    :close-on-click-modal="false"
  >
    <div v-if="visible" v-loading="loading" class="flex-col dialog-content">
      <div style="padding:10px 0" class="flex-row">

        <!-- <el-radio-group v-if="apiUcode" v-model="showAll" size="mini" @change="filterFields">
          <el-radio-button :label="true">显示所有字段</el-radio-button>
          <el-radio-button :abel="false">显示已选字段</el-radio-button>
        </el-radio-group> -->
        <div class="remark">
          注释: 被勾选的字段并且设置默认显示后,才会显示在表格中, 勾选状态,非默认显示的字段视为表格的隐藏字段,用户可以动过动态视图调整该列是否显示
        </div>
      </div>
      <el-table ref="fieldTable" height="480px" :data="columns" border size="mini" row-key="id" @select-all="selectAll">
        <el-table-column
          type="index"
          width="40"
        />
        <el-table-column
          align="center"
          width="45"
          type="selection"
        >
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.checked" :disabled="scope.row.custom || !!scope.row.inputRequired" @change="select($event,scope.row)" />
          </template>
        </el-table-column>

        <el-table-column label="字段名" prop="prop" class-name="mycell">
          <div slot-scope="scope" class="flex-row flex-grow" style="display:inline-block">
            <span v-if="scope.row.custom" class="">
              <el-input v-model="scope.row.prop" size="mini" />
            </span>
            <span v-else :class="{required:scope.row.inputRequired}">
              {{ scope.row.prop }}
            </span>
          </div>
        </el-table-column>

        <el-table-column label="列标题" prop="label">
          <template slot-scope="scope">
            <i18n-select v-if="scope.row.checked" v-model="scope.row.label" size="mini" />
            <div v-else>
              {{ scope.row.label }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="数据类型" prop="fieldType" width="150">
          <template slot-scope="scope">
            <div v-if="scope.row.custom && scope.row.checked" class="">
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
              {{ scope.row.dataType }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="默认显示" prop="show" align="center" width="80">
          <template v-if="scope.row.checked" slot-scope="scope">
            <el-checkbox v-model="scope.row.show" :disabled="!!scope.row.inputRequired" />
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sortable" align="center" width="80">
          <template v-if="scope.row.checked" slot-scope="scope">
            <el-checkbox v-model="scope.row.sortable" />
          </template>
        </el-table-column>
        <el-table-column label="列宽(px)" prop="width" align="center" width="110">
          <template v-if="scope.row.checked" slot-scope="scope">
            <el-input v-model="scope.row.width" size="mini" />
          </template>
        </el-table-column>

        <el-table-column label="列对齐" prop="align" align="center" width="140">
          <template v-if="scope.row.checked" slot-scope="scope">
            <div class="flex-row">
              <el-select v-model="scope.row.align" size="mini" placeholder="左对齐">
                <el-option label="左对齐" value="" />
                <el-option label="右对齐" value="right" />
                <el-option label="居中对齐" value="center" />
              </el-select>
              <el-dropdown @command="handleCommand($event,scope.row,'align')">
                <span class="el-dropdown-link">
                  <i class="el-icon-document-copy el-icon--right copy-icon" />
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="up">向上复制</el-dropdown-item>
                  <el-dropdown-item command="down">向下复制</el-dropdown-item>
                  <el-dropdown-item command="all">全部复制</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>

          </template>
        </el-table-column>
        <el-table-column label="表头对齐" prop="header-align" align="center" width="140">
          <template v-if="scope.row.checked" slot-scope="scope">
            <div class="flex-row">
              <el-select v-model="scope.row['header-align']" size="mini" placeholder="左对齐">
                <el-option label="左对齐" value="" />
                <el-option label="右对齐" value="right" />
                <el-option label="居中对齐" value="center" />
              </el-select>
              <el-dropdown @command="handleCommand($event,scope.row,'header-align')">
                <span class="el-dropdown-link">
                  <i class="el-icon-document-copy el-icon--right copy-icon" />
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="up">向上复制</el-dropdown-item>
                  <el-dropdown-item command="down">向下复制</el-dropdown-item>
                  <el-dropdown-item command="all">全部复制</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="name" width="100">
          <template v-if="scope.row.checked" slot-scope="scope">
            <el-button-group v-if="scope.row.custom">
              <el-button v-show="complexHeader && scope.row.dataType === 'Object' && scope.row.custom" type="default" icon="el-icon-plus" size="mini" @click="addField(scope.row)" />
              <el-button type="default" plain icon="el-icon-delete" size="mini" @click="removeRow(scope.row)" />
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

    </div>
    <div slot="footer" class="dialog-footer flex-row">
      <el-button icon="el-icon-plus" size="mini" @click="addField()">添加字段</el-button>
      <div class="flex-grow" />
      <el-button size="small" @click="visible=false">取 消</el-button>
      <span style="display: inline-block; width: 20px" />
      <el-button size="small" type="primary" @click="confirm"> 确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import service from '@/common/service'
import datamodel from '@/common/datamodel'
import { options, uuid, clone } from '@/utils/util'
import { bus, EVENTS } from '@/common/eventBus'
import {treeEach} from "../../../compile/common/util";
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
      allColumns: [],
      columns: [],
      callback: null,
      pageMethods: [],
      showAll: true,
      apiUcode: '',
      // 是否是多级表头
      complexHeader: '',
      loading: true

    }
  },

  created() {
    bus.$on(EVENTS.SHOW_COLUMNS_EDITOR, ({ columns, callback, apiUcode, complexHeader, modelCode, funcCode,columnSource,columnSourceObj, }) => {
      this.loading = true
      this.apiUcode = apiUcode
      this.complexHeader = complexHeader
      if (apiUcode) {
        service.queryApiInfo(apiUcode).then(({ data }) => {
          if (!data.responseDetailsResponseVoList) {
            window.getApp().$message.warning('该接口没有输出,无法作为列配置使用')
            this.loading = false
            return
          }
          const fields = data.responseDetailsResponseVoList.map(col => {
            return datamodel.columnToField(col)
          })
          this.allColumns = this.columns = this.syncColumns(fields, clone(columns) || [])
          this.filterFields()
          this.loading = false
        })
      }
      else if(modelCode && funcCode) {
        this.getModelFuncDetail(modelCode, funcCode, columns);
      }
      else if(columnSource === 'object' && columnSourceObj){
        const metadata = window.getMetaManager()
        const model = metadata.meta.models.find(m => m.id === columnSourceObj.split('.')[0])
        let fields = []
        if ( columnSourceObj.split('.').length >1) {
          if (model) {
            treeEach(model.fields, (item) => {
              if (item.id === columnSourceObj) {
                item.children && (fields = clone(item.children))
              }
            })
          }
        }else {
          fields = clone(model.fields)
        }
        fields.map(ele => {
          ele.custom = false;
        })
        this.allColumns = this.columns = this.syncColumns(clone(fields), clone(columns) || [])
        this.loading = false
      }
      else {
        const cols = clone(columns) || []
        cols.forEach(col => {
          col.id = col.id || `col_${uuid(6)}`
          col.checked = true
          col.show = true
          col.render = col.render || ''
        })
        this.columns = cols
        this.loading = false
      }
      this.callback = callback
      this.visible = true
    })
  },

  methods: {
    confirm() {
      this.validate(() => {
        const columns = this.columns.filter(col => col.checked)

        columns.forEach(col => {
          if (!this.complexHeader) {
            delete col.children
          }
          col.label = col.label || col.prop
        })
        this.callback(this.columns.filter(col => col.checked))
        this.visible = false
      })
    },
    filterFields() {
      if (this.showAll) {
        this.columns = this.allColumns
      } else {
        this.columns = this.allColumns.filter(col => col.checked)
      }
    },
    addField(parent) {
      (parent ? parent.children : this.columns).push({
        id: uuid(12),
        prop: '',
        label: '',
        dataType: 'String',
        show: true,
        custom: true,
        checked: true,
        _name_: 'table-column'
      })

      if (parent) {
        this.columns.splice(1, 0)
        this.$nextTick(() => {
          this.$refs.fieldTable.toggleRowExpansion(parent, true)
        })
      }
    },

    validate(callback) {
      let error = ''
      const ctx = { rowIndex: 0 }
      this.columns.some((field) => {
        error = this.vaildRow(field, ctx)
        return error
      })
      // 验证是否有重名字段
      if (!error) {
        const name = this.validFieldName(this.columns)
        if (name) {
          error = `字段名 ${name} 出现重复,请修改`
        }
      }
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
      if (!field.prop || /^[A-Za-z]+[_A-Za-z0-9]*$/.test(field.prop) === false) {
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
      this.columns.splice(1, 0)
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
        this.columns = this.columns.filter(item => {
          if (item.children) {
            this.removeRow(row, item)
          }
          return item !== row
        })
      }
    },
    /** 列数据同步
     * @param {Array} fields 调用api查询出来的字段信息
     * @param {Arery} columns 原有配置信息
     */
    syncColumns(fields, columns) {
      const newColumnMap = {}; const oldColumnMap = {}
      fields.forEach(field => {
        field.prop = field.name
        delete field.name
        newColumnMap[field.prop] = field
      })
      columns.forEach(col => {
        oldColumnMap[col.prop] = col
        // 服务获取字段中是否有该字段配置信息
        if (newColumnMap[col.prop]) {
          // 如果有,则将服务返回的字段配置信息 一部分内容同步到配置中
          // 同步字段类型 (服务端有可能配置更新)
          col.dataType = newColumnMap[col.prop].dataType
          if (col.dataType === 'Object') {
            !col.children && (col.children = [])
            this.syncColumns(newColumnMap[col.prop].children || [], col.children)
          }
          delete col.custom
        } else {
          // 如果在api的返回配置中找不到 该字段信息, 说明该字段可能被删除或用户自定义的,需加上 custom 标识
          col.custom = true
        }
      })
      // 添加未选字段
      fields.forEach(field => {
        if (!oldColumnMap[field.prop]) {
          columns.push(field)
          if (field.inputRequired) {
            field.checked = field.show = true
          } else {
            field.checked = field.show = false
          }
          field.children && field.children.forEach(field => {
            field.prop = field.name
            delete field.name
          })
        }
      })
      columns.forEach(col => {
        col.render = col.render || ''
        col._name_ = 'table-column'
      })
      return columns
    },

    // 当前行是可选
    selectable(row) {
      return !row.custom
    },
    // 验证是否已有重名字段
    validFieldName(fields) {
      const map = {}
      let repeatName = ''
      const col = fields.find(field => {
        if (map[field.prop]) {
          repeatName = field.prop
          return repeatName
        } else {
          map[field.prop] = field
        }
        if (Array.isArray(field.children)) {
          repeatName = this.validFieldName(field.children)
          return repeatName
        }
      })
      if (col) {
        return repeatName
      }
    },
    select(bool, row) {
      this.$set(row, 'show', bool)
    },
    selectAll(arr) {
      if (arr.length) {
        this.columns.forEach(col => {
          col.checked = col.show = true
        })
      } else {
        this.columns.forEach(col => {
          if (!col.custom && !col.inputRequired) {
            col.checked = false
          }
        })
      }
    },
    handleCommand(command, data, colName) {
      let rows = this.allColumns
      if (command === 'up') {
        rows = rows.slice(0, rows.indexOf(data))
      } else if (command === 'down') {
        rows = rows.slice(rows.indexOf(data), rows.length - 1)
      }
      rows.forEach(row => {
        if (row.checked) {
          this.$set(row, colName, data[colName])
        }
      })
    },
    // 获取模型方法详情
    getModelFuncDetail(modelCode, functionCode, columns) {
      service.queryModelFuncDetail({modelCode, functionCode}).then(({ data }) => {
        if (!data.paramOutList) {
          window.getApp().$message.warning('该接口没有输出,无法作为列配置使用')
          this.loading = false
          return
        }
        const fields = data.paramOutList.map(col => {
          return datamodel.columnToFieldByModelFunc(col)
        })
        this.allColumns = this.columns = this.syncColumns(fields, clone(columns) || [])
        this.filterFields()
        this.loading = false
      })
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
div.remark{
  padding: 0 20px;
  color: #999;
  font-size: 12px;
}
span.required::before{
  content: '*';
  color:Red
}
.copy-icon{
  color:#5c6ce2;
  cursor: pointer;
}
</style>
