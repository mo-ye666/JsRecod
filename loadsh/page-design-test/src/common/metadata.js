import context from '@/common/context'

import { bus, EVENTS } from '@/common/eventBus'
import { treeEach, type, uuid, getUrlParams } from '@/utils/util'
import Vue from 'vue'

/**
 * 元数据管理对象
 */
class Metadata {
  meta = {

  }

  constructor() {
    this.reset()
  }
  reset() {
    const isComponent = getUrlParams('type') === 'components'
    this.meta = {
      id: (isComponent ? 'comp-' : 'page-') + uuid(8),
      uuid: 'page',
      name: 'layout',
      engine: 'PageDesign',
      isComponent,
      isPageRoot: true,
      props: {},
      customClass:'',
      design: {
      },
      style: {
        height: 'auto',
        width: '100%'
      },
      children: [],
      events: {
        methods: {
          id: 'PageMethods',
          label: '编排函数',
          children: []
        },
        listener: {
          id: 'PageListener',
          label: '页面监听',
          children: []
        },
        codeMethods: {
          id: 'PageCodeMethods',
          label: '自定义函数',
          children: []
        },
        pageInit: {
          id: 'PageInit',
          label: '页面初始化',
          children: []
        },
        pageDestory: {
          id: 'PageDestory',
          label: '页面销毁',
          children: []
        },
        pageActivated: {
          id: 'PageActivated',
          label: '页面激活',
          children: []
        }
      },
      objectModels:[],
      apis: [],
      models: [{
        id: isComponent ? 'props' : 'params',
        name: isComponent ? 'props' : 'params',
        label: isComponent ? '组件属性' : '页面参数模型',
        type: 'system',
        fields: [

        ]
      }, {
        id: 'pageData',
        name: 'pageData',
        label: '自定义数据模型',
        fields: [

        ]
      }]
    }
  }

  save() {

  }
  getMeta() {
    return this.meta
  }

  /**
   * 根据组件uuid 获取组件元数据对象
   * @param {string} id
   * @returns component 元数据
   */
  getComponentById(id) {
    const comps = []
    this.compEach([this.meta], (comp) => {
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
   * 根据组件uuid 获取组件元数据元数据路径 [comp,parent,...rootParent]
   * @param {string} id
   * @returns component 元数据
   */
  getCompPathById(id) {
    const path = []
    const eachFn = (list) => {
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        if (item.uuid === id) {
          path.push(item)
          return true
        } else if (Array.isArray(item.children) && item.children.length) {
          if (eachFn(item.children)) {
            path.push(item)
            return true
          }
        } else if (type(item.children) === 'object') {
          if (eachFn([item.children])) {
            path.push(item)
            return true
          }
        } else if (item.config && item.config.uuid) {
          if (eachFn([item.config])) {
            path.push(item)
            return true
          }
        }
        if (Array.isArray(item.slots) && item.slots.length) {
          if (eachFn(item.slots)) {
            path.push(item)
            return true
          }
        }
        if (Array.isArray(item.columns) && item.columns.length) {
          if (eachFn(item.columns)) {
            path.push(item)
            return true
          }
        }
      }
    }
    eachFn([this.meta])
    return path
  }

  getParent(uuid) {
    const arr = this.getCompPathById(uuid)
    return arr[1]
  }
  copyNode(comp) {
    const newNode = JSON.parse(JSON.stringify(comp))
    const idMap = {}
    this.compEach([newNode], (node) => {
      if (node.uuid) {
        const newId = context.uuid(node.name)
        idMap[node.uuid] = newId
        node.uuid = newId
      }
      if (node.pid) {
        node.pid = idMap[node.pid]
      }
      if (node.id) {
        node.id = uuid(16)
      }
      if (node.design) {
        node.design.selected = false
      }
    })
    return newNode
  }
  compEach(list, fn) {
    list.forEach((child) => {
      fn(child)
      if (Array.isArray(child.children)) {
        this.compEach(child.children, fn)
      } else if (type(child.children) === 'object') {
        this.compEach([child.children], fn)
      }
      if (Array.isArray(child.slots)) {
        this.compEach(child.slots, fn)
      }
      if (Array.isArray(child.columns)) {
        if (child.name === 'grid') {
          treeEach(child.columns, col => {
            if (col.config && col.config.uuid) {
              this.compEach([col.config], fn)
            }
          })
        } else {
          this.compEach(child.columns, fn)
        }
      }
    })
  }

  removeComponent(uuid) {
    const comps = this.getCompPathById(uuid)
    const currComponent = comps.shift()
    if (currComponent.design && currComponent.design.mapping) {
      window.getApp().$message.warning('内部组件无法删除')
      return
    }
    const parent = comps.shift()
    bus.$emit(EVENTS.DESIGN_COMPONENT_REMOVE, uuid)
    // bus.$emit(EVENTS.COMPONENT_DRAG_END)
    if (parent) {
      if (Array.isArray(parent.children)) {
        parent.children = parent.children.filter(item => item !== currComponent)
      } else if (parent.children === currComponent) {
        if (parent.name === 'col') {
          const colParent = comps.shift()
          colParent.children = colParent.children.filter(item => item !== parent)
        } else {
          parent.children = []
        }
      }
      bus.$emit(EVENTS.METADATA_STEP_UPDATE)
    }
  }

  // 选中组件
  selectComponent(uuid, e) {
    const compPath = this.getCompPathById(uuid)
    if (compPath.length) {
      if (context.activeComponent === compPath[0]) {
        return
      }
      this.unSelected()
      context.activeComponent = compPath[0]
      // document.querySelector('#design_panel').querySelector(`[uuid="${uuid}"]`).classList.add('design-selected')
      Vue.set(context.activeComponent.design, 'selected', true)
      context.activeCompPath = compPath
      // 触发面板组件被选中事件, 并将 组件与其路径当做参数发送出去
      bus.$emit(EVENTS.COMPONENT_SELECTED, compPath[0], compPath[1], e)
    }
  }

  selectMetadata(meta, parent) {
    this.unSelected()
    context.activeMeta = meta
    if (meta.design) {
      meta.design.selected = true
      bus.$emit(EVENTS.MEATA_SELECTED, meta, parent)
    }
  }

  unSelected() {
    if (context.activeComponent) {
      Vue.set(context.activeComponent.design, 'selected', false)
    }
    var dom = document.querySelector('#design_panel')
    if (dom) {
      dom = dom.querySelector('.design-selected')
    }
    if (dom && dom.classList) {
      dom.classList.remove('design-selected')
    }
    if (context.activeMeta && context.activeMeta.design) {
      context.activeMeta.design.selected = false
    }
    context.activeMeta = null
    // context.activeComponent = null
    context.activeCompPath = null
  }

  toJson() {
    console.log('tojson', this.meta)
    return JSON.stringify(this.meta)
  }
  /**
   * 代码模式修改元数据后需要刷新uuid生成器序列号
   * 通过遍历当前元数据对象,获取到当前所有uuid,并将最大值设置到上下文对象的uuid生成器中,避免出现uuid重复
   */
  updateIdStore() {
    this.compEach(this.meta.children, (item) => {
      if (item.uuid) {
        context.uuid(item.name, parseInt(item.uuid.split('_').pop()) - 1)
      }
    })
    if (!this.meta.events.pageActivated) {
      this.meta.events.pageActivated = {
        id: 'PageActivated',
        label: '页面激活',
        children: []
      }
    }
  }

  /**
   * 根据字段ID获取模型字段信息
   * @param {string} fieldId
   */
  getModelField(fieldId) {
    let theField = null
    function findField(field, id) {
      if (field.id === id) {
        theField = field
        return true
      } else if (field.children) {
        return field.children.some(item => {
          return findField(item, id)
        })
      }
    }
    this.meta.models.some(model => {
      if (model.name === fieldId) {
        theField = model
        return true
      } else if (model.fields) {
        model.fields.some(field => {
          return findField(field, fieldId)
        })
      }
    })
    return theField
  }

  reload() {

  }

  selectNext() {

  }

  selectPrev() {

  }
}
const metadata = new Metadata()
export default metadata
