---
title: go语言学习笔记1
tags: go
categories: go
toc: true

---

学习资料为《The Go Programming Language》的[中文版](https://github.com/golang-china/gopl-zh)，考虑到社区翻译的要比实体书更靠谱。

Go的历史(略) ,书里有介绍，这一漫长的历史影响力Go的设计，作者是 Rob Pike, Ken Tompson和 Robert Griesemer。

Go的重要性、特点、优点也不说了。

大概的说就是支持基本语法，强类型系统，支持并发，没有继承，泛型。（目前我大概只知道这些）

Go的安装（略） 

给本机安装Git（略）

配置一下FQ，我用了HTTP代理

```
PROXY_IP=${1}
PORT=1080
if [ -n "$PROXY_IP" ]
then
  echo "IP:$PROXY_IP"
  export HTTP_PROXY=http://$PROXY_IP:1080
  export HTTPS_PROXY=http://$PROXY_IP:1080
fi
```

执行第一个Hello的例子

```
$ mkdir ~/go/ && cd ~/go/
$ export GOPATH=$HOME/go            # choose workspace directory
$ go get gopl.io/ch1/helloworld         # fetch, build, install
$ $GOPATH/bin/helloworld                # run
Hello, 世界
```

会自动把代码下载到`~/go/src/gopl.io` 下面

