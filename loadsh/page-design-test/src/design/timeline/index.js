import context from '@/common/context'
import { options, getRowIndex } from '@/utils/util'
import baseProps from '../baseProps'
import { bus, EVENTS } from '@/common/eventBus'
context.components.timeline = {
  // 组件默认配置
  getConfig() {
    return {
      uuid: '',
      name: 'timeline',
      props: {},
      design: {},
      class: {},
      style: {},
      children: []
    }
  },
  // 组件的属性配置
  getProperties(meta) {
    return [
      {
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.compId(),
          {
            label: '当前步骤',
            mapping: 'design.activeStep',
            type: 'number',
            help: '当前步骤默认值',
            value: ''
          },
          {
            label: '是否倒序',
            mapping: 'props.reverse',
            type: 'bool',
            help: '指定节点排序方向，默认为正序',
            value: false
          },
          baseProps.common.span(),
          baseProps.common.dataType({
            options: options({ static: '静态', dynamic: '动态' })
          }),
          {
            label: '节点数据录入',
            type: '$list',
            mapping: 'children',
            supportDel: true,
            supportAdd: true,
            value: [],
            columns: [
              {
                mapping: 'children',
                type: 'i18n',
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
                  const col = meta.children[rowIndex * 1]
                  bus.$emit(EVENTS.SHOW_CHILD_PROP, col, meta)
                }
              }
            ],
            addHandler() {
              return { name: 'timeline-item', props: {}, design: {}, children: '' }
            },
            vif(meta) { return meta.design.dataType === 'static' }
          },
          baseProps.common.dynamicData(),
          baseProps.common.labelKey({
            label: '名称字段',
            help: '模型中的节点名称字段'
          }, meta),
          baseProps.common.valueKey({
            label: '时间字段',
            help: '模型中的时间戳字段'
          }, meta),
          {
            label: "时间戳位置",
            mapping: "design.placement",
            type: "select",
            help: '时间戳位置选择',
            options: ["top", "bottom"],
            value: ""
          },
          baseProps.common.classList(),
          ...baseProps.common.vif()
        ]
      }
    ]
  },

  getMockData(meta) {
    return [{
      content: '支持使用图标',
      timestamp: '2018-04-12 20:46',
      size: 'large',
      type: 'primary',
      icon: 'el-icon-more'
    }, {
      content: '支持自定义颜色',
      timestamp: '2018-04-03 20:46',
      color: '#0bbd87'
    }, {
      content: '支持自定义尺寸',
      timestamp: '2018-04-03 20:46',
      size: 'large'
    }, {
      content: '默认样式的节点',
      timestamp: '2018-04-03 20:46'
    }]
  }
}

context.components['timeline-item'] = {
  getProperties(meta) {
    return [
      {
        group: '时间节点配置',
        groupType: 'collapse',
        properties: [
          {
            label: '时间戳',
            mapping: 'props.timestamp',
            type: 'input',
            value: '',
            help: '该节点的时间戳具体值'
          },
          {
            label: '隐藏时间',
            mapping: 'props.hide-timestamp',
            type: 'bool',
            value: false,
            help: '是否隐藏时间戳'
          },
          {
            label: '时间位置',
            mapping: 'props.placement',
            type: 'radio',
            value: 'bottom',
            options: ['top', 'bottom'],
            help: '该节点时间戳具体显示位置'
          },
          {
            label: '节点类型',
            mapping: 'props.type',
            type: 'select',
            options: ['primary', 'success', 'warning', 'danger', 'info'],
            clearable: true,
            value: '',
            help: '该节点具体显示风格类型'
          },
          {
            label: '节点颜色',
            mapping: 'props.color',
            type: 'color',
            value: '',
            help: '该节点显示颜色'
          },
          {
            label: '时间尺寸',
            mapping: 'props.size',
            type: 'radio',
            value: 'normal',
            options: options({ normal: '正常', 'large': '大' }),
            help: '该节点显示尺寸'
          },
          {
            label: '节点图标',
            mapping: 'props.icon',
            type: 'icon',
            value: '',
            help: '节点显示图标'
          }
        ]
      }
    ]
  }
}
