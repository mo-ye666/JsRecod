import context from '@/common/context'
import { options } from '@/utils/util'
import baseProps from '../baseProps'
const name = {
  'line': '曲线图',
  'bar': '柱状图',
  'pie': '饼图',
  'complex': '复合图表',
  'custome': '自定义图标'
}
context.components.chart = {
  // 组件默认配置
  getConfig(args) {
    return {
      uuid: '',
      name: 'chart',
      props: {
        type: args.type,
        config: args.type === 'pie' ? { radius: [50, 70], center: [50, 50] } : {}
      },
      design: {
        bindDataAttr: 'data'
      },
      class: {},
      style: {
        height: '400px'
      }
    }
  },
  getProperties(meta) {
    return this[meta.props.type](meta)
  },
  // 组件的属性配置
  pie(meta) {
    return [
      {
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          { label: '图表类型', value: name[meta.props.type], type: 'text' },
          baseProps.common.span(),
          baseProps.common.height(),
          { type: 'divider', label: '数据设置' },
          baseProps.common.dataType({
            options: options({ static: '静态', dynamic: '模型', api: '服务' })
          }),
          {
            label: '图例数据',
            type: '$list',
            mapping: 'props.data',
            supportDel: true,
            supportAdd: true,
            value: [],
            columns: [
              {
                mapping: 'value',
                type: 'input',
                value: '',
                placeholder: '图例数值',
                clearable: true,
                width: '100px'
              },
              {
                mapping: 'label',
                type: 'input',
                value: '',
                placeholder: '图例名称'
              }
            ],
            vif(meta) { return meta.design.dataType === 'static' }
          },
          ...baseProps.common.initApi(),
          baseProps.common.dynamicData({
            mapping: 'props.:data'
          }),
          baseProps.common.valueKey({ mapping: 'props.config.valueKey' }, meta),
          baseProps.common.labelKey({ mapping: 'props.config.labelKey' }, meta),
          { type: 'divider', label: '图表设置' },
          {
            label: '自定义渲染',
            mapping: 'props.config.custom',
            type: 'bool',
            value: false,
            help: '自定义方法渲染,需配置getOption方法,图标将获取该方法的配置,渲染图表'
          }, {
            label: '选项方法',
            mapping: 'props.:getOption',
            type: 'method',
            value: '',
            help: '返回图表配置对象',
            vif: 'props.config.custom'
          },
          {
            label: '图表标题',
            mapping: 'props.config.title.text',
            type: 'input',
            value: '',
            clearable: true,
            help: '图表标题',
            vif(meta){ return !meta.props.config.custom }
          },
          {
            label: '半径',
            mapping: 'props.config.radius',
            type: 'slider',
            value: '',
            max: 100,
            min: 0,
            step: 5,
            range: true,
            vif(meta){ return !meta.props.config.custom }
          },
          {
            label: '图形水平位置',
            mapping: 'props.config.center[0]',
            type: 'slider',
            value: 50,
            max: 100,
            min: 0,
            step: 5,
            vif(meta){ return !meta.props.config.custom },
            onChange(val, meta) {
              meta.props.config.center.splice(0, 0)
              return true
            }
          },
          {
            label: '图形垂直位置',
            mapping: 'props.config.center[1]',
            type: 'slider',
            value: 50,
            max: 100,
            min: 0,
            step: 5,
            vif(meta){ return !meta.props.config.custom },
            onChange(val, meta) {
              meta.props.config.center.splice(0, 0)
              return true
            }
          },
          {
            label: '间隙',
            mapping: 'props.config.split',
            type: 'number',
            min: 0,
            max: 50,
            step: 5,
            value: 5,
            vif(meta){ return !meta.props.config.custom }
          },
          {
            label: '玫瑰图模式',
            mapping: 'props.config.roseType',
            type: 'bool',
            value: false,
            help: '是否开启南丁格尔玫瑰图显示模式',
            vif(meta){ return !meta.props.config.custom }
          },
          {
            label: '中心文字',
            mapping: 'props.config.showCenterLabel',
            type: 'bool',
            value: false,
            help: '用于环形图,标签显示',
            vif(meta){ return !meta.props.config.custom }
          },
          {
            label: '字体大小',
            mapping: 'props.config.fontSize',
            type: 'number',
            value: '20',
            help: '项目名称字体大小',
            vif(meta){ return !meta.props.config.custom }
          },
          {
            label: '显示图例',
            mapping: 'props.config.legend.show',
            type: 'bool',
            value: false,
            help: '是否显示图例',
            vif(meta){ return !meta.props.config.custom }
          },
          {
            label: '图例布局朝向',
            mapping: 'props.config.legend.orient',
            type: 'select',
            value: 'horizontal',
            options: [{ value: 'horizontal', label: '水平方向' }, { value: 'vertical', label: '垂直方向' }],
            vif(meta){ return !meta.props.config.custom && meta.props.config.legend.show }
          },
          {
            label: '图例项的icon',
            mapping: 'props.config.legend.icon',
            type: 'select',
            value: 'rect',
            options: ['circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow', 'none'],
            vif(meta){ return !meta.props.config.custom && meta.props.config.legend.show }
          },
          {
            label: '图例水平位置',
            mapping: 'props.config.legend.left',
            type: 'slider',
            value: 50,
            max: 100,
            min: 0,
            step: 5,
            vif(meta){ return !meta.props.config.custom && meta.props.config.legend.show }
          },
          {
            label: '图例垂直位置',
            mapping: 'props.config.legend.top',
            type: 'slider',
            value: 5,
            max: 100,
            min: 0,
            step: 5,
            vif(meta){ return !meta.props.config.custom && meta.props.config.legend.show }
          },
          
        ]
      },
      {

        group: '高级配置',
        groupType: 'collapse',
        properties: [
         ... baseProps.common.vif(),
          ...baseProps.common.styles()
        ]
      }
    ]
  },

  bar(meta) {
    return [
      {
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          { label: '图表类型', value: name[meta.props.type], type: 'text' },
          baseProps.common.span(),
          baseProps.common.height(),
          { type: 'divider', label: '数据设置' },
          baseProps.common.dataType({
            options: options({ dynamic: '模型', api: '服务' }),
            value: 'dynamic'
          }),
          {
            label: '图例数据',
            type: '$list',
            mapping: 'props.data',
            supportDel: true,
            supportAdd: true,
            value: [],
            columns: [
              {
                mapping: 'value',
                type: 'input',
                value: '',
                placeholder: '图例数值',
                clearable: true,
                width: '100px'
              },
              {
                mapping: 'label',
                type: 'input',
                value: '',
                placeholder: '图例名称'
              }
            ],
            vif(meta) { return meta.design.dataType === 'static' }
          },
          ...baseProps.common.initApi(),
          baseProps.common.dynamicData({
            mapping: 'props.:data'
          }),
          {
            label: '数值字段',
            mapping: 'props.config.valueKey',
            type: 'field-select',
            params: meta,
            value: '',
            help: '柱状图数值字段'
          },
          {
            label: 'X轴字段',
            mapping: 'props.config.xAxisTypeKey',
            type: 'field-select',
            params: meta,
            value: '',
            help: '柱状图X轴刻度字段,一般为日期类型的统计分类字段'
          },
          {
            label: '分类字段',
            mapping: 'props.config.seriesTypeKey',
            type: 'field-select',
            params: meta,
            value: '',
            help: 'X轴刻度展示多个种类柱状图,需要配置该分类的字段'
          },
          { type: 'divider', label: '图表设置' },
          {
            label: '柱体宽度',
            mapping: 'props.config.barWidth',
            type: 'number',
            value: 30,
            step: 5,
            help: '柱体的宽度'
          },
          {
            label: '圆角模式',
            mapping: 'props.config.radius',
            type: 'bool',
            value: false,
            help: '柱状图圆角模式'
          },
          {
            label: '自定义渲染',
            mapping: 'props.config.custom',
            type: 'bool',
            value: false,
            help: '自定义方法渲染,需配置getOption方法,图标将获取该方法的配置,渲染图表'
          }, {
            label: '选项方法',
            mapping: 'props.:getOption',
            type: 'method',
            value: '',
            help: '返回图表配置对象',
            vif: 'props.config.custom'
          }
        ]
      },
      {

        group: '高级配置',
        groupType: 'collapse',
        properties: [
         ... baseProps.common.vif(),
          ...baseProps.common.styles()
        ]
      }
    ]
  },
  line(meta) {
    return [
      {
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          { label: '图表类型', value: name[meta.props.type], type: 'text' },
          baseProps.common.span(),
          baseProps.common.height(),
          { type: 'divider', label: '数据设置' },
          baseProps.common.dataType({
            options: options({ dynamic: '模型', api: '服务' }),
            value: 'dynamic'
          }),
          {
            label: '图例数据',
            type: '$list',
            mapping: 'props.data',
            supportDel: true,
            supportAdd: true,
            value: [],
            columns: [
              {
                mapping: 'value',
                type: 'input',
                value: '',
                placeholder: '图例数值',
                clearable: true,
                width: '100px'
              },
              {
                mapping: 'label',
                type: 'input',
                value: '',
                placeholder: '图例名称'
              }
            ],
            vif(meta) { return meta.design.dataType === 'static' }
          },
          ...baseProps.common.initApi(),
          baseProps.common.dynamicData({
            mapping: 'props.:data'
          }),
          {
            label: 'X轴字段',
            mapping: 'props.config.xAxisTypeKey',
            type: 'field-select',
            params: meta,
            value: '',
            help: '曲线图X轴字段'
          },
          {
            label: 'y轴字段',
            mapping: 'props.config.yAxisTypeKey',
            type: 'field-select',
            params: meta,
            value: '',
            help: '曲线图y轴字段'
          },
          { type: 'divider', label: '图表设置' },
          {
            label: '自定义渲染',
            mapping: 'props.config.custom',
            type: 'bool',
            value: false,
            help: '自定义方法渲染,需配置getOption方法,图标将获取该方法的配置,渲染图表'
          }, {
            label: '选项方法',
            mapping: 'props.:getOption',
            type: 'method',
            value: '',
            help: '返回图表配置对象',
            vif: 'props.config.custom'
          },
          {
            label: '图表标题',
            mapping: 'props.config.title.text',
            type: 'input',
            value: '',
            clearable: true,
            help: '图表标题',
            vif(meta){ return !meta.props.config.custom }
          },
          {
            label: '平滑曲线',
            mapping: 'props.config.series.smooth',
            type: 'bool',
            value: false,
            help: '折线的样式为平滑的曲线',
            vif(meta){ return !meta.props.config.custom }
          },
          
        ]
      },
      {

        group: '高级配置',
        groupType: 'collapse',
        properties: [
         ... baseProps.common.vif(),
          ...baseProps.common.styles()
        ]
      }
    ]
  },
  getMockData(meta) {
    const valueKey = meta.props.config.valueKey || 'value'
    const labelKey = meta.props.config.labelKey || 'label'
    return [
      { [valueKey]: 1048, [labelKey]: '搜索引擎' },
      { [valueKey]: 735, [labelKey]: '直接访问' },
      { [valueKey]: 580, [labelKey]: '邮件营销' }
    ]
  }
}
