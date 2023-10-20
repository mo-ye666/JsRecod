import context from '@/common/context'
import constants from '@/common/constants'
import { options } from '@/utils/util'
import baseProps from '../baseProps'

context.components.input = {
  // 组件默认配置
  getConfig(parent, ctx) {
    return {
      uuid: '',
      name: 'input',
      props: { size: constants.COMMON_SIZE },
      design: {},
      class: {},
      style: {},
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
            label: '输入类型',
            mapping: 'props.type',
            type: 'select',
            options: options({ text: '文本框', textarea: '文本域', password: '密码框' }),
            value: 'text',
            help: '输入框类型'
          }, {
            label: '行数',
            mapping: 'props.rows',
            type: 'number',
            value: 2,
            vif(meta) { return meta.props.type === 'textarea' },
            help: '文本域行数'
          },
          {
            label: '占位文本',
            mapping: 'props.placeholder',
            type: 'i18n',
            value: '',
            clearable: true
          }, {
            label: '清空按钮',
            mapping: 'props.clearable',
            type: 'bool',
            value: false
          }, {
            label: '去空白字符',
            mapping: 'design.trim',
            type: 'bool',
            value: false,
            help: '自动过滤用户输入的首尾空白字符'
          }, {
            label: 'lazy修饰符',
            mapping: 'design.lazy',
            type: 'bool',
            value: false,
            help: '在 change 事件之后进行vmodel同步'
          },
          baseProps.common.span(),

          baseProps.common.size(),
          ...baseProps.common.eventBtn()
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.width({ vif: 'unaided' }),
          {
            label: '字数统计',
            mapping: 'props.show-word-limit',
            type: 'bool',
            value: false,
            help: '是否显示输入字数统计，只在 文本框与文本域类型 时有效'
          },
          baseProps.common.readonly(),
          baseProps.common.disabled(),
          {
            label: '前置内容',
            mapping: 'design.prepend',
            type: 'bool',
            value: false,
            onChange(val, meta) {
              if (val) {
                const prepend = context.getConfig('layout', meta)
                prepend.slot = 'prepend'
                prepend.design.mapping = 'slots.append'
                meta.slots.push(prepend)
              } else {
                meta.slots = meta.slots.filter(item => item.slot !== 'prepend')
              }
            },
            help: '输入框前置内容'
          },
          {
            label: '后置内容',
            mapping: 'design.append',
            type: 'bool',
            value: false,
            onChange(val, meta) {
              if (val) {
                const append = context.getConfig('layout', meta)
                append.slot = 'append'
                append.design.mapping = 'slots.append'
                meta.slots.push(append)
              } else {
                meta.slots = meta.slots.filter(item => item.slot !== 'append')
              }
            },
            help: '输入框后置内容'
          },
          {
            label: '头部图标',
            mapping: 'props.prefix-icon',
            type: 'icon',
            value: '',
            help: '输入框头部图标'
          },
          {
            label: '尾部图标',
            mapping: 'props.suffix-icon',
            type: 'icon',
            value: '',
            help: '输入框尾部图标'
          },
         ... baseProps.common.vif(),
          baseProps.common.customAttr()
        ]
      }
    ]
  },

  getEvents() {
    return [
      { id: 'change', label: '值改变事件(change)' },
      { id: 'keyup', label: '键盘keyUp事件', native: true },
      { id: 'keydown', label: '键盘keyDown事件', native: true },
      { id: 'input', label: '输入事件(input)' },
      { id: 'focus', label: '获得焦点事件' },
      { id: 'blur', label: '失去焦点事件' },
      { id: 'click', label: '点击事件', native: true },
      { id: 'dblclick', label: '双击事件', native: true },
      { id: 'clear', label: '清空事件' },
    ]
  }

}
