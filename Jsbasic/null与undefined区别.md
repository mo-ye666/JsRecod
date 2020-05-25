## null与undefined的区别
null是JavaScript的关键字，表示一个特殊值常用来描述“空值”，typeof运算返回“object”，所以可以将null认为是一个特殊的对象值，含义是“非对象”
	
undefined是预定义的全局变量，他的值就是“未定义”，typeof运算返回“undefined”

	typeof null; //object
	typeof undefined; //undefined

转换成boolean时均未false，转换成Number时有所不同

	!!(null); //false
	!!(undefined); //false
	Number(null); 
	Number(undefined); //NaN

null常用来定义一个空值
undefined典型用法是：

1.变量被声明了，但没有赋值时，就扥估undefined。
2.调用函数时吗，应该提供的参数没有提供，该参数等于undefined
3.对象没有赋值的属性，改属性的值为undefined
4.函数没有返回值时，默认返回undefined。