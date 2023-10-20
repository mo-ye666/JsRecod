import context from '@/common/context'
import constants from '@/common/constants'
import { options } from '@/utils/util'
import baseProps from '../baseProps'

context.components.radio = {
  // 组件默认配置
  getConfig(parent, ctx) {
    return {
      uuid: '',
      name: 'radio',
      props: {},
      design: {
        autoWidth: true
      },
      class: {},
      // 是否独立存在(不跟formItem绑定)
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
          // baseProps.common.compName(),
          {
            label: '选中值',
            mapping: 'props.label',
            type: 'input',
            value: '',
            help: '组件被选中的值'
          },
          {
            label: '选项文本',
            mapping: 'design.slotText',
            type: 'input',
            value: '',
            help: '单选框右侧文本'
          },
          {
            label: '组件尺寸',
            mapping: 'props.size',
            type: 'radio',
            options: options({ medium: '中等', small: '较小', mini: '迷你' }),
            value: constants.COMMON_SIZE,
            vif(meta) { return meta.props.border },
            help: 'Radio 的尺寸，仅在 border 为真时有效'
          },
          ...baseProps.common.eventBtn()
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          {
            label: '边框',
            mapping: 'props.border',
            type: 'bool',
            value: false,
            help: '是否显示边框'
          },
          baseProps.common.classList(),
         ... baseProps.common.vif(),
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

context.components['radio-group'] = {
  // 组件默认配置
  getConfig(parent, ctx) {
    return {
      uuid: '',
      name: 'radio-group',
      props: {},
      design: {
        dataType: 'static',
        options: [{ label: '文本', value: 'value' }]
      },
      class: {},
      // 是否独立存在(不跟formItem绑定)
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
            label: '按钮样式',
            mapping: 'design.buttonStyle',
            type: 'bool',
            value: false,
            help: '是否使用按钮样式'
          },
          {
            label: '组件尺寸',
            mapping: 'props.size',
            type: 'radio',
            options: options({ medium: '中等', small: '较小', mini: '迷你' }),
            value: constants.COMMON_SIZE,
            vif(meta) { return meta.design.buttonStyle },
            help: 'Radio 的尺寸，仅在按钮样式有效'
          },
          baseProps.common.dataType(),
          baseProps.common.staticData(),
          baseProps.common.dynamicData(),
          ...baseProps.common.initObjectModel(meta),
          ...baseProps.common.initApi(meta),
          baseProps.common.valueKey(null, meta),
          baseProps.common.labelKey(null, meta),
          ...baseProps.common.eventBtn()
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          {
            label: '字体颜色',
            mapping: 'porps.text-color',
            type: 'color',
            value: '',
            vif(meta) { return meta.design.buttonStyle },
            help: '按钮形式的 Radio 激活时的文本颜色'
          },
          {
            label: '填充颜色',
            mapping: 'porps.text-color',
            type: 'color',
            value: '',
            vif(meta) { return meta.design.buttonStyle },
            help: '按钮形式的 Radio 激活时的填充色和边框色'
          },
          baseProps.common.classList(),
         ... baseProps.common.vif(),
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
