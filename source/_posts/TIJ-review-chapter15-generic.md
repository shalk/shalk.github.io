---
title: TIJ review chapter15 generic
date: 2017-06-22 18:37:37
tags: [ java, tij ]
toc: true
---

> 一般的类和方法,只能使用具体的类型: 要么是基本类型,要么是自定义的类. 如果要
>
> 编写可以应用于多种类型的代码,这种刻板的限制对代码的束缚就会很大.

## 前言

代码的编写要追求灵活性,可复用性. 对于java这种单继承的结构, 可以使用多态使得代码变的灵活.

但是参数传递或者返回的时候却是固定的. 我们可以传递基类, 但是这样还未编写的类,就必须继承这个基类.

进一步,可以选择接口; 一个实现类可以实现多个接口,面向接口编程提高了灵活性.

这也有一定的局限性, 想要不局限于某一接口, 需要参数化类型.  

代码的参数化类型由调用的地方来指定.

于是java 1.5就出现了泛型(generic), 又有人称之为`参数化多态`.

虽然泛型极大的提高了java的灵活性,然而JAVA的沉重历史包袱和设计问题,使得泛型没有达到参数化类型的目标.

至少没有C++的泛型强大,后面将分几个部分介绍泛型

- 基本用法
- 通配符
- 踩坑指南和规避指南
- mixin,自限定
- 补充(动态类型安全)

## 基本用法

泛型主要可以用于类,方法,接口.下面我们用实例看一下用法.

### 泛型类

即这个类中有一个或者多个参数化的类型,这个类型在声明的时候确定. 

```java
class Holder<T> {
  T t;
  void setT(T t) {
    this.t = t;
  }
  T get() {
    return t;
  }
}

public Class Test {
  public static void main(String[] args) {
    Holder<String> h = new Holder<String>();
    //后来java做了优化 可以用如下写法, 类型自动推断
    //Holder<String> h = new Holder<>();
  }
}
```

`ArrayList` ,`LinkedList`等都是泛型类.

### 泛型方法

即给特定的方法使用参数化类型, 写法如下

\[权限\]\[ final\] \[static\] <类型参数>   返回类型  methodname( 参数) {

}

```java
public class Test {
  public static <T> void foo1(T t) {
    System.out.println(t.toString());
  }
  public static void main(String[] args) {
  	foo1("Hello");
  }
}
```



### 泛型接口

给接口添加参数化类型

```java
interface Foo<T> {
	void foo1(T t);
}

class FooStringImp implements Foo<String> {
	public void foo1(String t) {

	}
}

class FooImp<T> implements Foo<T> {
	public void foo1(T t) {

	}
}

public class Test {
	public static void main(String[] args) {
		Foo<String> f1 = new FooStringImp();
		Foo<String> f2 = new FooImp<String>();
		FooStringImp f3 = new FooStringImp();
	}
}
```

## 通配符

​	有三种基本的方式

​        <? extends T>

​       <?  super  Shape>

​       <?>

说一下通配的的作用,再分别介绍一下这三种,并且介绍一下他们的限制.

这个要从`擦除`说起

擦除:  就是在使用泛型的地方,会发生擦除.如何理解呢 以泛型类Holder为例, `setT` 这个方法的参数,会将对象t先转换成`Object`类型. 而返回值 `get()` 将返回`Object`类型,调用的地方会进行转型. 

```Java
package generics.solution.review;

class Holder<T> {
	T t;

	void setT(T t) {
		this.t = t;
	}

	T get() {
		return t;
	}
}

public class Test {
	public static void main(String[] args) {
		Holder<String> h = new Holder<>();
		h.setT("aaa");
		String b = h.get();
	}
}
```

```
$ javap -c Holder.class
Compiled from "Test.java"
class generics.solution.review.Holder<T> {
  T t;

  generics.solution.review.Holder();
    Code:
       0: aload_0
       1: invokespecial #1                  // Method java/lang/Object."<init>":                                                                                            ()V
       4: return

  void setT(T);
    Code:
       0: aload_0
       1: aload_1
       2: putfield      #2                  // Field t:Ljava/lang/Object;
       5: return

  T get();
    Code:
       0: aload_0
       1: getfield      #2                  // Field t:Ljava/lang/Object;
       4: areturn
}


$ javap -c Test.class
Compiled from "Test.java"
public class generics.solution.review.Test {
  public generics.solution.review.Test();
    Code:
       0: aload_0
       1: invokespecial #1                  // Method java/lang/Object."<init>":                                                                                            ()V
       4: return

  public static void main(java.lang.String[]);
    Code:
       0: new           #2                  // class generics/solution/review/Ho                                                                                            lder
       3: dup
       4: invokespecial #3                  // Method generics/solution/review/H                                                                                            older."<init>":()V
       7: astore_1
       8: aload_1
       9: ldc           #4                  // String aaa
      11: invokevirtual #5                  // Method generics/solution/review/H                                                                                            older.setT:(Ljava/lang/Object;)V
      14: aload_1
      15: invokevirtual #6                  // Method generics/solution/review/H                                                                                            older.get:()Ljava/lang/Object;
      18: checkcast     #7                  // class java/lang/String
      21: astore_2
      22: return
}


```

看一下javap的分析结果 ,我们知道泛型类,对于T都是以Object保存, 调用的地方也就是确定类型的地方,才会发生转型检查.

这样设计,一方面是想实现泛型的基本功能,另一方面是可以兼容旧的代码. 属于是折中.

这样引出了几个问题, 既然Holder类不知道T的类型.

1. Holder是不限制对任何对象使用的
2. 如果想对特定一类的对象比如Pet 并在泛型中使用Pet的某些方法,直接硬写会编译不通过.

这样      <? extends Shape> 就可以解决这个问题, 在使用的地方即可以不用指定明确的类型, 又可以在编译期间进行检查

< ? extends T> 的使用情况应该比较少, 一般是泛型方法的某个参数是泛型类, 可以根据逻辑进行设置.

```java
package generics.solution.review;

class Holder<T> {
	T t;

	void setT(T t) {
		this.t = t;
	}

	T get() {
		return t;
	}
}

public class Test {
  	public static void foo1(Holder<? extends Shape> h){
      h.get().draw();
  	}
	public static void main(String[] args) {
		Holder<? extends Shape> h = new Holder<>();
      foo1(h);
	}
}
```

h就可以存放各种形状,这样foo1方法就可以编译检查,这个holder可以方法Shape以及继承的对象,

而且? extends 可以实现协变

Holder<? extends Shape> 与Holder\<Shape\> 有继承关系 例如

```
	public static void main(String[] args) {
		Holder<? extends Number> h = new Holder<Integer>(); // 由于协变的存在, 赋值成功.
	//Holder<Number> h = new Holder<Integer>(); 
	}
```

但是 你会发现h 的set方法编译报错.

原因是h.setT()的时候, T的类型为? extends Number; 那基本就是确定不了类型,也不知道该如何转型, 所以报错. 

这个时候可以采用

< ? super Number>,  (也可以<? super T> 不可以 <T super Class>))

就是Number就是下界,里面放着Number和Number的父类,  那么setT()的时候 Integer属于这些类型的子类型,可以向上转型,类型检查没有问题.

```java
Holder<? super Number> h = new Holder<Number>(); 
h.setT(new Integer(1));	
```

这种又称之为逆变, 也就是, 也就是发生函数关系后,继承关系相反了.

```
ArrayList<? super Number> list = new ArrayList<Object>();
```

Number  是 Object的子类

List<? super Number> 是 ArrayList\<Object\>的父类

---

即一般我们都是协变的

```
ArrayList<? extends Number> list = new ArrayList<Integer>();
```

Number  是 Integer的父类

ArrayList<? extends Number>  是 ArrayList\<Integer\> 父类

注意: 一般 基类可以接住 派生类

---

<?> 最后说是这个通配符.

当类型不确定,代表要用泛型的时候, 或者\<String,?\> 

这个通配符也不能用set方法

小结: 只set 可以用 ? super ; 只get 用 ? extends  ; 都需要 用确切类型<XXX>

## 踩坑指南和规避指南



1.  泛型会擦除, 里面都没有类型都是Object (T主动转型实际上没啥用)
2.  8中基本类型不可以用泛型,可以用包装类
3.  泛型的接口不能实现两个不同类型的
4.  泛型参数不同重载没用foo1(Holder\<A> a) foo1(Holder\<B> b) 函数原型是一样的 会冲突



## mixin与自限定



mixin就是有A,B,C 3个类型, 想组合成一个D,D 有三个类型的所有方法.

java并没有很好的解决办法,有一些笨办法和复杂办法.

1. 实现D, 把a,b,c都用代理模式,把方法都写一份

2. 都改成接口模式, D实现 多个接口,好像也不错哦 还是代理模式. 

3. 装饰器

4. 动态代理,这种方式是OK的. handler实现InvocationHandler, 构造器代理这些类, invoke调用对应的方法. 用Proxy.newProxyInstance(classloader, class[],new handler(被代理的对象)).

   ​

   默写一下

 ```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Proxy;
import java.lang.reflect.Method;
import java.util.Map;
import java.util.HashMap;

interface Foo1 {
  void method1();
}

interface Foo2 {
  void method2();
}
interface Foo3 {
  void method3();
}
class Foo1Imp implements Foo1 {
 public void method1() { System.out.println("Foo1Imp invoke method1()");} 
}

class Foo2Imp implements Foo2 {
 public void method2() { System.out.println("Foo2Imp invoke method2()");} 
}

class Foo3Imp implements Foo3 {
 public void method3() { System.out.println("Foo3Imp invoke method3()");} 
}
// 写我们mixin
public class MixinHandler implements InvocationHandler {
  Map<String,Object> map = new HashMap<>();
  
  public MixinHandler(Map<Class,Object> map){
   	for (Class c: map.keySet()) {
      for (Method m: c.getMethods()) {
        this.map.put(m.getName(), map.get(c));
      }
   	}
  }
  
  public Object invoke(Object proxy, Method method, Object...args) throws Exception {
    if (map.containsKey(method.getName())){
      	Object proxied = map.get(method.getName());
    	return method.invoke(proxied,args);
    } else {
      	return null;
    }
  }
  public static void main(String[] args) {
    Map<Class,Object> map = new HashMap<>();
    map.put(Foo1Imp.class, new Foo1Imp());
    map.put(Foo2Imp.class, new Foo2Imp());
    map.put(Foo3Imp.class, new Foo3Imp());
    Object proxy = Proxy.newProxyInstance(MixinHandler.class.getClassLoader(),
                                         new Class[]{ Foo1.class, Foo2.class, Foo3.class},
                                          new MixinHandler(map)
                                         );
    Foo1 foo1 = (Foo1)proxy;
    foo1.method1();
  }
}
 ```

稍微改了一下 编译通过了.

自限定 class Y\<T extents Y\<T\>\> 

```
class Node<T extends Node<T>> {
  
}
```

继承Node的必须是 class Node1 implements Node\<Node1\> {}

要求继承泛型的参数必须是继承者自己.

这属于惯用法



##  补充



异常可以这么写

```
public class Test<U extends Exception> {

	public void foo throws U {

         }

} 
```

动态类型安全

如果是List这种古老的代码,混入函数中,add的时候无法保证类型正确. 需要用Collections.checkList(list,Class)的来保证类型正确

潜在类型机制

一些语言中有鸭子类型的概念,java实现不了,只能用接口的方式来实现接近的功能

或者用反射的方式 加上 Class<?  extends T> type  类型标记 来进行检查.



## 更多

[JAVA Generic FAQ](http://www.angelikalanger.com/GenericsFAQ/JavaGenericsFAQ.html)

Thinking in JAVA. 4th Edition

## END





