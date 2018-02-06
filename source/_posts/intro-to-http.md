---
title: http简介
tags: http
categories: http
toc: true
date: 2018-02-06 14:56:50
---


HTTP（超文本传输协议）是万维网（WWW）的基石，每当访问访问网站的时候，浏览器和网站之间就是用HTTP协议进行沟通，在WEB开发的过程中，无论是处理HTTP请求，还是调用其他的Restful API，以及性能安全性等诸多方面的考虑，都需要对HTTP协议进行充分的了解。下面是我阅读一些文章之后，粗浅的理解和笔记。

<!-- more -->

## HTTP协议

根据网络7层模型或4层模型，HTTP是应用层协议，通常基于TCP协议。

HTTP是无状态的，即每一次发送请求，都没有上下文。



## HTTP请求和响应

http的常见场景是用户浏览器访问页面，此时浏览器称为browser，运行网页的站点称为server。一般我们会把这种叫B/S架构。

http协议有两种报文，请求报文和响应报文，browser向server发送请求，server会给browser响应。

请求报文格式通常如下:

```
GET / HTTP/1.1
Host: news.baidu.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Referer: https://www.baidu.com/
Cookie: BIDUPSID=06EED0B4571DA6E73521DB3D632185C2; PSTM=1483596025; Hm_lvt_e9e114d958ea263de46e080563e254c4=1508488536,1508822807; BAIDUID=FFDBCFEE9399C134F551497BDFE4EE9F:FG=1; H_PS_PSSID=1430_21118_18560; PSINO=1; BDORZ=B490B5EBF6F3CD402E515D22BCDA1598
Connection: keep-alive
Upgrade-Insecure-Requests: 1

```

有三部分组成，

1. 第一行，第一行包括3部分，请求方法（请求方法有在HTTP1.0中只有GET POST，1.1增加了delete put head options）， 请求路径（URL）  协议版本
2. 消息头(header)， 消息头一般是一行一个，有的是必选，有的可选。
3. 消息体（content可选），一般POST，PUT可以带消息体，GET DELETE HEAD没有消息体。如果带消息体，header都会给出Content-Length给出字节数。

响应报文格式通常如下：

```
HTTP/1.1 200 OK
Connection: keep-alive
Content-Type: text/html;charset=utf-8
Date: Tue, 06 Feb 2018 03:09:57 GMT
Server: Apache
Tracecode: 05972744920454104842020611
Tracecode: 05972319640916077066020611
Vary: Accept-Encoding
Content-Length: 80575

<!doctype html>
<html class="expanded">
<head>
....
</html>
```

也是三部分组成

1. 第一行，包括三部分，协议版本， 状态码， 状态名称（名称和状态码是对应的）
2. 消息头
3. 消息体

因此实现响应对象时，要构造好相应的字段；发送请求时，也需要构造好请求的三部分。

## HTTP客户端身份识别

由于HTTP是无状态的，如果是一个多用户的网站，如果根据不同的用户返回不同的页面，例如我的购物车，给我推荐广告。

有一些方式

- ~~基于（from, User-Agent,Referer)请求头~~
- ~~基于IP（X-forward-For, client-ip）~~
- 基于加长的URL
- 基于Cookie
- 鉴权机制

下面把他们一一介绍



From 一般是请求的email地址，但是很少使用

UserAgent，是浏览器类型，操作系统类型

Referer，是从哪个地方跳转过来的。

这些都不能明确的代表某个用户。



x-forward-for, client-ip ，ip地址也不能完全代表用户。一方面，很多ISP使用nat技术共享了不同用户的IP，很多用户的ip地址是动态的，另一方面，IP地址可以伪造。



加长url，即在url中补充信息，例如

```
https://www.amazon.com/gp/product/1942788002/ref=s9u_psimh_gw_i2?ie=UTF8&fpl=fresh&pd_rd_i=1942788002&pd_rd_r=70BRSEN2K19345MWASF0&pd_rd_w=KpLza&pd_rd_wg=gTIeL&pf_rd_m=ATVPDKIKX0DER&pf_rd_s=&pf_rd_r=RWRKQXA6PBHQG52JTRW2&pf_rd_t=36701&pf_rd_p=1cf9d009-399c-49e1-901a-7b8786e59436&pf_rd_i=desktop
```

这种是行的通的，对于不同用户给他不同的url参数。

但是有一些缺点：1. 不可以共用 2. 不好看 3. 破坏服务器端的缓存 4 仅限于当前session 5增加服务器的负载



Cookie是最常见的方式，提到cookie通常要和session进行比较，这是一个常见面试题，这个放在后面介绍。



cookie的方式是，有几个来回

1.  browser发送请求
2.  server 响应，并在header加入 Set-Cookie
3.  browser 请求，在header中加入cookie:xxxxxxx
4.  service响应，并识别用户

主要注意到是，cookie分两种，一种 session cookie 浏览器关闭之后，cookie就消失了， 一种是 persist cookie， cookie会以文件的形式保存在浏览器的缓存中，浏览器对于cookie是有支持的，当访问相应站点时，会使用相应的cookie文件，并自动添加到每次请求的header中。

## HTTP 鉴权机制

http authorization 提供了一种方式，让用户输入用户名密码。

1. Basic Authorization
2. Digest Authorization

第一种，在header中加了一个字段：

```
GET /gallery/personal/images/image1.jpg HTTP/1.1
Authorization: Basic Zm9vOmJhcg==
```

第二种，是把密码和一些一些随机数做hash，最后服务器也做一下hash，如果发现是一致的就能鉴权了。

要分3步，1. browser发普通请求， 2 server回请求，并带上随机数，3. browser 发请求，带上用户名密码hash出来值，并带上自己的随机数。

第二种更安全，但也更复杂，但是第二中由于默认hash算法的脆弱性，而且也给服务器增加了运算负载。相比较而言，更安全同时也简单的方式，是使用HTTPS+ basic authorization.

## HTTP安全

HTTPS是在HTTP的基础上，加上TLS/SSL的协议。对HTTP的内容进行了加密。

![img](http://sean-images.qiniudn.com/tls-ssl-_tcp-ip_protocol.png)

从上往下，HTTP的协议报文，会封装进TLS中，再进入TCP中。当server收到请求后，打开TLS报文，需要用密钥解密，才能看到HTTP报文内容。

因此，HTTPS并不影响HTTP的设计，同时，趋势是走向全站HTTPS。

## Cookie和Session

cookie 是服务器发送到浏览器并保存在本地一小块数据。它会在浏览器下次向同一服务器再发起请求时被携带并发送到服务器上。通常，它用于告知服务端两个请求是否来自同一浏览器，如保持用户的登录状态。Cookie使基于[无状态](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview#HTTP_is_stateless_but_not_sessionless)的HTTP协议记录稳定的状态信息成为了可能。

（待增加）

## 参考

https://code-maze.com/http-series/

https://machinesaredigging.com/2013/10/29/how-does-a-web-session-work/

https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Cookies

https://developer.mozilla.org/en-US/docs/Web/HTTP/Session