<template>
  <div>
    <el-dialog
      title="模板选择"
      :visible.sync="visible"
      width="85%"
      custom-class="api-dialog"
      @close="close"
    >
      <el-form :inline="true" class="demo-form-inline" label-width="100px">
        <el-form-item label="模板名称">
          <el-input v-model="params.tempName" size="mini" clearable />
        </el-form-item>
        <el-form-item label="模板类型">
          <el-select v-model="params.templateType" size="mini" clearable>
            <el-option label="上传" value="UP" />
            <el-option label="下载" value="DOWN" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            size="mini"
            class="checkBtn"
            type="primary"
            @click="onSearchTemplate"
          >查询</el-button>
        </el-form-item>
      </el-form>
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        height="350"
        size="mini"
        @current-change="clickChange"
      >
        <el-table-column label="选择" width="55">
          <template slot-scope="scope">
            <el-radio v-model="tableRadio" :label="scope.row"><i /></el-radio>
          </template>
        </el-table-column>
        <el-table-column prop="tempName" label="模板名称" />
        <el-table-column prop="tempCode" label="模板code" width="260" />
        <el-table-column prop="templateType" label="模板类型" width="100">
          <template slot-scope="scope">
            <span>{{
              scope.row.templateType === "DOWN" ? "下载" : "上传"
            }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="templateInfo" label="解析类型" width="100" />
        <el-table-column prop="interactionUrl" label="对接地址" width="200" />
        <el-table-column prop="enable" label="状态" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.enable === 1 ? "启用" : "停用" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updatedBy" label="更新人" width="100" />
        <el-table-column prop="updatedTime" label="更新时间" width="150" />
      </el-table>
      <el-pagination
        :current-page="params.pageNum"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="params.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tatal"
        style="margin-top: 20px"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="close">取 消</el-button>
        <span style="display: inline-block; width: 20px" />
        <el-button size="small" type="primary" @click="onSave">
          确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import service from '@/common/service'
import { getUrlParams } from '@/utils/util'
import { bus, EVENTS } from '@/common/eventBus'
export default {
  name: 'UpDownSource',
  data() {
    return {
      visible: false, // 是否显示
      confirm: null, // 确定回调函数
      cancel: null, // 取消回调函数
      tableRadio: null,
      tableData: [],
      tatal: 0,
      params: {
        pageNum: 1,
        pageSize: 10,
        tempName: '',
        templateType: '',
        appCenterCode: getUrlParams('appCenterCode'),
        version: getUrlParams('centerVersion')
      },
      checkApiInfo: []
      // modal:true
    }
  },
  created() {
    bus.$on(EVENTS.SHOW_EXPORT_APIS, (options) => {
      this.confirm = options.callback
      this.visible = true
      this.queryTemplate()
    })
  },
  methods: {
    // 是否显示
    show(options) {
      this.visible = true
      this.queryTemplate() // 初始化数据
    },
    queryTemplate() {
      service.queryExportApi(this.params).then((res) => {
        const data = res.data.dataList
        this.tableData = data.filter((el) => el)
        this.tatal = res.data.totalCount
      })
    },
    onSearchTemplate() {
      this.queryTemplate()
    },
    handleSizeChange(val) {
      this.params.pageSize = val
      this.queryTemplate()
    },
    handleCurrentChange(val) {
      this.params.pageNum = val
      this.queryTemplate()
    },
    handleSelectionChange(val) {
      this.checkApiInfo = val
    },
    clickChange(item) {
      this.tableRadio = item
    },
    onSave() {
      if (!this.tableRadio) {
        this.$message.warning('请先选择一条数据')
        return
      }
      this.visible = false
      this.confirm(this.tableRadio)
    },
    close() {
      this.visible = false
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-dialog__header {
  padding: 15px 20px !important;
}
::v-deep .api-dialog {
  margin: 60px auto 0 !important;
}
::v-deep .el-dialog__body {
  padding: 10px 20px 10px 20px;
}
.dialog-footer {
  margin-bottom: -8px;
}
</style>
