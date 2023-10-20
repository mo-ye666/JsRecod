import Vue from 'vue'

import { compile } from './common/compile'
import i18n from '@/render/src/utils/i18n'
import registerAsync from '@/render/src/utils/asyncComp'
const exportDefault = 'export default '
/**
 * @function vue实例化-页面渲染引擎
 * @param {Object} options 页面渲染数据
 * @param {Object} params 页面传递参数 pageId/version/query/permission
 * **/
export default function render(options, params) {
  this.formData = {
    dom: document.body,
    type: 'json',
    pageType: 'file',
    components: {},
    html: '',
    js: '',
    css: ''
  }
  this.formData = Object.assign(this.formData, options)
  this.detailUrl = params.detailUrl

  this.init = async() => {
    let ret = {}
    let models = {}
    let appCode = params.appCode
    if (this.formData.type === 'json') {
      ret = compile.compile(this.formData.json)
      models = compile.compileObjectModels(this.formData.json)
      ret.js = ret.js.replace(exportDefault, '')
      // 处理css
      window.newCenterPageStyle = window.newCenterPageStyle || {}
      if (!window.newCenterPageStyle[params.pageId]) {
        window.newCenterPageStyle[params.pageId] = true
        const style = `<style>${ret.css}</style>`
        const ele = document.createElement('div')
        ele.innerHTML = style
        document.getElementsByTagName('head')[0].appendChild(ele.firstElementChild)
      }
    }
    registerAsync(this.formData.json.asyncCompList || [],appCode, window.appCommonCssJs[appCode].js, models)
    const vm = newVue.call(this, ret.js, ret.html, appCode ,models)
    return vm
  }
  return this.init()

  function buildDialog(html) {
    const { dialogTitle, dialogWidth } = options
    const title = `$t('${dialogTitle}')`
    const { pageId } = params
    localStorage.removeItem('TEMP_PAGE_ID')
    return `
      <p-dialog :title="${title}" width='${dialogWidth}' :modal="false" :visible='__QUERY_STATIC__.dialogVisible' :close-on-click-modal='false' @close='__QUERY_STATIC__.dialogVisible=false;$common.closeDialogCallback("${pageId}");$nextTick(v => pageDestory && pageDestory())'>
        ${html}
      </p-dialog>
    `
  }
  function newVue(main, html, appCode , models) {
    const code = 'return ' + `${main}`
    const func = new Function('urlParams', 'common', 'models', code)
    try {
      main = func({}, window.appCommonCssJs[appCode].js, models)
    } catch (e) {
      console.error(e)
    }
    if (options.dom && options.isDialog) {
      main.template = buildDialog(html)
    } else {
      main.template = `<div class="flex-col flex-grow">${html}</div>`
    }

    if (!main.methods.pageDestory) {
      main.methods.pageDestory = () => {}
    }

    // 请求参数
    let pageId = ''
    let version = ''
    let query = {}
    let queryStatic = {}
    let permission = []
    let title = ''
    try {
      if (params) {
        title = params.title
        version = params.version
        pageId = params.pageId
        query = params.query || {}
        queryStatic = params.queryStatic || {}
        permission = params.permission || []

        // 弹框
        if (options.dom && options.isDialog) {
          queryStatic.dialogVisible = true
        }

        // 初始化属性
        main.props = {
          __TITLE__: {
            type: String,
            default: title
          },
          __VERSION__: {
            type: String,
            default: version
          },
          __PAGEID__: {
            type: String,
            default: pageId
          },
          __QUERY__: {
            type: Object,
            default: function() {
              return query || {}
            }
          },
          params: {
            type: Object,
            default: function() {
              return query || {}
            }
          },
          __QUERY_STATIC__: {
            type: Object,
            default: function() {
              return queryStatic
            }
          },
          __PERMISSION__: {
            type: Array,
            default: function() {
              return permission
            }
          }
        }
      }
    } catch (err) {
      console.error(err)
    }

    const instance = {
      i18n: i18n,
      components: {
        child: main
      },
      data() {
        return {
          __TITLE__: title, // 页面标题
          __VERSION__: version, // 页面版本
          __PAGEID__: pageId, // 页面id
          __QUERY__: query, // 页面参数
          params: query,
          __QUERY_STATIC__: queryStatic, // 页面静态参数
          __PERMISSION__: permission // 权限
        }
      },
      template: `<div><child /></div>`
    }

    if (this.formData.renderComponent) {
      Vue.component('component-' + pageId, instance)
      return 'component-' + pageId
    } else {
      return new Vue(instance).$mount(this.formData.dom)
    }
  }
}

