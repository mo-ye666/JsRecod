import context from '@/common/context'
import { options } from '@/utils/util'
import baseProps from '../baseProps'
context.components.image = {
  // 组件默认配置
  getConfig() {
    return {
      uuid: '',
      name: 'image',
      props: {
        src: 'https://purcotton-omni.oss-cn-shenzhen.aliyuncs.com/omni/mini_program/purcotton/icon2.0/egg/help_success-dialog_bg.png'
      },
      design: {
        autoWidth: true
      },
      class: {},
      style: {}
    }
  },
  // 组件的属性配置
  getProperties(meta) {
    return [
      {
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.compId(),
          baseProps.common.span(),
          baseProps.common.width(),
          baseProps.common.height(),
          {
            label: '数据绑定',
            mapping: 'design.dataType',
            type: 'radio',
            options: options({ static: '静态', dynamic: '模型' }),
            value: 'static',
            help: '请提供绑定图片地址的数据来源'
          },
          {
            label: '图片地址',
            mapping: 'props.:src',
            type: 'model',
            checkStrictly: true,
            help: '请选择用于存储图片地址数据模型对象',
            value: '',
            vif(meta) { return meta.design.dataType === 'dynamic' }
          },
          {
            label: '图片地址',
            type: 'input',
            mapping: 'props.src',
            value: '',
            help: '图片源地址',
            vif(meta) { return meta.design.dataType === 'static' }
          },
          // {
          //   label: '懒加载',
          //   type: 'bool',
          //   mapping: 'props.lazy',
          //   value: false,
          //   help: '是否开启懒加载'
          // },
          {
            label: '显示模式',
            type: 'select',
            mapping: 'props.fit',
            options: ['fill', 'contain', 'cover', 'none', 'scale-down'],
            clearable: true,
            value: '',
            help: '确定图片如何适应容器框，同原生 object-fit'
          },
          baseProps.common.classList(),
          ...baseProps.common.styles()
        ]
      }
    ]
  }

}
