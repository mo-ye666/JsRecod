import Sortable from 'sortablejs'
import context from '@/common/context'
import { getComponentId } from '@/utils/util'
import Metadata from '@/common/metadata'
import { bus, EVENTS } from '@/common/eventBus'
let currPosStr = ''
/**
 * 指令定义
 */
const directive = {
  name: 'v-drag',

  // 1.指令绑定到元素上回立刻执行bind函数，只执行一次
  // 2.每个函数中第一个参数永远是el，表示绑定指令的元素，el参数是原生js对象
  // 3.通过el.focus()是无法获取焦点的，因为只有插入DOM后才生效
  bind: function(el, bind) {

  },

  // inserted表示一个元素，插入到DOM中会执行inserted函数，只触发一次
  inserted: function(el, bind, vnode) {
    // const uuid = el.getAttribute('uuid')
    const name = vnode.data.name

    // 解决el-input 的外层div元素缺少 uuid,导致input组件选中后,uuid标签无法正确显示的问题
    if (vnode.data.uuid && vnode.data.name === 'input') {
      el.setAttribute('uuid', vnode.data.uuid)
    }
    if (vnode.data.uuid && vnode.data.name === 'image') {
      el.setAttribute('uuid', vnode.data.uuid)
    }
    if (!['form', 'layout', 'el-row', 'row'].includes(name) && name) {
      const component = context.components[name]
      if (component && component.getDragEl) {
        el = component.getDragEl(el)
        if (!el) return
      } else {
        return
      }
    }
    if (el.classList && el.className.indexOf('no-drag') !== -1) {
      return
    }

    var ops = {
      animation: 300,
      dragClass: 'sortable-drag',
      chosenClass: 'sortable-chosen',
      ghostClass: 'sortable-ghost',
      dataIdAttr: 'uuid',
      filter: '.layout-tools',
      fallbackOnBody: false,
      removeCloneOnHide: false,
      emptyInsertThreshold: 2,
      fallbackTolerance: 100,
      sort: true,
      group: {
        name: 'design', // 组名为itxst
        pull: true, // 是否允许拖入当前组
        put(item1, item2, el) {
          const name = el.getAttribute('name')
          const uuid = el.getAttribute('uuid')
          let component = null
          if (name) {
            component = context.components[name]
          } else if (uuid) {
            const meta = Metadata.getComponentById(uuid)
            component = context.components[meta.name]
          }
          if (!component) {
            return true
          }
          if (component.checkPut) {
            const parents = Metadata.getCompPathById(item1.el.getAttribute('uuid'))
            return component.checkPut(...parents)
          }
          return true
        }
      },
      onStart(evt) {
        bus.$emit(EVENTS.COMPONENT_DRAG_START, evt)
      },
      onAdd: function(evt) {
        const name = evt.item.getAttribute('name')
        const uuid = evt.item.getAttribute('uuid')
        if (uuid) {
          const meta = Metadata.getComponentById(uuid)
          const oldParentId = getComponentId(evt.from)
          const oldParent = Metadata.getComponentById(oldParentId)
          oldParent.children.splice(evt.oldIndex, 1)

          const toUuid = getComponentId(evt.to)
          const parent = Metadata.getComponentById(toUuid)
          // 根据不通的布局 模式,需要做处理
          if (parent.design && parent.design.mode === 'span') {
            // 标准栅格模式, 元数需要包装col
            parent.children.splice(getRealIndex(evt.to, evt.newIndex), 0, meta.name === 'col' ? meta : wrapCol(meta))
          } else {
            // flex 栅格模式,无需包装col,如有col,则去掉col
            parent.children.splice(getRealIndex(evt.to, evt.newIndex), 0, meta.name === 'col' ? meta.children : meta)
          }
        } else if (name) {
          const toUuid = getComponentId(evt.to)
          const parent = Metadata.getComponentById(toUuid)
          let meta
          if (parent.name === 'upload-img') {
            return
          }
          if (['pie', 'line', 'bar', 'complex'].includes(name)) {
            meta = context.getConfig('chart', { type: name })
          } else {
            meta = context.getConfig(name, parent)
          }
          // 对于动态业务组件,需要获取额外参数,并添加到元数据中
          if (name === 'async-component') {
            meta.label = evt.item.getAttribute('label')
            meta.code = evt.item.getAttribute('code')
          }
          if (parent.design && parent.design.mode === 'span') {
            // 包装col
            parent.children.splice(getRealIndex(evt.to, evt.newIndex), 0, wrapCol(meta))
          } else {
            // 直接插入
            parent.children.splice(getRealIndex(evt.to, evt.newIndex), 0, meta)
          }

          setTimeout(() => {
            Metadata.selectComponent(meta.uuid)
          }, 0)
        }
        bus.$emit(EVENTS.METADATA_STEP_UPDATE)
      },
      onMove: function(/** Event*/evt, /** Event*/originalEvent) {
        const pos = `${originalEvent.clientX}-${originalEvent.clientY}`
        if (!originalEvent.clientX) {
          return false
        }
        if (currPosStr === pos) {
          return false
        } else {
          currPosStr = pos
        }
      },
      onEnd: function(evt) {
        const oldIndex = evt.oldIndex
        const newIndex = getRealIndex(evt.to, evt.newIndex)
        // 同组内位置变更走该逻辑,通过vue set 切换子元素位置
        if (oldIndex !== newIndex && evt.from === evt.to) {
          const parentId = getComponentId(evt.from)
          const uuid = getComponentId(evt.item)
          const parent = Metadata.getComponentById(parentId)
          const meta = Metadata.getComponentById(uuid)
          parent.children.splice(oldIndex, 1)
          parent.children.splice(newIndex, 0, meta)
          bus.$emit(EVENTS.METADATA_STEP_UPDATE)
        }
        // 拖拽结束事件通知
        bus.$emit(EVENTS.COMPONENT_DRAG_END, evt, true)
      }
    }
    // 初始化
    new Sortable(el, ops)
  }

}

function getRealIndex(parent, index) {
  const list = parent.children
  let spaceLen = 0
  for (let i = 0; i < index; i++) {
    if (list[i].classList.contains('drag-space') || list[i].classList.contains('layout-tools')) {
      spaceLen++
    }
  }
  return index - spaceLen
}

function wrapCol(meta) {
  let warpSpan = 6
  if (meta.design && meta.design.span) {
    warpSpan = meta.design.span
    meta.design._span = warpSpan
    meta.design.span = warpSpan ? 24 : 0
  }
  return {
    uuid: context.uuid('col'),
    name: 'col',
    props: {
      span: warpSpan
    },
    design: {},
    children: meta
  }
}
export default directive
