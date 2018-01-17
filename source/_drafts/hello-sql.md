---
title: hello sql
toc: true
tags: sql
categories: sql

---



后端编程的时候难免要和数据库打交道，SQL是数据库的语言，而很多数据库又有自己的方言，这里说的数据库特指RDBMS，relation database management system，关系型数据库管理系统，市面上主流的RDBMS包括 Oracle Database，Microsoft SQL Server， IBM DB2 ，MySQL（Mariadb）和PostgreSQL。 这些都是支持SQL的，并且有自己的方言或者说是特殊写法。

还有一些NoSQL（有的也支持SQL），在这里不做介绍。

之前我做过一些练习，不过我很快就忘光了，目前我常用的是MySQL，找到了一本书《Sams Teach Yourself SQL in 10 Minutes  》十分不错，打算一口气读完。


这本书有22个章节，下面分两部分记录笔记。

## 上部(1-10章)



SQL（structured query language）是与数据库交互的语言。

database可以保存结构化的数据，既可以是存在一个文件或者多个文件内。

Mysql,Oracle都是数据库软件，就是DBMS就是数据库管理软件，通过软件可以创建或者删除database，

database可以有很多table，table保存一组特定类型的结构化数据。

schema是database和table的基本布局和属性信息。

column是一个表的一个域，一个表可以有多个列

datatype是每个列都必须有特定的数据类型。

row 是一行，table中的一条记录。

primary key，主键，一列或者多列 用于唯一确定行的，没有两个row有相同的主键。

主键不是必须的，但是建议有主键



查询始于SELECT  prod_name FROM products;

SQL的关键字是没有大小写区分的，但是column 的名称和 table的名称的数据库是有大小写区分的。

建议关键字都用大写， 

```
SELECT column1, column2 FROM tablename;
```

**Sort排序** (结果根据列排序，可以用编号)

```
SELECT column1, column2 FROM tablename ORDER BY column1;
SELECT column1, column2 FROM tablename ORDER BY 1, 2;
```

**Filter过滤**，通常结果要过滤

```
SELECT prod_name, prod_price FROM Products WHERE prod_price > 3.49;
```

用WHERE 子句跟在后面，数字比较的可以用(大于 小于 等于 不等于) BETWEEN 和 IS NULL；

并且，如果排序和过滤都要用，ORDER BY 在WHERE的后面。

**高级过滤**，即多个过滤条件，条件取反，IN

```
SELECT prod_id, prod_price, prod_name
FROM Products
WHERE vend_id = 'DLL01' AND prod_price <= 4;
```

```
SELECT prod_id, prod_price, prod_name
FROM Products
WHERE vend_id = 'DLL01' OR prod_price <= 4;
```

需要注意的是，AND的优先级比较高， 如果有AND和OR 混合在一起，要判断是不是预期的逻辑，如果不是需要加括号，把需要OR的先括起来。

```
SELECT prod_name, prod_price
FROM Products
WHERE vend_id = 'DLL01' OR vend_id = 'BRS01'
AND prod_price >= 10;
```

IN用来判断字符串或者数字在某几个可能,写起来比OR要简便

```
SELECT prod_name, prod_price
FROM Products
WHERE vend_id IN ('DLL01','BRS01')
ORDER BY prod_name;
```

NOT

````
SELECT prod_name, prod_price
FROM Products
WHERE NOT vend_id = 'DLL01';
````

**wildcard filter 通配符过滤**

LIKE是模糊匹配，一般是字符串局部匹配即可，有三种通配符，`%`(匹配任意字符可以是0个字符)  `_`(匹配一个字符) `[]`(方括号内可以是多个可能的字符，不过mysql不支持)

```
SELECT prod_id, prod_name
FROM Products
WHERE prod_name LIKE '% inch teddy bear';

SELECT prod_id, prod_name
FROM Products
WHERE prod_name LIKE '__ inch teddy bear';
```

需要注意的是 `WHERE column1 LIKE '%'` 是不会匹配NULL的列的。

**calculated field**(计算过的列)

字符串进行函数处理，例如拼接concat，去空格trim/rtrim/ltrim，并且结果可以取别名。

```
SELECT Concat(vend_name, ' (', vend_country, ')')
AS vend_title
FROM Vendors
ORDER BY vend_name;
```

数值运算（加减乘除)

```
SELECT prod_id,
quantity,
item_price,
quantity*item_price AS expanded_price
FROM OrderItems
WHERE order_num = 20008;
```

Data Manipulation Function

例如前面的trim，函数可以操作数据。比较常见的有一些这些

`SUBSTRING`（子串）,`CONVERT`（格式转换）, `CURDATE`（当前日期） 

不同DBMS的函数都不太一样，主要有4大类

1. 对数值进行计算的函数
2. 对字符串进行处理的函数
3. 日期时间相关的函数
4. 从DBMS取到的系统相关函数，例如登录的用户数量

```
SELECT vend_name, UPPER(vend_name) AS vend_name_upcase
FROM Vendors
ORDER BY vend_name;
```

```
SELECT cust_name, cust_contact
FROM Customers
WHERE SOUNDEX(cust_contact) = SOUNDEX('Michael Green');
```

```
SELECT order_num
FROM Orders
WHERE YEAR(order_date) = 2012;
```

数值函数

```
ABS() COS() SIN() TAN()  PI() SQRT() EXP() LOG()
```

**Summarizing Data**  汇总数据

汇总数据，例如平均值，数量，最大，最小，总和

可以用

```
SUM() MAX() MIN() AVG() COUNT()
```

```
SELECT AVG(prod_price) AS avg_price
FROM Products;
```

```
SELECT COUNT(*) AS num_cust
FROM Customers;

SELECT COUNT(cust_email) AS num_cust
FROM Customers;
```

count(columnname) 是计算某列的行数，不算null

count(*) 是计算行数，包含null

**grouping data**  数据分组

例如一个表单有所有参加生产的产品，需要知道，每个厂家生产的产品数量。 需要按照厂家id 进行分组。并且按照组 计算每组的数据数量

```
SELECT vend_id, COUNT(*) AS num_prods
FROM Products
GROUP BY vend_id;
```

这里有一些约束：

- group by 在WHERE 后面，先过滤后分组，在ORDER BY 前面。 SELECT的结果再排序。
- group by 可以有多个column, （不能是变长的数据类型，例如text memo）
- select 后面 只能用 group by的 columns
- select 后面的 column 都必须出现在group by 后面
- group by 不能用alias
- 如果column有null， group by 可会把null的分成一组
- 这个时候COUNT(*) 是每组的数量

过滤组

 HAVING 子句 group by 再接having  可以有条件判断，把不满足条件的组过滤掉。

```
SELECT order_num, COUNT(*) AS items
FROM OrderItems
GROUP BY order_num
HAVING COUNT(*) >= 3
ORDER BY items, order_num;
```

整个组合一下，顺序就是 `SELECT`  `FROM`  `GROUP BY` `HAVING` `ORDER BY`

## 下部（11～17）

子查询，join，高级join， 组合查询，插入数据， 更新和删除数据，创建和操作表格（DDL)



## 高级（18～22）

视图，存储过程，游标，高级SQL特性