## 原文地址

[你真的掌握变量和类型了吗](https://juejin.im/post/5cec1bcff265da1b8f1aa08f)

## 一、JavaScript 数据类型

###### 原始类型

- Null：只包含一个值：null
- Undefined：只包含一个值：undefined
- Boolean：包含两个值：true 和 false
- Number：整数或浮点数，还有一些特殊值（-Infinity、+Infinity、NaN）
- String：一串表示文本值的字符序列
- Symbol：一种实例是唯一且不可改变的数据类型

###### 对象类型

- Object：自己分一类丝毫不过分，除了常用的 Object，Array、Function 等都属于特殊的对象。

## 二、为什么区分原始类型和对象类型

#### 2.1 不可变性

原始类型在 ECMAScript 标准中，它们被定义为 primitive values，即原始值，代表值的本身是不可变的。

以字符串为例，我们在调用操作字符串的方法时，没有任何方式是可以直接改变字符串的：

```js
	var str = 'ConardLi';
	str.slice(1);
	str.substr(1);
	str.trim(1);
	str.toLowerCase(1);
	str[0] = 1;
	console.log(str） // ConardLi
```

在上面代码中我们对 str 调用了几个方法，无一例外，这些方法都在原字符串的基础上产生了一个新字符串，而非直接去改变 str，这就印证了字符串的不可变性。

那么，当我们调用下面代码：

```js
str += "6";
console.log(str); //ConardLi6
```

会发现 str 的值发生了改变
在 JavaScript 中，每一个变量在内存中都需要一个空间来存储。

内存空间又被分为两种，栈内存和堆内存。

栈内存：

- 储存的值大小固定
- 空间较小
- 可以直接操作其保存的变量，运行效率高
- 由系统自动分配存储空间

JavaScript 中的原始类型的值被直接存储在栈内，在变量定义时，栈就为其分配好了内存空间

由于栈中的内存空间的大小是固定的，那么注定了存储在栈中的变量就是不可变的。

在上面代码中，我们执行了 str += ‘6’的操作，实际上是在栈中又开辟了一块内存空间用于存储‘ConardLi6’，然后将变量 str 指向这块空间，所以这并不违背不可变性的特点。

#### 2.2 引用类型

堆内存：

- 存储的值大小不定，可动态调整
- 空间较大，运行效率低
- 无法直接操作内部储存，使用引用地址读取
- 通过代码进行分配空间

相对于不可变的原始类型，我们习惯把对象称为引用类型，引用类型的值实际存储在堆内存中，它在栈中只存储了一个固定长度的地址，这个地址指向堆内存中的值。

## 三、分不清的 null 和 undefined

在原始类型中，有两个类型 Null 和 Undefined，他们都有且仅有一个值，null 和 Undefined，并且他们都代表无和空，我一般这样区分它们：

###### null

表示被赋值过的对象，刻意把一个对象赋值为 null，故意表示其为空，不应有值。

所以对象的某个属性值为 null 是正常的，null 转换为数值时值为 0。

###### Undefined

表示“缺少值”，即此处应有一个值，但还没有定义，

如果一个对象的某个属性值为 undefined，这是不正常的，如 obj.name = undefined，我们不应该这样写，应该直接 delete obj.name。

undefined 转为数值时为 NaN（非数字值的特殊值）

JavaScript 是一门动态类型语言，成员除了表示存在的空值外，还有可能根本就不存在（因为存不存在只在运行期才知道），这就是 undefined 的意义所在。对于 java 这种强类型语言，如果有“undefined”这种情况，就是直接编译失败，所以在它不需要一个这样的类型。

## 四、不太熟的 Symbo 类型

#### 4.1Symbol 的特性

###### 1.独一无二

直接使用 Symbol（）创建新的 symbol 变量，可选用一个字符串用于描述。当参数为对象时，将调用对象的 toString（）方法。

```js
var sym1 = Symbol();
var sym2 = Symbol("ConardLi");
var sym3 = Symbol("ConardLi");
var sym4 = Symbol({ name: "ConardLi" });
console.log(sym2 === sym3); //false
```

我们用两个相同的字符串创建两个 Symbol 变量，它们是不相等的，可见 1 每个 Symbol 变量都是独一无二的。

如果我们想创建两个相等的 Symbol 变量，可以使用 Symbol.for(key)。

```js
var sym1 = Symbol.for("ConardLi");
var sym2 = Symbol.for("ConardLi");
console.log(sym1 === sym2); //true
```

#### 2.原始类型

Symbol 是使用 Symbol（）函数创建的变量，并非构造类型，使用 new 操作符会直接报错。

#### 3.不可枚举

当使用 Symbol 作为对象属性时，可以保证对象不会出现重名属性，调用 for..in 不能将其枚举出来，另外调用 Object.getOwnPropertyNames、Object.keys()也不能获取 Symbol 熟悉

#### 4.2 Symbol 的应用场景

###### 应用一：防止 XSS

在 React 的 ReactElement 对象中，有一个$$typeof 属性，它是一个 Symbol 类型变量：

·```js
var REACT_eLEMENT_TYPE =
(typeof Symbol === ''function' && Symbol.for && Symbol.for('react.element')) || )xeac7;

ReactElement.isValidElement 函数用来判断一个 React 组件是否有效的，下面是它的具体实现。

