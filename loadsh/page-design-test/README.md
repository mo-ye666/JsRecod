## 低代码编辑平台
组件事件绑定规范，在on对象里面定义以下数据格式

    on: {
      click: {
        type:'', // 1页面2弹窗3页面事件4框架提供事件
        label:'', // 接口描述
        url:'', // 页面地址或接口地址
        func:'', // 事件的方法名
        request: [{
          key:'',// 字段名
          des:'',// 描述
          params:'',// 参数来源字段名
          type:'',// 参数来源， default：框架默认参数，page：页面参数
        }], // 请求参数
      }
    }

## 运行
- 确保已经安装node.js 10+
- 首次下载项目后，安装项目依赖：
```
yarn
```
或
```
npm install
```
- 本地开发
```
npm run dev
```
- 构建
```
npm run build
```


数据字段/格式统一：
1、国际化编码 i18n 
2、绑定page pageOptions
3、绑定数据源 dataSource
4、api分析 apiSource

权限
type: "button",
id: "",
name: ""

api分析
componentId: "",
componentName: "",
interfaceName: "",
apiId: "",
apiUcode: "",


https://dexie.org/
https://pouchdb.com/
https://github.com/jakearchibald/idb-keyval

