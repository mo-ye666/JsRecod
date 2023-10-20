import context from '@/common/context'
import baseProps from '../baseProps'
import constants from '@/common/constants'
context.components['color-picker'] = {
  // 组件默认配置
  getConfig(parent, ctx) {
    return {
      uuid: '',
      name: 'color-picker',
      props: { size: constants.COMMON_SIZE, type: 'hex' },
      design: {
        autoWidth: true
      },
      class: {},
      style: {},
      unaided: true
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
          baseProps.common.model(),
          {
            label: '颜色的格式',
            mapping: 'props.type',
            type: 'select',
            options: ['hsv', 'hsl', 'hex', 'rgb'],
            value: 'hsv',
            help: '按钮类型'
          }, {
            label: '透明度',
            mapping: 'props.show-alpha',
            type: 'bool',
            value: false,
            help: '是否支持透明度'
          },
          {
            label: '预定义颜色',
            mapping: 'props.predefine',
            type: 'model',
            value: '',
            help: '预定义颜色数组'
          },
          baseProps.common.size(),
          ...baseProps.common.eventBtn()
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.disabledExp(),
          baseProps.common.classList(),
         ... baseProps.common.vif(),
          ...baseProps.common.styles()
        ]
      }
    ]
  },

  getEvents() {
    return [
      { id: 'change', label: '值改变事件(onChange)' },
      { id: 'active-change', label: '面板颜色发生改变时' }
    ]
  }

}
