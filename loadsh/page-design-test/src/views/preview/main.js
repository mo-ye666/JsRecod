import Vue from 'vue'

import axios from 'axios'
import ELEMENT from 'element-ui'
import bus from '@/common/eventBus'
import constants from '@/common/constants'
import common from '@/utils/common'
import i18n from '@/render/src/utils/i18n'
import { loadScriptQueue } from '@/utils/loadScript'
import EffTable from 'purcotton-ui'
import 'purcotton-ui/dist/purcotton-ui.css'
import Components from '@/components/index'
import request from '@/utils/request'
Vue.use(EffTable)
Vue.use(Components)
Vue.use(ELEMENT, {
  size: constants.COMMON_SIZE,
  i18n: (key, value) => {
    return i18n.t(key, value)
  }
})
// Vue.component('p-tinymce', Tinymce)

Vue.prototype.$http = axios
Vue.prototype.$axios = request
Vue.prototype.$bus = bus
Vue.prototype.$common = common
Vue.prototype.$setDataByPath = common.setDataByPath

const $previewApp = document.getElementById('previewApp')

window.addEventListener('message', init, false)

function buildLinks(links) {
  let strs = ''
  links.forEach(url => {
    strs += `<link href="${url}" rel="stylesheet">`
  })
  return strs
}

function init(event) {
  console.time('loadScript')
  if (event.data.type === 'refreshFrame') {
    const code = event.data.data
    const attrs = ''
    let links = ''

    if (Array.isArray(code.links) && code.links.length > 0) {
      links = buildLinks(code.links)
    }

    $previewApp.innerHTML = `${links}<style>${code.css}</style><div id="app"></div>`

    if (Array.isArray(code.scripts) && code.scripts.length > 0) {
      loadScriptQueue(code.scripts, () => {
        console.timeEnd('loadScript')
        console.time('render')
        newVue(attrs, code.js, code.html)
      })
    } else {
      newVue(attrs, code.js, code.html)
    }
  }
}

function newVue(attrs, main, html) {
  // eslint-disable-next-line no-eval
  const code = 'return ' + `${main}`
  const func = new Function('urlParams', code)
  const params = common.getUrlParams()
  try {
    main = func(params)
  } catch (e) {
    console.error(e)
  }
  main.template = `<div class="flex-col flex-grow">${html}</div>`
  new Vue({
    i18n,
    components: {
      child: main
    },
    data() {
      return {
        params,
        visible: true
      }
    },
    template: `<child ${attrs} :params='params' />`
  }).$mount('#app')
}

async function loadStyle() {
  const link = document.createElement('link')
  link.type = 'text/css'
  link.rel = 'stylesheet'

  link.href = await getCss()

  const head = document.getElementsByTagName('head')[0]
  head.appendChild(link)
}
async function getCss() {
  const res = await axios.get(
    `/api/app-h5-compose/icon/css/`
  )
  console.log(res)
  return res.data.data.css
}
loadStyle()
