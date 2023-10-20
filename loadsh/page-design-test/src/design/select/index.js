import context from '@/common/context'
import baseProps from '../baseProps'
import constants from '@/common/constants'
context.components.select = {
  // 组件默认配置
  getConfig() {
    return {
      uuid: '',
      name: 'select',
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
  getProperties(meta) {
    return [
      {
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.compId(),
          baseProps.common.model(),
          baseProps.common.placeholder(),
          baseProps.common.size(),
          baseProps.common.multiple(),
          baseProps.common.dataType(),
          baseProps.common.staticData(),
          baseProps.common.dynamicData(),
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
          baseProps.common.clearable(),
          {
            label: '启用搜索',
            mapping: 'props.filterable',
            type: 'bool',
            value: false,
            help: '是否可搜索 (filterable)'
          }, {
            label: '自建项目',
            mapping: 'props.allow-create',
            type: 'bool',
            value: false,
            help: '是否允许用户创建新条目，需启用搜索'
          }, {
            label: '远程搜索',
            mapping: 'props.remote',
            type: 'bool',
            value: false,
            help: '启用远程搜索，需要将filterable和remote设置为true,同时设置搜索方法'
          }, {
            label: '搜索方法',
            mapping: 'props.:remote-method',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '远程搜索方法',
            vif: 'props.remote'
          },
          baseProps.common.customAttr(),
          baseProps.common.width({ help: '' }),
          baseProps.common.classList(),
         ...baseProps.common.vif(),
          baseProps.common.disabled()
        ]
      }
    ]
  },

  getEvents() {
    return [
      { id: 'change', label: '值改变事件(onChange)' },
      { id: 'visible-change', label: '下拉框出现/隐藏时触发' },
      { id: 'focus', label: '当 input 获得焦点时触发' }
    ]
  }

}
