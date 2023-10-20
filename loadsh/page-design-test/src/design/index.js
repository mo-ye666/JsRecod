import { camelCase } from '@/utils/util'

/**
 * require.context 第一个参数不能是变量，否则webpack解析定位不到资源文件，会报错
 * @type {({modulesName: string, file: *}|{modulesName: string, file: *})[]}
 */
const resourceMapping = [{
  file: require.context('@/design', true, /index.js$/),
  modulesName: 'designComponent',
  patten: jsPatten
}]
/**
 * 导入组件文件
 * @type {*[]}
 */
resourceMapping.map(ele => { return importResource(ele) })

/**
 * 导入资源文件
 * @param file
 * @returns {*}
 */
function importResource(ele) {
  const modulesFiles = ele.file
  const modules = modulesFiles.keys().reduce((modules, modulePath) => {
    const moduleName = ele.patten(modulePath)
    // const functionName = value.default.toString().match(/function\s*([^(]*)\(/)[1]
    const value = modulesFiles(modulePath)
    if (value.default) {
      modules[moduleName] = value.default
    }
    return modules
  }, {})
  return modules
}
/**
 * js 目录文件名规则
 * @param modulePath
 * @returns {*}
 */
function jsPatten(modulePath) {
  return camelCase(modulePath.replace(/^.\/(.*)\.js/, '$1'))
}
