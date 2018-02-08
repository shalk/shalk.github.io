---
title: java编程思想笔记-第20章注解
tags:
  - java
  - tij
categories: java
toc: true
date: 2018-02-08 14:17:48
---


在编写单元测试，编写spring项目，编写jpa的实体类时，经常要写@Test ，@Table @Service @Autowired 这样的注解，只知道什么时候写什么，那注解作为java的语法，如何编写自己的注解，如何使用。 spring框架，hibernate， junit这些框架是如何利用这些注解进行了一些便利的操作。

## 常见的注解

考虑一个实体类，在使用hibernate时这是非常常见的。

```
@Entiy
@Table("user")
class User implements Serializable {
    
    private static final long serialVersionUID = -7348802315403048877L;

    @Column
    private String name;
  
    @Id	
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;
	...
}

```

这个例子中，@Column  @Table 都是注解，这些注解是作用于方法或者类 。

## 自定义注解

如果创建一个自己的注解呢，参考这些注解的源码，写法如下

```
//UseCase.java

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD,ElementType.TYPE, ElementType.FIELD, ElementType.PARAMETER, ElementType.CONSTRUCTOR,ElementType.PACKAGE, ElementType.LOCAL_VARIABLE, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Inherited  
@Documented  
public @interface UseCase {

    public int id();
    public String description() default "no description";
}
```

整体格式如下：

```
@Target(取值)
@Retention(取值)
@其他可选注解
public @interface 名称 {
  域；
}
```

说明：

这个@interface 代表是一个注解，上面必须要写两个额外的注解，

@Target

 代表这个注解可以写在那些地方，例如 类，方法，域，参数，包，构造器， 局部变量，注解等 ，最常见的是类，方法，域。

可以改变这个值尝试一下，并不一一介绍。

其中包的那个值是写在java-info.java里，这个文件是给javadoc使用的，并不是很常见。

@Retention

注解保留多久，仅在源码中、仅在class文件中、运行时。

@Inherited  @Documented  这两个注解是可选的，前者代表，使用了这个的注解，注释类A之后，B继承了A，利用反射查询B的注解可以查询到注解，如果没有使用@Inherited，就查询不到。后者表示，加注解的地方生成javadoc的时候把注解也显示出来。

UseCase可以有多个域，域只可以是

- 基本类型
- String
- enum
- Class类型
- 注解
- 以上所有类型的数组

这些域是可以有默认值。

在使用注解的时候，用法基本如下：

```
形式1：@Test1(id=1,name="aaa")

形式2：@Test2

形式3：@Test3(f={1,2,3})

形式4：@Table("aaaa")
```

没有值的，域必须复制。（形式1）

而且要写成 key=value 的形式，如果是数组,value要写成{}。（形式3）

如果没有域，或者域都有默认值，可以不写后面的括号。（形式2）

如果只有一个域没有默认值，可以直接写value，不用写key=1 （形式4）



上面限制颇多，主要围绕几点：

1.  注解的使用范围
2.  注解的保留范围
3.  注解的域
4.  写法

这些限制，大部分在编译阶段就能检查到，也不用特别担心。

## 运行时解析

自定义注解类写好后，把注解可以加到我们的类中，例如

```
package com.xshalk.springdemo;
// TestCase.java

@UseCase(id=3, description = "this is also type")
enum Enum1 {
    AA, BB;
}

@UseCase(id=5, description = "this is type")
public class TestCase {

    @UseCase(id=6,description = "this is field")
    public static final int count = 10;

    private Enum1 AA;

    @UseCase(id=3,description = "this is constructor")
    TestCase(){

    }

    @UseCase(id = 1, description = "this is method")
    public void case1(
            @UseCase(id=7,description = "this is parameter") String s1,
            int i1) {

        @UseCase(id=13, description = "this is local variable")
        int i = 10;
        i = i + 1;
        System.out.println(i);
    }

    @UseCase(id = 2, description = "this is also method")
    public void case2() {

    }
}

```

用另外一个类来解析一部分注解：

```
import java.lang.reflect.Method;

public class UseCaseTracker {

    public static void printUseCaseAnnotaion(Class<?> cl) {
        UseCase case1 = cl.getAnnotation(UseCase.class);
        if (case1 != null){
            System.out.println("打印类注解：");
            printU(case1);
        }

        System.out.println("打印方法注解：");
        for (Method m : cl.getMethods()) {
            UseCase tmpu = m.getAnnotation(UseCase.class);
            if (tmpu != null){
                System.out.println("方法名:" + m.getName());
                printU(tmpu);
            }
        }
    }

    private static void printU(UseCase u) {
        System.out.println("id:" + u.id() + "  description:" + u.description());
    }

    public static void main(String[] args) {
        printUseCaseAnnotaion(TestCase.class);
    }
```

Class和Method的getAnnotation方法来读取。

这种方式只能读取，保留范围是运行时的。

## 编译时解析

java从1.6开始提供了一套api用于创建自定义的注解解析器，api文档见[这里](https://docs.oracle.com/javase/7/docs/api/javax/annotation/processing/package-summary.html)。

在编译期间，处理注解，这些注解一般把target设置成source。

目前只要按照api文档，实现abstractProcessor, 打成jar包，编译使用注解的类时，把jar加到classpath中，这样javac 加上-processor选项，就会在编译阶段调用processor。

详细见(http://hannesdorfmann.com/annotation-processing/annotationprocessing101)

这篇文章给出了一个实例源码，介绍较为详细，总结如下：

分成以下几个步骤：

1.  在process读取到env的时候，查询所有使用特定注解的element
2. 校验这个element是否满足条件，注解参数是否齐全。
3. 把信息都查询并封装到 对象里。
4. 使用对象生成 java源文件。（这里可以用库square/javaWriter 来生成源码)

需要注意的是：

1. 异常捕获，不要把堆栈抛出去
2. 使用messager打印信息
3. 使用elements和types静态工具类，在正确使用javax.lang.model
4. 考虑process多回合处理的情况，处理完之后要清理一下上回合的信息。



## 其他

在此之前，sun提供了apt库，不推荐继续用。

另外也可以使用javaassist的库读取class文件，然后反射可以读取到注解





TODO

查看lomok的源码 ,Spring的源码。

参考

https://alexecollins.com/java-annotation-processor-tutorial/

https://www.race604.com/annotation-processing/

https://stackoverflow.com/questions/21544446/how-do-you-dynamically-compile-and-load-external-java-classes

http://blog.csdn.net/duo2005duo/article/details/50541281

https://github.com/bozaro/example-annotation-processor