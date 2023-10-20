<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="60vw"
    custom-class="api-dialog"
    :close-on-click-modal="false"
    @close="cancel"
  >
    <div class="dialog-content">
      <draggable
        :list="list"
        ghost-class="ghostClass1"
        :force-fallback="false"
        :animation="500"
      >
        <template v-for="item in list">
          <span :key="item.id" size="small" class="sort-item">{{
            item.label
          }}</span>
        </template>
      </draggable>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="cancel">取 消</el-button>
      <el-button size="small" type="primary" @click="confirm"> 确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { bus, EVENTS } from '@/common/eventBus'
export default {
  components: {},

  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      title: '排序',
      visible: false,
      list: [],
      callback: null
    }
  },
  created() {
    bus.$on(EVENTS.SHOW_SORT_DIALOG, ({ callback, data, title }) => {
      this.title = title
      this.list = [...data]
      this.callback = callback
      this.visible = true
    })
  },
  mounted() {},

  methods: {
    cancel() {
      this.visible = false
    },
    confirm() {
      this.callback(this.list)
      this.visible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.remark {
  line-height: 30px;
  color: #999;
}
.dialog-content {
  border: 1px dashed #ddd;
  padding: 20px;
}
.sort-item {
  margin: 0 0 20px 10px;
  padding: 0 10px;
  line-height: 30px;
  height: 30px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  font-size: 12px;
  cursor: move;
  display: inline-block;
}

::v-deep .el-dialog__body {
  padding: 15px 20px;
}
.ghostClass1 {
  color: #fff;
  border: 1px dashed #d09237;
}
</style>
