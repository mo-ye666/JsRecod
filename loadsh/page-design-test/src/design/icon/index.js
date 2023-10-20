import context from '@/common/context'
import baseProps from '../baseProps'

context.components.icon = {
  // 组件默认配置
  getConfig(parent, ctx) {
    return {
      uuid: '',
      name: 'icon',
      props: {},
      design: {
        autoWidth: true
      },
      class: {},
      style: {
        'lineHeight': '32px'
      }
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
            label: '图标',
            mapping: 'design.class',
            type: 'icon',
            value: 'p-icon-plus-circle'
          },
          {
            label: '后缀文字',
            mapping: 'design.slotText',
            type: 'i18n',
            value: '',
            clearable: true
          },
          {
            label: '颜色',
            mapping: 'style.color',
            type: 'color',
            value: ''
          }
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.fontSize(),
          baseProps.common.lineHeight(),
          baseProps.common.classList(),
         ... baseProps.common.vif(),
          ...baseProps.common.tooltip(),
          ...baseProps.common.styles()
        ]
      }
    ]
  }

}
