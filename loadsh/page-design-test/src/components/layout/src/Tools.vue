<template>
  <div v-show="visible" class="layout-tools" :style="styleObj">
    <template v-for="(tool,i) in tools">
      <i v-if="!tool.children" :key="i" :class="tool.icon" @click="tool.click" />
      <el-dropdown v-else :key="i" @command="tool.click">
        <span class="el-dropdown-link">
          <i :class="tool.icon" />
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="item in tool.children" :key="item.label" :command="item.command">{{ item.label }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </template>

    <i v-show="hasEvents" class="el-icon-setting" @click="showEventEditor" />
    <i v-show="showDelelte && canCopy" class="el-icon-document-copy" @click="copy" />
    <i v-show="showDelelte" class="el-icon-delete" @click="removeComponent" />
  </div>
</template>
<script>
import context from '@/common/context'
import Metadata from '@/common/metadata'
import { getOffset } from '@/utils/util'
import bus, { EVENTS } from '@/common/eventBus'
export default {
  name: 'Tools',
  data() {
    return {
      visible: false,
      tools: [],
      hasEvents: false,
      canCopy: true,
      showDelelte: true,
      styleObj: {},
      compId: '',
      fix: {}
    }
  },
  created() {
    bus.$on(EVENTS.DESIGN_COMPONENT_REMOVE, () => {
      this.visible = false
    })
    bus.$on(EVENTS.COMPONENT_SELECTED, (comp, parent, e) => {
      if (comp.isPageRoot) {
        this.visible = false
        return
      }
      if (comp.design && comp.design.mapping) {
        this.showDelelte = false
      } else {
        this.showDelelte = true
      }
      // if (['v-table', 'grid', 'form'].includes(comp.name)) {
      //   this.canCopy = false
      // }
      this.compId = comp.uuid
      const $el = this.findEl(e, comp.uuid) || document.querySelector(`[uuid='${comp.uuid}']`)
      if (!$el) {
        console.error('not find $el', this.compId)
      }
      const width = $el.offsetWidth
      const pos = getOffset($el)
      const component = context.components[comp.name]
      this.styleObj = {
        top: (pos.top - this.fix.top - 13 - document.querySelector('#design_panel').children[0].scrollTop) + 'px',
        left: (pos.left + 50 + this.fix.left) + 'px'
      }
      if (component && component.getTools) {
        const metadata = window.getMetaManager()
        this.tools = component.getTools(metadata.getComponentById(this.compId))
      } else {
        this.tools = []
      }
      this.hasEvents = !!component.getEvents
      this.visible = true
      this.$nextTick(() => {
        this.styleObj.left = (width + pos.left - this.$el.offsetWidth - this.fix.left) + 'px'
      })
    })
  },
  mounted() {
    this.fix = getOffset(document.querySelector('#design_panel'))
  },
  methods: {
    removeComponent() {
      this.visible = false
      Metadata.removeComponent(this.compId)
    },
    showEventEditor() {
      bus.$emit(EVENTS.SHOW_EVENT_SETUP, this.compId)
    },
    findEl(e, uuid) {
      if (!e) {
        return
      }
      let node = e.target
      while (node) {
        const id = node.getAttribute('uuid')
        if (id === uuid) { break } else {
          node = node.parentElement
        }
      }
      return node
    },
    copy() {
      const path = Metadata.getCompPathById(this.compId)
      const comp = path[0]
      const parent = path[1]
      if (Array.isArray(parent.children)) {
        const index = parent.children.indexOf(comp)
        const newNode = Metadata.copyNode(comp)
        parent.children.splice(index + 1, 0, newNode)
      } else {
        window.getApp().$message.warning('该项不能复制')
      }
    },
    isInTableRow($el) {
      let node = $el.parentElement
      let ret = false
      while (node) {
        const cssName = node.getAttribute('class')
        if (cssName && cssName.indexOf('el-table__row') !== -1) {
          ret = true
          break
        } else {
          node = node.parentElement
        }
      }
      return ret
    }
  }
}
</script>

<style scoped lang="scss">
.layout-tools{
  position: absolute;
  text-align: right;
  z-index: 1000;
  i{
    padding: 3px;
    margin: 0 3px 0 0;
    background: #fff;
    color: #409EFF;
    border-radius: 50%;
    border:1px solid #409EFF;
    font-size: 12px;
    cursor: pointer;
  }
  .el-icon-delete{
    color:#fd2323
  }
}
</style>
