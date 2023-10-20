import context from '@/common/context'
import constants from '@/common/constants'
import { options, getRowIndex } from '@/utils/util'
import baseProps from '../baseProps'
import { bus, EVENTS } from '@/common/eventBus'
context.components.dropdown = {
  // 组件默认配置
  getConfig() {
    return {
      uuid: '',
      name: 'dropdown',
      props: {
        size: constants.COMMON_SIZE,
        'split-button': true,
        trigger: 'click'
      },
      design: {
        autoWidth: true,
        slotText: '菜单名',
        type: 'split-button'
      },
      class: {},
      style: {},
      slots: [{
        name: 'el-dropdown-menu',
        slot: 'dropdown',
        props: {},
        design: {},
        children: []
      }],
      unaided: true
    }
  },
  // 组件的属性配置
  getProperties(meta) {
    return [
      {
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.compId(),
          {
            label: '呈现风格',
            mapping: 'design.type',
            type: 'radio',
            options: options({
              'split-button': '按钮(分割)',
              button: '按钮'
            }),
            value: '',
            onChange(val, meta) {
              if (val === 'button') {
                const btn = Object.assign(context.getConfig('button'), {
                  props: {
                    type: meta.props.type,
                    size: meta.props.size
                  },
                  design: {},
                  style: {},
                  uuid: '',
                  children: [
                    meta.design.menuText,
                    {
                      name: 'icon',
                      props: {},
                      design: { classList: 'el-icon-arrow-down,el-icon--right' }
                    }
                  ]
                })
                meta.children = btn
                meta.props['split-button'] = false
                meta.design.slotText = ''
              } else {
                meta.props['split-button'] = true
                meta.design.slotText = meta.design.menuText
                meta.children = ''
              }
              return true
            }
          },
          {
            label: '按钮类型',
            mapping: 'props.type',
            type: 'select',
            options: ['primary', 'success', 'warning', 'danger', 'info', 'text'],
            value: 'text',
            onChange(val, meta) {
              if (!meta.props['split-button']) {
                meta.children.props.type = val
              }
            },
            help: '按钮类型'
          }, {
            label: '菜单文字',
            type: 'i18n',
            value: '',
            mapping: 'design.menuText',
            onChange(val, meta) {
              if (meta.props['split-button']) {
                meta.design.slotText = val
              } else {
                meta.children.children[0] = val
              }
              return true
            },
            help: '菜单按钮的显示文本'
          },
          {
            label: '按钮图标',
            mapping: 'design.dropicon',
            type: 'icon',
            value: '',
            onChange(val, meta) {
              meta.children.children[1].design.classList = `${val},el-icon--right`
              return true
            },
            vif: (meta) => meta.design.type === 'button'
          },
          // baseProps.common.span(),
          {
            label: '组件尺寸',
            mapping: 'props.size',
            type: 'radio',
            options: options({ medium: '中等', small: '较小', mini: '迷你' }),
            value: constants.COMMON_SIZE,
            onChange(val, meta) {
              if (!meta.props['split-button']) {
                meta.children.props.size = val
              }
            },
            help: '菜单按钮尺寸'
          },
          {
            label: '数据绑定',
            mapping: 'design.dataType',
            type: 'radio',
            options: options({ static: '静态',objectModel: '模型', api: '服务' }),
            value: 'static',
            help: '请提供绑定数据的来源类型'
          },
          {
            label: '静态数据录入',
            type: '$list',
            mapping: 'slots.0.children',
            supportDel: true,
            supportAdd: true,
            value: [],
            columns: [
              {
                mapping: 'children',
                type: 'i18n',
                value: '',
                placeholder: '菜单名'
              },
              {
                mapping: 'prop',
                type: 'button',
                buttonText: ' ',
                btnType: 'text',
                icon: 'el-icon-edit-outline',
                onClick(e) {
                  const rowIndex = getRowIndex(e.target)
                  const col = meta.slots[0].children[rowIndex * 1]
                  bus.$emit(EVENTS.SHOW_CHILD_PROP, col, meta)
                }
              }

            ],
            addHandler() {
              return { name: 'el-dropdown-item', props: {}, design: {}, children: '' }
            },
            vif(meta) { return meta.design.dataType === 'static' }
          },
          ...baseProps.common.initObjectModel(meta),
          ...baseProps.common.initApi(meta),
          baseProps.common.valueKey({
            help: '作为菜单command命令值得字段'
          }, meta),
          baseProps.common.labelKey({
            help: '作为菜单名显示的字段名称'
          }, meta),
          ...baseProps.common.eventBtn()
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.classList(),
         ... baseProps.common.vif(),
          baseProps.common.disabled()
        ]
      }
    ]
  },

  getEvents(meta) {
    const arr = [
      { id: 'visible-change', label: '下拉框出现/隐藏时触发' },
      { id: 'command', label: '点击菜单项触发的事件', params: '$event' }
    ]
    if (meta.props['split-button']) {
      arr.push({ id: 'click', label: '左侧按钮的事件(分割按钮模式)' })
    }
    return arr
  }

}

context.components['el-dropdown-item'] = {
  getProperties(meta) {
    return [
      {
        group: '菜单项配置',
        groupType: 'collapse',
        properties: [
          {
            label: '指令值',
            mapping: 'props.command',
            type: 'input',
            value: '',
            help: '指令值(command),点击菜单项触发的事件指令值'
          },
          {
            label: '菜单名称',
            mapping: 'children',
            type: 'i18n',
            value: '',
            help: '菜单显示名称'
          },
          {
            label: '菜单图标',
            mapping: 'props.icon',
            type: 'icon',
            value: '',
            help: '自定义菜单前置图标'
          },
          {
            label: '分割线',
            mapping: 'props.divided',
            type: 'bool',
            value: false,
            help: '该项是否已显示分割线,默认不显示'
          },
          ...baseProps.common.permission(),
          baseProps.common.disabled()
        ]
      }
    ]
  }
}

