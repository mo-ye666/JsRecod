import context from '@/common/context'
// import Metadata from '@/common/metadata'
import { bus, EVENTS } from '@/common/eventBus'
import baseProps from '../baseProps'
import TreeSelect from '@/components/popupTreeSelect/index.js'
// import { treeEach } from '@/utils/util'

context.components.form = {

  // 组件默认配置
  getConfig(parent, ctx) {
    return {
      uuid: '',
      name: 'form',
      props: {
        titleWidth: '120px',
        lineHeight: '32px',
        titleAlign: 'right'
      },
      design: { },
      class: {},
      style: {},
      children: [],
      slots: [],
      ref: true
    }
  },
  getTools(meta) {
    return [
      {
        icon: 'p-icon-plus-circle',
        label: '添加表单项',
        click() {
          showFormItemTree(meta)
        }
      }
    ]
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
    const metadata = window.getMetaManager()
    const models = metadata.meta.models.map(m => {
      return { label: m.name, value: m.name }
    })
    return [
      {
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.compId(),
          {
            label: '表单模型',
            mapping: 'props.:data',
            type: 'select',
            help: '表单的数据模型',
            value: '',
            options: models,
            onChange(val, meta) {
              if (val) {
                showFormItemTree(meta)
              }
            }
          },
          baseProps.common.span(),
          baseProps.common.width(),
          {
            label: '元素间隔',
            mapping: 'props.itemGutter',
            type: 'number',
            value: 0,
            clearable: true,
            format(val, isEdit) {
              return parseInt(val) || 0
            },
            help: '内部表单元素之间的间隔,单位像素(px) --该配置只对内部表单项FormItem生效'
          },
          {
            label: '标签宽度',
            mapping: 'props.titleWidth',
            type: 'input',
            value: '',
            clearable: true,
            append: 'px',
            format(val, isEdit) {
              if (isEdit) {
                return val ? parseInt(val) : ''
              } else {
                return val ? parseInt(val) + 'px' : ''
              }
            },
            help: '表单内部元素(FormItem)的默认标签宽度'
          }, {
            label: '标签位置',
            mapping: 'props.titleAlign',
            type: 'select',
            options: ['top', 'left', 'right'],
            value: 'right',
            help: '表单内部元素(FormItem)的默认标签位置'
          }
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          {
            label: '行高',
            mapping: 'props.lineHeight',
            type: 'number',
            value: '32',
            clearable: true,
            append: 'px',
            format(val, isEdit) {
              if (isEdit) {
                return val ? parseInt(val) : ''
              } else {
                return val ? parseInt(val) + 'px' : ''
              }
            },
            help: '像素宽度,该设置优先级高于栅格宽度,设置该项后 栅格宽度将不生效'
          },
          baseProps.common.flexibility(),
          baseProps.common.customAttr()
        ]
      }

    ]
  },
  getContextMenu() {
    return [
      { code: 'sort', name: '表单项排序', icon: 'el-icon-sort', handle: (meta) => {
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
          title: '表单项排序',
          data: list,
          callback(list) {
            meta.children = list.map(item => item.ref)
          }
        })
      } }
    ]
  }

}

function showFormItemTree(meta) {
  const metadata = window.getMetaManager()
  if (!meta.props[':data']) {
    window.getApp().$message.warning('请先绑定表单的数据模型')
    return
  }
  let model = metadata.meta.models.find(m => m.name === meta.props[':data'])
  if (model) {
    model = JSON.parse(JSON.stringify(model))
  }

  if (!model.fields.length) {
    window.getApp().$message.warning('该模型下没有可使用的模型字段!')
    return
  }
  const values = []
  metadata.compEach(meta.children, item => {
    if (item.name === 'form-item') {
      values.push(item.props.prop)
    }
  })
  model = handleTreedData([model])
  treeEach(model, (item) => {
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
    data: model,
    onSelect(data) {
      const list = data.filter(item => !values.includes(item.id))
      const items = list.map(i => {
        return context.components['form-item'].getConfigByField({ field: i })
      })
      meta.children.push(...items)
    }
  })
}

// 处理数据
function handleTreedData(list) {
  let newListData = JSON.parse(JSON.stringify(list));
  newListData.forEach(child => {
    for(let key in child) {
      if(Array.isArray(child[key])) {
        child.fields = handleTreedData(child[key]);
      }
    }
  })
  return newListData;
}

function treeEach(list, fn, childKey = 'children') {
  list.forEach((child) => {
    fn(child)
    if (Array.isArray(child[childKey])) {
      treeEach(child[childKey], fn)
    }
  })
}
