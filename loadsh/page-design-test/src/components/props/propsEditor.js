import { bus, EVENTS } from '@/common/eventBus'
import { type, uuid } from '@/utils/util'
import i18n from '@/render/src/utils/i18n'
// function newLayout(children) {
//   return type(children) !== 'string' ? children : {
//     name: 'div',
//     children
//   }
// }
const Editors = {
  editors: {},
  get(name) {
    return this.editors[name] || this.editors.input
  },
  register(name, fn) {
    this.editors[name] = fn
  },
  getEditor(prop, changeFn) {
    const type = prop.type
    return Editors.get(type)(prop, changeFn)
  }
}
// 文本
Editors.register('text', (prop, changeFn) => {
  return {
    tag: 'div',
    children: i18n.t(prop.value),
    style: prop.style,
    class: 'prop-text',
    attrs: {title: i18n.t(prop.value)},
    on: {
      click: (e) => { prop.onClick && prop.onClick(e, changeFn) }
    },
  }
})
// 输入框
Editors.register('input', (prop, changeFn) => {
  const conf = {
    name: 'input',
    props: Object.assign({
      value: prop.format ? prop.format(prop.value, true) : prop.value,
      clearable: prop.clearable,
      size: 'mini'
    }, prop.props),
    attrs: {
      placeholder: prop.placeholder,
      rows: prop.rows
    },
    style: {
      width: prop.width
    },
    on: {
      input: (value) => {
        if (prop.format) {
          value = prop.format(value) || ''
        }
        changeFn({ value, prop })
      }
    }
  }
  if (prop.append) {
    if (typeof prop.append === 'string') {
      conf.children = {
        tag: 'template',
        slot: 'append',
        children: prop.append
      }
    } else if (typeof prop.append === 'object') {
      conf.children = Editors.getEditor(prop.append, changeFn)
      conf.children.slot = 'append'
    }
  }

  return conf
})

// 下拉选择器
Editors.register('select', (prop, changeFn) => {
  const children = prop.options.map((option) => {
    return {
      name: 'option',
      props: type(option) !== 'object' ? { label: option, value: option } : {
        label: option[prop.labelKey || 'label'],
        value: option[prop.valueKey || 'value']
      }
    }
  })
  return {
    name: 'select',
    props: {
      value: prop.value, // 默认值
      disabled: prop.disabled, // 是否禁用
      multiple: prop.multiple, // 是否可多选
      placeholder: prop.placeholder, // 占位符
      clearable: prop.clearable, // 是否允许清空
      'allow-create': prop.allowCreate,
      filterable: prop.filterable,
      size: 'mini'
    },
    on: {
      input: (value) => {
        changeFn({ value, prop })
      }
    },
    style: {
      width: prop.width
    },
    children
  }
})

// 单选
Editors.register('radio', (prop, changeFn) => {
  const children = prop.options.map((op) => {
    const { value, label } = (typeof op === 'object' ? op : { value: op, label: op })
    return {
      name: 'el-radio-button',
      props: {
        label: value
      },
      children: label
    }
  })
  return {
    name: 'el-radio-group',
    props: {
      value: prop.value,
      size: 'mini'
    },
    on: {
      input: (value) => {
        changeFn({ value, prop })
      }
    },
    children
  }
})

// 单选
Editors.register('bool', (prop, changeFn) => {
  return {
    name: 'checkbox',
    props: {
      value: prop.format ? prop.format(prop.value, true) : prop.value,
      size: 'mini'
    },
    on: {
      input: (value) => {
        if (prop.format) {
          value = prop.format(value)
        }
        changeFn({ value, prop })
      }
    }
  }
})

// 滑块
Editors.register('slider', (prop, changeFn) => {
  return {
    name: 'el-slider',
    props: {
      value: prop.value,
      max: prop.max,
      min: prop.min,
      marks: prop.marks,
      range: prop.range
    },
    on: {
      input: (value) => {
        changeFn({ value, prop })
      }
    }
  }
})

// 数字编辑
Editors.register('number', (prop, changeFn) => {
  return {
    name: 'el-input-number',
    props: {
      value: prop.format ? prop.format(prop.value, true) : prop.value,
      step: prop.step,
      'step-strictly': prop.stepStrictly,
      max: prop.max,
      min: prop.min,
      size: 'mini'
    },
    on: {
      input: (value) => {
        if (prop.format) {
          value = prop.format(value)
        }
        changeFn({ value, prop })
      }
    }
  }
})

// 图标选择编辑器
Editors.register('icon', (prop, changeFn) => {
  return {
    name: 'icon-select',
    props: {
      value: prop.value,
      size: 'mini'
    },
    on: {
      input: (value) => {
        changeFn({ value, prop })
      }
    }
  }
})
// 国际化选择编辑器
Editors.register('i18n', (prop, changeFn) => {
  return {
    name: 'i18n-select',
    props: {
      value: prop.value
    },
    style: prop.style,
    on: {
      input: (value) => {
        changeFn({ value, prop })
      }
    }
  }
})

// 数据模型选择编辑器
Editors.register('model', (prop, changeFn) => {
  return {
    name: 'model-select',
    props: {
      value: prop.value,
      clearable: true,
      filterable:true,
      filter: prop.filter, // 筛选: Array 过滤出数组字段 Object 过滤出对象类型的字段
      onlyModel: prop.onlyModel, // 默认值false,  为true时,只列出主模型
      checkStrictly: prop.checkStrictly, // 来设置父子节点取消选中关联，从而达到选择任意一级选项的目的。
      showAllLevels: prop.showAllLevels,
      mergeOptions:prop.mergeOptions || [] // 如果有额外混合数据,则进行数据混合
    },
    on: {
      input: (value) => {
        changeFn({ value, prop })
      }
    }
  }
})
// 功能模型选择编辑器
Editors.register('objectModel', (prop, changeFn) => {
  const metadata = window.getMetaManager()
  var options = metadata.meta.objectModels
  return {
    name: 'el-cascader',
    props: {
      value: prop.value,
      options:options ,
      size:'mini',
      props:{
        value:'functionCode',
        label:'name',
        children:'functionList',
        emitPath:false,
      },
      showAllLevels: false,
      checkStrictly: true,
    },
    on: {
      input: (value) => {
        changeFn({ value, prop })
      }
    }
  }
})

// 颜色选择器
Editors.register('color', (prop, changeFn) => {
  return {
    name: 'el-color-picker',
    props: {
      value: prop.value,
      'show-alpha': true
    },
    on: {
      input: (value) => {
        changeFn({ value, prop })
      }
    }
  }
})
const componentMethods = {
  table: [
    { value: 'selection', label: '获取选中行数据', type: 'prop' },
    { value: 'clearSelection', label: '清空用户的选择(用于多选表格)' },
    { value: 'doLayout', label: '对 Table 进行重新布局' }
  ],
  grid: [
    { value: 'loadTableData', label: '加载表格数据' },
    { value: 'getTableData', label: '获取当前表格数据' },
    { value: 'getEditStore', label: '获取当前表格数据状态对象' },
    { value: 'getCheckRows', label: '获取当前选中的行数据(用于多选表格)'},
    { value: 'clearSelection', label: '清空用户的选择的列(用于多选表格)'},
    { value: 'insert', label: '插入数据的方法（返回promise）'}
  ],
  tree: [
    { value: 'getCurrentKey', label: '获取当前被选中节点的 key' },
    { value: 'setCurrentKey', label: '通过 key 设置某个节点的当前选中状态' }
  ]
}
// 页面方法选择器
Editors.register('compMethod', (prop, changeFn) => {
  const children = []
  return {
    name: 'select',
    props: {
      value: prop.format ? prop.format(prop.value, true) : prop.value,
      disabled: prop.disabled, // 是否禁用
      multiple: prop.multiple, // 是否可多选
      placeholder: prop.placeholder, // 占位符
      clearable: true, // 是否允许清空
      'allow-create': prop.allowCreate,
      filterable: prop.filterable,
      size: 'mini'
    },
    on: {
      input: (value) => {
        if (prop.format) {
          value = prop.format(value) || ''
        }
        changeFn({ value, prop })
      },
      'visible-change': (bool) => {
        if (bool && prop.params) {
          let options
          if (prop.params.uuid.indexOf('table') !== -1) {
            options = componentMethods.table
          } else if (prop.params.uuid.indexOf('tree') !== -1) {
            options = componentMethods.tree
          } else if (prop.params.uuid.indexOf('grid') !== -1) {
            options = componentMethods.grid
          }
          options = options.map((option) => {
            return {
              name: 'option',
              props: option
            }
          })
          children.length = 0
          children.push(...options)
        }
      }
    },
    children
  }
})
// 页面方法选择器
Editors.register('method', (prop, changeFn) => {
  const metadata = window.getMetaManager()
  var options = metadata.meta.events.codeMethods.children.map(item => {return {label:`自定义函数:${item.id}`,value:item.id}} )
  // 判断 是否只需要自定义的代码函数
  if (!prop.onlyCode) {
    options.push(...metadata.meta.events.methods.children.map(item => {return {label:`编排函数 ${item.label }:${item.name}`,value:item.name}}))
  }
  options.push({ label: '页面Init', value: 'init' })
  metadata.compEach(metadata.meta.children, (item) => {
    if (item.name === 'v-table' && item.props['@search']) {
      options.push({ label: `${item.uuid} 查询`, value: item.props['@search'] })
    }
  })
  const children = options.map((option) => {
    return {
      name: 'option',
      props: option.value ? option : { label: option, value: option }
    }
  })
  return {
    name: 'select',
    props: {
      value: prop.format ? prop.format(prop.value, true) : prop.value,
      disabled: prop.disabled, // 是否禁用
      multiple: prop.multiple, // 是否可多选
      placeholder: prop.placeholder, // 占位符
      clearable: true, // 是否允许清空
      'allow-create': prop.allowCreate,
      filterable: prop.filterable,
      size: 'mini'
    },
    on: {
      input: (value) => {
        if (prop.format) {
          value = prop.format(value) || ''
        }
        changeFn({ value, prop })
      }
    },
    children
  }
})

// 按钮
Editors.register('button', (prop, changeFn) => {
  return {
    name: 'button',
    props: {
      size: 'mini',
      icon: prop.icon,
      type: prop.btnType,
      style: prop.style
    },
    on: {
      click: (e) => { prop.onClick && prop.onClick(e, changeFn) }
    },
    children: prop.buttonText || '设置'
  }
})

// 页面选择编辑器
Editors.register('page', (prop, changeFn) => {
  return {
    name: 'layout',
    props: {
      size: 'mini'
    },
    children: [{
      name: 'button',
      props: {
        type: prop.value.id ? 'text' : 'primary',
        size: 'mini'
      },
      children: prop.value.label || '设置',
      on: {
        click() {
          bus.$emit(EVENTS.SHOW_PAGE_SELECTOR, {
            callback(item) {
              changeFn({
                value: {
                  id: item.id,
                  label: item.labelName,
                  url: item.code
                },
                prop
              })
            },
            id: prop.value.id || ''
          })
        }
      }
    }
    ]
  }
})

// 页面选择编辑器
Editors.register('exportApi', (prop, changeFn) => {
  return {
    name: 'layout',
    props: {
      size: 'mini'
    },
    children: [{
      name: 'button',
      props: {
        type: prop.value ? 'text' : 'primary',
        size: 'mini'
      },
      children: prop.value || '设置',
      on: {
        click() {
          bus.$emit(EVENTS.SHOW_EXPORT_APIS, {
            callback(item) {
              changeFn({
                value: item,
                prop
              })
            }
          })
        }
      }
    }
    ]
  }
})
// 自定义编辑器
Editors.register('custom', (prop, changeFn) => {
  return prop.render(prop, changeFn)
})

// 校验规则编辑器
Editors.register('validator', (prop, changeFn) => {
  return {
    name: 'validator',
    props: {
      value: prop.value
    },
    on: {
      input: (value) => {
        changeFn({ value, prop })
      }
    }
  }
})

// 图标选择编辑器
Editors.register('icon', (prop, changeFn) => {
  return {
    name: 'icon-select',
    props: {
      value: prop.value,
      size: 'mini'
    },
    on: {
      input: (value) => {
        changeFn({ value, prop })
      }
    }
  }
})
// 表达式编辑器
Editors.register('expression', (prop, changeFn) => {
  return {
    name: 'expression-setting',
    props: {
      value: prop.value,
      expressType:prop.expressType,
      size: 'mini'
    },
    on: {
      input: (value) => {
        changeFn({ value, prop })
      }
    }
  }
})
// 国际化选择编辑器
Editors.register('i18n', (prop, changeFn) => {
  return {
    name: 'i18n-select',
    props: {
      value: prop.value
    },
    style: prop.style,
    on: {
      input: (value) => {
        changeFn({ value, prop })
      }
    }
  }
})

// 字段选择编辑器
Editors.register('field-select', (prop, changeFn) => {
  return {
    name: 'field-select',
    props: {
      value: prop.value,
      clearable: true,
      params: prop.params
    },
    on: {
      input: (value) => {
        changeFn({ value, prop })
      }
    }
  }
})

// 动作选择器
Editors.register('action-select', (prop, changeFn) => {
  return {
    name: 'action-select',
    props: {
      value: prop.value,
      params: prop.params
    },
    on: {
      input: (value) => {
        changeFn({ value, prop })
      }
    }
  }
})
export default Editors
