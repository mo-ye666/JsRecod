import { bus, EVENTS } from '../common/eventBus'
import metadata from '../common/metadata'

const plugin = {
  undos: [],
  redos: [],
  currJson: '',
  install() {
    this.currJson = metadata.toJson()
    // 监听元数据节点更新 消息
    bus.$on(EVENTS.METADATA_STEP_UPDATE, () => {
      this.undos.push(this.currJson)
      this.currJson = metadata.toJson()
      this.redos = []
    })

    // 监听撤销快捷键
    bus.$on(EVENTS.HOTKEY_CTRLZ, () => {
      if (this.undos.length) {
        this.redos.push(metadata.toJson())
        this.currJson = this.undos.pop()
        this.restoreMetadata(JSON.parse(this.currJson))
      }
    })

    // 监听重做快捷键
    bus.$on(EVENTS.HOTKEY_CTRLY, () => {
      if (this.redos.length) {
        this.undos.push(this.currJson)
        this.currJson = this.redos.pop()
        this.restoreMetadata(JSON.parse(this.currJson))
      }
    })
  },

  /**
     * 数据还原
     * @param {Object} redata
     */
  restoreMetadata(redata) {
    metadata.meta.children = redata.children
  }
}
plugin.install()
export default plugin
