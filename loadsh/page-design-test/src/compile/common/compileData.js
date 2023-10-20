export default function compile(meta, ctx) {
  const vars = []
  meta.models.forEach(model => {
    if (model.id === 'props') {
      // 组件模式
      ctx.vue$props.push(model.fields.map(field => {
        if(field.dataType.toLowerCase() === 'object') {
          return `${field.id}:{type: ${field.dataType}, default () { return ${field.defaultValue?field.defaultValue:'{}'}}}`
        } else if (field.dataType.toLowerCase() === 'array') {
          return `${field.id}:{type: ${field.dataType}, default () { return ${field.defaultValue?field.defaultValue:'[]'}}}`
        } else {
          if(field.defaultValue) {
            if(field.dataType.toLowerCase() === 'string') {
              return `${field.id}:{type: ${field.dataType}, default: '${field.defaultValue}'}`
            } else {
              return `${field.id}:{type: ${field.dataType}, default: ${field.defaultValue}}`
            }
          } else {
            return `${field.id}:${field.dataType}`
          }
        }
      }))
      ctx.vue$props.push(`perms: {
        type: Object,
        default () {
          return {}
        }
      }`)
    } else if (model.id !== 'params') {
      const isApi = model.apiUcode
      vars.push(`${model.name}:{${getFieldsVars(model.fields, isApi)}}`)
    }
  })
  ctx.vue$data.push(...vars)
}

function getFieldsVars(fields, isApi) {
  const vars = []
  fields.forEach(field => {
    let value = "''"

    if (field.dataType === 'Array') {
      value = getValue(field) || `[]`
    } else if (field.dataType === 'boolean') {
      value = getValue(field) || 'false'
    } else if (field.dataType === 'Object') {
      if (field.children && field.children.length) {
        value = `{${getFieldsVars(field.children)}}`
      } else {
        value = getValue(field) || '{}'
      }
    } else if (field.dataType === 'String') {
      value = getValue(field) || `''`
    } else {
      value = getValue(field)
    }
    // if (isApi && !value) {
    //   if (field.name === 'pageNum') {
    //   } else if (field.name === 'pageSize') {
    //   }
    // }
    if (isApi && !value && (field.name === 'pageNum' || field.name === 'pageSize')) {
      // 模型pageNum 与pageSize 暂时不需要生成
    } else {
      vars.push(`${field.name || '字段未命名'}: ${value}`)
    }
  })
  return vars.join(',')
}

function getValue(field) {
  if (field.defaultValue) {
    if (field.valueSource === 'value') {
      if (field.dataType === 'String') {
        return `'${field.defaultValue || ''}'`
      } else if (field.dataType === 'Integer') {
        return parseInt(field.defaultValue)
      } else {
        return field.defaultValue
      }
    } else if (field.valueSource === 'querys') {
      return 'this.' + field.defaultValue
    }
  } else {
    return null
  }
}
