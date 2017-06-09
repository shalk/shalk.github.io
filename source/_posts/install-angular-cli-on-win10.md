---
title: install angular-cli on win10
date: 2017-05-26 17:03:28
tags: angular
---

## 写在前面

最近开始学习angular, 也可以叫angular2, 当前版本可能是4.X.

按照大漠穷秋的视频进行学习.

对angular有了一个初步的了解. 第一步是快速上手, 

由于我的是win10环境, 先安装`nodejs`, `git for windows`,`python3`


## 问题
安装angular-cli的时候还是遇到一些报错.

<!--  more -->
大漠的建议是,
1. 搭建一个梯子, 然后用`npm proxy` 安装 angular-cli.
2. ppt中还提出 windows要安装visual stutio.
3. 指出 `cnpm`安装会遇到结构不正确,无法使用的问题.
   执行
   `npm install -g angular-cli`


## 踩坑过程

我当然直接执行了 `npm install -g angular-cli`  有提示指出包名已经修改,并且卡了很久.

后来又提示python找不到, 原来是不支持python3.

于是下载python2 进行设置.

后面继续提示 提示node-sass 网络连接不上

执行`cnpm install -g node-sass

后面又遇到下载nodejs的 header文件.  网络不太好可能还是要翻墙.

感觉很郁闷. 而且想到后面windows

于是就前往`github`上看看

并且angular-cli github上面 只是简单说

`npm install -g @angular/cli`

##正确方法

```
#管理员权限打开cmd

#安装cnpm
npm install -g cnpm --registry=https://registry.npm.taobao.org
#设置源
npm config set registry https://registry.npm.taobao.org/
#安装node-gyp
cnpm install -g node-gyp
#安装window编译工具
cnpm install --g windows-build-tools
#设置sass镜像
npm config set sass_binary_site https://npm.taobao.org/mirrors/node-sass/
#安装node-sass
cnpm install -g node-sass

npm install -g @angular/cli
```

## 参考
[node-sass安装](https://github.com/lmk123/blog/issues/28)

[win10安装angularcli](https://stackoverflow.com/questions/39743890/installing-angular-cli-on-windows-10)

[node-gyp之后安装的东东](https://github.com/nodejs/node-gyp)

##END
