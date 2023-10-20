import context from '@/common/context'
import { options } from '@/utils/util'
import baseProps from '../baseProps'
import { bus, EVENTS } from '@/common/eventBus'
context.components['grid-button'] = {
  // 组件默认配置
  getConfig() {
    return {
      name: 'grid-button',
      label: '',
      prop: '',
      width: '',
      config: {},
      editable: false,
      edit: {},
      design: {}
    }
  },
  // 组件的属性配置
  getProperties(meta) {
    return [
      {
        group: '按钮详情配置',
        groupType: 'collapse',
        properties: [
          {
            label: '按钮文本',
            mapping: 'children',
            type: 'i18n',
            value: '',
            help: ''
          }, {
            label: '按钮图标',
            mapping: 'props.icon',
            type: 'icon',
            value: ''
          },
          baseProps.common.classList(),
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          {
            label: '允许保存',
            mapping: 'props.canSave',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '是否允许保存,返回值为类型为boolean',
            vif(meta) { 
              return meta.code === 'save'
             },
          },
          baseProps.common.disabledExp(),
          ...baseProps.common.permission()
        ]
      }
    ]
  }
}

