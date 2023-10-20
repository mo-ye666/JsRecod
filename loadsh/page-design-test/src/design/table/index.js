import context from '@/common/context'
import constants from '@/common/constants'
import { getComponentId, options, setValueByPath } from '@/utils/util'
import baseProps from '../baseProps'
import './tableColumn'
import { bus, EVENTS } from '@/common/eventBus'
context.components['v-table'] = {
  // 组件默认配置

  getConfig(parent, ctx) {
    const tableMeta = context.getConfig('table')
    tableMeta.uuid = ''
    return {
      uuid: '',
      name: 'v-table',
      props: {
        showHeader: true,
        hasPagination: false

      },
      design: {
      },
      class: {},
      style: {
      },
      children: tableMeta,
      slots: [
        getHeaderMeta(),
        '',
        getPagination()
      ]
    }
  },
  // 组件的属性配置
  getProperties(meta) {
    const apis = window.getMetaManager().meta.apis || []
    const models = window.getMetaManager().meta.models || []
    return [
      {
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.compId(),
          {
            label: '高度',
            mapping: 'children.props.height',
            type: 'input',
            value: '',
            clearable: true,
            help: '内部表格高度设置'
          },
          baseProps.common.span(),
          { label: '列配置', type: 'divider' },
          {
            label: '表头来源',
            mapping: 'design.columnSource',
            type: 'radio',
            options: options({ static: '静态', object:'对象', objectModel: '模型',api: '服务' }),
            value: 'static',
            onChange(val, meta) {
              meta.children.columns.length = 0
            },
            help: '请选择table的列信息数据来源,切换模式时将清除原有模式的列配置,请谨慎操作'
          },
          {
            label: '对象数据',
            mapping: 'design.columnSourceObj',
            type: 'model',
            checkStrictly: true,
            help: '请选择数据对象',
            value: '',
            vif(meta) { return meta.design.columnSource === 'object' }
          },
          {
            label: '选择服务',
            mapping: 'design.columnSourceApi',
            type: 'select',
            options: window.getMetaManager().meta.apis || [],
            labelKey: 'name',
            valueKey: 'apiUcode',
            help: '请选择服务',
            value: '',
            onChange(val, meta) {
              if (val) {
                meta.children.columns.length = 0
                meta.design.columnSourceObjectModel = ''
                showColumnsEditor(meta)
              }
            },
            vif(meta) { return meta.design.columnSource === 'api' }
          },
          {
            label: '选择模型',
            mapping: 'design.columnSourceObjectModel',
            type: 'objectModel',
            help: '请选择模型',
            emitPath: true,
            value: '',
            onChange(val, meta) {
              if (val) {
                meta.children.columns.length = 0
                meta.design.columnSourceApi = ''
                window.getMetaManager().meta.objectModels.map(modelItem => {
                  modelItem.functionList.forEach(funcItem => {
                    if(funcItem.functionCode === val) {
                      meta.design.columnSourceObjectModelCode = modelItem.modelCode;
                    }
                  })
                })
                showColumnsEditor(meta)
              }
            },
            vif(meta) { return meta.design.columnSource === 'objectModel' }
          },
          {
            label: '列配置',
            type: 'button',
            onClick() {
              const meta = context.activeComponent
              showColumnsEditor(meta)
            }
          },

          { label: '组件初始化', type: 'divider' },
          baseProps.common.dataType({
            mapping: 'children.design.dataType',
            options: options({ dynamic: '对象',objectModel:'模型', api: '服务' }),
            value: 'dynamic',
            type:"radio",
            onChange(val, meta) {
              if (val === 'dynamic') {
                meta.children.design.initApi = {}
                delete meta.props['@search']
              }
              let columnSourceObjectModel = meta.design.columnSourceObjectModel
              if (val === 'objectModel' && columnSourceObjectModel) {
                meta.children.design.initApi.functionCode = columnSourceObjectModel
                meta.children.design.initApi.apiUcode = ''
                meta.children.design.initApi.params = []
                // 获取api详细配置,并判断是否需要分页
                let api = ""
                window.getMetaManager().meta.objectModels.map(modelItem => {
                  modelItem.functionList.forEach(funcItem => {
                    if(funcItem.functionCode === columnSourceObjectModel) {
                      meta.design.initApiModelCode = modelItem.modelCode;
                      api = funcItem
                    }
                  })
                })
                meta.props.hasPagination = api.responseType === 'Page'
                if (meta.props.hasPagination) {
                  meta.props['@search'] = columnSourceObjectModel ? `${meta.uuid}_init` : ''
                }
                return true
              }
              let columnSourceApi = meta.design.columnSourceApi
              if (val === 'api' && columnSourceApi){
                meta.children.design.initApi.apiUcode = columnSourceApi
                meta.children.design.initApi.functionCode = ''
                meta.children.design.initApi.params = []
                // 获取api详细配置,并判断是否需要分页
                const api = window.getMetaManager().meta.apis.find(api => api.apiUcode === columnSourceApi)
                meta.children.design.initApi.isSeniorQuery = !!api.seniorQuery
                if (!meta.children.design.initApi.isSeniorQuery) {
                  delete meta.children.design.initApi.conditionList
                  delete meta.children.design.initApi.sortList
                }
                meta.props.hasPagination = api.responseType === 'Page'
                if (meta.props.hasPagination) {
                  meta.props['@search'] = columnSourceApi ? `${meta.uuid}_init` : ''
                }
                return true
              }
            }
          }),
          {
            label: '对象数据',
            mapping: 'children.props.:data',
            type: 'model',
            checkStrictly: true,
            help: '请选择对象模型',
            value: '',
            vif(meta) { return meta.children.design.dataType === 'dynamic' }
          },
          {
            label: '选择模型',
            mapping: 'children.design.initApi.functionCode',
            type: 'objectModel',
            help: '修改模型将清空原模型的参数配置,请谨慎操作',
            value: '',
            onChange(val, meta) {
              if (val) {
                meta.children.design.initApi.apiUcode = ''
                meta.children.design.initApi.params = []
                // 获取api详细配置,并判断是否需要分页
                let api = ""
                window.getMetaManager().meta.objectModels.map(modelItem => {
                  modelItem.functionList.forEach(funcItem => {
                    if(funcItem.functionCode === val) {
                      api = funcItem
                      meta.design.initApiModelCode = modelItem.modelCode;
                    }
                  })
                })
                meta.props.hasPagination = api.responseType === 'Page'
                if (meta.props.hasPagination) {
                  meta.props['@search'] = val ? `${meta.uuid}_init` : ''
                }
              } else {
                meta.props.hasPagination = false
              }
            },
            vif(meta) { return meta.children.design.dataType === 'objectModel' }
          },
          {
            label: '参数设置',
            type: 'button',
            buttonText: '设置',
            onClick(e, callback) {
              const funcCode = meta.children.design.initApi.functionCode || ''
              const params = meta.children.design.initApi.params || []
              bus.$emit(EVENTS.SHOW_PARAMS_EDITOR, {
                  params: params,
                  uuid: meta.uuid,
                  showSearch: true, // meta.props.dynamicSearch
                  modelCode:meta.design.initApiModelCode,
                  funcCode: funcCode,
                  callback(params) {
                    const initApi = meta.children.design.initApi
                    initApi.params = params
                    const filters = params.filter(p => p.isFilter)
                    // 如果设置了筛选参数,将自动开启筛选功能
                    const model = models.find(m => m.apiUcode === initApi.functionCode && m.type === 'request')
                    if (model) {
                      meta.design.paramModel = model.name
                    } else {
                      window.getApp().$message('未找到该服务的入参数据模型,无法开启筛选功能!')
                      meta.props.dynamicSearch = false
                    }
                    if (!meta.props.dynamicSearch && filters.length) {
                      meta.props.dynamicSearch = true
                      window.getApp().$message('您设置了筛选参数,将自动为你开启筛选功能!')
                    }
                    // 同步筛选条件配置项目
                    syncFilter(meta, filters)
                    callback()
                  }
          })
            },
            vif(meta) { return meta.children.design.initApi && meta.children.design.initApi.functionCode },
            help: '可设置表格初始化查询的参数'
          },
          {
            label: '选择服务',
            mapping: 'children.design.initApi.apiUcode',
            type: 'select',
            options: apis,
            labelKey: 'name',
            valueKey: 'apiUcode',
            help: '修改服务将清空原服务的参数配置,请谨慎操作',
            value: '',
            onChange(val, meta) {
              if (val) {
                meta.children.design.initApi.functionCode = ''
                meta.children.design.initApi.params = []
                // 获取api详细配置,并判断是否需要分页
                const api = window.getMetaManager().meta.apis.find(api => api.apiUcode === meta.children.design.initApi.apiUcode)
                meta.children.design.initApi.isSeniorQuery = !!api.seniorQuery
                if (!meta.children.design.initApi.isSeniorQuery) {
                  delete meta.children.design.initApi.conditionList
                  delete meta.children.design.initApi.sortList
                }
                meta.props.hasPagination = api.responseType === 'Page'
                if (meta.props.hasPagination) {
                  meta.props['@search'] = val ? `${meta.uuid}_init` : ''
                }
              } else {
                meta.props.hasPagination = false
              }
              return true
            },
            vif(meta) { return meta.children.design.dataType === 'api' }
          },
          {
            label: '参数设置',
            type: 'button',
            buttonText: '设置',
            onClick(e, callback) {
              const apiUcode = meta.children.design.initApi.apiUcode || ''
              const params = meta.children.design.initApi.params || []
              if (meta.children.design.initApi.isSeniorQuery) {
                bus.$emit(EVENTS.SHOW_CONDITION_EDITOR, {
                  conditionList: meta.children.design.initApi.conditionList || [],
                  sortList: meta.children.design.initApi.sortList,
                  apiUcode: apiUcode,
                  uuid: meta.uuid,
                  confirm(params) {
                    const initApi = meta.children.design.initApi
                    initApi.conditionList = params.conditionList
                    initApi.sortList = params.sortList
                    callback()
                  }
                })
              } else {
                bus.$emit(EVENTS.SHOW_PARAMS_EDITOR, {
                  params: params,
                  apiUcode: apiUcode,
                  uuid: meta.uuid,
                  showSearch: true, // meta.props.dynamicSearch
                  callback(params) {
                    const initApi = meta.children.design.initApi
                    initApi.params = params
                    const filters = params.filter(p => p.isFilter)
                    // 如果设置了筛选参数,将自动开启筛选功能
                    const model = models.find(m => m.apiUcode === initApi.apiUcode && m.type === 'request')
                    if (model) {
                      meta.design.paramModel = model.name
                    } else {
                      window.getApp().$message('未找到该服务的入参数据模型,无法开启筛选功能!')
                      meta.props.dynamicSearch = false
                    }
                    if (!meta.props.dynamicSearch && filters.length) {
                      meta.props.dynamicSearch = true
                      window.getApp().$message('您设置了筛选参数,将自动为你开启筛选功能!')
                    }
                    // 同步筛选条件配置项目
                    syncFilter(meta, filters)
                    callback()
                  }
                })
              }
            },
            vif(meta) { return meta.children.design.initApi && meta.children.design.initApi.apiUcode },
            help: '可设置表格初始化查询的参数和 高级筛选条件(需开启筛选功能)'
          },
          {
            label: '筛选组件设置',
            type: '$list',
            border: true,
            mapping: 'slots[1].children',
            supportDel: false,
            supportAdd: false,
            value: [],
            columns: [
              {
                mapping: 'props.prop',
                type: 'text',
                value: '',
                style: {
                  width: '80px'
                },
                onClick(e){
                  const rowIndex = getRowIndex(e.target)
                  const meta = context.activeComponent
                  const comp = meta.slots[1].children[rowIndex * 1]
                  bus.$emit(EVENTS.SHOW_CHILD_PROP, comp, meta.slots[1].children[rowIndex * 1])
                }
              },
              {
                mapping: 'design.fieldType',
                type: 'select',
                value: 'input',
                options: options({
                  text: '文本',
                  button: '按钮',
                  input: '输入框',
                  radio: '单选框',
                  'radio-group': '单选框组',
                  checkbox: '复选框',
                  'checkbox-group': '复选框组',
                  select: '下拉选择',
                  cascader: '级联选择器',
                  inputNumber: '数字输入框',
                  switch: '开关',
                  'date-picker': '日期选择器',
                  'time-picker': '时间选择器'
                }),
                onChange(val, meta) {
                  const comp = context.getConfig(val, meta)
                  // comp.uuid = ''
                  comp.design.mapping = 'children'
                  if (val === 'text') {
                    comp.children = `{{${meta.props.prop}}}`
                  } else {
                    comp.design.vmodel = meta.children.design.vmodel
                  }
                  comp.unaided = false
                  meta.children = comp
                }
              }, {
                mapping: 'prop',
                type: 'button',
                buttonText: ' ',
                btnType: 'text',
                icon: 'el-icon-edit-outline',
                onClick(e) {
                  const rowIndex = getRowIndex(e.target)
                  const meta = context.activeComponent
                  const comp = meta.slots[1].children[rowIndex * 1].children
                  bus.$emit(EVENTS.SHOW_CHILD_PROP, comp, meta.slots[1].children[rowIndex * 1])
                }
              }
            ],
            vif: 'slots[1].children'
          }

        ]
      },
      {
        group: '表格列',
        groupType: 'collapse',
        properties: [
          {
            type: '$list',
            mapping: 'children.columns',
            border: true,
            supportDel: false,
            supportAdd: false,
            value: [],
            columns: [
              {
                mapping: 'label',
                type: 'text',
                value: '',
                style: {
                  width: '150px'
                }
              },
              {
                mapping: 'prop',
                type: 'button',
                buttonText: ' ',
                btnType: 'text',
                icon: 'el-icon-edit-outline',
                onClick(e) {
                  const rowIndex = getRowIndex(e.target)
                  const col = meta.children.columns[rowIndex * 1]
                  col._name_ = 'table-column'
                  bus.$emit(EVENTS.SHOW_CHILD_PROP, col, meta)
                }

              }

            ]
          }
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          {
            group: true,
            class: 'flex-row flex-wrap',
            properties: [
              {
                label: '工具栏',
                type: 'bool',
                mapping: 'props.showHeader',
                value: false,
                onChange(val, meta) {
                  if (val) {
                    meta.slots[0] = getHeaderMeta()
                  } else {
                    meta.slots[0] = ''
                  }
                },
                help: '是否显示table上方的工具栏'
              },
              {
                label: '动态视图',
                type: 'bool',
                mapping: 'props.dynamicCol',
                value: false,
                help: '用户是否可自定义列顺序,列显示隐藏功能',
                vif: 'props.showHeader',
                onChange(val, meta) {
                  // id用于保存该table个性化列配置的key信息
                  meta.props.id = val ? meta.id : ''
                }
              }, {
                label: '筛选功能',
                type: 'bool',
                mapping: 'props.dynamicSearch',
                value: false,
                help: '是否显示工具栏的搜索按钮',
                vif: 'props.showHeader',
                onChange(val, meta) {
                  if (!val) {
                    meta.slots[1] = ''
                  }
                }
              }, {
                label: '显示序号',
                type: 'bool',
                value: false,
                mapping: 'children.design.showIndex',
                help: '是否显示序号列'
              },
              {
                label: '选择列',
                type: 'bool',
                value: false,
                mapping: 'children.design.showSelection',
                help: '是否显示选择框'
              }, {
                label: '多级表头',
                type: 'bool',
                mapping: 'design.multi-level-header',
                value: false,
                help: '是否启用多级表头'
              },
              {
                label: '边框',
                type: 'bool',
                value: true,
                mapping: 'children.props.border',
                help: '是否显示单元格纵向边框'
              }, {
                label: '显示表头',
                type: 'bool',
                value: true,
                mapping: 'children.props.show-header',
                help: '是否显示表头'
              }, {
                label: '斑马纹',
                type: 'bool',
                value: false,
                mapping: 'children.props.stripe',
                help: '是否为斑马纹 table'
              }, {
                label: '合计',
                type: 'bool',
                value: false,
                mapping: 'children.props.show-summary',
                help: '是否在表尾显示合计行'
              }, {
                label: '默认初始化',
                type: 'bool',
                value: true,
                mapping: 'design.autoInit',
                help: '如果配置了初始化接口,是否加载后自动调用初始化查询方法'
              }, {
                label: '高亮当前行',
                type: 'bool',
                value: false,
                mapping: 'children.props.highlight-current-row',
                help: '是否要高亮当前行'
              }, {
                label: '分页器',
                type: 'bool',
                value: false,
                mapping: 'props.hasPagination',
                help: '是否使用分页器'
              }, {
                label: '分页插槽',
                type: 'bool',
                value: false,
                mapping: 'props.showPaginationSlot',
                vif: 'props.hasPagination',
                onChange(val, meta) {
                  if (val) {
                    meta.slots[2] = getPagination()
                  } else {
                    meta.slots[2] = ''
                  }
                },
                help: '开启后，用户可以自定义分页器区域'
              }

            ]
          },
          {
            label: '分页尺寸',
            mapping: 'design.pageSize',
            type: 'select',
            options: [10, 20, 30, 50, 100],
            value: 10,
            onChange(val, meta) {
              meta.children.design.pageSize = val
            },
            help: '默认的分页尺寸'
          },
          {
            label: '分页器顺序',
            mapping: 'props.pageLayout',
            type: 'select',
            multiple: true,
            options: ['sizes', 'prev', 'pager', 'next', 'jumper', '->', 'total', 'slot'],
            value: ['sizes', '->', 'slot', 'prev', 'pager', 'next', 'jumper', 'total'],
            vif: 'props.hasPagination'
          },
          {
            label: '选择函数',
            mapping: 'children.design.selectable',
            type: 'method',
            onlyCode: true,
            value: '',
            vif: 'children.design.showSelection',
            help: 'Function(row, index), 返回值用来决定这一行的 CheckBox 是否可以勾选'
          }, {
            label: '主键字段',
            type: 'input',
            value: '',
            mapping: 'children.props.row-key',
            help: '行数据的 Key，用来优化 Table 的渲染,支持多层访问：user.info.id'
          },
          {
            label: '合计文本',
            type: 'i18n',
            value: '合计',
            mapping: 'children.props.sum-text',
            help: '合计行第一列的文本',
            vif: 'children.props.show-summary'
          }, {
            label: '合计函数',
            mapping: 'children.props.:summary-method',
            type: 'method',
            onlyCode: true,
            value: '',
            vif: 'children.props.show-summary',
            help: '自定义的合计计算方法,Function({ columns, data })'
          }, {
            label: '列行合并',
            mapping: 'children.props.:span-method',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '合并行或列的计算方法,Function({ row, column, rowIndex, columnIndex })'
          },
          {
            label: '单元格class',
            mapping: 'children.props.:cell-class-name',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '单元格的 className 的回调方法,Function({ row, column, rowIndex, columnIndex })'
          },
          {
            label: '数据加工',
            mapping: 'children.design.initApi.resultTransform',
            type: 'method',
            onlyCode: true,
            value: '',
            vif(meta) { return meta.children.design.initApi && meta.children.design.initApi.apiUcode },
            help: '如需要对服务返回的数据做加工处理,可选择数据自定义方法,并在方法内返回修正好的数据'
          },
          baseProps.common.classList(),
          baseProps.common.margin(),
          ...baseProps.common.vif(),
          baseProps.common.customAttr()
        ]
      }
    ]
  },

  getEvents() {
    return [
      { id: 'click', label: '点击事件' }
    ]
  },

  getContextMenu() {
    return [
      {
        code: 'event', name: '事件编排', icon: 'el-icon-setting', handle: (meta) => {
          bus.$emit(EVENTS.SHOW_EVENT_SETUP, meta.uuid)
        }
      },
      { code: 'sort', name: '列排序', icon: 'el-icon-sort', handle: (meta) => {
        bus.$emit(EVENTS.SHOW_SORT_DIALOG, {
          title: '表格列排序',
          data: meta.children.columns,
          callback(list) {
            meta.children.columns = list
          }
        })
      } }
    ]
  }

}
context.components['table'] = {
  // 组件默认配置
  getConfig() {
    return {
      uuid: '',
      name: 'table',
      props: {
        size: constants.COMMON_SIZE,
        border: true,
        'header-cell-class-name': 'p-header-cell'
      },
      design: {
        autoWidth: true,
        bindDataAttr: 'data'
      },
      columns: [
        { label: '编号', prop: 'id', custom: true, show: true },
        { label: '名称', prop: 'name', custom: true, show: true }
      ],
      class: {},
      style: {},
      ref: true,
      insertInitFn: true
    }
  },
  getProperties() {

  },
  getEvents() {
    return [
      { id: 'select', label: '勾选 Checkbox 时触发的事件' },
      { id: 'select-all', label: '勾选全选 Checkbox 时触发的事件' },
      { id: 'selection-change', label: '当选择项发生变化事件' },
      { id: 'cell-click', label: '单元格点击事件' },
      { id: 'row-click', label: '行点击事件' },
      { id: 'row-dblclick', label: '当某一行被双击时会触发该事件' },
      { id: 'header-click', label: '列头点击事件' },
      { id: 'expand-change', label: '展开行事件' },
    ]
  },
  getMethods() {
    // this.$refs.multipleTable.selection
    return [
      { id: 'clearSelection', label: '用于多选表格，清空用户的选择' },
      { id: 'toggleRowSelection', label: '用于多选表格，切换某一行的选中状态' },
      { id: 'doLayout', label: '对 Table 进行重新布局。当 Table 或其祖先元素由隐藏切换为显示时，可能需要调用此方法' }
    ]
  },

  beforeRender(renderOpts) {
    renderOpts.on['header-click'] = function(column, ev) {
      const metadata = window.getMetaManager()
      const uuid = getComponentId(ev.target)
      const comp = metadata.getComponentById(uuid)
      if (comp && column.property) {
        const meta = comp.children.columns.find(col => col.prop === column.property)
        if (meta && meta !== context.activeMeta) {
          meta._name_ = 'table-column'
          meta.design = meta.design || {}
          metadata.selectMetadata(meta, comp)
          ev.stopPropagation()
        }
      }
    }
  },

  getMockData(meta) {
    const data = [{ id: 1 }]
    meta.columns.forEach(col => {
      if (col.prop) {
        setValueByPath(data[0], col.prop, 1)
      }
    })
    return data
  }

}

function getHeaderMeta() {
  return Object.assign(context.getConfig('layout'), {
    slot: 'header',
    design: {
      mapping: 'slots.0',
      span: 24,
      layout: 'row'
    },
    children: []
  })
}
function getPagination() {
  return Object.assign(context.getConfig('layout'), {
    slot: 'pagination',
    design: {
      mapping: 'slots.2',
      span: 24,
      layout: 'row'
    },
    children: []
  })
}

function showColumnsEditor(meta) {
  if(meta.design.columnSource === 'objectModel') {
    bus.$emit(EVENTS.SHOW_COLUMNS_EDITOR, {
      columns: meta.children.columns,
      modelCode:meta.design.columnSourceObjectModelCode,
      funcCode:meta.design.columnSourceObjectModel,
      complexHeader: meta.design['multi-level-header'],
      callback(columns) {
        meta.children.columns.length = 0
        meta.children.columns.push(...columns)
      }
    })
    return
  }
  const apiUcode = meta.design.columnSourceApi
  bus.$emit(EVENTS.SHOW_COLUMNS_EDITOR, {
    modelCode:meta.design.columnSourceObjectModelCode,
    funcCode:meta.design.columnSourceObjectModel,
    columnSource:meta.design.columnSource,
    columnSourceObj:meta.design.columnSourceObj,
    columns: meta.children.columns,
    apiUcode: apiUcode,
    complexHeader: meta.design['multi-level-header'],
    callback(columns) {
      meta.children.columns.length = 0
      meta.children.columns.push(...columns)
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

function syncFilter(meta, filters) {
  // 如果开启了动态筛选功能,并且含有筛选条件
  if (meta.props.dynamicSearch && filters.length) {
    meta.slots[1] = {
      name: 'form',
      slot: 'search',
      props: {
        titleWidth: '120px',
        titleAlign: 'right',
        ':data': meta.design.paramModel
      },
      style: {},
      children: filters.map(col => {
        let field = ''
        if (meta.slots[1] && meta.slots[1].children) {
          field = meta.slots[1].children.find(item => item.props.prop === col.name)
        }
        return field || {
          name: 'form-item',
          props: {
            title: col.label,
            prop: col.name
          },
          design: { fieldType: '' },
          style: {
            width: '100%'
          },
          children: Object.assign(context.getConfig('input', {}), {
            design: {
              vmodel: `${meta.design.paramModel}.${col.name}`
            }
          })
        }
      })
    }
  } else {
    meta.slots[1] = ''
  }
}
