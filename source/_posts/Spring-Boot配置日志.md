---
title: Spring Boot配置日志
tags:
  - java
  - springboot
  - log
categories: java
toc: true
date: 2017-11-24 16:51:14
---


一般的，在写java的时候，要打印日志(用于诊断和观察)，System.out只能打印到控制台，如果要输出到文件，这显然就不好用了，需要用日志模块进行控制。

大部分时候都会编写如下代码，而且据说是最佳实践：

```
import org.slf4j.Logger;

import org.slf4j.LoggerFactory;

class Foo {
  private final static Logger logger = LoggerFactory.getLogger(Foo.class);
  
  public void fun(){
    logger.info("this is method fun()");
    // other code
  }
}

```

会在某个地方进行一些全局配置，描述日志怎么输出，例如按照模块输出到不同文件，或者按照级别输出。这些配置一般可以抽离成一个配置文件，yaml或者xml文件。需要调整配置，只要修改配置文件。

在编写python也有类似的用法，最终也是调整配置，而这些配置似乎是相通的。

另外java的世界里，充满了各种日志框架，log4j,log4j2, slf4j, logback, Commons Logging等。可参考[这里](https://www.cnblogs.com/chenhongliang/p/5312517.html)

但是有很多问题和困惑：

1. 这么多日志框架，应该怎么选择。
2. Spring boot下日志应该如何配置，详细配置（按照模块，文件分卷）的方法。
3. 其他环境下配置日志和Spring boot下配置日志有什么区别。
4. 日志框架还需要了一些什么。

## 日志框架的选择

新项目如何选择：slf4j+logback.

日志框架分两类，接口层和实现层。

接口层：slf4j, Commons Logging

实现: logback, log4j, log4j2, java.util.Logging 等

阵营上：slf4j+logback是一波，commons logging+log4j是一波。

slf4j优点多多，并且slf4j和logback是同一作者，适配很好。 其他有趣的历史竞争关系可以去了解一下。

## Spring如何配置日志

有一个简单配置和复杂配置

### 简单办法

在application.properties加入以下配置

```
logging.level.cn.com.xshalk.lightvc=debug
logging.file=d:/llvc2/llvc1.log
```

这样日志就会输出到一个文件中.

有一些疑问： 这个时候console 还是会打印日志的。 (已解决，见[这里](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-logging.html#boot-features-logging-file-output))

logging.file 目前是Desperate

补充：

```
# Logging pattern for the console
logging.pattern.console= "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"

# Logging pattern for file
logging.pattern.file= "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

## 详细配置

配置logback-spring.xml文件，在lockback.xml的基础要加以扩展了一点点，即profile选择和环境配置使用（即可以使用其他配置中的变量，例如${my.file.name} ）

样例:

```
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>
    <property name="LOG_FILE" value="${LOG_FILE:-${LOG_PATH:-${LOG_TEMP:-${java.io.tmpdir:-/tmp}}/}spring.log}"/>

    <springProfile name="dev">
        <include resource="org/springframework/boot/logging/logback/console-appender.xml"/>
        <appender name="ROLLING-FILE"
                  class="ch.qos.logback.core.rolling.RollingFileAppender">
            <encoder>
                <pattern>${FILE_LOG_PATTERN}</pattern>
            </encoder>
            <file>${LOG_FILE}</file>
            <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
                <fileNamePattern>${LOG_FILE}.%d{yyyy-MM-dd}.log</fileNamePattern>
            </rollingPolicy>
        </appender>
        <root level="ERROR">
            <appender-ref ref="CONSOLE"/>
            <appender-ref ref="ROLLING-FILE"/>
        </root>
    </springProfile>

    <springProfile name="prod">
        <appender name="ROLLING-FILE"
                  class="ch.qos.logback.core.rolling.RollingFileAppender">
            <encoder>
                <pattern>${FILE_LOG_PATTERN}</pattern>
            </encoder>
            <file>${LOG_FILE}</file>
            <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
                <fileNamePattern>${LOG_FILE}.%d{yyyy-MM-dd}.%i.gz</fileNamePattern>
                <timeBasedFileNamingAndTriggeringPolicy
                        class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                    <maxFileSize>10MB</maxFileSize>
                </timeBasedFileNamingAndTriggeringPolicy>
            </rollingPolicy>
        </appender>

        <root level="ERROR">
            <appender-ref ref="ROLLING-FILE"/>
        </root>
    </springProfile>

</configuration>
```

 

这个配置有点复杂，即给两个环境dev和prod配置了日志。

1. 给dev环境的日志，输出到终端和日志文件，输出级别是ERROR，
2. 给prod环境输出到文件，输出到日志文件，文件设定格式，按照日期进行分卷压缩，并且按照大小不超过10MB

里面就有几种标记，阅读以下就可以明白。

详细可以看logback的官方手册和 java-logging-basics。

//TODO

等阅读后续再来补充。



参考

https://www.mkyong.com/spring-boot/spring-boot-slf4j-logging-example/

https://www.cnblogs.com/chenhongliang/p/5312517.html

http://www.jianshu.com/p/f67c721eea1b

https://docs.spring.io/spring-boot/docs/current/reference/html/howto-logging.html

https://www.loggly.com/ultimate-guide/java-logging-basics/ （翻译http://www.importnew.com/16331.html）