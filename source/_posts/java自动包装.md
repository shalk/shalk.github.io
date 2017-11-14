---
title: java自动包装
tags: java
categories: java
toc: true
date: 2017-11-14 16:47:53
---


java自动包装是1.5添加的一个增加特性，为了消除对这个魔法的疑惑，对官方的教程，说明以及规范进行翻译。看完这3部分就全明白了。



## 教程

自动包装(`Autoboxing`)是一种java便编译器在基本类型和相应的对象包装类之间的约定。例如 把`int`转换成`Integer`, double转换成`Double` 等待。 如果是反向转换，被称为 解包装(`unboxing`)

下面是最简单的自动包装的例子：

```java
Character ch = 'a';
```



本节下面的例子使用泛型。如果你不熟悉泛型的语法，可以看 [Generics (Updated)](https://docs.oracle.com/javase/tutorial/java/generics/index.html) 的章节。

阅读如下代码:

```java
List<Integer> li = new ArrayList<>();
for (int i = 1; i < 50; i += 2)
    li.add(i);
```

尽管你add的是基本类型`int` ，而不是`Integer`对象到` li`中, 代码编译成功。 由于`li`是`Integer` 对象的列表, 不是`int`的列表，你肯定会好奇为什么java 编译器不会产生 编译错误。 编译器不产生报错是因为它用`i`创建一个`Integer`对象上，并把这个对象添加到`li`。 因此，编译器在运行时把之前的代码转换成如下代码：

```java
List<Integer> li = new ArrayList<>();
for (int i = 1; i < 50; i += 2)
    li.add(Integer.valueOf(i));
```

把基本类型（例如`int`) 转换成一个相应的包装对象类（`Integer`) 被称为autoboxing(自动包装)。Java编译器在以下情况对基本类型使用自动包装：

- 传参时，把基本类型传递给一个方法，该方法预期接受的参数是相应的包装类。
- 赋值时，把基本类型赋值给一个包装类变量。

阅读如下代码：

```java
public static int sumEven(List<Integer> li) {
    int sum = 0;
    for (Integer i: li)
        if (i % 2 == 0)
            sum += i;
        return sum;
}
```

因为求余操作符（`%`) 和 一元加操作符（`+=`）把能作用于`Integer` 对象, 你可能想知道为什么java编译器不会产生该方法的报错。 这是因为它调用了`intValue`方法在运行时把`Integer`转换成`int`： 

```Java
public static int sumEven(List<Integer> li) {
    int sum = 0;
    for (Integer i : li)
        if (i.intValue() % 2 == 0)
            sum += i.intValue();
        return sum;
}
```

把包装类对象（如`Integer`) 转换成相应的基本类型（`int`) 被称为解包装（unboxing）。 java编译器会在一下情况解包装一个包装类对象：

- 传参时，把包装类传递给方法，该方法预期接受的参数是相应的基本类型。（操作符也是传参）
- 赋值时，把变量赋值给相应基本类型。

解包装的例子如下：

```java
import java.util.ArrayList;
import java.util.List;

public class Unboxing {

    public static void main(String[] args) {
        Integer i = new Integer(-8);

        // 1. Unboxing through method invocation
        int absVal = absoluteValue(i);
        System.out.println("absolute value of " + i + " = " + absVal);

        List<Double> ld = new ArrayList<>();
        ld.add(3.1416);    // Π is autoboxed through method invocation.

        // 2. Unboxing through assignment
        double pi = ld.get(0);
        System.out.println("pi = " + pi);
    }

    public static int absoluteValue(int i) {
        return (i < 0) ? -i : i;
    }
}
```

程序打印如下：

```
absolute value of -8 = 8
pi = 3.1416
```

自动包装和解包装让开发写的代码更简洁，更容易阅读。下表列出了基本类型和相应包装类，用于java编译器进行自动包装和解包装：

| Primitive type | Wrapper class |
| -------------- | ------------- |
| boolean        | Boolean       |
| byte           | Byte          |
| char           | Character     |
| float          | Float         |
| int            | Integer       |
| long           | Long          |
| short          | Short         |
| double         | Double        |



----

## 说明

Java程序员都知道，不能把 `int` 放入一个容器中。 容器只能存放对象引用，所以你需要包装基本类型为一个合适的包装类（[`Integer`](https://docs.oracle.com/javase/8/docs/api/java/lang/Integer.html)就是int的合适包装类）。但你把对象放入容器中，你可以取到`Integer`;如果你需要`int`， 你需要解包`Integer`，使用`intValue`方法解包。所有的包装和解包装都是负担，把代码变的散乱。自动包装和解包装的特性可以自动化这个过程，并消除负担和代码散乱。



以下例子解释了自动包装和解包装，并结合了[泛型](https://docs.oracle.com/javase/8/docs/technotes/guides/language/generics.html)和[for-each](https://docs.oracle.com/javase/8/docs/technotes/guides/language/foreach.html)循环一起演示。下面数10行代码，计算并打印了命令行单词按照字母顺序的频率表。

```java
import java.util.*;

// Prints a frequency table of the words on the command line
public class Frequency {
   public static void main(String[] args) {
      Map<String, Integer> m = new TreeMap<String, Integer>();
      for (String word : args) {
          Integer freq = m.get(word);
          m.put(word, (freq == null ? 1 : freq + 1));
      }
      System.out.println(m);
   }
}

java Frequency if it is to be it is up to me to do the watusi
{be=1, do=1, if=1, is=2, it=2, me=1, the=1, to=3, up=1, watusi=1}
```

这个程序首先声明了一个`String`到`Integer`的一个map， 把单词和单词出现的次数关联起来。然后迭代命令行的每一个单词。对于每一个单词，查询map中的单词。然后把对该单词修改后的条目放如map中。m.put的那一行既包含自动包装和解包装。为了计算单词关联的新的值，首先查看当前频率`freq`。 如果是`null`， 该单词是首次出现，就把1 放入map中。否则，就把之前出现的次数加1再放入map中。 但是你不能把`int`放入map中，也不能给`Integer`加1.  实际上发生的是这样： 为了给`freq`加1，会自动解包装，产生一个`int`类型的表达式进行计算。由于条件表达式的两个可选择表达式结果都是`int`类型，所以条件表达是本身也是`int`类型。为了把`int` 放入map中，会自动包装成一个`Integer`。

所有这些魔法的结果使得你可以几乎忽略`int`和`Integer`，带着一些欺骗。一个`Integer`对象可以是`null`。如果你的程序尝试进行自动解包装`null`，会抛出`NullPointerException`的异常。操作符`==`对`Integer`表达式进行的是引用值比较，而int表达式是进行值相等比较。最后，在包装和解包装有一些性能代价，即使这是自动的。

下面是另一个自动包装和解包装的程序示例。这是一个静态工厂，参数是`int`数组，返回一个容纳Integer的List，底层用数组实现。以下数十行代码的方法提供了一个完全丰富的List接口基于`int`数组。所有对list的修改都会作用到数组上，反之亦然。 有备注的两行是使用自动包装和解包装：



```java
// List adapter for primitive int array
public static List<Integer> asList(final int[] a) {
    return new AbstractList<Integer>() {
        public Integer get(int i) { return a[i]; }
        // Throws NullPointerException if val == null
        public Integer set(int i, Integer val) {
            Integer oldVal = a[i];  //  autoboxing 
            a[i] = val;  // unboxing
            return oldVal;
        }
        public int size() { return a.length; }
    };
}
```

产生的列表的性能很低，因为每一次`get`和`set`操作都会进行包装和解包装。对于偶尔使用已经足够快了，但对于性能重要的内部循环中使用它是愚蠢的。

所以什么时候使用自动包装和解包装？ 只有在出现基本类型和引用类型不匹配障碍的时候使用它，例如 把数字放到容器中。但不适合把自动包装和解包装用于科学计算或者其他性能敏感的数值相关的代码。 `Integer`不是用来替代`int`的;自动包装和解包装模糊了基本类型和引用类型的区别，但不会消除区别。



----

## JLS

这个部分不翻译了，比较简单；

值得注意的部分是，对常量进行自动包装时，比较小的int（-128～127）、char（\u0000~ \u007f）和boolean(true,false)的常量在自动包装之后，会产生相同（引用值相同）的包装对象。 这可能是通过缓存实现的，同时对于较大值技术上无法实现。



5.1.7. Boxing Conversion

Boxing conversion converts expressions of primitive type to corresponding expressions of reference type. Specifically, the following nine conversions are called the *boxing conversions*:

- From type `boolean` to type `Boolean`

- From type `byte` to type `Byte`

- From type `short` to type `Short`

- From type `char` to type `Character`

- From type `int` to type `Integer`

- From type `long` to type `Long`

- From type `float` to type `Float`

- From type `double` to type `Double`

- From the null type to the null type

  This rule is necessary because the conditional operator ([§15.25](https://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html#jls-15.25)) applies boxing conversion to the types of its operands, and uses the result in further calculations.

At run time, boxing conversion proceeds as follows:

- If `p` is a value of type `boolean`, then boxing conversion converts `p` into a reference `r` of class and type `Boolean`, such that `r.booleanValue() == p`
- If `p` is a value of type `byte`, then boxing conversion converts `p` into a reference `r` of class and type `Byte`, such that `r.byteValue() == p`
- If `p` is a value of type `char`, then boxing conversion converts `p` into a reference `r` of class and type `Character`, such that `r.charValue() == p`
- If `p` is a value of type `short`, then boxing conversion converts `p` into a reference `r` of class and type `Short`, such that `r.shortValue() == p`
- If `p` is a value of type `int`, then boxing conversion converts `p` into a reference `r` of class and type `Integer`, such that `r.intValue() == p`
- If `p` is a value of type `long`, then boxing conversion converts `p` into a reference `r` of class and type `Long`, such that `r.longValue() == p`
- If `p` is a value of type `float` then:
  - If `p` is not NaN, then boxing conversion converts `p` into a reference `r` of class and type `Float`, such that `r.floatValue()` evaluates to `p`
  - Otherwise, boxing conversion converts `p` into a reference `r` of class and type `Float` such that `r.isNaN()` evaluates to `true`
- If `p` is a value of type `double`, then:
  - If `p` is not NaN, boxing conversion converts `p` into a reference `r` of class and type `Double`, such that `r.doubleValue()` evaluates to `p`
  - Otherwise, boxing conversion converts `p` into a reference `r` of class and type `Double` such that `r.isNaN()` evaluates to `true`
- If `p` is a value of any other type, boxing conversion is equivalent to an identity conversion ([§5.1.1](https://docs.oracle.com/javase/specs/jls/se8/html/jls-5.html#jls-5.1.1)).

If the value `p` being boxed is an integer literal of type `int` between `-128` and `127` inclusive ([§3.10.1](https://docs.oracle.com/javase/specs/jls/se8/html/jls-3.html#jls-3.10.1)), or the boolean literal `true` or `false` ([§3.10.3](https://docs.oracle.com/javase/specs/jls/se8/html/jls-3.html#jls-3.10.3)), or a character literal between `'\u0000'` and `'\u007f'` inclusive ([§3.10.4](https://docs.oracle.com/javase/specs/jls/se8/html/jls-3.html#jls-3.10.4)), then let `a` and `b` be the results of any two boxing conversions of `p`. It is always the case that `a` `==` `b`.

Ideally, boxing a primitive value would always yield an identical reference. In practice, this may not be feasible using existing implementation techniques. The rule above is a pragmatic compromise, requiring that certain common values always be boxed into indistinguishable objects. The implementation may cache these, lazily or eagerly. For other values, the rule disallows any assumptions about the identity of the boxed values on the programmer's part. This allows (but does not require) sharing of some or all of these references. Notice that integer literals of type `long` are allowed, but not required, to be shared.

This ensures that in most common cases, the behavior will be the desired one, without imposing an undue performance penalty, especially on small devices. Less memory-limited implementations might, for example, cache all `char` and `short` values, as well as `int` and `long` values in the range of -32K to +32K.

A boxing conversion may result in an `OutOfMemoryError` if a new instance of one of the wrapper classes (`Boolean`, `Byte`, `Character`, `Short`, `Integer`, `Long`, `Float`, or `Double`) needs to be allocated and insufficient storage is available.

5.1.8. Unboxing Conversion

Unboxing conversion converts expressions of reference type to corresponding expressions of primitive type. Specifically, the following eight conversions are called the *unboxing conversions*:

- From type `Boolean` to type `boolean`
- From type `Byte` to type `byte`
- From type `Short` to type `short`
- From type `Character` to type `char`
- From type `Integer` to type `int`
- From type `Long` to type `long`
- From type `Float` to type `float`
- From type `Double` to type `double`

At run time, unboxing conversion proceeds as follows:

- If `r` is a reference of type `Boolean`, then unboxing conversion converts `r` into `r.booleanValue()`
- If `r` is a reference of type `Byte`, then unboxing conversion converts `r` into `r.byteValue()`
- If `r` is a reference of type `Character`, then unboxing conversion converts `r` into `r.charValue()`
- If `r` is a reference of type `Short`, then unboxing conversion converts `r` into `r.shortValue()`
- If `r` is a reference of type `Integer`, then unboxing conversion converts `r` into `r.intValue()`
- If `r` is a reference of type `Long`, then unboxing conversion converts `r` into `r.longValue()`
- If `r` is a reference of type `Float`, unboxing conversion converts `r` into `r.floatValue()`
- If `r` is a reference of type `Double`, then unboxing conversion converts `r` into `r.doubleValue()`
- If `r` is `null`, unboxing conversion throws a `NullPointerException`

A type is said to be *convertible to a numeric type* if it is a numeric type ([§4.2](https://docs.oracle.com/javase/specs/jls/se8/html/jls-4.html#jls-4.2)), or it is a reference type that may be converted to a numeric type by unboxing conversion.

A type is said to be *convertible to an integral type* if it is an integral type, or it is a reference type that may be converted to an integral type by unboxing conversion.



参考

https://docs.oracle.com/javase/tutorial/java/data/autoboxing.html

https://docs.oracle.com/javase/8/docs/technotes/guides/language/autoboxing.html (Enhancements in Java SE 5.0)

https://docs.oracle.com/javase/specs/jls/se8/html/jls-5.html#jls-5.1.8

https://docs.oracle.com/javase/specs/jls/se8/html/jls-5.html#jls-5.1.7

