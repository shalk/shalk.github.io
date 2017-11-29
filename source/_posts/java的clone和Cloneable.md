---
title: java的clone和Cloneable
tags: java
categories: java
toc: true
date: 2017-11-29 16:45:05
---


java中都是用引用类型（reference type）指向对象，拿到引用就可以随意修改对象。很多时候，希望能把对象传递，但是又不修改原对象。一种办法是又构造一遍对象，另一种就是克隆（clone）。

# 基础

java的克隆套路是什么呢：

所有对象的基类有中有以下方法：

```
protected native Object clone() throws CloneNotSupportedException; 
```

所有的对象虽然继承了Object，但是不能使用clone方法。

有两个原因，

一是protected方法，权限比包访问权限大，包外是无法访问的，那基本都不和Object对象一个包啊，继承它的对象可以访问本对象的clone方法。 

二是 clone方法有一个说明，必须要实现接口Cloneable，不然就抛出CloneNotSupportedException；

所以基本套路如下：

```
// Student.java
package tmp;

public class Student implements Cloneable{

    private String name;

    private int age;

    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Student student = (Student) o;

        if (age != student.age) return false;
        return name.equals(student.name);
    }

    @Override
    public int hashCode() {
        int result = name.hashCode();
        result = 31 * result + age;
        return result;
    }

    @Override
    public String toString() {
        return "Student{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}';
    }
}

```

克隆会完成产生一个几乎一样的对象，引用地址不同，Class相同即类型相同，equals比较应该相同。

测试代码

```
package tmp;

public class CloneTest {
    public static void main(String[] args) {
        try {
            Student s1 = new Student(23, "tom");
            Student s2 = (Student) s1.clone();
            testClone(s1, s2);
        } catch (CloneNotSupportedException e) {

        }
    }

    public static void testClone(Student s1, Student s2) {
        System.out.println("s1:" + s1);
        System.out.println("s2:" + s2);
        System.out.println("测试s1 == s2:" + (s1 == s2));
        System.out.println("测试s1.getClass()== s2.getClass():" + (s1.getClass() == s2.getClass()));
        System.out.println("测试s1.equasl(s2):" + s1.equals(s2));

    }
}

```

结果如下：

```
s1:Student{name='tom', age=23}
s2:Student{name='tom', age=23}
测试s1 == s2:false
测试s1.getClass()== s2.getClass():true
测试s1.equasl(s2):true
```

由于java在override的协变特性，即返回值可以是基类的子类。 

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
改成

```
@Override
public Student clone() throws CloneNotSupportedException {
    return (Student)super.clone();
}
```

那么测试部分可以直接使用`Student s2 =  s1.clone();`

# 进一步

Student对象的域是基本类型和String，String是对象，对于上面的例子，s1克隆产生了另外一个Student对象，s1.name 指向了String对象， s2.name 也指向String对象，s1.name和s2.name是不是同一个对象呢。

进行测试：

把`private String name`改成`public String name`

```
System.out.println("测试s1.name == s2.name:" + (s1.name == s2.name));
```

结果如下：

```
测试s1.name == s2.name:true
```

是同一个对象，也就是说Student的克隆，没有给相关的成员变量进行克隆。

我们把java自带的clone称之为**浅拷贝**.

如果要把相关的成员变量（对象）都进行拷贝，而且成员对象可能还有对象，成为**深拷贝**



对于上面的那个问题，我们可以采取简单的补救办法，我们希望s1.name 和s2.name是不同的对象。

```
    // Student.java
    @Override
    public Student clone() throws CloneNotSupportedException {
        Student s = (Student)super.clone();
        s.name = new String(s.name);
        return s;
    }
```

注：由于String不可变性，这个例子不是十分恰当。

对于更一般的问题，还有其他的办法。

1. 利用serializable 接口，把对象完整序列化后，再恢复一个完全相同的对象。
2. 拷贝构造，也就是手动构造一遍。
3. 各种类库，基本按照上面两个办法来做。（例如[ BeanUtils.cloneBean(object)](http://commons.apache.org/beanutils/v1.8.2/apidocs/org/apache/commons/beanutils/BeanUtils.html)， [SerializationUtils.clone(object)](http://commons.apache.org/lang/api/org/apache/commons/lang/SerializationUtils.html)， https://code.google.com/p/cloning/ ）

# serializable

准备一个简单对象，并实现Seriablizable接口, 自动生成构造器，toString， hashcode和equals

```
package tmp;

import java.io.Serializable;

public class Student1 implements Serializable {

    public String name;

    private int age;


    public Student1(int age , String name) {
        this.name = name;
        this.age = age;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Student1 student = (Student1) o;

        if (age != student.age) return false;
        return name.equals(student.name);
    }

    @Override
    public int hashCode() {
        int result = name.hashCode();
        result = 31 * result + age;
        return result;
    }

    @Override
    public String toString() {
        return "Student{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}';
    }
}

```

编写测试代码，实现了Serializable 接口的对象，可以用ObjectInputStream和ObjectOutputStream进行读写。

```
package tmp;

import java.io.*;

public class CloneTest {
    public static void main(String[] args) {
        try {
            testClone2();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    public static void testClone2() throws IOException, ClassNotFoundException {
        Student1 s1 = new Student1(10,"robot1");
        System.out.println(s1);
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("d:/test.txt"));
        oos.writeObject(s1);
        oos.close();
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream("d:/test.txt"));
        Student1 s2 = (Student1) ois.readObject();
        ois.close();
        testEqual(s1, s2);
    }

    public static void testClone1() {
        try {
            Student s1 = new Student(23, "tom");
            Student s2 = s1.clone();
            testEqual(s1, s2);
            System.out.println("测试s1.name == s2.name:" + (s1.name == s2.name));
        } catch (CloneNotSupportedException e) {

        }
    }

    public static void testEqual(Object s1, Object s2) {
        System.out.println("s1:" + s1);
        System.out.println("s2:" + s2);
        System.out.println("测试s1 == s2:" + (s1 == s2));
        System.out.println("测试s1.getClass()== s2.getClass():" + (s1.getClass() == s2.getClass()));
        System.out.println("测试s1.equasl(s2):" + s1.equals(s2));
    }
}

```

测试结果：

```
Student{name='robot1', age=10}
s1:Student{name='robot1', age=10}
s2:Student{name='robot1', age=10}
测试s1 == s2:false
测试s1.getClass()== s2.getClass():true
测试s1.equasl(s2):true
```

可以看到可以克隆出一个新的对象，进一步我们可以调整一下可以把TestClone2 写成一个静态的泛型方法。

```java
 public class CloneTest {
    public static void main(String[] args) {
        testClone3();
    }

    public static void testClone3() {
        Student1 s1 = new Student1(12,"jerry");
        Student1 s2 = myclone(s1);
        testEqual(s1, s2);
    }
    public static <T> T myclone(T o) {
        ObjectOutputStream oos = null;
        ObjectInputStream ois = null;
        try {
            oos = new ObjectOutputStream(new FileOutputStream("d:/test.txt"));
            oos.writeObject(o);
            oos.close();

            ois = new ObjectInputStream(new FileInputStream("d:/test.txt"));
            return  (T) ois.readObject();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } finally {
            if( oos != null)
                try {
                    oos.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            if (ois != null)
                try {
                    ois.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
        }
        return null;
    }
    //....
}
```



显然这里面有一个问题，d:/test.txt，不合适， 我们可以把这个变量存到内存里。

使用ByteArrayOutputStream()和ByteArrayInputStream() 

修改后的静态方法如下

```
public static <T> T myclone(T o) {
        ObjectOutputStream oos = null;
        ObjectInputStream ois = null;
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            oos = new ObjectOutputStream(baos);
            oos.writeObject(o);
            oos.flush();
            oos.close();

            ois = new ObjectInputStream(new ByteArrayInputStream(baos.toByteArray()));
            return  (T) ois.readObject();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } finally {
            if( oos != null)
                try {
                    oos.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            if (ois != null)
                try {
                    ois.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
        }
        return null;
    }
```

# 类库

除了基本的使用，大部分时候有很多库可以选择，下面列出几个主流的

## 类库1 Commons BeanUtils

org.apache.commons.beanutils类 BeanUtis下的方法

```
static Object	cloneBean(Object bean)
Clone a bean based on the available property getters and setters, even if the bean class itself does not implement Cloneable.
```

这个是基于get和set的方法，是一个浅拷贝

## 类库2 Commons Lang

org.apache.commons.lang3类SerializationUtils下的方法

```z
static <T extends Serializable>  T clone(T object)
```

这是一个深拷贝，需要实现Serializable接口

## 类库3 [Java Deep Cloning Library](https://github.com/kostaskougios/cloning/)

```
Cloner cloner=new Cloner();

MyClass clone=cloner.deepClone(o);
// clone is a deep-clone of o
```

google的库，是深拷贝，使用反射的方法，不用Serializable

## 类库4 Spring BeanUtils

org.springframework.beans 类BeanUtils的方法

```
static void	copyProperties(Object source, Object target) 
```



## 类库5 Dozer

```
public MyGraph deepCopy() {
    final DozerBeanMapper mapper = new DozerBeanMapper();
    final QuicksortTest clone = mapper.map(this, MyGraph.class);
    return clone;
}
```



## 类库6 cglib

cglib使用的是动态代理即使，会在运行时产生字节码。有一个包叫做BeanCopier

其他：

Orika ，

有很多是针对javabean对象进行拷贝的库，太多了。

类库JSON系列，转换成JSON对象，再转换回来，不过这样效率肯定很低。

# 测试

使用以下上述6个类库，创建一个maven项目，添加依赖，逐一写一个例子。

浅拷贝: Commons BeanUtils,  Spring BeanUtils;

深拷贝：Commons Lang,  Java DeepCloning Library, Dozer, cglib;

```
package com.xshalk;

import org.apache.commons.beanutils.BeanUtils;

import java.lang.reflect.InvocationTargetException;

public class CloneTest1 {
    public static void test1() {
        Student s1 = new Student("Lily", 23);
        Student s2 = null;
        try {
            s2 = (Student) BeanUtils.cloneBean(s1);
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InstantiationException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        }
        compare(s1, s2);
    }

    public static void compare(Object o1, Object o2) {
        System.out.println("o1:" + o1);
        System.out.println("o2:" + o2);
        System.out.println("o1==o2:" + (o1 == o2));
        System.out.println("o1.equals(o2)" + (o1.equals(o2)));

    }
    public static void main(String[] args) {
        test1();
    }
}

```

**Commons BeanUtils的cloneBean 会调用默认构造函数**，所以对象需要有一个默认构造。

```
    public static void test2() {
        Student s1 = new Student("Lily", 23);
        Student s2 = new Student();
        org.springframework.beans.BeanUtils.copyProperties(s1, s2);
        compare(s1, s2);
    }
```

Spring的copyProperties这个需要目标对象已经创建出来。

实际上，BeanUtils 也有至少两类copyProperties方法，在类BeanUtils和PropertyUtils中，



BeanUtils.copyProperties 和 PropertyUtils.copyProperties  主要不同是：

PropertyUtils对于相同名称的属性，需要类型相同。

PropertyUtils支持为null，BeanUtils部分支持。



Spring.BeanUtils.copyProperties和Apache.BeanUtils.copyProperties主要不同是：

Apache的检查比较复杂，Spring的检查比较简单宽松。



下面看深拷贝

```

    public static void test3() {
        Student s1 = new Student("Lily", 23);
        Student s2 = null;
        Cloner cloner = new Cloner();
        s2 =  cloner.deepClone(s1);
        compare(s1, s2);
    }
```

Java Deep Clone写法很简单。

调整一下，Student实现Serializable接口，覆盖clone防范。

```
    @Override
    public Student clone() throws CloneNotSupportedException {
        return (Student) super.clone();
    }
    
```

编写测试类

```
   public static void test4() {
        Student s1 = new Student("Lily", 23);
        Student s2 = null;
        s2 = SerializationUtils.clone(s1);
        compare(s1, s2);
   }
```

Dozer这个库一开始托管在sf上，在2014年停止了更新，迁移到github上，maven的groupid修改了，使用新版本参考以下

```
    <!-- https://mvnrepository.com/artifact/com.github.dozermapper/dozer-core -->
    <dependency>
      <groupId>com.github.dozermapper</groupId>
      <artifactId>dozer-core</artifactId>
      <version>6.1.0</version>
    </dependency>
```

文档参考gitbook[这里](https://dozermapper.github.io/gitbook/)

>   Dozer is a Java Bean to Java Bean mapper that recursively copies data from one object to another. Typically, these Java Beans will be of different complex types.

dozer这库可以从一个对象往另外一个对象递归拷贝数据。

```
    public static void test5() {
        Student s1 = new Student("Lily", 23);
        Student s2 = null;
        Mapper mapper = DozerBeanMapperBuilder.buildDefault();
        s2 = mapper.map(s1, Student.class);
        //      Student s2 = new Student("Lucy", 24);
        //      mapper.map(s1, s2);
        compare(s1, s2);
    }
```

会有警告, 这里没有给出一个Logger实现，可以考虑logback和本文无关。

```
SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See http://www.slf4j.org/codes.html#StaticLoggerBinder for further details.
```

这里我们把Student的默认构造函数删除掉，Dozer是会报错的,而Java Deep Clone 和 SerializationUtils 不会报错。

最后看一下cglib这个库

```
    public static void test6() {
        BeanCopier copier = BeanCopier.create(Student.class, Student.class, false);
        Student s1 = new Student("Lily", 23);
        Student s2 = null;
        copier.copy(s1, s2, null);
        compare(s1, s2);
    }
```

会发生报错，需要手动把s2对象先new出来。

```
 Student s2 = new Student("Lucy", 24);
```

# 性能

不严格测试

```
                                                       Dozer 	 180374700
                             Spring BeanUtils.copyProperties     126851800
                                                       cglib 	 68666783
               Apache Commons BeanUtils  BeanUtils.cloneBean 	 74023814
                     Apache Commons BeanUtils.copyProperties 	 1439208
                 Apache Common Lang SerializationUtils.clone 	 21098247
                                         Java Deep Clone Lib 	 22209949
        Apache Common BeanUtils PropertyUtils.copyProperties 	 564938
```



# 总结

| 方法名                                      | 说明                                       |
| ---------------------------------------- | ---------------------------------------- |
| ~~DIY1~~                                 | 实现Cloneable并且clone，浅拷贝                   |
| ~~DIY2~~                                 | 实现Serializable, 配合ArrayByteOutputStream深拷贝 |
| DIY3                                     | 手动创建对象，并get/set, 深拷贝                     |
| ~~Commons BeanUtils cloneBean~~          | 浅拷贝,调用默认构造，不用先创建目标对象。                    |
| Commons BeanUtils PropetyUtils.copyProperties | 浅拷贝, 要手动创建目标对象，检查严格。相同名称的域，类型一致          |
| Commons BeanUtils BeanUtils.copyProperties | 浅拷贝,要手动创建目标对象，检查严格。相同名称的域，类型可以不一致        |
| Spring BeanUtils       BeanUtils.copyProperties | 浅拷贝,要手动创建目标对象，检查松。                       |
| Commons SerializationUtils  SerializationUtils.clone | 深拷贝，基于Serializable，不用先创建目标对象。            |
| Java Deep Cloning Lib（JDCL）              | 深拷贝，不用创建目标对象，不基于Serializable，貌似基于反射      |
| Dozer                                    | 深拷贝，基于get/set，可以不先创建对象，但是要有默认构造函数。       |
| cglib                                    | 深拷贝，需要先创建目标对象。                           |
|                                          |                                          |
|                                          |                                          |



当我们需要拷贝的时候如何选择呢：

有两个原则：

1.  目标对象和当前对象是否相同类型，我们认为是一个克隆（选择JDCL, SerializationUtils），否则我当作一个bean拷贝(BeanUtil, Dozer, cglib, Orika)。
2.  能用库，尽量用库。

相同类型的克隆（一般逻辑）

1. 简单对象的拷贝，用DIY3
2. 复杂对象的深拷贝，实现了Serializable用  Commons Lang的SerializationUtils, 没实现的用 JDCL
3. 复杂对象的浅拷贝，可以选择Commons BeanUtils，类型相同用PropertyUtil,类型不同用BeanUtil；如果已经用Spring框架，可以考虑Spring BeanUtils 

如果不同类型的拷贝(常见于业务)

1. 浅拷贝，Commons BeanUtils
2. 深拷贝，Dozer （我暂时用这个，性能很差啊），或者找性能更好的选择cglib（Spring 也封装cglib），或者Orika（据说很好用）.



# 代码

https://git.coding.net/shalk/beantest.git



# 参考

https://stackoverflow.com/questions/2156120/java-recommended-solution-for-deep-cloning-copying-an-instance

https://www.javatpoint.com/object-cloning

http://javatechniques.com/blog/faster-deep-copies-of-java-objects/

http://kentkwan.iteye.com/blog/739514

https://docs.oracle.com/javase/8/docs/api/java/lang/Cloneable.html

https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html#clone()

http://www.baeldung.com/apache-commons-beanutils

http://caoyaojun1988-163-com.iteye.com/blog/1871316

https://github.com/cglib/cglib/wiki/Tutorial#bean-copier



# END