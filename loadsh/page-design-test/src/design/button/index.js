import context from '@/common/context'
import baseProps from '../baseProps'
import constants from '@/common/constants'
context.components.button = {
  // 组件默认配置
  getConfig(parent, ctx) {
    return {
      uuid: '',
      name: 'button',
      props: { size: constants.COMMON_SIZE, type: 'primary' },
      design: {
        autoWidth: true,
        slotText: '按钮'
      },
      class: {},
      style: {
      }
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
            label: '按钮文本',
            mapping: 'design.slotText',
            type: 'i18n',
            value: '',
            clearable: true
          },
          {
            label: '按钮类型',
            mapping: 'props.type',
            type: 'select',
            options: ['default', 'primary', 'success', 'warning', 'danger', 'info', 'text'],
            value: 'text',
            help: '按钮类型'
          }, {
            label: '按钮图标',
            mapping: 'props.icon',
            type: 'icon',
            value: ''
          },
          baseProps.common.width({ help: '' }),
          baseProps.common.size(),
          ...baseProps.common.eventBtn()
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.disabledExp(),
          {
            label: '圆角',
            mapping: 'props.round',
            type: 'bool',
            value: false,
            help: '是否圆角按钮'
          },
          {
            label: '朴素按钮',
            mapping: 'props.plain',
            type: 'bool',
            value: false,
            help: '是否朴素按钮'
          },
          {
            label: '字体颜色',
            mapping: 'style.color',
            type: 'color',
            value: ''
          },
          baseProps.common.classList(),
         ...baseProps.common.vif(),
          ...baseProps.common.permission(),
          ...baseProps.common.tooltip(),
          ...baseProps.common.styles()
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
