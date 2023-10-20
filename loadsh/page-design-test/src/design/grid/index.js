import context from '@/common/context'
import baseProps from '../baseProps'
import './gridColumn'
import './gridButton'
import { bus, EVENTS } from '@/common/eventBus'
import { getComponentId, options, setValueByPath } from '@/utils/util'
context.components.grid = {
  // 组件默认配置

  getConfig() {
    return {
      uuid: '',
      name: 'grid',
      props: {
        height: 400,
        'row-height': 36,
        'toolbar-config': {
          buttons: [
          ]
        },
        'footer-action-config': {
          showBorder: true
        }

      },
      design: {
        bindDataAttr: 'data',
        proxyConfig: {
          request: {
            query: null
          }
        }

      },
      columns: [
        { id: 'id', label: '编号', prop: 'id', custom: true, show: true },
        { id: 'name', label: '名称', prop: 'name', custom: true, show: true }
      ],
      class: {},
      style: {},
      slots: [
        getHeaderMeta()
      ],
      events: {},
      ref: true,
      insertInitFn: true
    }
  },
  // 组件的属性配置
  getProperties(meta) {
    const apis = window.getMetaManager().meta.apis || []
    return [
      {
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.compId(),
          {
            label: '高度',
            mapping: 'props.height',
            type: 'number',
            value: '',
            clearable: true,
            help: '表格高度设置,单位px'
          },
          baseProps.common.span(),
          { label: '列配置', type: 'divider' },
          {
            label: '表头来源',
            mapping: 'design.columnSource',
            type: 'radio',
            options: options({ static: '静态', object:'对象',  objectModel: '模型',api: '服务' }),
            value: 'static',
            onChange(val, meta) {
              meta.columns.length = 0
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
                meta.columns.length = 0
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
            value: '',
            onChange(val, meta) {
              if (val) {
                meta.columns.length = 0
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
            mapping: 'design.dataType',
            options: options({ dynamic: '对象',objectModel:'模型', api: '服务' }),
            value: 'dynamic',
            type:'radio',
            onChange(val, meta) {
              if (val === 'dynamic') {
                meta.design.initApi = {}
              }
              let apiUcode = meta.design.columnSourceApi
              if (val === 'api' && apiUcode) {
                meta.design.initApi.apiUcode = apiUcode
                meta.design.initApi.params = []
                // 获取api详细配置,并判断是否需要分页
                const api = window.getMetaManager().meta.apis.find(api => api.apiUcode === apiUcode)
                meta.design.initApi.isSeniorQuery = !!api.seniorQuery
                if (!meta.design.initApi.isSeniorQuery) {
                  delete meta.design.initApi.conditionList
                  delete meta.design.initApi.sortList
                }
                if (api) {
                  meta.props['footer-action-config'].showPager = api.responseType === 'Page'
                }
                return true
              }
              let modelCode = meta.design.columnSourceObjectModel
              if (val === 'objectModel' && modelCode) {
                meta.design.initApi.functionCode = modelCode
                meta.design.initApi.params = []
                // 获取api详细配置,并判断是否需要分页
                let api = ""
                window.getMetaManager().meta.objectModels.map(modelItem => {
                  modelItem.functionList.forEach(funcItem => {
                    if(funcItem.functionCode === modelCode) {
                      meta.design.initApiModelCode = modelItem.modelCode;
                      api = funcItem
                    }
                  })
                })
                meta.props['footer-action-config'].showPager = api.responseType === 'Page'
                return true
              } else {
                meta.props['footer-action-config'].showPager = false
                return true
              }
            }
          }),
          {
            label: '模型数据',
            mapping: 'props.:data',
            type: 'model',
            checkStrictly: true,
            help: '请选择数据模型',
            value: '',
            vif(meta) { return meta.design.dataType === 'dynamic' }
          },
          {
            label: '选择模型',
            mapping: 'design.initApi.functionCode',
            type: 'objectModel',
            help: '修改模型将清空原模型的参数配置,请谨慎操作',
            value: '',
            onChange(val, meta) {
              if (val) {
                meta.design.initApi.params = []
                // 获取api详细配置,并判断是否需要分页
                // const api = window.getMetaManager().meta.models.find(api => api.apiUcode === meta.design.initApi.functionCode)
                let api = ""
                window.getMetaManager().meta.objectModels.map(modelItem => {
                  modelItem.functionList.forEach(funcItem => {
                    if(funcItem.functionCode === val) {
                      api = funcItem
                      meta.design.initApiModelCode = modelItem.modelCode;
                    }
                  })
                })
                meta.props['footer-action-config'].showPager = api.responseType === 'Page'
              } else {
                meta.props['footer-action-config'].showPager = false
              }
            },
            vif(meta) { return meta.design.dataType === 'objectModel' }
          },
          {
            label: '参数设置',
            type: 'button',
            buttonText: '设置',
            onClick(e, callback) {
              const funcCode = meta.design.initApi.functionCode || ''
              const params = meta.design.initApi.params || []
              bus.$emit(EVENTS.SHOW_PARAMS_EDITOR, {
                params: params,
                modelCode:meta.design.initApiModelCode,
                funcCode: funcCode,
                uuid: meta.uuid,
                showSearch: meta.props.dynamicSearch,
                callback(params) {
                  meta.design.initApi.params = params
                }
              })
            },
            vif(meta) { return meta.design.initApi && meta.design.initApi.functionCode },
            help: '可设置表格初始化查询的参数'
          },
          {
            label: '选择服务',
            mapping: 'design.initApi.apiUcode',
            type: 'select',
            options: apis,
            labelKey: 'name',
            valueKey: 'apiUcode',
            help: '修改服务将清空原服务的参数配置,请谨慎操作',
            value: '',
            onChange(val, meta) {
              if (val) {
                meta.design.initApi.params = []
                // 获取api详细配置,并判断是否需要分页
                const api = window.getMetaManager().meta.apis.find(api => api.apiUcode === meta.design.initApi.apiUcode)
                meta.design.initApi.isSeniorQuery = !!api.seniorQuery
                if (!meta.design.initApi.isSeniorQuery) {
                  delete meta.design.initApi.conditionList
                  delete meta.design.initApi.sortList
                } else {
                  meta.design.initApi.sortList = []
                  meta.design.initApi.conditionList = []
                  meta.props['toolbar-config'].diySearch = true
                  meta.props['toolbar-config'].seniorQuery = true
                }
                meta.props['footer-action-config'].showPager = api.responseType === 'Page'
                return true
              } else {
                meta.props['footer-action-config'].showPager = false
              }
            },
            vif(meta) { return meta.design.dataType === 'api' }
          }, {
            label: '参数设置',
            type: 'button',
            buttonText: '设置',
            onClick(e, callback) {
              const apiUcode = meta.design.initApi.apiUcode || ''
              const params = meta.design.initApi.params || []
              if (meta.design.initApi.isSeniorQuery) {
                bus.$emit(EVENTS.SHOW_CONDITION_EDITOR, {
                  conditionList: meta.design.initApi.conditionList || [],
                  sortList: meta.design.initApi.sortList,
                  apiUcode: apiUcode,
                  uuid: meta.uuid,
                  confirm(params) {
                    const initApi = meta.design.initApi
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
                  showSearch: meta.props.dynamicSearch,
                  callback(params) {
                    meta.design.initApi.params = params
                  }
                })
              }
            },
            vif(meta) { return meta.design.initApi && meta.design.initApi.apiUcode },
            help: '可设置表格初始化查询的参数'
          },
          {
            label: 'loading',
            mapping: 'design.showLoading',
            type: 'bool',
            value: true,
            help: '是否显示数据加载loading',
            vif(meta) { return meta.design.initApi && meta.design.initApi.apiUcode }
          }
        ]
      },
      {
        group: '表格列',
        groupType: 'collapse',
        properties: [
          {
            type: '$list',
            mapping: 'columns',
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
                  const meta = context.activeComponent
                  const col = meta.columns[rowIndex * 1]
                  col._name_ = 'grid-column'
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
                label: '显示序号',
                type: 'bool',
                value: false,
                mapping: 'design.showIndex',
                help: '是否显示序号列'
              },
              {
                label: '监听表格',
                type: 'bool',
                value: true,
                mapping: 'props.watchCell',
                help: '是否监听值的变化，当配置了‘数据变更且失去焦点后触发’事件'
              },
              {
                label: '选择列',
                type: 'bool',
                value: false,
                mapping: 'design.showSelection',
                help: '是否显示选择框'
              }, {
                label: '多选模式',
                type: 'bool',
                value: true,
                mapping: 'design.multiple',
                help: '默认为多选 checkbox 模式, 单选为radio模式'
              }, {
                label: '编辑',
                type: 'bool',
                value: false,
                mapping: 'props.edit',
                help: '是否启用编辑功能'
              }, {
                label: '合计',
                type: 'bool',
                value: false,
                mapping: 'props.show-summary',
                help: '是否在表尾显示合计行'
              }, {
                label: '区域选择',
                type: 'bool',
                value: false,
                mapping: 'props.selectRange',
                help: '是否开启区域选择功能'
              }, {
                label: '复制',
                type: 'bool',
                value: false,
                mapping: 'props.copy',
                help: '是否开启复制功能'
              },
              {
                label: '边框',
                type: 'bool',
                value: true,
                mapping: 'props.border',
                help: '是否显示单元格纵向边框'
              }, {
                label: '显示表头',
                type: 'bool',
                value: true,
                mapping: 'props.show-header',
                help: '是否显示表头'
              }, {
                label: '全屏按钮',
                type: 'bool',
                value: false,
                mapping: 'props.toolbar-config.fullscreen',
                help: '是否显示全屏按钮'
              }, {
                label: '列拖动',
                type: 'bool',
                value: false,
                mapping: 'props.drag',
                help: '是否启用列拖动'
              }, {
                label: '列控制',
                type: 'bool',
                value: false,
                mapping: 'props.toolbar-config.columnControl',
                help: '开启列控制功能（显示/隐藏）'
              }, {
                label: '批量控制',
                type: 'bool',
                value: false,
                mapping: 'props.toolbar-config.columnBatchControl',
                help: '开启列批量控制功能（显示/隐藏、排序、列固定）'
              }, {
                label: '替换填充',
                type: 'bool',
                value: false,
                mapping: 'props.toolbar-config.showReplace',
                help: '启用替换和填充功能'
              }, {
                label: '高级搜索',
                type: 'bool',
                value: false,
                mapping: 'props.toolbar-config.diySearch',
                help: '是否启用高级搜索功能',
                onChange(val, meta) {
                  if (val) {
                    meta.props['toolbar-config'].seniorQuery = true
                  } else {
                    meta.props['toolbar-config'].seniorQuery = false
                  }
                  return true
                }
              }, {
                label: '刷新功能',
                type: 'bool',
                value: false,
                mapping: 'props.toolbar-config.refresh',
                help: '启用替换和填充功能'
              }, {
                label: '展开行',
                type: 'bool',
                value: false,
                mapping: 'design.showExpand',
                help: '是否支持行展开功能',
                onChange(val, meta) {
                  if (val) {
                    if (!meta.slots[1]) {
                      meta.slots.push(getExpandSlot())
                    }
                  } else {
                    if (meta.slots[1]) {
                      meta.slots.pop()
                    }
                  }
                  return true
                }
              },
              {
                label: '自定义分页',
                type: 'bool',
                value: false,
                mapping: 'props.footer-action-config.showPager',
                help: '是否使用自定义的分页数据'
              },
              {
                label: '右侧工具栏',
                type: 'bool',
                value: false,
                mapping: 'props.toolbar-right-buttons',
                onChange(val, meta) {
                  meta.slots[1] = meta.slots[1] ? meta.slots[1] : ''
                  if (val) {
                    meta.slots[2] = getToolbarRightButtonsSlot()
                  } else {
                    meta.slots[2] = ''
                  }
                  return true
                },
                help: '开启后，用户可以自定义添加工具栏右侧内容'
              }
            ]
          },
          {
            label: '主键字段',
            // type: 'input',
            type: 'field-select',
            value: '',
            params: meta,
            mapping: 'props.rowId',
            help: '表格数据的唯一标识字段名,默认值为id'
          },
          {
            label: '树形表格',
            type: 'bool',
            value: false,
            mapping: 'design.showTreeConfig',
            help: '是否开启树形数据'
          },
          {
            label: '子级字段',
            type: 'field-select',
            value: '',
            params: meta,
            mapping: 'design.treeConfigChildenKey',
            vif: 'design.showTreeConfig',
            help: '表格树形数据的子级字段,默认值为children'
          },
          {
            label: '分页尺寸',
            mapping: 'props.footer-action-config.pageConfig.pageSize',
            type: 'select',
            options: [10, 20, 30, 50, 100],
            value: 10,
            help: '默认的分页尺寸'
          },
          {
            label: '分页器顺序',
            mapping: 'design.pageLayout',
            type: 'select',
            multiple: true,
            options: ['sizes', 'prev', 'pager', 'next', 'jumper', 'total'],
            value: ['sizes', 'prev', 'pager', 'next', 'jumper', 'total'],
            vif: 'props.footer-action-config.showPager',
            onChange(val, meta) {
              if (val) {
                meta.slots[1] = meta.slots[1] ? meta.slots[1] : ''
                meta.slots[2] = meta.slots[2] ? meta.slots[2] : ''
                if(val.includes('slot')) {
                  meta.slots[3] = getPaginationSlot()
                } else {
                  meta.slots[3] = ''
                }
                meta.props['footer-action-config'].pageConfig.layout = val.join(',');
              }
              return true
            },
          },
          {
            label: '工具按钮',
            type: 'select',
            multiple: true,
            value: '',
            options: options({
              add_focus: '新增',
              insert_focus: '插入',
              delete: '直接删除',
              mark_cancel: '删除/取消',
              save: '保存'
            }),
            mapping: 'design.buttons',
            help: '表格数据的唯一标识字段名,默认值为id',
            onChange(val, meta) {
              if (val) {
                meta.props['toolbar-config'].buttons = getToolbarButtons(meta, val)
              }
              return true
            },
          },
          {
            label: '合计文本',
            type: 'i18n',
            value: '合计',
            mapping: 'props.sum-text',
            help: '合计行第一列的文本',
            vif: 'props.show-summary'
          }, {
            label: '合计函数',
            mapping: 'props.:summary-method',
            type: 'method',
            onlyCode: true,
            value: '',
            vif: 'props.show-summary',
            help: '自定义的合计计算方法,Function({ columns, data })'
          },
          {
            label: '行高',
            mapping: 'props.row-height',
            type: 'number',
            value: 36,
            clearable: true,
            help: '表格行高度,默认为36px'
          }, {
            label: '行类名',
            mapping: 'props.:row-class-name',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '表格行的动态类名,Function({row, rowIndex})'
          }, {
            label: '列类名',
            mapping: 'props.:cell-class-name',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '单元格的动态类名,Function({row, column, rowIndex, columnIndex})'
          }, {
            label: '插入前',
            mapping: 'props.:beforeInsert',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '插入数据前的钩子函数,function(records)'
          }, {
            label: '数据加工',
            mapping: 'design.initApi.resultTransform',
            type: 'method',
            onlyCode: true,
            value: '',
            vif(meta) { return meta.design.initApi && meta.design.initApi.apiUcode },
            help: '如需要对服务返回的数据做加工处理,可选择自定义函数,并在方法内返回修正好的数据'
          },
          {
            label: '列行合并',
            mapping: 'props.:span-method',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '合并行或列的计算方法,Function({ row, column, rowIndex, columnIndex }),备注:支持编辑及复制功能，不能用于虚拟滚动、树形结构、展开行、固定列'
          },
          {
            label: '筛选条件',
            mapping: 'props.:dataFilterCallback',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '会按照这个方法去筛选那些数据显示,Function(row),备注:函数内部要return一个布尔值'
          },
          baseProps.common.classList(),
         ... baseProps.common.vif(),
          baseProps.common.customAttr()
        ]
      },
      {
        group: '工具按钮',
        groupType: 'collapse',
        vif(meta) { 
          return meta.props['toolbar-config'].buttons.length > 0 
        },
        properties: [
          {
            type: '$list',
            mapping: 'props.toolbar-config.buttons',
            border: true,
            supportDel: false,
            supportAdd: false,
            supportSort: false,
            value: [],
            columns: [
              {
                mapping: 'children',
                type: 'text',
                value: '',
                style: {
                  width: '150px'
                }
              },
              {
                mapping: 'code',
                type: 'button',
                buttonText: ' ',
                btnType: 'text',
                icon: 'el-icon-edit-outline',
                onClick(e) {
                  const rowIndex = getRowIndex(e.target)
                  const meta = context.activeComponent
                  const col = meta.props['toolbar-config'].buttons[rowIndex * 1]
                  col._name_ = 'grid-button'
                  bus.$emit(EVENTS.SHOW_CHILD_PROP, col, meta)
                }

              }

            ]
          }
        ]
      }
    ]
  },

  getEvents() {
    return [
      { id: 'select', label: '勾选 Checkbox 时触发的事件' },
      { id: 'select-all', label: '勾选全选 Checkbox 时触发的事件' },
      { id: 'selection-change', label: '当选择项发生变化事件' },
      { id: 'cell-click', label: '单元格点击事件' },
      { id: 'cell-dblclick', label: '单元格双击事件' },
      { id: 'field-change', label: '单元格数据变化事件' },
      { id: 'row-click', label: '行点击事件' },
      { id: 'header-click', label: '列头点击事件' },
      { id: 'header-dbclick', label: '列头双击事件' },
      { id: 'delete_click', label: '删除按钮点击事件' },
      { id: 'save_click', label: '保存按钮点击事件' },
      { id: 'data-change', label: '当表格发生数据变更时触发（实时）' },
      { id: 'table-update-data', label: '当表格发生数据变更且失去焦点后触发' },
      { id: 'table-page-size-change', label: '当表格分页当前页发生改变触发' },
      { id: 'table-page-num-change', label: '当表格分页每页大小发生改变触发' },
      { id: 'edit-fields', label: '表格粘贴后触发' }
    ]
  },
  getMockData(meta) {
    const data = [{ id: 1 }]
    meta.columns.forEach(col => {
      if (col.prop) {
        setValueByPath(data[0], col.prop, 1)
      }
    })
    return data
  },

  beforeRender(renderOpts) {
    renderOpts.on['header-click'] = function({ column, cell, event }) {
      const metadata = window.getMetaManager()
      const uuid = getComponentId(event.target)
      const comp = metadata.getComponentById(uuid)
      if (comp && column.id) {
        let meta = null
        comp.columns.find(col => {
          if (col.id === column.id) {
            meta = col
            return true
          } else if (col.children && col.children.length) {
            meta = col.children.find(item => item.id === column.id)
            return meta
          }
        })
        if (meta && meta !== context.activeMeta) {
          meta._name_ = 'grid-column'
          meta.design = meta.design || {}
          metadata.selectMetadata(meta, comp)
          event.stopPropagation()
        }
      }
    }
  }

}

function getHeaderMeta() {
  return Object.assign(context.getConfig('layout'), {
    slot: 'toolbar',
    design: {
      mapping: 'slots.0',
      layout: 'row'
    },
    style: {
      'flex-wrap': 'wrap',
      'width': '200px'
    },
    children: []
  })
}
function getExpandSlot() {
  return Object.assign(context.getConfig('layout'), {
    slot: 'expand',
    design: {
      mapping: 'slots.1',
      layout: 'row'
    },
    props: {
      'slot-scope': 'scope'
    },
    style: {
      'flex-wrap': 'wrap'
    },
    children: []
  })
}

function getToolbarRightButtonsSlot() {
  return Object.assign(context.getConfig('layout'), {
    slot: 'toolbarRightButtons',
    design: {
      mapping: 'slots.2',
      layout: 'row'
    },
    style: {
      'flex-wrap': 'wrap',
      'width': '200px'
    },
    children: []
  })
}
function getPaginationSlot() {
  return Object.assign(context.getConfig('layout'), {
    slot: 'pagination',
    design: {
      mapping: 'slots.3',
      span: 24,
      layout: 'row'
    },
    children: []
  })
}
function getToolbarButtons(meta, val) {
  const btns = [{ name: 'button', code: 'add_focus', children: '新增', props: { icon: 'el-icon-plus' }},
    { name: 'button', code: 'insert_focus', children: '插入', props: { icon: 'el-icon-plus' }},
    { name: 'button', code: 'delete', children: '直接删除', props: { icon: 'el-icon-delete' }},
    { name: 'button', code: 'mark_cancel', children: '删除/取消', props: { icon: 'el-icon-delete' }},
    { name: 'button', code: 'save', children: '保存', props: { icon: 'el-icon-check' }, status: 'success' }
  ]
  let newBtns = []
  val.forEach(btnCode => {
    let btnItem = meta.props['toolbar-config'].buttons.find(btn => {
      return btn.code === btnCode
    })
    if(btnItem) {
      newBtns.push(btnItem)
    } else {
      newBtns.push(btns.filter(item => item.code === btnCode)[0])
    }
  })
  
  return newBtns
}

function showColumnsEditor(meta) {
  if(meta.design.columnSource === 'objectModel') {
    bus.$emit(EVENTS.SHOW_COLUMNS_EDITOR, {
      columns: meta.columns,
      modelCode:meta.design.columnSourceObjectModelCode,
      funcCode:meta.design.columnSourceObjectModel,
      complexHeader: true || meta.design['multi-level-header'],
      callback(columns) {
        meta.columns.length = 0
        meta.columns.push(...columns)
      }
    })
  } else {
    const apiUcode = meta.design.columnSourceApi
    bus.$emit(EVENTS.SHOW_COLUMNS_EDITOR, {
      columnSource:meta.design.columnSource,
      columnSourceObj:meta.design.columnSourceObj,
      columns: meta.columns,
      apiUcode: apiUcode,
      complexHeader: true || meta.design['multi-level-header'],
      callback(columns) {
        meta.columns.length = 0
        meta.columns.push(...columns)
      }
    })
  }

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

