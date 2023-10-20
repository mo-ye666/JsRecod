import http from '../utils/http'
import { getUrlParams } from '../utils/util'
export default {
  save(content) {
    return http.post('/api/h5-app/page/design/save', content)
  },

  queryPageById(pageId) {
    return http.get('/api/h5-app/page/design/detail', { pageId })
  },

  queryUserInfo() {
    return http.get('/api/user/ci/user/getUserInfo?develop=2')
  },
  createI18n(key, zhLabel, enLabel) {
    const param = {
      applicationCode: getUrlParams('appCenterCode'),
      applicationVersion: getUrlParams('centerVersion'),
      labelCode: key,
      labelName: zhLabel,
      languageList: [{ language: 'zh', labelName: zhLabel }]
    }
    if (enLabel) {
      param.languageList.push({ language: 'en', labelName: enLabel })
    }
    return http.post('/api/h5-app/label/create', param)
  },

  // 查询api列表
  queryApi(params) {
    return http.post(`/api/release/std/designer/market/api/list`, {
      centerCode: getUrlParams('appCenterCode'),
      version: getUrlParams('centerVersion'),
      ...params
    })
  },

  queryApiInfo(apiUcode) {
    return http.get(`/api/release/std/designer/api/market/subscribe/get`, {
      ucode: apiUcode,
      centerCode: getUrlParams('appCenterCode'),
      version: getUrlParams('centerVersion')
    })
  },

  queryPageList(params) {
    let {name} = params
    let param ={
      name: name,
      appCode: getUrlParams('appCenterCode'),
      version: getUrlParams('centerVersion')
    }
    return http.get('/api/h5-app/catalogue/tree', param)
  },

  queryPageInfo(id) {
    return http.get('/api/h5-app/page/detail?id=' + id)
  },

  async getCssPath() {
    // const res = await this.$http.get(
    //   `/api/app-h5-compose/icon/css/`
    // )
    // return res.data.css
    return '//at.alicdn.com/t/font_2316694_rbhfiji8a3.css'
  },

  queryExportApi(params) {
    return http.post('/api/h5-app/file/up/down/template/query', params)
  },

  saveCommonRes(js, css) {
    return http.post('/api/h5-app/app/style/save', {
      appCode: getUrlParams('appCenterCode'),
      version: getUrlParams('centerVersion'),
      js, css
    })
  },

  queryCommonRes(params) {
    return http.get('/api/h5-app/app/style/find', {
      appCode: getUrlParams('appCenterCode'),
      version: getUrlParams('centerVersion')
    })
  },
  // 打开组件设计需要使用
  queryComponentById(id) {
    return http.get('/api/h5-app/dynamic/component/design/detail', {
      id
    })
  },
  // 使用组件,查询组件详情使用
  queryComponentByCode(code) {
    return http.get('/api/h5-app/dynamic/component/design/detail', {
      code,
      version: getUrlParams('centerVersion')
    })
  },
  queryComponentList() {
    return http.post('/api/h5-app/dynamic/component/query/list', {
      appCode: getUrlParams('appCenterCode'),
      version: getUrlParams('centerVersion')
    })
  },
  saveComponent(data) {
    return http.post('/api/h5-app/dynamic/component/save/design', data)
  },

  publishComponent(data) {
    return http.post('/api/h5-app/dynamic/component/submit/design', data)
  },

  // 查询模板页面模型
  queryTempModels(modelCode) {
    return http.get('/api/h5-app/dynamic/component/design/detail', {
      centerCode: getUrlParams('appCenterCode'),
      version: getUrlParams('centerVersion'),
      modelCode
    })
  },
  // 获取模板详情
  queryTempModelsDetail(modelCode) {
    return http.get('/api/designer/engine/model/function/activeListGroupByCategory', {
      centerCode: getUrlParams('appCenterCode'),
      version: getUrlParams('centerVersion'),
      modelCode
    })
  },
  // 获取模板方法详情 
  queryModelFuncDetail(params) {
    return http.get('/api/designer/engine/model/function/exposed', {
      centerCode: getUrlParams('appCenterCode'),
      version: getUrlParams('centerVersion'),
      ...params
    })
  },
  // 查询当前中心下所有模型
  queryModelList(params) {
    return http.get('/api/designer/engine/model/function/exposed/group/list', {
      centerCode: getUrlParams('appCenterCode'),
      version: getUrlParams('centerVersion'),
      ...params
    })
  },

  // 查询所有页面数据
  queryPageListById(pageId) {
    return http.get('/api/h5-app/page/model/design/list', { pageId })
  },
  // 获取请求对象属性数据
  getReqSxData: data => http.get('/api/release/std/designer/request/details/list', data),
  // 获取响应对象属性数据
  getRespSxData: data => http.get('/api/release/std/designer/response/details/list', data),
}

