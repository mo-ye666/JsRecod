import Vue from 'vue'
import Main from './index.vue'
const TreeSelectConstructor = Vue.extend(Main)
let instance
const TreeSelect = function(options) {
  instance = new TreeSelectConstructor({
    data: {
      title: options.title,
      data: options.data || [],
      multiple: options.multiple,
      nodeKey: options.nodeKey,
      value: options.value,
      defaultProps: {
        label: options.labelKey || 'label',
        children: options.childKey || 'children'
      },
      select: options.onSelect
    }
  })
  instance.$mount()
  document.body.appendChild(instance.$el)
  return instance
}
Vue.prototype.$treeSelect = TreeSelect
export default TreeSelect
