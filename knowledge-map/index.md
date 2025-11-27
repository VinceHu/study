# 前端面试知识点索引

## CSS

### 布局
- [CSS盒模型](../questions/css/box-model.md) - 基础 ⭐⭐⭐⭐⭐
- [左固定右自适应布局](../questions/css/layout-flex.md) - 中级 ⭐⭐⭐⭐
- [水平垂直居中](../questions/css/center-methods.md) - 中级 ⭐⭐⭐⭐⭐

### 定位
- [Position定位](../questions/css/position.md) - 基础 ⭐⭐⭐⭐⭐

### 性能优化
- [绝对定位vs Transform](../questions/performance/transform-vs-position.md) - 高级 ⭐⭐⭐⭐
- [强缓存和协商缓存](../questions/performance/cache-strategy.md) - 中级 ⭐⭐⭐⭐⭐

## JavaScript

### 数据类型
- [数据类型与检测](../questions/javascript/data-types.md) - 基础 ⭐⭐⭐⭐⭐
- [深拷贝vs浅拷贝](../questions/javascript/deep-clone.md) - 中级 ⭐⭐⭐⭐⭐

### 数组操作
- [数组的常见方法](../questions/javascript/array-methods.md) - 基础 ⭐⭐⭐⭐⭐
- [数组去重](../questions/javascript/array-dedup.md) - 基础 ⭐⭐⭐⭐⭐
- [对象数组去重](../questions/javascript/object-array-dedup.md) - 中级 ⭐⭐⭐⭐

### 原型与继承
- [原型与原型链](../questions/javascript/prototype-chain.md) - 中级 ⭐⭐⭐⭐⭐

### this 与函数
- [this 指向与箭头函数](../questions/javascript/this-binding.md) - 中级 ⭐⭐⭐⭐⭐
- [call、apply、bind](../questions/javascript/call-apply-bind.md) - 中级 ⭐⭐⭐⭐⭐
- [闭包](../questions/javascript/closure.md) - 中级 ⭐⭐⭐⭐⭐
- [为什么需要闭包](../questions/javascript/why-closure.md) - 中级 ⭐⭐⭐⭐⭐

### 异步编程
- [Promise详解](../questions/javascript/promise.md) - 中级 ⭐⭐⭐⭐⭐
- [async/await原理](../questions/javascript/async-await.md) - 中级 ⭐⭐⭐⭐⭐
- [事件循环](../questions/javascript/event-loop.md) - 中级 ⭐⭐⭐⭐⭐

### 基础语法
- [var/let/const区别](../questions/javascript/var-let-const.md) - 基础 ⭐⭐⭐⭐⭐
- [var作用域](../questions/javascript/var-scope.md) - 基础 ⭐⭐⭐⭐

## Vue

### 核心概念
- [Vue 2 和 Vue 3 的区别](../questions/vue/vue2-vs-vue3.md) - 中级 ⭐⭐⭐⭐⭐
- [Vue 生命周期](../questions/vue/lifecycle.md) - 基础 ⭐⭐⭐⭐⭐
- [computed 和 watch 的区别](../questions/vue/computed-vs-watch.md) - 基础 ⭐⭐⭐⭐⭐

### 指令与渲染
- [v-if 和 v-show 的区别](../questions/vue/v-if-vs-v-show.md) - 基础 ⭐⭐⭐⭐⭐
- [Vue 的 diff 算法](../questions/vue/diff-algorithm.md) - 高级 ⭐⭐⭐⭐⭐

### 组件通信
- [组件通信方式](../questions/vue/component-communication.md) - 中级 ⭐⭐⭐⭐⭐

### 原理机制
- [nextTick 原理](../questions/vue/nextTick.md) - 高级 ⭐⭐⭐⭐⭐

### 状态管理
- [用户信息存储](../questions/vue/user-state.md) - 基础 ⭐⭐⭐⭐

## 按难度分类

### 基础题目
- [CSS盒模型](../questions/css/box-model.md)
- [Position定位](../questions/css/position.md)
- [数组的常见方法](../questions/javascript/array-methods.md)
- [数组去重](../questions/javascript/array-dedup.md)
- [var/let/const区别](../questions/javascript/var-let-const.md)
- [var作用域](../questions/javascript/var-scope.md)
- [用户信息存储](../questions/vue/user-state.md)

### 中级题目
- [左固定右自适应布局](../questions/css/layout-flex.md)
- [水平垂直居中](../questions/css/center-methods.md)
- [对象数组去重](../questions/javascript/object-array-dedup.md)
- [Promise详解](../questions/javascript/promise.md)
- [事件循环](../questions/javascript/event-loop.md)
- [闭包](../questions/javascript/closure.md)
- [为什么需要闭包](../questions/javascript/why-closure.md)
- [强缓存和协商缓存](../questions/performance/cache-strategy.md)

### 高级题目
- [绝对定位vs Transform](../questions/performance/transform-vs-position.md)
- [nextTick原理](../questions/vue/nextTick.md)

## 知识点关联图

### CSS布局体系
```
CSS盒模型 → 左固定右自适应布局
         → 水平垂直居中
         → Position定位

Position定位 → 水平垂直居中
            → 绝对定位vs Transform
```

### JavaScript基础体系
```
var作用域 → var/let/const区别
         → 闭包

闭包 → 为什么需要闭包
    → 数组去重
    → 对象数组去重

事件循环 → nextTick原理
```

### 性能优化体系
```
绝对定位vs Transform → 水平垂直居中
                    → 浏览器渲染机制

强缓存和协商缓存 → HTTP协议
              → CDN原理
              → 浏览器缓存机制
```

## 学习路径推荐

### 入门路径（1-2周）
1. CSS盒模型
2. Position定位
3. var/let/const区别
4. 数组去重
5. 用户信息存储

### 进阶路径（2-3周）
1. 左固定右自适应布局
2. 水平垂直居中
3. var作用域
4. 闭包
5. 为什么需要闭包
6. 对象数组去重
7. 事件循环

### 高级路径（1-2周）
1. 绝对定位vs Transform
2. nextTick原理
3. 浏览器渲染机制
4. 性能优化实践

## 高频面试题

### 必考题（⭐⭐⭐⭐⭐）
- CSS盒模型
- 水平垂直居中
- 数组的常见方法
- 数组去重
- var/let/const区别
- Promise详解
- 事件循环
- 闭包
- 为什么需要闭包
- nextTick原理
- 强缓存和协商缓存

### 常考题（⭐⭐⭐⭐）
- 左固定右自适应布局
- Position定位
- 对象数组去重
- var作用域
- 用户信息存储
- 绝对定位vs Transform

## 按标签分类

### 布局相关
- CSS盒模型
- 左固定右自适应布局
- 水平垂直居中
- Position定位

### 异步相关
- Promise详解
- 事件循环
- nextTick原理

### 作用域相关
- var作用域
- var/let/const区别
- 闭包
- 为什么需要闭包

### 数组相关
- 数组的常见方法
- 数组去重
- 对象数组去重

### 性能相关
- 绝对定位vs Transform
- 强缓存和协商缓存
- nextTick原理

### 状态管理
- 用户信息存储
