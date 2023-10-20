import context from '@/common/context'
import baseProps from '../baseProps'
import { options } from '@/utils/util'
context.components.transfer = {
  // 组件默认配置
  getConfig() {
    return {
      uuid: '',
      name: 'transfer',
      props: {
        titles: ['可选数据', '已选数据']
      },
      design: {
        class: 'v-transfer',
        bindDataAttr: 'data'
      },
      class: {},
      style: {},
      slots: []
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
            label: '模型字段',
            mapping: 'design.vmodel',
            filter: 'Array',
            type: 'model',
            help: '请绑定数组类型的模型字段(v-model)',
            value: '',
            _del_: false
          },
          {
            label: '左侧标题',
            value: '',
            type: 'i18n',
            mapping: 'props.titles[0]'
          },
          {
            label: '右侧标题',
            value: '',
            type: 'i18n',
            mapping: 'props.titles[1]'
          },
          baseProps.common.dataType({
            label: '数据源',
            type:'radio',
            options: options({ dynamic: '动态', objectModel: '服务' ,api: '服务' }),
            value: 'dynamic',
            help: '请配置左侧列表可选数据源'
          }),
          baseProps.common.dynamicData({
            label: '可选数据',
            mapping: 'props.:data',
            help: '可选数据模型'
          }),
          ...baseProps.common.initObjectModel(meta),
          ...baseProps.common.initApi(meta),
          {
            label: '唯一标识',
            mapping: 'props.props.key',
            type: 'field-select',
            params: meta,
            value: 'label',
            help: ' 唯一标识的属性字段'
          },
          {
            label: '标签字段',
            mapping: 'props.props.label',
            type: 'field-select',
            params: meta,
            value: 'label',
            help: ' 指定选项标签为选项对象的某个属性值'
          },
          baseProps.common.span(),
          ...baseProps.common.eventBtn()
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          {
            label: '启用搜索',
            mapping: 'props.filterable',
            type: 'bool',
            value: false,
            help: '是否可搜索 (filterable)'
          }, {
            label: '搜索方法',
            mapping: 'props.:filter-method',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '远程搜索方法',
            vif: 'props.filterable'
          },
          {
            label: '排序策略',
            mapping: 'props.target-order',
            type: 'select',
            value: 'original',
            options: options({
              'original': '保持与数据源相同顺序',
              'push': '新加入的元素排在最后',
              'unshift': '新加入的元素排在最前'
            }),
            help: '右侧列表的数据排序策略'
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
      { id: 'change', label: '右侧列表元素变化时触发(onChange)' }
    ]
  },

  getMockValue() {
    return []
  },

  getMockData() {
    return [
    ]
  }

}
