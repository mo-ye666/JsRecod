import context from '@/common/context'
import { options } from '@/utils/util'
import baseProps from '../baseProps'
import { audioTypeList,
  compressedTypeList,
  excelTypeList,
  fileTyleList,
  imageTyleList,
  padTypeList,
  txtTypeList,
  vedioTyleList,
  wordTypeList } from './fileFormat'
import {bus, EVENTS} from "@/common/eventBus";
context.components['upload-file'] = context.components['upload-file-new'] = {
  // 组件默认配置
  getConfig(parent, ctx) {
    return {
      uuid: '',
      name: 'upload-file',
      props: {
        componentWidth: 350,
        componentHeight: 200,
        fixedAccept: false,
        sizeUnit: 'MB',
        fileSize: 2,
        limit: 1,
        accept: [],
        fileType: 4,
        fileListHeight: '120',
        TempButtonTxt: '下载模板'
      },
      design: {
        uploadMode: 'default'
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
            label: '组件模式',
            mapping: 'design.uploadMode',
            type: 'radio',
            value: '',
            options: options({ 'default': '默认', 'simple': '简洁' }),
            onChange: (val, meta) => {
              meta.name = val === 'simple' ? 'upload-file-new' : 'upload-file'
            },
            help: '上传组件的显示风格'
          },
          {
            label: '数据模型',
            mapping: 'props.:initFileSet',
            type: 'model',
            value: '',
            checkStrictly: true,
            help: '数据模型将用于回显和保存当前已上传的文件列表,请绑定数组类型的字段'
          },
          {
            label: '上传接口', mapping: 'props.action', type: 'exportApi', value: '', onChange(data, propsData) {
              propsData.props.action = data.interactionUrl
              propsData.props.originalCode = data.tempCode
              return true
            }, help: '请选择上传文件的API接口'
          },
          {
            label: '参数设置',
            type: 'button',
            buttonText: '设置',
            onClick(e) {
              const params = meta.design.actionParams || []
              bus.$emit(EVENTS.SHOW_PARAMS_EDITOR, {
                params: params,
                uuid: meta.uuid,
                callback(params) {
                  meta.design.actionParams = params
                }
              })
            },
            vif(meta) { return 'props.action' }
          },
          baseProps.common.span(),

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
            label: '最大高度',
            mapping: 'props.componentMaxHeight',
            type: 'number',
            value: '',
            vif: (meta) => { return meta.design.uploadMode === 'simple' },
            help: '最大高度可限制上传文件列表过长撑大组件高度'
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
              width: '80px',
              onChange(val, meta) {
                // const text = `图片大小 : 小于 ${meta.props.fileSize}${val}`
                // meta.slots[0].children[2].children = text
                return true
              }
            },
            onChange(val, meta) {
              // const text = `图片大小 : 小于 ${val}${meta.props.sizeUnit}`
              // meta.slots[0].children[2].children = text
              return true
            },
            help: '可限制上传文件的大小'
          },

          {
            label: '限制数量',
            type: 'number',
            value: 0,
            mapping: 'props.quantity',
            help: '最大上传文件数量,为0,则不限制',
            vif: 'props.multiple'
          },
          {
            label: '文件类型',
            type: 'select',
            options: fileTyleList,
            value: '',
            mapping: 'props.fileType',
            help: '请选择可上传的文件类型',
            onChange(val, meta) {
              meta.props.accept = []
            },
            vif: (meta) => meta.design.uploadMode === 'default'
          },
          {
            label: '图片格式',
            mapping: 'props.accept',
            type: 'select',
            options: imageTyleList,
            multiple: true,
            value: [],
            onChange: (val, meta) => {
              if (val.length && val[val.length - 1] === 'image/*') {
                meta.props.accept = ['image/*']
              } else {
                meta.props.accept = val.filter(item => item !== 'image/*')
              }
              return true
            },
            vif: (meta) => meta.props.fileType === 1
          },
          {
            label: '视频格式',
            mapping: 'props.accept',
            type: 'select',
            options: vedioTyleList,
            multiple: true,
            value: [],
            onChange: (val, meta) => {
              if (val.length && val[val.length - 1] === 'video/*') {
                meta.props.accept = ['video/*']
              } else {
                meta.props.accept = val.filter(item => item !== 'video/*')
              }
              return true
            },
            vif: (meta) => meta.props.fileType === 2
          },
          {
            label: '音频格式',
            mapping: 'props.accept',
            type: 'select',
            options: audioTypeList,
            multiple: true,
            value: [],
            onChange: (val, meta) => {
              if (val.length && val[val.length - 1] === 'audio/*') {
                meta.props.accept = ['audio/*']
              } else {
                meta.props.accept = val.filter(item => item !== 'audio/*')
              }
              return true
            },
            vif: (meta) => meta.props.fileType === 3
          },
          {
            label: 'Excel格式',
            mapping: 'props.accept',
            type: 'select',
            options: excelTypeList,
            multiple: true,
            value: [],
            vif: (meta) => meta.props.fileType === 4
          },

          {
            label: 'Word格式',
            mapping: 'props.accept',
            type: 'select',
            options: wordTypeList,
            multiple: true,
            value: [],
            vif: (meta) => meta.props.fileType === 5
          },
          {
            label: 'PDF格式',
            mapping: 'props.accept',
            type: 'select',
            options: padTypeList,
            multiple: true,
            value: [],
            vif: (meta) => meta.props.fileType === 6
          },
          {
            label: '文本格式',
            mapping: 'props.accept',
            type: 'select',
            options: txtTypeList,
            multiple: true,
            value: [],
            vif: (meta) => meta.props.fileType === 7
          },
          {
            label: '压缩包格式',
            mapping: 'props.accept',
            type: 'select',
            options: compressedTypeList,
            multiple: true,
            value: [],
            vif: (meta) => meta.props.fileType === 8
          },
          {
            label: '文件格式',
            type: 'input',
            value: [],
            mapping: 'props.acceptFile',
            help: '输入文件格式，用逗号隔开，如：.jpg,.png,.mp4,.pdf',
            vif: (meta) => { return meta.design.uploadMode === 'simple' }
          },
          // baseProps.common.span(),
          { type: 'divider', label: '删除配置' },
          {
            label: '删除逻辑',
            mapping: 'props.foreverRemove',
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
            vif: 'props.foreverRemove'
          },
          {
            label: '启用多模板',
            mapping: 'props.moreTemplates',
            type: 'bool',
            value: false,
            vif: (meta) => { return meta.design.uploadMode === 'default' }
          },
          {
            label: '模板上传列表',
            type: '$list',
            mapping: 'props.actionList',
            supportDel: true,
            supportAdd: true,
            value: [],
            addHandler() {
              return { action: '', originalCode: '' , tempName: '', tempCode: '' }
            },
            columns: [
              {
                mapping: 'action',
                type: 'exportApi',
                value: {},
                placeholder: '请选择模板',
                onChange(api, data, meta) {
                  data.action = api.interactionUrl
                  data.originalCode = api.tempCode
                  data.tempName = api.tempName
                  data.tempCode = api.tempCode
                  return true
                }
              }, {
                mapping: 'tempName',
                type: 'text',
              }
            ],
            vif: 'props.moreTemplates'
          },
          {
            label: '模板修改列表',
            type: '$list',
            mapping: 'props.editActionList',
            supportDel: true,
            supportAdd: true,
            value: [],
            addHandler() {
              return { action: '', originalCode: '' }
            },
            columns: [
              {
                mapping: 'action',
                type: 'exportApi',
                value: {},
                placeholder: '请选择模板',
                onChange(api, data, meta) {
                  data.action = api.interactionUrl
                  data.originalCode = api.tempCode
                  meta.props.editActionList = JSON.parse(JSON.stringify(meta.props.editActionList))
                  return true
                }
              }
            ],
            vif: v => v.design.uploadMode == "default" && v.props.isEdit && v.props.moreTemplates
          },
          { type: 'divider', label: '开关配置' },
          {
            group: true,
            class: 'flex-row flex-wrap',
            properties: [
              {
                label: '自动上传',
                mapping: 'props.auto-upload',
                type: 'bool',
                value: false,
                vif: (meta) => { return meta.design.uploadMode === 'default' },
                help: '自动上传将不显示上传按钮'
              },
              {
                label: '自动关闭',
                mapping: 'props.instantClose',
                type: 'bool',
                value: false,
                vif: (meta) => { return meta.design.uploadMode === 'default' },
                help: '上传成功后自动关闭弹窗'
              },
              {
                label: '多文件上传',
                mapping: 'props.multiple',
                type: 'bool',
                vif: (meta) => { return meta.design.uploadMode === 'default' },
                value: false
              },
              {
                label: '动态上传',
                mapping: 'props.isDynamicApi',
                type: 'bool',
                vif: (meta) => { return meta.design.uploadMode === 'default' },
                value: false
              },
              { label: '显示图标',
                mapping: 'design.showIcon',
                type: 'bool',
                value: true,
                vif: (meta) => { return meta.design.uploadMode === 'default' }
              },
              {
                label: '组件居中',
                mapping: 'props.center',
                type: 'bool',
                value: false,
                vif: (meta) => { return meta.design.uploadMode === 'default' }
              },
              {
                label: '显示选择按钮',
                mapping: 'design.showChooseBtn',
                type: 'bool',
                value: true,
                vif: (meta) => { return meta.design.uploadMode === 'default' }
              }, {
                label: '显示提示',
                mapping: 'props.showTips',
                type: 'bool',
                value: true
              }, {
                label: '上传方式提示',
                mapping: 'design.showUploadTypeTip',
                type: 'bool',
                value: true,
                vif: (meta) => { return meta.design.uploadMode === 'default' && meta.props.showTips }
              }, {
                label: '文件格式提示',
                mapping: 'design.showFileFormatTip',
                type: 'bool',
                value: true,
                vif: (meta) => { return meta.design.uploadMode === 'default' && meta.props.showTips }
              },
              {
                label: '文件大小提示',
                mapping: 'design.showFileSizeTip',
                type: 'bool',
                value: true,
                vif: (meta) => { return meta.design.uploadMode === 'default' && meta.props.showTips }

              }, {
                label: '显示下载模板',
                mapping: 'props.downTempButton',
                type: 'bool',
                value: true,
                vif: (meta) => { return meta.design.uploadMode === 'default' }
              }, {
                label: '显示进度条',
                mapping: 'props.showProgressBar',
                type: 'bool',
                value: true,
                vif: (meta) => { return meta.design.uploadMode === 'default' }
              }, {
                label: '是否启用修改',
                mapping: 'props.isEdit',
                type: 'bool',
                value: false,
                vif: { 'design.uploadMode': "default" }
              },
              {
                label: '修改接口', mapping: 'props.actionEdit', type: 'exportApi', value: '', onChange(data, propsData) {
                  propsData.props.actionEdit = data.interactionUrl
                  propsData.props.originalEditCode = data.tempCode
                  return true
                }, help: '请选择上传文件的API接口',
                vif: v => v.design.uploadMode == "default" && v.props.isEdit && !v.props.moreTemplates
              },
            ]
          }
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
      { id: 'beforeFileUpload', label: '文件上传前' },
      { id: 'resourcesURL', label: '上传成功回调' },
      { id: 'progressModalClose', label: '进度条弹窗关闭事件' }
    ]
  }

}
