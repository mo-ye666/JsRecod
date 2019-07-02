## 模块NgModule简介

Angular应用是模块化，它拥有自己的模块化系统，称为NgModule。一个NgMuodule就是一个容器，用于存放一些内聚的代码块，这些代码块专注于某个应用域、某个工作流或一组紧密相关的功能。它可以包含一些组件、服务提供商或其它代码文件，其作用域由包含它们的NgModule定义。它还可以导入一些由其它模块中导出的功能，并导出一些指定的功能提供其它NgModule使用。

每个Angular应用都至少有一个NgModule类，也就是根模块，它习惯上命名为APPModule，并位于一个名叫app.module.ts的文件中。引导这个根模块就可以启动你的应用。

虽然小型的应用可能只有一个NgModule，不过大多数应用都会有很多特效模块。应用的跟模块之所以叫根模块，是因为它可以包含任何深度的层次化子模块。

##### @NgModule元数据

NgModule是一个带有@NgModule()装饰器的类。@NgMdoule()装饰器是一个函数，它接受一个元数据对象，该对象的属性用来描述这个模块。其中最重要的属性如下。

* declaration（可声明对象表） ——那些属于本NgModule的组件、指令、管道。
* exports（导出表） ——那些能在其它模块的组件模板中使用的可声明对象的子集。
* imports（导入表） ——那些导出了本模块中的组件模板所需的类的其它模板。
* providers —— 本模板向全局服务器贡献的那些服务的创建器。这些服务能被本应用中的任务部分使用。
* bootstrap—— 应用的主视图，称为根组件。它是应用中所有其它视图的宿主。主要根模块才应该设置这个bootstrap属性。

下面是一个简单的根NgModule定义：
```ts
	import {NgModule} from '@angular/cors';
	import {BrowserModule} from '@agnular/platform-browser';
	@NgModule({
		imports:     [BrowserModule],
		providers:   [Logger],
		declaratons: [Appcomponetn],
		exports:     [AppComponent],
		bootstrap:   [AppComponent]
	})
	export class AppModule
```

####  NgModule和组件

NgModule为其中的组件提供了一个编译上下文环境，根模块总会有一个根组件。并在引导期间创建它。但是，任何模块都能包含任意数量的其他组件，这些组件可以通过路由器加载，也可以通过模块创建。那些属于这个NgModule的组件会共享同一个编译上下文环境。

组件及其模块共同定义视图。组件还可以包含视图层次结构，它能让你定义任何复杂的屏幕区域，可以将其作为一个整体进行创建、修改和摧毁。一个视图层次结构中可以混合使用由不同NgModule中的组件定义的视图。这种情况很常见，特别是对一些UI库来说。

当你创建一个组件时，它直接与一个叫做宿主视图的视图关联起来。宿主视图可以是视图层次结构的根，该视图层次结构可以包含一些内嵌视图，这些内嵌视图又是其它组件的宿主视图。这些组件可以位于相同的NgModule中，也可以从其它NgModule中导入。树中的视图可以嵌套到任意深度。

#### NgModule和JavaScript的模块

ngModule系统与javascript（ES2015）用来管理JavaScript对象的模块系统不同，而且也没有直接关联。这两种模块系统不同但互补。你可以使用它们来共同编写你的应用。

JavaScript中，每个文件是一个模块，文件中定义的所有对象都从属于那个模块。通过export关键字，模块可以把它的某些对象声明为公共的。其它JavaScript模块可以使用import语句来访问这些公共对象。

#### Anuglar自带的库
Angular会作为一组JavaScript模块进行加载，你可以把它们看成库模块。每个Angular库的名称都带有@angular前缀。使用nom包管理安装Angular的库，并使用JavaScript的import语句导入其中的各个部分。









