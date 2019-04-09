* ###### Observable(可观察对象) 
  表示一个概念，这个概念是一个可调用的未来值或事件的集合。

* ###### Observer(观察者)
  一个回调函数的集合，它知道如何去监听由Observable提供的值。

* ###### Subscription(订阅)
  表示Observable的执行，它主要用于取消Observable的执行。

* ###### Operator（操作符）
  采用函数式编程风格的纯函数，使用像map、filter、concat、flatMap、等这样的操作符来处理集合。

* ###### Subject（主体）
  相当于EventEmitter，并且是将值或事件多路由推送给多个Observer的唯一方式。

* ###### Schdulers（调度器）
  用来控制并发并且是中央集权的调度员，允许我们在发生计算时进行协调，例如setTimeout或requestAnimationFrame或其他

#### 纯净性（Purity）

scan操作符的工作原理与数组的reduce类似。它需要一个暴露给回调函数当参数的初始值。每次回调函数运行后的返回值会作为下次回调函数运行时的参数。

#### 流动性（Flow）

RxJS提供了一整套操作符来帮助你控制事件如何流经observable。
下面代码展示的是如何控制一秒钟内最多点击一次，先来看使用普通的JavaScript：
```js
	var count = 0;
	var rate = 1000;
	var lastclick = Date.now() - rate;
	button.addEventListener('click',() => {
		if(Date.now() - lastclick >= rate) {
			console.log(`Clicked ${++count} times`);
			lastclick = Date.now();
		}
	})
```

使用Rxjs：

```js
	var button = document.querySelector('button');
	Rx.Observable.fromEvent(button,'click')
		.throttleTime(1000)
		.scan(count => count + 1,0)
		.subscribe(count => console.log(`Clicked ${count} times`))
```			

#### 值（Values）
如何累加每次点击的鼠标x坐标，普通的JavaScript:
```js
	var count = 0;
	var rate =1000;
	var lastClick = Date.now() - rate;
	var button = document.querySelector('button');
	button.addEventListener('click',(event) => {
		if(Date.now() - lastClick >= rate) {
			count += event.clientX;
			console.log(count);
			lastClick = Date.now();
		}
	});
```
使用Rxjs：
```js
	var button = document.querySelector('button');
	Rx.Observable.fromEvent（button,'click'）
		.throttleTime（1000）
		.map(event => event.clienX)
		.scan((count,clienx) => count + clientX,0)
		.subscribe(count => console.log(count))
```











































