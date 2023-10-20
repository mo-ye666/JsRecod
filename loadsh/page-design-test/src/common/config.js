/**
 * 设计器 组件列表配置
 */
const comps = [
  {
    name: '布局组件',
    icon: 'layouts',
    children: [
      {
        name: 'layout',
        label: '分栏'
      },
      {
        name: 'form',
        label: '表单容器'
      },
      {
        name: 'panel',
        label: '卡片面板'
      },
      {
        name: 'tabs',
        label: '标签页'
      },
      {
        icon: 'input',
        name: 'v-slot',
        label: '组件插槽'
      },
      {
        name: 'divider',
        label: '分割线'
      }
    ]
  },
  {
    name: '基础组件', icon: 'base', class: 'half', children: [
      {
        name: 'button',
        label: '按钮'
      },
      {
        name: 'text',
        label: '文本'
      },

      {
        name: 'input',
        label: '输入框'
      },
      {
        name: 'select',
        label: '下拉选择器'
      },
      {
        name: 'radio',
        label: '单选'
      },
      {
        name: 'radio-group',
        icon: 'radio',
        label: '单选框组'
      },
      {
        name: 'checkbox',
        label: '多选框'
      },
      {
        name: 'checkbox-group',
        icon: 'checkbox',
        label: '多选框组'
      },
      {
        name: 'dropdown',
        label: '下拉菜单'
      },
      {
        name: 'switch',
        label: '开关'
      },
      {
        icon: 'time',
        name: 'time-picker',
        label: '时间选择器'
      },
      {
        icon: 'date',
        name: 'date-picker',
        label: '日期选择器'
      }, {
        name: 'cascader',
        label: '级联选择器'
      },
      {
        icon: 'number',
        name: 'inputNumber',
        label: '数字输入框'
      },
      {
        name: 'icon',
        label: '图标'
      },
      {
        name: 'image',
        label: '图片'
      }, {
        icon: 'color',
        name: 'color-picker',
        label: '颜色选择'
      },
      {
        name: 'upload-img',
        label: '图片上传'
      }, {
        name: 'upload-file',
        icon: 'upload',
        label: '文件上传'
      }
    ]
  }, {
    name: '高级组件',
    icon: 'component',
    children: [
      {
        name: 'v-table',
        icon: 'table',
        label: '简单表格'
      },
      {
        name: 'grid',
        icon: 'table',
        label: '动态表格'
      },
      {
        name: 'tree',
        label: '树形控件'
      },
      {
        name: 'steps',
        label: '步骤条'
      },
      {
        name: 'timeline',
        label: '时间线'
      }, {
        name: 'tinymce',
        icon: 'editors',
        label: '富文本编辑器'
      },
      {
        name: 'transfer',
        icon: 'transfer',
        label: '穿梭框'
      },
      {
        name: 'v-template',
        icon: 'custom',
        label: '自定义代码块'
      },
      {
        name: 'p-micro-app',
        icon: 'component',
        label: '微组件 beta',
      }
    ]
  }, {
    name: '图表组件',
    icon: 'charts',
    children: [
      {
        name: 'pie',
        label: '饼图'
      },
      {
        name: 'bar',
        label: '柱状图'
      },
      {
        name: 'line',
        label: '曲线图'
      },
      // {
      //   name: 'complex',
      //   label: '混合图'
      // }
    ]
  }, {
    name: '业务组件',
    icon: 'yewu',
    children: [

    ]
  }
]
/** 编辑器格式配置对象 */
const beautifierConf = {
  html: {
    indent_size: '2',
    indent_char: ' ',
    max_preserve_newlines: '-1',
    preserve_newlines: false,
    keep_array_indentation: false,
    break_chained_methods: false,
    indent_scripts: 'separate',
    brace_style: 'end-expand',
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: false,
    end_with_newline: true,
    wrap_line_length: '110',
    indent_inner_html: true,
    comma_first: false,
    e4x: true,
    indent_empty_lines: true
  },
  js: {
    indent_size: '2',
    indent_char: ' ',
    max_preserve_newlines: '-1',
    preserve_newlines: false,
    keep_array_indentation: false,
    break_chained_methods: false,
    indent_scripts: 'normal',
    brace_style: 'end-expand',
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: true,
    end_with_newline: true,
    wrap_line_length: '110',
    indent_inner_html: true,
    comma_first: false,
    e4x: true,
    indent_empty_lines: true
  }
}

export {
  comps, beautifierConf
}
