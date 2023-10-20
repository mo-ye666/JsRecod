import context from '@/common/context'
import baseProps from '../baseProps'
import { options } from '@/utils/util'
import { bus, EVENTS } from '@/common/eventBus'
context.components.tree = {
  // 组件默认配置
  getConfig(parent, ctx) {
    return {
      uuid: '',
      name: 'tree',
      props: {
        'highlight-current': true
      },
      design: {
        bindDataAttr: 'data'
      },
      class: {},
      style: {
        'overflow-y': 'auto'
      },
      slots: [],
      ref: true
    }
  },
  // 组件的属性配置
  getProperties(meta) {
    meta.style['overflow-y'] = 'auto'
    meta.props['highlight-current'] = true
    return [
      {
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.compId(),
          baseProps.common.span(),
          baseProps.common.height(),
          baseProps.common.dataType({
            type:'radio',
            options: options({ dynamic: '对象', objectModel: '模型', api: '服务' }),
            value: 'dynamic'
          }),
          baseProps.common.dynamicData({
            mapping: 'props.:data'
          }),
          ...baseProps.common.initObjectModel(meta),
          ...baseProps.common.initApi(meta),
          {
            label: '唯一标识',
            mapping: 'props.node-key',
            type: 'field-select',
            params: meta,
            value: '',
            help: 'node-key, 每个树节点用来作为唯一标识的属性字段，整棵树应该是唯一的'
          },

          {
            label: '标签字段',
            mapping: 'props.props.label',
            type: 'field-select',
            params: meta,
            value: 'label',
            help: ' 指定选项标签为选项对象的某个属性值'
          },
          {
            label: '子字段',
            mapping: 'props.props.children',
            type: 'field-select',
            params: meta,
            value: 'children',
            help: ' 指定选项的子选项为选项对象的某个属性值'
          },

          {
            label: '选择框',
            mapping: 'props.show-checkbox',
            type: 'bool',
            value: false,
            help: '节点是否可被选择'
          },
          {
            label: '操作按钮',
            mapping: 'design.buttons',
            type: 'bool',
            value: false,
            help: '是否需要操作按钮配置',
            onChange(val, meta) {
              let children
              if (val) {
                children = [
                  {
                    tag: 'div',
                    props: {
                      'slot-scope': '{node,data}'
                    },
                    design: { class: 'custom-tree-node v-tree-node' },
                    children: [
                      {
                        tag: 'span',
                        props: {},
                        design: { class: 'el-tree-node__label' },
                        children: '{{node.label}}'
                      }, {
                        tag: 'span',
                        props: {},
                        design: { },
                        children: []
                      }
                    ]
                  }
                ]
              } else {
                children = []
              }
              window.getApp().$set(meta, 'slots', children)
              return true
            }
          },
          // { type: 'divider', label: '操作按钮' },
          {
            label: '操作按钮',
            type: '$list',
            mapping: 'slots.0.children.1.children',
            supportDel: true,
            supportAdd: true,
            value: [],
            columns: [
              {
                mapping: 'props.icon',
                type: 'icon',
                value: ''
              },
              {
                mapping: 'prop',
                type: 'button',
                buttonText: ' ',
                btnType: 'text',
                icon: 'el-icon-edit-outline',
                onClick(e) {
                  const rowIndex = getRowIndex(e.target)
                  const meta = context.activeComponent
                  const btn = meta.slots[0].children[1].children[rowIndex * 1]
                  bus.$emit(EVENTS.SHOW_CHILD_PROP, btn, meta)
                }
              }
            ],
            addHandler(meta) {
              const btn = context.getConfig('button')
              btn.props.type = 'text'
              btn.props.icon = 'p-icon-setting'
              btn.style.width = ''
              btn.design.slotText = ''
              return btn
            },
            vif: 'design.buttons'
          },
          ...baseProps.common.eventBtn()
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [

          {
            label: '延迟渲染',
            mapping: 'props.render-after-expand',
            type: 'bool',
            value: false,
            help: '是否在第一次展开某个树节点后才渲染其子节点,数据量大的情况下可以优化渲染速度'
          },
          {
            label: '懒加载',
            mapping: 'props.lazy',
            type: 'bool',
            value: false,
            help: '是否懒加载子节点，需与 load 方法结合使用'
          }, {
            label: '加载函数',
            mapping: 'props.load',
            type: 'method',
            onlyCode: true,
            value: '',
            vif: 'props.lazy',
            help: '加载子树数据的方法，仅当 lazy 属性为true 时生效, 例:function(node, resolve)'
          },
          {
            label: '展开记忆',
            mapping: 'design.remember-expand',
            type: 'bool',
            value: false,
            help: '是否数据刷新后,依然保留展开状态'
          },
          {
            label: '默认展开',
            mapping: 'props.default-expand-all',
            type: 'bool',
            value: false,
            help: '是否默认展开所有节点'
          },
          {
            label: '节点收缩',
            mapping: 'props.expand-on-click-node',
            type: 'bool',
            value: true,
            help: '是否在点击节点的时候展开或者收缩节点， 默认值为 true，如果为 false，则只有点箭头图标的时候才会展开或者收缩节点。'
          },
          {
            label: '节点选中',
            mapping: 'props.check-on-click-node',
            type: 'bool',
            value: false,
            help: '是否在点击节点的时候选中节点，默认值为 false，即只有在点击复选框时才会选中节点。'
          },
          {
            label: '渲染函数',
            mapping: 'props.:renderContent',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '自定义渲染树节点内容 Function(h, { node, data, store }'
          },
          baseProps.common.margin(),
          baseProps.common.customAttr(),
          baseProps.common.classList(),
          ...baseProps.common.vif()
        ]
      }
    ]
  },

  getEvents() {
    return [
      { id: 'node-click', label: '节点被点击' },
      { id: 'check-change', label: '节点选中状态发生变化时' },
      { id: 'node-expand', label: '节点被展开时触发的事件' },
      { id: 'node-collapse', label: '节点被关闭时触发的事件' }
    ]
  },

  getMockData(meta) {
    return [{ id: 1, label: '节点1' }]
  }

}
function getRowIndex(node) {
  let rowindex
  let el = node
  while (el) {
    rowindex = el.getAttribute('rowindex')
    if (rowindex) {
      break
    } else {
      el = el.parentElement
    }
  }
  return rowindex
}
