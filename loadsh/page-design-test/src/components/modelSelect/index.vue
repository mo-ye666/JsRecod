<template>
  <el-cascader
    v-model="val"
    size="mini"
    :options="options"
    :props="conf"
    :show-all-levels="showAllLevels"
    clearable
    :filterable="filterable"
    @visible-change="visibleHandler"
    v-on="$listeners"
  >
    <template slot-scope="{ node, data }">
      <span>{{ data.name }} </span>
      <span v-if="data.label && data.label !== node.label" class="name">
        {{ data.label }}
      </span>
      <el-tooltip v-if="data.fields && data.id !== 'props'" class="item" effect="dark" content="添加子字段" placement="top">
        <span class="el-icon-circle-plus-outline" @click="iconClick(data)" />
      </el-tooltip>
    </template>
  </el-cascader>
</template>

<script>
import metadata from '@/common/metadata'
import { bus, EVENTS } from '@/common/eventBus'
export default {
  name: 'ModelSelect',
  props: {
    value: {
      type: String,
      default: ''
    },
    filter: {
      type: String,
      default: ''
    },
    filterable:{
      type: Boolean,
      default: false
    },
    onlyModel: {
      type: Boolean,
      default: false
    },
    checkStrictly: {
      type: Boolean,
      default: false
    },
    showAllLevels: {
      type: Boolean,
      default: false
    },
    // 指定模型选择
    modelid: {
      type: String,
      default: ''
    },
    mergeOptions:{
      type: Array,
      default: ()=>{return []}
    }
  },
  data() {
    return {
      options: metadata.meta.models,
      val: this.value,
      conf: {
        value: 'id',
        label: 'name',
        emitPath: false,
        checkStrictly: this.checkStrictly
      }
    }
  },
  watch: {
    value(value) {
      this.val = value
    }
  },

  created() {
    this.loadData()
    this.val = this.value
  },
  methods: {
    loadData() {

      let models = JSON.parse(
        JSON.stringify(
          this.modelid
            ? [metadata.getModelField(this.modelid)]
            : metadata.meta.models
        )
      )
      models.forEach((element) => {
        element.label = element.name
        element.id = element.name
        element.children = element.fields ? element.fields : element.children
        if (this.onlyModel) {
          element.children = null
        }
      })

      // 如果有额外混合数据,则进行数据混合
      if(this.mergeOptions.length){
        models = [...models, ...this.mergeOptions]
      }

      // 如果有筛选参数,则进行数据筛选
      if (this.filter) {
        models = models.filter(model => this.modelFilter(model, this.filter, true))
      }
      this.options = models
    },
    visibleHandler(bool) {
      if (bool) {
        this.loadData()
      }
    },
    iconClick(data) {
      bus.$emit(EVENTS.SHOW_ADD_FIELD, {
        model: data,
        callback: (field) => {
          const item = this.getModelField(metadata.meta.models, data.id);
          (item.fields || item.children).push(field);
          (data.fields || data.children).push(field)
          this.val = field.id
          this.$emit('input', field.id)
        }
      })
    },
    getModelField(list, id) {
      return list.find(item => {
        if (item.id === id || item.name === id) {
          return item
        } else if (item.fields || item.children) {
          return this.getModelField(item.fields || item.childrem, id)
        }
      })
    },
    modelFilter(model, type, isModel) {
      if (model.children) {
        model.children = model.children.filter((item) => {
          return this.modelFilter(item, type, false)
        })
        if (model.children.length) {
          return true
        } else {
          model.children = null
        }
      }
      if (isModel && type === 'Object') {
        return true
      } else {
        return model.dataType === type
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-icon-circle-plus-outline{
  margin-left:10px;
}
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
  color: #ff3737;
  font-size: 14px;
  font-weight: bold;
}
span.name {
  padding-left: 10px;
  font-size: 13px;
  color: #999;
}

</style>
