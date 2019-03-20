## Promise介绍
>   promise对象用于异步操作，它表示一个尚未完成且预计在未来完成的异步操作

## Promise应用
    在没出现promise之前，工作当中实现异步执行，我们经常使用回调函数嵌套来实现，嵌套回调函数会带来的麻烦就是当们
嵌套大量回调函数就会出现回调地狱，代码可读性非常的差。
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
    js```
    
    当promise出现之后，我们可以直接使用promise中的.then来处理
    ```js
        const newPromise = new Promise((resolve,reject) => {})
        newPromise
            .then()
    js```
