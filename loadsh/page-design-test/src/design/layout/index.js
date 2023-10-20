import context from '@/common/context'
import { options, treeEach } from '@/utils/util'
import TreeSelect from '@/components/popupTreeSelect/index.js'
import baseProps from '../baseProps'
import { bus, EVENTS } from '@/common/eventBus'
context.components.layout = {

  // 组件默认配置
  getConfig() {
    return {
      uuid: '',
      name: 'layout',
      props: {},
      design: {
        layout: 'row',
        span: 24
      },
      class: {},
      style: {
        'flex-wrap': 'wrap'
      },
      children: []
    }
  },

  beforeRender(opts) {
    // 设计时样式修正,没设置高度,则给添加一个样式,用于给一个默认的最小高度
    if (!opts.style.height) {
      opts.class['no-height'] = true
    }
  },

  dropHandler(meta, dropData) {
    if (dropData.type === 'field') {
      const config = context.components['form-item'].getConfigByField({ field: dropData.data })
      meta.children.push(config)
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
            label: '布局模式',
            type: 'radio',
            mapping: 'design.mode',
            options: options({ flex: 'Flex 栅格', span: '标准栅格' }),
            value: 'flex',
            onChange(val, meta) {
              // const manager = window.getMetaManager()
              if (val === 'span') {
                meta.children = meta.children.map(child => {
                  let warpSpan = 6
                  if (child.design && child.design.span) {
                    warpSpan = child.design.span
                    child.design._span = warpSpan
                    child.design.span = 24
                    meta.design.span = warpSpan ? 24 : 0
                  }
                  return {
                    uuid: context.uuid('col'),
                    name: 'col',
                    props: {
                      span: warpSpan
                    },
                    design: {},
                    children: child
                  }
                })
              } else {
                meta.children = meta.children.map(child => {
                  if (child.name === 'col') {
                    if (child.children.design && child.children.design._span) {
                      child.children.design.span = child.children.design._span
                    }
                    return child.children
                  } else {
                    return child
                  }
                })
              }
            }
          },
          baseProps.common.span(),
          {
            group: true,
            properties: [
              baseProps.common.width(),
              baseProps.common.height(),
              baseProps.common.layout()
            ],
            vif(meta) { return meta.design.mode !== 'span' }
          },
          {
            label: '栅格间隔',
            mapping: 'props.gutter',
            type: 'number',
            value: 0,
            vif(meta) { return meta.design.mode === 'span' }
          }
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          // baseProps.common.wrap(),
          {
            group: true,
            properties: [
              baseProps.common.flexibility(),
              baseProps.common.justify(),
              baseProps.common.alignItems()
              // baseProps.common.scroll(),
            ],
            vif(meta) { return meta.design.mode !== 'span' }
          },

          baseProps.common.classList(),
         ... baseProps.common.vif(),
          baseProps.common.customAttr(),
          ...baseProps.common.vfor(),
          ...baseProps.common.styles()
        ]
      }
    ]
  },

  getTools(meta) {
    const metadata = window.getMetaManager()
    let form
    if (meta.uuid) {
      form = metadata.getCompPathById(meta.uuid).filter(comp => comp.name === 'form')[0]
      if (!form) {
        return []
      }
    } else {
      return []
    }

    return [
      {
        icon: 'p-icon-plus-circle',
        label: '设置',
        click() {
          let models = metadata.meta.models.filter(m => m.name === form.props[':data'])
          models = JSON.parse(JSON.stringify(models))
          const values = []
          metadata.compEach(form.children, item => {
            if (item.name === 'form-item') {
              values.push(item.props.prop)
            }
          })
          treeEach(models, (item) => {
            item.label = item.label || item.name
            if (values.includes(item.id)) {
              item.disabled = true
            }
          }, 'fields')
          TreeSelect({
            title: '请选择需要加入表单的字段',
            nodeKey: 'id',
            childKey: 'fields',
            labelKey: 'label',
            value: values,
            data: models,
            onSelect(data) {
              const list = data.filter(item => !values.includes(item.id))
              const items = list.map(i => {
                return context.components['form-item'].getConfigByField({ field: i })
              })
              meta.children.push(...items)
            }
          })
        }
      }
    ]
  },
  getContextMenu() {
    return [
      { code: 'sort', name: '内容排序', icon: 'el-icon-sort', handle: (meta) => {
        const list = meta.children.map(item => {
          if (item.name === 'form-item') {
            return {
              id: item.uuid,
              label: item.props.title,
              ref: item
            }
          } else {
            return {
              id: item.uuid,
              label: item.uuid,
              ref: item
            }
          }
        })
        bus.$emit(EVENTS.SHOW_SORT_DIALOG, {
          title: '内容排序',
          data: list,
          callback(list) {
            meta.children = list.map(item => item.ref)
          }
        })
      } }
    ]
  }

}

context.components.col = {
  // 组件的属性配置
  getProperties() {
    return [
      {
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.compId(),
          {
            label: '宽度',
            mapping: 'props.span',
            type: 'slider',
            value: 24,
            max: 24,
            min: 1,
            marks: {
              12: ''
            },
            help: '栅格宽度,将按24等分设置布局宽度'
          }
        ]
      }

    ]
  }
}
