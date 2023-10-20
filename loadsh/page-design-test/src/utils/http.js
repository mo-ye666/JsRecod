import axios from 'axios'
import qs from 'qs'
import * as utils from './util'
import vue from 'vue'
const message = vue.prototype.$message
axios.interceptors.request.use(
  config => {
    const TOKEN = utils.getCookie('access_token')
    TOKEN && (config.headers.token = TOKEN)
    const ENV = localStorage.getItem('CURRENT_ENV_CODE')
    ENV && (config.headers.env = ENV) &&
      (config.headers.userName = 'test')
    return config
  },
  error => {
    return Promise.error(error)
  }
)
axios.interceptors.response.use(
  response => {
    if (response.status === 200 && (response.data.code === 1 || response.data.code === 200 || response.data.code === 20000)) {
      return Promise.resolve(response)
    } else {
      message.error(response.data.message)
      return Promise.reject(response.data)
    }
  },
  error => {
    if (error.response.status) {
      switch (error.response.status) {
        case 401:
          message.error('登录信息过期')
          break
        case 404:
          message.error('路径不存在')
          break
        case 504:
          message.error('请求超时')
          break
        default:
          message.error(error.response.data.message)
      }
      return Promise.reject(error.response.data)
    }
  }
)
class Http {
  get(url, params) {
    return new Promise((resolve, reject) => {
      axios.get(url, { params }).then(res => {
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    })
  }
  post(url, params) {
    return new Promise((resolve, reject) => {
      axios.post(url, params).then(res => {
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    })
  }
  postform(url, params) {
    return new Promise((resolve, reject) => {
      axios.post(url, qs.stringify(params)).then(res => {
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    })
  }
  delete(url, params) {
    return new Promise((resolve, reject) => {
      axios.delete(url, { params }).then(res => {
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    })
  }
  request(url, params, headers) {
    return new Promise((resolve, reject) => {
      axios.request(url, { params, headers }).then(res => {
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    })
  }
}
const http = new Http()
export default http
