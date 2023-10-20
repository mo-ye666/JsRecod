import i18n from '@/render/src/utils/i18n'
import { treeEach, getParent } from './util'
import componentsPretreatment from '../comps/index'

/**
  * 元数据预处理函数,将元数据对象解析成vue render可识别的属性
  * 加你个元数据对象design下面的配置项目 解析到 vue 可识别的 props attrs style 等对象中
  * @param {Object} meta 组件元数据配置对象
  * @param {Object} ctx 解析器上下文配置对象
  * @param {String} type  解析模式 [runtime, design] , 默认为运行时解析,  当值未design时,是设计器的解析模式,设计器中可以忽略许多配置解析
  */
export default function pretreatment(meta, ctx, type = 'runtime') {
  ctx.isRuntime = type === 'runtime'
  meta.class = meta.class || {}
  meta.design = meta.design || {}
  meta.props = meta.props || {}

  // 如果配置了span属性,则将span 解析成 样式 [span-1] 的类名,添加到class中
  if (meta.design.span) {
    meta.class[`span-${meta.design.span}`] = true
  }
  if (meta.isPageRoot) {
    meta.class[meta.id] = true
  }
  if (isStrVal(meta.design.class)) {
    meta.class[meta.design.class] = true
  }
  if (meta.uuid) {
    meta.class[meta.uuid] = true
  }
  // 如果配置了自定义类名属性
  if (meta.customClass) {
    let customClassList = meta.customClass.split(',');
    customClassList.forEach(classItem => {
      if(classItem) {
        meta.class[classItem] = true
      }
    })
  }

  if (meta.design.perm) {
    if (type === 'runtime') {
      meta.props['v-permission'] = ctx.pageMeta.isComponent ? `perms["${meta.uuid}"]` : `"${meta.design.permId}"`
      meta.directives = [{ name: 'permission', value: meta.design.permId }]
    }
  }
  // if (meta.design.cls) {
  //   cssCodeConvert(meta.design.cls, meta, ctx)
  // }
  const layout = meta.design.layout
  if (isStrVal(layout)) {
    meta.class[layout === 'col' ? 'flex-col' : 'flex-row'] = true
  }
  // 如果配置了slotText,则将slotText 放入 childdren中

  if (meta.design.slotText) {
    if (ctx.path && ctx.path[ctx.path.length - 1]?.name === 'grid') {
      meta.children = ctx.isRuntime ? `---$---this.$t('${meta.design.slotText}')---$---` : i18n.t(meta.design.slotText)
    } else {
      meta.children = ctx.isRuntime ? `{{$t("${meta.design.slotText}")}}` : i18n.t(meta.design.slotText)
    }
  }
  // 如果配置了disabled
  if (meta.design.disabled) {
    if (typeof meta.design.disabled === 'boolean') {
      meta.props.disabled = meta.design.disabled
    } else {
      meta.props[':disabled'] = meta.design.disabled
    }
  }
  // 如果配置class
  let classList = meta.design.classList
  if (classList) {
    if (typeof classList === 'string') {
      classList = classList.split(',')
    }
    classList.forEach(name => {
      meta.class[name] = true
    })
  }

  // 处理选项数据信息
  optionsConvert(meta, ctx)
  // 判断是否是运行时编译,如果是,执行运行时comple的独有解析逻辑
  if (type === 'runtime') {
    runtime(meta, ctx)
  } else {
    // 如果有其他插槽元素,则将插槽放入children
    if (meta.slots && meta.slots.length) {
      meta.children = meta.children || []
      if (Array.isArray(meta.children)) {
        meta.children.push(...meta.slots)
      } else {
        meta.children = [meta.children, ...meta.slots]
      }
    }
  }
  // 其他组件各自的代码编译预处理程序
  componentsPretreatment(meta, ctx, type, pretreatment)
  // 处理国际化配置信息meta,'
  i18nConvert(meta, ctx)
  // 布局处理 (flex栅格 与 标准栅格)
  layoutConvert(meta, ctx, type)
}
/**
 * 运行时compile的独有解析逻辑
 * @param {*} meta 组件配置对象
 * @param {*} ctx  解析上下文对象
 */
function runtime(meta, ctx) {
  // 代码已移植到comps/组件名
}

/**
 * 识别组件属性中的国际化信息,转换成当前语种对应文本
 * @param {Object} meta 当前组件元数据对象
 * @param {Object} ctx  编译上下文
 */
function i18nConvert(meta, ctx) {
  // 设计时 国际化转换处理
  if (meta.props) {
    if (meta.props.title) {
      meta.props.title = i18n.t(meta.props.title)
    }
    if (meta.props.label) {
      meta.props.label = i18n.t(meta.props.label)
    }
    if (meta.props['active-text']) {
      if (ctx.isRuntime) {
        meta.props[':active-text'] = `$t("${meta.props['active-text']}")`
        delete meta.props['active-text']
      } else {
        meta.props['active-text'] = i18n.t(meta.props['active-text'])
      }
    }
    if (meta.props['inactive-text']) {
      if (ctx.isRuntime) {
        meta.props[':inactive-text'] = `$t("${meta.props['inactive-text']}")`
        delete meta.props['inactive-text']
      } else {
        meta.props['inactive-text'] = i18n.t(meta.props['inactive-text'])
      }
    }
    if (meta.props.placeholder) {
      if (ctx.isRuntime) {
        if (ctx.path[ctx.path.length - 1].name === 'grid') {
          meta.props[':placeholder'] = `$t('${meta.props.placeholder}')`
        } else {
          meta.props[':placeholder'] = `$t("${meta.props.placeholder}")`
        }
      } else {
        meta.props.placeholder = i18n.t(meta.props.placeholder)
      }
    }
  }
  if (typeof meta.children === 'string') {
    meta.children = i18n.t(meta.children)
  }
}

function isStrVal(val) {
  return typeof val === 'string' && val
}

/**
 * options 转换,用于组件:checkbox-group radio-group select等
 * @param {Object} meta 当前组件元数据对象
 * @param {Object} ctx  编译上下文
 */
function optionsConvert(meta, ctx) {
  // 静态数据转换处理
  const tagMap = ({
    'checkbox-group': meta.design.buttonStyle ? 'checkbox-button' : 'checkbox',
    'radio-group': meta.design.buttonStyle ? 'radio-button' : 'radio',
    'select': 'el-option'
  })
  const childTag = tagMap[meta.name]
  if (meta.design.dataType === 'static' && meta.design.options) {
    const datatype = findFieldDataType(ctx, meta.design.vmodel)
    if(ctx.isRuntime) {
      if(getParent(meta.uuid)._name_ && getParent(meta.uuid)._name_ === 'grid-column') {
        meta.options = meta.children = meta.design.options.map(opt => {
          const val = datatype === 'Integer' ? opt.value * 1 : opt.value
          return {
              label: meta.name === 'select' ? i18n.t(opt.label) : val,
              value: meta.name === 'select' ? val : ''
            }
        })
      } else {
        meta.children = meta.design.options.map(opt => {
          const val = datatype === 'Integer' ? opt.value * 1 : opt.value
          return {
            name: childTag,
            props: {
              label: meta.name === 'select' ? i18n.t(opt.label) : val,
              value: meta.name === 'select' ? val : ''
            },
            design: {},
            children: meta.name === 'select' ? null : i18n.t(opt.label)
          }
        })
      }
    } else {
      meta.children = meta.design.options.map(opt => {
        const val = datatype === 'Integer' ? opt.value * 1 : opt.value
        return {
          name: childTag,
          props: {
            label: meta.name === 'select' ? i18n.t(opt.label) : val,
            value: meta.name === 'select' ? val : ''
          },
          design: {},
          children: meta.name === 'select' ? null : i18n.t(opt.label)
        }
      })
    }
  }
}

function findFieldDataType(ctx, fieldId = '') {
  if (!ctx.pageMeta) {
    return
  }
  const model = ctx.pageMeta.models.find(m => m.id === fieldId.split('.')[0])
  let dataType = 'String'
  if (model) {
    treeEach(model.fields, (item) => {
      if (item.id === fieldId) {
        dataType = item.dataType
      }
    }, 'fields')
  }
  return dataType
}

function layoutConvert(meta, ctx, type) {
  if (meta.name === 'layout' || meta.name === 'form') {
    if (meta.design.mode === 'span') {
      meta.name = 'row'
      meta.class['flex-row'] = false
      meta.class['flex-col'] = false
      meta.style = {}
    }
  }
}
