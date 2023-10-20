import loadScript from '@/compile/common/loadScript'
import ELEMENT from 'element-ui'

let tinymceObj

export default function loadTinymce(cb) {
  if (tinymceObj) {
    cb(tinymceObj)
    return
  }

  const loading = ELEMENT.Loading.service({
    fullscreen: true,
    lock: true,
    text: '富文本资源加载中...',
    spinner: 'el-icon-loading',
    background: 'rgba(255, 255, 255, 0.5)'
  })

  loadScript('https://lib.baomitu.com/tinymce/5.3.2/tinymce.min.js', () => {
    loading.close()
    // eslint-disable-next-line no-undef
    tinymceObj = tinymce
    cb(tinymceObj)
  })
}
