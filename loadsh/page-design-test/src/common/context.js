import { uuid } from '@/utils/util'

let idMap = {

}

/**
 * 整个页面设计器的全局上下文对象, 用于数据缓存
 */
const context = {

  components: {
  },

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
window.context = context

export default context
