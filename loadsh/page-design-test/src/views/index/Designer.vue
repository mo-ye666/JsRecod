<template>
  <div class="flex-row" :class="{ dragging: dragging }" @click="hideMenu">

    <div calss="flex-col" class="sidebar">
      <span class="sidebar-brand">
        <svg-icon icon-class="comps" class="brand-icon" @click="showPageTree" />
      </span>
      <ul class="sidebar-nav">
        <li v-for="(group, i) in comps" :key="i" class="sidebar-item">
          <a class="sidebar-link">
            <svg-icon :icon-class="group.icon" />
          </a>
          <ul
            ref="dragList"
            class="sidebar-dropdown"
            :class="group.class"
          >
            <li
              v-for="(comp, index) in group.children"
              :key="index"
              :name="comp.name"
              :code="comp.code"
              :label="comp.label"
              class="sidebar-item"
            >
              <a class="sidebar-link">
                <svg-icon :icon-class="comp.icon || comp.name" />
                <span class="comp-text">{{ comp.label }}</span></a>
            </li>
          </ul>
        </li>
      </ul>
      <div class="sidebar-model flex-col" style="margin-top: 200px">
        <a class="sidebar-link" @click="showApi">
          <el-tooltip
            class="item"
            effect="dark"
            content="订阅服务"
            placement="right"
          >
            <i class="p-icon-APIkaifa" />
          </el-tooltip>
        </a>
        <a
          class="sidebar-link"
          @click="
            model = null;
            showModelEditor = true;
          "
        >
          <el-tooltip
            class="item"
            effect="dark"
            content="创建数据模型"
            placement="right"
          >
            <i class="p-icon-moxing" />
          </el-tooltip>
        </a>
      </div>
    </div>
    <div class="flex-col flex-grow" style="width: 0">
      <div class="toolbar flex-row">
        <div class="space" style="width: 10px" />
        <div class="space flex-grow" style="line-height:30px">
          <el-tabs v-model="activePage" type="card" :addable="true" @tab-click="pageChange" @tab-add="showPageTree" @tab-remove="pageRemove">
            <el-tab-pane v-for="page in pageList" :key="page.id" :label="page.name" :name="page.id" :closable="page.closable" />
          </el-tabs>
        </div>
        <el-button-group style="flex-shrink:0;margin-left:10px">
          <el-button
            type="primary"
            icon="p-icon-save"
            size="small"
            @click="savePage"
          >保存</el-button>
          <el-button
            v-if="isComponent"
            type="success"
            icon="p-icon-right-fill"
            size="small"
            @click="publish"
          >发布</el-button>
          <el-button
            icon="p-icon-json-full"
            size="small"
            @click="showJson"
          >元数据</el-button>
          <el-button
            icon=" p-icon-CSSyangshi"
            size="small"
            @click="showCss"
          >CSS</el-button>
          <el-button type="danger" icon="el-icon-delete" size="small" @click="clear">清空</el-button>
          <el-button
            type="warning"
            icon="p-icon-debug"
            size="small"
            @click="preview"
          >预览/调试</el-button>
        </el-button-group>
        <div class="space" style="width: 10px" />
      </div>
      <div
        id="design_panel"
        class="flex-row flex-grow main layout no-select"
        :class="{ dragging: dragging }"
        @contextmenu="showContextMenu"
      >
        <v-render
          v-if="refresh"
          :config="meta"
          :context="designCtx"
          @click.native="designClick"
        />
        <tools />
      </div>
    </div>
    <div class="flex-col properties">
      <right-panel />
    </div>
    <div v-show="contextMenus.length" class="context-menu" :style="menuStyle">
      <div v-for="menu in contextMenus" :key="menu.code" class="menu-item" @click="menuClick(menu)">
        <i :class="menu.icon" />
        <span>{{ menu.name }}</span>
      </div>
    </div>
    <json-drawer
      size="60%"
      :visible.sync="jsonDrawerVisible"
      :json-str="JSON.stringify(meta)"
      @refresh="refreshJson"
    />
    <css-drawer />
    <preview-drawer :visible.sync="previewVisible" :meta="meta" size="100%" />
    <sort-dialog />
    <api-selector />
    <event-setup />
    <page-selector />
    <params-editor />
    <add-model-field />
    <columns-editor />
    <condition-editor />
    <export-api-selector />
    <component-config v-if="isComponent" />
    <model-editor
      v-if="showModelEditor"
      v-model="model"
      :visible.sync="showModelEditor"
      @save="saveModel"
    />
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import { comps } from '@/common/config'
import RightPanel from './RightPanel'
import JsonDrawer from './plugins/JsonDrawer'
import EventSetup from './plugins/event/EventSetup'
import PreviewDrawer from './plugins/PreviewDrawer'
import CssDrawer from './plugins/CssDrawer'
import ApiSelector from './plugins/ApiSelector'
import PageSelector from './plugins/PageSeletor.vue'
import ExportApiSelector from './plugins/ExportAPISelector.vue'
import ModelEditor from './plugins/ModelEditor'
import ParamsEditor from './plugins/ParamsEditor.vue'
import ColumnsEditor from './plugins/ColumnsEditor.vue'
import AddModelField from './plugins/AddModelField.vue'
import ComponentConfig from './plugins/ComponentConfig.vue'
import ConditionEditor from './plugins/ConditionEditor.vue'
import SortDialog from './plugins/SortDialog.vue'
import Metadata from '@/common/metadata'
import PageMng from '@/common/page'
import model from '@/common/datamodel'
import context from '@/common/context'
import { bus, EVENTS } from '@/common/eventBus'
import beforeRender from '@/design/beforeRender'
import loadBeautifier from '@/utils/loadBeautifier'
import service from '@/common/service'
import Tools from '@/components/layout/src/Tools.vue'
import { getUrlParams, getComponentId, getComponentId2, uuid } from '@/utils/util'
import metadata from '@/common/metadata'
import { compile } from '@/compile/common/compile'
let currPosStr = ''
window.getMetaManager = function() {
  return Metadata
}
export default {
  components: {
    RightPanel,
    JsonDrawer,
    PreviewDrawer,
    ApiSelector,
    ColumnsEditor,
    ExportApiSelector,
    ModelEditor,
    EventSetup,
    PageSelector,
    ParamsEditor,
    AddModelField,
    Tools,
    CssDrawer,
    SortDialog,
    ConditionEditor,
    ComponentConfig
  },
  data() {
    return {
      comps,
      meta: Metadata.getMeta(),
      jsonDrawerVisible: false,
      previewVisible: false,
      dragging: false,
      refresh: true,
      showModelEditor: false,
      model: null,
      designCtx: {
        _beforeRender_: beforeRender,
        vue: this
      },
      pageName: '新建页面',
      spaces: [],
      pageList: PageMng.pages,
      activePage: '',
      isComponent: false, // 是否是组件设计模式
      contextMenus: [], // 右键菜单列表
      menuStyle: {} // 右键菜单位置样式
    }
  },
  created() {
    const params = getUrlParams()
    this.isComponent = params.type === 'components'
    if (params.id && this.isComponent) {
      PageMng.openComponent(params.id, (page) => {
        this.activePage = page.id
        this.meta = page.meta
      })
    }
    if(params.id && !params.tempid && !this.isComponent) {
      PageMng.open(params.id, (page) => {
        this.activePage = page.id
        this.meta = page.meta
        this.getModelsData();
        if (this.meta.id.indexOf('page') === -1) {
          this.meta.id = 'page-' + uuid(8)
        }
      })
    }
    if(params.id && params.tempid) {
      PageMng.openModel(params.id, (page) => {
          this.activePage = page.id
          this.meta = page.meta
          this.getModelsData();
          if (this.meta.id.indexOf('page') === -1) {
            this.meta.id = 'page-' + uuid(8)
          }
        })
    }
    if (!this.isComponent) {
      service.queryComponentList().then(({ data }) => {
        const group = this.comps.find(obj => obj.name === '业务组件')
        group.children = data.map((d) => {
          return {
            code: d.code,
            label: d.name,
            name: 'async-component'
          }
        })
      })
      this.comps[0].children = this.comps[0].children.filter(item => item.name !== 'v-slot')
    } else {
      // 组件模式,不需要显示异步组件列表, 目前不支持组件嵌套组件
      this.comps.pop()
    }
  },
  mounted() {
    // 监听 拖拽开始事件, 显示布局空隙辅助排序, 并标识dragging true
    bus.$on(EVENTS.COMPONENT_DRAG_START, (evt) => {
      this.showLayoutPadding(evt.item)
      if (!evt.item.getAttribute('uuid')) {
        Metadata.unSelected()
      }
      this.dragging = true
    })
    bus.$on(EVENTS.SHOW_MODEL_EDITOR, (model) => {
      this.showModelEditor = true
      this.model = model
    })
    bus.$on(EVENTS.DESIGN_COMPONENT_CLICK, (e) => {
      this.designClick(e)
    })
    bus.$on(EVENTS.HIDE_RIGHT_MENU, () => {
      this.contextMenus = []
    })

    // 监听 拖拽结束事件,强制设计时组件面板重新渲染
    bus.$on(EVENTS.COMPONENT_DRAG_END, (evt, reload) => {
      this.spaces.forEach(space => {
        if (space.parentElement) {
          space.parentElement.removeChild(space)
        }
      })
      this.spaces = []
      this.dragging = false
      if (reload) {
        this.refresh = false
        this.$nextTick(() => {
          this.refresh = true
        })
      }
    })
    this.$nextTick(() => {
      this.bindSitebarDrag()
    })
    loadBeautifier(() => {})
  },
  methods: {
    bindSitebarDrag() {
      this.$refs.dragList.forEach((el) => {
        var ops = {
          animation: 400,
          dragClass: 'sortable-drag',
          ghostClass: 'sortable-ghost',
          chosenClass: 'sortable-chosen',
          sort: false,
          group: {
            name: 'design', // 组名
            pull: 'clone',
            put: false
          },
          onStart(evt) {
            bus.$emit(EVENTS.COMPONENT_DRAG_START, evt)
          },
          onEnd(evt) {
            evt.item.parentElement.removeChild(evt.item)
            bus.$emit(EVENTS.COMPONENT_DRAG_END, evt)
          },
          onMove: function(/** Event*/ evt, /** Event*/ originalEvent) {
            const pos = `${originalEvent.clientX}-${originalEvent.clientY}`
            if (!originalEvent.clientX) {
              return false
            }
            if (currPosStr === pos) {
              return false
            } else {
              currPosStr = pos
            }
          }
        }
        // 初始化
        Sortable.create(el, ops)
      })
    },
    showJson() {
      this.jsonDrawerVisible = true
    },
    showCss() {
      bus.$emit(EVENTS.SHOW_CODE_DRAWER, {
        type: 'css',
        code: Metadata.meta.css,
        save(code) {
          Metadata.meta.css = code
        }
      })
    },
    preview() {
      this.previewVisible = true
    },
    refreshJson(data) {
      Object.assign(this.meta, data)
      // 元数据刷新后,需要更新UUID生成器的序列值,避免出现uuid重复情况
      Metadata.updateIdStore()
    },
    // 正在拖拽的时候显示 layout之间的空隙与辅助排序的元素
    showLayoutPadding(dom) {
      const uuid = dom.getAttribute('uuid')
      const nodes = document.querySelectorAll('#design_panel div[uuid].layout')
      nodes.forEach((node, i) => {
        const id = node.getAttribute('uuid')
        if (i && id !== uuid && !id.startsWith('form_item')) {
          this.addSpace(node)
        }
      })
    },
    addSpace(node) {
      const preNode = node.previousSibling
      if (!preNode || !preNode.classList.contains('drag-space')) {
        const space = document.createElement('div')
        space.setAttribute('class', 'drag-space')
        node.parentNode.insertBefore(space, node)
        this.spaces.push(space)
      }
    },
    saveModel(data) {
      // 更新逻辑
      if (data.id) {
        Object.assign(this.model, data)
        model.updateModel(this.model)
      } else {
        model.createModel(data)
      }
      this.showModelEditor = false
    },
    showApi() {
      bus.$emit(EVENTS.SHOW_API_SELECTOR)
    },
    // 处理组件选中事件
    designClick(e) {
      const uuid = getComponentId(e.target)
      Metadata.selectComponent(uuid, e)
      // const { uuid, mapping } = getComponentId(e.target, true)
      // const meta = Metadata.getComponentById(uuid)
      // if (mapping) {
      //   const mappingMeta = getValueByPath(meta, mapping)
      //   mappingMeta && Metadata.selectMetadata(mappingMeta, meta, e)
      // } else {
      //   Metadata.selectComponent(uuid)
      // }
    },
    savePage() {
      const params = getUrlParams()
      const id = this.activePage || params.id
      // 组件设计与页面设计 接口是分开的,需独立保存
      if (this.isComponent) {
        Metadata.meta.compSlots = this.getCompSlots(Metadata.meta)
        Metadata.meta.compPerms = this.getPermission(Metadata.meta, true)
        service.saveComponent({
          id,
          json: JSON.stringify(Metadata.meta)
        }).then(() => {
          this.$message({
            message: '保存成功!',
            type: 'success'
          })
        })
      } else {
        Metadata.meta.asyncCompList = this.getAsyncComponents()
        service.save({
          api: Metadata.meta.apis.map(api => {
            return { apiUcode: api.apiUcode, interfaceName: api.name, interfaceUrl: api.url }
          }),
          appVersionId: params.appVersionId,
          pageId: id,
          pages: {
            id,
            layout: {
              type: 'json',
              json: JSON.stringify(Metadata.meta)
            },
            request: JSON.stringify(this.getRequest()),
            permission: this.getPermission(Metadata.meta)
          }
        })
          .then(() => {
            this.$message({
              message: '保存成功!',
              type: 'success'
            })
          })
      }
    },
    publish() {
      const params = getUrlParams()
      const id = this.activePage || params.id
      Metadata.meta.compPerms = this.getPermission(Metadata.meta, true)
      const compileData = compile.compile(this.meta)
      service.publishComponent({
        id,
        releaseJson: JSON.stringify(Metadata.meta),
        html: compileData.html,
        js: compileData.js,
        css: compileData.css
      }).then(() => {
        this.$message({
          message: '发布成功!',
          type: 'success'
        })
      })
    },
    getCompSlots(meta) {
      const slots = []
      Metadata.compEach(meta.children, (meta) => {
        if (meta.name === 'v-slot') {
          slots.push({
            name: meta.props.name
          })
        }
      })
      return slots
    },
    getPermission(meta, isComponentMode) {
      const perms = []
      Metadata.compEach(meta.children, (meta) => {
        // 普通按钮的权限收集
        if (meta.design?.perm) {
          const paths = Metadata.getCompPathById(meta.uuid)
          const inTable = !!paths.find(o => o.name === 'table' || o._name_ === 'grid-column')
          perms.push({
            name: meta.design.permLabel,
            id: isComponentMode ? meta.uuid : meta.design.permId,
            buttonType: inTable ? 'button' : 'field'
          })
        }
        // 自定义模板的权限收集
        if (meta.design?.perms) {
          meta.design.perms.forEach((p) => {
            perms.push({
              name: p.name,
              id: p.code,
              buttonType: 'field'
            })
          })
        }
        // 动态组件的权限收集
        if (meta.design?.permissions) {
          const arr = meta.design.permissions.filter(p => p.join).map((p) => {
            return {
              name: p.label || p.name,
              id: p.permId,
              buttonType: p.buttonType
            }
          })
          perms.push(...arr)
        }
      })
      return perms
    },
    getAsyncComponents() {
      const list = []; const map = {}
      Metadata.compEach(Metadata.meta.children, (meta) => {
        if (meta.name === 'async-component' && !map[meta.code]) {
          list.push({
            code: meta.code,
            label: meta.label
          })
          map[meta.code] = true
        }
      })
      return list
    },
    showPageTree() {
      if (this.isComponent) {
        this.$message('组件模式暂不支持多页操作')
        return
      }
      bus.$emit(EVENTS.SHOW_PAGE_SELECTOR, {
        design: true,
        callback: (page) => {
          PageMng.open(page.id, page => {
            this.meta = page.meta
            this.activePage = page.id
            this.getModelsData();
          }, page.labelName)
        }
      })
    },
    pageChange() {
      PageMng.open(this.activePage, page => {
        this.meta = page.meta
        this.getModelsData();
        if (this.meta.id.indexOf('page') === -1) {
          this.meta.id = 'page-' + uuid(8)
        }
      })
    },
    pageRemove(id) {
      PageMng.close(id)
      if (this.activePage === id) {
        PageMng.open(this.pageList[0].id, page => {
          this.meta = page.meta
          this.getModelsData();
          if (this.meta.id.indexOf('page') === -1) {
            this.meta.id = 'page-' + uuid(8)
          }
        })
      }
    },
    clear() {
      this.$confirm('确定需要清空页面配置内容吗?', '操作确认', { type: 'warning' }).then(bool => {
        if (bool) {
          Metadata.reset()
          this.meta = Metadata.meta
        }
      })
    },
    showContextMenu(e) {
      self.event.returnValue = false
      const uuid = getComponentId2(e.target)
      if (uuid) {
        const meta = metadata.getComponentById(uuid)
        metadata.selectComponent(uuid)
        const comp = context.components[meta.name]
        if (comp && comp.getContextMenu) {
          this.contextMenus = comp.getContextMenu()
          this.menuStyle = {
            top: (e.pageY - 10) + 'pX',
            left: (e.pageX - 10) + 'px'
          }

          return
        }
      }
      this.contextMenus = []
    },
    menuClick(menu) {
      if (context.activeComponent) {
        menu.handle && menu.handle(context.activeComponent)
      }
    },
    hideMenu() {
      this.contextMenus = []
    },

    getRequest() {
      const model = Metadata.meta.models.find(i => i.name === 'params')
      if (model) {
        return model.fields.map(field => {
          return {
            name: field.name,
            label: field.label,
            dataType: field.dataType
          }
        })
      }
      return []
    },

    // 获取模型数据
    getModelsData() {
      let tempid = getUrlParams('tempid');
      if(tempid) {
        let objectModels = JSON.parse(JSON.stringify(Metadata.meta.objectModels));
        let allObjectModels = objectModels.map(model => {
          service.queryTempModelsDetail(model.modelCode).then(res => {
            if(res.data.length > 0) {
              let arr = []
              res.data.map(funcClass => {
                funcClass.functionList.map(item => {
                  item.name = item.functionName;
                  arr.push(item)
                })
              })
              model.functionList = arr;
            } else {
              model.functionList = []
            }
          })
          return model;
        })
        window.tempModels = allObjectModels
      } else {
        window.tempModels = []
      }
    }
  }
}
</script>
<style lang="scss" scope>
.svg-icon {
  width: 18px;
  height: 18px;
}
.sidebar-model {
  i {
    font-size: 18px;
    &:hover {
      color: #fff;
    }
    color: #ccc;
  }
}
#design_panel {
  position: relative;
  overflow-x: hidden;
  overflow-y:hidden;

}
.brand-icon {
  fill: #4a88eb !important;
  height: 24px;
  width: 24px;
  margin-right: 0.15rem;
}
.sidebar {
  min-width: 68px;
  max-width: 68px;
  transition: margin-left 0.35s ease-in-out, left 0.35s ease-in-out,
    margin-right 0.35s ease-in-out, right 0.35s ease-in-out;
  direction: ltr;
  background: #293042;
  .sidebar-brand {
    padding: 1.15rem 1.4rem;
    display: block;
    text-align: center;
    color: #fff;
  }
  .sidebar-nav > .sidebar-item {
    position: relative;
    &:hover {
      background: #9a969e1a;
      .sidebar-link {
        color: rgba(233, 236, 239, 0.8);
      }
      .sidebar-dropdown {
        cursor: move;
        &::before {
          left: -40px;
          content: "";
          position: absolute;
          top: 0px;
          width: 40px;
          height: 100%;
        }
        display: block;
        .svg-icon {
          line-height: 20px;
          vertical-align: middle;
        }
        .comp-text {
          line-height: 20px;
          padding: 2px 0 0 10px;
        }
        .sidebar-link,
        a.sidebar-link {
          &:hover {
            color: #fff;
          }
        }
      }
    }
  }

  .sidebar-nav > .sidebar-item > .sidebar-dropdown {

    display: none;
    overflow: visible;
    position: absolute;
    left: 80px;
    z-index: 1000;
    width: 150px;
    box-shadow: 0 0.5rem 3rem 0.5rem rgb(0 0 0 / 8%);
    border-radius: 0.3rem;
    background: #293042e0;
    padding: 0.5rem 0;
    font-size: 13px;
    top: 0;
    .sidebar-item .sidebar-link {
      color: #b3b3b3;
      padding: 0.45rem 0 0.45rem 1rem;
      cursor: move;
    }
    &.half{
       width: 300px;
      .sidebar-item{
        width:48%;
        float:left
      }
    }
  }
  .sidebar-link {
    display: block;
    padding: 0.6rem 1.5rem;
    font-weight: 400;
    transition: color 75ms ease-in-out;
    position: relative;
    text-decoration: none;
    cursor: pointer;
    color: #eee;
  }
}

.properties {
  width:300px;
  border-left: 1px solid #ddd;
  flex-shrink: 0;
}
.toolbar {
  line-height: 50px;
  box-shadow: rgba(41, 48, 66, 0.1) 0px 0px 2rem 0px;
  border-bottom: 1px solid #f2f2f2;
  background: #fff;
  height: 50px;
  padding-top: 8px;
  box-sizing: border-box;
}
.main {
  padding: 5px;
  background: #fff;
}
.page-title {
  line-height: 35px;
  color: #666;
  font-weight: 600;
  font-size: 15px;
  i {
    padding: 5px;
  }
}
.dragging .sidebar-dropdown {
  visibility: hidden;
}
.brand-icon{
  cursor: pointer;
}
</style>
