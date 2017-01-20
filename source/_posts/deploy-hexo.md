---
title: deploy hexo
date: 2017-01-20 10:26:02
tags:
---



## 写在前面

github的pages服务支持承载静态页面,hexo是一套静态页面生成引擎,并可以部署这套页面.
本文将介绍,如何在github和coding.net上同时部署BLOG,并保存本地环境到github上.作为本blog搭建的开篇记录.

## 搭建hexo

操作环境: win10
版本控制: git( from git官网)
运行环境: nodejs (from nodejs官网)

任意创建一个目录例如blog, 进入之后右键 git bash here

验证一下安装
```
git version
node -v
```
结果类似
```
shalk@DESKTOP-NSQ8DQ5 MINGW64 /d/code/codingblog
$ git version
git version 2.10.2.windows.1

shalk@DESKTOP-NSQ8DQ5 MINGW64 /d/code/codingblog
$ node -v
v6.9.4
```

安装hexo
```
npm config set registry https://registry.npm.taobao.org

npm install -g hexo-cli
```

初始化 生成一套blog
```
hexo init hexo

```
进入目录
```
cd hexo
```
安装依赖文件：
```
npm install
```
部署形成文件：

```
hexo generate
```

本地测试

```
hexo server
```

到这里blog已经可以在本地跑起来了.

## 部署双仓库


因为是通过git,来把源码上传到远程仓库,因此需要对git进行一系列配置.

1. 先注册账户  
2. git 无密码(搜索github 密钥, coding.net的配置类似,把生成的公钥上传上去)
3. 验证无密码

  ```
  shalk@DESKTOP-NSQ8DQ5 MINGW64 /d/code/codingblog
  $ ssh -T  git@git.coding.net
  Hello shalk! You've connected to Coding.net via SSH successfully!

  shalk@DESKTOP-NSQ8DQ5 MINGW64 /d/code/codingblog
  $ ssh -T  git@github.com
  Hi shalk! You've successfully authenticated, but GitHub does not provide shell access.

  ```

4. 分别在coding上和github上创建repo,假定我用户名是zhangsan,coding.net创建 repo :zhangsan,github创建 repo: zhangsan.github.io

5. 安装hexo调用git的插件
```
npm install hexo-deployer-git --save
```
6. 在本地填写远程仓库的地址,让hexo知道部署到哪里去
进入 blog/hexo 目录,修改一下全局配置文件`_config`,在末尾加入
```
    deploy:
      type: git
      repository:
        github: git@github.com:zhangsan/zhangsan.github.io.git
        coding: git@git.coding.net:zhangsan/zhangsan.git
        branch: master
```

7. 部署
```
hexo clean
hexo generate
hexo deploy
```


## 备份环境

经过一段时间的使用,需要修改主题,又要修改配置.

但换了一个系统或者PC,需要准备这套环境,又要从头搭建一遍太麻烦可能会遗忘配置.

可以通过分支把hexo的配置都保存下来.

按照以下步骤,备份到git分支上.
```
cd blog/hexo
# 初始化仓库
git init

git add .

git commit -m "init"
# 建一个分支
git checkout -b hexo
# 删除本地的master分支
git branch -d master
# 添加远程
git remote add origin git@github.com:zhangsan/zhangsan.github.io.git
# 保存
git push -u  origin hexo
```
如果更换环境,只需要如下步骤
1. 安装git(配置git),nodejs,
2. git clone git@github.com:zhangsan/zhangsan.github.io.git  hexo
3. cd hexo ; git checkout -b hexo
4. 安装各种npm包
```
  npm install -g hexo-cli

  npm install

  npm install hexo-deployer-git --save   
```
5. 生成部署
```
hexo generate
hexo deploy
```


##  参考

https://fzy-line.github.io/2016/11/30/Github-Pages-Hexo%E6%90%AD%E5%BB%BA%E5%8D%9A%E5%AE%A2%EF%BC%88%E4%B8%80%EF%BC%89/
http://blog.csdn.net/xiaoliuge01/article/details/50997754


## END
