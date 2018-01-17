---
title: angular学习笔记1
toc: true
tags: [angular]
categories: [angular]

---

Angular是谷歌设计的前端框架，使用的Typescript语言（微软开发的）编写，Typescript是对EMCAScript2015语言规范的一种实现。

EMCAScript2015语言规范是什么呢： 是Standard ECMA-262规范的第六版，在2015年7月发布，所以这个规范又称为ES6。

那这个Standard ECMA-262是什么？和javascript有什么关系呢？

> 1996 年 11 月，JavaScript 的创造者 Netscape 公司，决定将 JavaScript 提交给国际标准化组织 ECMA，希望这种语言能够成为国际标准。次年，ECMA 发布 262 号标准文件（ECMA-262）的第一版，规定了浏览器脚本语言的标准，并将这种语言称为 ECMAScript，这个版本就是 1.0 版。
>
> 该标准从一开始就是针对 JavaScript 语言制定的，但是之所以不叫 JavaScript，两个原因。一是商标，Java 是 Sun 公司的商标，根据授权协议，只有 Netscape 公司可以合法地使用 JavaScript 这个名字，且 JavaScript 本身也已经被 Netscape 公司注册为商标。二是想体现这门语言的制定者是 ECMA，不是 Netscape，这样有利于保证这门语言的开放性和中立性。
>
> 因此，ECMAScript 和 JavaScript 的关系是，前者是后者的规格，后者是前者的一种实现（另外的 ECMAScript 方言还有 Jscript 和 ActionScript）。日常场合，这两个词是可以互换的。

现在ECMA-262已经出第8版. 回过来继续关注angular。





安装（略）

一开始只有一个首页，首页的代码主要在app.component.ts/html/css 里。

html是页面，不需要手动加载js和css。

ts文件这个组件的控制逻辑，把html和css关联起来，并且暴露一个路由，有点像RequestMap的感觉，

```
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Tour of Heroes';
}
```

这里面Compoenent是注解，import的用法和java类似；这个注解给出了路由选择，并且把模板和css关联起来。

title变量可以在html中使用，有点像el表达式或者像模板引擎，使得html获得变量更快速。

当然肯定有一个地方使用'app-root'，后面再看。

而且应该有一个程序入口，入口在哪？

并且那么多文件都是什么？

整个程序是怎么运行，编译的？



ng generate component heroes 

生成另外一个组件，因为一共教程有3个页面，app那个可以作为dashboard页面，heroes可以用来当，heroes页面。

1. `selector`— the components CSS element selector

这个selector可以和父级组件的模板内的一个html标识相匹配。

例如`<app-heroes></app-heroes>`在一个父级模板，就可以加载这个组件。



稍微修改一下heroes组件，可以在app.component.html中嵌套app-heroes

```
<h1>{{title}}</h1>
<app-heroes></app-heroes>
```



但是这样只有一个英雄，我们需要多个英雄，用OOP的思路，可以建一个Hero对象出来，在程序逻辑里把一组hero建出来，再把数据加载到页面上。

ng generate class hero

```
//hero.ts
export class Hero {
    id: number;
    name: string;
}
```

值得注意的是文件名是小写，但是class名是驼峰。

变量声明方式和go的参数形式有点像。 （类型系统是什么样子？有路径包管理么，互相怎么import？）



```
import { Component, OnInit } from '@angular/core';
import { Hero } from '../hero';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css']
})
export class HeroesComponent implements OnInit {
  hero: Hero = {
    id: 1,
    name: 'Windstorm'
  };

  constructor() { }

  ngOnInit() {
  }

}
```

class对象的一个实例，并不需要new，直接赋值，像字典一样，但是key是不带单引号的，这语法和js对象差不多。



这个时候需要改一下`heores.component.html`, 毕竟这个hero还没有tostring的效果。

```
<h2>{{ hero.name | uppercase }} Details</h2>
<dir><span>id: </span>{{ hero.id }}</dir>
<dir><span>name: </span>{{ hero.name }}</dir>
```

模板表达式肯定有一套语法， 先浅尝辄止。



现在可以看到一个hero的详情，但是详情是可以编辑的。



```
<div>
  <label for="">name:
    <input [(ngModel)]="hero.name" placeholder="name">
  </label>
</div>

```

`[(ngModel)]`这种写法可以做文本框的双向绑定，文本的数据可以到hero.name,hero.name的数据可以到文本。

这个绑定是什么效果呢？

默认ngModel在html里还用不了，需要去app.module.ts里面导入一下。

```
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { HeroesComponent } from './heroes/heroes.component';

import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    HeroesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

```

这个时候,ngModel的双向绑定生效了。

hero.name的数据加载到页面上（一个方向）

当修改input的输入框时，hero.name发生改变（另一个方向）

由于hero.name发生改变，h2标签也发生了改变。 

因为默认数据到页面的绑定是一直存在的。

```
<div>
  <label for="">no bind name:
    <input placeholder="name" value="{{ hero.name }}">
  </label>
</div>
```

加入以上内容可以发现，不设置是没有双向的。



需要注意的是declarations这个要把每个组件都加上去。

