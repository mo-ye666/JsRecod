<template>
  <el-dialog
    title="选择页面"
    :visible.sync="visible"
    width="80vw"
    custom-class="api-dialog"
    :close-on-click-modal="false"
    @close="cancel"
  >
    <div v-loading="loading" class="flex-row dialog-content">

      <div class="flex-col tree-layout">
        <div style="padding-bottom: 10px">
          <el-input
            v-model="labelName"
            placeholder="名称/页面编码"
            clearable
            style="width: 100%; border-color: #ecf5e8"
            size="small"
            @input="filterPage"
          >
            <i slot="suffix" class="el-input__icon el-icon-search" />
          </el-input>
        </div>
        <div class="flex-col flex-grow" style="overflow: hidden">
          <el-tree
            :data="treeData"
            :props="defaultProps"
            style="overflow-y: auto; background: #ecf5e8"
            @node-click="handleClickNode"
          />
        </div>
      </div>
      <div class="flex-col content-layout flex-grow">
        <div class="base-title">基本信息</div>
        <div class="api-base flex-row flex-warp">
          <div class="item flex-row span-12">
            <div class="item-label">页面名称</div>
            <div class="item-value">{{ pageDetail.labelName }}</div>
          </div>
          <div class="item flex-row span-12">
            <div class="item-label">页面Code</div>
            <div class="item-value">{{ pageDetail.code }}</div>
          </div>
          <div class="item flex-row span-12">
            <div class="item-label">更新人</div>
            <div class="item-value">{{ pageDetail.updatedBy }}</div>
          </div>
          <div class="item flex-row span-12">
            <div class="item-label">最后更新时间</div>
            <div class="item-value" :title="pageDetail.updatedTime">{{ pageDetail.updatedTime }}</div>
          </div>

        </div>
        <div class="api-detail flex-grow">
          <div class="base-title">路径参数</div>
          <div class="flex-col flex-grow">
            <el-table v-show="activeName==='request'" :max-height="maxHeight" :data="params" size="mini" border row-key="id" :tree-props="{ children: 'childNode' }" class="flex-grow">
              <el-table-column label="名称" prop="name">
                <template slot-scope="scope">
                  <span style="color:#3566d3;font-size:14px">{{ scope.row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column label="备注" prop="label" align="center" />
              <el-table-column label="类型" prop="dataType" align="center" />
              <el-table-column label="是否必须" prop="inputRequired" align="center">
                <template slot-scope="scope">
                  <i v-show="scope.row.inputRequired" class="el-icon-check" style="color:green;font-size:16px" />
                  <!-- <i v-show="!scope.row.inputRequired" class="el-icon-close" style="color:red;font-size:16px" /> -->
                </template>
              </el-table-column>

            </el-table>
          </div>
        </div>

      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="cancel">取 消</el-button>
      <span style="display: inline-block; width: 20px" />
      <el-button size="small" type="primary" :disabled="!pageDetail.id" @click="confirm"> 确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import service from '@/common/service'
import { dateToDiffText ,debounce} from '@/utils/util'
import { bus, EVENTS } from '@/common/eventBus'
export default {
  components: {},
  filters: {
    diffText(val) {
      return val ? dateToDiffText(new Date(val)) + ' ㅤ(' + val + ')' : ''
    }
  },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      pageDetail: {},
      params: [],
      visible: false,
      treeData: [],
      treeDataBuffer: [],
      allData: [],
      loading: false,
      labelName: '',
      defaultProps: {
        children: 'childList',
        label: 'name'
      },
      activeName: 'request',
      maxHeight: '360px',
      headers: [],
      callback: null,
      design:true,
    }
  },
  created() {
    bus.$on(EVENTS.SHOW_PAGE_SELECTOR, ({ callback, id, design }) => {
      this.callback = callback
      this.visible = true
      this.design = design
      if (id) {
        this.getPageDetail(id)
      }
      // 设计器打开页面设计模式,需要过滤掉非设计器2.0 创建页面
      this.queryCatalogueList()


    })
  },
  mounted() {},

  methods: {
    cancel() {
      this.visible = false
    },
    confirm() {
      this.callback(this.pageDetail)
      this.visible = false
    },
    // 点击树节点
    handleClickNode(item) {
      if (item?.type === 2) {
        this.getPageDetail(item.id)
      }
    },
    filterData(list) {
      return list.filter(item => {
        if (item.childList) {
          item.childList = this.filterData(item.childList)
          return true
        }
        if (item.templateCode === '2' || item.templateCode === '3') {
          return true
        }
      })
    },
    getPageDetail(pageId) {
      this.loading = true
      service.queryPageInfo(pageId).then((res) => {
        this.pageDetail = res.data || {}
        this.params = res.data.pageRequest ? JSON.parse(res.data.pageRequest) : []
        this.loading = false
      }, () => {
        this.loading = false
      })
    },
    queryCatalogueList (){
      let params = {
        name: this.labelName,
      }
       service.queryPageList(params).then((res)=>{
        if (res.data) {
          this.allData = res.data
        }
        if (this.design) {
          // 设计器标签页面模式,需要过滤数据
          const datas = JSON.parse(JSON.stringify(this.allData))
          this.treeData = this.treeDataBuffer = this.filterData(datas)
        } else {
          // 事件编排选择页面,需要全部数据
          this.treeData = this.treeDataBuffer = this.allData
        }
      })

    },
    filterPage: debounce(async function (){
      this.queryCatalogueList()
      this.$forceUpdate()
    }, 500),
    // filterInterface(resetTreeData, interfaceList) {
    //   // 清空，显示全部
    //   if (!this.labelName) {
    //     this.treeData = this.treeDataBuffer
    //     return
    //   }
    //   // 搜索，不显示目录，只显示接口
    //   if (resetTreeData) {
    //     this.treeData = []
    //   }
    //   var list = interfaceList || this.treeDataBuffer
    //   var len = list.length
    //   var reg = new RegExp(this.labelName)
    //   for (var i = 0; i < len; i++) {
    //     if (list[i].childList && list[i].childList.length) {
    //       this.filterInterface(false, list[i].childList)
    //     } else if (
    //       list[i].labelName.match(reg) ||
    //       (list[i].labelCode && list[i].id.match(reg))
    //     ) {
    //       // 如果字符串中不包含目标字符会返回-1
    //       this.treeData.push(list[i])
    //     }
    //   }
    // }
  }
}
</script>

<style lang="scss" scoped>
.tree-layout {
  width: 260px;
  background: #ecf5e8;
  flex-shrink: 0;
}
.content-layout {
  padding: 0 0 0 10px;
  line-height: 36px;
  font-size: 14px;
  overflow: hidden;
  .api-base {
    border-right: 1px solid #eee;
    border-bottom: 1px solid #eee;
    position: relative;
    .item {
      flex-grow: 1;
      border-top: 1px solid #eee;
      border-left: 1px solid #eee;
      box-sizing: border-box;
      .item-label {
        width: 100px;
        padding: 0 10px;
      }
      .item-value {
        flex-grow: 1;
        color: #4179e0;
        font-size: 13px;
      }
    }
  }
  .api-detail{
    padding-top:10px;
  }
}
.dialog-content {
  height: calc(80vh - 100px);
}
.dialog-footer {
  margin-bottom: -8px;
  // text-align: center;
}
.base-title{
  line-height: 40px;
  color:#666;
  font-size:14px;
  font-weight: bold;
  background: #f2f2f2;
  padding:0 10px ;
}
::v-deep .api-dialog {
  margin: 60px auto 0 !important;
}
::v-deep .el-dialog__body {
  padding: 0 20px;
}
</style>
