import IconSelect from '@/components/iconSelect'
import I18nSelect from '@/components/i18nSelect'
import ModelSelect from '@/components/modelSelect'
import FieldSelect from '@/components/fieldSelect'
import ActionSelect from '@/components/actionSelect'
import UploadFile from '@/components/upload-file'
import UploadFileNew from '@/components/upload-file-new'
import VChart from '@/components/chart/'
import PUploadImg from '@/components/upload-img'
import PTinymce from '@/components/tinymce'
import Validator from '@/components/validator/'
import vTable from '@/components/vTable/'
import ExpressionSetting from "@/components/expressionSetting"

export default {
  install: (vue) => {
    vue.component(vTable.name, vTable)
    vue.component(IconSelect.name, IconSelect)
    vue.component(I18nSelect.name, I18nSelect)
    vue.component(ExpressionSetting.name, ExpressionSetting)
    vue.component(ModelSelect.name, ModelSelect)
    vue.component(FieldSelect.name, FieldSelect)
    vue.component(ActionSelect.name, ActionSelect)
    vue.component('v-chart', VChart)
    vue.component(Validator.name, Validator)
    vue.component(PUploadImg.name, PUploadImg)
    vue.component(UploadFileNew.name, UploadFileNew)
    vue.component(UploadFile.name, UploadFile)
    vue.component(PTinymce.name, PTinymce)
    vue.component('v-text', {
      name: 'VText',
      template: '<div> <slot/> </div>'
    })
    vue.component('v-icon', {
      name: 'VIcon',
      template: '<i> <slot/> </i>'
    })
    vue.component('layout', {
      name: 'layout',
      template: '<div class="layout"> <slot/> </div>'
    })
    vue.component('v-slot', {
      props: { name: String },
      name: 'v-slot',
      template: '<div class="layout"> 插槽:{{name}} </div>'
    })
    vue.component('async-component', {
      name: 'async-component',
      template: '<div class="layout"> <slot/> </div>'
    })
    vue.component('p-micro-app', {
      name: 'p-micro-app',
      template: '<div class="layout"> <slot/> </div>'
    })
  }
}
