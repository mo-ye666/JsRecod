<template>
  <el-upload
    class="upload"
    multiple
    :disabled="disabled"
    :data="{ pageId }"
    :action="actionUrl"
    :limit="limit && Number(limit)"
    :file-list="fileList"
    :accept="accept"
    :before-upload="beforeFileUpload"
    :on-success="onFileUploadSUccess"
    :on-error="onFileUploadError"
    :on-progress="onFileUploadProgress"
    :on-exceed="onExceed"
    :class="{'is-disabled':disabled}"
  >
    <el-button
      size="small"
      type="primary"
    ><i class="el-icon-upload el-icon--right">上传</i></el-button>
  </el-upload>
</template>
<script>
const UPLOAD = 0
// const DEFAULT_ACCEPT = '.xls,.xlsx,.doc,.docx,.pdf,.ai,.txt,.ppt,.pptx'
export default {
  props: {
    action: String,
    pageId: String,
    originalCode: String,
    fileSize: Number | String,
    disabled: String | Boolean,
    accept: String,
    limit: String | Number,
    fileList: Array
  },
  computed: {
    actionUrl() {
      return `${this.action}/${this.originalCode}/${UPLOAD}`
    }
  },
  methods: {
    onExceed() {
      this.$common.warningMessage(`最多只能上传${this.limit}个文件，请重新上传`)
    },
    beforeFileUpload(file) {
      if (file.size > this.fileSize * 1024 * 1024) {
        this.$common.warningMessage(`${file.name}文件大小不能超过${this.fileSize}M`)
        return false
      }
      if (this.fileList.length >= Number(this.limit)) {
        this.$common.warningMessage(`最多只能上传${this.limit}个文件`)
        return false
      }
      this.$emit('get-file', file)
    },
    onFileUploadSUccess(response, file) {
      if (response.code == 200) {
        this.$emit('upload-success', response.data, file)
        this.$common.successMessage(`${file.name}文件上传成功`)
      }
    },
    onFileUploadError(err, file) {
      this.$emit('upload-error', file)
      this.$common.errorMessage(`${file.name}文件上传失败`)
    },
    onFileUploadProgress(event, file) {
      this.$emit('file-progress', event, file)
    }
  }
}
</script>

<style lang="scss" scoped>
.is-disabled .el-upload-dragger {
    cursor: not-allowed!important;
    .el-button {
      cursor: not-allowed!important;
    }
}
.upload {
  ::v-deep .el-upload-list {
    display: none;
  }
  .el-button--primary {
    margin-top: 10px;
    background: rgb(93, 208, 192);
    border-color: rgb(93, 208, 192);
  }
}
</style>
