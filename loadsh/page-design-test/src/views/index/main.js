import Vue from 'vue'

import ELEMENT from 'element-ui'
import bus from '@/common/eventBus'
import { getUrlParams, uuid } from '@/utils/util'
import http from '@/utils/http'
import i18n from '@/render/src/utils/i18n'
import '@/design'
import design from '@/directives/designDrag'
import EffTable from 'purcotton-ui'
import Components from '@/components/index'
import 'purcotton-ui/dist/purcotton-ui.css'
import '@/icons'
import App from './App.vue'
// 热键插件
import '@/plugins/hotkey'
// 撤销重做插件
// import '@/plugins/undo'
Vue.use(ELEMENT)
Vue.use(EffTable, {
  renderMap: {
    'text': 'v-text',
    'inputNumber': 'el-inputNumber',
    'time-picker': 'el-time-picker',
    'time-select': 'el-time-select',
    'radio-button': 'el-radio-button',
    'checkbox-button': 'el-checkbox-button',
    'cascader': 'el-cascader',
    'tree': 'el-tree',
    'icon': 'v-icon',
    'table': 'el-table',
    'table-column': 'el-table-column',
    'template': 'layout',
    'v-template': 'layout',
    'tabs': 'el-tabs',
    'tab-pane': 'el-tab-pane',
    'steps': 'v-steps',
    'grid': 'eff-table',
    'dropdown': 'el-dropdown',
    'el-dropdown-item': 'el-dropdown-item',
    'timeline': 'el-timeline',
    'timeline-item': 'el-timeline-item',
    'tinymce': 'p-tinymce',
    'divider': 'el-divider',
    'image': 'el-image',
    'row': 'el-row',
    'col': 'el-col',
    'div': 'div',
    'span': 'span',
    'chart': 'v-chart',
    'upload-img': 'p-upload-img',
    'upload-file': 'p-upload-file',
    'upload-file-new': 'p-upload-file-new',
    'transfer': 'el-transfer',
    'v-chart': 'v-chart',
    'color-picker': 'el-color-picker'
  }
})
Vue.use(Components)
Vue.config.productionTip = false
Vue.prototype.uuid = uuid

Vue.prototype.$http = http // 当前项目使用
Vue.prototype.$bus = bus
Vue.prototype.$lowCode = true
Vue.prototype.$getQueryString = getUrlParams

// Vue.prototype.$iconfont = Iconfont
// Vue.prototype.$dataSource = DataSource
// Vue.prototype.$pageSource = PageSource
// Vue.prototype.$upDownSource = UpDownSource
// Vue.prototype.$i18nSetting = I18nSetting
const directives = [design]
directives.forEach(directive => {
  Vue.directive(directive.name, directive)
})
Vue.directive('permission', {})

localStorage.setItem('languageUrl', '/api/app-h5-compose/label/multilingualListByLang')
const vue = new Vue({
  i18n,
  render: h => h(App)
}).$mount('#app')
/**
 * 暴露vue对象
 * @returns {Vue | CombinedVueInstance<Vue, object, object, object, Record<never, any>>}
 */
window.getApp = function() {
  return vue
}
window._fields4api_ = {}
