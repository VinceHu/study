---
title: var作用域详解
date: 2025-11-20
category: JavaScript
difficulty: 基础
tags: [var, 作用域, 函数作用域, 变量提升]
related: [var-let-const.md, closure.md]
hasCode: false
---

# 题目

请详细说明var的作用域特性，以及为什么在循环中使用var会出现问题。

## 🎯 一句话回答（快速版）

var是函数作用域，会变量提升，在循环中所有回调共享同一个变量，所以异步输出时值已经变成循环结束后的值了。

## 📣 口语化回答（推荐）

var的作用域问题主要体现在两个方面：函数作用域和变量提升。

首先，var声明的变量作用域是整个函数，而不是块级作用域。比如在if语句里用var声明的变量，在if外面也能访问到，这跟let/const的块级作用域不一样。

然后是经典的循环问题。比如for循环里用var声明i，然后在setTimeout里打印i，结果全是3。原因是var i在整个函数中只有一个，所有的setTimeout回调都引用同一个i。当回调执行时，循环早就结束了，i已经变成3了。

解决方案有三种：第一是用let代替var，因为let是块级作用域，每次循环都会创建新的变量；第二是用闭包，用立即执行函数把当前的i值捕获住；第三是用bind直接绑定当前值。

现在开发基本都用let/const了，但理解var的问题对于理解作用域和闭包还是很重要的。

## 📝 标准答案

### 核心要点

1. **函数作用域**：var声明的变量作用域是整个函数
2. **变量提升**：var声明会被提升到函数顶部
3. **全局对象属性**：全局var变量会成为window属性
4. **循环问题**：循环中的var会共享同一个变量

### 详细说明

#### 函数作用域

```javascript
function fn() {
  if (true) {
    var a = 1;
  }
  console.log(a); // 1，可以访问
}

// 等价于
function fn() {
  var a; // 提升到函数顶部
  if (true) {
    a = 1;
  }
  console.log(a);
}
```

#### 循环中的经典问题

```javascript
// 问题代码
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 0);
}
// 输出: 3 3 3

// 原因：var i是函数作用域，所有回调共享同一个i
// 当回调执行时，循环已结束，i=3

// 解决方案1：使用let
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 0);
}
// 输出: 0 1 2

// 解决方案2：使用闭包
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => {
      console.log(j);
    }, 0);
  })(i);
}
// 输出: 0 1 2

// 解决方案3：使用bind
for (var i = 0; i < 3; i++) {
  setTimeout(console.log.bind(null, i), 0);
}
// 输出: 0 1 2
```

## 🧠 深度理解

### 变量提升机制

```javascript
console.log(a); // undefined，不是ReferenceError
var a = 1;

// 等价于
var a;
console.log(a);
a = 1;
```

### 全局对象属性

```javascript
var a = 1;
console.log(window.a); // 1

let b = 2;
console.log(window.b); // undefined
```

## 💡 面试回答技巧

### 推荐回答顺序

1. **说明函数作用域**：var的作用域是整个函数
2. **举循环例子**：说明为什么输出3 3 3
3. **解释原因**：所有回调共享同一个变量
4. **给出解决方案**：let、闭包、bind等
5. **对比let**：let是块级作用域，每次循环创建新变量

### 可能的追问

**Q1: 为什么循环中var会出问题？**

A: 因为var是函数作用域，循环中的var i在整个函数中只有一个，所有异步回调都引用同一个i。当回调执行时，循环已结束，i的值是3。

**Q2: 如何用闭包解决？**

A: 用立即执行函数创建新的作用域，捕获当前的i值：

```javascript
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 0);
  })(i);
}
```

## 🔗 相关知识点

- [var/let/const区别](./var-let-const.md)
- [闭包](./closure.md)
- [事件循环](./event-loop.md)

## 📚 参考资料

- [MDN - var](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/var)
- [MDN - 变量提升](https://developer.mozilla.org/zh-CN/docs/Glossary/Hoisting)
