import context from '@/common/context'
import baseProps from '../baseProps'
import { bus, EVENTS } from '@/common/eventBus'
import { uuid,options } from '@/utils/util'
context.components['p-micro-app'] = {

  // 组件默认配置
  getConfig() {
    return {
      uuid: '',
      name: 'p-micro-app',
      props: { url: "", code: "", title: ""},
      design: { dataType: "dynamic", perms: []},
      class: {},
      style: {}
    }
  },

  beforeRender(opts) {
    // 设计时样式修正,没设置高度,则给添加一个样式,用于给一个默认的最小高度
    if (!opts.style.height) {
      opts.class['no-height'] = true
    }
  },

  // 组件的属性配置
  getProperties(meta) {
    if (!parent) {
      return []
    }
    return [
      {
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.help(`1、目前阶段需要使用该组件前，需要经过平台评估才允许使用。<br/>
                                 2、不是所有页面都允许使用，仅限于特殊场景才允许使用，一般页面按原来的低代码开发模式走。不涉及二开，以及高度定制化的页面才可以使用微组件。<br/>
                                 3、微组件为平台延伸功能，技术架构采用阿里qiankun-手动加载微应用模式。本地开发代码模式<br/>`),
          baseProps.common.targetUrl('开发文档','https://doc.weixin.qq.com/txdoc/word?docid=w2_AIwAcgZIAH48xb3x0IaTde2XoKdlG&scode=APQAmQeOAAYPeTLh02AIwAcgZIAH4&type=0'),                   
          baseProps.common.targetUrl('申请填写','https://doc.weixin.qq.com/sheet/e3_AIwAcgZIAH4xAMUq1DjSQuCKvgq6E?scode=APQAmQeOAAYqm0n5lbAIwAcgZIAH4'), 
          // baseProps.common.compId(),
          // baseProps.common.span(),
          {
            label: '标题',
            mapping: 'props.title',
            type: 'input',
            value: '',
            clearable: true,
            help: '页面/组件标题',
            placeholder:'非必填 title 标题'
          },
          {
              label: '组件名',
              mapping: 'props.code',
              type: 'input',
              value: '',
              clearable: true,
              help: '注册组件名',
              placeholder:'必填 code 注册组件名'
          },
          {
            label: '组件类型',
            mapping: 'props.pageType',
            type: 'input',
            value: '',
            clearable: true,
            help: '根据类型条件初始化展示组件',
            placeholder:'非必填 pageType 组件类型'
          },
          baseProps.common.dynamicData({
            mapping: 'props.:params'
          }),
          {
            label: '配置URL',
            mapping: 'props.debug',
            type: 'radio',
            options: options({ platform: '平台通用', custom: '自定义' }),
            value: 'platform',
            help: '请提供绑定数据的来源类型'
          },
          {
            label: '访问地址',
            mapping: 'props.url',
            type: 'input',
            value: '',
            clearable: true,
            help: '微组件的访问地址',
            placeholder:'必填 url 访问地址',
            vif: (meta) => { return meta.props.debug === 'custom' },
          },
          {
            label: '内部权限控制',
            type: '$list',
            mapping: 'design.perms',
            supportDel: true,
            supportAdd: true,
            supportSort: false,
            value: [],
            addHandler(data) {
              data.design.perms.push({ id: uuid(4), code: uuid(8), name: '' })
            },
            columns: [
              {
                mapping: 'code',
                type: 'input',
                placeholder: '权限编码',
                value: ''
              },
              {
                mapping: 'name',
                type: 'input',
                value: '',
                width: '140px',
                placeholder: '权限别名'
              }
            ]
          },
        ]
      }
    ]
  }

}
