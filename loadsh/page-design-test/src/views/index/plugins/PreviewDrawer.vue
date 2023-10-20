<template>
  <el-drawer
    v-bind="$attrs"
    v-on="$listeners"
    @opened="onOpen"
    @close="onClose"
  >
    <div class="flex-row" style="height:100%;position: relative;">
      <div v-show="showLeft" class="flex-col left-panel flex-grow">
        <el-tabs v-model="activeTab" type="card" class="editor-tabs">
          <el-tab-pane name="html">
            <span slot="label">
              <i v-if="activeTab === 'html'" class="el-icon-edit" />
              <i v-else class="el-icon-document" />
              template
            </span>
          </el-tab-pane>
          <el-tab-pane name="js">
            <span slot="label">
              <i v-if="activeTab === 'js'" class="el-icon-edit" />
              <i v-else class="el-icon-document" />
              script
            </span>
          </el-tab-pane>
          <el-tab-pane name="css">
            <span slot="label">
              <i v-if="activeTab === 'css'" class="el-icon-edit" />
              <i v-else class="el-icon-document" />
              css
            </span>
          </el-tab-pane>
          <el-tab-pane name="commonJs">
            <span slot="label">
              <i v-if="activeTab === 'commonJs'" class="el-icon-edit" />
              <i v-else class="el-icon-document" />
              公共脚本
            </span>
          </el-tab-pane>
          <el-tab-pane name="commonCss">
            <span slot="label">
              <i v-if="activeTab === 'commonCss'" class="el-icon-edit" />
              <i v-else class="el-icon-document" />
              公共样式
            </span>
          </el-tab-pane>
        </el-tabs>
        <div v-if="activeTab==='commonJs' || activeTab==='commonCss'" class="float-btns">
          <el-button
            icon="p-icon-save"
            size="mini"
            type="default"
            @click="saveCommonRes"
          >保存</el-button>
        </div>
        <div class="full">
          <el-button
            :icon="fullscreen ? 'p-icon-fullscreen-exit' :'p-icon-fullscreen'"
            size="mini"
            type="default"
            @click="full"
          />
        </div>
        <div v-show="activeTab==='html'" id="editorHtml" class="tab-editor" />
        <div v-show="activeTab==='js'" id="editorJs" class="tab-editor" />
        <div v-show="activeTab==='css'" id="editorCss" class="tab-editor" />
        <div v-show="activeTab==='commonJs'" id="commonJs" class="tab-editor" />
        <div v-show="activeTab==='commonCss'" id="commonCss" class="tab-editor" />
      </div>
      <div v-show="!fullscreen" class="flex-col right-panel flex-grow">
        <div class="action-bar  flex-row">
          <el-button-group>
            <el-button
              plain
              size="mini"
              :icon="showLeft ? 'p-icon-fullscreen' : 'p-icon-fullscreen-exit'"
              @click="showLeft = !showLeft"
            />

            <el-button
              icon="el-icon-refresh"
              size="mini"
              type="primary"

              @click="runCode"
            >刷新</el-button>

            <el-button
              type="danger"
              icon="el-icon-circle-close"
              size="mini"
              @click="$emit('update:visible', false)"
            >关闭</el-button>

          </el-button-group>
          <span class="flex-grow" />
          <span class="scheme-label">主题:</span>
          <el-select v-model="currScheme" size="mini">
            <el-option
              v-for="item in schemes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <iframe
          v-show="isIframeLoaded"
          ref="previewPage"
          class="result-wrapper flex-grow"
          frameborder="0"
          :src="src"
          style="padding:15px"
          @load="iframeLoad"
        />
      </div>
    </div>
  </el-drawer>
</template>
<script>
import { parse } from '@babel/parser'
import { beautifierConf } from '@/common/config'
import service from '@/common/service'
import constants from '@/common/constants'
import loadMonaco from '@/utils/loadMonaco'
import loadBeautifier from '@/utils/loadBeautifier'
import { compile } from '@/compile/common/compile'
import { vueTemplate, vueScript, cssStyle } from '@/compile/common/util'
const editorObj = {
  html: null,
  js: null,
  css: null,
  commonJs: null,
  commonCss: null
}
const mode = {
  html: 'html',
  js: 'javascript',
  css: 'css',
  commonJs: 'javascript',
  commonCss: 'css'

}
let beautifier
let monaco

export default {
  // eslint-disable-next-line vue/require-prop-types
  props: ['meta', 'generateConf'],
  data() {
    return {
      activeTab: 'html',
      fullscreen: false,
      htmlCode: '',
      jsCode: '',
      cssCode: '',
      commonJs: `/***
**公共js使用规范：
** 1.需要export default变量
** 2.该变量在页面中通过common.xxx的方式使用
** 3.$requestHeaders变量可以统一添加本中心的请求头
** 4.$开头的变量默认为系统变量，请不要随意命名
** 5.可以用$params.pageId获取当前打开的页id
** 6.初次打开应用会先触发$init方法
** 7.可以用$params.me获取当前用户信息
** 8.切换应用或打开另一个一级菜单页面的时候，会触发$onAppHide生命周期
** 9.低代码页面和首页显示的时候，会触发$onPageShow生命周期
 ***/
export default {
  $requestHeaders: {},
  $init: function () {

  },
  $onAppHide: function () {

  },
  $onPageShow: function (pageId) {

  }
}
`,
      commonCss: '',
      commonJsVersion: '',
      commonCssVersion: '',
      codeFrame: '',
      isIframeLoaded: false,
      isInitcode: false, // 保证open后两个异步只执行一次runcode
      isRefreshCode: false, // 每次打开都需要重新刷新代码
      resourceVisible: false,
      scripts: [],
      links: [],
      monaco: null,
      showLeft: true,
      currScheme: 'default',
      src: '//admin-dev.winnermedical.com/#/preview',
      schemes: [
        { value: 'default', label: '默认' }
      ]
    }
  },
  computed: {
    resources() {
      return this.scripts.concat(this.links)
    }
  },
  watch: {},
  created() {
    service.queryCommonRes().then((res) => {
      if (res.data) {
        this.commonJs = res.data.js
        this.commonCss = res.data.css
        this.commonJsVersion = res.data.jsVersion
        this.commonCssVersion = res.data.cssVersion
      }
    })
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    onOpen() {
      const compileData = compile.compile(this.meta)
      this.htmlCode = compileData.html
      this.jsCode = compileData.js
      this.cssCode = compileData.css
      loadBeautifier((btf) => {
        beautifier = btf
        this.htmlCode = beautifier.html(this.htmlCode, beautifierConf.html)
        this.jsCode = beautifier.js(this.jsCode, beautifierConf.js)
        this.cssCode = beautifier.css(this.cssCode, beautifierConf.html)
        this.commonJs = beautifier.js(this.commonJs, beautifierConf.js)
        this.commonCss = beautifier.css(this.commonCss, beautifierConf.html)
        loadMonaco((val) => {
          monaco = val
          this.setEditorValue('editorHtml', 'html', this.htmlCode)
          this.setEditorValue('editorJs', 'js', this.jsCode)
          this.setEditorValue('editorCss', 'css', this.cssCode)
          this.setEditorValue('commonJs', 'commonJs', this.commonJs,)
          this.setEditorValue('commonCss', 'commonCss', this.commonCss)
          if (!this.isInitcode) {
            this.isRefreshCode = true
            this.isIframeLoaded && (this.isInitcode = true) && this.runCode()
          }
        })
      })
    },
    onClose() {
      this.isInitcode = false
      this.isRefreshCode = false
    },
    iframeLoad() {
      if (!this.isInitcode) {
        this.isIframeLoaded = true
        this.isRefreshCode && (this.isInitcode = true) && this.runCode()
      }
    },
    setEditorValue(id, type, codeStr) {
      if (editorObj[type]) {
        editorObj[ type].setValue(codeStr)
      } else {
        editorObj[type] = monaco.editor.create(document.getElementById(id), {
          value: codeStr,
          theme: 'vs-dark',
          language: mode[type],
          automaticLayout: true
        })
      }
      // ctrl + s 刷新
      editorObj[type].onKeyDown((e) => {
        if (e.keyCode === 49 && (e.metaKey || e.ctrlKey)) {
          this.runCode()
        }
      })
    },
    runCode() {
      const jsCodeStr = editorObj.js.getValue()
      try {
        const ast = parse(jsCodeStr, { sourceType: 'module' })
        const astBody = ast.program.body
        if (astBody.length > 1) {
          this.$confirm(
            'js格式不能识别，仅支持修改export default的对象内容',
            '提示',
            {
              type: 'warning'
            }
          )
          return
        }
        if (astBody[0].type === 'ExportDefaultDeclaration') {
          const postData = {
            type: 'refreshFrame',
            data: {
              generateConf: { fileName: '', type: 'file' },
              html: editorObj.html.getValue(),
              js: jsCodeStr.replace(constants.SCRIPT.EXPORT_DEFAULT, ''),
              css: editorObj.css.getValue(),
              scripts: this.scripts,
              links: this.links,
              formData: {},
              models:compile.compileObjectModels(this.meta),
              asyncCompList: this.$parent.getAsyncComponents(),
              common: {
                js: editorObj.commonJs.getValue(),
                css: editorObj.commonCss.getValue()
              }
            }
          }
          // console.log(postData)
          // console.log(JSON.stringify(postData))
          this.src = '//admin-dev.winnermedical.com/#/preview?' + Date.now()
          this.$refs.previewPage.contentWindow.postMessage(
            postData,
            '*'
          )
        } else {
          this.$message.error('请使用export default')
        }
      } catch (err) {
        this.$message.error(`js错误：${err}`)
        console.error(err)
      }
    },
    generateCode() {
      const html = vueTemplate(editorObj.html.getValue())
      const script = vueScript(editorObj.js.getValue())
      const css = cssStyle(editorObj.css.getValue())
      return beautifier.html(html + script + css, beautifierConf.html)
    },

    setResource(arr) {
      const scripts = []
      const links = []
      if (Array.isArray(arr)) {
        arr.forEach((item) => {
          if (item.endsWith('.css')) {
            links.push(item)
          } else {
            scripts.push(item)
          }
        })
        this.scripts = scripts
        this.links = links
      } else {
        this.scripts = []
        this.links = []
      }
    },
    full() {
      this.fullscreen = !this.fullscreen
    },
    saveCommonRes() {
      const currVersion = this.activeTab === 'commonJs' ? this.commonJsVersion : this.commonCssVersion
      this.getCommonResVersion((version) => {
        if (!version || currVersion >= version) {
          if (this.activeTab === 'commonJs') {
            service.saveCommonRes(editorObj.commonJs.getValue()).then(({ data }) => {
              this.commonJsVersion = data.jsVersion
              this.commonJs = data.js
              this.$message.success('公共脚本保存成功!')
            })
          } else {
            service.saveCommonRes(null, editorObj.commonCss.getValue()).then(({ data }) => {
              this.commonCssVersion = data.cssVersion
              this.commonCss = data.css
              this.$message.success('公共样式保存成功!')
            })
          }
        } else {
          this.$message.warning('您当前编辑的代码版本不是最新的,防止版本覆盖问题,请获取最新的版本进行修改!')
        }
      })
    },
    getCommonResVersion(callback) {
      service.queryCommonRes().then(({ data }) => {
        if (data) {
          callback(this.activeTab === 'commonJs' ? data.jsVersion : data.cssVersion)
        } else {
          callback()
        }
      })
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
  .full{
    position: absolute;
    right: 10px;
    top: 2px;
    z-index: 1000;
  }
  .float-btns{
    position: absolute;
    right: 60px;
    top: 2px;
    z-index: 1000;
  }
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
    margin:10px;
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
  padding:1px 10px 2px;
  background: #dcdcdc;
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
