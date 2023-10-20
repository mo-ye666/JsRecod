import Vue from 'vue'
// import draggable from "vuedraggable";
// Vue.component('draggable', draggable)
// 自动读取components目录文件，每个vue中的name属性需要定义，根据name属性来定义组件名
const requireComponent = require.context('@/purcotton-ui/packages', true, /\.vue$/)
requireComponent.keys().map(path => {
  // console.log(requireComponent(path))
  // console.log(requireComponent.keys())
  if (requireComponent(path).default && requireComponent(path).default.name) {
    Vue.component(requireComponent(path).default.name, requireComponent(path).default)
  }
})
