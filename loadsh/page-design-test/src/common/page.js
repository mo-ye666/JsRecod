import service from './service'
import { getUrlParams } from '../utils/util'
import Metadata from './metadata'
import context from './context'
import { bus, EVENTS } from './eventBus'
const PageMng = {
  pages: [],
  init() {
    // 从本地缓存中获取当前页面关联的页面列表
    const key = getUrlParams('id')
    const str = localStorage.getItem(`${key}_pages`)
    if (str) {
      const pages = JSON.parse(str)
      if (pages.length) {
        this.pages = pages
      }
    }
  },
  open(id, callback, name) {
    Metadata.unSelected()
    let page = this.pages.find(p => p.id === id)
    if (page && page.meta) {
      this.afterLoadPage(page.meta)
      callback(page)
    } else {
      if (!page && this.pages.length >= 6) {
        window.getApp().$message.warning('设计器目前限制最大标签页为6个!')
        return
      }
      service.queryPageById(id).then(({ data }) => {
        if (!data) {
          data = {
            pageName: name
          }
          Metadata.reset()
        }
        this.pageName = data.pageName
        const meta = data.pages ? JSON.parse(data.pages.layout.json) : Metadata.meta
        if (meta.engine === 'PageDesign') {
          if (page) {
            page.meta = meta
            page.name = data.pageName || page.name
          } else {
            page = {
              id,
              meta,
              name: data.pageName,
              closable: id !== getUrlParams('id')
            }
            this.pages.push(page)
          }
          this.afterLoadPage(meta)
          callback(page)
        } else {
          window.getApp().$alert('解析引擎不匹配,设计器无法解析该页面内容!', '警告', { type: 'warning' })
        }
      })
    }
  },

  openModel(id, callback){
    if (this.pages.length >= 6) {
      window.getApp().$message.warning('设计器目前限制最大标签页为6个!')
      return
    }
    service.queryPageListById(id).then(({ data }) => {
      if(data.length > 0) {
        let sameArr = [];
        data.forEach(pageItem =>{
          if(!this.pages.some(item => item.id === pageItem.pageId)){
            const meta = JSON.parse(pageItem.pages.layout.json)
            if (meta.engine === 'PageDesign') {
              let pageData = {
                  id: pageItem.pageId,
                  meta,
                  name: pageItem.pageName,
                  closable: id !== pageItem.pageId
              }
              this.pages.push(pageData)
              if(id === pageItem.pageId) {
                this.afterLoadPage(meta)
                callback(pageData)
              }
            }
            else {
              window.getApp().$alert('解析引擎不匹配,设计器无法解析该页面内容!', '警告', { type: 'warning' })
            }
          } else {
            sameArr.push(pageItem)
          }
        })
        if(sameArr.length) {
          const meta = JSON.parse(sameArr[0].pages.layout.json)
            if (meta.engine === 'PageDesign') {
              let pageData = {
                  id: sameArr[0].pageId,
                  meta,
                  name: sameArr[0].pageName,
                  closable: id !== sameArr[0].pageId
              }
              this.afterLoadPage(meta)
              callback(pageData)
            } else {
              window.getApp().$alert('解析引擎不匹配,设计器无法解析该页面内容!', '警告', { type: 'warning' })
            }
        }
      }
    })
  },

  openComponent(id, callback, name) {
    Metadata.unSelected()
    let page = this.pages.find(p => p.id === id)
    if (page && page.meta) {
      this.afterLoadPage(page.meta)
      callback(page)
    } else {
      if (!page && this.pages.length >= 6) {
        window.getApp().$message.warning('设计器目前限制最大标签页为6个!')
        return
      }
      service.queryComponentById(id).then(({ data }) => {
        if (!data) {
          data = {
            pageName: name
          }
          Metadata.reset()
        }
        this.pageName = data.name
        const meta = data.json ? JSON.parse(data.json) : Metadata.meta
        if (meta.engine === 'PageDesign') {
          if (page) {
            page.meta = meta
            page.name = data.name || page.name
          } else {
            page = {
              id,
              meta,
              name: data.name,
              closable: id !== getUrlParams('id')
            }
            this.pages.push(page)
          }
          this.afterLoadPage(meta)
          callback(page)
        }
      })
    }
  },

  close(id) {
    const index = this.pages.findIndex((page) => page.id === id)
    if (index !== -1) { this.pages.splice(index, 1) }
    this.udpateStorage()
  },

  afterLoadPage(meta) {
    context.clear()
    Metadata.meta = meta
    Metadata.updateIdStore()
    this.udpateStorage()
    bus.$emit(EVENTS.COMPONENT_DRAG_END, null, true)
    bus.$emit(EVENTS.PAGE_TAB_CHANGE)
    bus.$emit(EVENTS.COMPONENT_SELECTED, meta)
  },

  udpateStorage() {
    const pages = this.pages.map(page => {
      return {
        id: page.id,
        name: page.name,
        closable: page.closable
      }
    })
    const key = getUrlParams('id')
    localStorage.setItem(`${key}_pages`, JSON.stringify(pages))
  }
}
PageMng.init()
export default PageMng
