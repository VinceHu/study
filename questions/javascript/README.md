# JavaScript 题目列表

## 数据类型
1. [数据类型与检测](./data-types.md) - 基础 ⭐⭐⭐⭐⭐
   - 基本类型 vs 引用类型
   - typeof vs instanceof vs Object.prototype.toString.call()
   - 栈内存 vs 堆内存

2. [深拷贝vs浅拷贝](./deep-clone.md) - 中级 ⭐⭐⭐⭐⭐
   - JSON.parse(JSON.stringify()) 的缺陷
   - 手写深拷贝（处理循环引用）
   - WeakMap 的应用

## 数组相关
3. [数组的常见方法](./array-methods.md) - 基础 ⭐⭐⭐⭐⭐
   - 改变原数组的8个方法
   - 不改变原数组的15个方法
   - 静态方法和实际应用

4. [数组去重](./array-dedup.md) - 基础 ⭐⭐⭐⭐⭐
   - Set、filter、reduce等多种方法

5. [对象数组去重](./object-array-dedup.md) - 中级 ⭐⭐⭐⭐
   - 按属性去重的多种实现

## 原型与继承
6. [原型与原型链](./prototype-chain.md) - 中级 ⭐⭐⭐⭐⭐
   - __proto__ 和 prototype 的区别
   - ES5 寄生组合继承 vs ES6 class extends
   - new 操作符的实现

## this 与函数
7. [this 指向与箭头函数](./this-binding.md) - 中级 ⭐⭐⭐⭐⭐
   - this 的四种绑定规则
   - 箭头函数 vs 普通函数
   - 隐式绑定丢失

8. [call、apply、bind](./call-apply-bind.md) - 中级 ⭐⭐⭐⭐⭐
   - 三者的区别与使用场景
   - 手写实现
   - 借用方法和柯里化

9. [闭包](./closure.md) - 中级 ⭐⭐⭐⭐⭐
   - 闭包的定义和原理
   - 内存泄漏问题

10. [为什么需要闭包](./why-closure.md) - 中级 ⭐⭐⭐⭐⭐
    - 闭包的实际应用场景
    - 防抖节流、模块化

## 异步编程
11. [Promise详解](./promise.md) - 中级 ⭐⭐⭐⭐⭐
    - Promise的三种状态
    - Promise.all/race/allSettled/any
    - 手写Promise

12. [async/await原理](./async-await.md) - 中级 ⭐⭐⭐⭐⭐
    - Generator + 自动执行器
    - 错误处理和并发控制
    - 循环中的 async/await

13. [事件循环](./event-loop.md) - 中级 ⭐⭐⭐⭐⭐
    - 宏任务 vs 微任务
    - 执行顺序

## 作用域
14. [var/let/const区别](./var-let-const.md) - 基础 ⭐⭐⭐⭐⭐
    - 作用域、提升、暂时性死区

15. [var作用域](./var-scope.md) - 基础 ⭐⭐⭐⭐
    - 函数作用域和变量提升

## 学习建议

### 入门路径
1. 数组的常见方法 → 数组去重
2. var/let/const区别 → var作用域

### 进阶路径
1. 闭包 → 为什么需要闭包
2. Promise详解 → 事件循环
3. 对象数组去重

## 快速查找

### 按难度
- **基础**：数组的常见方法、数组去重、var/let/const区别、var作用域
- **中级**：对象数组去重、Promise详解、事件循环、闭包、为什么需要闭包

### 按标签
- **数组**：数组的常见方法、数组去重、对象数组去重
- **异步**：Promise详解、事件循环
- **作用域**：var/let/const区别、var作用域、闭包、为什么需要闭包
