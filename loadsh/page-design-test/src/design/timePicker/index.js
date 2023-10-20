import context from '@/common/context'
import constants from '@/common/constants'
import baseProps from '../baseProps'

context.components['time-picker'] = {
  // 组件默认配置
  getConfig() {
    return {
      uuid: '',
      name: 'time-picker',
      props: {
        size: constants.COMMON_SIZE
      },
      design: {
      },
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
            label: '时间范围',
            mapping: 'props.is-range',
            type: 'bool',
            value: false,
            help: '是否为时间范围选择'
          },
          baseProps.common.placeholder({
            vif(meta) { return !meta.props['is-range'] }
          }),

          baseProps.common.size(),
          {
            label: '时间格式',
            mapping: 'props.value-format',
            type: 'select',
            allowCreate: true,
            clearable: true,
            options: ['HH:mm:ss', 'HH:mm'],
            value: 'HH:mm:ss',
            help: '可选,绑定值的格式。不指定则绑定值为 Date 对象'
          },
          // {
          //   label: '间隔时间',
          //   mapping: 'props.step',
          //   type: 'select',
          //   options: ['00:30', '01:00', '00:15'],
          //   value: '',
          //   help: '下拉选项的间隔事件,默认为00:30 (30分钟)'
          // },
          ...baseProps.common.eventBtn()
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.clearable(),
          baseProps.common.readonly(),
          {
            label: '时间范围',
            mapping: 'props.range-separator',
            type: 'bool',
            value: '',
            vif: 'props.is-range',
            help: '选择范围时的分隔符,如不配置,默认为"-"'
          },
          baseProps.common.customAttr(),
          baseProps.common.classList(),
          ...baseProps.common.vif(),
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
