<template>
  <!-- <el-drawer
    title="通用代码提示"
    direction="rtl"
    :visible.sync="visible"
    :modal="false"
    :show-close="true"
    :wrapper-closable="false"
    :before-close="handleClose"
    size="100%"
    style="left:inherit;width: 40%"
    @opened="onOpen"
  >
    <div id="codeTips" class="tab-editor" />
    
  </el-drawer> -->
  <el-drawer
    @opened="onOpen"
    :title="title"
    direction="rtl"
    :visible.sync="showDrawer"
    :modal="false"
    :show-close="true"
    :wrapperClosable="false"
    :before-close="handleClose"
    size="100%"
    style="left: inherit; width: 40%"
  >
    <iframe
      v-show="!code"
      id="codeTipIframe"
      class="result-wrapper"
      frameborder="0"
      :src="wordUrl"
    />
    <div v-show="code" :id="id" class="tab-editor" />
  </el-drawer>
</template>

<script>
import { beautifierConf } from "@/common/config";

import loadMonaco from "@/utils/loadMonaco";
import loadBeautifier from "@/utils/loadBeautifier";
const mode = {
  js: "javascript",
};
var beautifier, monaco;
export default {
  name: "CodeTipsDrawer",
  // eslint-disable-next-line vue/require-prop-types
  props: ["showDrawer", "jsCode", "title"],
  data() {
    return {
      wordUrl: null,
      editorObj: {
        js: null,
      },
      id: `codeTips${new Date().getTime()}`,
      code: "",
    };
  },
  methods: {
    handleClose() {
      this.code = ''
      this.wordUrl = null
      this.$emit("hideCodeTipsDrawer");
    },
    onOpen() {
      if (this.jsCode) {
        loadBeautifier((btf) => {
          beautifier = btf;
          this.code  = beautifier.js(this.jsCode, beautifierConf.js);
          loadMonaco((val) => {
            monaco = val;
            this.setEditorValue('#' + this.id, 'js', this.code);
          });
        });
        return;
      }

      this.wordUrl =
        "https://co175z6nwy.feishu.cn/docs/doccnlFHm7h5829MIs5k3G5wcHu#cUSLMa";
    },
    setEditorValue(id, type, codeStr) {
      console.log(document.querySelector(id),"0000000000")
      if (document.querySelector(id).children.length) {
        this.editorObj[type].setValue(codeStr);
      } else {
        this.editorObj[type] = monaco.editor.create(document.querySelector(id), {
          value: codeStr,
          theme: 'vs-dark',
          language: mode[type],
          automaticLayout: true
        })
      }
      // editorObj[type] = monaco.editor.create(document.getElementById(id), {
      //   value: codeStr,
      //   theme: "vs-dark",
      //   language: mode[type],
      //   automaticLayout: true,
      // });
    },
  },
};
</script>

<style scoped>
.result-wrapper{
    width: 100%;
    height: 100%;
  }
.tab-editor {
  position: absolute;
  top: 58px;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 14px;
}
::v-deep .el-drawer__header {
  background: #000;
  color: #fff;
  line-height: 33px;
  margin: 0;
  padding: 0 10px;
}
::v-deep .el-drawer__body {
  background: #1e1e1e;
}
</style>
