import context from '@/common/context'
import { options } from '@/utils/util'
import baseProps from '../baseProps'
import { bus, EVENTS } from '@/common/eventBus'
context.components.tabs = {

  // 组件默认配置
  getConfig() {
    const conf = {
      uuid: '',
      name: 'tabs',
      props: {
        type: 'card'
      },
      design: {},
      class: {},
      style: {},
      children: [
        context.getConfig('tab-pane'),
        context.getConfig('tab-pane')
      ]
    }
    conf.children[0].props.name = conf.children[0].uuid
    conf.children[1].props.name = conf.children[1].uuid
    return conf
  },
  // 组件的属性配置
  getProperties() {
    return [
      {
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.compId(),
          baseProps.common.span(),
          baseProps.common.width(),
          {
            label: '模型字段',
            mapping: 'design.vmodel',
            type: 'model',
            help: '绑定数据模型字段(v-model), 该项与value请只配置一项即可',
            value: ''
          },
          {
            label: 'value',
            mapping: 'props.value',
            type: 'input',
            value: '标签页',
            help: '绑定值，选中选项卡的别名, 该项与模型字段 只配置一项即可'
          },
          {
            label: '风格类型',
            mapping: 'props.type',
            type: 'select',
            options: options({ '': '简单', card: '卡片', 'border-card': '边框卡片' }),
            value: '',
            help: '标签页的风格类型'
          },
          {
            label: "位置",
            mapping: "props.tab-position",
            type: "select",
            options: ["top", "right", "bottom", "left"],
            value: "top",
            help:'选项卡所在位置'
          },
          {
            label: '可关闭',
            mapping: 'props.closable',
            type: 'bool',
            value: false,
            help: '标签是否可关闭'
          },
          {
            label: '可增加',
            mapping: 'props.addable',
            type: 'bool',
            value: false,
            help: '标签是否可增加	'
          },
          {
            label: '切换回调',
            mapping: 'props.:before-leave',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换。 Function(activeName, oldActiveName)'
          }, {
            label: '标签页管理',
            type: '$list',
            mapping: 'children',
            supportDel: true,
            supportAdd: true,
            value: [],
            columns: [
              {
                mapping: 'props.label',
                type: 'i18n',
                value: '',
                placeholder: '标签名称'
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
                  const tabPane = meta.children[rowIndex * 1]
                  bus.$emit(EVENTS.SHOW_CHILD_PROP, tabPane, meta)
                }
              }
            ],
            addHandler(tabs) {
              const tab = context.getConfig('tab-pane')
              tab.props.label = '标签' + (tabs.children.length + 1)
              tab.props.name = tab.uuid
              return tab
            }
          }

        ]
      }

    ]
  },

  getEvents() {
    return [
      { id: 'tab-click', label: 'tab 被选中时触发' },
      { id: 'tab-remove', label: '点击 tab 移除按钮后触发' },
      { id: 'tab-add', label: '点击 tabs 的新增按钮后触发' }
    ]
  }

}

context.components['tab-pane'] = {

  // 组件默认配置
  getConfig() {
    const layout = context.getConfig('layout')
    layout.design.mapping = '--'
    return {
      uuid: '',
      name: 'tab-pane',
      props: {
        label: '标签'
      },
      design: {
        mapping: '---',
        autoWidth: true
      },
      class: {},
      style: {},
      children: [layout]
    }
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
            label: '标题',
            mapping: 'props.label',
            type: 'i18n',
            value: '标签页',
            help: '选项卡标题'
          },
          {
            label: '别名',
            mapping: 'props.name',
            type: 'input',
            value: '标签页',
            help: '与选项卡绑定值 value 对应的标识符，表示选项卡别名'
          },
          {
            label: '可关闭',
            mapping: 'props.closable',
            type: 'bool',
            value: false,
            help: '标签是否可关闭'
          },
          {
            label: '延迟渲染',
            mapping: 'props.lazy',
            type: 'bool',
            value: false,
            help: '标签是否延迟渲染	'
          },
          baseProps.common.disabled(),
          ...baseProps.common.vif()
        ]
      }

    ]
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
