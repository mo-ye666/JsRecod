<template>
  <div>
    <el-dialog
      :visible.sync="visible"
      width="80vw"
      custom-class="event-dialog"
      :close-on-click-modal="false"
      @close="closeHandler"
    >
      <div class="event-layout dialog-content">
        <el-tabs v-model="activeTab" type="card" @tab-click="tabClick">
          <el-tab-pane v-if="mode === 'comp'" label="组件行为配置" name="comp" />
          <el-tab-pane label="页面行为配置" name="global" />
        </el-tabs>
        <div class="flex-row" style="height: 68vh">
          <div class="category flex-row">
            <div class="flex-grow" style="overflow-y: auto">
              <el-tree
                :data="nodes"
                node-key="id"
                draggable
                default-expand-all
                :allow-drop="allowDrop"
                :allow-drag="allowDrag"
              >
                <span
                  slot-scope="{ node, data }"
                  class="custom-tree-node"
                  @click="selectNode(data, node)"
                >
                  <div class="flex-row">
                    <span v-if="data.type && !data.propsType" class="text-main">{{
                      data.name
                    }}</span>
                    <span
                      class="text-desc"
                      :class="{
                        bold: node.level == 1,
                        light: data.children && data.children.length,
                      }"
                    >{{ data | remark }}
                    </span>
                    <span class="flex-grow" />
                    <span class="node-tools">
                      <i
                        v-if="data.children"
                        class="el-icon-circle-plus-outline"
                        @click.stop="() => addChild(data)"
                      />
                      <i
                        v-if="data.type || data.propsType == 'listener'"
                        class="el-icon-delete red"
                        @click.stop="() => remove(node, data)"
                      />
                    </span>
                  </div>
                </span>
              </el-tree>
            </div>
          </div>
          <div class="detail flex-col flex-grow">
            <div
              v-if="actionData && actionData.type == 'codeMethod'"
              class="flex-col flex-grow"
            >
              <div class="code-tools">
                <el-button type="info" icon="el-icon-view" size="mini" @click="showDrawer('reViewScript')">预览全局脚本</el-button>
                <el-button type="info" icon="el-icon-info" size="mini" @click="showDrawer('tips')">通用代码提示</el-button>
                <el-button type="primary" icon="p-icon-save" size="mini" @click="saveCode">保存</el-button>
              </div>
              <div id="jscodeeditor" class="flex-col flex-grow" />
            </div>
            <div v-if="actionProps && actionData" style="width:500px;padding:10px 20px;">
              <props-form
                :properties="actionProps"
                :data="actionData"
                class="scroll-y flex-grow event-form"
              />
            </div>

          </div>
        </div>
      </div>
    </el-dialog>
    <code-tips-drawer :show-drawer="drawer" :js-code="jsCode" :title="drawerTitle" @hideCodeTipsDrawer="drawer = false" />
  </div>
</template>

<script>
import Metadata from '@/common/metadata'
import context from '@/common/context'
import service from '@/common/service'
import { bus, EVENTS } from '@/common/eventBus'
import PropsForm from '@/components/props/PropsForm'
import loadMonaco from '@/utils/loadMonaco'
import { parse } from '@babel/parser'
import util from './eventUtil'
import { compile } from '@/compile/common/compile'
import CodeTipsDrawer from './codeTipsDrawer'
var monaco, editorObj
export default {
  name: 'EventSetup',
  components: { PropsForm, CodeTipsDrawer },
  filters: {
    remark: util.remark
  },
  data() {
    return {
      nodes: [],
      pageMeta: Metadata.meta,
      compMeta: null,
      activeTab: 'page',
      mode: 'page',
      actionProps: null,
      actionData: null,
      visible: false,
      jsCode: '',
      drawerTitle: '',
      drawer: false,
      behaviors: [
        { label: '页面初始化', value: 'PageInit', active: true },
        { label: '页面激活', value: 'pageActivated' },
        { label: '页面销毁', value: 'PageDestroy' }

      ]
    }
  },
  created() {
    bus.$on(EVENTS.SHOW_EVENT_SETUP, (uuid) => {
      this.pageMeta = Metadata.meta
      if (uuid) {
        this.compMeta = Metadata.getComponentById(uuid)
        // vtable 本身没有事件编排,需要指向其子元素el-table上
        if (this.compMeta.name === 'v-table') {
          this.compMeta = this.compMeta.children
        }
        context.currEventMeta = this.compMeta
        this.mode = this.activeTab = 'comp'
        this.initApiFields(this.compMeta)
      } else {
        this.mode = this.activeTab = 'global'
      }
      this.actionProps = null
      this.reloadNodes()
      this.visible = true
    })

    bus.$on(EVENTS.ACTION_TYPE_CHANGE, (meta) => {
      if (meta.propsType || meta.type) {
        this.actionProps = util.getProps(meta)
      } else {
        this.actionProps = null
      }
    })
  },
  methods: {
    tabClick(tab) {
      this.actionData = null
      this.activeTab = tab.name
      this.reloadNodes()
    },
    reloadNodes() {
      if (this.activeTab === 'global') {
        const events = this.pageMeta.events
        this.nodes = [
          events.listener,
          events.methods,
          events.codeMethods,
          events.pageInit,
          events.pageActivated,
          events.pageDestory
        ]
      } else {
        const comp = context.components[this.compMeta.name]
        const eventMap = this.compMeta.events || {}
        this.nodes = comp.getEvents ? comp.getEvents(this.compMeta).map(item => {
          item.children = eventMap[item.id] ? eventMap[item.id].children || [] : []
          item.event = true
          return item
        }) : []
      }
    },

    selectNode(data, node) {
      this.actionData = data
      if (data.type === 'codeMethod') {
        this.actionProps = null
        if (!monaco) {
          this.openScript()
        } else {
          this.$nextTick(() => {
            this.setJsCode(data.content)
          })
        }
        return
      }
      if (data.propsType || data.type) {
        this.actionProps = util.getProps(data)
      } else {
        this.actionProps = null
      }
    },

    addChild(data) {
      util.addChild.call(this, data)
      if (this.activeTab === 'comp') {
        this.compMeta.events = this.compMeta.events || {}
        if (data.children.length === 1) {
          this.compMeta.events[data.id] = data
        }
      }
    },
    remove(node, data) {
      const parent = node.parent
      const children = parent.data.children || parent.data
      const index = children.findIndex((d) => d.id === data.id)
      children.splice(index, 1)
      if (!children.length && this.compMeta.events) {
        delete this.compMeta.events[parent.data.id]
      }
    },
    openScript() {
      loadMonaco((val) => {
        monaco = val
        this.setJsCode(this.actionData.content)
      })
    },
    setJsCode(codeStr) {
      const editor = document.querySelector('#jscodeeditor')
      if (!editor) {
        setTimeout(() => {
          this.setJsCode(codeStr)
        }, 100)
        return
      }
      if (editor.children.length) {
        editorObj.setValue(codeStr)
      } else {
        editorObj = monaco.editor.create(
          document.getElementById('jscodeeditor'),
          {
            value: codeStr,
            theme: 'vs-dark',
            language: 'javascript',
            automaticLayout: true
          }
        )
      }
    },
    allowDrag(node) {
      return node.level !== 1
    },
    allowDrop(draggingNode, dropNode, type) {
      return (
        (type !== 'inner' && draggingNode.parent === dropNode.parent) ||
        (draggingNode.data.propsType === 'action' &&
          dropNode.data.propsType === 'action' &&
          type !== 'inner')
      )
    },
    showDrawer(type) {
      if (type === 'reViewScript') {
        this.jsCode = compile.compile(this.pageMeta).js
        this.drawerTitle = '预览全局脚本'
      }
      if (type === 'tips') {
        this.jsCode = ''
        this.drawerTitle = '通用代码提示'
      }
      this.drawer = true
    },
    closeHandler() {
      context.currEventMeta = null
    },
    saveCode() {
      const jsCodeStr = editorObj.getValue()
      try {
        const ast = parse(jsCodeStr, { sourceType: 'module' })
        const astBody = ast.program.body
        if (
          astBody.length > 1 &&
          astBody[0].declaration.type === 'FunctionDeclaration'
        ) {
          this.$message('代码格式无效, 只允许export 单个函数!', 'warning')
          return
        } else {
          this.actionData.name = this.actionData.id = this.actionData.label =
            astBody[0].declaration.id.name
          this.actionData.content = jsCodeStr // .replace(/[\s]*export[\s]*function[\s]*/,"");
          this.actionData.async = astBody[0].declaration.async
          this.$message.success('函数保存成功')
        }
      } catch (err) {
        this.$message.error(`js错误：${err}`)
        console.error(err)
      }
    },
    initApiFields(comp) {
      if (comp.design.initApi && comp.design.initApi.apiUcode) {
        const apiUcode = comp.design.initApi.apiUcode
        if (!window._fields4api_[apiUcode]) {
          let fields = [{ value: '', label: '整行数据对象' }]
          service.queryApiInfo(apiUcode).then(({ data }) => {
            if (!data.responseDetailsResponseVoList) {
              return
            }
            fields = fields.concat(data.responseDetailsResponseVoList.map(col => {
              return {
                value: col.fieldName,
                label: col.fieldName
              }
            }))
            window._fields4api_[apiUcode] = fields
          })
        }
      }
      if (comp.uuid) {
        const path = Metadata.getCompPathById(comp.uuid)
        path.shift()
        const comps = path.filter(item => ['tree', 'table'].includes(item.name))
        comps.forEach(item => {
          this.initApiFields(item)
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep .el-dialog__header{
  padding:5px 20px !important
}
::v-deep .event-dialog {
  margin: 60px auto 0 !important;
}
::v-deep .el-dialog__body {
  padding: 10px 20px 20px 20px;
}
::v-deep .el-tree-node__content {
  height: 36px !important;
}
.full {
  width: 100%;
  height: 100%;
}

.dialog-footer {
  margin-bottom: -8px;
  // text-align: center;
}
.category {
  width: 30%;
  border:1px solid #F2F2F2
}
.detail{

  margin-left:20px;
   border:1px solid #F2F2F2;
   background: #f6f9ff;
   position: relative;
}

.custom-tree-node {
  font-size: 13px;

  width: 90%;
  .bold {
    font-weight: bold;
  }
  .text-desc {
      white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
    color: #999;
  }
}
.node-tools {
  padding: 0 10px;
  i {
    font-size: 17px;
    padding: 0 2px;
    color: #409eff;
    cursor: pointer;
    &.red {
      color: chocolate;
    }
  }
}
#jscodeeditor {
  width: 100%;
  height: 100%;
}
.code-tools {
  background: #0f0000;
  text-align: right;
  color: #fff;
  padding: 5px 20px;

  .bar-btn {
    display: inline-block;
    padding: 0 6px;
    line-height: 32px;
    color: #8285f5;
    cursor: pointer;
    font-size: 14px;
    user-select: none;
    & i {
      font-size: 20px;
    }
    &:hover {
      color: #4348d4;
    }
  }
}
.event-form {
  ::v-deep .el-select {
    width:100%
  }
  ::v-deep .el-cascader{
    width:100%
  }
  ::v-deep .prop-label{
    width:100px !important
  }
}
</style>

<style  lang="scss">
.event-layout * {
  -moz-user-select: -moz-none;
  -moz-user-select: none;
  -o-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.event-layout {
  .el-tree-node__content {
    border-bottom: 1px dashed #eee;
    height: 32px;
  }
  .el-collapse {
    border: 1px solid #ebeef5;
  }
  .el-collapse-item__header {
    display: flex;
    flex-direction: row;
    background: #d8e3ec;
    height: 40px;
    line-height: 40px;
    padding-left: 5px;
  }
}
.el-dialog__headerbtn::before{
    content: '';
    position: absolute;
    top: -20px;
    right: -20px;
    bottom: -20px;
    left: -20px;
    z-index: 2000;
}
</style>
