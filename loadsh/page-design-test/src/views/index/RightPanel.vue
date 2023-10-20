<template>
  <div class="flex-col flex-grow" style="position: relative;height:0px">
    <div class="flex-col flex-grow" style="overflow:hidden" @mousedown="showChildEditor=false">
      <el-tabs v-model="activeName" class="right-tabs">
        <el-tab-pane name="properties">
          <span slot="label"><i class="p-icon-setting" /> 属性配置</span>
        </el-tab-pane>
        <el-tab-pane name="models">
          <span slot="label"><i class="p-icon-moxing" /> 模型管理</span>
        </el-tab-pane>
      </el-tabs>
      <props-form
        v-if="activeName === 'properties' && compProps && compData"
        :properties="compProps"
        :data="compData"
        :all-props="compProps"
        class="scroll-y flex-grow"
      />
      <page-props v-if="activeName === 'properties' && showPageProps" />
      <model-panel v-if="activeName === 'models'" class="scroll-y" />
    </div>
    <div v-if="showChildEditor" class="child-editor">
      <props-form
        v-if="activeName === 'properties' && childProps && childData"
        :properties="childProps"
        :data="childData"
        class="scroll-y flex-grow"
      />
    </div>
  </div>
</template>

<script>
import PropsForm from '@/components/props/PropsForm'
import ModelPanel from '@/views/index/ModelPanel'
import PageProps from './PageProps'
import context from '@/common/context'
import service from '@/common/service'
import { uuid, setValueByPath, getUrlParams } from '@/utils/util'
import { bus, EVENTS } from '@/common/eventBus'
import metadata from '@/common/metadata'
export default {
  components: { PropsForm, ModelPanel, PageProps },
  data() {
    return {
      activeName: 'properties',
      compProps: null,
      compData: null,
      childProps: null,
      childData: null,
      showPageProps: false,
      showChildEditor: false
    }
  },
  created() {
    // this.getModelsData();
  },
  mounted() {
    bus.$on(EVENTS.COMPONENT_SELECTED, (comp, parent) => {
      const name = comp._name_ || comp.name
      if (name === 'async-component' && comp.code) {
        // 动态组件属性面板初始化
        const designMeta = window.vbusiness?.[comp.code]
        const callback = (data) => {
          this.showPageProps = false
          this.compProps = context.components[name].getProperties(comp, data)
          this.addPropId(this.compProps)
          this.compData = comp
          this.showChildEditor = false
          context.activeMeta = null
          this.activeName = 'properties'
        }
        if (designMeta) {
          callback(designMeta)
        } else {
          service.queryComponentByCode(comp.code).then(({ data }) => {
            const designMeta = JSON.parse(data.releaseJson)
            setValueByPath(window, `vbusiness.${comp.code}`, designMeta)
            callback(designMeta)
          })
        }
      } else {
        if (parent) {
          this.showPageProps = false
          this.compProps = context.components[name].getProperties(comp)
          this.addPropId(this.compProps)
          this.compData = comp
        } else {
          this.showPageProps = true
          this.compData = null
        }
        this.showChildEditor = false
        context.activeMeta = null

        this.activeName = 'properties'
      }
    })
    bus.$on(EVENTS.MEATA_SELECTED, (comp, parent) => {
      this.showChildEditor = false
      const name = comp._name_ || comp.name
      this.showPageProps = false
      this.compProps = context.components[name].getProperties(comp)
      this.addPropId(this.compProps)
      this.compData = comp
      this.activeName = 'properties'
    })
    bus.$on(EVENTS.SHOW_MODEL_PANEL, () => {
      this.activeName = 'models'
    })
    bus.$on(EVENTS.SHOW_CHILD_PROP, (meta, parent) => {
      const name = meta._name_ || meta.name
      this.childProps = context.components[name].getProperties(meta)
      this.addPropId(this.childProps)
      this.childData = meta
      this.showChildEditor = true
    })
  },
  methods: {
    addPropId(props) {
      props.forEach((item) => {
        item._id_ = uuid(12)
        if (Array.isArray(item.properties)) {
          this.addPropId(item.properties)
        }
        if (Array.isArray(item.columns)) {
          this.addPropId(item.columns)
        }
      })
    },
    // 获取模型数据
    getModelsData() {
      let tempid = getUrlParams('tempid');
      if(tempid) {
        let objectModels = metadata.meta.objectModels;
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
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.scroll-y {
  overflow-y: auto;
  overflow-x: hidden;
}
.child-editor{
    position: absolute;
    right: 300px;
    width: 300px;
    max-height:300px;
    max-height:calc(100% - 70px);
    overflow-y:auto;
    top: 50px;
    height: auto;
    background: #fff;
    border: 1px solid #f2f2f2;
    z-index: 1000;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);

}
</style>
<style lang="scss">
.right-tabs {
  .el-tabs__item {
    width: 49% !important;
    text-align: center;
    color: #fff;
  }
  .el-tabs__nav {
    width: 100%;
    line-height: 50px;
    height: 50px;
    background: #293042ab;
  }
  .el-tabs__header {
    position: relative;
    margin: 0 0 1px;
  }
}
</style>
