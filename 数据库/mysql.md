##  1.子句

#### 1.1 JOIN

1.	内连接（Inner Join）:内连接返回两个表中满足关联条件的交集。只有在链接条件
2.	匹配的行才会被包含在结果集中。
    ```SQL
        SELECT * FROM table1
        INNER JOIN table2
        ON table1.id = table2.id
    ```
3.	左连接（Left Join）：左连接返回左表中的所有行，以及左表中满足关联条件的行。如果左表中没有匹配的行，则用NULL值填充。
4.	右连接（Right Join）：右连接返回右表中的所有行，以及左表中关联条件的行。如果左表没有匹配的行，则用NULL填充。
5.	全连接（Full Join）：全连接返回左表和右表的所有行，无论是否匹配的行。如果某个表中没有匹配的行，则用NULL填充。
连接操作的语法通常涉及使用JOIN关键字，并通过ON子句指定条件。连接条件是基于两个表之间的列相等性进行匹配。可以根据具体的 需求选择合适的连接类型来获取所需的结果。
需要注意的是，连接操作需要关联的列上建立索引，以提高查询性能。另外，连接操作可能导致结果集的大小增加，因此在处理大型数据集时 要注意性能和内存消耗的问题。

#### 1.2 GROUP BY

GROUP BY子句用于根据指定列对结果集分组。通常和聚合函数一起使用，以便对每组进行汇总计算。

注意事项：
* GROUP BY子句中指定的列可以是查询结果集中的任何列，也可以是表中的其他列
* 可以在SELECT语句中使用聚合函数对每个组进行汇总计算。
* 可以根据需求指定多个列进行分组，以创建多级分组。
* GROUP BY子句通常与聚合函数一起使用，以便对每个组进行计算。如果在SELECT语句中使用了聚合函数，而没有使用GROUP BY子句，则将返回整个结果集的单个汇总值。
* GROUP BY子句的顺序通常与SELECT语句中的列顺序保持一致，但在大多数数据库中，它们的顺序并不强制要求，只要指定的列是有效的分组列即可。
* GROUP BY子句可以与其他子句（如HAVING子句）一起使用，以进一步筛选和处理分组数据。
ROLLUP 操作符可以用于在 GROUP BY 子句中指定多个列，从而生成多级的汇总结果。

#### 1.3 HAVING

HAVING子句在SQL中用于GROUP BY子句之后对分组结果进行筛选。它允许对聚合函数的结果应用条件，从而过滤不符合条件的分组。

注意事项:
* HAVING子句可以包含聚合函数和其他表达式，并对聚合函数的结果进行判断
* 可以在HAVING子句中使用比较运算符（如<,>,=,<=,>=）和逻辑运算符（如AND，OR）来构建条件
* HAVING子句中的条件是在分组之后应用的，所以可以使用聚合函数的别名或完整的聚合函数表达式。
* HAVING子句中的条件可以使用多个聚合函数并进行组合，以进一步筛选符合条件的分组。
* 与WHERE子句不同，HAVING子句可以使用聚合函数的结果进行条件判断，因为它在分组之后执行。

## 2.增删改

插入行操作
```SQL
    INSERT INTO users (name, age, email)
    VALUES ('liu', 25, 'johndoe@example.com'),
        ('chen', 30, 'janesmith@example.com'),
        ('wang', 35, 'bobjohnson@example.com');
```
更新行操作
```SQL
    UPDATE users
    SET
        age = 24
    WHERE happy_Id IN 
            (
                SELECT happy_Id
                FROM happys
                WHERE type in ('basketball','football')
            )
```

删除行操作
```SQL
    DELETE FROM users
    WHERE happy_Id = (
        SELECT happy_Id 
        FROM happys
        WHERE type in ('billiard','volleyball')
    )
```


LAST_INSERT_ID()函数是一个MySQL内置函数，用于获取最后插入行的自动生成的ID值。
	
## 3.聚合函数

1.	COUNT: 用于计算指定和表中的行数。可以使用count(*)来计算所有行的数量，或者使用count(column_name)来计算特定列非空值得数量。
2.	SUM: 用于计算指定列或者表中数值列的总和。
3.	AVG：用于计算指定列或表中数值列的平均值。
4.	MIN：用于找到指定列或表中的最小值。
5.	MAX：用于找到指定列或表中的最大值。

注意事项：

* 通常聚合函数和GROUP BY子句一起使用，以便按照指定的列对数据进行分组计算
* 在使用聚合函数时，可以使用AS关键字为结果指定别名，以提高结果的可读性。
* 聚合函数可以与其他SQL语句和条件一起使用，以进一步筛选和处理数据。
* 在某些情况下，聚合函数可能忽略NULL值，或者需要使用特定的函数（如COUNT（column_name））来处理NULL值

## 4.练习
clients表
<table border=1>
<tr>
<td bgcolor=silver class='medium'>client_id</td><td bgcolor=silver class='medium'>name</td><td bgcolor=silver class='medium'>address</td><td bgcolor=silver class='medium'>city</td><td bgcolor=silver class='medium'>state</td><td bgcolor=silver class='medium'>phone</td></tr>
<tr>
<td class='normal' valign='top'>1</td>
<td class='normal' valign='top'>Vinte</td>
<td class='normal' valign='top'>3 Nevada Parkway</td>
<td class='normal' valign='top'>Syracuse</td>
<td class='normal' valign='top'>NY</td>
<td class='normal' valign='top'>315-252-7305</td>
</tr>
<tr>
<td class='normal' valign='top'>2</td>
<td class='normal' valign='top'>Myworks</td>
<td class='normal' valign='top'>34267 Glendale Parkway</td>
<td class='normal' valign='top'>Huntington</td>
<td class='normal' valign='top'>WV</td>
<td class='normal' valign='top'>304-659-1170</td>
</tr>
<tr>
<td class='normal' valign='top'>3</td>
<td class='normal' valign='top'>Yadel</td>
<td class='normal' valign='top'>096 Pawling Parkway</td>
<td class='normal' valign='top'>San Francisco</td>
<td class='normal' valign='top'>CA</td>
<td class='normal' valign='top'>415-144-6037</td>
</tr>
<tr>
<td class='normal' valign='top'>4</td>
<td class='normal' valign='top'>Kwideo</td>
<td class='normal' valign='top'>81674 Westerfield Circle</td>
<td class='normal' valign='top'>Waco</td>
<td class='normal' valign='top'>TX</td>
<td class='normal' valign='top'>254-750-0784</td>
</tr>
<tr>
<td class='normal' valign='top'>5</td>
<td class='normal' valign='top'>Topiclounge</td>
<td class='normal' valign='top'>0863 Farmco Road</td>
<td class='normal' valign='top'>Portland</td>
<td class='normal' valign='top'>OR</td>
<td class='normal' valign='top'>971-888-9129</td>
</tr>
</table>

invoices表
<table border=1>
<tr>
<td bgcolor=silver class='medium'>invoice_id</td><td bgcolor=silver class='medium'>number</td><td bgcolor=silver class='medium'>client_id</td><td bgcolor=silver class='medium'>invoice_total</td><td bgcolor=silver class='medium'>payment_total</td><td bgcolor=silver class='medium'>invoice_date</td><td bgcolor=silver class='medium'>due_date</td><td bgcolor=silver class='medium'>payment_date</td></tr>
<tr>
<td class='normal' valign='top'>1</td>
<td class='normal' valign='top'>91-953-3396</td>
<td class='normal' valign='top'>2</td>
<td class='normal' valign='top'>101.79</td>
<td class='normal' valign='top'>0.00</td>
<td class='normal' valign='top'>2019-03-09</td>
<td class='normal' valign='top'>2019-03-29</td>
<td class='normal' valign='top'>(NULL)</td>
</tr>
<tr>
<td class='normal' valign='top'>2</td>
<td class='normal' valign='top'>03-898-6735</td>
<td class='normal' valign='top'>5</td>
<td class='normal' valign='top'>175.32</td>
<td class='normal' valign='top'>8.18</td>
<td class='normal' valign='top'>2019-06-11</td>
<td class='normal' valign='top'>2019-07-01</td>
<td class='normal' valign='top'>2019-02-12</td>
</tr>
<tr>
<td class='normal' valign='top'>3</td>
<td class='normal' valign='top'>20-228-0335</td>
<td class='normal' valign='top'>5</td>
<td class='normal' valign='top'>147.99</td>
<td class='normal' valign='top'>0.00</td>
<td class='normal' valign='top'>2019-07-31</td>
<td class='normal' valign='top'>2019-08-20</td>
<td class='normal' valign='top'>(NULL)</td>
</tr>
<tr>
<td class='normal' valign='top'>4</td>
<td class='normal' valign='top'>56-934-0748</td>
<td class='normal' valign='top'>3</td>
<td class='normal' valign='top'>152.21</td>
<td class='normal' valign='top'>0.00</td>
<td class='normal' valign='top'>2019-03-08</td>
<td class='normal' valign='top'>2019-03-28</td>
<td class='normal' valign='top'>(NULL)</td>
</tr>
<tr>
<td class='normal' valign='top'>5</td>
<td class='normal' valign='top'>87-052-3121</td>
<td class='normal' valign='top'>5</td>
<td class='normal' valign='top'>169.36</td>
<td class='normal' valign='top'>0.00</td>
<td class='normal' valign='top'>2019-07-18</td>
<td class='normal' valign='top'>2019-08-07</td>
<td class='normal' valign='top'>(NULL)</td>
</tr>
<tr>
<td class='normal' valign='top'>6</td>
<td class='normal' valign='top'>75-587-6626</td>
<td class='normal' valign='top'>1</td>
<td class='normal' valign='top'>157.78</td>
<td class='normal' valign='top'>74.55</td>
<td class='normal' valign='top'>2019-01-29</td>
<td class='normal' valign='top'>2019-02-18</td>
<td class='normal' valign='top'>2019-01-03</td>
</tr>
<tr>
<td class='normal' valign='top'>7</td>
<td class='normal' valign='top'>68-093-9863</td>
<td class='normal' valign='top'>3</td>
<td class='normal' valign='top'>133.87</td>
<td class='normal' valign='top'>0.00</td>
<td class='normal' valign='top'>2019-09-04</td>
<td class='normal' valign='top'>2019-09-24</td>
<td class='normal' valign='top'>(NULL)</td>
</tr>
<tr>
<td class='normal' valign='top'>8</td>
<td class='normal' valign='top'>78-145-1093</td>
<td class='normal' valign='top'>1</td>
<td class='normal' valign='top'>189.12</td>
<td class='normal' valign='top'>0.00</td>
<td class='normal' valign='top'>2019-05-20</td>
<td class='normal' valign='top'>2019-06-09</td>
<td class='normal' valign='top'>(NULL)</td>
</tr>
<tr>
<td class='normal' valign='top'>9</td>
<td class='normal' valign='top'>77-593-0081</td>
<td class='normal' valign='top'>5</td>
<td class='normal' valign='top'>172.17</td>
<td class='normal' valign='top'>0.00</td>
<td class='normal' valign='top'>2019-07-09</td>
<td class='normal' valign='top'>2019-07-29</td>
<td class='normal' valign='top'>(NULL)</td>
</tr>
<tr>
<td class='normal' valign='top'>10</td>
<td class='normal' valign='top'>48-266-1517</td>
<td class='normal' valign='top'>1</td>
<td class='normal' valign='top'>159.50</td>
<td class='normal' valign='top'>0.00</td>
<td class='normal' valign='top'>2019-06-30</td>
<td class='normal' valign='top'>2019-07-20</td>
<td class='normal' valign='top'>(NULL)</td>
</tr>
<tr>
<td class='normal' valign='top'>11</td>
<td class='normal' valign='top'>20-848-0181</td>
<td class='normal' valign='top'>3</td>
<td class='normal' valign='top'>126.15</td>
<td class='normal' valign='top'>0.03</td>
<td class='normal' valign='top'>2019-01-07</td>
<td class='normal' valign='top'>2019-01-27</td>
<td class='normal' valign='top'>2019-01-11</td>
</tr>
<tr>
<td class='normal' valign='top'>13</td>
<td class='normal' valign='top'>41-666-1035</td>
<td class='normal' valign='top'>5</td>
<td class='normal' valign='top'>135.01</td>
<td class='normal' valign='top'>87.44</td>
<td class='normal' valign='top'>2019-06-25</td>
<td class='normal' valign='top'>2019-07-15</td>
<td class='normal' valign='top'>2019-01-26</td>
</tr>
<tr>
<td class='normal' valign='top'>15</td>
<td class='normal' valign='top'>55-105-9605</td>
<td class='normal' valign='top'>3</td>
<td class='normal' valign='top'>167.29</td>
<td class='normal' valign='top'>80.31</td>
<td class='normal' valign='top'>2019-11-25</td>
<td class='normal' valign='top'>2019-12-15</td>
<td class='normal' valign='top'>2019-01-15</td>
</tr>
<tr>
<td class='normal' valign='top'>16</td>
<td class='normal' valign='top'>10-451-8824</td>
<td class='normal' valign='top'>1</td>
<td class='normal' valign='top'>162.02</td>
<td class='normal' valign='top'>0.00</td>
<td class='normal' valign='top'>2019-03-30</td>
<td class='normal' valign='top'>2019-04-19</td>
<td class='normal' valign='top'>(NULL)</td>
</tr>
<tr>
<td class='normal' valign='top'>17</td>
<td class='normal' valign='top'>33-615-4694</td>
<td class='normal' valign='top'>3</td>
<td class='normal' valign='top'>126.38</td>
<td class='normal' valign='top'>68.10</td>
<td class='normal' valign='top'>2019-07-30</td>
<td class='normal' valign='top'>2019-08-19</td>
<td class='normal' valign='top'>2019-01-15</td>
</tr>
<tr>
<td class='normal' valign='top'>18</td>
<td class='normal' valign='top'>52-269-9803</td>
<td class='normal' valign='top'>5</td>
<td class='normal' valign='top'>180.17</td>
<td class='normal' valign='top'>42.77</td>
<td class='normal' valign='top'>2019-05-23</td>
<td class='normal' valign='top'>2019-06-12</td>
<td class='normal' valign='top'>2019-01-08</td>
</tr>
<tr>
<td class='normal' valign='top'>19</td>
<td class='normal' valign='top'>83-559-4105</td>
<td class='normal' valign='top'>1</td>
<td class='normal' valign='top'>134.47</td>
<td class='normal' valign='top'>0.00</td>
<td class='normal' valign='top'>2019-11-23</td>
<td class='normal' valign='top'>2019-12-13</td>
<td class='normal' valign='top'>(NULL)</td>
</tr>
</table>

根据clients表计算client_id对应invoices表的invoice_total的总和，与invoices表invoice_total的平均值对比差异
```SQL
    SELECT 
    client_id,
    NAME,
    (
    SELECT SUM(invoice_total)
        FROM invoices
        WHERE client_id = c.client_id
    ) AS total_sales,
    (
    SELECT AVG(invoice_total)
        FROM invoices
    ) AS average`clients`,
    (
    SELECT total_sales - average
    ) AS difference
    FROM clients AS c

```