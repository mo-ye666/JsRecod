import context from '@/common/context'
import baseProps from '../baseProps'
import { bus, EVENTS } from '@/common/eventBus'
import { uuid } from '@/utils/util'
context.components['v-template'] = {

  // 组件默认配置
  getConfig() {
    return {
      uuid: '',
      name: 'v-template',
      props: { },
      design: { template: 'template code ', perms: [] },
      class: {},
      style: {}
    }
  },

  beforeRender(opts) {
    // 设计时样式修正,没设置高度,则给添加一个样式,用于给一个默认的最小高度
    if (!opts.style.height) {
      opts.class['no-height'] = true
    }
  },

  // 组件的属性配置
  getProperties(meta) {
    if (!parent) {
      return []
    }
    return [
      {
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.compId(),
          baseProps.common.span(),
          baseProps.common.height(),
          {
            label: '模板',
            type: 'button',
            mapping: 'design.template',
            rows: 5,
            onClick() {
              bus.$emit(EVENTS.SHOW_CODE_DRAWER, {
                type: 'html',
                code: meta.design.template,
                save(code) {
                  meta.design.template = code
                }
              })
            },
            help: '自定义HTML代码,建议在预览模式编写模板并调试代码,然后复制到此处'
          },
          {
            
              label: '描述',
              mapping: 'design.desc',
              type: 'input',
              value: '',
              clearable: true,
              help: '用于描述该组件用途'
            
          },
          {
            label: '内部权限控制',
            type: '$list',
            mapping: 'design.perms',
            supportDel: true,
            supportAdd: true,
            supportSort: false,
            value: [],
            addHandler(data) {
              data.design.perms.push({ id: uuid(4), code: uuid(8), name: '' })
            },
            columns: [
              {
                mapping: 'code',
                type: 'input',
                placeholder: '权限编码',
                value: ''
              },
              {
                mapping: 'name',
                type: 'input',
                value: '',
                width: '140px',
                placeholder: '权限别名'
              }
            ]
          },
          ...baseProps.common.styles()
        ]
      }
    ]
  }

}
