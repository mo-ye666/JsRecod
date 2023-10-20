import context from '@/common/context'
import baseProps from '../baseProps'
context.components['upload-img'] = {
  // 组件默认配置
  getConfig(parent, ctx) {
    return {
      uuid: '',
      name: 'upload-img',
      props: {
        componentWidth: 350,
        componentHeight: 200,
        fixedAccept: false,
        sizeUnit: 'MB',
        fileSize: 2,
        limit: 1,
        accept: []
      },
      design: {
        autoWidth: true
      },
      class: {},
      style: {
      },
      ref: true,
      slots: []
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
          {
            label: '组件宽度',
            mapping: 'props.componentWidth',
            type: 'number',
            value: '',
            clearable: true,
            append: 'px',
            help: '组件实际宽度'
          },
          {
            label: '组件高度',
            mapping: 'props.componentHeight',
            type: 'number',
            value: '',
            clearable: true,
            append: 'px',
            help: '组件实际高度'
          },
          {
            label: '限制格式',
            mapping: 'props.accept',
            type: 'select',
            multiple: true,
            options: [
              '.webp',
              '.bmp',
              '.pcx',
              '.tif',
              '.gif',
              '.jpeg',
              '.jpg',
              '.tga',
              '.exif',
              '.fpx',
              '.svg',
              '.psd',
              '.png',
              '.raw',
              '.wmf',
              '.flic',
              '.emf',
              '.ico'],
            value: [],
            onChange(val, meta) {
              const text = '图片格式 : ' + (val.length ? val : '没有限制')
              // meta.slots[0].children[3].children = text
              return true
            },
            help: '请选择允许上传的图片格式,不填写则不限制'
          },
          {
            label: '限制大小',
            type: 'input',
            mapping: 'props.fileSize',
            value: '2',
            append: {
              type: 'select',
              options: ['KB', 'MB', 'GB'],
              value: 'MB',
              mapping: 'props.sizeUnit',
              width: '80px'
            },
            help: '可限制上传图片的大小'
          },
          {
            label: '多张上传',
            type: 'bool',
            value: true,
            mapping: 'props.multiple',
            help: '是否可上传多张图片'
          },
          {
            label: '限制数量',
            type: 'number',
            value: 2,
            mapping: 'props.limit',
            help: '最大上传文件数量',
            vif: 'props.multiple'
          },
          {
            label: '限制尺寸',
            type: 'bool',
            value: false,
            mapping: 'props.limitImgWH',
            help: '是否需要限制上传图片的具体尺寸'
          },
          {
            label: '最大宽度',
            type: 'number',
            value: 100,
            mapping: 'props.imgWidth',
            help: '可上传图片的最大宽度设置',
            vif: 'props.limitImgWH',
            onChange(val, meta) {
              const text = `图片尺寸 : 不超过 ${meta.props.imgWidth} * ${meta.props.imgHeight} px`
              // meta.slots[0].children[4].children = text
              return true
            }
          },
          {
            label: '最大高度',
            type: 'number',
            value: 100,
            mapping: 'props.imgHeight',
            help: '可上传图片的最大高度设置',
            vif: 'props.limitImgWH',
            onChange(val, meta) {
              const text = `图片尺寸 : 不超过 ${meta.props.imgWidth} * ${meta.props.imgHeight} px`
              // meta.slots[0].children[4].children = text
              return true
            }
          },
          {
            label: '上传接口', mapping: 'props.action', type: 'exportApi', value: '', onChange(data, propsData) {
              propsData.props.action = data.interactionUrl
              propsData.props.tempCode =  data.tempCode
              return true
            }, help: '请选择上传图片的接口'
          },
          // baseProps.common.span(),
          { type: 'divider', label: '删除配置' },
          {
            label: '删除逻辑',
            mapping: 'props.foreVerRemove',
            type: 'radio',
            options: [{ value: true, label: '真实删除' }, { value: false, label: '逻辑删除' }],
            value: false,
            help: '真实删除将删除远端图片,需要调用API; 而逻辑删除只会删除数据与图片的关系,并不删除图片'
          },
          {
            label: '删除接口',
            mapping: 'props.removeApi',
            type: 'select',
            options: window.getMetaManager().meta.apis,
            labelKey: 'name',
            valueKey: 'url',
            clearable: true,
            value: '',
            help: '请选择删除图片的服务接口',
            vif: 'props.foreVerRemove'
          },
          { type: 'divider', label: '数据操作赋值' },
          {
            label: '初始图片',
            mapping: 'props.:initImgUrl',
            type: 'model',
            value: '',
            help: '初始图片赋值,请选择一个值为URL的数据模型字段'
          },
          { type: 'divider', label: '组件提示' },
          {
            group: true,
            class: 'flex-row flex-wrap',
            properties: [
              {
                label: '上传方式提示',
                mapping: 'design.showUploadTypeTip',
                type: 'bool',
                value: true
              }, {
                label: '图片大小提示',
                mapping: 'design.showImgSizeTip',
                type: 'bool',
                value: true
              }, {
                label: '图片格式提示',
                mapping: 'design.showImgFormatTip',
                type: 'bool',
                value: true
              },
              {
                label: '图片尺寸提示',
                mapping: 'design.showImgVolumeTip',
                type: 'bool',
                value: true
              }

            ]
          }
          // {
          //   label: 'json模式',
          //   mapping: 'design.isJsonImg',
          //   value: false,
          //   type: 'bool',
          //   help: '初始化图片信息是否为JSON对象'
          // }, {
          //   label: 'json模式',
          //   mapping: 'props.transKey',
          //   value: '',
          //   type: 'textarea',
          //   help: '需要转译的图片key',
          //   vif: 'design.isJsonImg'
          // }
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.disabled(),
          baseProps.common.classList(),
          ...baseProps.common.vif(),

          ...baseProps.common.styles()
        ]
      }
    ]
  },

  getEvents() {
    return [
      { id: 'uploadImgCallBack', label: '上传成功回调' },
      { id: 'resourcesURL', label: '上传成功返回URL' }
    ]
  }

}
