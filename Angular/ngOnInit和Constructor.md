####  有关JS和TS语言的区别

在一个类中，ngOnInit只是一个在构造上与其他方法不一样的方法。Angular团队只是这样命名它，但它也可以有其他任何名字：
	在一个组件类中引不引用这个方法完全取决于你。编辑过程中Angular编译器会检查组件是否引入了这个方法，然后用合适的标记去标记这个类
	在变更检查过程中，在组件实例内，这个标记会被用来决定是否调用ngOnInit方法

相反，constructor是个不同的东西。在一个TypeScript类实例化过程中，无论写不写constructor，它都会被调用。这就是为什么一个Typescript类的constructor会被译一个JavaScript constructor function

#### 有关组件初始化进程的区别

从组件初始化阶段的角度看，两个存在巨大差别。Angular boostrap process包含两个主要阶段：
	* 构造组件树
	* 运行变更检查

而且，组件的constructor会在Angular构造组件树的时候被调用。所有生命周期钩子包括ngOnInit会被作为接下来的变更检测阶段的一部分被调用。通常，组件初始化逻辑需要一些依赖注入提供商，或者可用的输入绑定，或者已渲染的DOM，在Angular引导进程的不同阶段，这些都是可用的。

Angular构造组件树的时候，根模块注入器就已经配置好，所以你可以注入任何全局依赖。而且，当Angular实例化一个子组件类的时候，父组件的注入器也已经配置好，所以你可以注入父组件中定义的提供商，包括父组件自身。组件的constructor是在注入器的上下文中被调用的唯一方法，所以如果你需要任何依赖，constructor是唯一获得这些依赖的方法。@Input的通信机制是作为接下来的变更检测阶段的一部分处理的，所以输入绑定在constructor中不可用。

Angular开始变更检测的时候组件树已经构造完毕，在组件树中的所有组件的constructor都会被调用。而且这时候所有组件的模板节点也已经添加到DOM中，这时，初始化组件的所有数据都已齐全—依赖注入提供商、DOM和输入绑定。

```js
	<my-app>
	<child-comp [i] = 'prop'>
```
Angular开始引导应用程序。如上所述，它首先创建每个组件的类，因此调用MyAppComponent的constructor。当执行组件的constructor时，Angular resolves所有注入到MyAppComponent constructor的依赖，并把他们作为参数提供出来。并且它会创建一个作为my-app宿主元素的DOM节点，然后它继续创建child-comp的宿主元素，并且调用childComponent的constructor。在这个阶段，Angular不关心i输入绑定和任何生命周期钩子。所以当这个过程完成的时候Angular就创建出了如下组件视图树：
直到那是Angular才会运行变更检测、更新my-app的绑定、调用MyAppComponent实例的ngOnInit。然后它继续更新child-comp的绑定和调用childComponent类的ngOnInit。

#### 用法上的区别

#### Constructor

在Angular中，一个类的constructor主要用来注入依赖。Angular调用constructor injection pattern在这里已经解释得很详细，更深入的见解你可以读misko hever的文章

然后，constructor的使用不仅限于依赖注入。举个例子，@angular/router模块的router-outlet指令在路由生态系统内用constructor来注册自己和自己的位置。
惯例就是，在construcor中，逻辑应尽可能少。

####  NgOnInit
当angular调用ngOnInIt的时候，它已经通过constructor完成创建组件DOM、注入所有必要依赖，也已经完成输入绑定。这时所有必需信息已经齐全，这些信息是的ngOnInit成为执行初始化逻辑的好地方。


