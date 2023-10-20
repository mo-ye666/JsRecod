import { getValueByPath, uuid } from './util'
/**
 * 组件事件编排解析
 * @param {Object} meta 组件元数据对象
 * @param {Object} ctx  编译器上下文对象
 */
export default function compileEvents(meta, ctx) {
  // 页面根节点events元数据解析
  if (meta.isPageRoot) {
    // TODO
    const { codeMethods, methods, listener, pageInit, pageDestory, pageActivated } = meta.events

    // 将用户写的代码函数配置,编译成code,并添加到上下文的函数代码集合中
    ctx.vue$method.push(...compileCodeMethods(codeMethods.children))

    // 将用户编排的函数,编译成code,添加到上下文的函数代码集合中
    ctx.vue$method.push(...compileMethods(methods.children, ctx))
    // 处理消息监听 模型监听的事件编排配置
    compileListener(listener.children, ctx)

    // 页面生命周期 初始化
    ctx.vue$pageInit.push(...compileActions(pageInit.children, ctx))

    // 页面激活
    if (pageActivated) {
      ctx.vue$pageActivated.push(...compileActions(pageActivated.children, ctx))
    }

    // 页面生命周期 注销阶段的事件编排配置解析
    ctx.vue$beforeDestroy.push(...compileActions(pageDestory.children, ctx))
  } else {
    // 解析组件配置的事件编排,解析成代码函数
    ctx.vue$method.push(...Object.keys(meta.events).map(eventName => {
      return compileEvent(eventName, meta, ctx)
    }))
  }
}

/**
 * 组件单个事件解析
 * @param {String} eventName  事件名称
 * @param {Object} meta 组件元数据对象
 * @param {Object} ctx  编译器上下文对象
 */
function compileEvent(eventName, meta, ctx) {
  const isInTable = ctx.path.some(item => item.name === 'table')
  const isInTree = ctx.path.some(item => item.name === 'tree')
  const isInGrid = ctx.path.some(item => item.name === 'grid')
  let param = ''
  if (isInTable || isInTree || isInGrid) {
    param = true
  }
  if (meta.name === 'table' || meta.name === 'tree') {
    param = true
  }
  const event = meta.events[eventName]
  if (event.children) {
    // 判断是否需要添加异步方法标识 如果内部
    const async = event.children.some(ele => {
      return ['api','model', 'confirm', 'formValidate'].includes(ele.type) || ele.async
    }) ? 'async' : ''
    const actionCodes = compileActions(event.children, ctx, { notReturn: true, args: true })
    eventName = eventName.replace(/-/g, '_')
    const name = `${meta.uuid || meta.pid}_${eventName}`
    meta.on = meta.on || {}
    event.bindMethodName = name
    return `${async} ${name}(${param ? 'data' : ''}){
      let ctx = {isCtx:true};
      let args = [ctx, ...arguments];
      \n ${actionCodes.join('\n')}
    }`
  }
}

/**
 * 动作集合元数据编译
 * @param actions 动作元数据配置对象
 * @param ctx 编译器上下文
 */
function compileActions(actions, ctx, extParams = {}) {
  return actions.map((action, i) => {
    return compileActionCode(action, ctx, Object.assign(extParams, { isLast: i === actions.length - 1 }))
  })
}
/**
 * 根据动作类型编译成具体执行代码
 * @param action 动作元数据配置对象
 * @param meta 当前组件元数据对象
 * @param ctx 编译器上下文
 */
function compileActionCode(action, ctx, extParams = {}) {
  const pageMeta = ctx.pageMeta
  const storeTypes = {
    context: 'ctx.',
    model: `this.`
  }
  let val = ''
  switch (action.type) {
    case 'setValue': {
      // 变量赋值
      if (!action.model) return
      val = `this.${action.model} = ${compileVal(action)};`
      break
    }
    case 'api': {
      // 服务调用
      const apiUcode = action.apiUcode
      const api = pageMeta.apis.find(item => item.apiUcode === apiUcode)
      if (!api) return
      // 构建参数
      let params = action.paramModel ? 'this.' + action.paramModel : compileParams(action, null, { arrayMode: api.arrayMode })
      // 如果配置有参数转换方法,则添加参数转换代码
      if (action.paramTransform) {
        params = `this.${action.paramTransform}(${params})`
      }
      // 判断返回值存储 类型
      const storeVar = storeTypes[action.storeType] + action.storePath
      const va = action.stopRepeat ||  action.showLoading ? `Object.assign({stopRepeat:${action.stopRepeat},loading:${action.showLoading}},common.$requestHeaders)` : 'common.$requestHeaders'
      params =
        api.type === 'get' ? `{params:${params},headers:${va}}` : params
      let failCallback = '' //  错误回调if语句
      let failCallbackVal = '' // 错误回调返回语句
      // 错误回调
      if (action.failCallback) {
        val += 'var _catchVal = null;'
        failCallbackVal = `.catch(ele=>{ _catchVal = ele })`
        failCallback = `if(_catchVal !== null) {
          this.${action.failCallback}(ctx, _catchVal)
          return false
        }`
      }
      // api返回值需要适配
      const header = api.type === 'post' ? `,{headers:${va}}` : ''
      val += `var dataResult = await this.$axios.${api.type}("${api.url}",${params}${header})${failCallbackVal};`
      val += failCallback
      if (action.storePath) {
        val += `${storeVar} = dataResult.data.data !== null ? dataResult.data.data : dataResult.data;`
      }

      // 成功回调
      if (action.successCallback) {
        val += `\n this.${action.successCallback}(ctx);`
      }
      // 是否最后需要return
      if (extParams.isLast && action.storePath) {
        val += `\n return ${storeVar}`
      }
      break
    }
    case 'model': {
      let api = {}
      // 服务调用
      pageMeta.objectModels.map(model => {
        model.functionList.find(item => {
          if (item.functionCode === action.functionCode){
            Object.assign(api, item || {},{modelCode:model.modelCode,modelName: model.name})
          }
        })
      })
      if (!api.functionCode) return
      // 构建参数
      let params = action.paramModel ? 'this.' + action.paramModel : compileParams(action, null, { arrayMode: api.arrayMode })
      // 如果配置有参数转换方法,则添加参数转换代码
      if (action.paramTransform) {
        params = `this.${action.paramTransform}(${params})`
      }
      // 判断返回值存储 类型
      const storeVar = storeTypes[action.storeType] + action.storePath
      const va = action.stopRepeat ? 'Object.assign({stopRepeat: true},common.$requestHeaders)' : 'common.$requestHeaders'
      // params =
      //   api.type === 'get' ? `{params:${params},headers:${va}}` : params
      const header = api.requestMethod === 'post' || api.requestMethod === 'put'  ? `,{headers:${va}}` : ''
      params = api.requestMethod === 'get' || api.requestMethod === 'delete' ? `{params:${params},headers:${va}}` : params
      let failCallback = '' //  错误回调if语句
      let failCallbackVal = '' // 错误回调返回语句
      // 错误回调
      if (action.failCallback) {
        val += 'var _catchVal = null;'
        failCallbackVal = `.catch(ele=>{ _catchVal = ele })`
        failCallback = `if(_catchVal !== null) {
          this.${action.failCallback}(ctx, _catchVal)
          return false
        }`
      }
      // api返回值需要适配
      val += `var dataResult = await models.${api.modelName}.${api.functionLabel}(${params}${header})${failCallbackVal};`
      val += failCallback
      if (action.storePath) {
        val += `${storeVar} = dataResult.data.data;`
      }
      // 成功回调
      if (action.successCallback) {
        val += `\n this.${action.successCallback}(ctx);`
      }
      // 是否最后需要return
      if (extParams.isLast && !extParams.notReturn && action.storePath) {
        val += `\n return ${storeVar}`
      }
      break
    }
    case 'callMethod': {
      if (!action.name) return
      // 构建初始化方法
      const params = compileParams(action)
      if (params && params.length > 2) {
        val += `Object.assign(ctx,${params});`
      }
      let async = ''
      /**
       * hasReturnVal 是否有返回值
       * storeVal：返回值存放变量
       * storeType：context 为上下文，ctx，否则为全局变量，取this.${confGlobal.pageModel}
       */
      if (action.hasReturnVal) {
        if (extParams.isLast ) {
          val += `return `
        }
        async += storeTypes[action.storeType] + (action.storePath || '_returnVal')
        async += ' = '
      }
      async += action.async ? 'await' : ''
      let argumentsStr = 'arguments'
      if (extParams.args) {
        argumentsStr = 'args'
      }
      // 通过...arguments
      var methodScope = /\./.test(action.name) ? ``: 'this.' // 方法名作用域 , 方法名带有 . 代表外部方法，不加this作用域
      val += `${async} ${methodScope}${action.name}(...${argumentsStr});`
      let callbackStr = action.async ? `throw false` : 'return false'
      if (!extParams.isLast) val += `if(ctx._stop) { ${callbackStr}};`
      break
    }
    case 'compMethod': {
      if (!action.name) return
      // 构建初始化方法
      const params = compileParams(action)
      if (params && params.length > 2) {
        val += `Object.assign(ctx,${params});`
      }
      let async = ''
      /**
       * hasReturnVal 是否有返回值
       * storeVal：返回值存放变量
       * storeType：context 为上下文，ctx，否则为全局变量，取this.${confGlobal.pageModel}
       */
      if (action.hasReturnVal) {
        if (extParams.isLast ) {
          val += `return `
        }
        async += storeTypes[action.storeType] + (action.storePath || '_returnVal')
        async += ' = '
      }

      let parmaList = params.replace(/\{|\}/g,'').split(',').map(item => {
        return item.split(':')[1]
      })
      // 通过...arguments
      val += `${async} this.$refs.${action.uuid}.${action.name}${action.name === 'selection' ? '' : `(${parmaList.join(',')})`};`
      if (!extParams.isLast) val += `if(ctx._stop) { return false};`
      break
    }
    case 'pushMessage': {
      if (!action.key) return
      const params = compileParams(action)
      val = `this.$bus.$emit('${action.key}', Object.assign(ctx,${params}));`
      break
    }
    case 'message': {
      val = `this.$message({
        showClose: true,
        duration:${action.duration || 2000},
        message:${action.method ? 'this.' + action.method + '()' : 'this.$t("' + action.text + '")'},
        type:'${action.msgType}'
      })`
      // if (action.method) {
      //   val = `this.$message.${action.msgType}(this.${action.method}());`
      // } else if (action.text) {
      //   val = `this.$message.${action.msgType}("${i18n.t(action.text)}");`
      // }
      break
    }
    case 'confirm': {
      if (!action.text && !action.method) return
      const confirmButtonText = action.confirmButtonText || '确认'
      const cancelButtonText = action.cancelButtonText || '取消'
      const title = action.title || ''
      const tipsType = action.tipsType || 'confirm'
      val = `
            await this.$${tipsType}(${action.method ? 'this.' + action.method + '()' : 'this.$t("' + action.text + '")'},this.$t('${title}'),{type: '${action.msgType}',confirmButtonText:this.$t('${confirmButtonText}'),cancelButtonText:this.$t('${cancelButtonText}')}
            ).catch(ele=>{ctx._stop = true});
            if(ctx._stop) { return false};`
      break
    }
    case 'close': {
      val = `this.$common.closeCurPage.call(this);`
      break
    }
    case 'reFreshTemplate': {
      val = `const option = this.__QUERY_STATIC__.__TEMPLATE_EVENT_BUS_OPTIONS__;
            this.$bus.$emit(option.name, option.param);`
      break
    }
    case 'waterMark': {
      const type = action.textType
      let text = ''
      if (type === 'static' && action.text) {
        text = `'${action.text}'`
      } else if (action.model) {
        text = `this.${action.model}`
      }
      val = `this.$common.waterMark({text:this.$t(${text}),font:${action.fontSize || 14},  color:'${action.color}',dom:this.$el})`
      break
    }
    case 'openUrl': {
      if (!action.page.url) return
      // 构建初始化方法
      const params = compileParams(action)
      const lastParams = compileParams(action, { pageId: action.page.url })
      val = `
      this.$common.saveQueryParam('${action.page.url}', ${params}, ${action.paramMode === 'add'});
      this.$common.openTagsView({
          title: this.$t('${action.page.label}'),
          query: ${lastParams}
        });`
      break
    }
    case 'dialog': {
      const page = action.page
      if (!page || !page.url) return
      const params = compileParams(action)
      val = `this.$common.saveQueryParam('${page.url}',${params}, ${action.paramMode === 'add'});
            this.$common.openDialog({
          path: '${page.url}',
          dialogTitle: this.$t('${action.dialogTitle}'),
          dialogWidth: '${action.dialogWidth}${action.dialogWidthUnit || 'px'}'
        }, ${action.isSingle});`
      break
    }
    case 'formValidate': {
      if (!action.refId) return
      const failCallback = action.failCallback
        ? `this.${action.failCallback}(res)`
        : ''
      const showErrMsg = action.showErrMsg
        ? `this.$message.error(errorData[0].message);`
        : ''
      val = ` var res = {}
             var errorData = await this.$refs['${action.refId}'].validate().catch(errorData => errorData)
             res = {valid:!errorData,errorData}
             console.log(res);
             if(errorData!==true) {
                ${showErrMsg}
                ${failCallback}
                return
             };
            `
      break
    }
    // TODO export
    case 'export': {
      const buttonID = extParams.uuid
      // 构建参数
      const params = action.paramModel ? 'this.' + action.paramModel : compileParams(action)
      const approveApi = action.approveApi ? pageMeta.apis.find(item => item.apiUcode === action.approveApi) : ''
      const postApproveApi = action.postApproveApi ? pageMeta.apis.find(item => item.apiUcode === action.postApproveApi) : ''
      const options = `
      {
        exportParams:${params},
        appCenterCode:'${action.appCenterCode}',
        version:'${action.version}',
        buttonID:'${buttonID}',
        exportTab:'${!!action.exportTab}',
        exportProgress:'${!!action.exportProgress}',
        tempCode:'${action.tempCode}',
        exportApi:'${action.interactionUrl}',
        vaildExamine:${!!action.vaildExamine},
        examineApi:'${approveApi ? approveApi.url : ''}',
        addAuditorApi:'${postApproveApi ? postApproveApi.url : ''}',
        fildeModal:${!!action.FildeModal},
        excelFilde:this.excelFields_${action.tempCode}
      }`
      val = `this.$bus.$emit('openExportModal',${options});`
      ctx.temp = ctx.temp || {}
      // 防止生成多个相同的导出字段映射模型
      if (!ctx.temp[action.tempCode]) {
        ctx.vue$data.push(`excelFields_${action.tempCode}: ${JSON.stringify(action.mappingVos)}`)
        ctx.temp[action.tempCode] = true
      }

      break
    }
    // :${JSON.stringify(scheme.on.click.mappingList)}
  }
  return vif(action.vif, val)
}

function compileVal(action) {
  // 默认值
  if (action.source === 'value') {
    return getDefaultValue(action.value, action.dataType)
  } else if (action.source === 'model') {
    return `this.${action.value}`
  } else if (action.source === 'context') {
    return `ctx.${action.value}`
  } else if (action.source === 'parent') {
    return action.value ? `data.${action.value}` : 'data'
  } else if (action.source === 'global') {
    let value = action.value
    if (action.valuePath) {
      value += `.${action.valuePath}`
    }
    return `this.$common.getGlobalParamById('${value}')`
  } else if (action.source === 'storage') {
    let val
    if (action.storeType === 'localStorage') {
      val = `localStorage.getItem('${action.value}')`
    } else {
      val = `sessionStorage.getItem('${action.value}')`
    }
    return `this.$common.getValByType(${val},'${action.dataType}')`
  } else if (action.source === 'expression') {
    return action.value
  }
}

/**
 * 参数代码编译
 * @param {Object} action 动作
 * @returns
 */
function compileParams(action, data, args = {}, mapping) {
  let paramsObj = Object.assign({}, data)

  const params = action.params || action.children || getValueByPath(action,mapping) || []
  params.forEach(param => {
    if (!param.name) {
      return
    }
    if (param.defaultValue || param.valueSource === 'parent') {
      if (args.initModel && !param.isFilter) {
        return
      }
      if (param.valueSource === 'value') {
        paramsObj[param.name] = getDefaultValueForApi(param.defaultValue, param.dataType)
      } else if (param.valueSource === 'context' && !args.initModel) {
        paramsObj[param.name] = `---$---ctx.${param.defaultValue}---$---`
      } else if (param.valueSource === 'model') {
        paramsObj[param.name] = `---$---this.${param.defaultValue}---$---`
      } else if (param.valueSource === 'parent' && !args.initModel) {
        if (param.defaultValue) {
          paramsObj[param.name] = `---$---data.${param.defaultValue}---$---`
        } else {
          paramsObj[param.name] = `---$---data---$---`
        }
      } else if (param.valueSource === 'method') {
        paramsObj[param.name] = `---$---this.${param.defaultValue}(...arguments)---$---`
      } else if (param.valueSource === 'global') {
        paramsObj[param.name] = `---$---this.$common.getGlobalParamById('${param.defaultValue}')---$---`
      }
    } else if (param.dataType === 'Object' && param.children) {
      // 拼写子属性的查询参数 (如果父属性已经有参数配置,则忽略子属性的配置)
      paramsObj[param.name] = {}
      paramsObj[param.name] = compileParams(param, paramsObj[param.name],{returnType:'Object'})
    } else if (args.initModel && param.isFilter) {
      paramsObj[param.name] = ''
    }
  })
  if (args.arrayMode) {
    paramsObj = paramsObj.baseList || []
  }
  if(args.returnType === 'Object') {
    return paramsObj
  }
  return JSON.stringify(paramsObj).replace(/"---\$---/g, '').replace(/---\$---"/g, '')
}

function getDefaultValue(value, dataType) {
  if (value) {
    if (dataType === 'string') {
      return `'${value || ''}'`
    } else if (dataType === 'number') {
      return parseInt(value)
    } else {
      return value
    }
  }
  return `''`
}

function getDefaultValueForApi(value, dataType) {
  if (value) {
    if (dataType === 'Array' || dataType === 'Object') {
      return `---$---${value}---$---`
    } else {
      return value
    }
  }
  return ''
}
/** 将元数据中的方法集合编译成代码
 * @param {Array} methods 自定义函数元数据集合
 * @returns {Array} 方法代码集合
 */
function compileCodeMethods(methods) {
  return methods.map(method => {
    return method.content.replace(
      /[\s]*export[\s]*[async]*[\s]*function[\s]*/,
      method.async ? 'async ' : ''
    )
  })
}

/** 将元数据中的编排方法集合编译成代码
 * @param {Array} methods 编排函数配置集合
 * @returns {Array} 方法代码集合
 */
function compileMethods(methods, ctx) {
  const codes = []
  methods.forEach(method => {
    if (method.name && method.children) {
      // 判断是否需要添加异步方法标识 如果内部
      const async = method.children.some(ele => {
        return ['api', 'model','confirm', 'formValidate'].includes(ele.type) || ele.async
      }) ? 'async' : ''
      const actionCodes = compileActions(method.children, ctx)
      codes.push(
        `${async} ${method.name}(ctx = {isCtx:true}){\n ${actionCodes.join('\n')}}`
      )
    }
  })
  return codes
}

/** 将组件配置的初始化服务元数据,编译为代码 -apis
 * @param {Array} methods 编排函数配置集合
 * @returns {Array} 方法代码集合
 */
function compileInitApi(meta, ctx) {
  const api = getValueByPath(meta, 'design.initApi')
  const isTable = meta.name === 'table'
  const isGrid = meta.name === 'grid'
  const showLoading = ['tree'].includes(meta.name)
  let initParamModel = false
  if (isTable) {
    const parent = ctx.path[ctx.path.length - 1]
    initParamModel = parent.design.paramModel
    meta.design.autoInit = parent.design.autoInit
  }
  if (api && api.apiUcode) {
    Object.assign(api, ctx.pageMeta.apis.find(item => item.apiUcode === api.apiUcode) || {})
    // 如果配置有参数转换方法,则添加参数转换代码
    let size = meta.design.pageSize || getValueByPath(meta, 'props.footer-action-config.pageConfig.pageSize')
    size = meta.name === 'table' ? `---$---this.${meta.pid}_pagination.pageSize---$---` : size
    const baseArg = api.responseType === 'Page' ? { pageSize: size || 10, pageNum: 1 } : {}
    let params = compileParams(api, baseArg,{arrayMode : api.arrayMode})
    const varName = `${meta.uuid || meta.pid}_api_data`
    api.bindDataName = varName
    ctx.vue$data.push(`${varName}: []`)
    if (initParamModel) {
      params = meta.insertInitFn ? `Object.assign({},this.${initParamModel},${params},newParam && newParam.isCtx ? {} : newParam)` : params
    } else {
      params = meta.insertInitFn ? `Object.assign({},${params},newParam && newParam.isCtx ? {} : newParam)` : params
    }
    let backUpParams = params
    let header = api.type === 'post' ? `,{headers:common.$requestHeaders}` : ''
    params = api.type === 'get' ? `{params:${params},headers:common.$requestHeaders}` : params
    if(isGrid) {
      header = api.type === 'post' ? `,{headers:Object.assign({loading:${meta.design.showLoading}}, common.$requestHeaders)}` : ''
      params = api.type === 'get' ? `{params:${backUpParams},headers:Object.assign({loading:${meta.design.showLoading}}, common.$requestHeaders)}` : backUpParams
    }
    // api返回值需要适配
    let adaptCode = ''
    const pageCode = meta.name === 'table' ? ` this.${meta.pid}_pagination.total = res.data.data.total` : ''
    // const pageCode = meta.name === 'table' ? ` this.${meta.pid}_pagination.total = res.data.data.total; this.${meta.pid}_pagination.pageSize = res.data.data.pageSize; this.${meta.pid}_pagination.pageNum = res.data.data.pageNum` : ''
    if (api.responseType === 'Page') {
      adaptCode = `${pageCode}
      const data = res.data.data.list`
    } else {
      adaptCode = 'const data = res.data.data'
    }
    let ajaxCode = ''

    // grid(eff-table 内部自己处理数据适配),其他组件初始化需要添加数据适配逻辑
    if (isGrid) {
      if (api.isSeniorQuery) {
        let sortList = null
        api.sortList && (sortList = JSON.stringify(api.sortList, function (k, v) {
          delete v.id
          return v
        }))
        api.conditionList && api.conditionList.map(v => {
          if (v.valueSource === 'model') {
            v.fieldValue = `---$---this.${v.fieldValue}---$---`
          }
          if (v.fieldType === 'Array') {
            v.fieldValueList = v.fieldValue
            delete v.fieldValue
          }
          delete v.id
          delete v.fieldType
          delete v.operateTypeList
          delete v.operateTypeList
          delete v._isFirst
          delete v.valueSource
        })
        let conditions = null
        api.conditionList && (conditions = JSON.stringify(api.conditionList).replace(/"---\$---/g, '').replace(/---\$---"/g, ''))
        params = `this.$common.seniorConcatCommon('${api.apiUcode}',${conditions},${params},${sortList},
        {
         conditionsList: ctx.seniorQuery, sortList: ctx.sort
         })`
      }
      ajaxCode = `let res = await this.$axios.${api.type}("${api.url}",${params}${header})
        return  ${api.resultTransform ? 'this.' + api.resultTransform + '(res.data.data)' : 'res.data.data'}
      `
    } else {
      ajaxCode = `this.$axios.${api.type}("${api.url}",${params}${header}).then(res =>{
        ${showLoading ? 'this.' + (meta.uuid || meta.pid) + '_loading = false' : ''}
        ${adaptCode}
        this.${varName} = ${api.resultTransform ? 'this.' + api.resultTransform + '(data)' : 'data'}
      })`
    }

    // 是否插入初始化方法, 如果否,则将初始化代码插入created中
    if (meta.insertInitFn) {
      ctx.vue$method.push(`
        async ${meta.uuid || meta.pid}_init(newParam){
           ${isGrid ? 'var ctx = newParam; newParam = ctx.page' : ''}
           ${showLoading ? 'this.' + (meta.uuid || meta.pid) + '_loading = true' : ''}
           ${isGrid ? '' : 'return '}  ${ajaxCode}
        }
      `)
      // grid(eff-table) 会自执行查询动作,无需插入created方法
      if (!isGrid && meta.design.autoInit !== false) {
        ctx.vue$pageInit.push(` this.${meta.uuid || meta.pid}_init();`)
      }
    } else {
      const code = `
        ${showLoading ? 'this.' + meta.uuid + '_loading = true' : ''}
        ${ajaxCode}
      `
      ctx.vue$pageInit.push(code)
    }
  }
}

/** 将组件配置的初始化服务元数据,编译为代码- objectModel
 * @param {Array} methods 编排函数配置集合
 * @returns {Array} 方法代码集合
 */
function compileInitObjectModel(meta, ctx) {
  const api = getValueByPath(meta, 'design.initApi')
  const isTable = meta.name === 'table'
  const isGrid = meta.name === 'grid'
  const showLoading = ['tree'].includes(meta.name)
  let initParamModel = false
  if (isTable) {
    const parent = ctx.path[ctx.path.length - 1]
    initParamModel = parent.design.paramModel
    meta.design.autoInit = parent.design.autoInit
  }
  if (api && api.functionCode) {
    ctx.pageMeta.objectModels.map(model => {
      model.functionList.find(item => {
       if (item.functionCode === api.functionCode){
         Object.assign(api, item || {},{modelCode:model.modelCode, modelName:model.name})
       }
      })
    })
    // 如果配置有参数转换方法,则添加参数转换代码
    const baseArg = api.responseType === 'Page' ? { pageSize: meta.design.pageSize || 10, pageNum: 1 } : {}
    let params = compileParams(api, baseArg)
    const varName = `${meta.uuid || meta.pid}_api_data`
    api.bindDataName = varName
    ctx.vue$data.push(`${varName}: []`)
    if (initParamModel) {
      params = meta.insertInitFn ? `Object.assign({},this.${initParamModel},${params},newParam && newParam.isCtx ? {} : newParam)` : params
    } else {
      params = meta.insertInitFn ? `Object.assign({},${params},newParam && newParam.isCtx ? {} : newParam)` : params
    }
    const header = api.requestMethod === 'post' || api.requestMethod === 'put'  ? `,{headers:common.$requestHeaders}` : ''
    params = api.requestMethod === 'get' || api.requestMethod === 'delete' ? `{params:${params},headers:common.$requestHeaders}` : params
    // api返回值需要适配
    let adaptCode = ''
    const pageCode = meta.name === 'table' ? ` this.${meta.pid}_pagination.total = res.data.data.total` : ''
    if (api.responseType === 'Page') {
      adaptCode = `${pageCode}
      const data = res.data.data.list`
    } else {
      adaptCode = 'const data = res.data.data'
    }
    let ajaxCode = ''
    let functionLabel = api.functionLabel.replace(/_|-/g, '')
    // grid(eff-table 内部自己处理数据适配),其他组件初始化需要添加数据适配逻辑
    if (isGrid) {
      ajaxCode = `let res = await models.${api.modelName}.${functionLabel}(${params}${header})
        return  ${api.resultTransform ? 'this.' + api.resultTransform + '(res.data.data)' : 'res.data.data'}
      `
    } else {
      ajaxCode = ` models.${api.modelName}.${functionLabel}(${params}${header}).then(res =>{
        ${showLoading ? 'this.' + (meta.uuid || meta.pid) + '_loading = false' : ''}
        ${adaptCode}
        this.${varName} = ${api.resultTransform ? 'this.' + api.resultTransform + '(data)' : 'data'}
      })`
    }
    // 是否插入初始化方法, 如果否,则将初始化代码插入created中
    if (meta.insertInitFn) {
      ctx.vue$method.push(`
        async ${meta.uuid || meta.pid}_init(newParam){
           ${isGrid ? 'var ctx = newParam; newParam = ctx.page' : ''}
           ${showLoading ? 'this.' + (meta.uuid || meta.pid) + '_loading = true' : ''}
           ${isGrid ? '' : 'return '}  ${ajaxCode}
        }
      `)
      // grid(eff-table) 会自执行查询动作,无需插入created方法
      if (!isGrid && meta.design.autoInit !== false) {
        ctx.vue$pageInit.push(` this.${meta.uuid || meta.pid}_init();`)
      }
    } else {
      const code = `
        ${showLoading ? 'this.' + meta.uuid + '_loading = true' : ''}
        ${ajaxCode}
      `
      ctx.vue$pageInit.push(code)
    }
  }
}
/** 将元数据,事件编排的消息监听部分配置编译成代码
 * @param {Array} listeners 监听配置的元数据配置
 * @returns {Object} ctx 编译上下文对象
 */
function compileListener(listeners, ctx) {
  listeners.forEach(listener => {
    // 如果key为空则直接返回
    if (!listener.key) {
      return
    }
    const actionCodes = compileActions(listener.children, ctx, { args: true })
    if (listener.type === 'msg') {
      // 消息监听配置处理
      const fnName = `fn_${uuid(6)}`
      ctx.vue$created.push(`
        let ${fnName};
        this.$bus.$on('${listener.key}',  ${fnName} = async (...params) => {
          let ctx = {isCtx:true};
          let args= [ctx, ...params];
          \n ${actionCodes.join('\n')}
        })
        this.listeners.push({key:'${listener.key}', ${fnName}})
      `)
    } else if (listener.type === 'model') {
      // 模型监听配置处理
      if (listener.deep) {
        ctx.vue$watch.push(`"${listener.key}":{
          handler(){
            let ctx = {isCtx:true}
            let args= [ctx,...arguments];
            (async () =>{\n ${actionCodes.join('\n')}})()
          },
          deep:true
         }`)
      } else {
        ctx.vue$watch.push(`"${listener.key}":function(){
          let ctx = {isCtx:true}
          let args= [ctx,...arguments];
          (async () =>{\n ${actionCodes.join('\n')}})()
      }`)
      }
    }
  })
}

/**
 * 语句的执行条件包裹
 * @param {String} expression
 * @param {*} code  需要包裹执行条件的代码
 * @returns
 */
function vif(expression, code) {
  if (expression) {
    return `if(${expression}) { ${code}}`
  }
  return code
}

export {
  compileInitApi,
  compileInitObjectModel,
  compileEvents,
  compileParams
}
