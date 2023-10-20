import uploadProcessor from './upload'
import gridProcessor from './grid'
import tableProcessor from './table'
import formItemProcessor from './formItem'
import { setValueByPath } from '../common/util'
const preprocessor = {
  'grid': gridProcessor,
  'upload-img': uploadProcessor,
  'upload-file': uploadProcessor,
  'upload-file-new': uploadProcessor,
  'v-table': (meta, ctx, type) => {
    if (type === 'runtime') {
      if (meta.props.hasPagination) {
        ctx.vue$data.push(`${meta.uuid}_pagination: {pageSize:${meta.design.pageSize || 10},pageNum:1,total:0}`)
        meta.props[':pagination.sync'] = `${meta.uuid}_pagination`
      }
      if (meta.props.dynamicSearch) {
        meta.props[':searchModel'] = meta.design.paramModel
      }
    }
  },
  'table': tableProcessor,
  'tree': treeProcessor,
  'dropdown': (meta, ctx, type) => {
    if (meta.design.initApi && type === 'runtime') {
      meta.slots[0].design.initApi = meta.design.initApi
      meta.slots[0].design.labelKey = meta.design.labelKey
      meta.slots[0].design.valueKey = meta.design.valueKey
      meta.slots[0].pid = meta.uuid
      delete meta.design.initApi
    }
  },
  'text': (meta, ctx, type) => {
    if (meta.design.vmodel) {
      if (type === 'runtime') {
        let modelVal = meta.design.vmodel
        if (modelVal) {
          const scopes = []
          ctx.path.forEach(item => {
            if (item.design.scope) {
              scopes.push({ name: item.design.scope, alias: item.design.scope_alias })
            }
          })
          scopes.reverse().some(scope => {
            if (modelVal.startsWith(scope.name)) {
              modelVal = `${scope.alias}${modelVal.substr(scope.name.length)}`
              return true
            }
          })
        }
        meta.children = `{{${modelVal}}}`
      } else {
        meta.children = `{{${meta.design.vmodel}}}`
      }
    }
  },
  'form': (meta) => {
    meta.props['focus-stop'] = true
  },
  'steps': (meta, ctx, type) => {
    if (type === 'runtime') {
      if (meta.props[':active']) {
        ctx.vue$created.push(`
          this.${meta.props[':active']} = ${meta.design.activeStep} || 1
        `)
      } else {
        meta.props.active = meta.design.activeStep || 1
      }
    }
  },
  'switch': (meta, ctx, type) => {
    if (type === 'runtime' && meta.design.singleText && meta.props['active-text']) {
      meta.props[':active-text'] = `${meta.design.vmodel} == "${meta.props['active-value']}" ? i18n.t("${meta.props['active-text']}") : i18n.t("${meta.props['inactive-text']}")`
      delete meta.props['active-text']
      delete meta.props['inactive-text']
    }
  },
  'form-item': formItemProcessor,
  'async-component': (meta, ctx, type) => {
    if (type === 'runtime') {
      const perms = {}
      meta.design.permissions.forEach(p => {
        if (p.join) {
          perms[p.id] = p.permId
        }
      })
      meta.props.perms = perms
    }
  },
  'date-picker': (meta, ctx, type) => {
    if (type === 'runtime') {
      let createFn = false
      if (meta.design.firstDayOfWeek) {
        setValueByPath(meta.props, 'picker-options.firstDayOfWeek', parseInt(meta.design.firstDayOfWeek))
      }
      if (meta.design.disabledAreaType === 'beforeToday') {
        createFn = true
        ctx.vue$method.push(`${meta.uuid}_disabledDate(date){ return date.getTime() <= Date.now()- 1000 * 3600 * 24 }`)
      } else if (meta.design.disabledAreaType === 'afterToday') {
        createFn = true
        ctx.vue$method.push(`${meta.uuid}_disabledDate(date){ return date.getTime() >= Date.now() }`)
      } else if (meta.design.disabledAreaType === 'customArea') {
        if (meta.design.disAreaVal && meta.design.disAreaValType) {
          createFn = true
          if (meta.design.disAreaValType === 'before') {
            ctx.vue$method.push(`${meta.uuid}_disabledDate(date){ return date.getTime() < (Date.now() - 1000 * 3600 * 24 * (${meta.design.disAreaVal}+1)) }`)
          } else {
            ctx.vue$method.push(`${meta.uuid}_disabledDate(date){ return date.getTime() > (Date.now() + 1000 * 3600 * 24 * ${meta.design.disAreaVal}) }`)
          }
        }
      } else if (meta.design.disabledAreaType === 'customFn') {
        setValueByPath(meta.props, 'picker-options.disabledDate', `---$---${meta.design.disabledDateFn}---$---`)
      }
      if (createFn) {
        setValueByPath(meta.props, 'picker-options.disabledDate', `---$---${meta.uuid}_disabledDate---$---`)
      }
    }
  },
  'cascader':(meta, ctx, type) => {
    if (type === 'runtime') {
      if (meta.props.props.lazy && meta.props.props.lazyLoad) {
        meta.props.props.lazyLoad = `---\$---${meta.props.props.lazyLoad}---\$---`
      }
    }
  }
}

export default function componentsPretreatment(meta, ctx, type = 'runtime', fn) {
  if (preprocessor[meta.name]) {
    preprocessor[meta.name](meta, ctx, type, fn)
  }
}

var treeProcessor = function(meta, ctx, type) {
  if (type === 'runtime') {
    // 显示loading
    if (meta.design.dataType === 'api') {
      meta.props['v-loading'] = `${meta.uuid}_loading`
      ctx.vue$data.push(`${meta.uuid}_loading:false`)
    }
    // 记忆节点
    const keyField = meta.props['node-key']
    if (meta.design['remember-expand'] && keyField) {
      meta.props['@node-expand'] = `${meta.uuid}_expand`
      meta.props['@node-collapse'] = `${meta.uuid}_collapse`
      meta.props[':default-expanded-keys'] = `${meta.uuid}_expanded_keys`
      ctx.vue$data.push(`${meta.uuid}_expanded_keys:[]`)
      ctx.vue$method.push(`
    ${meta.uuid}_expand(data){
      if(!this.${meta.uuid}_expanded_keys.includes(data.${keyField})){
        this.${meta.uuid}_expanded_keys.push(data.${keyField})
      }
    }
    `)
      ctx.vue$method.push(`
    ${meta.uuid}_collapse(data){
        this.${meta.uuid}_expanded_keys.some((item, i) => {
          if (item === data.${meta.props['node-key']}) {
              this.${meta.uuid}_expanded_keys.splice(i, 1)
          }
      })
    }
    `)
    }
  }
}
