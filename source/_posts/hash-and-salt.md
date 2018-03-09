---
title: hash and salt
toc: true
date: 2018-03-09 11:07:28
tags:
categories: java
---



当开发一个含用户的系统时，User对象通常包含用户名和密码。有一些不安全系统才会使用明文的方式保存密码，一个正确设计的用户系统通常应该使用加密的方式保存密码，而且密文是不可逆的。

在实际使用中，通常使用hash算法把密码映射到一个较短的固定长度的二进制值。

以md5 算法为例，

字符串"hello world"，会映射成 5eb63bbbe01eeed093cb22bb8f5acdc3 (十六进制)

字符串"111111", 会映射成 96e79218965eb72c92a549dd5a330112（十六进制）

一个好的hash算法，有以下特点：

- 正向快速：给定明文和 hash 算法，在有限时间和有限资源内能计算出 hash 值。
- 逆向困难：给定（若干） hash 值，在有限时间内很难（基本不可能）逆推出明文。
- 输入敏感：原始输入信息修改一点信息，产生的 hash 值看起来应该都有很大不同。
- 冲突避免：很难找到两段内容不同的明文，使得它们的 hash 值一致（发生冲突）。

目前流行的 Hash 算法包括 MD5、SHA-1 、SHA-2系列(SHA-224、SHA-256、SHA-384 和 SHA-512） 。

已经证明在商业上，MD5、SHA-1是不安全的，推荐使用SHA-2更安全。



下面用java代码来介绍散列算法的使用方式。

## Hash加密

下面是使用apache siro库实现的一段 md5加密。

```
import org.apache.shiro.crypto.hash.SimpleHash;

public class HashExample {


    public static void main(String[] args) {
        String password = "111111";
        SimpleHash hash = new SimpleHash("md5",password);
        System.out.println("hex:" + hash.toHex());
        System.out.println("string:" + hash.toString());
        System.out.println("base64:" + hash.toBase64());
    }
}
/* output
hex:96e79218965eb72c92a549dd5a330112
string:96e79218965eb72c92a549dd5a330112
base64:lueSGJZetyySpUndWjMBEg==
*/
```

http://shiro.apache.org/static/1.4.0/apidocs/org/apache/shiro/crypto/hash/SimpleHash.html

SimpleHash  就是一个具体实现，有4种构造函数

```
SimpleHash(String algorithmName)  只参数实例不进行运算
SimpleHash(String algorithmName, Object source)  指定算法，给出需要hash的对象
SimpleHash(String algorithmName, Object source, Object salt)  指定算法，给出需要hash的对象，并给出salt
SimpleHash(String algorithmName, Object source, Object salt, int hashIterations) 指定算法，给出需要hash的对象，并给出salt，并给出hash次数
```

这个algorithmName可以是六种, 大小写不敏感（见这里https://docs.oracle.com/javase/6/docs/technotes/guides/security/StandardNames.html#MessageDigest）:

```
MD2,MD5,SHA-1,SHA-256,SHA-384,SHA-512
```

因此SimpleHash 有六个子类，避免拼写错误。

```
Md2Hash, Md5Hash, Sha1Hash, Sha256Hash, Sha384Hash, Sha512Hash
```

上面的代码可以改成:

```
String password = "111111";
SimpleHash hash = new Md5Hash(password);
System.out.println("hex:" + hash.toHex());
System.out.println("string:" + hash.toString());
System.out.println("base64:" + hash.toBase64());
```

## salt是什么

**盐**（Salt），在密码学中，是指在进行Hash之前将散列内容（例如：密码）的任意固定位置插入特定的字符串。这个在散列中加入字符串的方式称为“加盐”。其作用是让加盐后的散列结果和没有加盐的结果不相同，在不同的应用情景中，这个处理可以增加额外的安全性。

例如：

字符串"111111", 会映射成 96e79218965eb72c92a549dd5a330112（十六进制）

设置salt 为字符串 "abcdefg";

可以把两个字符串拼接起来，"abcdefg111111" 再进行MD5 算法运算，会映射成06da291aa533abb73e9ffade880d9432(十六进制)

注：salt加在前面还是后面，并没有具体规定，不同语言不通库实现不同，在一个场景下始终一致即可。

代码如下：

```
import org.apache.shiro.crypto.hash.Md5Hash;
import org.apache.shiro.crypto.hash.SimpleHash;

public class HashExample {


    public static void main(String[] args) {
        String password = "111111";
        SimpleHash hash = new Md5Hash(password,"abcdefg");
        System.out.println("hex:" + hash.toHex());
        System.out.println("string:" + hash.toString());
        System.out.println("base64:" + hash.toBase64());
    }
}
/*
hex:06da291aa533abb73e9ffade880d9432
string:06da291aa533abb73e9ffade880d9432
base64:BtopGqUzq7c+n/reiA2UMg==
*/

```

## hash次数



在SimpleHash的构造函数中有hashIteration这一项，即hash次数，默认是一次。如果设置成多次，则在第一次加盐hash之后，再进行一次hash算法计算。



例如：

字符串"111111",加salt "abcdefg",  hash 两次。

hash("abcdefg11111")  =>  06da291aa533abb73e9ffade880d9432

hash(06da291aa533abb73e9ffade880d9432（十六进制)) =>  4aa33a194258077db0745da10d628db2

最终映射结果为 4aa33a194258077db0745da10d628db2（十六进制)



代码:

```
import org.apache.shiro.crypto.hash.Md5Hash;
import org.apache.shiro.crypto.hash.SimpleHash;



public class HashExample {


    public static void main(String[] args) {
        String password = "111111";
        SimpleHash hash = new Md5Hash(password,"abcdefg",2);
        System.out.println("hex:" + hash.toHex());
        System.out.println("string:" + hash.toString());
        System.out.println("base64:" + hash.toBase64());
    }
}
/*
hex:4aa33a194258077db0745da10d628db2
string:4aa33a194258077db0745da10d628db2
base64:SqM6GUJYB32wdF2hDWKNsg==

*/


```

等价于

```
    public static void main(String[] args) {
        String password = "111111";
        SimpleHash hash = new Md5Hash(password,"abcdefg",1);
        byte[] result1 = hash.getBytes();
        SimpleHash hash2 = new Md5Hash(result1,null, 1);
        System.out.println("hex:" + hash2.toHex());
        System.out.println("string:" + hash2.toString());
        System.out.println("base64:" + hash2.toBase64());
        
    }
```

## java原生实现

下面是SimpleHash的核心hash逻辑：

```
    protected byte[] hash(byte[] bytes, byte[] salt, int hashIterations) throws UnknownAlgorithmException {
        MessageDigest digest = this.getDigest(this.getAlgorithmName());
        if (salt != null) {
            digest.reset();
            digest.update(salt);
        }

        byte[] hashed = digest.digest(bytes);
        int iterations = hashIterations - 1;

        for(int i = 0; i < iterations; ++i) {
            digest.reset();
            hashed = digest.digest(hashed);
        }

        return hashed;
    }
```

SimpleHash把算法选择，可hash的对象，返回结果的类型进行封装，底层使用的java.security.MessageDigest。

所以原生实现如下：

```
//字符串"111111",加salt "abcdefg",  hash 两次。



import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;


public class HashExample {

    public static String toHex(byte[] bytes) {
        char[] chars = new char[bytes.length * 2];
        for (int i = 0; i < chars.length; i += 2) {
            chars[i] = Character.forDigit(bytes[i / 2] >> 4 & 0x0F, 16);
            chars[i + 1] = Character.forDigit(bytes[i / 2] & 0x0F, 16);
        }
        return new String(chars);
    }

    public static void main(String[] args) {
        String password = "111111";
        String salt = "abcdefg";
        try {
            MessageDigest digest = MessageDigest.getInstance("md5");
            digest.reset();
            if (salt != null) {
                digest.update(salt.getBytes());
            }
            byte[] hashed1 = digest.digest(password.getBytes());
            digest.reset();
            byte[] hashed2 = digest.digest(hashed1);
            System.out.println(toHex(hashed2));
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
    }
}
/*
4aa33a194258077db0745da10d628db2
*/
```





## END