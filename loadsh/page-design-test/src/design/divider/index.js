import context from '@/common/context'
import { options } from '@/utils/util'
import baseProps from '../baseProps'
context.components.divider = {
  // 组件默认配置
  getConfig() {
    return {
      uuid: '',
      name: 'divider',
      props: {
        direction: 'horizontal'
      },
      design: {
        autoWidth: true
      },
      class: {},
      style: {}
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
            label: '方向',
            type: 'radio',
            mapping: 'props.direction',
            options: options({ horizontal: '水平', vertical: '垂直' }),
            value: '',
            help: '设置分割线方向'
          }, {
            label: '文案',
            type: 'i18n',
            mapping: 'design.slotText',
            value: '',
            vif(meta) { return meta.props.direction === 'horizontal' },
            help: '分割线上的文本'
          },
          {
            label: '文案位置',
            type: 'radio',
            mapping: 'props.content-position',
            options: options({ left: '靠左', center: '居中', right: '靠右' }),
            value: 'center',
            vif(meta) { return meta.props.direction === 'horizontal' },
            help: '设置分割线文案的位置'
          },
          baseProps.common.classList()
        ]
      }
    ]
  }

}
