<template>
  <el-drawer :visible.sync="visible" size="100%" @opened="onOpen">
    <div class="flex-row" style="height:100%;position: relative;">
      <div class="flex-col ">
        <el-tabs v-model="activeTab" type="card" class="editor-tabs">
          <el-tab-pane v-if="activeTab === 'html'" name="html">
            <span slot="label">
              <i v-if="activeTab === 'html'" class="el-icon-edit" />
              <i v-else class="el-icon-document" />
              template
            </span>
          </el-tab-pane>
          <el-tab-pane v-if="activeTab === 'css'" name="css">
            <span slot="label">
              <i v-if="activeTab === 'css'" class="el-icon-edit" />
              <i v-else class="el-icon-document" />
              css
            </span>
          </el-tab-pane>
        </el-tabs>
        <div v-show="activeTab==='css'" id="cssEditor" class="tab-editor" />
        <div v-show="activeTab==='html'" id="htmlEditor" class="tab-editor" />
      </div>
      <div class="flex-row action-bar flex-grow">
        <span class="flex-grow" />
        <el-button-group>
          <el-button type="primary" icon="p-icon-save" size="mini" @click="save">保存</el-button>
          <el-button
            type="danger"
            icon="el-icon-circle-close"
            size="mini"
            @click="close"
          >关闭</el-button>
        </el-button-group>
      </div>
    </div>
  </el-drawer>
</template>
<script>
import { beautifierConf } from '@/common/config'
import loadMonaco from '@/utils/loadMonaco'
import loadBeautifier from '@/utils/loadBeautifier'
import { bus, EVENTS } from '@/common/eventBus'
const editorObj = {
  html: null,
  js: null,
  css: null
}
const mode = {
  html: 'html',
  js: 'javascript',
  css: 'css'
}
let beautifier
let monaco

export default {
  // eslint-disable-next-line vue/require-prop-types
  data() {
    return {
      activeTab: 'html',
      htmlCode: '',
      cssCode: '',
      codeFrame: '',
      scripts: [],
      links: [],
      monaco: null,
      visible: false,
      currScheme: 'default',
      schemes: [
        { value: 'default', label: '默认' }
      ],
      saveCallback: null
    }
  },
  computed: {
    resources() {
      return this.scripts.concat(this.links)
    }
  },
  watch: {},
  created() {
    bus.$on(EVENTS.SHOW_CODE_DRAWER, ({ code, type, save }) => {
      this.visible = true
      this.saveCallback = save
      this.activeTab = type
      this.code = code
    })
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    onOpen() {
      loadBeautifier((btf) => {
        beautifier = btf
        let id = 'htmlEditor'
        if (this.activeTab === 'html') {
          this.code = beautifier.html(this.code, beautifierConf.html)
        } else {
          id = 'cssEditor'
          this.code = beautifier.css(this.code, beautifierConf.html)
        }
        loadMonaco((val) => {
          monaco = val
          this.setEditorValue(id, this.activeTab, this.code)
        })
      })
    },
    setEditorValue(id, type, codeStr) {
      if (editorObj[type]) {
        editorObj[type].setValue(codeStr)
      } else {
        editorObj[type] = monaco.editor.create(document.getElementById(id), {
          value: codeStr,
          theme: 'vs-dark',
          language: mode[type],
          automaticLayout: true
        })
      }
    },
    save() {
      const jsCodeStr = editorObj[this.activeTab].getValue()
      this.saveCallback(jsCodeStr)
      this.close()
    },
    close() {
      this.visible = false
    }
  }
}
</script>

<style lang="scss" scoped >
.left-panel,
.right-panel {
  width: 50%;
}
.left-panel {
  position: relative;
  height: 100%;
  background: #1e1e1e;
  overflow: hidden;
}
.tab-editor {
  position: absolute;
  top: 33px;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 14px;
}
.left-editor {
  position: relative;
  height: 100%;
  background: #1e1e1e;
  overflow: hidden;
}
.setting {
  position: absolute;
  right: 15px;
  top: 3px;
  color: #a9f122;
  font-size: 18px;
  cursor: pointer;
  z-index: 1;
}
.right-preview {
  height: 100%;
  .result-wrapper {
    height: calc(100vh - 33px);
    width: 100%;
    overflow: auto;
    padding: 12px;
    box-sizing: border-box;
  }
}
.scheme-label{
  font-size:13px;
  padding:3px 8px 0 0;
}
::v-deep .el-drawer__header {
  display: none;
}
.action-bar{
  padding:2px 10px 2px;
  background: #000;
}
</style>

<style lang="scss">
.editor-tabs {
    background: #121315;
}
.editor-tabs .el-tabs__header {
    margin: 0;
    border-bottom-color: #121315;
}
.editor-tabs .el-tabs__header .el-tabs__nav {
    border-color: #121315;
}
.editor-tabs .el-tabs__item {
    height: 32px;
    line-height: 32px;
    color: #888a8e;
    border-left: 1px solid #121315 !important;
    background: #363636;
    margin-right: 5px;
    user-select: none;
}
.editor-tabs .el-tabs__item.is-active {
    background: #1e1e1e;
    border-bottom-color: #1e1e1e !important;
    color: #fff;
}
.editor-tabs .el-icon-edit {
    color: #f1fa8c;
}
.editor-tabs .el-icon-document {
    color: #a95812;
}
.editor-tabs :focus.is-active.is-focus:not(:active) {
    box-shadow: none;
    border-radius: 0;
}

</style>
