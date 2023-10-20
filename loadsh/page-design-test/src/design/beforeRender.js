import context from '@/common/context'
import metadata from '../common/metadata'
import pretreatment from '@/compile/common/pretreatment'
import { bus, EVENTS } from '@/common/eventBus'
import { getComponentId2 } from '@/utils/util'
import Vue from 'vue'
export default function designRender(renderOpts = {}, h) {
  const ctx = {}
  const tags = ['div', 'i', 'template']
  if (tags.includes(renderOpts.name)) {
    return
  }

  // 处理 设计模式 组件选中状态, 添加selected 样式
  renderOpts.props = Object.assign({}, renderOpts.props)
  renderOpts.class = Object.assign({}, renderOpts.class)
  renderOpts.attrs = Object.assign({}, renderOpts.attrs)
  if (renderOpts.name) { renderOpts.nativeOn = Object.assign({}, renderOpts.nativeOn) }
  renderOpts.on = Object.assign({}, renderOpts.on)
  renderOpts.design = renderOpts.design || {}
  renderOpts.class['design-selected'] = renderOpts.design.selected
  if (renderOpts.columns) {
    renderOpts.columns = JSON.parse(JSON.stringify(renderOpts.columns))
  }
  // 处理栅格宽度 将栅格转换为百分百宽度的样式名称
  pretreatment(renderOpts, ctx, 'design')

  // 设计模式给所有渲染组件的dom添加 uuid标识

  if (renderOpts.uuid) {
    renderOpts.props.uuid = renderOpts.uuid
    renderOpts.attrs.uuid = renderOpts.uuid
  }
  renderOpts.props.value = renderOpts.props.value || ''
  // 处理设计时的模拟数据
  if (renderOpts.design && renderOpts.design.bindDataAttr) {
    if (context.components[renderOpts.name] && context.components[renderOpts.name].getMockData) {
      renderOpts.props[renderOpts.design.bindDataAttr] = context.components[renderOpts.name].getMockData(renderOpts)
    }
  }

  // 设计面板模式下 给所有的组件添加 可拖拽的指令
  renderOpts.directives = [
    {
      name: 'v-drag',
      value: '',
      arg: '',
      modifiers: {
      }
    }
  ]
  if (renderOpts.design.mapping) {
    renderOpts.attrs.mapping = renderOpts.design.mapping
    if (renderOpts.nativeOn) {
      renderOpts.nativeOn.dblclick = (e) => {
        const id = getComponentId2(e.target)
        if (id) {
          metadata.selectComponent(id)
        }
      }
    }
  }
  if (['select', 'tree'].includes(renderOpts.name)) {
    renderOpts.nativeOn.mousedown = (e) => {
      bus.$emit(EVENTS.DESIGN_COMPONENT_CLICK, e)
    }
  }
  if (renderOpts.name === 'v-template') {
    const desc = renderOpts.design.desc || '自定义代码块占位符'
    const myCom = Vue.extend({
      template: `<div> ${desc} </div>`
    })
    renderOpts.children = [h(myCom)]
  } else if (renderOpts.name === 'async-component') {
    const myCom = Vue.extend({
      template: `<div> 异步业务组件 占位符 </div>`
    })
    renderOpts.children = [h(myCom)]
  } else if (renderOpts.name === 'p-micro-app') {
    const myCom = Vue.extend({
      template: `<div> 微组件 beta<span style="color:red;">(需要平台审核后才可以使用)</span> </div>`
    })
    renderOpts.children = [h(myCom)]
  } else if (renderOpts.name === 'tabs') {
    if (renderOpts.children.length) {
      const val = renderOpts.children[0].data.props.name
      renderOpts.props.value = val
    }
  } else if (renderOpts.name === 'table') {
    // 修复设计时table 组件 style报错问题
    if (!renderOpts.props.height) {
      renderOpts.props.height = '200px'
    }
    // 如果有expand 列,则这些设置将生效,默认展开
    renderOpts.props['expand-row-keys'] = [1]
    renderOpts.props['row-key'] = 'id'
  } else if (renderOpts.name === 'steps') {
    // 修复设计时table 组件 style报错问题
    renderOpts.props.active = renderOpts.design.activeStep
  }

  // 处理 模型或其他元素拖拽到设计器中
  if (renderOpts.name === 'layout' || renderOpts.name === 'form') {
    if (renderOpts.design.mode === 'span') {
      renderOpts.name = 'row'
    }
    renderOpts.nativeOn.dragover = function(ev) {
      ev.preventDefault()
    }
    renderOpts.nativeOn.drop = (ev) => {
      const data = ev.dataTransfer.getData('out2design')
      if (!data) { return false }
      const dropData = JSON.parse(data)
      const cnt = metadata.getCompPathById(renderOpts.uuid)
      if (dropData.type === 'field') {
        // field只允许拖拽到表单中, 因此遍历父容器,查看是否存在form组件,如有则允许拖拽
        if (cnt.filter(item => item.name === 'form').length) {
          if (['form', 'panel', 'layout'].includes(cnt[0].name)) {
            const config = context.components['form-item'].getConfigByField({ field: dropData.data })
            cnt[0].children.push(config)
          }
        } else {
          window.getApp().$message('字段只允许拖拽到form容器中')
        }
      }
      ev.stopPropagation()
    }
  }

  if (renderOpts.name) {
    const component = context.components[renderOpts.name]
    if (component && component.beforeRender) {
      component.beforeRender(renderOpts)
    }
  }
}
