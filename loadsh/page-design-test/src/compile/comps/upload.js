import {compileParams} from '../common/compileEvents'
export default function pretreatment(meta, ctx, type) {
  if (meta.name === 'upload-file') {
    meta.slots = [{ slot: 'drag', name: 'div', children: [] }]
    if (meta.design.showIcon) {
      meta.slots[0].children.push({ name: 'icon', class: { 'el-icon-upload': true }, style: { 'margin': '0' }})
    }
    if (type === 'runtime') {
      meta.props['@closeModal'] = `${meta.uuid}_close`
      ctx.vue$method.push(`
      ${meta.uuid}_close(){
        this.$common.closeDialog.call(this)
      }`)

      if (meta.design.actionParams?.length) {
        meta.props[':getRequestParam'] = `${meta.uuid}_actionParam`
        ctx.vue$method.push(`
        ${meta.uuid}_actionParam(){
          return ${compileParams(meta, {}, {}, 'design.actionParams')}
        }`)
      }
    }

    if (meta.props.showTips) {
      if (meta.design.showUploadTypeTip) {
        meta.slots[0].children.push(getTip({
          text: `点击或将文件拖拽到这里上传`,
          marginBottom: 6,
          color: '#666',
          weight: 600
        }))
      }
      if (meta.design.showFileFormatTip) {
        meta.slots[0].children.push(getTip({
          text: `文件格式: 为 ${meta.props.accept.join(',')}`,
          fontSize: 13
        }))
      }
      if (meta.design.showFileSizeTip) {
        meta.slots[0].children.push(getTip({
          text: `文件大小: 小于${meta.props.fileSize}${meta.props.sizeUnit}`,
          fontSize: 13
        }))
      }
      if (meta.design.showChooseBtn) {
        meta.slots[0].children.push({
          name: 'button',
          props: { size: 'small' },
          design: {},
          style: { color: '#5dd0c0', border: '2px solid #5dd0c0', margin: '10px 0' },
          children: '选择文件'
        })
      }
    }
  }

  if (meta.name === 'upload-img') {
    meta.slots = [{ slot: 'drag', name: 'div', children: [{ name: 'icon', class: { 'el-icon-upload': true }, style: { 'margin-top': '0' }}] }]
    if (meta.design.showUploadTypeTip) {
      meta.slots[0].children.push(getTip({
        marginBottom: 12,
        fontSize: 14,
        color: '#666',
        weight: 600,
        text: '点击或将图片拖拽到这里上传'
      }))
    }
    if (meta.design.showImgSizeTip) {
      meta.slots[0].children.push(getTip({
        fontSize: 14,
        color: '#999',
        weight: 500,
        text: `图片大小: 小于${meta.props.fileSize} ${meta.props.sizeUnit}`
      }))
    }
    if (meta.design.showImgFormatTip) {
      meta.slots[0].children.push(getTip({
        fontSize: 14,
        color: '#999',
        weight: 500,
        text: `图片格式 : ${meta.props.accept.length ? meta.props.accept.join(',') : '没有限制'}`
      }))
    }
    if (meta.props.limitImgWH && meta.design.showImgVolumeTip) {
      meta.slots[0].children.push(getTip({
        fontSize: 14,
        color: '#999',
        weight: 500,
        text: `图片尺寸 : 不超过 ${meta.props.imgWidth} * ${meta.props.imgHeight} px`
      }))
    }
  }
  if (type !== 'runtime') { meta.children = meta.slots }
}

function getTip(conf) {
  return {
    name: 'layout',
    class: { 'no-drag': true },
    props: {},
    style: {
      height: '20px',
      'margin-bottom': (conf.marginBottom || 0) + 'px',
      'font-size': (conf.fontSize || 14) + 'px',
      'color': conf.color || '#999',
      'font-weight': conf.weight || 500,
      'display': 'block'

    },
    children: conf.text
  }
}
