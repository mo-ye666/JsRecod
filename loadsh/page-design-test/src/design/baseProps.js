import { getComponentId, options, uuid } from '@/utils/util'
import constants from '@/common/constants'
import { bus, EVENTS } from '@/common/eventBus'
import i18n from '@/render/src/utils/i18n'
import { tipsPlacement } from './uploadFile/fileFormat'
export default {
  common: {
    // 组件ID, 只读
    compId() {
      return {
        label: '组件编号',
        mapping: 'uuid',
        type: 'text',
        value: '',
        vif: 'uuid'
      }
    },
    // 组件类型, 只读
    compName() {
      return {
        label: '组件类型',
        mapping: 'name',
        type: 'text',
        value: ''
      }
    },
    // 可变组件类型 属性 (可切换)
    compType() {
      return {
        label: '组件类型',
        mapping: 'name',
        type: 'select',
        value: ''
      }
    },
    // 标题
    title() {
      return {
        label: '标题',
        mapping: 'props.title',
        type: 'i18n',
        value: '标题',
        help: '请设置标题'
      }
    },
    // 事件编排
    eventBtn() {
      return [{ type: 'divider', label: '事件编排' }, {
        label: '事件编排',
        buttonText: '设置',
        type: 'button',
        onClick(e) {
          const uuid = getComponentId(e.target)
          bus.$emit(EVENTS.SHOW_EVENT_SETUP, uuid)
        }
      }]
    },
    // 可变组件类型 属性 (可切换)
    classList(prop) {
      return Object.assign({
        label: '扩展样式',
        mapping: 'design.classList',
        type: 'input',
        value: '',
        multiple: true,
        filterable: true,
        allowCreate: true,
        help: '添加自定义样式类名,多选请用逗号分割'
      }, prop)
    },
    placeholder(prop) {
      return Object.assign({
        label: '占位文本',
        mapping: 'props.placeholder',
        type: 'i18n',
        value: '',
        clearable: true
      }, prop)
    },
    fontSize() {
      return {
        label: '字体大小',
        mapping: 'style.font-size',
        type: 'number',
        value: '',
        format(val, isEdit) {
          if (isEdit) {
            return val ? parseInt(val) : ''
          } else {
            return val ? parseInt(val) + 'px' : ''
          }
        }
      }
    },
    lineHeight() {
      return {
        label: '行高',
        mapping: 'style.lineHeight',
        type: 'number',
        value: '',
        clearable: true,
        append: 'px',
        format(val, isEdit) {
          if (isEdit) {
            return val ? parseInt(val) : ''
          } else {
            return val ? parseInt(val) + 'px' : ''
          }
        }
      }
    },
    multiple() {
      return {
        label: '多选',
        mapping: 'props.multiple',
        type: 'bool',
        value: false,
        help: '是否可以选中多项'
      }
    },
    clearable() {
      return {
        label: '清除按钮',
        mapping: 'props.clearable',
        type: 'bool',
        value: false,
        help: '是否显示清除按钮(clearable)'
      }
    },
    customAttr() {
      return {
        label: '自定义属性',
        mapping: 'design.customAttr',
        type: 'input',
        value: '',
        help: '自定义属性'
      }
    },
    model() {
      return {
        label: '模型字段',
        mapping: 'design.vmodel',
        type: 'model',
        help: '绑定数据模型字段(v-model)',
        value: '',
        vif: 'unaided',
        _del_: false
      }
    },
    dataType(prop = {}) {
      return Object.assign({
        label: '数据绑定',
        mapping: 'design.dataType',
        type: 'select',
        options: options({ static: '静态', dynamic: '动态',objectModel:'模型', api: '服务' }),
        value: 'static',
        help: '请提供绑定数据的来源类型'
      }, prop)
    },
    staticData() {
      return {
        label: '静态数据录入',
        type: '$list',
        mapping: 'design.options',
        supportDel: true,
        supportAdd: true,
        value: [],
        columns: [
          {
            mapping: 'label',
            type: 'i18n',
            value: '',
            placeholder: '标签'
          },
          {
            mapping: 'value',
            type: 'input',
            value: '',
            placeholder: '值',
            clearable: true,
            width: '80px'
          }
        ],
        vif(meta) { return meta.design.dataType === 'static' }
      }
    },
    dynamicData(props) {
      return Object.assign({
        label: '模型数据',
        mapping: 'design.dynamicOptions',
        type: 'model',
        checkStrictly: true,
        help: '请选择数据模型',
        value: '',
        vif(meta) { return meta.design.dataType === 'dynamic' }
      }, props)
    },
    objectModel(prop) {
      return Object.assign({
        label: '选择模型',
        mapping: 'design.initApi.functionCode',
        type: 'objectModel',
        help: '请选择模型',
        value: ''
      }, prop)
    },
    api(prop) {
      const apis = window.getMetaManager().meta.apis || []
      return Object.assign({
        label: '选择服务',
        mapping: 'design.initApi.apiUcode',
        type: 'select',
        options: apis,
        labelKey: 'name',
        valueKey: 'apiUcode',
        help: '请选择服务',
        value: ''
      }, prop)
    },
    initObjectModel(meta) {
      const apis = window.getMetaManager().meta.apis || []
      return [
        {
          label: '选择模型',
          mapping: 'design.initApi.functionCode',
          type: 'objectModel',
          help: '请选择模型',
          value: '',
          vif(meta) { return meta.design.dataType === 'objectModel' }
        },
        {
          label: '参数设置',
          type: 'button',
          buttonText: '设置',
          onClick(e) {
            const apiUcode = meta.design.initApi.functionCode || ''
            const params = meta.design.initApi.params || []
            bus.$emit(EVENTS.SHOW_PARAMS_EDITOR, {
              params: params,
              uuid: meta.uuid,
              apiUcode: apiUcode,
              callback(params) {
                meta.design.initApi.params = params
              }
            })
          },
          vif(meta) { return meta.design.initApi?.functionCode }
        }, {
          label: '数据加工',
          mapping: 'design.initApi.resultTransform',
          type: 'method',
          onlyCode: true,
          value: '',
          vif(meta) { return meta.design.initApi?.functionCode },
          help: '如需要对服务返回的数据做加工处理,可选择自定义方法,并在方法内返回修正好的数据'
        }
      ]
    },
    initApi(meta) {
      const apis = window.getMetaManager().meta.apis || []
      return [
        {
          label: '选择服务',
          mapping: 'design.initApi.apiUcode',
          type: 'select',
          options: apis,
          labelKey: 'name',
          valueKey: 'apiUcode',
          help: '请选择服务',
          value: '',
          vif(meta) { return meta.design.dataType === 'api' }
        }, {
          label: '参数设置',
          type: 'button',
          buttonText: '设置',
          onClick(e) {
            const apiUcode = meta.design.initApi.apiUcode || ''
            const params = meta.design.initApi.params || []
            bus.$emit(EVENTS.SHOW_PARAMS_EDITOR, {
              params: params,
              uuid: meta.uuid,
              apiUcode: apiUcode,
              callback(params) {
                meta.design.initApi.params = params
              }
            })
          },
          vif(meta) { return meta.design.initApi?.apiUcode }
        }, {
          label: '数据加工',
          mapping: 'design.initApi.resultTransform',
          type: 'method',
          onlyCode: true,
          value: '',
          vif(meta) { return meta.design.initApi?.apiUcode },
          help: '如需要对服务返回的数据做加工处理,可选择自定义方法,并在方法内返回修正好的数据'
        }
      ]
    },
    valueKey(data = {}, meta) {
      return Object.assign({
        label: '值字段',
        mapping: 'design.valueKey',
        type: 'field-select',
        params: meta,
        value: '',
        vif(meta) { return meta.design.dataType !== 'static' }
      }, data)
    },
    labelKey(data = {}, meta) {
      return Object.assign({
        label: '描述字段',
        mapping: 'design.labelKey',
        params: meta,
        type: 'field-select',
        value: '',
        vif(meta) { return meta.design.dataType !== 'static' }
      }, data)
    },
    span() {
      return {
        label: '宽度',
        mapping: 'design.span',
        type: 'slider',
        value: 24,
        max: 24,
        min: 0,
        marks: {
          12: ''
        },
        help: '栅格宽度,将按24等分设置布局宽度,该项优先级低于像素宽度'
      }
    },
    height() {
      return {
        label: '高度',
        mapping: 'style.height',
        type: 'input',
        value: '',
        clearable: true,
        help: '组件高度,支持像素与百分比,比如 100px 或 10%, 备注:设计模式下组件会有默认高度'
      }
    },
    width(param = {}) {
      return Object.assign({
        label: '宽度',
        mapping: 'style.width',
        type: 'input',
        value: '',
        clearable: true,
        append: 'px',
        format(val, isEdit) {
          if (isEdit) {
            return val ? parseInt(val) : ''
          } else {
            return val ? parseInt(val) + 'px' : ''
          }
        },
        help: '像素宽度,该设置优先级高于栅格宽度,设置该项后 栅格宽度将不生效'
      }, param)
    },
    flexibility() {
      return {
        label: '弹性',
        mapping: 'style.flex-grow',
        type: 'bool',
        value: false,
        format(val, isEdit) {
          return isEdit ? !!val : val ? 1 : ''
        },
        help: '组件是否自动填充父组件剩余空间,如果多组件设置了弹性,则平分剩余空间(父组件为flex布局时生效)'
      }
    },
    disabledExp() {
      return {
        label: '禁用条件',
        mapping: 'design.disabled',
        type: 'input',
        value: '',
        help: '禁用条件表达式'
      }
    },
    layout() {
      return {
        label: '内部布局',
        mapping: 'design.layout',
        type: 'radio',
        options: options({ col: '列', row: '行' }),
        value: 'col',
        onChange(val, meta) {
          meta.style['flex-wrap'] = val === 'row' ? 'wrap' : ''
          return true
        },
        help: '组件内部布局方式,行:水平,从左至右排列, 列:垂直,子组件将从上而下排列'
      }
    },
    wrap() {
      return {
        label: '允许换行',
        mapping: 'style.flex-wrap',
        type: 'bool',
        value: false,
        format(val, isEdit) {
          if (isEdit) {
            return !!val
          } else {
            return val ? 'wrap' : ''
          }
        },
        vif: (meta) => { return meta.design.layout === 'row' },
        help: '当子组件按列布局时, 是否允许子组件超出当前行宽度后换行'
      }
    },
    justify() {
      return {
        label: '主轴对齐',
        mapping: 'style.justify-content',
        type: 'select',
        options: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around'],
        value: '',
        clearable: true,
        help: '内容对齐方式,具体请查看flex 布局 justify-content详细介绍'
      }
    },
    alignItems() {
      return {
        label: '交叉轴对齐',
        mapping: 'style.align-items',
        type: 'select',
        options: ['flex-start', 'flex-end', 'center', 'baseline', 'stretch'],
        value: '',
        clearable: true,
        help: '内容对齐方式,具体请查看flex 布局 align-items详细介绍'
      }
    },
    textAlign() {
      return {
        label: '文本对齐',
        mapping: 'style.text-align',
        type: 'select',
        options: ['left', 'right', 'center', 'justify', 'inherit'],
        value: '',
        clearable: true,
        help: '内容对齐方式,具体请查看flex 布局 text-align 详细介绍'
      }
    },
    scroll() {
      return {
        label: '滚动条',
        mapping: 'design.scroll',
        type: 'select',
        options: [{ value: '', label: '无' }, { value: 'x', label: '允许横向滚动' }, { value: 'y', label: '允许垂直滚动' }],
        value: ''
      }
    },
    vif() {
      return [{
        label: '渲染条件风格',
        mapping: 'design.vifType',
        type: 'select',
        options: [ { value: '', label: 'vif' },{ value: 'vshow', label: 'vshow' }, ],
        value: ''
      },{
        label: '渲染条件',
        mapping: 'design.vif',
        type: 'expression',
        value: '',
        help: '设置条件表达式,表达式满足时,该组件才会渲染'
      }]
    },
    vfor() {
      return [{ type: 'divider', label: '循环指令配置' }, {
        label: '循环渲染',
        mapping: 'design.vfor',
        type: 'bool',
        value: '',
        help: '是否需要循环渲染多次该组件'
      }, {
        label: '循环变量',
        mapping: 'design.scope',
        type: 'model',
        filter: 'Array',
        checkStrictly: true,
        value: '',
        vif: 'design.vfor',
        help: '循环的数组对象'
      }, {
        label: '对象别名',
        mapping: 'design.scope_alias',
        type: 'input',
        value: 'item',
        vif: 'design.vfor',
        help: '子组件可以使用该别名访问数组子对象'
      }]
    },
    disabled() {
      return {
        label: '禁用条件',
        mapping: 'design.disabled',
        type: 'input',
        value: '',
        help: '禁用条件表达式'
      }
    },
    readonly() {
      return {
        label: '只读',
        mapping: 'props.readonly',
        type: 'bool',
        value: false,
        help: '设置为只读'
      }
    },
    size() {
      return {
        label: '组件尺寸',
        mapping: 'props.size',
        type: 'radio',
        options: options({ medium: '中等', small: '较小', mini: '迷你' }),
        value: constants.COMMON_SIZE
      }
    },
    permission() {
      return [
        { type: 'divider', label: '权限控制' },
        {
          label: '权限',
          mapping: 'design.perm',
          type: 'bool',
          value: false,
          help: '是否做权限控制',
          onChange(val, meta) {
            if (val) {
              meta.design.permLabel = i18n.t(meta.design.slotText) || ''
              // 生成权限唯一编码, 如果已存在,则使用以前的,否则生成新的
              meta.design.permId = meta.design.permId || uuid(32)
              return true
            }
          }
        }, {
          label: '权限别名',
          mapping: 'design.permLabel',
          type: 'input',
          value: '',
          vif: 'design.perm',
          help: '用于授权的标识名称'
        }
      ]
    },
    tooltip() {
      return [
        { type: 'divider', label: '提示' },
        {
          label: '提示',
          mapping: 'design.tooltip',
          type: 'bool',
          value: false,
          help: '展示鼠标 hover 时的提示信息'
        },
        {
          label: '提示文本',
          mapping: 'design.tipLabel',
          type: 'i18n',
          value: '',
          help: '具体展示的文本信息',
          vif: 'design.tooltip'
        },
        {
          label: '提示主题',
          mapping: 'design.tipEffect',
          type: 'radio',
          options: options({ dark: '黑', light: '白' }),
          value: 'dark',
          help: '提示颜色信息',
          vif: 'design.tooltip'
        },
        {
          label: '提示位置',
          mapping: 'design.tipPlacement',
          type: 'select',
          options: tipsPlacement,
          value: 'top',
          help: 'Tooltip 的出现位置',
          vif: 'design.tooltip'
        }
      ]
    },
    bgcolor() {
      return {
        label: '背景色',
        mapping: 'style.background',
        type: 'color',
        value: '',
        help: '背景颜色设置'
      }
    },
    margin() {
      return {
        label: '外边距',
        mapping: 'style.margin',
        type: 'input',
        value: '',
        help: '请按照标准css margin属性配置,可以 5px 或 5px 5px 等方式配置 '
      }
    },
    padding() {
      return {
        label: '内边距',
        mapping: 'style.padding',
        type: 'input',
        value: '',
        help: '请按照标准css padding属性配置,可以 5px 或 5px 5px 等方式配置 '
      }
    },
    styles() {
      return [
        { type: 'divider', label: '样式设置' },
        this.padding(),
        this.margin(),
        this.bgcolor()
        // {
        //   label: '字体大小',
        //   mapping: 'design.cls.font-size',
        //   type: 'number',
        //   value: '',
        //   format(val, isEdit) {
        //     if (isEdit) {
        //       return val ? parseInt(val) : ''
        //     } else {
        //       return val ? parseInt(val) + 'px' : ''
        //     }
        //   }
        // },
        // {
        //   label: '字体颜色',
        //   mapping: 'design.cls.color',
        //   type: 'color',
        //   value: ''
        // }
      ]
    },
    help(desc) {
      return {
        type: 'help',
        value: desc,
      }
    },
    targetUrl(label, url) {
      return {
        type: 'url',
        label,
        value: url,
      }
    },
  }
}
