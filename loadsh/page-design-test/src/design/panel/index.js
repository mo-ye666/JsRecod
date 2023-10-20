import context from '@/common/context'
import baseProps from '../baseProps'
context.components.panel = {

  // 组件默认配置
  getConfig(parent, ctx) {
    const layout = context.getConfig('layout')
    layout.design.span = 24
    layout.design.mapping = 'children'
    return {
      uuid: '',
      name: 'panel',
      props: {},
      design: {},
      class: {},
      style: {},
      children: [layout],
      slots: []
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
          baseProps.common.title(),
          baseProps.common.span(),
          baseProps.common.width(),
          {
            label: '左右间距',
            mapping: 'props.hasPadding',
            type: 'bool',
            value: true,
            help: '内容区域是否需要左右间距'
          },
          {
            label: '可折叠',
            mapping: 'props.collapsible',
            type: 'bool',
            value: true,
            help: '面板是否带有折叠功能'
          },
          {
            label: '默认折叠',
            mapping: 'props.collapsed',
            type: 'bool',
            value: false,
            vif: 'props.collapsible',
            help: '页面初始化是否是折叠状态'
          },

          {
            label: '工具栏',
            mapping: 'design.customTools',
            type: 'bool',
            value: false,
            help: '是否需要头部工具栏',
            onChange(val, meta) {
              if (val) {
                const header = context.getConfig('layout', meta)
                header.slot = 'header'
                header.style['justify-content'] = 'flex-end'
                meta.slots = [header]
              } else {
                meta.slots = []
              }
              return true
            }
          }
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          {
            label: "阴影显示时机",
            mapping: "props.shadow",
            type: "select",
            options: ["always", "hover", "never"],
            value: "always"
          },
         ... baseProps.common.vif(),
          baseProps.common.customAttr(),
          ...baseProps.common.styles()
        ]
      }

    ]
  }

}
