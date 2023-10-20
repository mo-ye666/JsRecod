import context from '@/common/context'
import baseProps from '../baseProps'

context.components.text = {
  // 组件默认配置
  getConfig(parent) {
    return {
      uuid: '',
      name: 'text',
      props: {},
      design: {
        autoWidth: true,
        slotText: parent.name === 'form-item' ? '' : '文本'
      },
      class: {},
      style: {
      },
      unaided: true
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
            label: '静态文本',
            mapping: 'design.slotText',
            type: 'i18n',
            value: '',
            clearable: true
          },
          {
            label: '绑定模型',
            mapping: 'design.vmodel',
            type: 'model',
            value: '',
            clearable: true,
            vif: 'unaided',
            _del_ : false
          },
          {
            label: '字体颜色',
            mapping: 'style.color',
            type: 'color',
            value: ''
          },
          baseProps.common.span()
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.textAlign(),
          baseProps.common.fontSize(),
          baseProps.common.lineHeight(),
          baseProps.common.classList(),
          ...baseProps.common.vif(),
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
