<template>
  <el-dialog
    :title="isCreate? '创建数据模型':'编辑数据模型'"
    :visible.sync="dialogVisible"
    width="85vw"
    custom-class="design-dialog"
    :close-on-click-modal="false"
    @close="cancel"
  >
    <div class="flex-col dialog-content">
      <v-form ref="form" :data="model" class="my-form">
        <v-form-item title="模型变量名称" prop="name" :rules="nameRule" title-width="160px" class="span-12" style="background:whitesmoke">
          <el-input v-if="isCreate" v-model.trim="model.name" size="small" placeholder="保存后该名称将无法修改,请认真填写" />
          <span v-else style="font-weight:bold">{{ model.name }}</span>
        </v-form-item>
      </v-form>
      <div>
        <el-tabs v-model="tabActiveName" type="card" :before-leave="tabBeforLeave">
          <el-tab-pane label="FORM" name="FORM">
            <div style="padding-bottom:10px">
              <el-button-group>
                <el-button
                  type="primary"
                  icon="el-icon-plus"
                  size="small"
                  @click="addField()"
                >添加</el-button>
              </el-button-group>
            </div>
            <el-table ref="fieldTable" max-height="370px" :data="model.fields" border size="mini" row-key="id">
              <el-table-column
                type="index"
                width="40"
              />
              <el-table-column label="字段名称" prop="name" width="220" class-name="mycell">
                <div slot-scope="scope" class="flex-row flex-grow" style="display:inline-block">
                  <span v-if="!model.apiUcode ||scope.row.custom" class="">
                    <el-input v-model="scope.row.name" size="mini" />
                  </span>
                  <span v-else>
                    {{ scope.row.name }}
                  </span>
                </div>
              </el-table-column>
              <el-table-column label="字段描述" prop="label">
                <template slot-scope="scope">
                  <div v-if="!model.apiUcode ||scope.row.custom" class="">
                    <el-input v-model="scope.row.label" size="mini" />
                  </div>
                  <div v-else>
                    {{ scope.row.label }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="数据类型" prop="fieldType" width="150">
                <template slot-scope="scope">
                  <div v-if="!model.apiUcode ||scope.row.custom" class="">
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
              <el-table-column v-if="model.id!=='params'" label="默认值" prop="defaultValue" align="center">
                <template slot-scope="scope">
                  <div class="flex-row input-with-select el-input el-input-group el-input-group--append el-input-group--prepend">
                    <el-select slot="prepend" v-model="scope.row.valueSource" placeholder="请选择" size="mini" style="width:120px;flex-shrink:0">
                      <el-option label="静态值" value="value" />
                      <el-option label="初始化参数" value="querys" />
                    </el-select>
                    <el-input v-show="scope.row.valueSource!='querys'" v-model="scope.row.defaultValue" placeholder="请输入内容" class="input-with-select" size="mini" />
                    <model-select v-show="scope.row.valueSource=='querys'" v-model="scope.row.defaultValue" :modelid="isComponent ? 'props': 'params'" />
                  </div>

                </template>
              </el-table-column>
              <el-table-column v-if="model.id!=='params'" label="是否必须" prop="inputRequired" align="center" width="100">
                <template slot-scope="scope">
                  <i v-show="scope.row.inputRequired" class="el-icon-check" style="color:green;font-size:16px" />
                </template>
              </el-table-column>
              <el-table-column label="操作" prop="name" width="110">
                <template slot-scope="scope">
                  <el-button-group>
                    <el-button v-show="scope.row.dataType === 'Object' || scope.row.dataType === 'Array'" type="default" icon="el-icon-plus" size="mini" @click="addField(scope.row)" />
                    <el-button v-if="scope.row.custom" type="default" plain icon="el-icon-delete" size="mini" @click="removeRow(scope.row)" />
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="JSON" name="JSON">
            <!-- <div class="textarea-box">
              <el-input
                type="textarea"
                :rows="2"
                placeholder="请输入内容"
                v-model="fieldsJsonStr" class="json-text">
              </el-input>
            </div> -->
            <div id="jsoncodeeditor" class="flex-col flex-grow" />
          </el-tab-pane>
        </el-tabs>
      </div>


    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="cancel">取 消</el-button>
      <span style="display: inline-block; width: 20px" />
      <el-button size="small" type="primary" @click="confirm"> 确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { options, uuid, clone, getUrlParams } from '@/utils/util'
import { beautifierConf } from '@/common/config'
import loadBeautifier from '@/utils/loadBeautifier'
import loadMonaco from '@/utils/loadMonaco'
var monaco, editorObj, beautifier
export default {
  components: {},
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      isComponent: getUrlParams('type') === 'components',
      dialogVisible: this.visible,
      fieldTypes: options({
        'String': '字符串',
        'Integer': '数字',
        'Date': '日期',
        'Object': '对象',
        'Array': '数组(集合)'
      }),
      nameRule: [
        { required: true },
        {
          pattern: /^[A-Za-z]+[_A-Za-z0-9]*$/,
          message: '不是有效的变量名,请按照变量命名规则填写'
        }
      ],
      model: this.value ? clone(this.value) : {
        name: '',
        fields: []
      },
      // 如果value有值,则为编辑模式,否则为创建模式
      isCreate: !this.value,
      tabActiveName:'FORM',
      fieldsJsonStr:'',
      jsonTips:`/***
            **JSON生成模型字段注意：
            ** 1.最终变量必须为数组
            ** 2.id为该字段在项目中的路径
            ** 3.name为该字段的名称
            ** 4.dataType为字段类型，目前有Sting，Integer，Object，Array，Date
            ** 5.custom表示字段是否自定义
            ** 6.label是字段描述
            ** 7.当字段类型为Object或Array，children表示其子字段
            ** 8.defaultValue表示字段默认值
            ***/`
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
    }
  },

  created() {

  },
  mounted() {},

  methods: {
    cancel() {
      this.$emit('update:visible', false)
    },
    confirm() {
      if(this.tabActiveName === 'JSON' && !this.jsonToForm()) {
        return
      }
      this.validate(() => {
        this.$emit('save', this.model)
      })
    },
    addField(parent) {
      if (parent && !parent.children) {
        this.$set(parent, 'children', [])
      }
      (parent ? parent.children : this.model.fields).push({
        id: uuid(12),
        name: '',
        label: '',
        dataType: 'String',
        defaultValue: '',
        valueSource: 'value',
        custom: true
      })

      if (parent) {
        this.model.fields.splice(1, 0)
        this.$nextTick(() => {
          this.$refs.fieldTable.toggleRowExpansion(parent, true)
        })
      }
    },
    openScript() {
      loadBeautifier((btf) => {
        beautifier = btf
        this.jsonTips = beautifier.js(this.jsonTips, beautifierConf.js)
        let jsonCode = beautifier.js(this.jsonTips + JSON.stringify(this.model.fields), beautifierConf.js)
        loadMonaco((val) => {
          monaco = val
          this.setJsonCode(jsonCode)
        })
      })

    },
    setJsonCode(codeStr) {
      const editor = document.querySelector('#jsoncodeeditor')
      if (!editor) {
        setTimeout(() => {
          this.setJsonCode(codeStr)
        }, 100)
        return
      }
      if (editor.children.length) {
        editorObj.setValue(codeStr)
      } else {
        editorObj = monaco.editor.create(
          document.getElementById('jsoncodeeditor'),
          {
            value: codeStr,
            theme: 'vs-dark',
            language: 'json',
            automaticLayout: true
          }
        )
      }
    },
    // tab切换拦截
    tabBeforLeave(newActive, oldActive) {
      if(oldActive === 'FORM') {
        this.openScript()
        return true
      } else {
        return this.jsonToForm()
      }
    },
    jsonToForm() {
      let jsonCodeStr = editorObj.getValue()
      jsonCodeStr = jsonCodeStr.replace(this.jsonTips, "")
        if(this.isJSON(jsonCodeStr) && Array.isArray(JSON.parse(jsonCodeStr))) {
          this.model.fields = JSON.parse(jsonCodeStr)
          return true
        } else {
          this.$message.error('JSON格式错误')
          return false
        }
    },
    isJSON(str) {
        try {
            var obj=JSON.parse(str);
            if(typeof obj == 'object' && obj ){
                return true;
            }else{
                return false;
            }
        }catch(e) {
            return false;
        }
		},
    validate(callback) {
      this.$refs.form.validate().then((res) => {
        if (res === true) {
          let error = ''
          const ctx = { rowIndex: 0 }
          this.model.fields.some((field) => {
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
        }
      })
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
      this.model.fields.splice(1, 0)
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
        this.model.fields = this.model.fields.filter(item => {
          if (item.children) {
            this.removeRow(row, item)
          }
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
.textarea-box{
  height: 400px;
}
.json-text ::v-deep textarea{
  height: 400px;
}
#jsoncodeeditor{
  width: 100%;
  height: 400px;
}
</style>
