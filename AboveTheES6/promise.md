## Promise介绍
>   promise对象用于异步操作，它表示一个尚未完成且预计在未来完成的异步操作

## Promise应用

在没出现promise之前，工作当中实现异步执行，我们经常使用回调函数嵌套来实现，嵌套回调函数会带来的麻烦就是当们嵌套大量回调函数就会出现回调地狱，代码可读性非常的差。
    
```js
$.ajax({
    type:'',
    url:'',
    data:'',
    succese:function(res) {
        $.ajax({
            type:'',
            url:'',
            data:res.id,
            succese:function() {

            }
        })
    }
})
```
    
当promise出现之后，我们可以直接使用promise中的.then来处理

```js
    const newPromise = new Promise((resolve,reject) => {})
    newPromise
        .then()
```

## 简单使用promise封装原生ajax请求
```js
function Ajaxpromise(url,method,data) {
    return new Promise((reslove,reject) => {
        let xhr =new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4 && xhr.status ==200) {
                resolve(request.response)
            }else {
                reject(request.status)
            }
        }
        if(method == 'get') {
            let add= [];
            for(let key in data) {
                arr.push(key + '=' + data[key]);
            }
            let getData = arr.join('&');
            xhr.open('GET',url + '?'+getData,true);
        }
        if(method == 'post') {
            xhr.open('POST',url,true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
            xhr.send(data);
        }
    })
}

```
## promise解析

####promise和函数式编程
promise源自于函数式编程的Monad