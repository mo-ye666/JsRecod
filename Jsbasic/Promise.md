#### promise的状态

* pending（等待态）
* fulfilled（完成态）
* rejected（拒接态）

#### 终值与拒因

* 终值：指的是promise被解决时传递给解决回调的值。
* 拒因：拒接原因，指在promise被拒接时传递给异常回调的拒接原因

#### 状态与状态关系，状态与终值和拒因的关系

* pending可以迁移至fulfilled或rejected
* fulfilled不能迁移至其他状态，必须拥有一个不可变的终值
* rejected不能迁移至其他状态，必须有一个不可变的拒因

## Promise的使用
#### 构造函数

Promise是一个构造函数，使用new操作符返回一个promise对象
构造函数接受一个excutor函数作为参数
excutor函数有两个函数类型的参数resolve和reject

```js
	let p = new Promise((resolve,reject) => {

	})
```
* 构造函数在调用时，excutor函数会作为同步代码立即执行
* 我们通常在excutor函数中执行我们的异步操作
* 未调用resolve、reject函数时，promise对象的状态为pending

```js
	let p1 = new Promise((resolve,reject)=> {
		setTimeout(() => {
			console.log('p1');
		},1000)
	})
	//p1状态一直为pengding
```
* 当调用resolve函数，resolve的参数为非promise对象、非thenable对象

	resolve函数的参数，作为promise对象的终值
	promise对象的状态变为fulfilled

## promise对象上的方法

#### then 方法：

promise提供一个then方法，用于访问其终值和拒因。

promise的then方法接受两个参数：

```js
	promise.then(onFulfilled,onRejected);
```
* onFulfilled函数用于当promise状态为fulfilled时候，接受终值
* onRejected函数用于当promrise状态为rejected时，接受拒因

```js
	new Promise((resolve,reject) => {
		setTimeout(() => {
			resolve('异步获取数据')
		},50)
	}).then((data) => {
		
	})
```

#### onfulfilled和onRejected参数可选

* 如果onFulfilled不是函数，其必须被忽略
* 如果onRejected不是函数，其必然被忽略

#### onFulfilled特效

如果onFulfilled函数：

* 当promise执行结束后其必然被调用，其第一个参数为promise的终值
* 在promise执行结束前期不可被调用
* 其调用次数不可超过一次

#### onRejected特性

如果onRejected是函数：

* 当promise被拒接执行后其必须被调用，其第一个参数为promise的据因
* 在promise被拒接执行前其不可被调用
* 其调用次数不可超过一次

#### then方法的多次调用

* then方法可以被同一个promise对象多次调用
* then方法会返回一个新的promise对象
* 当promise成功执行时，所有onFulfilled需按照注册顺序依次回调
* 当promise被拒接执行时，所有的onRejected需按照其注册顺序依次回调

#### class实现
```js
class myPromise {
	constructor(executor) {
		this.state = 'padding';
		this.value = undefined;
		this.error = undefined;
		this.resolveCallbacks = [];
		this.rejectCallbacks = [];
		const resolve = (value) => {
			if(this.state === 'padding') {
				this.state = 'fulfilled';
				this.value = value;
				this.resolveCallbacks.forEach(callback => callback(this.value))
			}
		}
		const reject = (error) => {
			if(this.state === 'padding') {
				this.state = 'rejected';
				this.error = error;
				this.rejectCallbacks.forEach(callback => callback(this.error))
			}
		}
		try {
			executor(resolve,reject)
		} catch(error) {
			reject(error)
		}
	}
	then(onrResolve,onReject){
		return new myPromise((resolve,reject) => {
			const resolveHandle = (value) => {
				try {
					const result = onResolve(value);
					if(result instanceof myPromise){
						result.then(resolve,reject);
					} else {
						resolve(result);
					}
				} catch(error) {
					reject(error)
				}
			}
			const rejectHandle = (error) => {
				try {
					const result = onReject(error);
					if(result instanceof myPromise) {
						result.then(resolve,reject);
					} else {
						resolve(result)
					}
				} catch(error) {
					reject(error)
				}
			}
			if(this.state === 'fulfilled') {
				resolveHandle(this.value);
			} else if(this.state === 'rejected') {
				rejectHandle(this.error);
			} else {
				this.resolveCallbacks.push(resolveHandle);
				this.rejectCallbacks.push(rejectHandle);
			}
		})
	}
	catch(onReject){
		this.then(undefined,onReject)
	}

	static reslove(value) {
		return new MyPromise((resolve) => {
			resolve(value)
		})
	}
	static reject(error) {
		return new Mypromise((resolve,reject) => {
			reject(error)
		})
	}
}
<!-- 
#### 实现简易Promise满足A+规范
```js
const EMUN = {
	PENDING = 'pending',
	FULFILLED = 'fulfilled',
	REJECTED = 'rejected'
}

function MyPromise(executor) {
	this.state = 'pending';
	this.value = undefined;
	this.reason = undefined;
	this.onFulfilledCallbacks = [];
	this.onRejectedCallbacks = [];
	const reslove = (value) => {
		if(this.state === 'pending') {
			this.state = 'fulfilled';
			this.value = value;
			this.onFulfilledCallbacks.push(callback => callback(this.value));
		}
	}
	const reject = (reason) => {
		if(this.state === "pedding") {
			this.state = 'rejected';
			this.reason = reason;
			this.onRejectedCallbacks.push(callback => callback(this.reason));
		}
	}
	try {
		executor(resolve,reject)
	} catch(e) {
		reject(e);
	}
}
MyPromise.prototype.then = function(onFulfilled,onRejected) {
	onFulfilled = typeof onFulfilled === "function" ? onFulfilled : value => value;
	onRejected = typeof onRejected === "function" ? onRejected : reason => {
		throw reason;
	}
}

MyPromise.prototype.catch = function(onRejected) {
	return this.then(null,onRejected)
}

MyPromise.prototype.finally = function(onFinally) {
	return this.then(
		value => {
			onFinally();
			return value;
		},
		reason => {
			onFinally();
			return reason;
		}
	)
} 
```-->