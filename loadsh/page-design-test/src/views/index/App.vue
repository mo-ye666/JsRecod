<template>
  <Designer class="designer" />
</template>

<script>
import Designer from './Designer'
import '@/styles/app.scss'
import service from '@/common/service'
export default {
  components: {
    Designer
  },
  mounted() {
    // 取消开始的loading动画
    const preLoader = document.querySelector('#pre-loader')
    preLoader.style.display = 'none'

    // fix: firefox 下 拖拽 会新打卡一个选项卡
    // https://github.com/JakHuang/form-generator/issues/15
    document.body.ondrop = event => {
      event.preventDefault()
      event.stopPropagation()
    }
    this.loadStyle()
  },
  methods: {
    async loadStyle() {
      const link = document.createElement('link')
      link.type = 'text/css'
      link.rel = 'stylesheet'

      link.href = await this.getCss()
      const head = document.getElementsByTagName('head')[0]
      head.appendChild(link)
      this.$forceUpdate()
    },
    async getCss() {
      return service.getCssPath()
    }
  }
}
</script>
<style lang="scss" scoped>
.designer{
  width:100%;
  height:100vh;
}
</style>
