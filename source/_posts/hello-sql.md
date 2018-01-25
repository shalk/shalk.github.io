---
title: 《Sams Teach Yourself SQL in 10 Minutes》学习笔记
tags: sql
categories: sql
toc: true
date: 2018-01-25 17:00:19
---




后端编程的时候难免要和数据库打交道，SQL是数据库的语言，而很多数据库又有自己的方言，这里说的数据库特指RDBMS，relation database management system，关系型数据库管理系统，市面上主流的RDBMS包括 Oracle Database，Microsoft SQL Server， IBM DB2 ，MySQL（Mariadb）和PostgreSQL。 这些都是支持SQL的，并且有自己的方言或者说是特殊写法。

还有一些NoSQL（有的也支持SQL），在这里不做介绍。

之前我做过一些练习，不过我很快就忘光了，目前我常用的是MySQL，找到了一本书《Sams Teach Yourself SQL in 10 Minutes  》十分不错，打算一口气读完。


这本书有22个章节，下面分两部分记录笔记。

<!-- more -->

## 上部（1～10）



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



### 查询

始于SELECT  prod_name FROM products;

SQL的关键字是没有大小写区分的，但是column 的名称和 table的名称的数据库是有大小写区分的。

建议关键字都用大写， 

```
SELECT column1, column2 FROM tablename;
```

### Sort排序 

(结果根据列排序，可以用编号)

```
SELECT column1, column2 FROM tablename ORDER BY column1;
SELECT column1, column2 FROM tablename ORDER BY 1, 2;
```

### Filter过滤

通常结果要过滤

```
SELECT prod_name, prod_price FROM Products WHERE prod_price > 3.49;
```

用WHERE 子句跟在后面，数字比较的可以用(大于 小于 等于 不等于) BETWEEN 和 IS NULL；

并且，如果排序和过滤都要用，ORDER BY 在WHERE的后面。

### 高级过滤

即多个过滤条件，条件取反，IN

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

**IN**用来判断字符串或者数字在某几个可能,写起来比OR要简便

```
SELECT prod_name, prod_price
FROM Products
WHERE vend_id IN ('DLL01','BRS01')
ORDER BY prod_name;
```

**NOT**

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

### calculated field

计算列，字符串进行函数处理，例如拼接concat，去空格trim/rtrim/ltrim，并且结果可以取别名。

```
SELECT Concat(vend_name, ' (', vend_country, ')')
AS vend_title
FROM Vendors
ORDER BY vend_name;
```

**数值运算**（加减乘除)

```
SELECT prod_id,
quantity,
item_price,
quantity*item_price AS expanded_price
FROM OrderItems
WHERE order_num = 20008;
```

### Data Manipulation Function

数据操作函数，例如前面的trim，函数可以操作数据。比较常见的有一些这些

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

### Summarizing Data  

汇总数据

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

### Grouping data  

数据分组

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

**过滤组**

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

### 子查询

就是SELECT 中嵌套 其他的查询，这种情况很常见。

比如某个查询的结果直接 as为一个列，或者在WHERE语句中IN里加一个查询

```
SELECT cust_id
FROM Orders
WHERE order_num IN (SELECT order_num
FROM OrderItems
WHERE prod_id = 'RGAN01');
```

```
SELECT cust_name,
cust_state,
(SELECT COUNT(*)
FROM Orders
WHERE Orders.cust_id = Customers.cust_id) AS orders
FROM Customers
ORDER BY cust_name
```

当然上面的例子，也可以后用用join来解决。

### JOIN

这个很重要，把多个表组合层一个表。

标准理论上有三种JOIN（有的地方解释为五种，六种没必要）

1. Cartesian JOIN （笛卡尔JOIN， 也叫CROSS JOIN)
2. INNER JOIN（内交）
3. OUTER JOIN，其中OUTER JOIN 有3种， LEFT JOIN, RIGHT JOIN , FULL JOIN。

举例说明这5种:

```
DROP TABLE IF EXISTS teacher;
create table teacher ( 
fullname VARCHAR(20),
info VARCHAR(20),
city_zip int
);
insert into teacher( fullname, city_zip) VALUES( "teacher sam", 101);
insert into teacher( fullname, city_zip) VALUES( "teacher green", 102);
insert into teacher( fullname, city_zip) VALUES( "teacher allen", 107);

DROP TABLE IF EXISTS student;

create table student ( 
s_fullname VARCHAR(20),
s_info VARCHAR(20),
city_zip int
);

insert into student( s_fullname, city_zip) VALUES( "student tom", 101);
insert into student( s_fullname, city_zip) VALUES( "student jack", 102);
insert into student( s_fullname, city_zip) VALUES( "student mike", 108);

```

笛卡尔JOIN

```
SELECT * from teacher JOIN student; 
```

会把3×3的结果全部展示出来，接就是每个老师会对应一个学生。

```
teacher sam		101	student tom		101
teacher green		102	student tom		101
teacher allen		107	student tom		101
teacher sam		101	student jack		102
teacher green		102	student jack		102
teacher allen		107	student jack		102
teacher sam		101	student mike		108
teacher green		102	student mike		108
teacher allen		107	student mike		108
```

如果要把老师和学生按照 city_zip 对应起来，需要添加where子句

INNER JOIN 

```
SELECT * from teacher inner join student on teacher.city_zip = student.city_zip
```

把能对应的老师和学生找出来,结果如下，如果有老师找不到对应的学生，就排除掉，学生找不到对应的老师的也是。

```
teacher sam		101	student tom		101
teacher green		102	student jack		102
```

OUTER JOIN

````
LEFT OUTER JOIN ON
RIGHT OUTER JOIN ON
FULL OUTER JOIN ON （mysql没有这个）
````

left outer join 会保证每个左边的表都会出现：

```
SELECT * from teacher LEFT OUTER JOIN student on teacher.city_zip = student.city_zip
```

```
teacher sam		101	student tom		101
teacher green		102	student jack		102
teacher allen		107			
```

right outer join 会把整右边的表会出现:

```
SELECT * from teacher RIGHT OUTER JOIN student on teacher.city_zip = student.city_zip
```

```
teacher sam		101	student tom		101
teacher green		102	student jack		102
			         student mike		108
```

理论上，full的话，应该把左右没有匹配的都补出来，不过mysql没有。

另外需要补充的是，mysql做了优化之后， inner join, join ,cross join 是等价的。

而且当且仅有没有where子句的时候才是笛卡尔join，加了where子句就是 inner  join on 是一样的。

下面是手册说明：

```
In MySQL, JOIN, CROSS JOIN, and INNER JOIN are syntactic equivalents (they can replace each other). In standard SQL, they are not equivalent. INNER JOIN is used with an ON clause, CROSS JOIN is used otherwise.

In general, parentheses can be ignored in join expressions containing only inner join operations. MySQL also supports nested joins. 
```

另外可以用UNION来实现FULL OUTER JOIN

```
SELECT * from teacher LEFT OUTER JOIN student on teacher.city_zip = student.city_zip
UNION
SELECT * from teacher RIGHT OUTER JOIN student on teacher.city_zip = student.city_zip
```

其他的维度，nature join, self join;

nature join 说的是，结果中，不包含重名的列，在select中把不重名的部分跳出来。

self join 说的是，表格join自身。

###  组合查询 UNION

把两次查询的结果，合并在一起，默认是去重的， UNION ALL 不去重复。

### 插入数据

对这部分的介绍很简略，就是INSERT INTO   VALUE 的标准语法格式。

INSERT INTO  table1(...) SELECT  FROM  这是我经常使用的方式

### 更新和删除

UPDATE  table1 SET xx = xxx WHERE ....

我会用更复杂的update table1 inner join ...........  set .....; 即 先用join把右侧的表格扩展出来，并且构造出一个即将赋值的域，然后更新table1，而且右侧的表格可以用select来构造。

DELETE FROM TABLE WHERE ............

### 定义和修改表格

create table t1 () 此处的语法介绍比较简略，没有详细介绍约束。

alter table 的语法介绍，我也很少alter表格布局，而且建议表格有数据之后不要修改表格。

create table t1 as  select * from t2; 可以复制一份表格。

删除表格 drop table t1;

重命名：

有的DBMS支持rename语句，但是据说这个有丢数据的风险。

建议是创建一份完全一样的表格（名称不同），把数据迁移过去，再把原表删除（或者备份）。

## 高级（18～22）

视图，存储过程，游标，高级SQL特性

### 视图

视图是虚拟表，数据都来自其他表格。

```
CREATE VIEW t3 AS
SELECT * FROM t1 inner join t2 on where t1.xxx = t2.xxx;
```

### 存储过程

存储过程是可以反复使用的，有点像函数：

但需要更复杂的查询和运算，可以使用存储过程，有3个优点， 简单，高效，安全。

我认为，一方面，存储过程的封装提供了一定的安全性，也让使用者得到了便利。 另一方面，这些语句提前编译了，而不用反复编译，确实待了一些高效。

存储过程的写法，和数据关系比较大， MYSQL的写法如下:

```
delimiter //
CREATE PROCEDURE pro1 (
x1  IN VARCHAR,
x2  IN INT,
out1 OUT INT
)
BEGIN
	select ..............;
	cout1 := xxxx
END;
//
delimiter ;

```

我们再找几个实例：

（TODO 增加）

### 事物

数据库非常重要的是提供了事务的支持，可以把一些列操作组成一个事务。

事务有几个特性：一致性（无论什么时候操作，结果是不变的），原子性（一系列操作，要么都执行，要么都不执行），隔离性（一个事务不会被其他事务干扰），持久性（对数据的改变是永久有效的） 这就简称为ACID（ atomicity, consistency, isolation, durability)。

对于mysql，默认是给每个语句单独组成自动事务的，有一个变量，autocommit 可以设置. 0是关闭，1是开启。我们要把多条语句设置成一组事务，先要把这个设置为0.

```
set autocommit = 0;
BEGIN TRANSACTION;
INSERT into t1 (id) values(10);
update t2 set quality = 100 where name = "will jack";
COMMIT;



```

COMMIT;就代表这个事务结束并提交。

有的时候可以回滚，默认是回滚整个事务。

```
set autocommit = 0;
BEGIN TRANSACTION;
INSERT into t1 (id) values(10);
update t2 set quality = 100 where name = "will jack";
ROLLBACK;
```

当然也可以在中间建立回滚点，回滚部分事务。

 ```
set autocommit = 0;
BEGIN TRANSACTION;
INSERT into t1 (id) values(10);
SAVEPOINT AS point1; 
update t2 set quality = 100 where name = "will jack";
ROLLBACK TO point1;
 ```

一旦出现ROLLBACK,commit,就代表上一个事务结束了。

当然一般编写语句的时候，会判断是否出现执行出错，出错才回滚。

### 游标

对于mysql，游标必须声明在存储过程中。

分成四个步骤，声明，开启，使用，关闭。

```
DROP PROCEDURE IF EXISTS proc1;
delimiter //
CREATE PROCEDURE proc1 ()
BEGIN
DECLARE a char(30);
DECLARE done boolean default 0;
DECLARE dudu CURSOR FOR SELECT
	cust_name
FROM
	Customers;

DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
open dudu;

label1: LOOP
fetch dudu into a;
IF NOT done THEN
ITERATE label1;
END IF;
LEAVE label1;
END LOOP label1;

close dudu;
END ;//
delimiter ;
```

这里配合了DECLARE HANDLER 和 LOOP .. END LOOP;的语法。

### 高级特性

constraint:

有主键约束，外键约束，check约束，唯一性约束。

```
alter table t1 add primary key (id);
alter table t1 drop primary key;

ALTER TABLE test ADD CONSTRAINT cust_id_fk FOREIGN KEY (cust_id) REFERENCES Customers (cust_id);
ALTER TABLE test DROP FOREIGN KEY test_ibfk_1;

ALTER TABLE test ADD CONSTRAINT CHECK (size > 10); #在mysql中没有效果

ALTER TABLE test ADD CONSTRAINT  tname_uniq UNIQUE(tname);
ALTER TABLE test DROP INDEX tname_uniq;

```

索引：

索引可以加速，对某列排序或者作为条件的查询，但是会占用更多的空间，降低update,insert,delete的速度。

```
CREATE INDEX tname_ind ON test(tname);
alter table test drop index tname_ind;
```

也可以多列同时做索引，当对两列同时做排序时有用。

trigger:

类似于存储过程保存在系统中，当相关的表格个进行insert 或者update操作时触发，根据DBMS的实现不同，有的是在操作前有的是在操作后（有点像HOOK）。当需要保证数据一致性、基于当前表格个改变其他表格、附加验证或回滚、计算列值或更新时间戳时，适合使用trigger。

```
CREATE TRIGGER custom_state
ON Customers
FOR INSERT, UPDATE
AS 
UPDATE Customers
SET cust_state = UPPER(cust_state)
WHERE Customers.cust_id = inserted.cust_id;
```

安全：

本书只是略过，使用GRANT 和REVOKE提供权限。

其他疑问：

函数和存储过程有什么区别，什么时候用函数。

## 后记



首先，本书确实如作者所说，直接进入SQL的部分，十分实用。以往看一本数据库的书，上来讲各种原理，或者特定DBMS的介绍，让人云里雾里直接放弃。

其次，相比W3C的SQL教程生动的多，书中并不是单列语法，给出了完整的例子和详细的分析，而且尽量介绍标准SQL，略微介绍主流DB的区别。

再次，书里的给了足够的篇幅给SELECT相关的部分，大概看到一半，就解决大部分简单的问题，尤其是JOIN相关。

最后，指出一点不足，书的后面部分包括CUSOR ，事务，存储过程，以及高级特性，都介绍比较简略，一方面这是一本入门书籍，另一方面，不同数据库在这里的出入较大，而我在使用MYSQL数据库查了一些官方手册才明白MYSQL中的基本用法。

综上，这是一本极好的SQL入门书籍，正如知乎上一些推荐的，是首选。

## END
