原文地址[嗨，你真的懂this吗？](https://juejin.im/post/5c96d0c751882511c832ff7b)

####this的绑定规则
1.默认绑定
2.隐式绑定
3.硬绑定
4.new绑定

####默认绑定
在不能应用其他绑定规则的时候使用默认规则，通常是独立函数调用
```js
function sayHi() {
    console.log('hello',this.name);
}
var name = 'Ybettelau';
sayHi();
```

####隐式绑定
函数调用实在某个对象上触发的，既调用位置上存在上下文对象。形式xxx.function()
```js
fucntion sayHi() {
    console.log('hello',this.name);
}
var person = {
    name:'YvetteLau',
    sayHi:sayHi
}
var name ='Wiliam';
person.sayHi();  /*hello,YvetteLau*/
```
sayHi函数在外部声明，从代码看来不属于person，但是调用person的时候，会使用person的上下文来引用函数，隐式绑定会把函数调用中的this绑定到这个上下文对象
对象属性链中只有最后一层会影响到调用位置。

```js
function sayHi() {
    console.log('hello',this.name);
}
var person2 = {
    name:'Christina',
    sayHi:sayHi
}
var person1 = {
    name:'YvetteLau',
    friend:person2
}
person1.friend.sayHi();  /**hello,Christina**/
```
根据最后一层会确定this的指向，不管有多少层，在判断this的时候，我们只需要关注最后一层，也就是person2的name

隐式绑定有一个问题，绑定很容易丢失（容易给我们造成误导，我们以为this指向的是什么，但是实际并非如此）.

```js
function sayHi() {
    coonsole.log('hello',this.name);
}
var person = {
    name:'YvetteLau',
    sayHi:sayHi
}
var name = 'Wiliam';
var Hi = person.sayHi;
Hi(); /**hello,Wiliam**/
```
Hi直接指向了sayHi的引用，在调用的时候，跟person没有任何关系，xxx.fn(),fn()前如果什么都没有，那就肯定不是隐式绑定，但也不一定是默认绑定。
隐式绑定的丢失发生在回调函数中。
```js
function sayHi() {
    console.log('hello',this.name);
}
var person1 = {
    name:'YvetteLau',
    sayHi:function() {
        setTimeout(function(){
            console.log('hello',this.name)
        })
    }
}
var person2 = {
    name:'Christina',
    sayHi:sayHi,
}
var name ='wiliam';
person1.sayHi();  /**hello,wiliam**/
setTimeout(person2.sayHi,100); /**hello,wiliam**/
setTimeout(function(){
    person2.sayHi();
},200)             /**hello,Christina**/
```
第一个结果，setTimeout的回调函数中，this使用的是默认绑定，在严格模式下，执行的是全局对象
第二个结果，为什么xxx.fun()的时候，this没有指向xxx。
setTimeout(fn,delay) {
    fn();
},相当于将person2.sayHi赋值给了一个变量，最后再执行这个变量，最后sayHi中的this显然和person2九没了关系
第三个结果也在setTimeout中，但执行的是person2.sayHi(),使用的是隐式绑定，因此这是this指向的是person2，跟当前作用域没有任何关系。

####显式绑定
显示绑定就是通过call，apply，bind的方式，显示的指向this所指向的对象。
cally，apply和bind的第一个参数，就是对应函数的this所指向的对象。call和apply的作用一样，只是传参方式不同。call和apply都执行对应的函数，而bind方式不会。

```js
function sayHi() {
    console.log('hello,',this.name)
}
var person = {
    name:'YvetteLau',
    sayHi:sayHi
}
var name = 'Wiliam';
var Hi = person.sayHi;
Hi.call(person); /**hello,YvetteLau**/
```
因为使用硬绑定将this绑定在了person上
那么使用了硬绑定，是不是意味着不会出现隐式绑定所遇到的绑定丢失列？

```js
function sayHi() {
    console.log('hello,',this.name);
}
var person = {
    name:YvetteLau,
    sayHi:sayHi
}
var name = 'Wiliam';
var Hi = function(fn) {
    fn()
}
Hi.call(person,person.sayHi); /**hello,wiliam**/
```
Hi.call(person,person.sayHi)的确是将this绑定到Hi中的this了。但是在执行fn的时候，相当于直接调用了sayHi方法（person.sayHi已经被赋值给fn了，隐式绑定也丢了），没有指定的this的值，对应的是默认绑定
。
在调用fn的时候，也给硬绑定
```js
function sayHi(){
    console.log('hello,',this.name);
}
var person = {
    name:'Yvettelau',
    sayhi:sayHi
}
var name = 'Wiliam';
var Hi = function (fn) {
    fn.call(this);
}
Hi.call(person,person.sayHi); /**hello,Yvettelau**;
```
因为person被绑定到了Hi函数中的this上，fn又将这个对象绑定给了sayHi的函数。此时sayHi中的this指向的就是person对象。

####new绑定
javascript没有类，在JavaScript中，构造函数只是使用new操作符时被调用的函数，这些函数和普通的函数并没有什么不同，他不属于某个类，也不可能实例化出一个类。任何一个函数都可以使用new来调用，因此其实并不存在构造函数，而只有对于函数的'构造调用'。
    使用new来调用函数，会自动执行下面的操作：
1.创建一个新对象
2.将构造函数的作用域赋值给新对象，既this指向这个新对象
3.执行构造函数中的代码
4.返回新对象
因此，我们使用new对象来调用函数的时候，就会新对象绑定到这个函数的this上。
```js
function sayHi(name) {
    this.name = name;
}
var Hi = new sayHi('Yevtte');
console.log('Hello',Hi.name) /**hello,Yevtte**/
```
因为在var Hi = new sayHi('Yevtte');这一步，会将sayHi中的this绑定到Hi对象上。

####绑定优先级
new绑定>显示绑定>隐式绑定>默认绑定

####绑定例外
如果我们将null或者undefined作为this的绑定对象传入call、apply或者bind，这些值在调用时被忽略，实际应用的默认绑定规则
```js
function sayHi(){
    console.log('Hello,', this.name);
}
var person = {
    name: 'YvetteLau',
    sayHi: sayHi
}
var name = 'Wiliam';
var Hi = function(fn) {
    fn();
}
Hi.call(null, person.sayHi);  /**hello,Wiliam**/
```




