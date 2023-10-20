<template>
  <el-select
    v-model="value"
    placeholder="请选择"
    size="mini"
    filterable
    clearable
    allow-create
    @change="selectHandler"
    @visible-change="visibleHandler"
  >
    <el-option
      v-for="item in list"
      :key="item.value"
      :label="item.value"
      :value="item.value"
    />
  </el-select>
</template>

<script>
import service from '@/common/service'
import metadata from '@/common/metadata'
import { treeEach } from '@/utils/util'
export default {
  name: 'FieldSelect',
  components: { },
  props: {
    value: {
      type: String,
      default: ''
    },
    params: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      visible: false,
      list: []
    }
  },
  methods: {
    selectHandler(icon) {
      this.$emit('input', icon)
      this.visible = false
    },
    visibleHandler(bool) {
      if (bool && this.params) {
        if (this.params.design.initApi && this.params.design.initApi.apiUcode) {
          const apiUcode = this.params.design.initApi.apiUcode
          if (window._fields4api_[apiUcode]) {
            this.list = window._fields4api_[apiUcode]
          } else {
            service.queryApiInfo(apiUcode).then(({ data }) => {
              if (!data.responseDetailsResponseVoList) {
                return
              }
              this.list = data.responseDetailsResponseVoList.map(col => {
                return {
                  value: col.fieldName
                }
              })
              window._fields4api_[apiUcode] = this.list
            })
          }
        } else if (this.params.design.dynamicOptions) {
          const list = metadata.meta.models.map(model => {
            return {
              id: model.name,
              children: model.fields
            }
          })
          let fields = []
          treeEach(list, (item) => {
            if (item.id === this.params.design.dynamicOptions) {
              fields = item.children
            }
          })
          this.list = fields.map(item => {
            return { value: item.name }
          })
        } else if(this.params.props[':data']) {
          // 设置动态表格主键字段下拉数据
          const list = metadata.meta.models.map(model => {
            return {
              id: model.name,
              children: model.fields
            }
          })
          let fields = []
          treeEach(list, (item) => {
            if (item.id === this.params.props[':data']) {
              fields = item.children
            }
          })
          this.list = fields.map(item => {
            return { value: item.name }
          })
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
