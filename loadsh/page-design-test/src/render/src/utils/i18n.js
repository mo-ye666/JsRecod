import Vue from 'vue'
import VueI18n from 'vue-i18n'
import axios from 'axios'
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import { getUrlParams } from '../../../utils/util'

Vue.use(VueI18n)
const messages = {
  'en': Object.assign({}, enLocale), // 将我们项目中的语言包与Element的语言包进行合并
  'zh': Object.assign({}, zhLocale)
}
messages['en-US'] = messages['en']
messages['zh-CN'] = messages['zh']

// 约定好各个应用当前语种的取值方式 => localStorage : languageCode
const lang = localStorage.getItem('languageCode') || 'zh'
const i18n = new VueI18n({
  locale: lang === 'zh' ? 'zh-CN' : 'en-US',
  messages,
  silentTranslationWarn: true
})

const i18nCache = {
  cache: true,
  loaded: false,
  i18n_data_key: 'i18n_zh_cache',
  i18n_version_key: 'i18n_zh_cache_version',
  i18nMap: {},
  setLang(lang) {
    if (lang) {
      this.lang = lang
      this.i18n_data_key = `i18n_${lang}_cache`
      this.i18n_version_key = `i18n_${lang}_cache_version`
    }
  },
  // 设置本地缓存
  setLocalData(i18nData, version) {
    localStorage.setItem(this.i18n_data_key, JSON.stringify(i18nData))
    localStorage.setItem(this.i18n_version_key, version)
    localStorage.setItem('design-center-code', getUrlParams('appCenterCode'))
  },
  // 获取当前缓存的国际化配置
  getLocalData() {
    const json = localStorage.getItem(this.i18n_data_key)
    if (json && json.length < 10) {
      localStorage.setItem(this.i18n_version_key, '')
    }
    return json ? JSON.parse(json) : null
  },
  // 获取本地缓存数据的版本(时间戳)
  getLocalVersion() {
    return localStorage.getItem(this.i18n_version_key) || 0
  },
  // 请求国际化配置数据
  request(params) {
    // localStorage.getItem('languageUrl') ||
    const url = '/api/h5-app/label/multilingualListByLang'
    return new Promise((resolve, reject) => {
      axios.get(url, { params }).then(res => {
        resolve(res.data)
      }).catch(err => {
        localStorage.setItem(this.i18n_version_key, '')
        reject(err)
      })
    })
  },

  initI18n() {
    if (!i18nCache.loaded) {
      if (localStorage.getItem('design-center-code') !== getUrlParams('appCenterCode')) {
        localStorage.setItem(this.i18n_data_key, '')
        localStorage.setItem(this.i18n_version_key, 0)
      }
      const localData = this.cache ? this.getLocalData() : null
      const version = localData ? this.getLocalVersion() : 0
      Object.assign(messages[lang], localData)
      const newVersion = Date.now()
      const urlParams = getUrlParams()
      const centerCode = urlParams.appCenterCode
      const centerVersion = urlParams.centerVersion
      this.request({ time: version, lang: lang, centerCode, centerVersion }).then(({ data }) => {
        data.forEach(option => {
          messages[lang][option.labelCode] = option.labelName
        })
        this.i18nMap = messages[lang]
        this.setLocalData(messages[lang], newVersion)
        this.loaded = true
      })
    }
  }
}
i18nCache.initI18n()
export default i18n
