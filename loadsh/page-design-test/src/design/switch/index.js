import context from '@/common/context'
import baseProps from '../baseProps'
import constants from '@/common/constants'
context.components.switch = {
  // 组件默认配置
  getConfig() {
    return {
      uuid: '',
      name: 'switch',
      props: {
        size: constants.COMMON_SIZE
      },
      design: {
        autoWidth: true
      },
      class: {},
      style: {

      },
      slots: [],
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
          baseProps.common.model(),
          {
            label: '打开值',
            mapping: 'props.active-value',
            type: 'input',
            value: 1,
            help: '开关打开时的值'
          },
          {
            label: '关闭值',
            mapping: 'props.inactive-value',
            type: 'input',
            value: 0,
            help: '开关关闭时的值'
          },
          {
            label: '单文本',
            mapping: 'design.singleText',
            type: 'bool',
            value: false,
            help: '单文本模式,将只在开关后显示单个状态文本,只在form-item中生效'
          },
          baseProps.common.width(),
          ...baseProps.common.eventBtn()
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          {
            label: '打开文字',
            mapping: 'props.active-text',
            type: 'i18n',
            value: '',
            help: '开关打开时的文字描述'
          },
          {
            label: '关闭文字',
            mapping: 'props.inactive-text',
            type: 'i18n',
            value: '',
            help: '开关关闭时的文字描述'
          },
          {
            label: '开背景色',
            mapping: 'props.active-color',
            type: 'color',
            value: '',
            help: '开关打开时的背景色'
          },
          {
            label: '关背景色',
            mapping: 'props.inactive-color',
            type: 'color',
            value: '',
            help: '开关关闭时的背景色'
          },
          // baseProps.common.classList(),
          //... baseProps.common.vif(),
          baseProps.common.disabled()
        ]
      }
    ]
  },

  getEvents() {
    return [
      { id: 'change', label: '值改变事件(onChange)' }
    ]
  }

}
