---
title: [JDK源码阅读]String
toc: true
date: 2018-03-22 15:55:58
tags:
categories: java
---



String 可以代表字符串，在代码中的字符串常量，如"abc", 实现上都是String类的实例。

String是常量，是不可变的，线程安全的。如果需要可变的字符串，可以使用StringBuffer。

String str = "abc" 等价于

```
char data[] = {'a', 'b', 'c'};
String str = new String(data);
```

下面还有一些常见用法

```
System.out.println("abc");
String cde = "cde";
System.out.println("abc" + cde);
String c = "abc".substring(2,3);
String d = cde.substring(1, 2);
```

String 类中包括一些方法：检查单个字符序列，比较字符串，搜索字符串，截取子串，创建当前串转换成大小的拷贝。（大小写转换是基于Unicode标准版本的Character类）

java语言对String这个类有特殊的优待，一方面支持+操作符进行字符串连接，另一方面支持对象转换成String（因为Object类有一个toString方法，所有的对象都继承Object类，都有toString方法）。

如果没有特别注明，String类中的所有方法，如果参数为null，会直接抛出NullPointException.

在语义上，String代表一个UTF-16格式的字符串。

```
A String represents a string in the UTF-16 format in which supplementary characters are represented by surrogate pairs (see the section Unicode Character Representations in the Character class for more information). Index values refer to char code units, so a supplementary character uses two positions in a String.

The String class provides methods for dealing with Unicode code points (i.e., characters), in addition to those for dealing with Unicode code units (i.e., char values).
```

这里面有一些编码方面术语，如果不清楚UTF-16和这些术语，就很难明白字符和字符串是怎么保存的。看完原理介绍就明白，上面这一段的。

## 原理简介



----



Unicode对各种字符进行了编码，也就是把单个字符映射成了一长串二进制。

UTF-16 是Unicode的一种编码实现，是一种变长的编码，用2个字节或者4个字节表示1个字符。

（可能有人要问为啥不直接按照Unicode编码所有字符，并直接保存，因为这样不经济很浪费字节。）

Unicode字符分为17组，U+0000到U+10FFFF, 每组被称为 平面（plane), 每个平面拥有 65536个码位（code Point），共1114112。

第一个平面称为**基本多语言平面**（Basic Multilingual Plane, **BMP**），或称第零平面（Plane 0），范围是U+0000到U+FFFF。（大部分常用字符都在这个平面内）

那UTF-16是如何编码的呢， 在BMP中，U+D800到U+DFFF之间的码位是永久保留的。 UTF-16巧妙的利用了这个空缺。

编码的详细描述如下：

```
1. 如果字符在U+0000到U+D7FF 或者  U+E000到U+FFFF之间。
   字符会直接映射，编码成16比特长的单个码元。
   例如$ 字符的Unicode为U+0024 ,在这个范围内，UTF-16 二进制码元为 0000 0000 0010 0100
   字符编码为0x0024
   
2. 如果字符在辅助平面即 U+10000到U+10FFFF时。
   2.1 码位减去0x10000,得到的值的范围为20比特长的一个字，范围0x0~0xFFFFF. 
   2.2 高位10比特范围(0~ 0x3FF) 加上0xD800 得到第一个码元，又称为高位代理(high surrogate),范围是0xD800~0xDBFF。
   2.3 低位10比特范围(0~ 0x3FF) 加上0xDC00 得到第二个码元，又称为低位代理(low surrogate),范围是0xDC00~0xDFFF。
   经过计算，辅助平面内的字符会编码成32比特长的两个码元。
   
```

值得注意的是，高位代理，低位代理以及BMP中的码位，是不重叠的。这是的UTF16具有自同步的性质，编码非常轻松。

例如U+10437编码（𐐷）:

- 0x10437减去0x10000,结果为0x00437,二进制为0000 0000 0100 0011 0111。
- 分区它的上10位值和下10位值（使用二进制）:0000000001 and 0000110111。
- 添加0xD800到上值，以形成高位：0xD800 + 0x0001 = 0xD801。
- 添加0xDC00到下值，以形成低位：0xDC00 + 0x0037 = 0xDC37。

最终编码为0xD801DC37。

UTF-16在存储或者通讯的时候，还涉及到大尾端和小尾端的问题（一个单元的直接顺序）。通常X86的笔记本和linux都是小尾端的架构，写内存都是小尾端。对于UTF-16而言，就是一个码元的字节顺序。

```
例如 字符$	的Unicode 编码是U+0024，UTF-16的码元是0000 0000 0010 0100
     十六进制是0x0024， 如果是UTF-16BE 就是顺序不变，如果是UTF-16LE 就是0x2400 
```

----

我们再来看前面那段话：

```
A String represents a string in the UTF-16 format in which supplementary characters are represented by surrogate pairs (see the section Unicode Character Representations in the Character class for more information). Index values refer to char code units, so a supplementary character uses two positions in a String.
String代表UTF-16格式的字符串，辅助平面的字符用代理对表示。索引是字符 码元，所以辅助平面字符使用两个位置。

The String class provides methods for dealing with Unicode code points (i.e., characters), in addition to those for dealing with Unicode code units (i.e., char values).
String类提供了一些方法用于处理Unicode码位，并且提供了一些方法处理码元。
```



结构简介(structure)

类原型

```
public final class String
    implements java.io.Serializable, Comparable<String>, CharSequence {
```

Serializable是序列化，Comparable 是比较，CharSequence代表是一串可读的char 的值。 

```
public interface CharSequence {

    int length();

    char charAt(int index);

    CharSequence subSequence(int start, int end);

    public String toString();

    public default IntStream chars() {
    ... 
    }

    public default IntStream codePoints() {
      ...
    }
}
```

一些域

```
private final char value[];
private int hash;
private static final long serialVersionUID = -6849794470754667710L;
private static final ObjectStreamField[] serialPersistentFields =
        new ObjectStreamField[0];
        
public static final Comparator<String> CASE_INSENSITIVE_ORDER
                                         = new CaseInsensitiveComparator();
```

serialVersionUID和 serialPersistentFields 都是序列化相关的，根据文档String的序列化做了特殊处理，这里忽略掉。 所有的数据都存放在` char value[]`中， hash是缓存的hashcode。CASE_INSENSITIVE_ORDER 是`public`的，内部实现的一个字符串比较器，忽略大小写的情况下，比较字符串。

方法部分，String大概有六十多个方法。



## 数据结构

String的数据结构非常简单，char value[] 数组来保存，由于String的不可变，但String构造完成后，数组的长度就是固定的，不会进行resize或者shrink。

## 核心算法

没有什么复杂的算法。

## 源码剖析



```
按照索引找码元，也就是16bit的单元；
  public char charAt(int index) {
        if ((index < 0) || (index >= value.length)) {
            throw new StringIndexOutOfBoundsException(index);
        }
        return value[index];
    }
```

```
按照索引找码位，返回的是一个完整的字符的UTF-16编码值。
public int codePointAt(int index) {
    if ((index < 0) || (index >= value.length)) {
        throw new StringIndexOutOfBoundsException(index);
    }
    return Character.codePointAtImpl(value, index, value.length);
}
```

可以使用用下面代码进行测试(String 是先保存代理对的高位，再存代理对的低位)：

```
String s="a𐐷";
System.out.println(s.charAt(0));
System.out.println(s.codePointAt(0));
System.out.println(s.charAt(1));
System.out.println(s.codePointAt(1));
System.out.println(s.length());
```

因此之后的许多操作，需要判断一个字符是占一个char还是两个char。

String的char[] value是不可变的，可以用getChars 获得char[] 

```
    public void getChars(int srcBegin, int srcEnd, char dst[], int dstBegin) {
        if (srcBegin < 0) {
            throw new StringIndexOutOfBoundsException(srcBegin);
        }
        if (srcEnd > value.length) {
            throw new StringIndexOutOfBoundsException(srcEnd);
        }
        if (srcBegin > srcEnd) {
            throw new StringIndexOutOfBoundsException(srcEnd - srcBegin);
        }
        System.arraycopy(value, srcBegin, dst, dstBegin, srcEnd - srcBegin);
    }
```

String 也可以转byte[]，以前是直接把char[]强转byte[],  由于byte只有8bit，char有16bit，丢失高8位。

新转换是用StringCoding根据编码字符集进行编码，

```
    public byte[] getBytes(Charset charset) {
        if (charset == null) throw new NullPointerException();
        return StringCoding.encode(charset, value, 0, value.length);
    }
      public byte[] getBytes() {
        return StringCoding.encode(value, 0, value.length);
    }
```

String Equals方法就是比较char[] 数组；除此之外有一个contentEquals 和 equalsIgnoreCase 用于字符串比较。

```
contentEquals  就是兼容 CharSequence  StringBuffer StringBuilder 的一个比较接口。
equalsIgnoreCase 调用了一个 区域匹配的方法
 public boolean regionMatches(boolean ignoreCase, int toffset,
            String other, int ooffset, int len) {
        char ta[] = value;
        int to = toffset;
        char pa[] = other.value;
        int po = ooffset;
        // Note: toffset, ooffset, or len might be near -1>>>1.
        if ((ooffset < 0) || (toffset < 0)
                || (toffset > (long)value.length - len)
                || (ooffset > (long)other.value.length - len)) {
            return false;
        }
        while (len-- > 0) {
            char c1 = ta[to++];
            char c2 = pa[po++];
            if (c1 == c2) {
                continue;
            }
            if (ignoreCase) {
                // If characters don't match but case may be ignored,
                // try converting both characters to uppercase.
                // If the results match, then the comparison scan should
                // continue.
                char u1 = Character.toUpperCase(c1);
                char u2 = Character.toUpperCase(c2);
                if (u1 == u2) {
                    continue;
                }
                // Unfortunately, conversion to uppercase does not work properly
                // for the Georgian alphabet, which has strange rules about case
                // conversion.  So we need to make one last check before
                // exiting.
                if (Character.toLowerCase(u1) == Character.toLowerCase(u2)) {
                    continue;
                }
            }
            return false;
        }
        return true;
    }
```

这个方法灵活的解决，匹配部分串的问题。按说，startWith和endsWith 都可以调用这个方法，不过这两个方法都用自己的代码。

```
 public boolean startsWith(String prefix, int toffset) 
```



IndexOf 是常用方法，寻找某个字符或者字符串；这里的`int ch` 指的是utf-16编码的值，通常我们用BMP内的字符， 也感觉不出来。

```
public int indexOf(int ch);
public int indexOf(int ch, int fromIndex)
//循环，比较；

public int indexOf(String o);
public int indexOf(String o, int fromIndex)
// 暴力搜索匹配，据说一般小型的字符串比一些高级的算法效率更高，而避免了大量预处理的时间。

```

lastIndexOf 也是类似实现。

subString 就是用构造函数重新构造。

concat 这个类似于`+` 操作

contains 的实现是用indexOf。

```
    public boolean contains(CharSequence s) {
        return indexOf(s.toString()) > -1;
    }
```

replace 如果只是char替换, 是循环实现，如果是String，都是用的正则引擎java.util.regex.Pattern

```java
public String replace(CharSequence target, CharSequence replacement) {
	return Pattern.compile(target.toString(), Pattern.LITERAL).matcher(
	this).replaceAll(Matcher.quoteReplacement(replacement.toString()));
    } 
    
public String replaceFirst(String regex, String replacement) {
    return Pattern.compile(regex).matcher(this).replaceFirst(replacement);
}
    

public String replaceAll(String regex, String replacement) {
    return Pattern.compile(regex).matcher(this).replaceAll(replacement);
}
```

matches 也是用的java.util.regex.Pattern

```java
public boolean matches(String regex) {
    return Pattern.matches(regex, this);
} 
```

 split 也是用了java.util.regex.Pattern ，不过位于regex是一个字符或者让两个字符的部分情况做了优化。

```
public String[] split(String regex, int limit) {
	。。。。
}
public String[] split(String regex) {
        return split(regex, 0);
}
```

这个limit分3种情况:

1. 正，结果的上限。
2. 负，不限制
3. 0，不限制，但是会去掉结尾的"" 长度为0的字符串。

以前String的split有一点bug:

```
以前:
String s = "abc";
s.split(""); 结果是 ["", "a", "b", "c"]
其实这是一种0宽匹配，

1.8以后
 结果是["a", "b", "c"]
```

String 提供了静态的join方法，都是利用java.util.StringJoiner 进行拼接。

```
public static String join(CharSequence delimiter, CharSequence... elements) {
}
public static String join(CharSequence delimiter,
            Iterable<? extends CharSequence> elements) {
```

为什么不for循环，直接`+` 呢， 因为`+` 操作性能低，为什么不使用StringBulder 呢?

StringJoiner就是对StringBulder 进行组合操作；而且延迟获得结果，增加了灵活的前缀和后缀,而且链式编程。

例如我们需要[a,b,c];

```
StringJoiner joiner = new StringJoiner(",","[","]");
System.out.println(joiner.add("a").add("b").add("c"));
```

toLowCase 和toUpperCase 实现十分复杂, 主要是利用 Character的 toLowerCase 和toUpperCase 方法。

但是根据Locale（本地化）的不同有不少特殊情况。代码中做了一些优化，先判断是否存在需要变成大写或者小写的字符，如果不存在直接返回this；如果确实需要转换，那就从查询到第一个要转换的字符开始，进行条件判断，之后按照UTF-16编码字符进行遍历。令人感到神奇的是，有一些情况下，转换大小写会使得 value数组变大。  

```
ConditionalSpecialCasing 用于处理特殊情况的字符
CharacterData 的子类 用于处理常规的字符
```

trim 方法，字面理解是删除字符串开头结尾的空格。实际上是删除开头结尾，小于等于`0020` 的字符。

```
   public String trim() {
        int len = value.length;
        int st = 0;
        char[] val = value;    /* avoid getfield opcode */

        while ((st < len) && (val[st] <= ' ')) {
            st++;
        }
        while ((st < len) && (val[len - 1] <= ' ')) {
            len--;
        }
        return ((st > 0) || (len < value.length)) ? substring(st, len) : this;
    }

```

format 静态方法给人语法糖的感觉。

```
    public static String format(String format, Object... args) {
        return new Formatter().format(format, args).toString();
    }
```

还有ValueOf 是一系列其他类型转String的方法。

```
基本类型转基本用自己的包装类中的toString方法，
其他转换通常用构造器，例如char[] 转String是利用String的构造器
  
```



## 小结

String 作为最常使用的类，使用final char[] 来实现，十分简单。

String的实现需要了解UTF-16编码的细节。

String的部分功能依赖于正则引擎。

String的很多操作使用了Character中的方法。

## 参考

https://zh.wikipedia.org/wiki/UTF-16

http://www.unicode.org/versions/Unicode10.0.0/

https://docs.oracle.com/javase/8/docs/platform/serialization/spec/protocol.html#a8299

https://docs.oracle.com/javase/8/docs/platform/serialization/spec/output.html#a933