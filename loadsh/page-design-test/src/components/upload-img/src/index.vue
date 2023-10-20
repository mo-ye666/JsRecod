<template>
  <div>
    <div class="wapper1">
      <el-upload
        v-show="!imgUrlist.length"
        ref="upload1"
        :style="{ width: componentWidth + 'px', height: componentHeight + 'px' }"
        drag
        :action="action"
        :auto-upload="autoUpload"
        :before-upload="beforeUpload"
        :on-change="handleChange"
        :on-success="handleSuccess"
        :on-exceed="hangderLimit"
        :accept="accept.join(',')"
        :show-file-list="false"
        :limit="Number(limit)"
        :http-request="uploadFile"
        :file-list="imgUrlist"
        :disabled="true"
        :multiple="multiple"
      >
        <slot name="drag" />
      </el-upload>
      <!-- 上传成功后的遮罩 -->
      <div
        v-show="imgUrlist.length"
        class="mask"
        :style="{ width: componentWidth + 'px', height: componentHeight + 'px' }"
      >
        <el-carousel
          ref="carousel"
          trigger="click"
          indicator-position="none"
          height="180px"
          :loop="true"
          @change="changeCarouse"
        >
          <el-carousel-item v-for="(item, index) in imgUrlist" :key="index">
            <img class="percture" :src="item.accessUrl" @click="openPreview">
          </el-carousel-item>
        </el-carousel>
        <div class="bar">
          <div class="include">
            <div class="opertion">
              <el-upload
                ref="upload2"
                :action="action"

                :auto-upload="autoUpload"
                :before-upload="beforeUpload"
                :on-change="handleChange"
                :on-success="handleSuccess"
                :on-exceed="hangderLimit"
                :accept="accept.join(',')"
                :show-file-list="false"
                :limit="Number(limit)"
                :http-request="uploadFile"
                :file-list="imgUrlist"
                :disabled="true"
                :multiple="multiple"
                :class="{'is-disabled':disabled}"
              >
                <el-button
                  size="small"
                  type="text"
                  :disabled="true"
                ><i class="el-icon-upload el-icon--right setMargin" />上传</el-button>
              </el-upload>
            </div>
            <span class="num">{{ imgIndex }}/{{ imgUrlist.length }}</span>
            <div class="opertion" @click="removeImg">
              <el-button
                size="small"
                type="text"
                :disabled="disabled"
              ><i class="el-icon-delete setMargin" />删除</el-button>
            </div>
          </div>
        </div>
      </div>
      <el-dialog :visible.sync="previewModal">
        <img width="100%" :src="previewImgUrl" alt="">
      </el-dialog>
    </div>
  </div>
</template>
<script>
export default {
  name: 'PUploadImg',
  props: {
    componentWidth: {
      default: 350
    },
    componentHeight: {
      default: 200
    },
    action: {
      type: String,
      default: ''
    },
    removeApi: {
      type: Object,
      default: () => {}
    },
    autoUpload: {
      type: Boolean,
      default: true
    },
    multiple: {
      type: Boolean,
      default: true
    },
    limit: {},
    fixedAccept: {},
    accept: {},
    fileSize: {},
    sizeUnit: {},
    tempCode: {},
    initImgUrl: {},
    imgWidth: {},
    imgHeight: {},
    limitImgWH: {},
    transKey: {
      type: String,
      default: ''
    },
    foreVerRemove: {},
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      imageFormat: '',
      filelists: [],
      imgIndex: 1,
      previewModal: false,
      progressModal: false,
      previewImgUrl: '',
      count: 0,
      fileLength: 0,
      imgUrlist: [],
      // imgUrlist:[{accessUrl:'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.aiimg.com%2Fuploads%2Fuserup%2F0909%2F2Z64022L38.jpg&refer=http%3A%2F%2Fimg.aiimg.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1618290395&t=90c0007a20733f9cea2795632c809d65'}],
      pageId: ''
    }
  },
  computed: {},
  watch: {
    initImgUrl: {
      handler(newValue, old) {
        this.$nextTick(() => {
          const initImgUrl = newValue || ''
          if (initImgUrl) {
            if (Array.isArray(initImgUrl)) {
              if (this.isJson(initImgUrl[0])) {
                const transData = []
                initImgUrl.forEach((el) => {
                  const obj = {
                    accessUrl: el[this.transKey] || ''
                  }
                  const result = Object.assign(el, obj)
                  transData.push(result)
                })
                this.imgUrlist = transData
              } else if (typeof initImgUrl[0] === 'string') {
                const transData = []
                initImgUrl.forEach((el) => {
                  const obj = { accessUrl: el }
                  transData.push(obj)
                })
                this.imgUrlist = transData
              }
            } else if (this.isJson(initImgUrl)) {
              const transData = []
              const obj = {
                accessUrl: initImgUrl[this.transKey]
              }
              const result = Object.assign(initImgUrl, obj)
              transData.push(result)
              this.imgUrlist = transData
            } else {
              this.imgUrlist = [{ accessUrl: initImgUrl }]
            }
          }
        })
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    if (!this.$lowCode) {
      this.pageId = this.$util.getUrlSearch('pageId')
    }
  },
  methods: {
    isJson(obj) {
      var isjson =
        typeof obj === 'object' &&
        Object.prototype.toString.call(obj).toLowerCase() === '[object object]' &&
        !obj.length
      return isjson
    },
    // 自定义上传文件方法
    uploadFile(params) {

    },
    // 文件上传前钩子
    beforeUpload(file) {
      return false
    },
    // 文件上传个数构子
    hangderLimit(files, fileList) {
    },
    handleChange(file, fileList) {

    },
    handleSuccess(response, file, fileList) {},
    changeCarouse(index) {
    },
    // 预览图片
    openPreview(url) {
    },
    // 删除图片
    removeImg() {}
  }
}
</script>
<style lang="scss">
.wapper1 {
  .is-disabled .el-upload-dragger {
    cursor: not-allowed!important;
    .el-button {
      cursor: not-allowed!important;
    }
  }
  .el-dialog {
    width: 30%;
  }
  .el-upload {
    width: 100%;
    height: 100%;
    .el-upload-dragger {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      color: #999999;
    }
    .el-upload-dragger.is-dragover {
      border: 1px dashed #02a991 !important;
      background: #e6f6f7 !important;
    }
    .el-upload-dragger:hover {
      border: 1px dashed #00aa91 !important;
    }
  }
  .progressModalStyle {
    .header-title {
      width: 100%;
      height: 56px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .txt {
        font-size: 18px;
        font-weight: 500;
      }
      .el-icon-close {
        font-size: 20px;
        cursor: pointer;
      }
    }
    .el-dialog__header {
      padding: 0;
    }
    .el-dialog__body {
      padding-top: 0;
      padding-bottom: 0;
      .count {
        text-align: right;
        height: 22px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #333333;
        line-height: 22px;
      }
      .progress-list {
        width: 100%;
        min-height: 112px;
        max-height: 250px;
        padding: 16px 0;
        box-sizing: border-box;
        .item {
          margin-bottom: 20px;
          .fileName {
            width: 100%;
            height: 22px;
            font-size: 14px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #333333;
            line-height: 22px;
            margin-bottom: 10px;
          }
        }
      }
    }
  }

  .mask:hover .bar {
    display: block;
  }
  .mask {
    width: 376px;
    height: 195px;
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    border: 1px solid #eee;
    background: #fff;
    .percture {
      max-width: 100%;
      max-height: 100%;
    }

    .el-carousel__item {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .bar {
      display: none;
      width: 100%;
      height: 32px;
      background: rgba(0, 0, 0, 0.4);
      position: absolute;
      left: 0;
      bottom: 0;
      z-index: 9;
      .include {
        widows: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        color: #eee;
        .num {
          height: 30px;
          line-height: 30px;
          font-size: 14px;
        }
        .opertion {
          flex-grow: 1;
          height: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          font-size: 14px;
          color: #fff;
          .el-button--text {
            color: #fff;
            font-size: 14px;
          }
          .setMargin {
            margin-right: 8px;
          }
          .txt {
            height: 30px;
            line-height: 30px;
            font-size: 14px;
            margin-left: 8px;
          }
        }
      }
    }
  }
}
</style>
