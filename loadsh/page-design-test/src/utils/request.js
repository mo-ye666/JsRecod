/**
 * @request 请求封装类 Axios
 * **/
import axios from 'axios'
import { Message } from 'element-ui'
const CancelToken = axios.CancelToken
const requestMap = []
/**
 * @http status状态码管理说明
 * @status 200 接口数据请求成功【正常流程】
 * @status 401 接口登录认证失败【登录认证、新用户注册】
 * @status 500 接口异常返回【根据code、message判断提示语，可能会根据页面功能不同返回】
 * @status 50X 服务器网关错误【给出友好提示语】
 *
 * @return 接口数据前端封装统一格式{ statusCode:XXX,data:XXX }
 * @statusCode http状态码
 * @data 接口返回数据
 * **/

// 自定义axios实例
const service = axios.create({
  withCredentials: false
})

// 添加请求拦截器
service.interceptors.request.use(
  (config) => {
    const { stopRepeat } = config.headers
    // 防重复提交
    if (stopRepeat) {
      let cancel = ''
      config.cancelToken = new CancelToken(function executor(c) {
        // executor 函数接收一个 cancel 函数作为参数
        cancel = c
      })
      stopRepeatRequest(config, cancel)
    }
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    return config
  },
  (error) => {
    console.error(error)
    return Promise.reject(error)
  }
)

// 添加响应拦截器
service.interceptors.response.use(
  (response) => {
    removeRequestMap(response.config)
    // console.info(response);
    /**
       * @data 响应数据
       * @status 响应的 HTTP 状态码
       * @statusText 响应的 HTTP 状态信息
       * @headers response响应头
       * @config request请求的配置信息
       * **/
    if (response.data.success === true) {
      const { status, data } = response
      return { statusCode: status, data }
    } else {
      Message({
        showClose: true,
        message: response.data.message,
        type: 'error'
      })
      return Promise.reject(response.data)
    }
  },
  (error) => {
    console.error(error)
    if (typeof error.message === 'object') {
      console.log('重复请求已阻止', error.message.requestDetail)
      return Promise.reject(error)
    }

    switch (error.response.status) {
      case 401:
        window.location.href = '/api/login/redirect?redirectUrl=' + window.location.href + '&redirect_uri=' + window.location.href
        break
      case 403:
        Message({
          showClose: true,
          message: '暂无查看权限，请联系管理员',
          type: 'error'
        })
        break
      case 404:
        Message({
          showClose: true,
          message: '路径不存在',
          type: 'error'
        })
        break

      default:
        Message({
          showClose: true,
          message: error.response.data.message,
          type: 'error'
        })
    }
    removeRequestMap(error.config)
    return Promise.reject(error)
  }
)

/**
 * 判断请求是否重复
 * @param request
 * @param type // request / response
 * @returns {number}
 */
const checkRepeatRequest = function(request, type) {
  const params = request.method === 'get' ? `${request.url}:${ObjectToString(request.params)}` : `${request.url}:${ObjectToString(request.data)}`
  const hasRequest = requestMap.findIndex(ele => {
    return ele && (ele.params === params)
  })
  if (hasRequest === -1 && type === 'request') {
    requestMap.push({
      params: params
    })
  }
  return hasRequest
}
/**
 * 阻止重复请求
 * @param newRequest
 * @param cancel
 */
const stopRepeatRequest = function(newRequest, cancel) {
  if (checkRepeatRequest(newRequest, 'request') === -1) {
    return false
  }
  cancel({ status: 'cancelRequest', requestDetail: newRequest })
  console.log('阻止请求', newRequest.url)
  // return Promise.resolve()
}
/**
 * 请求完成后，清除请求缓存map
 * @param request
 */
const removeRequestMap = function(request) {
  const index = checkRepeatRequest(request, 'response')
  if (index !== -1) requestMap.splice(index, 1)
}
/**
 * 对象转字符串
 * @return {string}
 */
const ObjectToString = function(ele) {
  if (!ele) return
  if (typeof ele === 'object') {
    return JSON.stringify(ele)
  }
  return ele.toString()
}
export default service
