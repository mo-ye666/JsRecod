import Vue from 'vue'
const bus = new Vue()
const EVENTS = {
  COMPONENT_SELECTED: '设计面板组件选中事件',
  MEATA_SELECTED: '选中你面板组件中的内部元素(元数据)',
  DESIGN_COMPONENT_CLICK: '设计面板组件点击',
  DESIGN_COMPONENT_REMOVE: '设计面板组件移除事件',
  COMPONENT_DRAG_START: '面板组件拖拽开始事件',
  COMPONENT_DRAG_END: '面板组件拖拽结束事件',
  SHOW_MODEL_PANEL: '显示模型面板',
  SHOW_MODEL_EDITOR: '显示模型编辑详情',
  SHOW_DESIGN_MSG: '设计器消息提示',
  SHOW_CHILD_PROP: '显示子属性面板',
  SHOW_API_SELECTOR: '显示API选择器',
  SHOW_PAGE_SELECTOR: '显示页面选择器',
  SHOW_PARAMS_EDITOR: '显示参数编辑器',
  SHOW_CONDITION_EDITOR: '显示条件编辑器',
  SHOW_COLUMNS_EDITOR: '显示列信息编辑器',
  SHOW_EVENT_SETUP: '显示事件编排弹窗',
  SHOW_CODE_DRAWER: '显示代码抽屉(CSS Template)',
  SHOW_DESIGN_TOOLS: '显示组件的设计工具栏',
  SHOW_EXPORT_APIS: '显示导入导出接口弹窗',
  ACTION_TYPE_CHANGE: '事件编排,动作类型改变事件',
  SHOW_ADD_FIELD: '显示添加模型字段小弹窗',
  SHOW_RIGHT_MENU: '显示右键菜单',
  SHOW_SORT_DIALOG: '显示排序弹窗',
  HIDE_RIGHT_MENU: '关闭右键菜单',
  PAGE_TAB_CHANGE: '切换页面',
  SHOW_COMP_CONFIG: '组件配置弹窗',

  // 用于 撤回与重做,当触发该事件,需记录当前元数据对象
  METADATA_STEP_UPDATE: '元数据更新事件',

  // 快捷键
  HOTKEY_DEL: '按键Del',
  HOTKEY_CTRLC: '按键CTRL+C',
  HOTKEY_CTRLV: '按键CTRL+V',
  HOTKEY_CTRLZ: '按键CTRL+Z',
  HOTKEY_CTRLY: '按键CTRL+Y',
  HOTKEY_UP: '按键-向上',
  HOTKEY_DOWN: '按键-向下',
  HOTKEY_LEFT: '按键-向左',
  HOTKEY_RIGHT: '按键-向右'
}
export default bus
export {
  bus,
  EVENTS
}
