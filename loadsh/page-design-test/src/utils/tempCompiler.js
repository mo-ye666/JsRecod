let oldModelFuncList = []; // 旧的模型方法记录下来，用于全局替换functionCode
let oldModels = [] // 旧的对象
let idMap = {} // 组件的id集合
const getNewMetadata = (objectModels, tempConf, tempData) => {
  oldModelFuncList = []
  oldModels = []
  idMap = {}
  recordOldModelFunc(tempData)
  let newMetadata = JSON.parse(JSON.stringify(tempData)) // 当前模板数据
  updateIdStore(newMetadata);
  newMetadata.objectModels = handleObjectModels(objectModels, tempData);
  newMetadata.models = handleModel(objectModels, tempData);
  handleFields(tempConf, newMetadata);
  delete newMetadata.tempConf
  newMetadata = handleAllModelFunc(newMetadata)
  newMetadata = handleAllModels(newMetadata)
  return newMetadata
}

// 处理模型
function handleObjectModels(objectModels) {
  let hasModelName = {} 
  let newArr = objectModels.map(model => {
    let hasFuncName = {}
    let hasFuncLabel = {}
    let name = model.modelName || model.name;
    name = handleName(name, hasModelName)
    hasModelName[name] = true;
    let obj = {
      modelCode: model.modelCode,
      name: name,
      functionList: model.functionList.map(func => {
        let funcName = handleName(func.functionName, hasFuncName);
        func.functionLabel = filterCharts(func.functionLabel);
        let funcLabel = handleName(func.functionLabel, hasFuncLabel);
        hasFuncName[funcName] = true;
        hasFuncLabel[funcLabel] = true;
        func.functionName = funcName;
        func.functionLabel = funcLabel;
        return getModelFunc(func, model.modelCode)
      })
    }
    return obj;
  })
  return newArr;
}


// 处理对象
function handleModel(objectModels, metadata) {
  let models = metadata.models.reduce((result, item) => {
    let obj = item;
    let customFields = obj.fields.filter(item => item.custom);
    objectModels.forEach(model => {
      model.functionList.forEach(func => {
        if (obj.apiType === func.apiType) {
          if (!obj.isModelFunc) {
            obj.isModelFunc = true
          }
          oldModels.push({
            oldModelName:obj.name,
            newModelName:func.functionLabel
          })
          obj.apiUcode = func.functionCode;
          if (obj.type === 'request') {
            obj.fields = func.request.map(col => {
              return columnToField(col, obj.id)
            })
            obj.fields.push(...customFields)
          } else if (obj.type === 'response') {
            obj.fields = func.response.map(col => {
              return columnToField(col, obj.id)
            })
            obj.fields.push(...customFields)
          }
        }
      })
    })
    result.push(obj)
    return result
  }, [])
  return models;
}

// 处理页面内容
function handleFields(tempConf, tempData) {
  tempConf.forEach(component => {
    let oldComponent = getComponentById(component.id, tempData);
    if (oldComponent.name === 'form') {
      oldComponent.children = handleFormFields(component.model, component.fields)
    } else if (oldComponent.name === 'v-table') {
      // 如果是普通表格，初始表格列和数据源
      if(!component.modelField) {
        oldComponent.design.columnSourceObjectModel = component.model.split('_')[0];
        oldComponent.children.design.initApi = {
          functionCode: component.model.split('_')[0],
          params: []
        }
      }
      oldComponent.children.columns = handleTableColumn(oldComponent.children.columns, component.fields)
      
    } else if (oldComponent.name === 'grid') {
      // 如果是动态表格，初始表格列和数据源
      if(!component.modelField) {
        oldComponent.design.columnSourceObjectModel = component.model.split('_')[0];
        oldComponent.design.initApi = {
          functionCode: component.model.split('_')[0],
          params: []
        }
      } 
      oldComponent.columns = handleTableColumn(oldComponent.columns, component.fields)
    }
  })
}

// 处理表单
function handleFormFields(model, fields) {
  let inputNum = idMap['input'];
  let fieldArr = [];
  fields.forEach((field, index) => {
    if (field.checked !== false) {
      // 初始化form-item
      const meta = {
        uuid: `form_item_${index + 1}`,
        name: 'form-item',
        props: {
          prop: '',
          title: '标签名'
        },
        design: {
          fieldType: 'input',
          span: 12
        },
        class: {},
        style: {},
        id: uuid(16)
      }
      meta.props.prop = `${model}.${field.paramName}`
      meta.props.title = field.paramDesc
      meta.design.fieldType = 'input'
      // 初始化form-item下的输入框
      const child = {
        uuid: `input_${inputNum + index + 1}`,
        name: 'input',
        props: {
          size: 'small',
          placeholder: `请输入${field.paramDesc}`
        },
        design: {},
        class: {},
        style: {},
        slots: [],
        unaided: true,
        id: uuid(16)
      }
      child.unaided = false
      child.design.mapping = 'children'
      child.design.vmodel = `${model}.${field.paramName}`
      meta.children = child
      fieldArr.push(meta);
    }
  })

  return fieldArr
}

// 处理表格
function handleTableColumn(columns, fields) {
  let newColumns = columns.filter(item => item.custom);
  fields.forEach(item => {
    if (item.checked !== false) {
      let obj = {
        checked: true,
        dataType: item.paramType,
        id: item.paramName,
        inputRequired: 0,
        label: item.paramDesc,
        prop: item.paramName,
        render: "",
        show: true,
        _name_: "table-column"
      }
      newColumns.unshift(obj)
    }
  })
  return newColumns;
}

/**
 * 替换全局模型方法
 * @param {string} metadata 页面元数据
 */
function handleAllModelFunc(metadata) {
  let metadataStr = JSON.stringify(metadata);
  oldModelFuncList.forEach(item => {
    let str1 = `\"functionCode\":\"${item.oldFuncCode}\"`
    let str2 = `\"columnSourceObjectModel\":\"${item.oldFuncCode}\"`
    let str3 = `\"columnSourceObjectModelCode\":\"${item.oldModelCode}\"`
    let str4 = `\"initApiModelCode\":\"${item.oldModelCode}\"`
    if (metadataStr.indexOf(str1) > -1) {
      // 替换表格数据源模型功能编码
      metadataStr = metadataStr.replace(new RegExp(str1, 'gm'), `\"functionCode\":\"${item.newFuncCode}\"`)
    } 
    if(metadataStr.indexOf(str2) > -1) {
      // 替换表格列配置模型功能编码
      metadataStr = metadataStr.replace(new RegExp(str2, 'gm'), `\"columnSourceObjectModel\":\"${item.newFuncCode}\"`)
    }
    if(metadataStr.indexOf(str3) > -1) {
      // 替换表格列配置模型编码
      metadataStr = metadataStr.replace(new RegExp(str3, 'gm'), `\"columnSourceObjectModelCode\":\"${item.newModelCode}\"`)
    }
    if (metadataStr.indexOf(str4) > -1) {
      // 替换表格数据源模型编码
      metadataStr = metadataStr.replace(new RegExp(str4, 'gm'), `\"initApiModelCode\":\"${item.newModelCode}\"`)
    } 
  })
  return metadataStr
}
/**
 * 替换全局对象
 * @param {string} metadata 页面元数据
 */
function handleAllModels(metadata) {
  let metadataStr = metadata;
  oldModels.forEach(item => {
    let nameArr = item.oldModelName.split('_')
    let newName = item.newModelName + '_' + nameArr[nameArr.length - 1];
    if (metadataStr.indexOf(item.oldModelName) > -1) {
      // 替换表格数据源模型编码
      metadataStr = metadataStr.replace(new RegExp(item.oldModelName, 'gm'), newName)
    }
  })
  return metadataStr
}

// 记录旧的模型方法
function recordOldModelFunc(tempData) {

  tempData.objectModels.forEach(model => {
    model.functionList.forEach(func => {
      let obj = {
        oldFuncCode: func.functionCode,
        apiType: func.type,
        oldModelCode: model.modelCode,
        newFuncCode: '',
        newModelCode:''
      }
      oldModelFuncList.push(obj)
    })
  })
}
/**
 * 获取模型方法
 * @param {object} inComingFunc 方法数据
 */
function getModelFunc(inComingFunc, modelCode) {
  const resType = ['', 'Object', 'Array', 'Page', 'void', 'basic']
  const methodType = ['post', 'get', 'put', 'delete']
  const reqType = ['basic', 'object', 'object_list', 'single_basic_list', 'empty']
  let modelFunc = {
    desc: inComingFunc.functionName,
    name: inComingFunc.functionName,
    requestMethod: methodType[inComingFunc.requestType],
    requestType: reqType[inComingFunc.requestParamType],
    responseType: resType[inComingFunc.responseType],
    type: inComingFunc.apiType,
    functionCode: inComingFunc.functionCode,
    path: inComingFunc.path,
    functionCategory: inComingFunc.apiType,
    functionLabel: inComingFunc.functionLabel
  }
  // if (inComingFunc.requestType.toLowerCase() === 'object') {
  //   modelFunc.requestFields = inComingFunc.request;
  // }

  // if (inComingFunc.responseType.toLowerCase() === 'object') {
  //   modelFunc.responseFields = inComingFunc.response;
  // }
  // 保存旧的模型方法code
  oldModelFuncList.map(item => {
    if (item.apiType=== inComingFunc.apiType) {
      item.newModelCode = modelCode
      item.newFuncCode = inComingFunc.functionCode
    }
  })

  return modelFunc
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
const handleName = (name, hasObj) => {
  var newName = name;
  let reg = /(\d+)$/g;
  if(hasObj[newName]) {
    for(let key in hasObj) {
      if(key === name) {
        let findRes = reg.exec(key);
        if(findRes) {
          newName = key.slice(0, findRes.index) + (Number(findRes[1]) + 1)
        } else {
          newName = handleName(name + 1, hasObj)
        }
        
      }
    }
  }
  return newName;
}

/**
 * 根据组件uuid 获取组件元数据对象
 * @param {string} id
 * @returns component 元数据
 */
const getComponentById = (id, meta) => {
  const comps = []
  compEach([meta], (comp) => {
    if (comp.uuid === id) {
      comps.push(comp)
    }
  })
  if (comps.length > 1) {
    console.error('元数据中存在重复UUID的组件:', comps)
  }
  return comps[0]
}

/**
 * 遍历组件
 * @param {Array} list 元数据
 * @returns {function} fn 回调函数
 */
const compEach = (list, fn) => {
  list.forEach((child) => {
    fn(child)
    if (Array.isArray(child.children)) {
      compEach(child.children, fn)
    } else if (type(child.children) === 'object') {
      compEach([child.children], fn)
    }
    if (Array.isArray(child.slots)) {
      compEach(child.slots, fn)
    }
    if (Array.isArray(child.columns)) {
      if (child.name === 'grid') {
        treeEach(child.columns, col => {
          if (col.config && col.config.uuid) {
            compEach([col.config], fn)
          }
        })
      } else {
        compEach(child.columns, fn)
      }
    }
  })
}
/**
 * 返回入参的数据类型
 *  @param {any} obj
 */
const type = (obj) => {
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

function treeEach(list, fn, childKey = 'children') {
  list.forEach((child) => {
    fn(child)
    if (Array.isArray(child[childKey])) {
      treeEach(child[childKey], fn)
    }
  })
}

/**
 * 按指定长度生成随机字符串uuid
 * @param {长度} len
 */
function uuid(len = 8) {
  // ABCDEFGHIJKLMNOPQRSTUVWXYZ
  var chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('')
  var uuid = [];
  var i
  const radix = chars.length
  for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]
  return uuid.join('')
}
/**
 * 生成对象字段
 * @param {Object} col 字段
 * @param {String} parentId 父级id
 */
function columnToField(col, parentId) {
  const id = parentId ? `${parentId}.${col.paramName}` : col.paramName
  const field = {
    id: id,
    name: col.paramName,
    label: col.paramDesc || col.paramName,
    dataType: col.paramType,
    inputRequired: col.inputRequired
  }
  if (col.nodeList && col.nodeList.length) {
    field.children = col.nodeList.map(col => {
      return columnToField(col, id)
    })
  }
  return field
}

/**
 * 代码模式修改元数据后需要刷新uuid生成器序列号
 * 通过遍历当前元数据对象,获取到当前所有uuid,并将最大值设置到上下文对象的uuid生成器中,避免出现uuid重复
 */
function updateIdStore(meta) {
  compEach(meta.children, (item) => {
    if (item.uuid) {
      context.uuid(item.name, parseInt(item.uuid.split('_').pop()) - 1)
    }
  })
  if (!meta.events.pageActivated) {
    meta.events.pageActivated = {
      id: 'PageActivated',
      label: '页面激活',
      children: []
    }
  }
}


/**
 * 整个页面设计器的全局上下文对象, 用于数据缓存
 */
const context = {

  components: {},

  uuid(compName, preIndex) {
    if (!compName) {
      return uuid()
    } else {
      compName = compName.replace(/-/g, '_')
      if (preIndex) {
        idMap[compName] = Math.max(preIndex, idMap[compName] || 1)
      }
      const index = idMap[compName] = idMap[compName] ? ++idMap[compName] : 1
      return `${compName}_${index}`
    }
  },

  getConfig(compName, ...args) {
    const comp = this.components[compName]
    const conf = comp ? comp.getConfig(...args) : {}
    conf.uuid = this.uuid(compName)
    conf.id = uuid(16)
    conf.design = conf.design || {}
    Object.assign(conf.design, {
      selected: false,
      span: conf.design.autoWidth ? 0 : conf.design.span || 24
    })
    if (compName === 'v-table') {
      conf.children.pid = conf.uuid
    }
    return conf
  },
  // 当前设计面板选中的组件
  activeComponent: null,
  // 当前设计面板选中的组件的路径
  activeCompPath: null,

  // 可用图标清单
  iconList: null,

  // 当前事件编排元数据对象
  currEventMeta: null,

  clear() {
    this.activeCompPath = null
    this.activeComponent = null
    this.currEventMeta = null
    idMap = {}
  }
}
export {
  getNewMetadata
}
