import context from '@/common/context'
import constants from '@/common/constants'
import { options } from '@/utils/util'
import baseProps from '../baseProps'

context.components.inputNumber = {
  // 组件默认配置
  getConfig(parent, ctx) {
    return {
      uuid: '',
      name: 'inputNumber',
      props: {
        size: constants.COMMON_SIZE,
        'controls-position': '' },
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
          baseProps.common.compName(),
          {
            label: '步长',
            mapping: 'props.step',
            type: 'number',
            value: 1,
            help: '计数器步长'
          }, {
            label: '精度',
            mapping: 'props.precision',
            type: 'number',
            value: 0
          }, {
            label: '最大值',
            mapping: 'props.max',
            type: 'number',
            value: Infinity
          }, {
            label: '最小值',
            mapping: 'props.min',
            type: 'number',
            value: 0
          }, {
            label: '控制按钮',
            mapping: 'props.controls',
            type: 'bool',
            value: true,
            help: '是否使用控制按钮'
          },
          {
            label: '按钮位置',
            mapping: 'props.controls-position',
            type: 'radio',
            options: options({ '': '默认', right: '右侧' }),
            value: 'text',
            help: '请选择控制按钮的位置,默认在两侧',
            vif: 'props.controls'
          },
          baseProps.common.size(),
          ...baseProps.common.eventBtn()
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.customAttr(),
          baseProps.common.readonly(),
          baseProps.common.disabled(),
          ...baseProps.common.vif()
        ]
      }
    ]
  },

  getEvents() {
    return [
      { id: 'change', label: '值改变事件(onChange)' },
      { id: 'keyup', label: '键盘keyUp事件', native: true, params: '$event' }
    ]
  }

}
