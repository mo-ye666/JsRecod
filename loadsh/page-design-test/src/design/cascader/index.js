import context from '@/common/context'
import baseProps from '../baseProps'

context.components.cascader = {
  // 组件默认配置
  getConfig(parent, ctx) {
    return {
      uuid: '',
      name: 'cascader',
      props: {},
      design: {
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
          {
            label: '选项数据',
            mapping: 'props.:options',
            type: 'model',
            checkStrictly: true,
            help: '请选择用作选项数据的数据模型',
            value: ''
          },
          {
            label: '值字段',
            mapping: 'props.props.value',
            type: 'input',
            value: 'value',
            help: '指定选项的值为选项对象的某个属性值'
          },
          {
            label: '标签字段',
            mapping: 'props.props.label',
            type: 'input',
            value: 'label',
            help: ' 指定选项标签为选项对象的某个属性值'
          },
          {
            label: '子字段',
            mapping: 'props.props.children',
            type: 'input',
            value: 'children',
            help: ' 指定选项的子选项为选项对象的某个属性值'
          },
          baseProps.common.placeholder(),
          baseProps.common.size(),
          ...baseProps.common.eventBtn()
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [{
          label: '任意选中',
          mapping: 'props.props.checkStrictly',
          type: 'bool',
          value: false,
          help: '默认只能选中最后一级的节点, 设置该项从而达到选择任意一级选项的目的'
        }, {
          label: '多选',
          mapping: 'props.props.multiple',
          type: 'bool',
          value: false
        }, {
          label: '懒加载',
          mapping: 'props.props.lazy',
          type: 'bool',
          value: false,
          help: '是否动态加载子节点，需与 lazyLoad 方法结合使用'
        }, {
          label: '加载函数',
          mapping: 'props.props.lazyLoad',
          type: 'method',
          onlyCode: true,
          value: '',
          vif: 'props.props.lazy',
          help: '加载动态数据的方法，仅在 lazy 为 true 时有效,function(node, resolve)，node为当前点击的节点，resolve为数据加载完成的回调(必须调用)'
        },
        {
          label: '显示路径',
          mapping: 'props.show-all-levels',
          type: 'bool',
          value: true,
          help: '是否显示完整的路径,取消勾选则仅显示最后一级'
        },
        {
          label: '启用搜索',
          mapping: 'props.filterable',
          type: 'bool',
          value: false,
          help: '是否打开搜索功能，默认会匹配节点的label或所有父节点的label'
        },
        baseProps.common.clearable(),
        baseProps.common.classList(),
        baseProps.common.customAttr(),
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
