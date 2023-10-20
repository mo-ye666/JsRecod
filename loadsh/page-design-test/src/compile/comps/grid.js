import { treeEach, setValueByPath, getValueByPath } from '../common/util'
import { compileEvents, compileInitApi } from '../common/compileEvents'
import i18n from '@/render/src/utils/i18n'

/**
  * grid 元数据预处理函数,将元数据对象解析成vue render可识别的属性
  * 加你个元数据对象design下面的配置项目 解析到 vue 可识别的 props attrs style 等对象中
  * @param {Object} meta 组件元数据配置对象
  * @param {Object} ctx 解析器上下文配置对象
  * @param {String} type  解析模式 [runtime, design] , 默认为运行时解析,  当值未design时,是设计器的解析模式,设计器中可以忽略许多配置解析
  */
export default function pretreatment(meta, ctx, type = 'runtime', pretreatmentFn) {
  // 处理列配置
  const columns = meta.columns
  ctx.path && ctx.path.push(meta)
  // if (meta.design.showExpand) {
  //   meta.props.expandConfig = { expandAll: true, defaultExpandeds: [] }
  // }
  treeEach(columns, col => {
    col.title = i18n.t(col.label) || col.props
    if (col.config && col.config.name) {
      compileToMeta({ meta: col.config, ctx, type, pretreatmentFn })
      delete col.config.design
    }
    if(col.requiredType && col.required) {
      col.required = `---$---this.${col.required}---$---`
    }
    if (col.rules) {
      col.rules = ruleConvert(col.rules, col.required, col.requiredType, true)
    }
    if (col.cellRender) {
      col.cellRender = `---$---this.${col.cellRender}---$---`
    }
    if (col.editRender) {
      col.edit.render = `---$---this.${col.editRender}---$---`
    }
    if (col.config && col.config.hoverTips) {
      col.config.hoverTips = `---$---this.${col.config.hoverTips}---$---`
    }
    if (col.titleRender) {
      col.titleRender = `---$---this.${col.titleRender}---$---`
    }
    if (col.edit?.disabled) {
      col.edit.disabled = `---$---this.${col.edit.disabled}---$---`
    }
    if(col.config && col.config.name === 'date-picker') {
      col.config.props.type = col.config.props.type ? col.config.props.type : "date"
    }
    if(col.config && col.config.name === 'text') {
      col.config.children = ""
    }
    // 删除在运行时无效的属性,这些属性会生成无效代码
    delete col.label
    delete col.design
  })

  const preColumns = []
  if (meta.design.showSelection) {
    preColumns.push({
      show: true,
      title: '',
      type: meta.design.multiple ? 'selection' : 'radio',
      isCheckCol: true,
      width: 36,
      align: "center",
      headerAlign: "center",
      fixed: 'left'
    })
  }
  if (meta.design.showIndex) {
    preColumns.push({
      show: true,
      type: 'index',
      title: '序号',
      isIndexCol: true,
      width: 40,
      align: "center",
      headerAlign: "center",
      fixed: 'left'
    })
  }

  if (meta.design.showExpand) {
    preColumns.push({
      show: true,
      title: '',
      type: 'expand',
      width: 50,
      align: "center",
      headerAlign: "center",
      fixed: 'left'
    })
  }
  columns.splice(0, 0, ...preColumns)
  if (type === 'runtime') {
    const columnCode = JSON.stringify(columns).replace(/"---\$---/g, '').replace(/---\$---"/g, '').replace(/\\\\/g, '\\')
    ctx.vue$data.push(`${meta.uuid}_columns:null`)
    ctx.vue$created.push(`this.${meta.uuid}_columns = ${columnCode}`)
    meta.design.vmodel = `${meta.uuid}_columns`
  } else {
    meta.props.columns = columns
  }

  // 处理工具按钮
  if (meta.design.buttons) {
    if(type === 'runtime') {
      // meta.props['toolbar-config'].buttons = meta.props['toolbar-config'].buttons.map(btn => {
      //   return compileToolBarDefaultBtn(btn)
      // })
      // console.log(meta.props['toolbar-config'].buttons,"-------------")
      meta.props['toolbar-config'].buttons = meta.props['toolbar-config'].buttons.map(btn => {
        if(btn.code === 'save') {
          btn.props.canSave = btn.props.canSave ? `---$---this.${btn.props.canSave}---$---` : `---$---() => { return true }---$---`
        }
        return compileToolBarDefaultBtn(btn)
      })
      let buttonsCode = JSON.stringify(meta.props['toolbar-config']).replace(/"---\$---/g, '').replace(/---\$---"/g, '').replace(/\\\\/g, '\\')
      ctx.vue$data.push(`${meta.uuid}_toolbarConfig:[]`)
      ctx.vue$created.push(`this.${meta.uuid}_toolbarConfig = ${buttonsCode}`)
      meta.props[':toolbar-config'] = `${meta.uuid}_toolbarConfig`
      delete meta.props['toolbar-config']
    }
  }

  // 处理请求代理
  if (type === 'runtime') {
    const initApi = meta.design.initApi
    if (initApi?.apiUcode) {
      setValueByPath(meta, 'design.proxyConfig.request.query', `---$---this.${meta.uuid}_init---$---`)
      if (initApi.isSeniorQuery) {
        const api = ctx.pageMeta.apis.find(item => item.apiUcode === initApi.apiUcode)
        meta.props[':seniorQueryConfig'] = `${meta.uuid}_seniorConfig`
        const conf = {
          fieldList: api.seniorQuery
        }
        ctx.vue$data.push(`${meta.uuid}_seniorConfig: ${JSON.stringify(conf)}`)
      }
    }
    if (meta.events.delete_click) {
      setValueByPath(meta, 'design.proxyConfig.request.delete', `---$---this.${meta.uuid}_delete_click---$---`)
    }
    if (meta.events.save_click) {
      setValueByPath(meta, 'design.proxyConfig.request.save', `---$---this.${meta.uuid}_save_click---$---`)
    }
    if (meta.design.showTreeConfig) {
      meta.props[':tree-config'] = `{children:"${meta.design.treeConfigChildenKey || "children"}"}`
    }
    meta.props[':proxyConfig'] = `${meta.uuid}_proxyConfig`
    ctx.vue$data.push(`${meta.uuid}_proxyConfig: ${JSON.stringify(meta.design.proxyConfig).replace(/"---\$---/g, '').replace(/---\$---"/g, '')}`)
  }
}

/**
 *
 * @param {Array} rules 校验规则
 * @param {Boolean} isRequired 是否必填,
 * @param {Boolean} useThis 是否需要使用This,
 */
function ruleConvert(rules, isRequired, requiredType, useThis) {
  let newRules = []
  if(requiredType && isRequired) {
    newRules = [{
      required: `${isRequired}`
    }]
  }
  if(!requiredType && isRequired) {
    newRules = [{ required: true }]
  }
  rules.forEach(rule => {
    if (rule.type === 0 && rule.pattern) {
      newRules.push({
        pattern: `---$---${rule.pattern}---$---`,
        message: rule.message
      })
    } else if (rule.type === 1 && rule.func) {
      newRules.push({
        validator: useThis ? `---$---this.${rule.func}---$---` : `---$---${rule.func}---$---`
      })
    }
  })
  return newRules
}

function bindDynamicData(meta, ctx) {
  const dataName = getValueByPath(meta, 'design.initApi.bindDataName') || meta.design.dynamicOptions
  if (dataName && ['select', 'checkbox-group', 'radio-group'].includes(meta.name)) {
    meta.options = `---$---()=> this.${dataName}---$---`
  }
  meta.props.labelKey = meta.design.labelKey
  meta.props.valueKey = meta.design.valueKey
  if (meta.name === 'cascader' && meta.props[':options']) {
    meta.options = `---$---()=> this.${meta.props[':options']}---$---`
    delete meta.props[':options']
  }
  return ''
}

function compileToMeta({ meta, ctx, type, pretreatmentFn }) {
  treeEach([meta], (item) => {
    pretreatmentFn(item, ctx, type)
    if (type === 'runtime') {
      // 编译元数据中的的design.initApi
      compileInitApi(item, ctx)
      bindDynamicData(item, ctx)
      if (item.events) {
        compileEvents(item, ctx)
        Object.keys(item.events).forEach(name => {
          const event = item.events[name]
          item.on = item.on || {}
          item.on[name] = `---$---this.${event.bindMethodName}---$---`
        })
        delete item.events
      }
      Object.keys(item.props).forEach(name => {
        if (name.indexOf(':') === 0 || name.indexOf('@') === 0) {
          const propVal = item.props[name]
          item.props[name.substr(1)] = `---$---this.${propVal}---$---`
          delete item.props[name]
        }
      })
    }
  })
}

function compileToolBarDefaultBtn(btn) {
  // 如果配置class
  if(btn.design) {
    let { classList, perm, permId, disabled} = btn.design
    if (classList) {
      if (typeof classList === 'string') {
        classList = classList.replaceAll(',', ' ')
      }
      btn.class = classList
    }
    if(perm) {
      btn.directives = [{
        name: "permission",
        value: permId
      }]
    }
    // 如果配置了disabled
    if (disabled) {
      btn.disabled = `---$---()=> {return ${disabled}}---$---`
      // btn.disabled = () => {
      //   return `---$---${disabled}---$---`
      // }
      // btn.disabled = () => { return disabled }
    }

  }
  delete btn.design
  delete btn._name_
  return btn
}
