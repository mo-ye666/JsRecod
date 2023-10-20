<template>
  <div class="wapper2">
    <div class="content" :class="{ addCenter: center }">
      <div :style="{ width: componentWidth + 'px' }">
        <el-upload
          v-show="(fileType != 2 && fileType != 3) || !isShowDetail()"
          ref="uploadFile"
          :style="{
            width: componentWidth + 'px',
            height: componentHeight + 'px',
          }"
          drag
          :action="action"
          :on-change="handleChange"
          :on-success="handleSuccess"
          :before-upload="beforeUpload"
          :on-exceed="handleExceed"
          :accept="accept.join(',')"
          :show-file-list="false"
          :limit="limit"
          :file-list="filelists"
          :auto-upload="autoUpload"
          :http-request="autoUploadFile"
          :disabled="disabled"
          :multiple="multiple"
          :class="{'is-disabled':disabled}"
        >
          <div class="tips">将文件拖拽到此处</div>
          <slot name="drag" />
          <div v-if="downTempButton && moreTemplates !== undefined && moreTemplates" class="more-template">
            <el-select v-model="currentTemplate" placeholder="请选择模板">
              <el-option
                v-for="item in currentActions"
                :key="item.tempCode"
                :label="item.tempName"
                :value="item.tempCode"
              />
            </el-select>
            <div class="tempBtn" @click.stop="downTemplate">
              {{ TempButtonTxt }}
            </div>
          </div>
          <div v-if="downTempButton && (moreTemplates === undefined || moreTemplates === false)" class="tempBtn" @click.stop="downTemplate">
            {{ TempButtonTxt }}
          </div>
          <el-select
            v-if="isEdit"
            class="upload-type"
            v-model="uploadType"
            placeholder="导入类型"
            size="mini"
            style="width: 100px"
            @change="typeChange"
          >
            <el-option label="新增" value="add" />
            <el-option label="修改" value="edit" />
          </el-select>
        </el-upload>

        <!-- 文件列表 -->
        <div class="fileListBox" :style="fileListFunc()">
          <div
            v-for="(item, index) in filelists"
            v-if="!autoUpload"
            :key="index"
            class="file-item"
          >
            <div class="icon-1">
              <i class="el-icon-document" />
            </div>
            <div class="flieName" :title="item.name">{{ item.name }}</div>
            <div class="icon-2" @click="removeFile(item, index)">
              <i class="el-icon-close" />
            </div>
          </div>
          <div
            v-for="(item, index) in successFileList"
            v-if="autoUpload"
            :key="index"
            class="file-item"
          >
            <div class="icon-1">
              <i class="el-icon-document" />
            </div>
            <div
              class="flieName"
              :title="item.sourceFileName || item.name || item.fileName"
              @click="downloadFile(item)"
            >
              {{ item | filterFileName }}
            </div>

            <div class="icon-2" @click="removeFile(item, index)">
              <el-button
                size="small"
                type="text"
                :disabled="disabled"
              ><i class="el-icon-close" /></el-button>
            </div>
          </div>
        </div>
        <div v-if="!autoUpload" class="footBtn">
          <el-button size="small" @click="cancel">取 消</el-button>
          <el-button size="small" type="primary" @click="manualUpload">确 定</el-button>
        </div>
      </div>
    </div>
    <progress-modal
      v-if="showProgressBar"
      ref="progress-modal"
      :progress-flag.sync="progressFlag"
      :load-progress="loadProgress"
      :upload-successful-or-failed.sync="uploadSuccessfulOrFailed"
    />
  </div>
</template>
<script>

export default {
  name: 'PUploadFile',
  components: {

  },
  filters: {
    filterFileName(value) {
      return value.sourceFileName || value.name || value.fileName
    }
  },

  props: {
    originalCode:String,
    isEdit: false,
    originalEditCode:String ,
    action: {},
    autoUpload: {},
    accept: {},
    fileSize: {},
    sizeUnit: {},
    downApi: {},
    downTempButton: {},
    TempButtonTxt: String,
    center: {},
    taskCenterShow: {},
    taskCenter: {},
    removeApi: {},
    componentWidth: {
      default: 358
    },
    componentHeight: {
      default: 228
    },
    fileListHeight: {
      default: 120
    },
    initFileSet: {},
    fileType: {},
    transFileUrlKey: {},
    transFileNameKey: {},
    getRequestParam: {
      default() {
        return () => {}
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    isDynamicApi: false,
    beforeUploadParam: {},
    multiple: false, // 是否启用多文件上传
    showProgressBar: false, // 是否展示进度条
    foreverRemove: true, // 默认为true,调用文件删除接口永久删除
    actionList: {
      type: Array,
      default: () => ([])
    },
    editActionList: {
      type: Array,
      default: () => ([])
    },
    moreTemplates: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tempCode: {},
      addTempCode: '', // 新增code
      editTempCode: '', // 编辑code
      uploadType: 'add', // 导入类型
      filelists: [],
      successFileList: [], // 成功上传文件列表
      isFixed: false,
      pageId: '',
      uploadSuccessInfo: {
        savePath: '',
        fileKey: ''
      },
      initFileInfo: {
        savePath: '',
        name: '',
        fileKey: ''
      },
      isVideo: false,
      isAudio: false,
      progressFlag: false,
      loadProgress: 0,
      uploadSuccessfulOrFailed: false,
      currentTemplate: '',
      currentActions: this.actionList
    }
  },
  provide() {
    return {
      Pupload: this
    }
  },
  computed: {
    limit() {
      return this.multiple ? 100 : 1
    }
  },

  watch: {
    progressFlag(newval) {
      if (!newval) {
        this.$emit(
          'progressModalClose',
          this.uploadSuccessfulOrFailed,
          this.successFileList
        )
      }
    },
    originalCode: {
      handler(val) {
        if (val) {
          this.tempCode = this.originalCode
          this.addTempCode = this.originalCode
          this.editTempCode = this.originalEditCode
        }
      },
      immediate: true
    },
    originalEditCode: {
      handler() {
        this.editTempCode = this.originalEditCode
      },
      immediate: true,
      deep: true
    },
    actionList(newValue) {
      this.currentActions = newValue
    }
  },
  mounted() {
    const unwatch = this.$watch(
      'initFileSet',
      function(newValue, oldValue) {
        console.log(newValue)
        this.successFileList = JSON.parse(JSON.stringify(newValue)) || []
        this.fileType == 2 && this.setInitFileInfo(this.successFileList)
        unwatch()
      },
      {
        deep: true
      }
    )
    if (!this.$lowCode) {
      if (!Array.isArray(this.initFileSet)) {
        if (!this.initFileSet) {
          this.successFileList = []
        } else {
          this.successFileList = [this.initFileSet]
        }
      } else {
        this.successFileList = this.initFileSet
      }
      this.fileType == 2 && this.setInitFileInfo(this.successFileList)
      this.pageId = this.$util.getUrlSearch('pageId')
    }
  },
  methods: {
    setInitFileInfo(fileInfo) {
      if (fileInfo.length) {
        for (const key in this.initFileInfo) {
          this.initFileInfo[key] = fileInfo[0][key]
        }
      }
    },
    fileListFunc() {
      if (!this.multiple) {
        return
      }
      return { height: this.fileListHeight + 'px' }
    },
    typeChange(e) {
      this.moreTemplates && (this.currentTemplate = '')
      if (e === 'add') {
        this.moreTemplates && (this.currentActions = this.actionList)
        this.tempCode = this.addTempCode
        return
      }
      this.moreTemplates && (this.currentActions = this.editActionList)
      this.tempCode = this.editTempCode
    },
    isJson(obj) {
      var isjson =
        typeof obj === 'object' &&
        Object.prototype.toString.call(obj).toLowerCase() == '[object object]' &&
        !obj.length
      return isjson
    },

    handleChange(file, fileList) {
      this.filelists = fileList
    },

    isShowDetail() {
      return this.uploadSuccessInfo.savePath || this.initFileInfo.savePath
    },
    showDetail() {},
    resetObj(obj) {},
    /**
     * @param { number } 文件对象数组下标
     * @param { boolean } 是否给父组件发送文件数据，当foreverRemove为false时不给父组件发送文件数据
     */
    handleFileWhenDeleted(index, flag) {},
    removeFile(item, index) {
    },
    checkCustomizeMapping(customizeMapping) {
    },
    // 动态上传
    async beforeUploadRequest(formData) {

    },

    // sort字段必传，接口没有返回就按数组默认索引
    setSort(formData, customizeMapping) {

    },
    // 检测文件大小
    fileSiseCheck(file) {
   
    },
    beforeUpload(file) {
      return this.fileSiseCheck(file)
    },
    handleExceed(files, fileList) {
      this.$common.errorMessage(`每次最多只能导入一个文件！`)
    },
    handleSuccess(response, file, fileList) {
      console.log({ response, file, fileList })
    },
    // 下载模板
    async downTemplate() {

    },
    // 手动上传文件
    async uploadSingleFile(file) {

    },

    // 批量手动上传文件
    async manualUpload() {

    },
    downloadFile(item) {
      console.log(item)
      window.location.href = item.savePath
    },
    getContainerCtx(ctx) {

    },
    getUploadUrlParam() {

    },
    // 自动上传文件
    async autoUploadFile(params) {

    },
    openTaskModal(data) {

    },
    cancel() {
      this.$emit('closeModal')
    }
  }
}
</script>
<style lang="scss">
.modalStyle {
  width: 450px;
  height: 200px;
  .el-message-box__btns {
    margin-top: 18px;
  }
}
.wapper2 {
  width: 100%;
  background: #fff;
  box-sizing: border-box;
  margin: 0 auto;
  .addCenter {
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    align-items: center;
  }
  .is-disabled .el-upload-dragger {
    cursor: not-allowed!important;
    .el-button {
      cursor: not-allowed!important;
    }
  }
  .content {
    width: 100%;
    height: 100%;
    position: relative;
    .fileListBox {
      width: 100%;
      margin-top: 16px;
      overflow: auto;
      &::-webkit-scrollbar-thumb {
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.1);
        -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.4);
      }
      &::-webkit-scrollbar {
        width: 4px;
      }
      .file-item {
        width: 100%;
        height: 26px;
        line-height: 26px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 6px;
        box-sizing: border-box;
        margin-bottom: 4px;
        animation: downMove 2s forwards;
        color: #666;

        .icon-1 {
          width: 26px;
          height: 26px;
        }
        .icon-2 {
          width: 30px;
          height: 26px;
          line-height: 26px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .flieName {
          flex-grow: 1;
          height: 26px;
          line-height: 26px;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 0 20px;
          box-sizing: border-box;
          cursor: pointer;
        }
      }
      .file-item:hover {
        color: #00aa91;
        background: #f8f8ff;
      }
      @keyframes downMove {
        from {
          transform: translateY(-30px);
        }
        from {
          transform: translateY(0px);
        }
      }
    }
    .footBtn {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      margin-top: 30px;
    }
    .tips {
      width: 80%;
      height: 30px;
      line-height: 30px;
      background: #02a991;
      display: none;
      color: #fff;
      border-radius: 4px;
    }
    .tempBtn {
      font-size: 14px;
      color: #999;
    }
    .more-template {
      display: flex;
      .tempBtn {
        margin-left: 8px;
      }
    }
    .el-upload {
      width: 100%;
      height: 100%;
      position: relative;
      .upload-type {
        position: absolute;
        right: 10px;
        top: 20px;
      }
    }
    .el-upload-dragger.is-dragover {
      border: 1px dashed #02a991 !important;
      background: #e6f6f7 !important;
      .tips {
        display: block;
      }
    }
    .el-upload-dragger:hover {
      border: 1px dashed #02a991 !important;
      background: #e6f6f7 !important;
    }
    .el-upload-dragger {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      // position: relative;
    }
  }
}
</style>
