import { uuid, options, getUrlParams } from '@/utils/util'
import baseProps from '@/design/baseProps'
import { bus, EVENTS } from '@/common/eventBus'
import context from '@/common/context'
/** 配置数据定义 */
const constants = {
  sourceTypes: [
    { value: 'value', label: '默认值' },
    { value: 'storage', label: 'Storage' },
    { value: 'model', label: '数据对象' },
    { value: 'context', label: '上下文' },
    { value: 'global', label: '全局对象' },
    { value: 'expression', label: '表达式' }

  ],
  dataTypes: [
    { value: 'number', label: '数值' },
    { value: 'bool', label: '布尔' },
    { value: 'string', label: '字符串' },
    { value: 'array', label: '数组' },
    { value: 'object', label: '对象' }
  ],
  globalTypes: [
    { value: 'userInfo', label: '用户信息' }
  ],
  actionTypes: [
    { value: 'callMethod', label: '函数调用' },
    { value: 'setValue', label: '变量赋值' },
    { value: 'formValidate', label: '表单校验' },
    { value: 'api', label: '调用服务' },
    { value: 'model', label: '调用模型' },
    { value: 'pushMessage', label: '消息推送' },
    { value: 'message', label: '消息提示' },
    { value: 'confirm', label: '弹出确认框' },
    { value: 'dialog', label: '弹出页面' },
    { value: 'export', label: '数据导出' },
    { value: 'close', label: '关闭页面' },
    { value: 'openUrl', label: '打开页面' },
    { value: 'compMethod', label: '组件方法' },
    { value: 'waterMark', label: '添加水印' },
    { value: 'reFreshTemplate', label: '刷新表格模板' }
  ]
}
// 组件方法的入参
const componentMethodsParams = {
  table: [],
  grid: [
    {
      name:'loadTableData',
      params:params([{
        'name': 'data',
        'label': '新的数据array'
      }])
    },
    {
      name: 'insert',
      params: params([{
        'name': 'records',
        'label': '插入数据array'
      },{
        'name': 'rowIndex',
        'label': '为空插入到顶部，为-1插入到底部，为有效索引插入到索引对应行'
      },{
        'name': 'insertCheckRow',
        'label': '存在勾选行时，插入到指定行'
      }])
    }
  ],
  tree: []
}
const util = {
  remark(data) {
    if (data.propsType === 'listener') {
      return data.type === 'msg'
        ? `监听页面消息: ${data.key}`
        : `监听数据对象: ${data.key}`
    }
    const conf = {
      api: `调用服务`,
      model: `调用模型`,
      callMethod: `调用函数:${data.name}`,
      compMethod: `调用方法:${data.uuid}.${data.name}`,
      pushMessage: `发送消息: ${data.key} `,
      setValue: ` 变量赋值:${data.name}`,
      message: `弹出提示框`,
      confirm: '弹出确认框',
      dialog: `弹出窗口:${data.page && data.page.label || ''}`,
      close: '关闭页面',
      export: '导出操作',
      openUrl: '打开页面',
      formValidate: `表单校验:${data.formId || ''}`,
      waterMark: '添加页面水印',
      reFreshTemplate: '刷新表格模板'
    }
    return data.type ? conf[data.type] : data.label
  },

  addChild(data) {
    let currData
    if (data.id === 'PageCodeMethods') {
      // 自定义函数
      const id = 'method_' + (data.children.length + 1)
      currData = {
        id,
        name: id,
        label: '',
        type: 'codeMethod',
        content: `export function ${id}(){\r\n\r\n}`
      }
    } else if (
      data.id === 'PageInit' ||
      data.id === 'PageActivated' ||
      data.id === 'PageDestory' ||
      data.propsType === 'listener' ||
      data.type === 'method' ||
      data.event
    ) {
      // 添加动作
      const id = 'action_' + uuid()
      currData = {
        id,
        name: '',
        value: 'value',
        type: 'callMethod',
        label: '调用函数',
        propsType: 'action',
        params: []
      }
    } else if (data.id === 'PageMethods') {
      // 编排函数
      const id = 'fn_' + uuid()
      currData = {
        id,
        name: id,
        label: '',
        type: 'method',
        children: []
      }
    } else if (data.id === 'PageListener') {
      const id = 'listen_' + uuid()
      currData = {
        id,
        type: 'msg',
        name: '消息监听',
        children: [],
        propsType: 'listener',
        key: ''
      }
    }
    if (!data.children) {
      this.$set(data, 'children', [])
    }
    if (currData) {
      data.children.push(currData)
      this.currData = currData
      this.selectNode(currData)
    }
  },

  getProps(meta) {
    const pageJson = window.getMetaManager().meta
    const type = meta.propsType || meta.type
    if (type === 'method') {
      return methodProps()
    } else if (type === 'action') {
      return actionProps(meta.type, meta, pageJson)
    } else if (type === 'listener') {
      return listenerProps(pageJson)
    } else {
      return []
    }
  }
}

const methodProps = () => {
  return [
    { label: '函数名称', mapping: 'name', type: 'input', value: '' },
    { label: '描述', mapping: 'label', type: 'input', value: '' }
  ]
}
const listenerProps = () => {
  const metaMng = window.getMetaManager()
  const list = []
  metaMng.compEach(metaMng.meta.children, (meta) => {
    if (['v-table'].includes(meta.name)) {
      list.push({ label: meta.uuid + '_pagination',name: meta.uuid + '_pagination', id: meta.uuid + '_pagination',children:[
          {label: '每页条数',name: 'pageSize', id: meta.uuid + '_pagination.pageSize'},
          {label: '页码',name: 'pageNum', id: meta.uuid + '_pagination.pageNum'},
          {label: '总条数',name: 'total', id: meta.uuid + '_pagination.total'},
        ]})
    }
  })
  return [
    { label: '监听类型', mapping: 'type', type: 'select', value: 'msg',
      options: options({ msg: '页面消息监听', model: '数据对象监听' }) },
    { label: '消息Key', mapping: 'key', type: 'input', value: '', vif: { type: 'msg' }},
    { label: '数据对象', mapping: 'key', type: 'model', value: '', showAllLevels: true, checkStrictly: true, vif(meta) { return meta.type === 'model' },
      mergeOptions:list
    },
    { label: '深度监听', mapping: 'deep', type: 'bool', value: false, vif(meta) { return meta.type === 'model' } }
  ]
}
const paramProps = (meta) => {
  if (meta.type === 'api' || meta.type === 'export' || meta.type === 'model') {
    return [
      { type: 'divider', label: '参数配置' },
      {
        label: '参数类型',
        mapping: 'paramType',
        type: 'radio',
        options: options({ model: '数据对象参数', 'custom': '自定义参数' }),
        value: 'model',
        help: '请选择是将数据对象作为参数传递,还是自定义参数传递'
      },
      {
        label: '数据对象',
        mapping: 'paramModel',
        type: 'model',
        checkStrictly: true, showAllLevels: true,
        value: '',
        vif(meta) { return meta.paramType === 'model' },
        help: '请选择作为参数的数据对象'
      },
      {
        label: '自定义',
        type: 'button',
        buttonText: '设置',
        onClick() {
          bus.$emit(EVENTS.SHOW_PARAMS_EDITOR, {
            params: meta.params || [],
            apiUcode: meta.apiUcode,
            uuid: context.currEventMeta ? context.currEventMeta.uuid : '',
            callback(params) {
              meta.params = params
            }
          })
        },
        value: '',
        vif(meta) { return meta.paramType === 'custom' }
      }
    ]
  } else if (['callMethod', 'pushMessage', 'dialog', 'openUrl'].includes(meta.type)) {
    const arr = [
      { type: 'divider', label: '参数配置' },
      {
        label: '参数',
        type: 'button',
        buttonText: '设置',
        onClick() {
          bus.$emit(EVENTS.SHOW_PARAMS_EDITOR, {
            params: meta.params || [],
            apiUcode: meta.apiUcode,
            pageId: meta.page?.id,
            uuid: context.currEventMeta ? context.currEventMeta.uuid : '',
            callback(params) {
              meta.params = params
            }
          })
        },
        value: ''
      }
    ]
    if (meta.type === 'dialog' || meta.type === 'openUrl') {
      arr.push({
        label: '参数保存方式',
        mapping: 'paramMode',
        type: 'radio',
        options: options({ add: '增量', 'over': '覆盖' }),
        value: 'add'
      }
      )
    }
    return arr
  } else if(meta.type === 'compMethod' && meta.uuid && meta.uuid.indexOf('grid') > -1) {
    const arr = [
      { type: 'divider', label: '参数配置' },
      {
        label: '参数',
        type: 'button',
        buttonText: '设置',
        onClick() {
          let curMethod = componentMethodsParams.grid.filter(item => item.name === meta.name);
          console.log(meta.name)
          let paramsOld = meta.params || []
          let paramsNew = []
          if(curMethod.length > 0) {
            paramsNew = curMethod[0].params.map(item1 => {
              paramsOld.forEach(item2 => {
                if(item2.name === item1.name) {
                  item1 = item2
                }
              })
              return item1
            })
          } else {
            paramsNew = meta.params || []
          }
          console.log(paramsNew)
          bus.$emit(EVENTS.SHOW_PARAMS_EDITOR, {
            params: paramsNew,
            apiUcode: meta.apiUcode,
            pageId: meta.page?.id,
            uuid: context.currEventMeta ? context.currEventMeta.uuid : '',
            callback(params) {
              meta.params = params
            }
          })
        },
        value: ''
      }
    ]
    return arr
  }
  return []
}
const actionProps = (type, meta, pageJson) => {
  const dsList = pageJson.apis
  const modelList = pageJson.objectModels
  let props = []
  if (type === 'callMethod') {
    props = [
      {
        label: '选择函数', mapping: 'name', type: 'method', value: '',filterable: true,allowCreate:true, onChange(val, data) {
          var fn = pageJson.events.codeMethods.children.filter(item => item.name === val)[0]
          if (fn) {
            data.async = !!fn.async
          } else {
            fn = pageJson.events.methods.children.filter(item => item.name === val)[0]
            data.async = true
          }
          return true
        }
      },
      { label: '返回值', mapping: 'hasReturnVal', type: 'radio', value: false, options: [{ value: true, label: '有返回值' }, { value: false, label: '无返回值' }] },
      { label: '返回值存储到', mapping: 'storeType', value: 'context', type: 'radio', options: options({ model: '数据对象', context: '上下文' }), vif: 'hasReturnVal' },
      { label: '存储至', mapping: 'storePath', type: 'model', checkStrictly: true, showAllLevels: true, value: '', vif: { hasReturnVal: true, storeType: 'model' }},
      { label: '存储至', mapping: 'storePath', type: 'input', value: '', vif: { hasReturnVal: true, storeType: 'context' }}
    ]
  } else if (type === 'compMethod') {
    const metaMng = window.getMetaManager()
    const list = []
    metaMng.compEach(metaMng.meta.children, (meta) => {
      if (['tree', 'v-table', 'grid'].includes(meta.name)) {
        list.push({ label: meta.uuid, value: meta.uuid })
      }
    })
    props = [
      {
        label: '选择组件', mapping: 'uuid', type: 'select', value: '', options: list,

        onChange(val, data) {
          if (val) {
            data.params = []
          }
          bus.$emit(EVENTS.ACTION_TYPE_CHANGE, meta)
        }
      },
      {
        label: '选择方法', mapping: 'name', type: 'compMethod', filterable: true, value: '', params: meta
      },
      { label: '返回值', mapping: 'hasReturnVal', type: 'radio', value: false, options: [{ value: true, label: '有返回值' }, { value: false, label: '无返回值' }] },
      { label: '返回值存储到', mapping: 'storeType', value: 'context', type: 'radio', options: options({ model: '数据对象', context: '上下文' }), vif: 'hasReturnVal' },
      { label: '存储至', mapping: 'storePath', type: 'model', checkStrictly: true, showAllLevels: true, value: '', vif: { hasReturnVal: true, storeType: 'model' }},
      { label: '存储至', mapping: 'storePath', type: 'input', value: '', vif: { hasReturnVal: true, storeType: 'context' }}
    ]
  } else if (type === 'api' || type === 'model') {
    if (type === 'api' ){
      props = [  {
        label: '选择服务', mapping: 'apiUcode', type: 'select', value: '', options: dsList, labelKey: 'name', valueKey: 'apiUcode',
        onChange(val, data) {
          if (val) {
            data.params = []
          }
        }
      }]
    }
    if (type === 'model' ){
    props = [
      {
          label: '选择模型',
          mapping: 'functionCode',
          type: 'objectModel',
          help: '请选择模型',
          value: '',
        onChange(val, data) {
          if (val) {
            data.params = []
          }
        }
        }]
    }
    props = [
      ...props,
      { label: '参数处理', mapping: 'paramTransform', type: 'method', onlyCode: true, value: '' },
      { label: '失败回调', mapping: 'failCallback', type: 'method', value: '' },
      {
        label: '数据存储方式', mapping: 'storeType', value: 'context', type: 'radio', options: options({ model: '数据对象', context: '上下文' })
      },
      { label: '存储至', mapping: 'storePath', type: 'model', showAllLevels: true, checkStrictly: true, value: '', vif: { storeType: 'model' }},
      { label: '存储至', mapping: 'storePath', type: 'input', value: '', vif: { storeType: 'context' }},
      { label: '显示Loading', mapping: 'showLoading', type: 'bool', value: false },
      { label: '防重复提交', mapping: 'stopRepeat', type: 'bool', value: false }
    ]
  } else if (type === 'formValidate') {
    const forms = []
    const metadata = window.getMetaManager()
    metadata.compEach(metadata.meta.children, (meta) => {
      if (meta.name === 'form') {
        forms.push(meta.uuid)
      }
    })
    props = [
      { label: '表单', mapping: 'refId', type: 'select', value: '', options: forms },
      { label: '错误消息提示', mapping: 'showErrMsg', type: 'bool', value: false },
      { label: '失败回调', mapping: 'failCallback', type: 'method', value: '' }
    ]
  } else if (type === 'pushMessage') {
    props = [
      { label: '消息KEY', mapping: 'key', type: 'input', value: '' }
    ]
  } else if (type === 'message') {
    props = [
      { label: '消息类型', mapping: 'msgType', type: 'radio', value: 'success', options: ['info', 'success', 'error', 'warning'] },
      { label: '静态文本', mapping: 'text', type: 'i18n', value: '' },
      { label: '动态文本', mapping: 'method', type: 'method', value: '', help: '使用一个方法的返回值作为提示文本,优先级高于静态文本' },
      { label: '显示时间', step: 1000, min: 0, mapping: 'duration', type: 'number', value: '2000', help: '显示时间, 毫秒。设为 0 则不会自动关闭' }
    ]
  } else if (type === 'confirm') {
    props = [
      { label: '提示类型', mapping: 'tipsType', type: 'radio', value: '', options: [{ label: 'confirm', value: '' }, { label: 'alert', value: 'alert' }] },
      { label: '消息类型', mapping: 'msgType', type: 'radio', value: '', options: [{ label: '默认', value: '' }, { label: 'info', value: 'info' }, { label: 'success', value: 'success' }, { label: 'error', value: 'error' }, { label: 'warning', value: 'warning' }] },
      { label: '提示标题', mapping: 'title', type: 'i18n', value: '' },
      { label: '提示文本', mapping: 'text', type: 'i18n', value: '' },
      { label: '动态文本', mapping: 'method', type: 'method', value: '', help: '使用一个方法的返回值作为提示文本,优先级高于静态文本' },
      { label: '确定按钮文本', mapping: 'confirmButtonText', type: 'i18n', value: '' },
      { label: '取消按钮文本', mapping: 'cancelButtonText', type: 'i18n', value: '' }
    ]
  } else if (type === 'setValue') {
    const types = [...constants.sourceTypes]
    let fields = []
    if (context.currEventMeta) {
      const comps = window.getMetaManager().getCompPathById(context.currEventMeta.uuid)
      const scopeMeta = comps.find(item => ['table', 'tree'].includes(item.name))
      if (scopeMeta) {
        types.push({
          value: 'parent', label: '当前行数据'
        })
        if (scopeMeta.design.initApi && scopeMeta.design.initApi.apiUcode) {
          fields = window._fields4api_[scopeMeta.design.initApi.apiUcode] || []
        }
      }
    }
    const metaMng = window.getMetaManager()
    const list = []
    metaMng.compEach(metaMng.meta.children, (meta) => {
      if (['v-table'].includes(meta.name)) {
        list.push({ label: meta.uuid + '_pagination',name: meta.uuid + '_pagination', id: meta.uuid + '_pagination',children:[
            {label: '每页条数',name: 'pageSize', id: meta.uuid + '_pagination.pageSize'},
            {label: '页码',name: 'pageNum', id: meta.uuid + '_pagination.pageNum'},
            {label: '总条数',name: 'total', id: meta.uuid + '_pagination.total'},
          ]})
      }
    })
    props = [
      { label: '数据对象', mapping: 'model', type: 'model', value: '', checkStrictly: true, showAllLevels: true,mergeOptions: list },
      { label: '数据来源', mapping: 'source', type: 'select', value: 'value', options: types },
      { label: '数据类型', mapping: 'dataType', type: 'select', value: 'string', vif: { source: 'value' }, options: constants.dataTypes },
      { label: '默认值', mapping: 'value', type: 'input', value: '', vif(meta) {
        return meta.source === 'value' || meta.source === 'context'
      } },
      { label: '默认值', mapping: 'value', type: 'select', allowCreate: true, filterable: true, options: fields, value: '', vif(meta) {
        return meta.source === 'parent'
      } },
      { label: '参数名称', mapping: 'value', type: 'input', value: '', vif: { source: 'querys' }},
      {
        label: '缓存类型', mapping: 'storeType', type: 'radio', value: 'localStorage', vif: { source: 'storage' }, options: [
          'localStorage', 'sessionStorage'
        ]
      },
      { label: '缓存Key', mapping: 'value', type: 'input', value: '', vif: { source: 'storage' }},
      { label: '表达式', mapping: 'value', type: 'input', value: '', vif: { type: 'setValue', source: 'expression' }},
      { label: '类型', mapping: 'value', type: 'select', value: 'userInfo', vif: { source: 'global' }, options: constants.globalTypes },
      { label: '值模型', mapping: 'value', type: 'model', value: '', checkStrictly: true, showAllLevels: true, vif: { source: 'model' }},
      { label: '值路径', mapping: 'valuePath', type: 'input', value: '', vif: { source: 'global' }}
    ]
  } else if (type === 'dialog') {
    props = [
      {
        label: '弹窗页面', mapping: 'page', type: 'page', value: {}
      },
      { label: '弹窗标题', mapping: 'dialogTitle', type: 'i18n', value: '' },
      {
        label: '弹窗宽度', mapping: 'dialogWidth', type: 'input', value: '800', append: {
          type: 'select',
          mapping: 'dialogWidthUnit', options: ['px', '%'], value: 'px',
          width: '100px'
        }
      },
      { label: '独立弹窗', mapping: 'isSingle', type: 'bool', value: false, help: '开启后，当前弹框显示时，其他已显示的弹框会隐藏' }
    ]
  } else if (type === 'openUrl') {
    props = [
      { label: '页面', mapping: 'page', type: 'page', value: {}},
      { label: '标题', mapping: 'label', type: 'i18n', value: '' }
    ]
  } else if (type === 'export') {
    props = [
      {
        label: '导出模板', mapping: 'tempName', type: 'exportApi', value: '', onChange(data, propsData) {
          propsData.tempCode = data.tempCode
          propsData.tempName = data.tempName
          propsData.interactionUrl = data.interactionUrl
          propsData.templateInfo = data.templateInfo
          propsData.mappingVos = data.mapping.templateMappingVos
          propsData.appCenterCode = getUrlParams('appCenterCode')
          propsData.version = getUrlParams('centerVersion')
          return true
        }
      },
      { label: '多标签导出', mapping: 'exportTab', type: 'bool', value: false },
      { label: '显示进度条', mapping: 'exportProgress', type: 'bool', value: false },
      { label: '字段勾选弹窗', mapping: 'FildeModal', type: 'bool', value: false },
      { label: '需要审核验证', mapping: 'vaildExamine', type: 'bool', value: false },
      baseProps.common.api({
        label: '审核验证接口', // 列表数据源
        mapping: 'approveApi',
        vif: 'vaildExamine',
        help: ''
      }),
      baseProps.common.api({
        label: '提交审核接口', // 列表数据源
        mapping: 'postApproveApi',
        vif: 'vaildExamine',
        help: ''
      })
    ]
  } else if (type === 'waterMark') {
    props = [
      { label: '文本绑定', mapping: 'textType', type: 'radio', value: 'static', options: options({
        static: '静态文本',
        model: '动态文本'
      }) },
      { label: '静态文本', mapping: 'text', type: 'i18n', value: '', vif: (meta) => meta.textType === 'static' },
      { label: '动态文本', mapping: 'model', type: 'model', value: '', vif: (meta) => meta.textType === 'model' },
      {
        label: '字体大小',
        mapping: 'fontSize',
        type: 'number',
        value: '14'
      },
      {
        label: '字体颜色',
        mapping: 'color',
        type: 'color',
        value: ''
      }
    ]
  }
  return [{ label: '动作类型', mapping: 'type', type: 'action-select', options: constants.actionTypes, value: 'callMethod', onChange: actionTypeChangeHandle }, {
    label: '动作执行条件', mapping: 'vif', type: 'input', expression: true, value: '', placeholder: '表达式为真的时候才会执行该动作'
  }, ...props, ...paramProps(meta)]
}

function actionTypeChangeHandle(val, meta) {
  Object.keys(meta).forEach(key => {
    if (!['id', 'type', 'propsType'].includes(key)) {
      delete meta[key]
    }
  })
  Object.assign(meta, {
    name: '',
    value: '',
    type: val,
    label: getActionName(val),
    propsType: 'action'
  })
  bus.$emit(EVENTS.ACTION_TYPE_CHANGE, meta)
}

const getActionName = (type) => {
  const conf = ({
    api: `调用服务`,
    model: `模型方法`,
    callMethod: `调用函数`,
    compMethod: '组件方法',
    pushMessage: `消息推送`,
    setValue: `数据对象`,
    message: `提示消息`,
    confirm: '弹出确认框',
    dialog: '弹出窗口',
    close: '关闭页面',
    export: '数据导出',
    openUrl: '打开页面',
    formValidate: `表单校验`,
    reFreshTemplate: '刷新表格模板'
  })
  return conf[type]
}
/**
 * 准备参数
 * @param fields
 * @returns {[]}
 */
 function params(fields) {
  let params = []
  fields.map(ele=>{
    params.push(Object.assign({},{
      id: uuid(12),
        name: ele.name,
        label: ele.label,
        dataType: 'String',
        defaultValue: '',
        valueSource: '',
        custom: false
    }, ele))
  })
  return params
}
export default util
