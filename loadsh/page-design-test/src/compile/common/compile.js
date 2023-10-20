import { type, wrapCss } from './util'
import { tagMap } from './config'
import compileData from './compileData'
import { compileEvents, compileInitApi , compileInitObjectModel} from './compileEvents'
import i18n from '@/render/src/utils/i18n'
import pretreatment from './pretreatment'
import { getValueByPath } from './util'

/**
 * vue代码编译器
 */
export default class BaseCompile {
   /**
    * 组件列表
    * @type {{}}
    * @private
    */
   _components = {}

   /**
    * 组件template 渲染入口
    * @param meta 组件元数据配置对象
    * @param ctx 渲染上下文参数
    * @returns {object}
    */
   compile(metadata, ctx = {}) {
     const meta = JSON.parse(JSON.stringify(metadata))
     // 上下文初始化
     ctx.vue$props = []
     ctx.vue$data = []
     ctx.vue$method = []
     ctx.vue$created = []
     ctx.vue$beforeDestroy = []
     ctx.vue$destroyed = []
     ctx.vue$watch = []
     ctx.vue$pageInit = []
     ctx.vue$pageActivated = []
     ctx.path = []
     ctx.pageMeta = meta
     ctx.cssCode = []
     // 优先执行html compile, compileHtml 内部会解析元数据,并分析JSCode
     const htmlCode = this.compileHtml(meta, ctx)
     return {
       js: this.compileScript(meta, ctx),
       css: wrapCss(meta.css, meta.id) + ctx.cssCode.join('\n'),
       html: htmlCode
     }
   }

   /**
    * 组件template 渲染入口
    * @param meta 组件元数据配置对象
    * @param ctx 渲染上下文参数
    * @returns {string}
    */
   compileHtml(meta, ctx = {}) {
     const { name, props, style } = meta
     let tagName = tagMap[name] || name || meta.tag
     if (typeof meta === 'string') {
       return i18n.t(meta)
     }
     if (!tagName) {
       return ''
     }
     // 编译前预处理,主要处理 元数据中的design属性中的配置项
     pretreatment(meta, ctx)
     // 预处理函数可能修改渲染组件名, 需要重新获取
     tagName = tagMap[meta.name] || tagName
     if (tagName === 'async-component') {
       tagName = `async-component-${meta.code}`
     }

     // 编译元数据红的design.initApi
     compileInitApi(meta, ctx)
     compileInitObjectModel(meta, ctx)
     if (ctx.path[ctx.path.length - 1] !== meta) {
       ctx.path.push(meta)
     }

     // 如果有children 则递归执行子组件解析,如果没有children元素,则走动态子元素解析逻辑
     let childHtml = meta.children ? this.compileChildren(meta.children, ctx) : this.compileDynamicChildren(meta, ctx)
     const slotsHtml = this.compileChildren(meta.slots, ctx)
     ctx.path.pop()
     if (!childHtml && meta.design && meta.design.template) {
       childHtml = meta.design.template
       meta.props.template_id = meta.uuid
     }
     // 检查元数据中是否有配置插槽名称, 如果有,则加上插槽名称
     const slotName = meta.slot ? `slot='${meta.slot}'` : ''
     // 根据元数据中的属性配置生成 vue属性字符串

     const propsHtml = this.compileProps(props, ctx).join('')
     const styleHtml = this.compileStyles(style, ctx).join(';')
     // 样式名称处理
     const cssNames = []
     for (const name in meta.class) {
       if (meta.class[name]) {
         cssNames.push(name)
       }
     }
     const css = cssNames.length ? `class='${cssNames.join(' ')}'` : ''
     const styles = styleHtml.length ? `style='${styleHtml}'` : ''
     // 获取数据模型绑定值 (需要进行处理)
     const vmodel = getModel(meta, ctx)
     // 处理循环指令
     let vfor = ''
     if (meta.design.vfor && meta.design.scope) {
       vfor = `v-for='(${meta.design.scope_alias || 'item'},index) in ${meta.design.scope}' :key='index'`
     }
     // 处理动态数据
     let data = ''
     if (meta.design.bindDataAttr && ((meta.design.dataType === 'api' && meta.design.initApi.apiUcode) )|| ((meta.design.dataType === 'objectModel' && meta.design.initApi.functionCode))) {
       data = `:${meta.design.bindDataAttr}='${meta.uuid || meta.pid}_api_data'`
     }
     // 处理ref
     const ref = meta.ref ? `ref='${meta.uuid || ctx.path[ctx.path.length - 1].uuid}'` : ''
     // 事件处理
     if (meta.events) {
       compileEvents(meta, ctx)
     }
     const events = meta.events ? this.compileEvents(meta.events, ctx) : ''

     const customAttr = meta.design.customAttr || ''
     const vifType = meta.design.vifType == 'vshow' ? 'v-show' : 'v-if'
     const vif = meta.design.vif ? `${vifType}='${meta.design.vif}'` : ""
     let html = `<${tagName} ${vfor}  ${vif} ${data}  ${vmodel} ${slotName} ${propsHtml} ${customAttr} ${css} ${ref} ${styles} ${events}>
      ${childHtml}
      ${slotsHtml}
      </${tagName}>`
     // 处理元素包裹
     if(meta.name === 'tinymce') {
        html = `<div ${css} ${styles}><${tagName} ${vfor}  ${vif} ${data}  ${vmodel} ${slotName} ${propsHtml} ${customAttr} ${css} ${ref} ${styles} ${events}>
        ${childHtml}
        ${slotsHtml}
        </${tagName}></div>`
     }
     return this.wrap(html, meta, ctx)
   }

   /**
    * 组件template 渲染入口
    * @param children 子集元数据
    * @param ctx 渲染上下文参数
    * @returns {string}
    */
   compileChildren(children, ctx) {
     if (children) {
       if (Array.isArray(children)) {
         return children.map(meta => {
           return meta ? this.compileHtml(meta, ctx) : ''
         }).join('')
       } else if (typeof children === 'object') {
         return this.compileHtml(children, ctx)
       } else if (typeof children === 'string') {
         return children
       }
     } else {
       return ''
     }
   }

   /**
    * 组件动态子元素渲染, 一些特殊组件(select radio-group checkbox-group)的子元素根据initApi生成,
    * 因此需要根据其配置动态编译成代码并返回
    * 该处依赖 compileInitApi方法中生成的bindDataName属性,因此需要在compileInitApi之后执行
    * @param meta 组件元数据
    * @param ctx 渲染上下文参数
    * @returns {string}
    */
   compileDynamicChildren(meta, ctx) {
     const dataName = getValueByPath(meta, 'design.initApi.bindDataName') || meta.design.dynamicOptions
     if (dataName && ['select', 'checkbox-group', 'radio-group', 'el-dropdown-menu', 'timeline'].includes(meta.name)) {
       // 静态数据转换处理
       const tagMap = ({
         'checkbox-group': meta.design.buttonStyle ? 'el-checkbox-button' : 'el-checkbox',
         'radio-group': meta.design.buttonStyle ? 'el-radio-button' : 'el-radio',
         'select': 'el-option',
         'el-dropdown-menu': 'el-dropdown-item',
         'timeline': 'el-timeline-item'
       })
       const tag = tagMap[meta.name]
       const label = `item.${meta.design.labelKey || 'label'}`
       const value = `item.${meta.design.valueKey || 'value'}`
       if (meta.name === 'select') {
         return `<${tag} v-for="(item,i) in ${dataName}" :key='${value}' :label='${label}' :value='${value}'></${tag}>`
       } else if (meta.name === 'el-dropdown-menu') {
         return `<${tag} v-for="(item,i) in ${dataName}" :key='i' command='${value}' > {{${label}}}</${tag}>`
       } else if (meta.name === 'timeline') {
         return `<${tag} v-for="(item,i) in ${dataName}" :key='i' :icon='item.icon'
        :type='item.type'
        :color='item.color'
        :size='item.size'
        placement="${meta.design.placement || 'bottom'}"
        :timestamp="item.${meta.design.valueKey || 'timestamp'}" > {{${label}}}</${tag}>`
       } else {
         return `<${tag} v-for="(item,i) in ${dataName}" :key='i' :label='${value}' > {{${label}}}</${tag}>`
       }
     }
     return ''
   }
   /**
    * 根据元数据中的Props生成组件 属性html
    * props : {name:'field1',title:'标题'} ==>
    * 转换成字符串数组 ["name='field1'", "title='标题'"]
    * @param props 属性配置对象
    * @param ctx 上下文对象
    * @returns {*}
    */
   compileProps(props, ctx) {
     const attrs = []
     props && Object.keys(props).forEach(name => {
       const val = props[name]
       const valType = type(val)
       if (valType !== 'null' && valType !== 'undefined' && val !== '') {
         if (valType === 'boolean' || valType === 'number') {
           attrs.push(`:${name}='${val}'`)
         } else if (valType === 'string') {
           attrs.push(`${name}='${val}'`)
         } else if (valType === 'object' || valType === 'array') {
           let json = JSON.stringify(val).replace(/"---\$---/g, '').replace(/---\$---"/g, '')
           if (name === 'rules') {
             json = json.replace(/\\\\/g, '\\')
           }
           attrs.push(`:${name}='${json}'`)
         }
       }
     })
     return attrs
   }

   /**
    * 根据元数据中的style 样式配置生成组件html style属性
    * @param props 属性配置对象
    * @param ctx 上下文对象
    * @returns {string}
    */
   compileStyles(props, ctx) {
     const attrs = []
     for (const name in props) {
       const val = props[name]
       if (val || val === 0) {
         attrs.push(`${name}:${val}`)
       }
     }
     return attrs
   }

   /**
    * 根据元数据中的events 配置的方法名称,绑定code方法
    * @param events 事件配置对象
    * @returns {string}
    */
   compileEvents(events, ctx) {
     const isInTable = ctx.path.some(item => item.name === 'table')
     const isInTree = ctx.path.some(item => item.name === 'tree')
     const isInGrid = ctx.path.some(item => item.name === 'grid')
     let param = ''

     if (isInTable) {
       param = '(scope.row, scope)'
     } else if (isInTree) {
       param = '(data)'
     } else if (isInGrid) {
       param = ctx.path.some(item => item.slot === 'toolbar' || item.slot === 'toolbarRightButtons') ? '' : '(scope.row, scope)'
     }
     return Object.keys(events).map(name => {
       const event = events[name]
       const native = event.native ? '.native' : ''
       if (event.params) {
         if (isInTable) {
           param = `(${event.params},scope.row, scope)`
         }
       }
       return event.bindMethodName ? `@${name}${native}='${event.bindMethodName}${param}'` : ''
     }).join(' ')
   }

   wrap(html, meta, ctx) {
     if (meta.design.tooltip) {
       const { tipLabel, tipPlacement, tipEffect } = meta.design
       return `<el-tooltip content="${tipLabel}" effect="${tipEffect}" placement="${tipPlacement}">${html}</el-tooltip>`
     } else {
       return html
     }
   }

   compileScript(meta, ctx = {}) {
     compileData(meta, ctx)
     ctx.vue$data.push('listeners:[]')
     ctx.vue$props = ctx.vue$props.filter(item => item.length > 0);
     return `export default {
      components: {},
      props:{
        ${meta.isComponent ? ctx.vue$props.join(',') : 'params:{type:Object,default(){return {}}}'}
      },
      data() {
        return {
          ${ctx.vue$data.join(',')}
        }
      },
      computed: {},
      watch: {
        ${ctx.vue$watch.join(',')}
      },
      created() {
        ${ctx.vue$created.join('\n')}
      },
      mounted() {
        this.init({isCtx:true})
      },
      methods: {
        async init(ctx = {}){
          ${ctx.vue$pageInit.join('\n')}
        },
        async pageActivated(ctx={}){
          ${ctx.vue$pageActivated.join(';')}
        },
        ${ctx.vue$method.join(',')}
      },
      beforeDestroy(ctx={}) {
        ${ctx.vue$beforeDestroy.join(';')}

      },
      activated(ctx={}){
        this.pageActivated({})
      },
      destroyed() {
        ${ctx.vue$destroyed.join(';')}

        this.listeners.forEach(item=>{
          this.$bus.$off(item.key,item.fn)
        });
      }
    }`
   }

   compileCss(meta, ctx = {}) {
     return ''
   }
  /**
   * 解析页面全部模型
   * @param meta
   * @param ctx
   */
   compileObjectModels(meta, ctx = {}){
      let models = []
      if(!meta.objectModels){return }
        meta.objectModels.map(model => {
          let functions = []
          let {functionList} = model
          let functionLabel = ''
          functionList.map(ele => {
            functionLabel = ele.functionLabel.replace(/_|-/g, '')
            // 根据模型功能定义请求方法，return promise
            let str = getAjaxMethodByType(ele.requestMethod, ele)
            functions.push(`${functionLabel} : ${str}`)
          })
          models.push(
            `${model.name} : {
                ${functions}
            }`
          )
        })
      return `export default {
        ${models.join(',')}
      }`
   }
}

/**
 * 根据请求类型返回请求方法
 */
function getAjaxMethodByType(type, api) {
  let str = ''
  if (type === 'get' || type === 'delete') {
    str = ` async function (config)   {
              console.info('model:' + '${api.path}')
              return  window.getApp().$axios.${api.requestMethod}('${api.path}', config)
            }`
  }
  else {
    str = ` async function (params , header)   {
              console.info('model:' + '${api.path}')
              return  window.getApp().$axios.${api.requestMethod}('${api.path}', params, header)
            }`
  }
  return  str
}
/**
 * 通过元数据与上下文对象分析并返回 dataModel
 * @param {Object} meta 当前组件元数据对象
 * @param {Object} ctx  编译上下文
 */
function getModel(meta, ctx) {
  // vmodel  vfor的作用域处理
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
  let val = ''
  if (meta.name === 'input') {
    if (meta.design.lazy) {
      val = '.lazy'
    }
    if (meta.design.trim) {
      val += '.trim'
    }
  }

  return modelVal ? `v-model${val}='${modelVal}'` : ''
}

/**
  * 单例基类
  * @type {BaseCompile}
  */
const compile = new BaseCompile()
export {
  compile
}
