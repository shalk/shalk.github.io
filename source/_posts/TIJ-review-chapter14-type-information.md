---
title: TIJ review chapter14 type information
date: 2017-06-09 11:03:15
tags: [java,tij]
categories: java
toc: true
---
# TIJ 复习 RTTI

## QA

1. 什么是RTTI

runtime type information，这个概念,java已经实现,  java 允许使用类或对象的类型信息，在运行的时候。

2. RTTI可以做什么

RTTI可以解决，例如 运行时转换成正确的类型。

3. 传统的RTTI和反射由什么区别

RTTI有三种使用方式，

1.（TYPE） 类型转换   2. 获得Class对象，进行操作 3. instanceof 

 而 relection 使用 Class类和java.lang.relection.*  进行一系列操作,

## Skeleton

### 为什么需要RTTI

`运行时,识别对象的类型` : 通过`List<Shape>` 放入不同对象,来说明, 虽然泛型会磨掉具体类型,以Object放入List中,由于RTTI的存在, 可以确定对象的类型,使得对象不丢失类型,正常的取出来.

### Class对象

每一个类都可以有且只有一个Class对象,获取方式

`Class.forName("className")`

也可以是literal 

```
java.lang.String.class
Shape.class
```

Class 对象可以泛化,

```
Class<String> c = Class.forName("java.lang.String");
```

*泛化可以用于编译时检查*,确保使用正确类型的Class对象.

当然还可以使用通配符

可以用`Class<String>.cast()` 进行转型,不过很少人用.

关于Class创建的过程有以下三个步骤

```
1. 加载   寻找class文件,加载到内存中
2. 链接   检查字节码,给静态变量分配空间
3. 初始化  执行静态初始化器和静态初始化块
```

### 类型转换前先做检查

这里举了一个`creater`和`counter`的例子

即 随机创建一些宠物, 并对宠物按照类型进行统计.

优化分几个阶段:

```
1. 创建一个creater的抽象类, 继承抽象类, 把所有宠物的class对象用classForName的方式放到 Namecreater里
   最后用instanceof按照顺序进行counter
2. 用.class的方式, 重写了creater, 并且创建了一个工具类Pets 使用这个final 静态creater
   最后用instanceof方式进行counter
3. 修改counter, 使用Class<? extends Pet>, HashMap,对随机宠物进行统计, 并且 完全使用工具类Pets 来生成随机 宠物数组.
4.  修改counter为TypeCounter, 即按照继承关系进行统计.

总结: 工具类做creater比较不错, creater用.class,方便检查,   统计用Class对象比较好.  可以考虑继承统计.
```

### 注册工厂

bruce提出了一个问题, 如果继承关系中, 出了一种新的Pet, 想随机创建, 有两个办法

1. 在creater中 添加这个类, 可是 如果creater已经有了一些继承关系, 这可能会出问题.(我不太明白是什么问题)
2. 如果在新的Pet中, 添加一段静态初始化块,  在块里对creater的List 添加自身的.class文件.  会遇到鸡生蛋的问题.(就是在创建这个对象之前, 不会调用这个对象,就不会加载这个静态初始化代码,  就不能创建本对象)

一个推荐的做法,是把List 放到继承关系的基类中, 那么修改起来会比较方便.子类都要实现自己的内部静态工厂类,(实现Factory<T>) 

我理解这样做的好处, 必Class的newInstance可靠,因为有的Class可能没有默认构造器.



### instanceof与Class的等价性

`obj instanceof ClassName`和 `ClassObject.isInstance(obj)`  是等价的.

但是Class对象 进行== 和 equals  是直接比较值,  不会判断是否是继承.



### 反射

java.lang.relection 和Class对象 配合使用, 例如 `getFields`,  `getConstructors` , `getMethods` .



### 动态代理

动态代理可以解决很多问题, 相比普通的代理模式, 代理类 不用写重复的代码.被代理的方法需要是接口.

另外动态代理还可以处理混型(mixins)

```java
// DynamicProxyTest.java
import java.lang.reflect.Proxy;
import java.lang.reflect.Method;
import java.lang.reflect.InvocationHandler;

interface Shape {
  void draw();
  void show();
}
class Circle implements Shape {
  public void draw() {
    System.out.println("draw");
  }
  public void show() {
    System.out.println("show");
  }
  void runCircle() {
    System.out.println("run circle");
  }
}
class DynamicProxyCircle implements InvocationHandler {
  private static Object proxied;
  DynamicProxyCircle(Object proxied) {
    this.proxied = proxied;
  }
  @Override
  public Object invoke(Object proxy, Method method, Object[] args) throws Exception{
    return method.invoke(proxied,args);
  }
}
public class DynamicProxyTest {
  public static void main(String[] args){
    Object proxy = Proxy.newProxyInstance(
    	Shape.class.getClassLoader(),
      	new Class[]{ Shape.class},
      	new DynamicProxyCircle(new Circle())
    	);
    Shape s = (Shape)proxy;
    s.draw();
    s.show();
    //s.runCircle();
  }
}
```



### 空对象

空对象可以部分解决,重要判断空指针的问题, 并且在一些对象情况下, 可以预占, 并且不用反复构造空对象.

使用Null 接口, 作为标记接口, 动态代理,对象的方式来生成空对象.



### 接口和类型信息

`getDeclareMethod`  可以获得一些方法, 并且用`javap`  可以反编译出class的所有方法,并得知class的名称.

通过methods的setAccessible(true) 就可以使用private方法.

包括内部类, 匿名类,静态内部类的private方法,都可以定位并使用.



### 总结



RTTI和反射 非常有用, 可以在继承中解决很多问题, 但是有时候不用专门使用反射或者RTTI, 例如 乐器的继承关系里,

如果Wind 这类乐器需要 clear口水, 可以在client的地方 判断类型,专门处理,  也可以加一个prepare的方法 加到基类里, 让每个乐器都执行 prepare, 只是各自的实现不同.





## 我的总结



1. 掌握 Class、instanceof、reflect的一些用法
2. 类型统计(工厂模式,递归统计, creater和counter的写法)
3. 什么时候需要反射，什么时候需要动态代理（避免重复代码，需要统计调用次数，需要hook，需要mixins）
4. Class对象比较是不考虑继承的
5. 空对象场景，class的安全性
6. 避免滥用RTTI和反射



## Read More

  [Dynamic Proxy Classes](https://docs.oracle.com/javase/8/docs/technotes/guides/reflection/proxy.html)（Oracle Document）

​    reflect类库

​    class 类库   



## END
