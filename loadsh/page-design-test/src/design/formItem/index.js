import context from '@/common/context'
import metadata from '@/common/metadata'
import baseProps from '../baseProps'
import { options } from '@/utils/util'

context.components['form-item'] = {
  // 组件默认配置
  getConfig() {
    const meta = {
      uuid: '',
      name: 'form-item',
      props: {
        prop: '',
        title: '标签名'
      },
      design: { fieldType: 'input', span: 12 },
      class: {},
      style: {}
    }
    const input = context.getConfig('input', meta)
    // input.uuid = ''
    input.design.mapping = 'children'
    meta.children = input
    return meta
  },

  getConfigByField({ field }) {
    const meta = context.getConfig('form-item')
    meta.props.prop = getPropName(field.id)
    meta.props.title = field.label
    meta.design.fieldType = 'input'
    const child = context.getConfig('input', meta)
    // child.uuid = ''
    child.unaided = false
    child.design.mapping = 'children'
    child.design.vmodel = field.id
    child.props.placeholder  = `请输入${field.label}`
    meta.children = child
    return meta
  },
  // 拖拽,检查是否可以在当前路径(父组件)下放下, 参数是父组件路径 [parent,parent.parent, rootParent]
  checkPut(...parents) {
    // 只需要父级存在form组件,则允许拖入
    return parents.filter(item => item.name === 'form').length > 0
  },
  // 组件的属性配置
  getProperties() {
    return [
      {
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.compId(),
          {
            label: '标签名',
            mapping: 'props.title',
            type: 'i18n',
            value: '标签名',
            clearable: true,
            vif(meta) {
              return !meta.design.dynamicLabel
            }
          },
          {
            label: '标签名',
            mapping: 'props.:title',
            type: 'model',
            value: '标签名',
            vif: 'design.dynamicLabel',
            clearable: true
          }, {
            label: '字段名称',
            mapping: 'props.prop',
            type: 'model',
            help: '绑定模型字段名',
            checkStrictly: true,
            onChange(val, meta) {
              const field = metadata.getModelField(val)
              if (field) {
                meta.props.prop = getPropName(field.id)
                meta.props.title = field.label
                meta.children.design.vmodel = field.id
                return true
              }
            }
          },

          {
            label: '组件类型',
            mapping: 'design.fieldType',
            type: 'select',
            value: 'input',
            options: options({
              text: '文本',
              button: '按钮',
              input: '输入框',
              radio: '单选框',
              'radio-group': '单选框组',
              checkbox: '复选框',
              'checkbox-group': '复选框组',
              select: '下拉选择',
              inputNumber: '数字输入框',
              switch: '开关',
              'date-picker': '日期选择器',
              'time-picker': '时间选择器',
              'cascader': '级联选择器',
              'color-picker': '颜色选择',
              'upload-img': '图片上传',
              'upload-file': '文件上传',
              'layout': '自定义布局'
            }),
            onChange(val, meta) {
              const comp = context.getConfig(val, meta)
              // comp.uuid = ''
              comp.design.mapping = 'children'
              if (val === 'text') {
                comp.design.vmodel = meta.props.prop
                comp.children = `{{${meta.props.prop}}}`
              } else if (val === 'layout') {
                comp.design.span = 24
              } else {
                comp.design.vmodel = meta.props.prop
              }
              comp.unaided = false
              meta.children = comp
            },
            help: '请选择需要该项具体的表单组件'
          },

          {
            label: '标签宽度',
            mapping: 'props.titleWidth',
            type: 'input',
            value: '',
            clearable: true,
            append: 'px',
            format(val, isEdit) {
              if (isEdit) {
                return val ? parseInt(val) : ''
              } else {
                return val ? parseInt(val) + 'px' : ''
              }
            },
            help: '自定义标签宽度,优先级高于form组件统一设置的标签宽度'
          },
          baseProps.common.span(),
          {
            label: '动态标签名',
            type: 'bool',
            mapping: 'design.dynamicLabel',
            value: false,
            help: '标签名是否是动态变量模式'
          },
         ... baseProps.common.vif(),
          {
            label: '必填类型',
            type: 'radio',
            value: '',
            mapping: 'requiredType',
            options: options({ '': '值', func: '方法' }),
            help: '是否必填的方式，可选择值和函数两种方式，默认是‘值’',
            onChange(val, meta) {
              if(val !== 'func') {
                meta.required = false
              } else {
                meta.required = ''
              }
              return true
            },
          },
          {
            label: '是否必填',
            type: 'bool',
            mapping: 'required',
            value: false,
            help: '该项是否必填',
            vif:(meta) => {
              return  meta.requiredType !== 'func'
             },
          },
          {
            label: '是否必填',
            type: 'method',
            mapping: 'required',
            value: '',
            help: '使用自定义方法做必填校验 - Function ({value, row, column, id, prop})',
            vif:(meta) => {
              return  meta.requiredType === 'func'
             },
          },
          {
            label: '必填提示',
            mapping: 'requiredMessage',
            type: 'input',
            value: '',
            clearable: true,
            help: '当必填校验未通过时的提示信息',
          },
          {
            label: '动态校验',
            type: 'bool',
            mapping: 'design.isDynamicRule',
            value: false,
            help: '勾选后,规则配置对象将生成在vue data中,可动态修改.'
          },
          { type: 'divider', label: '校验规则' },
          {
            type: 'validator',
            mapping: 'props.rules',
            value: []
          }
          // {
          //   label: '自定义布局',
          //   mapping: 'design.customLayout',
          //   type: 'bool',
          //   value: false,
          //   onChange(val, meta) {
          //     if (val) {
          //       const layout = context.getConfig('layout', meta)
          //       layout.slot = 'default'
          //       layout.children = [meta.children]
          //       meta.children = [layout]
          //     } else {
          //       meta.children = [meta.children[0].children[0]]
          //     }
          //     return true
          //   }
          // }
        ]
      }]
  }

}

function getPropName(id) {
  return id // id.substr(id.indexOf('.') + 1)
}
