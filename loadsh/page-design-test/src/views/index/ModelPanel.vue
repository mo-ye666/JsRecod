<template>
  <div class="flex-col flex-grow model-list">
    <div class="flex-row top-tools">
      <el-tooltip
        class="item"
        effect="dark"
        content="视图切换"
        placement="bottom"
      >
        <i class="el-icon-view view-icon" @click="viewChange" />
      </el-tooltip>
      <el-tooltip
        class="item"
        effect="dark"
        content="基于API创建数据模型"
        placement="bottom"
      >
        <i class="p-icon-APIkaifa view-icon" @click="createModel(true)" />
      </el-tooltip>
      <el-tooltip
        class="item"
        effect="dark"
        content="自定义数据模型"
        placement="bottom"
      >
        <i class="p-icon-moxing view-icon" @click="createModel()" />
      </el-tooltip>
    </div>
    <el-divider> <span>对象</span> </el-divider>
    <el-collapse accordion @change="accordion">
      <el-collapse-item
        v-for="model in meta.models"
        :key="model.id"
        class="model-item"
      >
        <template slot="title">
          <el-tooltip
            class="item"
            effect="dark"
            :content="modelTip(model)"
            placement="left"
          >
            <span class="model-label">
              <i
                :class="model.apiUcode ? 'p-icon-APIkaifa' : 'p-icon-moxing'"
                style="margin-right: 4px"
              />
              <span>{{ model.name }}</span>
            </span>
          </el-tooltip>
          <div class="flex-grow" style="width: 10px" />
          <div class="model-tools" @click.stop>
            <i class="el-icon-edit-outline" @click="editModel(model)" />
            <i
              v-if="model.type != 'system'"
              class="el-icon-delete"
              style="color: red"
              @click="removeModel(model)"
            />
          </div>
        </template>
        <div class="model-content">
          <div v-if="model.fields.length>=10" class="model-filter">
            <el-input
              v-model="filterStr"
              placeholder="搜索/过滤"
              clearable
              style="width: 100%"
              size="mini"
              @input="filterModelFields(model)"
            >
              <i slot="suffix" class="el-input__icon el-icon-search" />
            </el-input>
          </div>
          <el-tree
            :data="filterFields || model.fields"
            node-key="id"
            draggable
            :allow-drag="allowDrag"
            :allow-drop="
              () => {
                return false;
              }
            "
            @node-drag-start="handleDragStart"
          >
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <span class="field-name">{{
                mode ? data.name : (node.label || data.name)
              }}</span>
              <span class="data-type">
                <i v-if="data.custom" class="p-icon-moxing" />
                {{ data.dataType }}
              </span>
            </span>
          </el-tree>
        </div>
      </el-collapse-item>
      <el-divider> 已订阅服务 </el-divider>
      <div class="api-list">
        <div v-for="api in apis" :key="api.apiUcode" class="flex-row api-item">
          <div style="cursor: pointer" @click="apiView(api)">
            {{ api.name }}
          </div>
          <div class="flex-grow" />
          <i class="el-icon-refresh-right" @click="apiSync(api)" />
          <i
            class="el-icon-delete"
            style="color: red"
            @click.stop="apiRemove(api)"
          />
        </div>
      </div>
      <el-divider> 模型 </el-divider>
      <div class="models-list">
        <el-collapse-item
          v-for="model in objectModels"
          :key="model.modelCode"
          class="model-item"
        >
          <template slot="title">
            <el-tooltip
              class="item"
              effect="dark"
              :content="'功能模型'"
              placement="left"
            >
              <span class="model-label">
                <i class="p-icon-APIkaifa" style="margin-right: 4px" />
                <span>{{ model.name }}</span>
              </span>
            </el-tooltip>
            <div class="flex-grow" style="width: 10px" />
            <div class="model-tools" @click.stop>
              <i class="el-icon-refresh-right" @click="modelSync(model)" />
              <!-- <i class="el-icon-edit-outline" @click="editModel(model)" /> -->
              <!-- <i
                v-if="model.type != 'system'"
                class="el-icon-delete"
                style="color: red"
                @click="removeModel(model)"
              /> -->
            </div>
          </template>
          <div class="func-model-content">
            <div
              v-for="func in model.functionList"
              :key="func.functionCode"
              class="flex-row func-model-item"
            >
              <div style="cursor: pointer" @click="modelFuncView(model, func)">
                {{
                  mode ? func.functionLabel : func.name || func.functionLabel
                }}
              </div>
              <div class="flex-grow" />
              <i class="el-icon-refresh-right marginright" @click="modelFuncSync(func, model)" />
              <el-checkbox
                :value="isSelecedFuncModel(model, func)"
                @change="selectFuncModel(model, func, $event)"
              ></el-checkbox>
            </div>
          </div>
        </el-collapse-item>
      </div>
    </el-collapse>
  </div>
</template>

<script>
import metadata from "@/common/metadata";
import service from "@/common/service";
import datamodel from "@/common/datamodel";
import { bus, EVENTS } from "@/common/eventBus";
import { handleRepeatName, filterCharts } from '@/utils/util'
export default {
  components: {},
  data() {
    return {
      models: null,
      compData: null,
      meta: metadata.meta,
      mode: false,
      apis: metadata.meta.apis,
      filterStr: "",
      filterFields: null,
      filterModelId: "",
      objectModels: [
        {
          modelCode: "模型编码",
          modelName: "模型名称",
          functionList: [
            {
              functionCode: "功能编码",
              functionCategory: "功能分类，数据模型名称用这个叠加上去", // 比如add1_request
              functionName: "功能名称",
              path: "",
              requestMethod: "post",
              requestType: "object",
              responseType: "void",
            },
          ],
        },
      ],
    };
  },
  computed: {
    modelTip() {
      return function (model) {
        if (model.apiUcode) {
          if (model.isModelFunc) {
            return `模型方法 [ ${model.apiName} ] 的 ${
              model.type === "request" ? "入参" : "响应"
            }数据模型`;
          } else {
            return `API [ ${model.apiName} ] 的 ${
              model.type === "request" ? "入参" : "响应"
            }数据模型`;
          }
        } else if (model.type === "system") {
          return model.label;
        } else {
          return "自定义数据模型";
        }
      };
    },
  },
  watch: {},
  mounted() {
    this.objectModels = JSON.parse(JSON.stringify(window.tempModels));
  },
  created() {},
  methods: {
    allowDrag() {
      return true
    },
    handleDragStart(node, ev) {
      const data = {
        type: 'field',
        data: node.data
      }
      ev.dataTransfer.setData('out2design', JSON.stringify(data))
    },
    removeModel(model) {
      metadata.meta.models = metadata.meta.models.filter((d) => d !== model)
    },
    editModel(model) {
      if (model.id === 'props') {
        bus.$emit(EVENTS.SHOW_COMP_CONFIG)
      } else {
        bus.$emit(EVENTS.SHOW_MODEL_EDITOR, model)
      }
    },
    viewChange() {
      this.mode = !this.mode
    },
    createModel(isApi) {
      if (isApi) {
        bus.$emit(EVENTS.SHOW_API_SELECTOR)
      } else {
        bus.$emit(EVENTS.SHOW_MODEL_EDITOR)
      }
    },
    apiView(data) {
      bus.$emit(EVENTS.SHOW_API_SELECTOR, {
        viewMode: true,
        apiUcode: data.apiUcode
      })
    },
    apiRemove({ apiUcode }) {
      this.apis = metadata.meta.apis = metadata.meta.apis.filter(
        (api) => api.apiUcode !== apiUcode
      )
    },
    apiSync(api) {
      service.queryApiInfo(api.apiUcode).then(({ data }) => {
        api.type = data.requestType ? 'get' : 'post'
        api.name = data.interfaceName
        const res = ['', 'Object', 'Array', 'Page']
        api.responseType = res[data.responseType]
        api.url = data.path
        datamodel.sync(data)
        this.$message.success('接口信息同步成功!')
      })
    },
    filterModelFields(model) {
      if (this.filterStr) {
        this.filterFields = model.fields.filter(field => {
          return field.name.indexOf(this.filterStr) !== -1 || field.label.indexOf(this.filterStr) !== -1
        })
      } else {
        this.filterFields = null;
      }
    },
    accordion() {
      this.filterStr = ''
      this.filterFields = null
    },
    // 更新模型数据
    modelSync(model) {
      // 查询模型详情
      service.queryTempModelsDetail(model.modelCode).then((res) => {
        if (res.data.length > 0) {
          let arr = [];
          let hasFuncName = {} // 功能名称集合
          let hasFuncLabel = {} // 功能label集合
          res.data.map((funcClass) => {
            funcClass.functionList.map((item) => {
              let funcName = handleRepeatName(func.functionName, hasFuncName);
              func.functionLabel = filterCharts(func.functionLabel);
              let funcLabel = handleRepeatName(func.functionLabel, hasFuncLabel);
              hasFuncName[funcName] = true;
              hasFuncLabel[funcLabel] = true;
              func.functionName = funcName;
              func.functionLabel = funcLabel;
              item.name = item.functionName;
              arr.push(item);
            });
          });
          model.functionList = arr;
        } else {
          model.functionList = [];
        }
        // 放到全局变量中
        window.tempModels.forEach(modelItem => {
          if(model.modelCode === modelItem.modelCode) {
            modelItem.functionList = model.functionList;
          }
        })
        this.objectModels = JSON.parse(JSON.stringify(window.tempModels));
        this.$message.success("模型数据同步成功!");
      });
    },
    // 更新模型功能数据
    async modelFuncSync(curFunc, curModel) {
      let funcRes = await service.queryModelFuncDetail({
        modelCode: curModel.modelCode,
        functionCode: curFunc.functionCode,
      });
      if (funcRes.success) {
        // 对象到models中
        datamodel.createModelByModelFunc(funcRes.data);
        this.$message.success("模型功能同步成功!");
      }
    },
    // 查看模型
    modelFuncView(curModel, curFunc) {
      bus.$emit(EVENTS.SHOW_API_SELECTOR, {
        viewMode: true,
        modelFuncCode: curModel.modelCode,
        functionCode: curFunc.functionCode,
      });
    },
    // 选择功能模型
    async selectFuncModel(curModel, curFunc, value) {
      // 添加或删除模型或方法到objectModels中
      let model = JSON.parse(JSON.stringify(curModel));
      let func = JSON.parse(JSON.stringify(curFunc));
      datamodel.addModelAndModeFunc(model, func);
      if (!value) return;
      let funcRes = await service.queryModelFuncDetail({
        modelCode: curModel.modelCode,
        functionCode: curFunc.functionCode,
      });
      if (funcRes.success) {
        // 添加对象到models中
        datamodel.createModelByModelFunc(funcRes.data);
      }
    },
    // 模型方法是否选中
    isSelecedFuncModel(curModel, curFunc) {
      let bool = false;
      if(!metadata.meta.objectModels) {
        return;
      }
      metadata.meta.objectModels.forEach((model) => {
        if (model.modelCode === curModel.modelCode) {
          model.functionList.forEach((func) => {
            if (func.functionCode === curFunc.functionCode) {
              bool = true;
            }
          });
        }
      });
      return bool;
    },
  },
};
</script>
<style lang="scss" scoped>
.model-list {
  position: relative;
  .view-icon {
    padding: 2px 5px;
    cursor: pointer;
  }
  .top-tools {
    padding: 5px 0;
    background: #4d566f;
    color: #ffffff;
  }
}
.model-filter{
  padding:6px;
  border-bottom:1px dashed #eee;
}
.model-label {
  color: #566c84;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.custom-tree-node {
  font-size: 13px;
  line-height: 30px;
  cursor: move;
  width: 90%;
  span.data-type {
    float: right;
    font-size: 11px;
    color: #9fa7e0;
    padding-right: 5px;
  }
  span.field-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    width: 170px;
  }
}
.model-tools {
  justify-content: flex-end;
  flex-shrink: 0;
  i {
    padding: 0 5px;
    color: #1659c7;
    font-size: 14px;
  }
  margin-right: 10px;
}
.api-list {
  font-size: 13px;
  margin: 0 10px;
  .api-item {
    background: #e5edff;
    line-height: 36px;
    padding: 0 10px;
    border-radius: 2px;
    color: #3a70c1;
    margin-top: 10px;
    i {
      line-height: 36px;
      font-size: 14px;
      padding: 0 0 0 10px;
      cursor: pointer;
    }
  }
}
.func-model-content {
  font-size: 13px;
  margin: 0 10px;
  .func-model-item {
    background: #e5edff;
    line-height: 36px;
    padding: 0 10px;
    border-radius: 2px;
    color: #3a70c1;
    margin-top: 10px;
    i {
      line-height: 36px;
      font-size: 14px;
      padding: 0 0 0 10px;
      cursor: pointer;
    }
  }
}
::v-deep .el-divider__text {
  background-color: #f7f9fc;
}
</style>
<style lang="scss">
.model-list {
  .el-tree-node__content {
    border-bottom: 1px dashed #eee;
    height: 32px;
  }
  .el-collapse {
    border: 1px solid #ebeef5;
  }
  .el-collapse-item__header {
    display: flex;
    flex-direction: row;
    background: #d8e3ec;
    height: 40px;
    line-height: 40px;
    padding-left: 5px;
  }
}
.marginright {
  margin-right: 10px;
}
</style>
