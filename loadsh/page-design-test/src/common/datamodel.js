import Metadata from '@/common/metadata'
import { uuid, filterCharts } from '@/utils/util'
export default {
  /**
   * 根据服务接口的参数创建数据模型, Api有入参request,与输出response
   * @param {Object} apiDetail 接口详情
   */
  createModelByApi(apiDetail) {
    const request = apiDetail.requestDetailsResponseVoList || []
    const response = apiDetail.responseDetailsResponseVoList || []
    if (apiDetail.seniorQuerySingleFormVOList) {
      const modelName = apiDetail.methodName + '_Request'
      // 判断是否有重名模型,如果有,则不继续添加
      if (!Metadata.meta.models.some(item => item.name === modelName)) {
        const model = {
          id: modelName,
          name: modelName,
          apiUcode: apiDetail.apiUcode,
          apiName: apiDetail.interfaceName,
          type: 'request',
          fields: apiDetail.seniorQuerySingleFormVOList.map(col => {
            return this.columnToField(col, modelName)
          })
        }
        Metadata.meta.models.push(model)
      }
      return
    }
    if (request.length && apiDetail.requestParamType !== 2 && apiDetail.requestParamType !== 3) {
      const modelName = apiDetail.methodName + '_Request'
      // 判断是否有重名模型,如果有,则不继续添加
      if (!Metadata.meta.models.some(item => item.name === modelName)) {
        const model = {
          id: modelName,
          name: modelName,
          apiUcode: apiDetail.apiUcode,
          apiName: apiDetail.interfaceName,
          type: 'request',
          fields: request.map(col => {
            return this.columnToField(col, modelName)
          })
        }
        Metadata.meta.models.push(model)
      }
    }
    if (response && response.length && apiDetail.responseType === 1) {
      const modelName = apiDetail.methodName + '_Response'
      // 判断是否有重名模型,如果有,则不继续添加
      if (!Metadata.meta.models.some(item => item.name === modelName)) {
        const model = {
          id: modelName,
          name: modelName,
          apiUcode: apiDetail.apiUcode,
          apiName: apiDetail.interfaceName,
          type: 'response',
          fields: response.map(col => {
            return this.columnToField(col, modelName)
          })
        }
        Metadata.meta.models.push(model)
      }
    }
  },
  /**
   * 自定义创建数据模型 {name,fields:[]}
   * @param {Object} model 配置
   */
  createModel(model) {
    model.id = model.name
    Metadata.meta.models.push(model)
    // 生成字段的id,当前模型中唯一
    model.fields.forEach(field => {
      this.updateFieldId(field, model.name)
    })
  },

  // 数据模型更新
  updateModel(model) {
    // 重新生成模型字段ID
    model.fields.forEach(field => {
      this.updateFieldId(field, model.name)
    })
  },

  updateFieldId(field, parentId) {
    field.id = parentId ? `${parentId}.${field.name}` : field.name
    if (field.children) {
      field.children.forEach(item => {
        this.updateFieldId(item, field.id)
      })
    }
  },

  columnToField(col, parentId) {
    const id = parentId ? `${parentId}.${col.fieldName}` : col.fieldName
    const field = {
      id,
      name: col.fieldName,
      label: col.fieldRemark || col.fieldName,
      dataType: col.fieldType,
      inputRequired: col.inputRequired
    }
    if (col.childNode && col.childNode.length) {
      field.children = col.childNode.map(col => {
        return this.columnToField(col, id)
      })
    }
    return field
  },
  /**
   * 根据api信息同步该api的相关模型数据
   * @param {Object} apiDetail
   */
  sync(apiDetail) {
    const models = Metadata.meta.models.filter(item => item.apiUcode && item.apiUcode === apiDetail.apiUcode)
    if(models.length > 0) {
      const request = apiDetail.requestDetailsResponseVoList || []
      const response = apiDetail.responseDetailsResponseVoList || []
      const requestModel = models.find(item => item.type === 'request')
      const responseModel = models.find(item => item.type === 'response')
      if (requestModel && request && request.length) {
        const fields = request.map(col => {
          return this.columnToField(col, requestModel.name)
        })
        this.udpateFields(requestModel, fields)
      }
      if (responseModel && response && response.length) {
        const fields = response.map(col => {
          return this.columnToField(col, responseModel.name)
        })
        this.udpateFields(responseModel, fields)
      }
    } else {
      this.createModelByApi(apiDetail)
    }
    
  },

  /**
   * 使用API查询的字段信息,替换模型的字段信息
   * @param {*} model 模型对象
   * @param {*} newFields  字段信息
   */
  udpateFields(model, newFields) {
    const oldFieldMap = {}
    const customFields = []
    model.fields.forEach(field => {
      if (field.custom) {
        customFields.push(field)
      } else {
        oldFieldMap[field.id] = field
      }
    })
    newFields.forEach(field => {
      // 找到原有模型字段的配置信息,并且保留原有配置
      const oldField = oldFieldMap[field.id]
      if (oldField) {
        field.defaultValue = oldField.defaultValue || ''
        field.valueSource = oldField.valueSource || ''
        if (oldField.children && oldField.children.length) {
          field.children = oldField.children
        }
      }
    })
    model.fields = [...newFields, ...customFields]
  },
 /**
 * 根据模型方法创建数据模型, 有入参request,与输出response
 * @param {Object} modelObj 模型对象
 * @param {Object} modelFunc 模型方法
 */
  createModelByModelFunc(modelFuc) {
    const funcDetail = JSON.parse(JSON.stringify(modelFuc));
    funcDetail.functionLabel = filterCharts(funcDetail.functionLabel)
    const request = funcDetail.paramInList || []
    const response = funcDetail.paramOutList || []
    if (request.length && funcDetail.requestParamType !== 2 && funcDetail.requestParamType !== 3) {
      const modelName = `${funcDetail.functionLabel}_Request`
      // 判断是否有重名模型,如果有,则不继续添加
      if (!Metadata.meta.models.some(item => item.apiUcode === funcDetail.functionCode)) {
        const model = {
          id: modelName,
          name: modelName,
          apiUcode: funcDetail.functionCode,
          apiName: funcDetail.functionName,
          type: 'request',
          apiType: funcDetail.functionCategory,
          isModelFunc: true,
          fields: funcDetail.paramInList.map(col => {
            return this.columnToFieldByModelFunc(col, modelName)
          })
        }
        Metadata.meta.models.push(model)
      } else {
        Metadata.meta.models.forEach(modelItem => {
          if(modelItem.apiUcode === funcDetail.functionCode) {
            modelItem.fields = funcDetail.paramInList.map(col => {
              return this.columnToFieldByModelFunc(col, modelName)
            })
          }
        })
      }
      return
    }
    if (response.length && funcDetail.responseType === 1) {
      const modelName = `${funcDetail.functionLabel}_response`
      // 判断是否有重名模型,如果有,则不继续添加
      if (!Metadata.meta.models.some(item => item => item.apiUcode === funcDetail.functionCode)) {
        const model = {
          id: modelName,
          name: modelName,
          apiUcode: funcDetail.functionCode,
          apiName: funcDetail.functionName,
          type: 'response',
          apiType: funcDetail.functionCategory,
          isModelFunc: true,
          fields: funcDetail.paramOutList.map(col => {
            return this.columnToFieldByModelFunc(col, modelName)
          })
        }
        Metadata.meta.models.push(model)
      } else {
        Metadata.meta.models.forEach(modelItem => {
          if(modelItem.apiUcode === funcDetail.functionCode) {
            modelItem.fields = funcDetail.paramOutList.map(col => {
              return this.columnToFieldByModelFunc(col, modelName)
            })
          }
        })
      }
      return
    }
  },
    /**
   * 生成对象字段
   * @param {Object} col 字段
   * @param {String} parentId 父级id
   */
  columnToFieldByModelFunc(col, parentId) {
    const id = parentId ? `${parentId}.${col.paramName}` : col.paramName
    const field = {
      id,
      name: col.paramName,
      label: col.paramDesc || col.paramName,
      dataType: col.paramType,
      inputRequired: false
    }
    if (col.nodeList && col.nodeList.length) {
      field.children = col.nodeList.map(item => {
        return this.columnToFieldByModelFunc(item, id)
      })
    }
    return field
  },
   /**
   * 添加模型及模型方法
   * @param {Object} modelObj 模型对象
   * @param {String} modelFunc 模型方法
   */
  addModelAndModeFunc(modelObj, modelFunc) {
    const resType = ['', 'Object', 'Array', 'Page', 'void', 'basic']
    const methodType = ['post', 'get', 'put', 'delete']
    const reqType = ['basic', 'object', 'object_list', 'single_basic_list', 'empty']
    modelFunc.requestMethod = methodType[modelFunc.requestType] // 请求方式
    modelFunc.responseType = resType[modelFunc.responseType] // 响应类型
    modelFunc.requestType = reqType[modelFunc.requestParamType] // 请求类型
    modelFunc.functionLabel = filterCharts(modelFunc.functionLabel)
    delete modelFunc.createdBy
    delete modelFunc.updateBy
    delete modelFunc.createTime
    delete modelFunc.updateTime
    delete modelFunc.disable
    // 如果当前模型中没有选中模型
    if (!Metadata.meta.objectModels.some(item => item.modelCode === modelObj.modelCode)) {
      Metadata.meta.objectModels.push({
        modelCode: modelObj.modelCode,
        name:modelObj.name,
        functionList:modelFunc?[modelFunc]:[]
      })
      this.createModelByModelFunc(modelFunc) // 添加到对象中
      return;
    }
    Metadata.meta.objectModels.forEach(model => {
      if(model.modelCode === modelObj.modelCode) {
        // 如果该模型中没有此模型方法
        if (!model.functionList.some(item => item.functionCode === modelFunc.functionCode)) {
          model.functionList.push(modelFunc)
          this.createModelByModelFunc(modelFunc) // 添加到对象中
        } else {
          model.functionList = model.functionList.filter(item => item.functionCode !== modelFunc.functionCode)
        }
      }
    })
  }
}
