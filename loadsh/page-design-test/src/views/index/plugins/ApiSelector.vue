<template>
  <el-dialog
    :title="viewMode ? '服务详情' : '选择服务(API)'"
    :visible.sync="visible"
    width="80vw"
    custom-class="api-dialog"
    @close="cancel"
  >
  <div v-if="!viewMode && tempid">
    <el-tabs v-model="currentApiType" @tab-click="apiTypeChange">
        <el-tab-pane label="模型" name="model" />
        <el-tab-pane label="应用（API）" name="api" />
    </el-tabs>
  </div>
  
    <div v-loading="loading" class="flex-row dialog-content">
      <div v-if="!viewMode" class="flex-col tree-layout">
        <div style="padding-bottom: 10px">
          <el-input
            v-model="interfaceName"
            placeholder="名称/路径"
            clearable
            class="input-width-select"
            style="width: 100%; border-color: #ecf5e8"
            size="small"
            @keyup.native="filterInterface(true)"
          >
            <el-select slot="prepend" v-model="queryTypeVal" @change="filterInterface">
              <el-option
                v-for="item in queryType"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <i slot="suffix" class="el-input__icon el-icon-search" />
          </el-input>
        </div>
        <div class="flex-col flex-grow" style="overflow: hidden">
          <el-tree
            default-expand-all
            :data="treeData"
            :props="defaultProps"
            style="overflow-y: auto; background: #ecf5e8"
            @node-click="handleClickNode"
          >
            <span
              slot-scope="{ node, data }"
              class="api-tree-node"
              :class="{
                subscribe: (data.apiUcode || data.functionCode) && (apiMap[data.apiUcode] || modelFuncMap[data.functionCode]),
                leaf: data.apiUcode || data.functionCode,
              }"
            >
              <span class="name">
                {{ node.label }}
                <span v-if="(data.apiUcode || data.functionCode) && (apiMap[data.apiUcode] || modelFuncMap[data.functionCode])">(已订阅)</span>
              </span>

            </span></el-tree>
        </div>
      </div>
      <div class="flex-col content-layout flex-grow">
        <div class="api-base flex-row flex-warp">
          <div class="item flex-row span-11">
            <div class="item-label">接口名称</div>
            <div class="item-value">{{ apiDetail.interfaceName || apiDetail.functionName}}</div>
          </div>

          <div class="item flex-row span-13">
            <div class="item-label">接口路径</div>
            <div class="item-value">{{ apiDetail.path || '未知' }}</div>
          </div>
          <div class="item flex-row span-5">
            <div class="item-label">接口类型</div>
            <div class="item-value">
              {{ apiDetail.requestTypeLabel }}
            </div>
          </div>
          <div class="item flex-row span-6">
            <div class="item-label">创建人</div>
            <div class="item-value">{{ apiDetail.createdBy }}</div>
          </div>
          <div class="item flex-row span-13">
            <div class="item-label">更新时间</div>
            <div class="item-value" :title="apiDetail.updateTime">
              {{ apiDetail.updateTime | diffText }}
            </div>
          </div>
        </div>
        <div class="api-detail flex-grow">
          <el-tabs v-model="activeName" type="card">
            <el-tab-pane label="请求参数 (Request) " name="request" />
            <el-tab-pane label="响应对象 (Response)" name="response" />
          </el-tabs>
          <div class="flex-col flex-grow" v-if="currentApiType === 'api'">
            <el-table
              v-show="activeName === 'request'"
              :max-height="maxHeight"
              :data="apiDetail.requestDetailsResponseVoList"
              size="mini"
              border
              row-key="_rowid_"
              :tree-props="{ children: 'childNode' }"
              class="flex-grow"
            >
              <el-table-column label="名称" prop="fieldName">
                <template slot-scope="scope">
                  <template v-if="scope.row.fieldName.toLowerCase() === 'baselist'">
                    <span> {{ scope.row.fieldName }}</span>
                    <el-tooltip content="发起请求时此变量不会采用key-value的方式，而是直接发送value" placement="top" effect="dark">
                      <i class="el-icon-info" />
                    </el-tooltip>
                  </template>
                  <span v-else> {{ scope.row.fieldName }}</span>
                </template>
              </el-table-column>
              <el-table-column label="备注" prop="fieldRemark" align="" />
              <el-table-column label="类型" prop="fieldType" align="">
                <template slot-scope="scope">
                  {{ scope.row.fieldTypeRemark || scope.row.fieldType }}
                </template>
              </el-table-column>
              <el-table-column
                label="是否必须"
                prop="inputRequired"
                align="center"
              >
                <template slot-scope="scope">
                  <i
                    v-show="scope.row.inputRequired"
                    class="el-icon-check"
                    style="color: green; font-size: 16px"
                  />
                  <!-- <i v-show="!scope.row.inputRequired" class="el-icon-close" style="color:red;font-size:16px" /> -->
                </template>
              </el-table-column>
            </el-table>
            <el-table
              v-show="activeName === 'response'"
              :max-height="maxHeight"
              :data="apiDetail.responseDetailsResponseVoList"
              border
              size="mini"
              row-key="_rowid_"
              :tree-props="{ children: 'childNode' }"
            >
              <el-table-column label="名称" prop="fieldName" />
              <el-table-column label="备注" prop="fieldRemark" align="" />
              <el-table-column label="类型" prop="fieldType" align="" />
            </el-table>
          </div>
          <div class="flex-col flex-grow" v-if="currentApiType === 'model'">
            <el-table
              v-show="activeName === 'request'"
              :max-height="maxHeight"
              :data="apiDetail.paramInList"
              size="mini"
              border
              row-key="_rowid_"
              :tree-props="{ children: 'nodeList' }"
              class="flex-grow"
            >
              <el-table-column label="名称" prop="paramName">
                <template slot-scope="scope">
                  <template v-if="scope.row.paramName.toLowerCase() === 'baselist'">
                    <span> {{ scope.row.paramName }}</span>
                    <el-tooltip content="发起请求时此变量不会采用key-value的方式，而是直接发送value" placement="top" effect="dark">
                      <i class="el-icon-info" />
                    </el-tooltip>
                  </template>
                  <span v-else> {{ scope.row.paramName }}</span>
                </template>
              </el-table-column>
              <el-table-column label="备注" prop="paramDesc" align="" />
              <el-table-column label="类型" prop="paramType" align="" />
              <el-table-column
                label="是否必须"
                prop="inputRequired"
                align="center"
              >
                <template slot-scope="scope">
                  <i
                    v-show="scope.row.inputRequired"
                    class="el-icon-check"
                    style="color: green; font-size: 16px"
                  />
                  <!-- <i v-show="!scope.row.inputRequired" class="el-icon-close" style="color:red;font-size:16px" /> -->
                </template>
              </el-table-column>
            </el-table>
            <el-table
              v-show="activeName === 'response'"
              :max-height="maxHeight"
              :data="apiDetail.paramOutList"
              border
              size="mini"
              row-key="_rowid_"
              :tree-props="{ children: 'nodeList' }"
            >
              <el-table-column label="名称" prop="paramName" />
              <el-table-column label="备注" prop="paramDesc" align="" />
              <el-table-column label="类型" prop="paramType" align="" />
            </el-table>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!viewMode" slot="footer" class="dialog-footer">
      <el-button size="small" @click="cancel">关 闭</el-button>
      <el-button
        v-show="isSubscribe"
        size="small"
        type="primary"
        @click="confirm(false)"
      >订阅</el-button>
      <el-button
        v-show="isSubscribe"
        size="small"
        type="primary"
        @click="confirm(true)"
      >订阅并关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import service from '@/common/service'
import Metadata from '@/common/metadata'
import { dateToDiffText, uuid, debounce, getUrlParams, handleRepeatName, filterCharts } from '@/utils/util'
import { bus, EVENTS } from '@/common/eventBus'
import model from '@/common/datamodel'
import datamodel from '@/common/datamodel'
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
      apiDetail: {},
      visible: false,
      loading: false,
      interfaceName: '',
      defaultProps: {
        children: 'apis',
        label: 'interfaceName'
      },
      activeName: 'request',
      maxHeight: '400px',
      headers: [],
      viewMode: false,
      apiMap: {}, // 已订阅api
      modelFuncMap:{}, // 已订阅模型方法
      apiQueryType:[ // api
        { value: 'apiPath', label: '路径' },
        { value: 'apiName', label: '名称' },
        { value: 'categoryName', label: '分类' }
      ],
      modelQueryType:[
        { value: 'functionName', label: '功能名称' },
        { value: 'modelDesc', label: '模型名称' }
      ],
      queryTypeVal: 'functionName',
      tempid:'', // 模板id（如果是通过模板页面创建的）
      currentApiType:'model', // 当前api类型，模型(model)or应用(api)
      isModelFunc:false,  // 是否是模型方法
      modelListData:[], // 模型列表数据
      modelAllListData:[], // 所有模型列表数据
      apiListData:[], // api列表数据
      apiAllListData:[], // 所有api列表数据
      selectedModelFunc:'', // 已选择的模型方法
      selectedModel:'' // 已选择的模型方法所属模型
    }
  },
  computed: {
    treeData() {
      return this.currentApiType === 'model'?this.modelListData:this.apiListData
    },
    treeDataBuffer() {
      return this.currentApiType === 'model'?this.modelAllListData:this.apiAllListData
    },
    isSubscribe() {
      const { apiDetail, modelFuncMap, apiMap } = this
      if(this.currentApiType === 'model') {
        return apiDetail.functionCode && !modelFuncMap[apiDetail.functionCode]
      } else {
        return apiDetail.apiUcode && !apiMap[apiDetail.apiUcode] 
      }
    },
    queryType() {
      return this.currentApiType === 'model'?this.modelQueryType:this.apiQueryType
    }
  },
  created() {
    this.tempid = getUrlParams('tempid');
    bus.$on(EVENTS.SHOW_API_SELECTOR, ({ viewMode, apiUcode, modelFuncCode, functionCode } = {}) => {
      this.visible = true
      this.viewMode = viewMode
      if (apiUcode && this.apiDetail.apiUcode !== apiUcode) {
        this.currentApiType = 'api'
        this.getInterfaceDetail(apiUcode)
      }
      if(modelFuncCode && functionCode && this.apiDetail.functionCode !== functionCode) {
        this.currentApiType = 'model'
        this.getModelFuncDetail(modelFuncCode, functionCode)
      }
      // 收集已订阅的api
      const apiMap = {}
      Metadata.meta.apis.forEach((item) => {
        apiMap[item.apiUcode] = true
      })
      this.apiMap = apiMap
      // 收集已订阅的模型
      const modelFuncMap = {}
      if(Metadata.meta.objectModels) {
        Metadata.meta.objectModels.forEach((modelItem) => {
          modelItem.functionList.forEach(funcItem => {
            modelFuncMap[funcItem.functionCode] = true
          })
        })
      }
      this.modelFuncMap = modelFuncMap
    })
    this.getTreeData()
    this.getAllModelData()
  },
  mounted() {
    this.maxHeight = parseInt(document.body.clientHeight * 0.85 - 240) + 'px'
  },

  methods: {
    // 获取所有api数据
    getTreeData(params = {}) {
      service.queryApi(params).then((res) => {
        if (res.data.length) {
          const listData = []
          res.data.map((item) => {
            const val = JSON.parse(
              JSON.stringify(item)
                .replace(/projectName/g, 'interfaceName') // 替换项目字段为应用字段
                .replace(/centerName/g, 'interfaceName') // 替换中心字段为应用字段
                // .replace(isLuoma ? '------' : /applicationName/g, 'interfaceName') // 替换中心字段为应用字段
                .replace(/categoryName/g, 'interfaceName')
                .replace(/centers/g, 'apis') // 替换中心集合字段为应用集合
                .replace(/applications/g, 'apis') // 替换中心集合字段为应用集合
                .replace(/categoryList/g, 'apis')
                .replace(/apiList/g, 'apis')
            )
            listData.push(val)
          })
          if (Object.keys(params).length === 0) {
            // 如果对象为空请求的就是所有数据，保存起来
            this.apiAllListData = listData
          }
          this.apiListData = listData
        }
      })
    },
    // 查询当前中心下所有模型
    getAllModelData(params = {}) {
      service.queryModelList(params).then((res) => {
        if (res.data.length) {
          const listData = []
          res.data.map((item) => {
            const val = JSON.parse(
              JSON.stringify(item)
                .replace(/modelTypeDesc/g, 'interfaceName') // 替换模型类别描述字段为应用字段
                .replace(/modelDesc/g, 'interfaceName') // 替换模型描述字段为应用字段
                .replace(/functionName/g, 'interfaceName') // 替换方法名称字段为应用字段
                .replace(/functionCategoryDesc/g, 'interfaceName') // 替换方法列表名称字段为应用字段
                .replace(/categoryFuncList/g, 'apis') // 替换模型方法类别集合字段为应用集合
                .replace(/modelFuncList/g, 'apis') // 替换模型集合字段为应用集合
                .replace(/functionList/g, 'apis') // 替换模型方法集合字段为应用集合
            )
            listData.push(val)
          })
          if (Object.keys(params).length === 0) {
            // 如果对象为空请求的就是所有数据，保存起来
            this.modelAllListData = listData
          }
          this.modelListData = listData
        }
      })
    },
    cancel() {
      this.visible = false
    },
    confirm(close) {
      if(this.currentApiType === 'model') {
        this.addModel();
      } else {
        this.addApi(this.apiDetail)
        this.$set(this.apiMap, this.apiDetail.apiUcode, true)
        this.apiMap[this.apiDetail.apiUcode] = true
      }
      if (close) {
        this.visible = false
      }
    },
    // 点击树节点
    handleClickNode(item, node) {
      // 没有apis，代表是接口，而不是分类
      if (item && !item.hasOwnProperty('apis')) {
        if(this.currentApiType === 'model') {
          this.getModelsData(node, item);
          this.getModelFuncDetail(item.modelCode, item.functionCode, true)
        } else {
          this.getInterfaceDetail(item.apiUcode)
        }    
      }
    },
    // 获取api详情数据
    getInterfaceDetail(apiUcode) {
      this.loading = true
      service.queryApiInfo(apiUcode).then(
        (res) => {
          this.apiDetail = res.data || {}
          if (!isNaN(this.apiDetail.requestType)) {
            this.apiDetail.requestTypeLabel = this.apiDetail.requestType
              ? 'GET'
              : 'POST'
          }
          // 处理POST 直接传数组模式
          if (
            this.apiDetail.requestParamType === 2 ||
            this.apiDetail.requestParamType === 3
          ) {
            this.apiDetail.requestDetailsResponseVoList = [
              {
                fieldName: 'baseList',
                fieldRemark: this.apiDetail.requestParamDesc,
                fieldType: this.apiDetail.requestBaseType || `Array`,
                fieldTypeRemark: `Array (${
                  this.apiDetail.requestBaseType || 'Object'
                })`,
                childNode: this.apiDetail.requestDetailsResponseVoList
              }
            ]
          }
          if (this.apiDetail.requestDetailsResponseVoList) {
            this.genListRowId(this.apiDetail.requestDetailsResponseVoList, 'req')
          } else {
            this.apiDetail.requestDetailsResponseVoList = []
          }
          if (this.apiDetail.responseDetailsResponseVoList) {
            this.genListRowId(this.apiDetail.responseDetailsResponseVoList, 'res')
          } else {
            this.apiDetail.responseDetailsResponseVoList = []
          }

          this.loading = false
        },
        () => {
          this.loading = false
        }
      )
    },
    // 获取模型方法
    getModelFuncDetail(modelCode, functionCode, isSelect) {
      service.queryModelFuncDetail({modelCode, functionCode }).then(res => {
        if(isSelect) { this.selectedModelFunc = JSON.parse(JSON.stringify(res.data)) } // 如果是点击选择模型方法时
        this.apiDetail = res.data || {}
          if (!isNaN(this.apiDetail.requestType)) {
            this.apiDetail.requestTypeLabel = this.apiDetail.requestType
              ? 'GET'
              : 'POST'
          }
          // 处理POST 直接传数组模式
          // if (
          //   this.apiDetail.requestParamType === 2 ||
          //   this.apiDetail.requestParamType === 3
          // ) {
          //   this.apiDetail.paramInList = [
          //     {
          //       paramName: 'baseList',
          //       paramDesc: this.apiDetail.requestParamDesc,
          //       paramType: this.apiDetail.requestBaseType || `Array`,
          //       paramTypeRemark: `Array (${
          //         this.apiDetail.requestBaseType || 'Object'
          //       })`,
          //       nodeList: this.apiDetail.paramInList
          //     }
          //   ]
          // }
          if (this.apiDetail.paramInList) {
            this.genListRowId(this.apiDetail.paramInList)
          } else {
            this.apiDetail.paramInList = []
          }
          if (this.apiDetail.paramOutList) {
            this.genListRowId(this.apiDetail.paramOutList)
          } else {
            this.apiDetail.paramOutList = []
          }
          this.loading = false
      }),
        () => {
          this.loading = false
        }
    },
    genListRowId(list, type) {
      list.forEach(async (item) => {
        item._rowid_ = uuid(12)
        if (item.childNode && item.childNode.length) {
          this.genListRowId(item.childNode)
        } else if(item.refCode) {
          if(type === 'req') {
            item.childNode = await this.getReqFieldData(item)
            this.genListRowId(item.childNode, type)
          } else {
            item.childNode = await  this.getRespFieldData(item)
            this.genListRowId(item.childNode, type)
          }
          
        }
      })
    },
    // 根据请求对象id获取请求对象字段
    async getReqFieldData(item) {
      let param = {
        ucode: item.refUcode,
        branchId:item.branchId,
      }
      let data = (await service.getReqSxData(param)).data || []
      return data
    },
    // 根据响应对象id获取响应对象字段
    async getRespFieldData(item) {
      let param = {
        ucode: item.refUcode,
        branchId:item.branchId,
      }

      let data = (await service.getRespSxData(param)).data || []
      return data
    },
    filterInterface: debounce(async function() {
      // 清空，显示全部
      if (this.interfaceName === '') {
        if(this.currentApiType === 'model') {
          this.modelListData = this.modelAllListData
        } else {
          this.apiListData = this.apiAllListData
        }
        return
      }
      const params = {}
      params[this.queryTypeVal] = this.interfaceName
      if(this.currentApiType === 'model') {
        this.getAllModelData(params)
      } else {
        this.getTreeData(params)
      }
      this.$forceUpdate()
    }, 500),
    addApi(apiDetail) {
      if (
        Metadata.meta.apis.filter((api) => api.apiUcode === apiDetail.apiUcode)
          .length === 0
      ) {
        const resType = ['', 'Object', 'Array', 'Page']
        const isSeniorQuey = apiDetail.seniorQuerySingleFormVOList && apiDetail.seniorQuerySingleFormVOList.length
        Metadata.meta.apis.push({
          apiUcode: apiDetail.apiUcode,
          name: apiDetail.interfaceName,
          type: apiDetail.requestType ? 'get' : 'post',
          responseType: resType[apiDetail.responseType],
          url: apiDetail.path,
          isSeniorQuery: isSeniorQuey,
          seniorQuery: isSeniorQuey ? apiDetail.seniorQuerySingleFormVOList : false,
          arrayMode:
            apiDetail.requestParamType === 2 ||
            apiDetail.requestParamType === 3
        })
      }
      model.createModelByApi(apiDetail)
      bus.$emit(EVENTS.SHOW_MODEL_PANEL)
    },

    // 添加模型数据
    addModel() {
      const { selectedModelFunc, selectedModel } = this
      datamodel.addModelAndModeFunc(selectedModel, selectedModelFunc);
      if (!window.tempModels.some(item => item.modelCode === selectedModel.modelCode)) {
        let hasModelName = {} // 收集模型名称集合
        window.tempModels.forEach(item => {
          hasModelName[item.modelName] = true
        })
        selectedModel.name = handleRepeatName(selectedModel.modelDesc || selectedModel.name, hasModelName);
        window.tempModels.push(selectedModel)
      }
      // 设置已订阅
      this.$set(this.modelFuncMap, selectedModelFunc.functionCode, true)
      this.modelFuncMap[selectedModelFunc.functionCode] = true;
      this.selectedModel = {};
      this.selectedModelFunc = {};
    },
    // 查询模型数据
    getModelsData(node, cur) {
      if(this.modelFuncMap[cur.functionCode]) return
      if(node.data.modelCode && node.data.hasOwnProperty('apis')) {
        // 如果是模型
        let func = JSON.parse(JSON.stringify(cur))
        let models = JSON.parse(JSON.stringify(node.data))
        // 处理模型方法
        func.functionName = func.interfaceName
        delete func.interfaceName
        
        // 处理模型
        let objectModel = {
          modelCode: models.modelCode,
          name: models.interfaceName,
          functionList:[]
        }
        if(models.apis.length > 0) {
          let arr = []
          let hasFuncName = {} // 功能名称集合
          let hasFuncLabel = {} // 功能label集合
          models.apis.forEach(funcClass => {
            funcClass.apis.forEach(item => {
              item.name = item.interfaceName
              item.functionName = item.interfaceName
              delete item.interfaceName
              let funcName = handleRepeatName(item.functionName, hasFuncName);
              item.functionLabel = filterCharts(item.functionLabel);
              let funcLabel = handleRepeatName(item.functionLabel, hasFuncLabel);
              hasFuncName[funcName] = true;
              hasFuncLabel[funcLabel] = true;
              item.functionName = funcName;
              item.functionLabel = funcLabel;
              item.name = item.functionName;
              arr.push(item)
            })
          })
            objectModel.functionList = arr;
          } else {
            objectModel.functionList = []
          }
          // 已选择的模型方法
          // this.selectedModelFunc = objectModel.functionList.filter(item => item.functionCode === func.functionCode)[0]; 
          this.selectedModel = objectModel; // 已选择的模型方法所属模型
          return
      } else {
        this.getModelsData(node.parent, cur);
      }
    },
    // api类型切换
    apiTypeChange() {
      console.log(this.currentApiType,"0000000000000")
    }
  }
}
</script>

<style lang="scss" scoped>
.tree-layout {
  width: 300px;
  background: #ecf5e8;
  flex-shrink: 0;
}
.content-layout {
  padding: 0 0 0 10px;
  line-height: 30px;
  font-size: 13px;
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
        width: 80px;
        padding: 0 10px;
      }
      .item-value {
        flex-grow: 1;
        color: #4179e0;
        font-size: 13px;
      }
    }
  }
  .api-detail {
    padding-top: 10px;
  }
}
.dialog-content {
  height: calc(85vh - 100px);
}
.dialog-footer {
  margin-bottom: -8px;
  // text-align: center;
}
.api-tree-node {
  &.leaf {
    .name {
      font-weight: 300;
      color: #333;
    }
    &.subscribe .name{
      color: blue
    }
  }
  width: 100%;
  line-height: 30px;
  height: 30px;
  padding-right: 50px;
  position: relative;
  .name {
    color: #888;
    font-weight: bold;
  }
  .tool {
    position: absolute;
    right: 0px;
    padding-right: 10px;
    top: 0;
  }
}
::v-deep .api-dialog {
  margin: 60px auto 0 !important;
}
::v-deep .el-dialog__body {
  padding: 0 20px;
}
.input-width-select{
  font-size: 14px;
}
::v-deep .input-width-select .el-input-group__prepend {
  width: 50px;
}
i.el-icon-info {
    color: burlywood;
    margin-left: 2px;
    vertical-align: middle;
    cursor: pointer;
  }
</style>
