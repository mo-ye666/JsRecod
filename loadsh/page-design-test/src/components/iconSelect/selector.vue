<template>
  <div class="design-dialog">
    <el-dialog
      width="980px"
      :modal-append-to-body="false"
      title="选择图标"
      :visible="true"
      @open="onOpen"
      @close="onClose"
    >
      <div class=" dialog-content">
        <ul class="icon-ul">
          <li
            v-for="icon in iconList"
            :key="icon.id"
            :class="{'active-item': icon === current}"
            @click="onSelect(icon)"
          >
            <i :class="icon" class="icon p_font_family" />
            <div>{{ icon }}</div>
          </li>
        </ul>
      </div>

    </el-dialog>
  </div>
</template>
<script>
import context from '@/common/context'
import {getUrlParams} from "../../utils/util";
export default {
  props: {
    current: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      iconList: [],
      key: '',
      queryParam: {
        iconName: '',
        iconValue: '',
        kind: '',
        pageSize: 10,
        pageNum: 1,
        status: ''
      }
    }
  },
  mounted() {
    this.getIconList()
  },
  methods: {
    async getIconList() {
      if (context.iconList) {
        this.iconList = context.iconList
        return
      }
      this.$http.get('/api/h5-app/icon/list',{
        centerCode: getUrlParams('appCenterCode'),
        centerVersion: getUrlParams('centerVersion')
      }).then(res => {
        res.data.forEach(item => {
          this.iconList.push('p-icon-' + item.fontClass)
          context.iconList = [... this.iconList]
        })
      })
    },
    onOpen() {
      this.key = ''
    },
    onClose() {
      this.$emit('update:visible', false)
    },
    onSelect(icon) {
      this.$emit('select', icon)
      this.$emit('update:visible', false)
    }
  }
}
</script>
<style lang="scss" scoped>
.icon-ul {
  margin: 0;
  padding: 0;
  font-size: 0;
  li {
    list-style-type: none;
    text-align: center;
    font-size: 14px;
    display: inline-block;
    width: 16.66%;
    box-sizing: border-box;
    height: 108px;
    padding: 15px 6px 6px 6px;
    cursor: pointer;
    overflow: hidden;
    &:hover {
      background: #f2f2f2;
    }
    &.active-item{
      background: #e1f3fb;
      color: #7a6df0
    }
    > i {
      font-size: 30px;
      line-height: 50px;
    }
  }
}
::v-deep .design-dialog {
  margin: 60px auto 0 !important;
}
::v-deep .el-dialog__body {
  padding: 0 20px;
}
.dialog-content {
  height: calc(80vh - 100px);
  overflow-y:auto;
}
</style>
