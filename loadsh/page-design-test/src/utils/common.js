/**
 * @function 打开弹窗事件
 * @param {Object} params path页面路径，dialogTitle弹窗标题，dialogWidth弹窗宽度，eventBusOptions回调事件event bus
 * @param {Object} templateEventBusOptions name 事件名 / __pageId__ 当前页面id / __sort__当前组件序号 可选
 * **/
function openDialog(params = {}) {}

/**
 * @function 关闭弹窗事件
 * @注意 需要通过call、apply 传入当前this
 * **/
function closeDialog() {}

/**
 * @function 关闭当前页面
 * @param {String} pageId 页面id 可选
 * **/
function closeTagsView(...pageId) {}

/**
 * @function 模板eventBus调用
 * @注意 需要通过call、apply 传入当前this
 * **/
function templateEventBus() {}
function isNumberStr(str) {
  return /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g.test(str)
}
function StrToNumber(str) { return /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g.test(str) ? +str : str }
/**
 * 根据路径改变obj值
 * @param obj
 * @param val
 * @param path
 */
function setValueByPath(obj, path, val) {
  let tempObj = obj
  path = path.replace(/\[(\w+)\]/g, '.$1')
  path = path.replace(/^\./, '')
  const keyArr = path.split('.')
  let i = 0
  for (let len = keyArr.length; i < len; ++i) {
    const isLast = i > len - 2
    const key = keyArr[i]
    if (isLast) {
      tempObj[key] = val
    } else {
      if (!tempObj[key] || typeof tempObj[key] !== 'object') {
        tempObj[key] = isNaN(key) ? {} : []
      }
      tempObj = tempObj[key]
    }
  }
}
/**
 * 根据路径增加vue实例中data变量
 * @param obj
 * @param val
 * @param path
 */
export function setDataByPath(obj, path, val) {
  let tempObj = obj
  path = path.replace(/\[(\w+)\]/g, '.$1')
  path = path.replace(/^\./, '')
  const keyArr = path.split('.')
  let i = 0
  for (let len = keyArr.length; i < len; ++i) {
    const isLast = i > len - 2
    const key = keyArr[i]
    if (isLast) {
      this.$set(tempObj, key, val)
    } else {
      if (!tempObj[key] || typeof tempObj[key] !== 'object') {
        this.$set(tempObj, key, isNaN(key) ? {} : [])
      }
      tempObj = tempObj[key]
    }
  }
}
/**
 * @function 根据id获取项目全局参数
 * @param {String} id 参数id
 * **/
function getGlobalParamById(id) {

}/**
 * @function 根据id获取页面初始化参数
 * @param {String} id 参数id
 * **/
function getQueryParamByPageId(id) {

}

function getQueryParamByPageIdAndId({ pageId, id }) {

}

function saveQueryParam() {}

function getArrayById(id, params, type) {
  type = type || ','
  if (params && !(params instanceof Array)) {
    params = [params]
  }
  return params.map(ele => ele[id]).join(type)
}
/**
 * 根据数据类型转换值
 * @param val
 * @param datatype
 * @returns {string}
 */
function getValByType(val, datatype) {
  if (datatype === 'object' || datatype === 'array') {
    val = JSON.parse(val)
  }
  if (datatype === 'number') {
    val = isNumberStr(val) ? StrToNumber(val) : 0
  }
  if (datatype === 'bool') {
    val = val !== '' && val !== 'false' && val !== null && val !== undefined
  }
  return val
}
/**
 *
 * @param {*} name
 */
function getUrlParams(name) {
  const startIndex = window.location.href.indexOf('?')
  // eslint-disable-next-line no-unused-vars
  let param = window.location.href.substr(startIndex + 1)
  const paramsObj = {}
  param = param.split('&').map(item => {
    const arr = item.split('=')
    paramsObj[arr[0]] = arr[1]
  })
  return name ? paramsObj[name] : paramsObj
}
export default {
  openDialog,
  closeDialog,
  closeTagsView,
  templateEventBus,
  StrToNumber,
  isNumberStr,
  getGlobalParamById,
  getQueryParamByPageId,
  getQueryParamByPageIdAndId,
  setValueByPath,
  setDataByPath,
  getValByType,
  getArrayById,
  getUrlParams,
  saveQueryParam
}
