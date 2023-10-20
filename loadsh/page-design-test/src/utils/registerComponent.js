import http from './http'
import service from '@/common/service'
import Vue from 'vue'
const url = '/api/outer/page/component?code='
export default function registerAsync(asyncComponents, appCode) {
  asyncComponents?.forEach(comp => {
    let code = comp.code
    window.$async_components = window.$async_components || {}
    //判断是否已经注册
    if(!window.$async_components[code]){
      Vue.component(`async-component-${code}`, function(resolve, reject) {
        service.queryComponentByCode(code).then(({data})=>{
          window.$async_components[code] = true
          resolve(getConfig(data), appCode)
        })
      })
    }

  })
}
function getConfig(data,appCode){
  const code = 'return ' + `${data.js}`
  const func = new Function('common', code)
  let config;
  try {
    config = func(window.appCommonCssJs[appCode].js)
  } catch (e) {
    console.error(e)
  }
  config.template = `<div class="flex-col flex-grow">${html}</div>`
  return config
}

function renderCss(cssCode) {
  let style = `<style>${cssCode}</style>`
  let ele = document.createElement('div')
  ele.innerHTML = style
  document.getElementsByTagName('head')[0].appendChild(ele.firstElementChild)
}