/*
 *获取对象某路径下属性值
*/
const getValueByPath = function(obj, path) {
  let tempObj = obj
  path = path.replace(/\[(\w+)\]/g, '.$1')
  path = path.replace(/^\./, '')
  const keyArr = path.split('.')
  let i = 0
  for (let len = keyArr.length; i < len - 1; ++i) {
    const key = keyArr[i]
    if (key in tempObj) {
      tempObj = tempObj[key]
    } else {
      return undefined
    }
  }
  return tempObj ? tempObj[keyArr[i]] : undefined
}

/*
 *在指定对象的某属性插入值
*/
const setValueByPath = function(obj, path, val) {
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
 * 获取随机字符
 * @return {number}
 */
function getRandomInt() {
  const num = Math.random() * 100000
  return Math.floor(num)
}

/**
 * 按指定长度生成随机字符串uuid
 * @param {长度} len
 */
function uuid(len = 8) {
  // ABCDEFGHIJKLMNOPQRSTUVWXYZ
  var chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('')
  var uuid = []; var i
  const radix = chars.length
  for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]
  return uuid.join('')
}

/**
 * 返回入参的数据类型
 *  @param {any} obj
 */
function type(obj) {
  var toString = Object.prototype.toString
  var map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object'
  }
  return map[toString.call(obj)]
}

/**
 * cookie
 * @param {*} name
 */
function getCookie(name) {
  var arr
  var reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
  if ((arr = document.cookie.match(reg))) return unescape(arr[2])
  else return null
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

/**
 * 根据路径增加vue实例中data变量
 * @param obj
 * @param val
 * @param path
 */
function setDataByPath(obj, path, val) {
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
 * 根据路径删除对象的属性
 * @param obj
 * @param val
 * @param path
 */
function delAttrByPath(obj, path) {
  let tempObj = obj
  path = path.replace(/\[(\w+)\]/g, '.$1')
  path = path.replace(/^\./, '')
  const keyArr = path.split('.')
  let i = 0
  for (let len = keyArr.length; i < len; ++i) {
    const isLast = i > len - 2
    const key = keyArr[i]
    if (isLast) {
      delete tempObj[key]
    } else {
      if (!tempObj[key] || typeof tempObj[key] !== 'object') {
        tempObj[key] = isNaN(key) ? {} : []
      }
      tempObj = tempObj[key]
    }
  }
}
// 下划转驼峰
function camelCase(str) {
  return str.replace(/-[a-z]/g, str1 => str1.substr(-1).toUpperCase())
}

// 对象转数组
function options(obj) {
  if (type(obj) === 'object') {
    return Object.keys(obj).map((key) => {
      return {
        value: key,
        label: obj[key]
      }
    })
  }
  return []
}

function getComponentId(el, designMode) {
  let uuid = el.getAttribute('uuid')
  const mapping = el.getAttribute('mapping') ? [el.getAttribute('mapping')] : []
  if (!uuid) {
    let parent = el.parentElement
    while (parent) {
      uuid = parent.getAttribute('uuid')
      const mappingPath = parent.getAttribute('mapping')
      if (mappingPath) {
        mapping.push(mappingPath)
      }
      if (uuid) {
        break
      }
      parent = parent.parentElement
    }
  }
  return designMode ? { uuid, mapping: mapping.reverse().join('.') } : uuid
}

function getComponentId2(el) {
  let uuid = el.getAttribute('uuid')
  let mapping = el.getAttribute('mapping')
  if (!uuid || mapping) {
    let parent = el.parentElement
    while (parent) {
      uuid = parent.getAttribute('uuid')
      mapping = parent.getAttribute('mapping')
      if (uuid && !mapping) {
        break
      }
      parent = parent.parentElement
    }
  }
  return uuid
}

function clone(any) {
  if (type(any) === 'object') { // 拷贝对象
    const o = {}
    for (const key in any) {
      o[key] = clone(any[key])
    }
    return o
  } else if (type(any) === 'array') { // 拷贝数组
    var arr = []
    for (let i = 0, leng = any.length; i < leng; i++) {
      arr[i] = clone(any[i])
    }
    return arr
  } else if (type(any) === 'function') { // 拷贝函数
    return any
  } else if (type(any) === 'date') { // 拷贝日期
    return new Date(any.valueOf())
  } else if (type(any) === 'regExp') { // 拷贝正则
    return new RegExp(any)
  }
  return any
}

//判断是否为对象
function isObject(obj) {
  let type = Object.prototype.toString.call(obj);
  if (type === '[object Object]') {
    return true;
  }
}
/**
 * 根据路径删除对象的属性
 * @param func 是要去抖的函数
 * @param wait 需要延迟执行的时间
 * @param options.leading 是否在超时前调用
 * @param options.maxWait 函数延迟调用的最大时间
 * @param options.trailing 是否在超时后调用
*/
function debounce(func, wait, options = {}) {
  //声明参数
  let lastArgs,//上次调用参数
    lastThis,//上次调用this
    maxWait,//最大等待时间
    result,//返回结果
    timerId,
    lastCallTime;//上次调用debounced时间，即出发时间，不一定会调用func

  //参数初始化let
  let lastInvokeTime = 0;//上次调用func时间，即成功执行时间
  let leading = false;//是否在超时之前调用
  let maxing = false;//是否传入最大超时时间
  let trailing = true;//是否超时之后调用
  if (typeof func !== 'function') {
    throw new TypeError('debounce的第一个参数类型为funtion')
  }
  wait = +wait || 0; //+wait 作用就是转变wait的数据类型，变成Number类型 传入的执行时间间隔
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = options.maxWait;
    maxWait = options.maxWait ? Math.max(Number(options.maxWait) || 0, wait) : maxWait;
    trailing = !!options.trailing || trailing;
  }
  function invokeFunc(time) {//调用function 参数为当前时间
    let args = lastArgs;
    let thisArg = lastThis;
    lastArgs = lastThis = undefined;
    lastInvokeTime = time;//将上次调用时间重置为当前时间
    result = func.apply(thisArg, args);//执行传入
    return result
  }
  function leadingEdge(time) {//超时之前调用
    lastInvokeTime = time;
    timerId = setTimeout(timerExpired, wait);//开始timer 为trailing Edge触发函数调用设定定时器 如果leading为 true 后续执行条件不满足就不会执行func
    return leading ? invokeFunc(time) : result;
  }
  function remainingWait(time) {//设置还需要等待的时间
    const timeSinceLastCall = time - lastCallTime,//距离上次debounced函数被调用的时间
      timeSinceLastInvoke = time - lastInvokeTime,//距离上次func函数被执行的时间
      result = wait - timeSinceLastCall;//还需要等待的时间 计算出下一次trailing的位置
    //maxing就是options.maxWait  两种情况
    // 设置了maxing 比较下一次maxing和下一次trailing的最小值，作为下一次函数要执行的时间
    //无max 在下一次trailing时执行 timerExpired
    return maxing ? Math.min(result, maxWait - timeSinceLastInvoke) : result
  }

  //根据时间判断func能否被执行
  function shouldInvoke(time) {//是否应该被调用
    const timeSinceLastCall = time - lastCallTime,//距离上次触发时间的时间
      timeSinceLastInvoke = time - lastInvokeTime;//距离上次调用func的时间
    return (lastCallTime === undefined //从未执行过也就是首次调用
      || (timeSinceLastCall >= wait) //距离上次被调用的时间超过了wait的时间
      || (timeSinceLastCall < 0)//系统时间倒退？？
      || (maxing && timeSinceLastInvoke >= maxWait))//超过最大等待时间
  }

  function timerExpired() {  //定时器的回调函数 用来判断是否执行func
    const time = Date.now();
    //在 options.trailing  edge且时间符合条件时候 调用trailingEdge函数，否则重启定时器
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    //重启定时器 保证下一次时延的末尾触发
    timerId = setTimeout(timerExpired, remainingWait(time))
  }
  function trailingEdge(time) {//超时之后被调用 trailing = true;options里声明的变量默认为 true
    timerId = undefined;
    //有lastArgs才执行，意味着只有func已经被debounced过一次以后才会在trailing edge执行
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }
  function cancle() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }
  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now())
  }
  function debounced(...args) {
    const time = Date.now(),//获取到当前的时间
    isInvoking = shouldInvoke(time);//判断是否可以调用
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;//Date.now()
    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancle;
  debounced.flush = flush;
  return debounced;
}

function dateToDiffText(dateTimeStamp) {
  var minute = 1000 * 60
  var hour = minute * 60
  var day = hour * 24
  var month = day * 30
  var now = new Date().getTime()
  var diffValue = now - dateTimeStamp
  if (diffValue < 0) { return }
  var monthC = diffValue / month
  var weekC = diffValue / (7 * day)
  var dayC = diffValue / day
  var hourC = diffValue / hour
  var minC = diffValue / minute
  let result
  if (monthC >= 1) {
    result = '' + parseInt(monthC) + '月前'
  } else if (weekC >= 1) {
    result = '' + parseInt(weekC) + '周前'
  } else if (dayC >= 1) {
    result = '' + parseInt(dayC) + '天前'
  } else if (hourC >= 1) {
    result = '' + parseInt(hourC) + '小时前'
  } else if (minC >= 1) {
    result = '' + parseInt(minC) + '分钟前'
  } else { result = '刚刚' }
  return result
}

function getOffset(target) {
  var top = 0
  var left = 0
  while (target.offsetParent) {
    top += target.offsetTop
    left += target.offsetLeft
    target = target.offsetParent
  }
  return {
    top: top,
    left: left
  }
}

function treeEach(list, fn, childKey = 'children') {
  list.forEach((child) => {
    fn(child)
    if (Array.isArray(child[childKey])) {
      treeEach(child[childKey], fn)
    }
  })
}

function getRowIndex(node) {
  let rowindex
  let el = node
  while (el) {
    rowindex = el.getAttribute('rowindex')
    if (rowindex) {
      break
    } else {
      el = el.parentElement
    }
  }
  return rowindex
}

function copyText(text) {
  var input = document.createElement('textarea')
  document.body.appendChild(input)
  // 将文本赋值给输入框
  input.value = text
  // 聚焦并选中
  input.focus()
  input.select()

  // document.queryCommandEnabled()方法返回一个布尔值，表示当前是否可用document.execCommand()的某个命令。
  // 比如copy命令只有存在文本选中时才可用，如果没有选中文本，就不可用。
  // 执行 copy 命令
  document.execCommand('copy')
  // 移除输入框节点
  input.remove()
}
// 过滤特殊字符
const filterCharts = (str) => {
  let newStr = str.replace(/[`~!@#$^&*()=|{}':;',\\\[\]\.<>\/?~%-_+！@#￥……&*（）——|{}【】'；：""'。，、？\s]/g,'');
  return newStr;
}
/**
 * 处理重复的名称
 * @param {string} name // 名字
 * @param {object} hasObj // 已有名称集合
 */
const handleRepeatName = (name, hasObj) => {
  var newName = name;
  let reg = /(\d+)$/g;
  if(hasObj[newName]) {
    for(let key in hasObj) {
      if(key === name) {
        let findRes = reg.exec(key);
        if(findRes) {
          newName = key.slice(0, findRes.index) + (Number(findRes[1]) + 1)
        } else {
          newName = handleRepeatName(name + 1, hasObj)
        }
      }
    }
  }
  return newName;
}
export {
  getValueByPath,
  setValueByPath,
  delAttrByPath,
  getRandomInt,
  uuid,
  type,
  getCookie,
  getUrlParams,
  setDataByPath,
  camelCase,
  options,
  getComponentId,
  getComponentId2,
  clone,
  dateToDiffText,
  getOffset,
  treeEach,
  getRowIndex,
  copyText,
  debounce,
  handleRepeatName,
  filterCharts
}
