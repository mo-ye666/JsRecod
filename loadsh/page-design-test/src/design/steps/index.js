import context from '@/common/context'
import baseProps from '../baseProps'
context.components.steps = {
  // 组件默认配置
  getConfig() {
    return {
      uuid: '',
      name: 'steps',
      props: {
        steps: [{ name: '步骤1' }, { name: '步骤2' }, { name: '步骤3' }]
      },
      design: {
        activeStep: 1
      },
      class: {},
      style: {}
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
          {
            label: '当前步骤',
            mapping: 'design.activeStep',
            type: 'number',
            help: '当前步骤默认值',
            value: ''
          },
          {
            label: '步骤模型',
            mapping: 'props.:active',
            type: 'model',
            help: '当需要动态改变步骤时候,可配置此项',
            value: ''
          },
          baseProps.common.span(),
          {
            label: '步骤列表',
            type: '$list',
            mapping: 'props.steps',
            supportDel: true,
            supportAdd: true,
            value: [],
            columns: [
              {
                mapping: 'name',
                type: 'i18n',
                value: '',
                placeholder: '步骤名',
                style: {
                  width: '130px'
                }
              },
              {
                mapping: 'icon',
                type: 'icon'
              }
            ],
            addHandler(tabs) {
              return { name: '步骤名称', icon: '' }
            }
          },
          baseProps.common.classList(),
          ...baseProps.common.vif()
        ]
      }
    ]
  },
  getEvents() {
    return [
      { id: 'click', label: '点击事件' }]
  }

}
