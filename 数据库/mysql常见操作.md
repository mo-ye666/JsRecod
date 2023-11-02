#### 内外连接
1. 内连接（Inner Join）:内连接返回两个表中满足关联条件的交集。只有在链接条件匹配的行才会被包含在结果集中。
```SQL
    SELECT * 
    FROM table1
    INNER JOIN table2
    ON table1.id = table2.id
```
2. 左连接（Left Join）：左连接返回左表中的所有行，以及左表中满足关联条件的行。如果左表中没有匹配的行，则用NULL值填充。
3. 右连接（Right Join）：右连接返回右表中的所有行，以及左表中关联条件的行。如果左表没有匹配的行，则用NULL填充。
4. 全连接（FUll Join）：全连接返回左表和右表的所有行，无论是否匹配的行。如果某个表中没有匹配的行，则用NULL填充。

连接操作的语法通常涉及使用JOIN关键字，并通过ON子句指定条件。连接条件是基于两个表之间的列相等性进行匹配。可以根据具体的
需求选择合适的连接类型来获取所需的结果。

需要注意的是，连接操作需要关联的列上建立索引，以提高查询性能。另外，连接操作可能导致结果集的大小增加，因此在处理大型数据集时
要注意性能和内存消耗的问题。

插入行操作
```SQL
INSERT INTO users (name, age, email,city, happy_Id)
VALUES ('liu', 25, 'aaaaaaa@example.com','wuhan',1),
    ('chen', 30, 'bbbbbb@example.com','guangzhou',2),
    ('wang', 35, 'ddddddd@example.com','wuhan',2),
    ('wwww', 35, 'eeeeee@example.com','beijing',1),
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

#### 聚合函数

1.  COUNT: 用于计算指定和表中的行数。可以使用count(*)来计算所有行的数量，或者使用count(column_name)来计算特定列非空值得数量。
2.  SUM: 用于计算指定列或者表中数值列的总和。
3.  AVG：用于计算指定列或表中数值列的平均值。
4.  MIN：用于找到指定列或表中的最小值。
5.  MAX：用于找到指定列或表中的最大值。

* 通常聚合函数和GROUP BY子句一起使用，以便按照指定的列对数据进行分组计算
* 在使用聚合函数时，可以使用AS关键字为结果指定别名，以提高结果的可读性。
* 聚合函数可以与其他SQL语句和条件一起使用，以进一步筛选和处理数据。
   