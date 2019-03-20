## Promise介绍
>   promise对象用于异步操作，它表示一个尚未完成且预计在未来完成的异步操作

## Promise应用
    
    ```
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
    ```
        const newPromise = new Promise((resolve,reject) => {})
        newPromise
            .then()
    ```
