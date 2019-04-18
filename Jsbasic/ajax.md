#### formdata数据格式

```js 
    datas = (function(value){
        for(var key in value){
        oStr += key+"="+value[key]+"&";
        };
        return oStr;
    }(datas));
```