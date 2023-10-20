import context from '@/common/context'
import { options } from '@/utils/util'
import baseProps from '../baseProps'
context.components['table-column'] = {
  // 组件默认配置
  getConfig() {
    return {
      name: 'table-column',
      label: '',
      prop: '',
      width: '',
      type: '',
      design: {}
    }
  },
  // 组件的属性配置
  getProperties(meta) {
    return [
      {
        group: '数据列配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.compId(),
          {
            label: '列标题',
            mapping: 'label',
            type: 'i18n',
            value: '',
            help: '显示的标题'
          }, {
            label: '字段名',
            mapping: 'prop',
            type: 'input',
            value: '',
            help: '对应列内容的字段名，对象字段可以通过路径, 例如: user.name'
          },
          {
            label: '渲染组件',
            mapping: 'render',
            type: 'select',
            options: options({
              '': '默认',
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
              'dropdown': '下拉菜单',
              'layout': '自定义布局'
            }),
            clearable: true,
            value: '',
            onChange(val, meta) {
              if (val) {
                const comp = context.getConfig(val, meta)
                comp.design.mapping = 'children'
                let slotContent = null
                if (val === 'text') {
                  // comp.children = `{{scope.row.${meta.prop}}}`
                  comp.design.vmodel = `scope.row.${meta.prop}`
                  comp.unaided = false
                } else if (val === 'layout') {
                  comp.slot = 'default'
                  comp.props['slot-scope'] = 'scope'
                  slotContent = comp
                } else {
                  comp.design.vmodel = `scope.row.${meta.prop}`
                  comp.unaided = false
                }
                slotContent = slotContent || {
                  slot: 'default',
                  name: 'template',
                  props: {
                    'slot-scope': 'scope'
                  },
                  children: comp
                }
                meta.slots = [slotContent]
              } else {
                // 当组件类型未空时候, 删除该插槽内容
                meta.slots = []
              }

              return true
            },
            help: '默认不使用组件渲染,直接显示文本, 如需要渲染成其他类型,请选择具体组件类型'
          }, {
            label: ' ',
            type: 'button',
            onClick() {
              const comp = meta.slots[0].children
              if (comp) {
                bus.$emit(EVENTS.SHOW_CHILD_PROP, comp, meta)
              }
            },
            vif: prop =>  prop.render !== 'layout'
          },
          baseProps.common.width({ mapping: 'width', help: '对应列的宽度' }),
          {
            label: '内容对齐',
            type: 'radio',
            value: '',
            mapping: 'align',
            options: options({ '': '靠左', center: '居中', right: '靠右' }),
            help: '列文本内容对齐方式'
          }, {
            label: '表头对齐',
            type: 'radio',
            value: '',
            mapping: 'header-align',
            options: options({ '': '靠左', center: '居中', right: '靠右' }),
            help: '表头对齐方式，若不设置该项，则使用表格的对齐方式'
          },
          {
            label: '可排序',
            type: 'bool',
            value: false,
            mapping: 'sortable',
            help: '是否可以排序'
          }, {
            label: 'tooltip',
            type: 'bool',
            value: false,
            mapping: 'show-overflow-tooltip',
            help: '当内容过长被隐藏时显示 tooltip'
          },
          {
            label: '可展开',
            type: 'bool',
            value: false,
            mapping: 'expand',
            onChange(val, meta) {
              meta.type = val ? 'expand' : ''
              meta.slots = val ? [getExpandSlot()] : null
              // 刷新
              const tableParent = window.getMetaManager().getCompPathById(meta.uuid).pop()
              tableParent.children.splice(0, 0, [])
              setTimeout(() => {
                tableParent.children.shift()
              }, 200)
              return true
            },
            help: '显示为一个可展开的按钮'
          },
          {
            label: '固定列',
            mapping: 'fixed',
            type: 'select',
            options: options({ '': '不固定', 'left': '左侧固定', 'right': '右侧固定' }),
            value: '',
            help: '列是否固定在左侧或者右侧'
          },
          {
            label: '渲染函数',
            mapping: 'formatter',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '使用自定义方法渲染单元格内容 - Function(row, column, cellValue, index)'
          },
          {
            label: '列头渲染',
            mapping: 'render-header',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '使用自定义方法渲染列标题 - Function(h, { column, $index })'
          },
          {
            label: '列样式',
            mapping: 'class-name',
            type: 'input',
            value: '',
            help: '当前列的自定义 className'
          },
          {
            label: '列渲染条件',
            mapping: 'vif',
            type: 'input',
            value: '',
            help: '可通过条件表达式动态控制列显示'
          },
          ...baseProps.common.permission()
        ]
      }
    ]
  },

  getEvents() {
    return [
      { id: 'click', label: '点击事件' }
    ]
  }

}

function getExpandSlot() {
  return Object.assign(context.getConfig('layout'), {
    props: {
      'slot-scope': 'scope'
    },
    design: {
      layout: 'row'
    },
    style: {
      'flex-wrap': 'wrap'
    },
    children: []
  })
}
