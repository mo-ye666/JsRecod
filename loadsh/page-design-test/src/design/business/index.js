import context from '@/common/context'
import baseProps from '../baseProps'
import { uuid } from '@/utils/util'
import service from '@/common/service'
import Vue from 'vue'
context.components['async-component'] = {

  // 组件默认配置
  getConfig() {
    return {
      uuid: '',
      label: '',
      name: 'async-component',
      props: {},
      design: {
        permissions: []
      },
      class: {},
      style: {},
      slots: [],
      ref: true
    }
  },

  // 组件的属性配置
  getProperties(meta, compDetail) {
    let customProps = []
    if(compDetail.compProps && compDetail.compProps.length) {
      customProps = compDetail.compProps.map(p => {
        const sign = ['method', 'model'].includes(p.editor) ? ':' : ''
        const prop = {
          label: p.label,
          mapping: `props.${sign}${p.name}`,
          type: p.editor,
          options: p.options,
          help: p.help,
          value: p.defaultValue || ''
        }
        if (p.options) {
          prop.options = p.options
        }
        if (p.editor === 'model') {
          prop.checkStrictly = true
        }
        return prop
      })
    }

    if (compDetail.compSlots?.length) {
      customProps.push({ type: 'divider', label: '组件可启用插槽' })
      compDetail.compSlots.forEach(slot => {
        customProps.push({
          mapping: `design.slots.${slot.name}`,
          type: 'bool',
          label: slot.name,
          value: false,
          onChange(val, meta) {
            if (val) {
              const append = context.getConfig('layout', meta)
              append.slot = slot.name
              append.design.mapping = slot.name
              meta.slots.push(append)
            } else {
              meta.slots = meta.slots.filter(item => item.slot !== slot.name)
            }
            return true
          },
          help: '是否启用该插槽' })
      })
    }
    if (!meta.design.permissions.length) {
      meta.design.permissions = compDetail.compPerms
      meta.design.permissions.forEach(perm => {
        perm.permId = uuid(10)
      })
    }

    return [
      {
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.compId(),
          {
            label: '组件名称',
            mapping: 'label',
            type: 'text',
            value: ''
          },
          // {
          //   label: '组件编码',
          //   mapping: 'code',
          //   type: 'text',
          //   value: ''
          // },
          baseProps.common.span(),
          baseProps.common.height(),
          ...baseProps.common.vif(),
          ...customProps,
          {
            label: '组件权限控制',
            type: '$list',
            mapping: 'design.permissions',
            supportDel: false,
            supportAdd: false,
            supportSort: false,
            value: [],
            columns: [
              {
                mapping: 'join',
                type: 'bool',
                value: true
              },
              {
                mapping: 'name',
                type: 'text',
                value: ''
              },
              {
                mapping: 'label',
                type: 'input',
                value: '',
                width: '140px',
                placeholder: '权限别名',
                vif: 'join'
              }
            ]
          },
          ...baseProps.common.styles()
        ]
      }
    ]
  },

  getEvents(meta) {
    const designMeta = window.vbusiness?.[meta.code]
    if (designMeta && designMeta.compEvents) {
      return designMeta.compEvents.map(e => {
        return { id: e.name, label: e.label }
      })
    } else {
      return []
    }
  },

  beforeRender(meta) {
    // 设计时样式修正,没设置高度,则给添加一个样式,用于给一个默认的最小高度
    if (!meta.style.height) {
      meta.class['no-height'] = true
    }
    window.$async_components = window.$async_components || {}
    let asyncMeta = window.getMetaManager().getComponentById(meta.uuid)
    asyncMeta = JSON.parse(JSON.stringify(asyncMeta))
    delete asyncMeta.uuid
    asyncMeta.name = `async-component-${meta.code}`
    asyncMeta.perms = {}
    meta.children = [asyncMeta]
    // 判断是否已经注册
    if (!window.$async_components[meta.code]) {
      Vue.component(`async-component-${meta.code}`, function(resolve) {
        service.queryComponentByCode(meta.code).then(({ data }) => {
          renderCss(data.css)
          window.$async_components[meta.code] = true
          resolve(getConfig(data))
        })
      })
    }
  }

}

function renderCss(cssCode) {
  const style = `<style>${cssCode}</style>`
  const ele = document.createElement('div')
  ele.innerHTML = style
  document.getElementsByTagName('head')[0].appendChild(ele.firstElementChild)
}

function getConfig(data) {
  const code = 'return ' + `${data.js.replace('export default ', '')}`

  const func = new Function('common', code)
  let config
  try {
    config = func({})
  } catch (e) {
    console.error(e)
  }
  // delete config.created
  delete config.mounted
  Object.keys(config.methods).forEach(ele => {
    config.methods[ele] = function(){}
  })
  Object.keys(config.props).forEach(ele => {
    if (typeof config.props[ele] === 'function') {
      config.props[ele] = undefined
    }
  })
  config.template = data.html
  return config
}

context.components['v-slot'] = {

  // 组件默认配置
  getConfig() {
    return {
      name: 'v-slot',
      props: { name: 'default' },
      design: {},
      class: {},
      style: {}
    }
  },

  // 组件的属性配置
  getProperties(meta, compDetail) {
    return [
      {
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.compId(),
          {
            label: '插槽名称',
            mapping: 'props.name',
            type: 'input',
            value: '',
            help: '具名插槽,多个插槽名称不能重复'
          }
        ]
      }
    ]
  }
}
