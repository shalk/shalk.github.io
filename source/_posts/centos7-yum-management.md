---
title: centos7 yum management
tags: linux
categories: linux
toc: true
date: 2017-12-06 16:24:38
---


centos7使用的yum进行软件包管理，centos使用rpm的软件包。

一个软件可以打包成rpm后缀的单个文件，系统可以使用rpm命令安装这个rpm包，也可以移除这个rpm包。

然而我们在哪里找这些软件包呢，这些软件包是有依赖关系的，按照一个rpm包还需要安装其他依赖。

一套完善的包管理，需要解决至少两个问题，

1.软件源

2.依赖关系

yum系列软件可以解决这两个问题。

## 使用方式

首先，用*createrepo*一堆软件包建成一个软件源，然后通过http或者ftp把这个

其次，在主机上配置/etct/yum.repo.d/*.repo 文件，设置远程软件源的地址。

最后，使用yum命令，进行安装，卸载和升级等，安装过程会自动显示依赖。



## 常用软件源

CentOS的官方源（系列）：

 根据系统自带的repo文件描述这些源，一个repo文件可以有多个源

```
CentOS-Base.repo 文件内有4个源 base update extra centosplus(默认没开)

CentOS-CR.repo  持续集成的1个源，有一些为下一个版本准备的，但是没有集成测试过。

CentOS-Debuginfo.repo  开了debuginfo的1个源，

CentOS-fasttrack.repo  bugfix的1个源，这里不时发布错误修正和强化升级，及那些有可能纳入上游供应者的下轮更新发布的组件

CentOS-Sources.repo  上面base update extra centosplus的源码的4个源

CentOS-Vault.repo  Vault是对老版本归档的5个源（base update extra centos plus），有一些老版本的源可能没有了。

```

系统带了4+1+1+1+4+5一共16个源，只有CentOSBase.repo的前3个源是默认开启的。

epel源（这个源有大批有用的软件）

ius源 ，这个源有最新版本的git，nginx，php等，而且安装的时候可以多版本存在，不替换系统版本。

remi源，安装新版本的php可以用这个源

codeit源，可以安装最新版本的apache httpd

更多可以参考https://wiki.centos.org/zh/AdditionalResources/Repositories

## 源配置方法

最简单的，在/etc/yum.repo.d/ 下面创建一个 1.repo文件，填写如下内容

```
[base]
name=CentOS-$releasever - Base
#mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=os
baseurl=https://mirrors.ustc.edu.cn/centos/$releasever/os/$basearch/
gpgcheck=1
enable=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7
```

第一行括号内，写源的id，不要重复即可。

第二行，写名称，这个随意。

后面几个变量顺序其实无所谓，mirrolist和baseurl 一般二选一，mirrolist会返回一个源地址列表， baseurl就是选一个确切的地址。

gppcheck和gpgkey是配套的，用于公钥认证的。enable=1可以省略，enable=0代表，这个源不开启。



实际操作有一些出入，以配置上面的软件源（epel,remi,codeit,ius)给出配置方法。

配置方法如下：

```
#!/usr/bin/env bash
set -ex

#centos7还是6
sysver=`rpm -q --qf "%{VERSION}" $(rpm -q --whatprovides redhat-release)`

cd  /etc/yum.repos.d/

if [ ! -f  CentOS-Base.repo.bak ]
then
    cp -rf CentOS-Base.repo{,.bak}
fi
#
echo "配置base软件源"
curl -o CentOS-Base.repo -sSL https://lug.ustc.edu.cn/wiki/_export/code/mirrors/help/centos?codeblock=$((sysver-4))

echo "配置epel源"
yum remove -y epel-release || true
yum install -y epel-release
sed -e 's!^mirrorlist=!#mirrorlist=!g' \
        -e 's!^#baseurl=!baseurl=!g' \
        -e 's!//download\.fedoraproject\.org/pub!//mirrors.ustc.edu.cn!g' \
        -e 's!http://mirrors\.ustc!https://mirrors.ustc!g' \
        -i /etc/yum.repos.d/epel.repo /etc/yum.repos.d/epel-testing.repo


echo "配置ius源"
yum install -y https://centos${sysver}.iuscommunity.org/ius-release.rpm
yum install -y yum-plugin-replace

echo "配置remi源"
yum install -y http://rpms.famillecollet.com/enterprise/remi-release-${sysver}.rpm
echo "if you want update php ,execute follow command:"
echo " yum install php php-gd php-mysql php-mcrypt "
echo ""

echo "配置codeit源"
cd /etc/yum.repos.d && wget https://repo.codeit.guru/codeit.el${sysver}.repo
echo "if you want update httpd ,execute follow command:"
echo " yum install httpd "
echo ""

yum repolist
```



查看有哪些源

```
yum install -y yum-utils
```

安装yum-config-manager

```
yum-config-manager --enable  <id>
yum-config-manager --disable <id> 
# 不带<id> 就是显示
yum-config-manager --add-repo=<repo文件，或者url/file.repo>

```





## yum命令

主要如下：

```
yum install name

yum remove name

yum search xxxx

yum list xxx
yum info xxx

#可以用 --showduplicates 显示多版本
#安装时输入带版本号的软件名称，安装特定版本
```

