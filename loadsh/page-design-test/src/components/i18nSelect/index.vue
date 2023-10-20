<template>
  <div>
    <el-select
      slot="reference"
      v-model="val"
      :remote="true"
      placeholder="请输入关键字"
      :remote-method="remoteMethod"
      size="mini"
      :filterable="true"
      :allow-create="true"
      clearable
      @change="changeHandler"
      @contextmenu.native="copy"
    >
      <div slot="prefix">
        <el-tooltip
          class="item-warn"
          effect="dark"
          :content="iconTip"
          placement="top"
        >
          <i :class="icon" @click.stop="iconClick" />
        </el-tooltip>
      </div>

      <el-option
        v-for="item in options"
        :key="item.value"
        :value="item.value"
        :label="item.label"
      >
        <div class="flex-row option-item">
          <span class="i-key">{{ item.value }}</span>
          <span class="i-label">{{ item.label }}</span>
        </div>
      </el-option>
    </el-select>
    <el-popover
      v-model="visible"
      popper-class="create-popup"
      placement="bottom"
      title="新增国际化"
      trigger="manual"
    >
      <el-form ref="form" :model="form" label-width="90px">
        <el-form-item label="国际化编码">
          <el-input v-model="form.key" size="mini" />
        </el-form-item>
        <el-form-item label="中文翻译">
          <el-input v-model="form.zh" size="mini" />
        </el-form-item>
      </el-form>
      <div style="text-align: right; margin: 10px 0 0 0">
        <el-button
          size="mini"
          type="default"
          @click="visible = false"
        >取消</el-button>
        <el-button
          type="primary"
          size="mini"
          @click="saveI18n"
        >保存</el-button>
      </div>
    </el-popover>
  </div>
</template>

<script>
import i18n from '@/render/src/utils/i18n'
import { copyText } from '@/utils/util'
import service from '@/common/service'
export default {
  name: 'I18nSelect',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      val: this.value,
      i18nList: [],
      options: [],
      showWarnnig: false,
      icon: '',
      iconTip: '',
      visible: false,
      form: {
        key: '',
        zh: '',
        en: ''
      }
    }
  },
  watch: {
    value(value) {
      this.val = value
      this.initI18nDatas()
      this.checkValue()
    }
  },
  created() {
    this.initI18nDatas()
    this.checkValue()
  },
  methods: {
    checkValue() {
      if (!this.val) {
        this.icon = 'el-icon-search'
        this.iconTip = '请输入关键字过滤'
        return
      }
      if (i18n.messages.zh[this.val]) {
        this.icon = 'el-icon-success'
        this.iconTip = '已适配国际化'
      } else {
        this.icon = 'el-icon-warning-outline'
        this.iconTip = '该项未适配国际化信息'
      }
    },
    initI18nDatas() {
      this.options = []
      const map = i18n.messages.zh
      const list = window.i18n_list || []
      if (!list.length) {
        Object.keys(map).forEach((key) => {
          if (typeof map[key] === 'string') {
            list.push({
              value: key,
              label: map[key]
            })
          }
        })
        window.i18n_list = list
      }
      this.i18nList = list
      if (this.value) {
        if (map[this.value]) {
          this.options.push({
            label: map[this.value],
            value: this.value
          })
        } else {
          this.remoteMethod(this.value)
        }
      }
    },
    selectHandler(icon) {
      this.$emit('input', icon)
      this.visible = false
    },
    iconClick() {
      if (this.val && !i18n.messages.zh[this.val]) {
        this.form.zh = this.val
        this.form.key = ''
        this.visible = true
      }
    },
    remoteMethod(query) {
      if (query !== '') {
        const finds = []
        this.i18nList.forEach((item) => {
          let index = -1
          if (item.label.toLowerCase().indexOf(query.toLowerCase()) > -1) {
            index = item.label.length - query.length
          } else if (item.value.toLowerCase().indexOf(query.toLowerCase()) > -1) {
            index = item.value.length - query.length
          }
          if (index > -1) {
            finds.push({ item, index })
          }
        })
        this.options = finds.sort((a, b) => a.index - b.index).slice(0, 20).map(data => data.item)
      } else {
        this.options = []
      }
    },
    changeHandler(val) {
      this.$emit('input', val)
    },
    copy() {
      self.event.returnValue = false
      copyText(i18n.t(this.value))
    },
    saveI18n() {
      if (!this.form.key) {
        this.$message.warning('请输入国际化编码')
        return
      } else if (!this.form.zh) {
        this.$message.warning('请输入中文翻译')
        return
      }
      // service.createI18n(this.form.key, this.form.zh).then(res => {
      //   this.val = `i18n_${this.form.key}`
      //   window.i18n._vm.messages['zh-CN'][this.val] = this.form.zh
      //   // 下拉编辑器内部使用
      //   window.i18n.messages.zh[this.val] = this.form.zh
      //   window.i18n_list.push({ value: this.val, label: this.form.zh })
      //   this.options.push({ value: this.val, label: this.form.zh })
      //   this.i18nList = window.i18n_list
      //   this.visible = false
      //   this.$emit('input', this.val)
      // })
      service.createI18n(this.form.key, this.form.zh).then(res => {
        // window.i18n._vm.messages['zh-CN'][this.val] = this.form.zh
        // 下拉编辑器内部使用
        // window.i18n.messages.zh[this.val] = this.form.zh
        this.val = `i18n_${this.form.key}`
        i18n.messages['zh-CN'][this.val] = this.form.zh
        i18n.messages.zh[this.val] = this.form.zh
        i18n._vm.messages['zh-CN'][this.val] = this.form.zh
        i18n._vm.messages.zh[this.val] = this.form.zh
        window.i18n_list.push({ value: this.val, label: this.form.zh })
        this.options.push({ value: this.val, label: this.form.zh })
        this.i18nList = window.i18n_list
        this.visible = false
        this.$emit('input', this.form.zh)
        this.initI18nDatas()
        this.checkValue()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.option-item {
  justify-content: space-between;
  border-bottom: 1px dashed #d6dbe2;
  box-sizing: border-box;
  font-size: 13px;
  .i-key {
    color: #6985e8;
  }
  .i-label {
    padding-left: 10px;
  }
}
.item-warn {
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  line-height: 28px;
  &.el-icon-warning-outline {
    color: #ff3737;
  }
  &.el-icon-success {
    color: #34c760;
    font-weight: 300;
  }
  &.el-icon-plus {
    color: #4242d4;
    font-size: 11px;
  }
}
::v-deep .el-input__inner {
  padding: 0 25px 0 22px !important;
}

::v-deep .create-popup {
  width: 260px;
  zoom: 0.9;
  box-sizing: border-box;
  right: 10px !important;
  .el-form-item{
    margin-bottom: 0px !important;
  }
  .el-input__inner {
    padding: 0 6px !important;
  }
  .el-popover__title {
    color: #5d5861;
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 12px;
    text-align: center;
  }
}

</style>
