---
title: TIJ review chapter16 arrays
tags:
  - java
  - tij
categories: java
toc: true
date: 2017-11-14 11:15:41
---


在java中数组是一种特殊的对象，语言原生支持，又称为第一类对象。而在开发中，大部分时间会使用容器（Collection,Map)。 和Collection相比较，数组具有效率，类型和保存基本类型的能力。

随着泛型的出现，容器可以通过泛型记录保存的对象的类型。泛型是不能使用基本类型的，但是随着自动包装类型（Integer等）的出现，容器也可以存放基本类型。那数组只剩下效率的优势，但是数组有诸多的限制，例如大小固定等。

数组可以用来实现一些数据结构，同时在基本类型的保存上避开了自动包装的一些坑，在编写一些简单的逻辑时也十分有效。

下面了解一下数组的基本用法，传参，多维数组，数组泛型，Arrays类库，数组填充，自动包装。

## 基本用法

声明方式如下

```
int[] a
Car[] cars
char[] chars
```

初始化方式

```
a = new int[3];
// dynamic aggregate initialization
a = new int[]{1, 2, 3};
// aggregate initialization 
int[] a = {1, 2, 3};
Car[] car3 = new Car[3];
Car[] cars = { new Car(), new Car() }
```

这里可以看到初始化有3种

1.   只初始化大小，数组空间会被分配出来，对于基本类型会有默认值，int 是0， 整数都是0， 浮点是0.0  boolean是false， 而对象数组，数组存放的是引用类型，默认值为null。此时对象还没有new出来。
2.   aggregate initialization（集聚初始化），这种写法简便，但是必须要和声明写在一起。
3.   dynamic aggregate initialization（动态聚集初始化）， 可以不用和声明一起写。

一般我只写1和3。

数组访问 

```
a[2] = 3;
a[10000] 越界异常
int b = a[1];
```

数组方法

数组有Object对象的所有方法，例如equals， hashCode，getClass,  toString , 同步wait, notify，notifyAll 等

数组还有一个域，是length， 不会发生改变。



## 传参

写法如下

```
void foo(int[] a){
	///  
}

int[] getIntArray(int size) {
  return new int[size];
}
```

## 多维数组

一维数组写入是T[] ， 二位数组可以降低维度来理解，就是一组 一维数组。

写法如下

```
int[][] a;
int[][] a = new int[3][3];
a = new int[]][]{ {1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
int[] b;
b = a[0];
b = a[1];
b = a[2];
```

三维就继续写方括号，当然维度太高就不建议继续用这种写法，自己都看不清楚，应该用数据结构来处理。

需要注意的是，二维度数组a, 是一个3 个 大小为3的数组， 也可以理解成3 × 3的矩阵。 

如果使用容器保存二维数组，可以保存多个长度不同的一维数组。

## 数组与泛型（不推荐）

数组可以写成Car[] 这种形式，如果Car是一个泛型类型，是否可以用泛型呢，是可以的。

```
Pool<Apple>[] pool; 
```

然而这里面**有坑** ， 最好不要这么写。

```d
pool = new Pool<Apple>[10];
```

这是会编译报错的。

那只能是

```
pool = (Pool<Apple>[])new Pool[10];
```

还有一种就是在使用泛型的类或方法内部使用了T[] 这样的写，也会**踩坑** ,因为T[] 这种对象不能new，只能通过Object转型

例如

```
class SomeClass<T> {
  public T[] array;
  public foo(int size) {
    array = (T[])new Object[size];
  }
}
```

如果使用Object来创建这个数组对象，由于擦除的存在，array是一个Object的数组，实际上并没有发生转型。

但是编译期间会进行类型检查，

```
SomeClass<String>  a = new SomeClass();
a.foo(10);
// 编译错误，不是String类型
// a.array[0] = 123;
// 运行错误ClassCastException，无法把Object转换成String
a.array[1] = new String("123");
System.out.println(s1.array[0]);
```

这里访问的时候，需要取到一个String对象，但是内部只有一个Object对象，无法向String转型。

## Arrays类库



java.util.Arrays 可以配合数组进行使用。

**填充**:

```
int[] a = new int[10];
Arrays.fill(a, 3);
```

**组合字符串**:

```
Arrays.toString(a);
```

**浅比较**:

```
Arrays.equals(a, b);
```

把数组的每个元素，之间使用equals进行比较，基本类型就比较值。因此对象数组，对象要实现equals，按照规范也要实现hashCode。

**深比较**:

```
Arrays.deepEquals(a, b);
```

如果a 和b是多维数组，会进一步迭代调用比较。因为数组作为对象，本身的equals是直接使用Object的equal，会直接比较引用，只有同一个对象才会相等。

**排序**：

```
Arrays.sort(a); 
```

需要a实现了Comparable 或者

```
Array.sort(T[] array, Comparator<T> comp);
```

**二叉搜索**:

数组没有find或者indexOf这种查询方法，对排序的数组可以用二叉搜索

```
Arrays.binarySearch(T[] array, T t )
```

返回值为索引，如果找不到，就是 `- (插入点) - 1` ,当然 对象需要是可比较的。

## 数组填充

Arrays.fill给出了一个填充办法，但是对于对象，fill会填充相同的对象，并不会创建很多对象。

本章节给了一个套路,用生成器来创建，把数组传参进去，如果数组没有初始化，就在方法里把数组对象new出来，加上泛型，可以把这个方法一般化。

代码如下:

```
//Generator.java
public interface Generator<T> {
  T next();
}

import java.lang.reflect.Array;
//Generated.java
public Generated  {
  public static <T> T[] array (T[] t, Generator<T> gen) {
    for (int i = 0; i < t.length; i++) {
      t[i] = gen.next();
    }
    return t;
  }
  public static <T> T[] array (Class<T> type, Generator<T> gen, int size) {
    T[] t = (T[]) Array.newInstance(type, size);
    return array(t, gen);
  }
}
```

基于Lamada的方法如下

```
// 需要persons已经分配了空间
Arrays.setAll(persons, i -> new Person());
Arrays.parallelSetAll(persons, i -> new Person());
// 或者把整数列表，映射成对象列表，最后转数组。
Person[] persons = IntStream.range(0, 15)  // 15 is the size
    .mapToObj(i -> new Person())
    .toArray(Person[]::new);
```

## 拷贝

数组之间可以用`System.arraycopy(src, src_start, des, dest_start, length)`

这是一个浅拷贝，也就是不会产生新的对象；同时不支持自动包装，src和des类型需要完全相同。

## 自动包装

即基本类型和包装类的相互转换；`int <=> Integer` 

传参和赋值的时候，int和Integer会自动转换。

但是泛型只能用包装类；

并且包装类是对象，传参会传引用的值，因此写算法的时候尽量用int，直接传值，避免在函数中改变了对象。

## TODO

深入探索-JAVA拷贝

深入探索-自动包装

深入探索-Lamada

## END