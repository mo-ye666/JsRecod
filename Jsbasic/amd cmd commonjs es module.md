## commonjs和es module的区别

#### CommonJs
	1.对于基本数据类型，属于复制。既会被模块缓存。同时，在另一个模块可以对该模块输出的变量重新赋值
	2.对于复杂数据类型，属于浅拷贝。由于两个模块引用的对象指向同一个内存空间，因此对该模块的值修改时会影响另一个模块。
	3.当使用require命令加载某个模块时，就会运行整个模块的代码。
	4.当使用require命令加载同一个模块时，不会在执行该模块，而是取到缓存之中的值。也就是说，commonjs模块无论加载多少次，都只会在第一次加载时运行一次，以后再加载，就返回第一次运行的结果，除非手动清除系统缓存。
	5.循环加载时，属于加载时执行。即脚本代码在require的时候，就会全部执行。一旦出现某个模块被‘循环加载’，就只输出已经执行部分，还未执行的部分不会输出。

#### es6模块
	1.ES6模块中的值属于【动态只读引用】。
	2.对于只读来说，既不允许修改引入变量的值，import的变量是只读的，不论是基本数据类型还是复杂数据类型。当模板遇到import命令时，就会生成一个只读引用。等到脚本真正值得时，在根据这个只读引用，到被加载的那个模块里面去取值。
	3.对于动态来说，原始值发生变化，import加载的值会发生变化。不论是基本数据类型还是复杂数据类型。
	4.循环加载时，es6模块时动态引用。只要两个模块之间存在某个引用，代码能够执行。

#### CommonJs
	1.对于基本数据类型，属于复制。即会被模块缓存。同时，在另一个模块可以对该模块输出的变量重新赋值。
```javascript
	//b.js
	let count = 1;
	let plusCount = () => {
		count++;
	}
	setTimeout(() => {
		console.log('b.js-1',count);
	})
	module.exports = {
		count,plusCount;
	}
	
	//a.js
	let mod = require('./b.js');
	console.log('a.js-1',mod.count);
	mod.plusCount();
	console.log('a.js-2',mod.count);
	setTimeout(() => {
		mod.count = 3;
		console.log('a.js-3',mod.count)
	},2000)
	
node a.js
a.js-1 1
a.js-2 1
b.js-1 2 //1秒后
a.js-3 3 //2秒后
```
以上代码可以看出，b模块export的count变量，是一个复制行为。在plusCount方法调用之后，a模板中的count不受影响。同时，可以在b模块中更改a模块中的值。如果希望能够同步代码，可以export出去一个getter。