<template>
  <el-dialog
    title="自定义搜索条件设置"
    :visible.sync="visible"
    width="90vw"
    custom-class="design-dialog"
    :close-on-click-modal="false"
  >
    <div v-if="visible" v-loading="loading" class="flex-col dialog-content">
      <div style="padding:10px 0" class="flex-column">
        <div class="remark">
          预览结果： <div class="review">{{ review }}</div>
        </div>
      </div>
      <div class="flex-row">
        <el-table
          id="fieldTable"
          ref="fieldTable"
          style="flex:4"
          height="480px"
          :data="columns"
          border
          size="mini"
          row-key="id"
          :row-style="tableRowStyleName"
          :tree-props="{ children: 'childConditionList' }"
        >
          <el-table-column
            type="index"
            width="40"
          />
          <el-table-column label="连接符" prop="fieldType" width="150" class-name="mycell">
            <template v-if="!scope.row._isFirst" slot-scope="scope">
              <el-select
                v-model="scope.row.conditionConnector"
                size="mini"
                clearable
                placeholder="请选择"
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
          <el-table-column label="字段名" prop="prop" width="220" class-name="mycell">
            <div v-if="scope.row.childConditionList.length === 0" slot-scope="scope" class="flex-row flex-grow" style="display:inline-block">
              <el-select
                v-model="scope.row.fieldName"
                style="width: 100%"
                :filterable="true"
                size="mini"
                @change="handelChangeFieldName(...arguments,scope.row)"
              >
                <template v-for="(item, index) in fieldNameList">
                  <el-option
                    :key="index"
                    :label="item.label + ': ' +item.fieldName "
                    :value="item.fieldName"
                  />
                </template>
              </el-select>
            </div>
          </el-table-column>

          <el-table-column label="操作符" prop="operator" class-name="mycell" width="120">
            <template v-if="scope.row.childConditionList.length === 0" slot-scope="scope">
              <el-select
                v-model="scope.row.operatorLabel"
                style="width: 100%"
                @change="handleOperatorChange(...arguments,scope.row)"
                size="mini"
                @visible-change="handleVisiable(...arguments, scope.row)"
              >
                <template v-for="(item, index) in operateTypeList">
                  <el-option
                    v-if="typeof item == 'string'"
                    :key="index"
                    :label="item"
                    :value="item"
                  />
                  <el-option
                    v-else
                    :key="index"
                    :label="item.label"
                    :value="item.label"
                  />
                </template>
              </el-select>
            </template>

          </el-table-column>

          <el-table-column label="字段值" prop="prop" class-name="mycell">
            <div
              v-if="scope.row.childConditionList.length === 0"
              slot-scope="scope"
              class="flex-row flex-grow"
              style="display:inline-block"
            >
              <template v-if="scope.row.operator !== 'IS_NULL' && scope.row.operator !== 'IS_NOT_NULL' ">

                <div class="flex-row input-with-select el-input el-input-group el-input-group--append el-input-group--prepend">
                  <el-select slot="prepend" v-model="scope.row.valueSource" placeholder="请选择" size="mini" style="width:100px;flex-shrink:0">
                    <el-option label="静态值" value="value" />
                    <el-option label="数据模型" value="model" />
                  </el-select>
                  <el-input v-show="scope.row.valueSource==='value'" v-model="scope.row.fieldValue" placeholder="" class="input-with-select" size="mini" />
                  <model-select v-show="scope.row.valueSource=='model'" v-model="scope.row.fieldValue" style="width:100%" />

                </div>
                <!-- <span v-if="scope.row.fieldType == 'Array'">
                  <el-input v-model="scope.row.fieldValueList" size="mini" placeholder="多数据用逗号隔开" />
                </span>
                <span v-else>
                  <el-input v-model="scope.row.fieldValue" size="mini" placeholder="单数据" />
                </span> -->
              </template>

            </div>
          </el-table-column>
          <el-table-column label="操作" prop="name" width="90">
            <template slot-scope="scope">
              <el-button-group>
                <el-button v-show="scope.row.childConditionList" type="default" icon="el-icon-plus" size="mini" @click="addCondition(scope.row)" />
                <el-button type="default" plain icon="el-icon-delete" size="mini" @click="removeCondition(scope.row)" />
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
        <el-table id="sortTable" style="flex:2" height="480px" :data="sortList" border size="mini" row-key="id">
          <el-table-column
            type="index"
            width="40"
          >
            <template>
              <div class="select-line-icon icon-btn">
                <i class="el-icon-sort" />
              </div>
            </template>
          </el-table-column>

          <el-table-column label="字段名" prop="prop" class-name="mycell">
            <div slot-scope="scope" class="flex-row flex-grow" style="display:inline-block">
              <el-select
                v-model="scope.row.fieldName"
                style="width: 100%"
                :filterable="true"
                clearable
                size="mini"
              >
                <template v-for="(item, index) in responseFieldNameList">
                  <el-option
                    :key="index"
                    :label="item.fieldRemark + ': ' +item.fieldName "
                    :value="item.fieldName"
                  />
                </template>
              </el-select>
            </div>
          </el-table-column>
          <!-- 批量渲染属性表头 -->
          <template v-for="col in sortOptions">
            <el-table-column
              :key="col.value"
              :prop="col.value"
              :label="col.label"
              align="center"
              :width="col.width ||120"
            >
              <template slot="header">
                {{ col.label }}
                <el-tooltip v-if="col.tips" class="item" effect="dark" :content="col.tips" placement="top-start">
                  <el-button type="text" icon="p-icon-info-circle2" />
                </el-tooltip>
              </template>
              <template v-if="col.isShow ? col.isShow(scope) : true" slot-scope="scope">
                <el-select
                  v-if="col.fieldType == 'select'"
                  v-model="scope.row[col.value]"
                  style="width: 100%"
                  :filterable="true"
                  :allow-create="col.allowCreate"
                  size="mini"
                  @change="handelChange(col,scope)"
                >
                  <template v-for="(item, index) in col.fieldOptions">
                    <el-option
                      v-if="typeof item == 'string'"
                      :key="index"
                      :label="item"
                      :value="item"
                    />
                    <el-option
                      v-else
                      :key="index"
                      :label="item.label"
                      :value="item.value"
                    />
                  </template>
                </el-select>
                <el-checkbox v-else-if="col.fieldType == 'checkbox'" v-model="scope.row[col.value]" />
                <el-input
                  v-else
                  v-model="scope.row[col.value]"
                  size="mini"
                  @input="forceUpdate"
                />
              </template>

            </el-table-column>
          </template>
          <el-table-column label="操作" prop="name" width="80">
            <template slot-scope="scope">
              <el-button-group>
                <el-button v-show="scope.row.childConditionList" type="default" icon="el-icon-plus" size="mini" @click="addCondition(scope.row)" />
                <el-button type="default" plain icon="el-icon-delete" size="mini" @click="removeSort(scope.row)" />
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div slot="footer" class="dialog-footer flex-row">
      <el-button icon="el-icon-plus" size="mini" @click="addCondition()">添加条件</el-button>
      <el-button icon="el-icon-plus" size="mini" @click="addSort()">添加排序</el-button>
      <div class="flex-grow" />
      <el-button size="small" @click="close">取 消</el-button>
      <span style="display: inline-block; width: 20px" />
      <el-button size="small" type="primary" @click="success"> 确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { options } from '@/utils/util'
import { bus, EVENTS } from '@/common/eventBus'
import service from '@/common/service'
import Sortable from 'sortablejs'
export default {
  components: {},
  props: {
    options: Object
  },
  data() {
    return {
      mockJson: '',
      sortTableDrop: false,
      visible: false,
      fieldTypes: options({
        '&': '与',
        '||': '或'
      }),
      columns: [], // 条件集合
      sortList: [], // 排序集合
      callback: null,
      apiUcode: '',
      loading: true,
      flattArray: [], // 多选集合
      fieldNameList: [], // 请求字段集合
      responseFieldNameList: [], // 响应字段集合
      operateTypeList: [], // 当前字段名对应的操作符集合
      fieldsMap: {}, // 字段对应的详细信息
      colorList: ['rgba(200, 247, 234, 0.25)', 'rgb(245, 247, 214)', 'rgb(253, 213, 214)', 'rgb(221, 247, 225)'],
      sortOptions: [{
        label: '排序方式',
        value: 'sortType',
        fieldOptions: [{ label: '升序', value: 'asc' }, { label: '降序', value: 'desc' }],
        fieldType: 'select',
        change(row) {
          if (row.operator === 'IS_NULL' || row.operator === 'IS_NOT_NULL') {
            row.fieldValue = ''
          }
        }
      }] // 排序表头项
    }
  },
  computed: {
    review() {
      return this.handleReview('', this.columns)
    }
  },
  created() {
    bus.$on(EVENTS.SHOW_CONDITION_EDITOR, (conf) => {
      this.show(conf)
    })
  },
  methods: {
    /**
       * 克隆数据列
       * data:老的列配置
       * api: 数据源信息 （自定义列头，api为空）
       * */
    async cloneColumns(data, apiUcode) {
      let columns = []
      /**
         * 绑定数据源
         * todo 需要将高级查询存到一个对象中，key为filename，value为当前属性，条件选择字段名的时候填充operateTypeList到当前条件中，并清掉原来的operator
         */
      if (apiUcode) {
        const res = await service.queryApiInfo(apiUcode)
        const apiInfo = res?.data || {}
        this.fieldNameList = apiInfo.seniorQuerySingleFormVOList
        this.responseFieldNameList = apiInfo.responseDetailsResponseVoList
        this.fieldsMap = this.syncColumns(this.fieldNameList)
      }
      /**
         * 无绑定数据源
         */
      columns = data ? JSON.parse(JSON.stringify(data)) : []
      columns.forEach(col => {
        col.id = col.id || `col_${this.uuid(6)}`
      })
      this.loading = false
      return columns
    },

    // 是否显示
    async show(options) {
      this.visible = true
      this.loading = true
      this.columns = []
      if (!options) return
      this.columns = await this.cloneColumns(options.conditionList, options.apiUcode)
      this.sortList = options.sortList || []
      this.confirm = options.confirm ? options.confirm : null
      this.cancel = options.cancel ? options.cancel : null
    },
    success() {
      this.validate(() => {
        this.$confirm('请确认自定义搜索条件是否完整？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const sortList = this.sortList.filter(col => col.fieldName)
          this.visible = false
          if (typeof this.confirm !== 'function') return
          this.confirm({ sortList, conditionList: this.columns, seniorQuerySingleFormVOList: this.fieldNameList })
        })
      })
    },
    close() {
      this.visible = false
      this.loading = true
      this.sortTableDrop = false
      this.columns = []
      if (typeof this.cancel !== 'function') return
      this.cancel()
    },
    /**
       * 新增条件
       * */
    addCondition(parent) {
      var obj = {
        id: this.uuid(12),
        childConditionList: [],
        fieldName: '',
        operator: '',
        fieldValue: '',
        fieldValueList: '',
        fieldType: '',
        operateTypeList: [],
        conditionConnector: this.columns.length ? '&' : ''
      }
      if (parent) {
        if (!parent.childConditionList.length) {
          const parentData = Object.assign({}, parent)
          parentData._isFirst = true
          parentData.id = this.uuid(12)
          parentData.childConditionList = []
          parent.childConditionList.push(parentData)
        } // 数据第一条数据增加标志
        parent.childConditionList.push(obj)
      } else {
        if (!this.columns.length) {
          obj._isFirst = true
        } // 数据第一条数据增加标志
        this.columns.push(obj)
      }

      if (parent) {
        this.columns.splice(1, 0)
        this.$nextTick(() => {
          this.$refs.fieldTable.toggleRowExpansion(parent, true)
        })
      }
      // this.rowDrop()
    },
    /**
       * 新增排序
       * */
    addSort(parent) {
      var obj = {
        id: this.uuid(12),
        sortType: 'asc',
        fieldName: ''
      }
      this.sortList.push(obj)
      this.rowDrop({
        status: this.sortTableDrop,
        dom: '#sortTable .el-table__body-wrapper tbody',
        onEnd({ newIndex, oldIndex }) {
          console.log(newIndex, oldIndex)
          this.sortList[oldIndex] = this.sortList.splice(this.sortList[newIndex], 1, this.sortList[oldIndex])[0]
          console.log(this.sortList)
        }
      })
    },

    validate(callback) {
      let error = ''
      const ctx = { rowIndex: 0 }
      this.columns.some((field) => {
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
      if (field.childConditionList.length === 1) {
        return `第${ctx.rowIndex}行,最少要有两个子条件`
      }
      if (field.childConditionList.length === 0 && field.fieldName === '') {
        return `第${ctx.rowIndex}行,字段名不能为空`
      }
      if (field.childConditionList.length === 0 && field.operator === '') {
        return `第${ctx.rowIndex}行,操作符不能为空`
      }
      if (!field._isFirst && field.conditionConnector === '') {
        return `第${ctx.rowIndex}行,连接符不能为空`
      }
      if (field.childConditionList) {
        let error
        field.childConditionList.some(item => {
          return (error = this.vaildRow(item, ctx))
        })
        return error
      }
    },

    /**
       * 删除条件
       * */
    removeCondition(row, parent) {
      if (parent) {
        parent.childConditionList = parent.childConditionList.filter(item => {
          if (item.childConditionList.length) {
            this.removeCondition(row, item)
          }
          return item !== row
        })
        if (parent.childConditionList.length && !parent.childConditionList[0]._isFirst) {
          parent.childConditionList[0]._isFirst = true
        }
      } else {
        this.columns = this.columns.filter(item => {
          if (item.childConditionList.length) {
            this.removeCondition(row, item)
          }
          return item !== row
        })
        if (this.columns.length && !this.columns[0]._isFirst) {
          this.columns[0]._isFirst = true
        }
      }
    },
    /**
       * 删除排序
       * */
    removeSort(row, parent) {
      this.sortList = this.sortList.filter(item => {
        return item !== row
      })
    },
    /** 列数据同步
       * @param {Array} fields 调用api查询出来的字段信息
       */
    syncColumns(fields) {
      const fieldsMap = {}
      fields.forEach(col => {
        fieldsMap[col.fieldName] = col
      })
      return fieldsMap
    },

    forceUpdate() {
      setTimeout(() => {
        this.$forceUpdate()
      }, 10)
    },
    handelChange(col, scope) {
      if (typeof col.change === 'function') {
        col.change(scope.row)
      }
    },
    tableRowStyleName({ row, rowIndex }) {
      if (row.childConditionList.length) {
        return {
          background: this.colorList[rowIndex % 4]
        }
      }
      return ''
    },
    handleReview(str, conditions) {
      if (!Array.isArray(conditions)) return str
      let conditionConnector = ''
      conditions.map(ele => {
        conditionConnector = this.fieldTypes.find(field => field.value === ele.conditionConnector)?.label || ''
        if (ele.childConditionList.length) {
          str += ` ${conditionConnector} ( ${this.handleReview('', ele.childConditionList)} )` // 有子级条件，包裹括号
        } else {
          const value = ele.fieldType === 'Array' ? ele.fieldValueList : ele.fieldValue
          str += ` ${conditionConnector} ${this.fieldsMap[ele.fieldName]?.label || ''} ${ele.operatorLabel || ''} ${value} `
        }
      })

      return str
    },
    handleOperatorChange(val, row){
      row.operator = this.operateTypeList.find(ele => ele.label == val)?.value || ''
    },
    handelChangeFieldName(val, row) {
      row.operator = ''
      row.fieldType = this.fieldsMap[val].fieldType
    },
    handleVisiable(val, row) {
      if (val && row.fieldName) {
        this.operateTypeList = [...this.fieldsMap[row.fieldName].operateTypeList]
        row.operateTypeList = this.fieldsMap[row.fieldName].operateTypeList
      }
    },
    // 行拖拽
    rowDrop(options) {
      if (options.stauts) { return false }
      const tbody = document.querySelector(options.dom)
      const _this = this
      Sortable.create(tbody, {
        onEnd({ newIndex, oldIndex }) {
          options.onEnd && options.onEnd.call(_this, ...arguments)
        }
      })
    },
    // rowDrop() {
    //   const tbody = document.querySelector('.el-table__body-wrapper tbody')
    //   const _this = this
    //   Sortable.create(tbody, {
    //     onEnd({ newIndex, oldIndex }) {
    //       _this.getDealData()
    //       const sourceObj = _this.flattArray[oldIndex]
    //       const targetObj = _this.flattArray[newIndex]
    //       console.log(sourceObj,targetObj)
    //       // 改变要显示的树形数据
    //       _this.changeData(sourceObj, targetObj)
    //     }
    //   })
    // },
    getDealData() {
      const result = []
      const children = 'childConditionList'
      const func = function(arr, parent) {
        arr.forEach(item => {
          const obj = Object.assign(item)
          if (parent) {
            console.log(1, parent)
            if (obj.parentIds) {
              obj.parentIds.push(parent.id)
            } else {
              obj.parentIds = [parent.id]
            }
          }
          // 将每一级的数据都一一装入result，不需要删除下面的children，方便拖动的时候根据下标直接拿到整个数据，包括当前节点的子节点
          result.push(obj)
          if (item[children] && item[children].length !== 0) {
            func(item[children], item)
          }
        })
      }
      func(this.columns)
      console.log(result)
      this.flattArray = result
    },
    changeData(sourceObj, targetObj) {
      let flag = 0
      const data = Object.assign(this.columns)
      const children = 'childConditionList'
      const rowKey = 'id'
      const func = function(arr, parent) {
        for (let i = arr.length - 1; i >= 0; i--) {
          const item = arr[i]
          // 判断是否是原来拖动的节点，如果是，则删除
          if (item[rowKey] === sourceObj[rowKey] && (!parent || parent && parent[rowKey] !== targetObj[rowKey])) {
            arr.splice(i, 1)
            flag++
          }
          // 判断是否是需要插入的节点，如果是，则装入数据
          if (item[rowKey] === targetObj[rowKey]) {
            if (item[children]) {
              // 判断源数据是否已经是在目标节点下面的子节点，如果是则不移动了
              let repeat = false
              item[children].forEach(e => {
                if (e[rowKey] === sourceObj[rowKey]) {
                  repeat = true
                }
              })
              if (!repeat) {
                sourceObj.parentIds = []
                item[children].unshift(sourceObj)
              }
            } else {
              sourceObj.parentIds = []
              item[children] = [sourceObj]
            }
            flag++
          }
          // 判断是否需要循环下一级，如果需要则进入下一级
          if (flag !== 2 && item[children] && item[children].length !== 0) {
            func(item[children], item)
          } else if (flag === 2) {
            break
          }
        }
      }
      // 检测是否是将父级拖到子级下面，如果是则数据不变，界面重新回到原数据
      if (targetObj.parentIds) {
        if (targetObj.parentIds.findIndex(_ => _ === sourceObj[rowKey]) === -1) {
          func(data)
        } else {
          this.$message.error('不能将父级拖到子级下面')
        }
      } else {
        func(data)
      }
      this.$set(this, 'columns', [])
      // 重新渲染表格，用doLayout不生效，所以重新装了一遍
      this.$nextTick(() => {
        this.$set(this, 'columns', data)
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
    padding: 5px 20px;
    color: #999;
    font-size: 12px;
  }
  div .review{
    color: red;
    font-size: 14px;
    display: inline-block;
  }
  span.required::before{
    content: '*';
    color:Red
  }
  .icon-btn {
    padding: 0 5px;
    color: #8da8eb;
    cursor: pointer;
  }
</style>
