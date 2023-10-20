<template>
  <div class="props-group flex-col" :uuid="currId">
    <template v-for="(prop, i) in fields">
      <template v-if="prop.group">
        <template v-if="prop.groupType ==='collapse' ">
          <el-collapse :key="prop.group" v-model="activeName" :accordion="true" v-if="check(prop)">
            <el-collapse-item :title="prop.group" :name="prop.group">
              <props-form
                v-if="check(prop)"
                :properties="prop.properties"
                :all-props="allProps"
                :data="propsData"
              />
            </el-collapse-item>
          </el-collapse>
        </template>
        <template v-else>
          <props-form
            v-if="check(prop)"
            :key="prop._id_"
            :properties="prop.properties"
            :all-props="allProps"
            :class="prop.class"
            :data="propsData"
          />
        </template>
      </template>
      <template v-else-if="prop.type === '$list'">
        <template v-if="check(prop)">
          <el-divider v-if="prop.label" :key="prop._id_+'divider'">
            <span> {{ prop.label }}</span>
          </el-divider>
          <template v-if="Array.isArray(prop.value)">
            <draggable
              :key="i"
              :disabled="prop.supportSort===false"
              :list="prop.value"
              ghost-class="ghost"

              :animation="340"
            >
              <div
                v-for="(row, index) in prop.value"
                :key="prop._id_ + '-' +index "
                class="flex-row dynamic-list-row"
                :class="{border:prop.border}"
              >
                <div class="select-line-icon option-drag icon-btn">
                  <i v-if="prop.supportSort!==false" class="el-icon-sort" />
                </div>
                <template v-for="(col,j) in prop.columns">
                  <props-field
                    v-if="check(col, row)"
                    :key="(row.id || index) + '-'+j"
                    class="list-col-item flex-grow"
                    :prop="col"
                    :data="row"
                    :clone="true"
                    :rowindex="index"
                    @change="listItemChangeValue(prop, col, index, $event)"
                  />
                </template>
                <div
                  v-if="prop.supportDel"
                  class="close-btn icon-btn"
                  @click="delHandler(prop, index)"
                >
                  <i class="el-icon-remove-outline" />
                </div>
              </div>
            </draggable>
            <div
              v-if="prop.supportAdd"
              :key="i + '-tool'"
              style="margin: 0 0 20px 20px"
            >
              <el-button
                v-if="prop.supportAdd"
                style="padding-bottom: 0"
                icon="el-icon-circle-plus-outline"
                type="text"
                @click="addHandler(prop)"
              >
                {{ prop.addLabel || "新增" }}
              </el-button>
            </div>
          </template>
        </template>
      </template>
      <el-divider v-else-if="prop.type === 'divider' && check(prop)" :key="prop._id_">
        <span> {{ prop.label }}</span>
      </el-divider>
      <props-field
        v-else-if="check(prop)"
        :key="prop._id_"
        :prop="prop"
        @change="changeValue(prop, $event)"
      />
    </template>
  </div>
</template>
<script>
import {
  getValueByPath,
  setValueByPath,
  setDataByPath,
  delAttrByPath,
  uuid
} from '@/utils/util'
import PropsField from './PropsField'
import draggable from 'vuedraggable'
export default {
  name: 'PropsForm',
  components: { PropsField, draggable },

  props: {
    properties: {
      type: Array,
      default() {
        return []
      }
    },
    allProps: {
      type: Array,
      default() {
        return []
      }
    },
    // 组件配置属性
    data: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      currOpField: null, // 当前操作的配置对象
      propsData: this.data,
      fields: [],
      allFields: [],
      propsType: '',
      activeName: '常用配置',
      isInner: !!this.$parent.name,
      currId: ''
    }
  },
  watch: {
    properties(newval) {
      this.propsData = this.data
      this.currId = this.propsData.uuid
      this.fields = newval
      if (this.fields[0] && this.fields[0].group) {
        this.activeName = this.fields[0].group
      }
      // if (!this.allFields.length) {
      //   this.allFields = this.allProps
      // }
      this.sync2Value()
    },
    allProps(newval) {
      this.allFields = newval
    },
    data(newval) {
      this.propsData = newval
      this.currId = this.propsData.uuid
      this.sync2Value()
    }
  },
  created() {
    this.fields = this.properties
    this.allFields = this.allProps
    if (this.fields[0] && this.fields[0].group) {
      this.activeName = this.fields[0].group
    }
    this.currId = this.propsData.uuid
    this.sync2Value()
  },
  methods: {
    uuid() {
      return uuid(8)
    },
    /**
     * 检查列是否需要生成,并set默认值
     * @param {field} 列配置对象
     * @param {Object} ctx $list 模式中内部列配置 需要ctx数据上下文
     */
    check(field, ctx) {
      let ret = true
      ctx = ctx || this.propsData
      if (field.vif) {
        const valType = typeof field.vif
        if (valType === 'string') {
          ret = getValueByPath(ctx, field.vif)
        } else if (valType === 'object') {
          for (var attr in field.vif) {
            const isEquels = getValueByPath(ctx, attr) === field.vif[attr]
            if (!isEquels) {
              return false
            }
          }
        } else if (valType === 'function') {
          ret = field.vif(ctx, this.propsData)
        }
      }
      if (field.mapping) {
        // 给元数据赋初始值, 才能正常双向绑定
        const val = field.mode === 'list' ? getValueByPath(ctx, field.mapping) : field.value
        if (ret) {
          if (field.mapping.endsWith(']')) {
            setValueByPath(ctx, field.mapping, val)
          } else {
            setDataByPath.call(this, ctx, field.mapping, val)
          }
        } else if (field._del_ !== false) {
          if (this.properties.filter(i => i.mapping === field.mapping).length === 1) {
            delAttrByPath(ctx, field.mapping)
          }
        }
      }
      return ret
    },
    sync2Value(fields = this.allFields) {
      if (!fields.length) {
        fields = this.fields
      }
      fields && fields.forEach((field, i) => {
        if (field.mapping) {
          const val = getValueByPath(this.propsData, field.mapping)
          if (val !== undefined && val !== null) {
            if (
              !Array.isArray(val) &&
                typeof val === 'object' &&
                typeof field.value === 'object'
            ) {
              Object.assign(field.value, val)
            } else {
              field.value = val
            }
          }
        }
        if (field.columns) {
          field.columns.forEach(col => {
            col.mode = 'list'
          })
        }
        if (field.group) {
          this.sync2Value(field.properties)
        }
        if(typeof field.append === 'object') {
          this.sync2Value([field.append])
        }
      })
    },
    // 将数据同步到propsData中
    sync2PropsData(field, value) {
      if (field.mapping) {
        setValueByPath(this.propsData, field.mapping, value)
      }
    },
    changeValue(currProp, { value, prop } = {}) {
      if (!value && !prop) {
        // 处理 button 类型的编辑器,用于同步元数据
        this.sync2Value()
        return
      }
      const field = currProp === prop ? currProp : currProp.append
      this.$set(field, 'value', value)
      if (field.beforeChange) {
        const ret = field.beforeChange(value, this.propsData)
        if (ret === false) {
          return
        } else {
          value = ret
        }
      }
      this.sync2PropsData(field, value)
      if (field.onChange) {
        const ret = field.onChange(value, this.propsData)
        if (ret === true) {
          this.sync2Value()
        }
      }
    },
    changeValueChild(field) {
      this.sync2PropsData(field, field.value)
    },
    listItemChangeValue(prop, item, index, obj) {
      const listData = getValueByPath(this.propsData, prop.mapping)
      setValueByPath(listData[index], obj.prop.mapping, obj.value)
      obj.prop.value = obj.value
      this.$set(obj.prop, 'value', obj.value)
      if (item.onChange) {
        const ret = item.onChange(obj.value, listData[index], this.propsData)
        if (ret === true) {
          this.sync2Value()
        }
      }
    },
    addHandler(field) {
      const newRow = field.addHandler ? field.addHandler(this.propsData) : { }
      newRow && field.value.push(newRow)
    },
    delHandler(field, index) {
      if (field.delHandler) {
        if (field.delHandler(this.propsData, index)) {
          this.sync2Value()
        }
      }
      field.value.splice(index, 1)
    }
  }
}
</script>
<style lang="scss" scoped>
.dynamic-list-row {
  line-height: 32px;
  margin-bottom: 5px;
  &.border{
    border-bottom: 1px solid #f2f2f2;
    .el-icon-edit-outline{
      font-size:20px
    }
  }
  .icon-btn {
    padding: 0 5px;
    color: #3f73f3;
    cursor: pointer;
  }
  .close-btn {
    color: Red;
  }
  .list-col-item {
    padding: 0 2px;
  }
  .props-field {
    line-height: 30px;
    padding: 0 2px;
    margin-top: 0px;
  }
}

.span-btn {
  color: #409eff;
  font-size: 13px;
  cursor: pointer;
}
::v-deep .el-input-group__append {
  padding:0 12px
}
</style>
<style lang="scss">
.props-form {
  .el-input-group__append,
  .el-input-group__prepend {
    padding: 0 15px;
  }

}
.props-group{
  .flex-row{
    justify-content:space-between;
    padding-right:10px;
  }
  .el-collapse-item__header {
    display: flex;
    flex-direction: row;
    background: #d8e3ec;
    height: 40px;
    line-height: 40px;
    padding-left: 20px;
    font-weight: bold;
    color:#666;
  }
}
.dynamic-list-row{
  .el-icon-edit-outline{
      font-size:16px
  }
  .el-icon-remove-outline{
    font-size:15px
  }
}
.dynamic-list-row.border {
    border-bottom: 1px solid #f2f2f2;
  }
</style>
