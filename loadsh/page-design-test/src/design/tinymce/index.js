import context from '@/common/context'
import baseProps from '../baseProps'

context.components['tinymce'] = {
  // 组件默认配置
  getConfig() {
    return {
      uuid: '',
      name: 'tinymce',
      props: {},
      design: {},
      class: {},
      style: {},
      children: [],
      unaided: true
    }
  },
  getProperties(meta) {
    return [{
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.compId(),
        //   baseProps.common.model(),
        {
            label: '绑定模型',
            mapping: 'design.vmodel',
            type: 'model',
            value: '',
            clearable: true,
            vif: 'unaided',
            _del_ : false
          },
          {
            label: '占位文本',
            mapping: 'props.placeholder',
            type: 'i18n',
            value: '请输入编辑器内容',
            clearable: true
          },
          baseProps.common.span()
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.classList(),
          ...baseProps.common.vif(),
          baseProps.common.disabled(),
          ...baseProps.common.permission(),
          ...baseProps.common.styles()
        ]
      }
    ]
  }
}
