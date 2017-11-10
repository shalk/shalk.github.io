---
title: kubernetes note 1
tags:
  - kubernetes
  - docker
categories: kubernetes
toc: true
date: 2017-10-30 16:20:24
---




今天阅读了k8s在线交互教程，提供了一个在线的主机环境，按照教程进行一些操作，并且在操作之前先介绍概念。

本文一篇快速体验，实际操作地址在[这里](https://kubernetes.io/docs/tutorials/kubernetes-basics/) 

通过这个教程可以大概了解到k8s的大概结构，操作步骤和一些基本命令。

## 概念

主要有几个概念，k8s是一个分布式的系统，主要用于管理容器集群，可以调度，可以升级，可以弹性伸缩。支持docker,rkt 至少这两种容器技术。有一个`master`，有若干个nodes.

`node` 可以是一个虚拟机或者物理机，用于运行集群，node上至少运行了kubelet用于和master节点通用，通过kubernetes API. 另外还会运行docker，用于创建容器。

kubernate可以部署容器化的应用，这个应用可以通过一个容器运行，可以是多个容器的组合。这个组合可以在逻辑上成为`POD`，一个POD是kubernate调度的最小单元，必须在同一个主机上。一个POD可以一个容器，也可以是多个容器，并且POD还包括网络 唯一性的集群IP地址， 包括存储 Volume。

POD是定义容器如何运行，以及相关的资源。

那如何创建出POD呢，需要先定义`Deployment`, Deployment 是定义在master节点上，当deployment定义的时候要指定 image ，这样会产生一个deployment controller的线程，用于创建出pods，并且deployment controller 会维护这个pods，对pods进行调度，伸缩，升级。

`Services`是包在POD的上面的一层逻辑层，可以由多个pods组成一个services, 通常pods只有集群内部的ip，但需要把pods作为服务发布出去的时候，就需要services, 通常用标签选择器把一些相关的pods 组成一个services, 可以使用四种方式。

1. 集群IP，服务只能内部访问
2. NodePort, 用node的IP 加上某个端口进行访问。
3. LoadBalancer, 创建一个负载均衡器，负载均衡器有一个固定的外部IP，通过外部IP进行访问
4. ExternalName, 使用一个特定的名称暴露服务，返回名称的CNAME记录，需要v1.7以上的kube-dns

## 命令

接触了几个命令行

kubectl get deployments

kubectl get pods

kubectl get services

使用get进行查询, -l  后面可以接标签。

kubectl run 用于创建deployments

`kubectl run kubernetes-bootcamp --image=docker.io/jocatalin/kubernetes-bootcamp:v1 --port=8080`

kubectl exec $POD_NAME env 可以获得某个POD的环境变量

kubectl exec  -ti $POD_NAME   bash 进入pod的bash

---

如何建service

kubectl expose  可以产生service

`kubectl expose deployment/kubernetes-bootcamp --type="NodePort" --port 8080`

kubectl delete service   删除service

kubectl label pod $POD_NAME  aaa=xxx 添加标签

----

动态伸缩deployment

kubectl scale deployments/kubernetes-bootcamp --replicas=4

kubectl scale deployments/kubernetes-bootcamp --replicas=2

----

升级和回滚（改变image）

`kubectl set image deployments/kubernetes-bootcamp kubernetes-bootcamp=jocatalin/kubernetes-bootcamp:v2`

`kubectl rollout status deployments/kubernetes-bootcamp` 查看升级状态

`kubectl set image deployments/kubernetes-bootcamp kubernetes-bootcamp=jocatalin/kubernetes-bootcamp:v10`

`kubectl rollout undo deployments/kubernetes-bootcamp` 撤销升级
