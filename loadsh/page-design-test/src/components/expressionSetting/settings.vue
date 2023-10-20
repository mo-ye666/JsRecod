<template>
  <el-dialog title="表达式设置" append-to-body :visible.sync="showVisible" width="700px"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             @close="close">
    <el-form label-width="60px" :inline="true" size="mini" label-position="left">
      <el-form-item label="变量">
        <el-cascader
            v-model="selectVars"
            size="mini"
            :options="options"
            :props="conf"
            :show-all-levels="true"
            clearable
            @visible-change="visibleHandler"
            @change="setExpressionValue"
        >
            <template slot-scope="{ node, data }">
            <span>{{ data.name }} </span>
            <span v-if="data.label && data.label !== node.label" class="name">
                {{ data.label }}
            </span>
            </template>
        </el-cascader>
      </el-form-item>
      <el-form-item label="操作符">
        <el-select v-model="operator" clearable @change="setExpressionValue">
          <el-option
            v-for="item in operatorOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="值">
        <el-input v-model="operatorValue" >
          <el-select v-model="valueType" slot="prepend" placeholder="请选择" style="width: 85px">
            <el-option label="任意" value="any"></el-option>
            <el-option label="布尔" value="bool"></el-option>
            <el-option label="字符串" value="string"></el-option>
            <el-option label="数字" value="number"></el-option>
          </el-select>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="setExpressionValue('insertClick')">插入值</el-button>
      </el-form-item>
    </el-form>
    <el-input
      id="expressionView"
      type="textarea"
      placeholder="自由拼凑表达式，表达式为真才会执行对应操作，字符串请用单引号包裹"
      v-model="expressionValue"
      class="expressionTextArea"
    ></el-input>
    <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="comfirmHandle">确 定</el-button>
  </span>
  </el-dialog>

</template>

<script>
//   import { isNumberStr } from '@/utils/common'
import metadata from '@/common/metadata'
import common from '@/utils/common'
  export default {
    name: 'ExpressionSetting',
    props: {
      showVisible: false, // 是否显示
      comfirm: null,
      value:String
    }
    ,
    data() {
      return {
        options: metadata.meta.models, // 级联选择数据
        expressionValue: '', // 表达式值
        operatorValue: '',
        selectVars: null, // 变量
        operator: '', // 操作符
        valueType: 'string', // 表达式值类型
        operatorOptions: [
          { value: '==', label: '等于' },
          { value: '&&', label: '与' },
          { value: '||', label: '或' },
          { value: '()', label: '包括' },
          { value: '>', label: '大于' },
          { value: '<', label: '小于' },
          { value: '!=', label: '不等于' },
          { value: '>=', label: '大于等于' },
          { value: '<=', label: '小于等于' },

        ],
        conf: {
            value: 'id',
            label: 'name',
            emitPath: false,
            checkStrictly: true // 可以选择任意一级
        },
        onlyModel: false
      }
    },
    watch:{
      value(){
          console.log(this.value,"watch")
        this.expressionValue = this.value
      }
    },
    created() {
        this.loadData();
    },
    mounted(){
        console.log(this.value,"mounted")
        this.expressionValue = this.value
    },
    methods: {
      close() {
        this.operatorValue = ''
        this.operator = ''
        this.selectVars = null
        this.valueType = 'string'
        this.expressionValue = ''
        this.$emit('closeSettings')
      },
      comfirmHandle() {
        this.$emit('comfirm',  this.expressionValue )
        this.close()
      },
      
      // 设置表达式
      setExpressionValue(type) {
          let vars = this.selectVars || ''; // 设置变量
          let operator = this.operator ? ` ${this.operator} ` : ''; // 设置操作符
          let value = ''; // 设置值
          if ((this.operatorValue === undefined || this.operatorValue === '') && type !== 'insertClick' ) {
              value = ''
          } else {
             value = this.getValByType(this.operatorValue, this.valueType)
          }
          // 赋值
          this.expressionValue = vars + operator + value;
      },
      loadData() {
        let models = JSON.parse(
            JSON.stringify(
            this.modelid
                ? [metadata.getModelField(this.modelid)]
                : metadata.meta.models
            )
        )
        models.forEach((element) => {
            element.label = element.name
            element.id = element.name
            element.children = element.fields ? element.fields : element.children
            if (this.onlyModel) {
            element.children = null
            }
        })
        //   // 如果有筛选参数,则进行数据筛选
        //   if (this.filter) {
        //     models = models.filter(model => this.modelFilter(model, this.filter, true))
        //   }
        this.options = models
        },
    visibleHandler(bool) {
      if (bool) {
        this.loadData()
      }
    },
      /**
       * 根据类型转换得到值
       * @param val
       * @param item
       *
       * { value: "number", label: "数值" },
       { value: "bool", label: "布尔" },
       { value: "string", label: "字符串" },
       { value: "array", label: "数组" },
       { value: "object", label: "对象" },
       { value: "any", label: "Any" },
       */
      getValByType(val, type) {
        switch (type) {
          case 'number':
            val = `${common.isNumberStr(val) ? val : 0}`
            break
          case 'bool':
            val = val !== '' && val !== 'false'
            break
          case 'array':
            if (!/\[/.test(val)) {
              val = `[${common.isNumberStr(val) ? val : `'${val}'`}]`
              break
            }
            break
          case 'object':
            if (!/\{/.test(val)) {
              val = `{}`
              break
            }
            break
          case 'any':
            val = val !== '' ? val : undefined
            break
          case 'string': {
            val = `"${val}"`
            break
          }
          default:
            break
        }
        return val
      }

    }
  }
</script>

<style scoped lang="scss">
  ::v-deep .expressionTextArea .el-textarea__inner {
    height: 200px;
  }

  el-dialog {
    height: 500px;
  }

</style>
