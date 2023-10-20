<template>
  <div
    :class="['upload-box', isLowCode ? 'border' : '']"
    :style="{
      width: customComponentWidth,
      height: `${componentHeight || 'auto'}px`
    }"
  >
    <div class="new-file-upload-box">
      <draggable
        v-model="fileList"
        handle=".el-icon-rank"
        v-bind="{
          animation: 200,
          group: 'description',
          disabled: false,
          ghostClass: 'ghost'
        }"
        :style="{
          maxHeight: customComponentMaxHeight,
          overflowY: 'auto',
          width: '100%'
        }"
        @end="onDraggableEnd"
      >
        <div
          v-for="(element, index) in fileList"
          :key="element.uid"
          class="list-item"
          :style="{
            width: percentWidth
              ? `${componentWidth}%`
              : `${Number(componentWidth)}px`
          }"
        >
          <div class="left">
            <i v-if="!disabled" class="el-icon-rank" />
            <el-tooltip
              class="item"
              effect="dark"
              :content="
                `${element.name || element.sourceFileName || element.fileName}`
              "
              placement="right"
              :open-delay="1000"
            >
              <div class="file-name">
                <span>{{ element | formateFileName }}</span>
                <div
                  v-if="
                    element.percentage <= 100 && !element.success
                  "
                  class="progress"
                  :style="{
                    width: handleProgressWidth(element)
                  }"
                >
                  {{ element.percentage | formatPercentage }}%
                </div>
              </div>
            </el-tooltip>
          </div>
          <div class="right">
            <span class="file-size">{{ element | formatFileSize }}M</span>
            <span class="btn">
              <i
                class="el-icon-download"
                @click.stop="handleDowload(element)"
              />
              <el-button
                v-if="!disabled"
                :disabled="disabled"
                @click.stop="handleDelete(element, index)"
              >
                <i class="el-icon-close" />
              </el-button>
            </span>
          </div>
        </div>
      </draggable>
      <div class="upload-btn">
        <upload
          :limit="quantity"
          :accept="acceptFile"
          :action="action"
          :page-id="pageId"
          :disabled="disabled"
          :file-size="fileSize"
          :original-code="originalCode"
          :file-list="fileList"
          @get-file="onGetFile"
          @file-progress="onFileProgress"
          @upload-error="onFileUploadError"
          @upload-success="onuFileUploadSuccess"
        />
        <div v-if="showTips" class="limit">
          支持{{ acceptFile }}格式，不得大于{{ fileSize }}M
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Upload from './upload.vue'

export default {
  name: 'PUploadFileNew',
  components: {
    Upload
  },
  filters: {
    formateFileName(element) {
      return element.name || element.sourceFileName || element.fileName
    },
    formatFileSize(element) {
      const { size, fileSize } = element
      if (size || size === 0) {
        return (size / 1024 / 1024).toFixed(2)
      }
      if (fileSize || fileSize === 0) {
        return Number(fileSize).toFixed(2)
      }
    },
    formatPercentage(percentage) {
      const num = Math.floor(percentage)
      if (num === 100) {
        return 99
      }
      return Math.floor(percentage)
    }
  },
  props: {
    componentWidth: {
      type: Number | String
    },
    componentHeight: {
      type: Number | String
    },
    tempButtonTxt: {
      type: Object,
      default: () => {}
    },
    percentWidth: {
      type: Boolean,
      default: false
    },
    componentMaxHeight: Number | String,
    action: String,
    originalCode: String,
    removeApi: {
      type: Object,
      default: () => ({})
    },
    center: Boolean,
    fileSize: Number | String,
    disabled: Boolean | String,
    initFileSet: Array | String,
    foreverRemove: {
      type: Boolean,
      default: true
    },
    acceptFile: String,
    showTips: Boolean,
    quantity: String | Number
  },
  data() {
    return {
      fileList: [],
      dragIndex: '',
      enterIndex: '',
      pageId: '',
      isLowCode: false,
      counts: 0,
      willUploadFileList: []
    }
  },
  computed: {
    customComponentWidth() {
      return this.percentWidth
        ? `${this.componentWidth}%`
        : `${Number(this.componentWidth) + 24}px`
    },
    customComponentMaxHeight() {
      if (this.componentMaxHeight) {
        return `${Number(this.componentMaxHeight) - 42}px`
      }
      if (this.componentHeight) {
        return `${Number(this.componentHeight) - 42}px`
      }
      return undefined
    }
  },
  watch: {
    initFileSet: {
      handler(newValue) {
        !this.$lowCode && newValue && newValue.length && this.setFileList(newValue)
      },
      deep: true
    }
  },
  mounted() {
    this.getPageId()
    this.isLowCode = this.$lowCode
    !this.$lowCode &&
      this.$nextTick(() => this.setFileList(this.initFileSet))
  },
  methods: {
    handleProgressWidth(element) {
      const { percentage } = element
      if (this.percentWidth) {
        return `${percentage}%`
      }
      `${(this.componentWidth * 0.49 * percentage) / 100}px`
    },
    setFileList(list) {

    },
    handleFileData() {
      const list = [
        'name',
        'percentage',
        'raw',
        'response',
        'size',
        'status',
        'uid'
      ]
      return this.fileList.map(item => {
        const obj = {}
        for (const key in item) {
          if (!list.includes(key)) {
            obj[key] = item[key]
          }
        }
        return obj
      })
    },
    getPageId() {
      if (!this.$lowCode) {
        this.pageId = this.$util.getUrlSearch('pageId')
      }
    },
    onDraggableEnd() {
      this.$emit('resourcesURL', this.handleFileData())
    },
    onGetFile(file) {
      this.willUploadFileList.push(file)
      this.fileList.push(file)
    },
    onFileProgress(event, file) {
      const index = this.fileList.findIndex(item => item.uid === file.uid)
      if (index > -1) {
        this.$set(this.fileList, index, file)
      }
    },
    onFileUploadError(file) {
      const index = this.fileList.findIndex(item => item.uid === file.uid)
      if (index > -1) {
        this.fileList.splice(index, 1)
      }
    },
    onuFileUploadSuccess(data, file) {
      const index = this.fileList.findIndex(item => item.uid === file.uid)
      if (index > -1) {
        this.counts++
        this.$set(this.fileList, index, { ...file, ...data, success: true })
        if (this.counts === this.willUploadFileList.length) {
          this.counts = 0
          this.willUploadFileList = []
          this.$emit('resourcesURL', this.handleFileData())
        }
      }
    },
    handleDowload(file) {
      window.open(file.savePath)
    },
    handleDeleteLocalFile(file, index) {
      this.fileList.splice(index, 1)
      this.$emit('resourcesURL', this.handleFileData())
    },
    async handleDelete(file, index) {
      // 逻辑删除为false时不调用删除接口
      if (!this.foreverRemove) {
        this.handleDeleteLocalFile(file, index)
        return
      }
      if (!this.removeApi.url) {
        this.$common.errorMessage(`未配置删除文件接口，请先去绑定删除文件接口！`)
        return
      }
      const params = {
        savePath: file.savePath,
        fileKey: file.fileKey || '',
        tempCode: this.originalCode,
        pageId: this.pageId
      }
      const res = await this.$axios.post(this.removeApi.url, params)
      if (res.statusCode === 200 && res.data.code === 200) {
        this.$common.successMessage('删除成功')
        this.fileList.splice(index, 1)
        this.$emit('resourcesURL', this.handleFileData())
      } else {
        this.$common.successMessage('删除失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-box {
  &.border {
    border: 1px dashed #ccc;
  }
  &.center {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .new-file-upload-box {
    width: 100%;
    padding-right: 7.5px;
    .list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
      padding: 0 10px;
      height: 30px;
      line-height: 30px;
      font-size: 12px;
      text-align: center;
      border-radius: 4px;
      cursor: pointer;
      box-sizing: border-box;
      .left {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 80%;
        .el-icon-rank {
          cursor: move;
        }
        .file-name {
          width: 100%;
          position: relative;
          display: inline-block;
          line-height: 30px;
          padding: 0 4px;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          .progress {
            position: absolute;
            top: 0;
            left: 0;
            padding-right: 4px;
            width: 100%;
            height: 30px;
            font-size: 12px;
            color: gray;
            text-align: right;
            background: #c8ebfb;
            box-sizing: border-box;
            opacity: 0.8;
            z-index: 10;
          }
        }
        .file-size {
          width: 64px;
        }
      }
      .right {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        width: 20%;
        .btn {
          display: none;
          .el-button {
            width: 12px;
            height: 12px;
            padding: 0;
          }
          i {
            font-size: 12px;
          }
        }
        button {
          // cursor: pointer;
          border: none;
          background: transparent;
          color: black;
        }
      }
      .el-icon-rank,
      .el-icon-download {
      }
      &:hover {
        background: #c8ebfb;
        .file-size {
          display: none;
        }
        .btn {
          display: inline-block;
        }
      }
    }
    .ghost {
      opacity: 0.5;
      background: #c8ebfb;
    }
    .list-group {
      min-height: 20px;
      list-style: none;
    }
    .list-group-item {
      height: 30px;
      line-height: 30px;
      border: 1px solid #ccc;
    }
  }
  .upload-btn {
    display: flex;
    align-items: center;
    .limit{
      margin-top: 10px;
      margin-left: 10px;
      color: #999999;
    }
  }
}
</style>
