<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="400px"
    :close-on-click-modal="false"
    @close="cancel"
  >
    <div class="popup-tree">
      <el-scrollbar style="height:100%">
        <el-tree
          ref="tree"
          :data="data"
          show-checkbox
          default-expand-all
          :node-key="nodeKey"
          highlight-current
          :props="defaultProps"
          :default-checked-keys="value"
        />
      </el-scrollbar>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="cancel">取 消</el-button>
      <span style="display: inline-block; width: 20px" />
      <el-button size="small" type="primary" @click="confirm"> 确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>

export default {
  name: 'PopupTreeSelect',
  data() {
    return {
      value: [],
      title: '',
      multiple: false,
      nodeKey: '',
      data: [],
      visible: true,
      defaultProps: null,
      select() {

      }
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    cancel() {
      this.$emit('cancel')
      this.close()
    },
    confirm() {
      const datas = this.$refs.tree.getCheckedNodes(true).filter(item => !item.fields)
      if (!datas.length) {
        this.$message('请至少选择一个模型字段')
      } else {
        this.select && this.select(datas)
        this.$emit('selected', datas)
        this.close()
      }
    },
    close() {
      this.$destroy(true)
      this.$el.parentNode.removeChild(this.$el)
    }
  }
}
</script>

<style lang="scss" scoped>
 .popup-tree{
     height: calc(85vh - 200px);
     overflow-y:auto;
 }
.dialog-footer {
  margin-bottom: -8px;
  // text-align: center;
}
::v-deep .api-dialog {
  margin: 60px auto 0 !important;
}
::v-deep .el-dialog__body {
  padding: 0 20px;
}
</style>
