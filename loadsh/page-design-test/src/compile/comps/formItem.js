export default function pretreatment(meta, ctx, type) {
  // 如果配置了校验规则,则需要做个转换
  if (meta.props.rules) {
    meta.props.rules = ruleConvert(meta.props.rules, meta.required, meta.requiredType ,meta.design.isDynamicRule, meta)
  }
  const hasRule = meta.props.rules && meta.props.rules[0]
  if (meta.children && ['select', 'cascader'].includes(meta.children.name) && hasRule) {
    meta.props.rules[0].trigger = 'change'
  }
  if (type === 'runtime') {
    // 处理formItem的作用域 scope 配置 (for循环指令)，这个方法其实应该放在if下面执行，可以避免同页面存在多个表单，存在字段名一样，且为动态校验的需求bug
    // 比如a.b.c和d.b.c，校验规则目前都是b_c_rules，区分不出来
    // 但现有页面已经有人用了b_c_rules，除非找出来改正，否则该方法不能移到if下面
    if (meta.design.isDynamicRule) {
      const name = (meta.props.prop + '_rules').replace(/\./g, '_')
      const rulesJson = JSON.stringify(meta.props.rules).replace(/"---\$---/g, '').replace(/---\$---"/g, '').replace(/\\\\/g, '\\')
      ctx.vue$data.push(`${name}: ${rulesJson}`)
      delete meta.props.rules
      meta.props[':rules'] = name
    }
    setFormItemProp(meta, ctx)
  }
}

/**
 * 通过元数据与上下文对象分析
 * @param {Object} meta 当前组件元数据对象
 * @param {Object} ctx  编译上下文
 */
function setFormItemProp(meta, ctx) {
  // vfor的作用域处理
  const prop = meta.props.prop
  if (prop) {
    const scopes = []
    ctx.path.forEach(item => {
      if (item.design.scope) {
        scopes.push({ name: item.design.scope, alias: item.design.scope_alias })
      }
    })
    const hasScope = scopes.reverse().some(scope => {
      if (prop.startsWith(scope.name)) {
        const name = scope.name.substr(scope.name.indexOf('.') + 1)
        meta.props[':prop'] = '"' + name + '."+index+"' + prop.substr(scope.name.length) + '"'
        delete meta.props.prop
        return true
      }
    })
    if (!hasScope) {
      meta.props.prop = prop.substr(prop.indexOf('.') + 1)
    }
  }
}

/**
 *
 * @param {Array} rules 校验规则
 * @param {Boolean} isRequired 是否必填,
 * @param {Boolean} useThis 是否需要使用This,
 */
function ruleConvert(rules, isRequired, requiredType, useThis, meta) {
  let newRules = []
  if(requiredType && isRequired) {
    newRules = [{
      required: isRequired == true ?`---$---${isRequired}---$---` : `---$---this.${isRequired}---$---`,
      message: meta.requiredMessage
    }]
  }
  if(!requiredType && isRequired) {
    newRules = [{ required: true, message: meta.requiredMessage }]
  }

  rules.forEach(rule => {
    if (rule.type === 0 && rule.pattern) {
      newRules.push({
        pattern: `---$---${rule.pattern}---$---`,
        message: rule.message
      })
    } else if (rule.type === 1 && rule.func) {
      newRules.push({
        validator: useThis ? `---$---this.${rule.func}---$---` : `---$---${rule.func}---$---`
      })
    }
  })
  return newRules
}
