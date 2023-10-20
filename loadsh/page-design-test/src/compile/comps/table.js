import { uuid } from '../common/util'
import i18n from '@/render/src/utils/i18n'
export default function pretreatment(meta, ctx, type) {
  if (meta.columns) {
    let vTableMeta = ''
    if (type !== 'runtime') {
      vTableMeta = window.getMetaManager().getComponentById(meta.pid)
    } else {
      vTableMeta = ctx.path[ctx.path.length - 1]
    }
    const cols = []
    if (meta.design.showSelection) {
      let col
      cols.push(col = { name: 'el-table-column', props: { type: 'selection', width: 45, fixed: 'left', align: 'center' }})
      if (meta.design.selectable) {
        col.props[':selectable'] = meta.design.selectable
      }
    }
    if (meta.design.showIndex) {
      cols.push({ name: 'el-table-column', props: { type: 'index', width: 50, fixed: 'left', label: '序号' }})
    }

    const columns = convertTableColumns(meta.columns, vTableMeta.design['multi-level-header'], ctx)
    // 当开启动态列视图时候,并且在编译成运行时代码时候,需要通过 vfor 渲染列,  设计时或非动态视图,直接渲染成静态列代码
    if (type === 'runtime' && vTableMeta.props.dynamicCol) {
      vTableMeta.props[':columns.sync'] = `${vTableMeta.uuid}_columns`
      columns.forEach(col => {
        const vif = `col.prop === "${col.props.prop}" && col.show`
        col.props['v-if'] = col.props['v-if'] ? '(' + col.props['v-if'] + ') && ' + vif : vif
      })
      const dataColumns = meta.columns.map(col => {
        return {
          label: col.label,
          prop: col.prop,
          show: col.show
        }
      })
      ctx.vue$data.push(`${vTableMeta.uuid}_columns:${JSON.stringify(dataColumns)}`)
      meta.children = [...cols, {
        name: 'template',
        props: {
          'v-for': `col in ${vTableMeta.uuid}_columns`
        },
        design: {},
        children: columns
      }]
    } else {
      meta.children = [...cols, ...columns]
    }
  }
}

/**
 * 将table中的columns 列配置,转换为vue组件标准渲染render函数的children
 * 支持多层表头 children 递归
 * @param {Array} columns 列配置数组
 * @param {boolean} isMultiLevel 多级表头
 */
function convertTableColumns(columns, isMultiLevel, ctx) {
  const arr = []
  columns.forEach(col => {
    if (!col.show) return
    if (col.children && col.children.length && isMultiLevel) {
      // 判断是否是多级表头模式,如果是则执行
      arr.push({
        name: 'table-column',
        props: {
          [ctx.isRuntime ? ':label' : 'label']: ctx.isRuntime ? `$t("${col.label}")` : i18n.t(col.label)
        },
        children: convertTableColumns(col.children, null, ctx)
      })
      // 如果没有开启多级表头,是否应该将子字段也添加到列中显示
    } else {
      arr.push({
        uuid: uuid(8),
        name: 'table-column',
        props: {
          prop: col.prop,
          [ctx.isRuntime ? ':label' : 'label']: ctx.isRuntime ? `$t("${col.label}")` : i18n.t(col.label),
          width: col.width,
          align: col.align,
          'header-align': col['header-align'],
          sortable: col.sortable,
          resizable: col.resizable,
          ':formatter': col.formatter,
          ':render-header': col['render-header'],
          ':selectable': col.selectable,
          'show-overflow-tooltip': col['show-overflow-tooltip'],
          'class-name': col['class-name'],
          'v-if': col.vif,
          fixed: col.fixed ? col.fixed : false,
          type: col.type
        },
        slots: col.slots
      })
    }
  })
  return arr
}
