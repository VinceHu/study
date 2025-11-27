---
layout: home

hero:
  name: "StudyClue"
  text: "系统化的面试题学习平台"
  tagline: 标准答案 + 深度理解 + 面试技巧，助你面试脱颖而出
  image:
    src: /hero-image.svg
    alt: 前端学习插图
  actions:
    - theme: brand
      text: 开始学习 →
      link: /knowledge-map/
    - theme: alt
      text: 查看题库
      link: /questions/css/box-model

features:
  - icon: 📝
    title: 标准答案
    details: 每道题都提供清晰的标准答案，快速掌握核心要点
  - icon: 🧠
    title: 深度理解
    details: 深入讲解底层原理，理解技术背后的"为什么"
  - icon: 💡
    title: 面试技巧
    details: 提供回答顺序、重点强调、常见追问，助你面试脱颖而出
  - icon: 💻
    title: 代码示例
    details: 包含可运行的代码示例，实践验证加深理解
  - icon: 🔗
    title: 知识关联
    details: 建立知识点之间的关联网络，系统化学习
  - icon: 📊
    title: 学习路径
    details: 提供入门、进阶、高级三条学习路径，循序渐进

---

## 📚 题库统计

<div class="stats-container">
  <div class="stat-item">
    <div class="stat-number">33</div>
    <div class="stat-label">总题目</div>
  </div>
  <div class="stat-item">
    <div class="stat-number">15</div>
    <div class="stat-label">JavaScript</div>
  </div>
  <div class="stat-item">
    <div class="stat-number">8</div>
    <div class="stat-label">Vue</div>
  </div>
  <div class="stat-item">
    <div class="stat-number">4</div>
    <div class="stat-label">CSS</div>
  </div>
  <div class="stat-item">
    <div class="stat-number">2</div>
    <div class="stat-label">浏览器</div>
  </div>
  <div class="stat-item">
    <div class="stat-number">4</div>
    <div class="stat-label">网络</div>
  </div>
</div>

<style>
.stats-container {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  min-width: 120px;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--vp-c-brand-1);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: var(--vp-c-text-2);
}
</style>

## 🎯 今日新增（2025-11-27）

### JavaScript 核心题目（6题）

- ✅ [数据类型与检测](/questions/javascript/data-types) - 基本类型 vs 引用类型，typeof vs instanceof
- ✅ [原型与原型链](/questions/javascript/prototype-chain) - __proto__ vs prototype，ES5/ES6 继承
- ✅ [this 指向与箭头函数](/questions/javascript/this-binding) - this 绑定规则，箭头函数特性
- ✅ [call、apply、bind](/questions/javascript/call-apply-bind) - 三者区别，手写实现
- ✅ [深拷贝vs浅拷贝](/questions/javascript/deep-clone) - JSON 方法缺陷，循环引用处理
- ✅ [async/await原理](/questions/javascript/async-await) - Generator + 自动执行器，并发控制

### Vue 核心题目（6题）

- ✅ [Vue 2 和 Vue 3 的区别](/questions/vue/vue2-vs-vue3) - 响应式原理，Composition API
- ✅ [Vue 生命周期](/questions/vue/lifecycle) - 父子组件执行顺序，钩子函数
- ✅ [v-if 和 v-show 的区别](/questions/vue/v-if-vs-v-show) - 条件渲染，性能对比
- ✅ [组件通信方式](/questions/vue/component-communication) - Props/Emit, Provide/Inject, Vuex/Pinia
- ✅ [computed 和 watch 的区别](/questions/vue/computed-vs-watch) - 缓存机制，使用场景
- ✅ [Vue 的 diff 算法](/questions/vue/diff-algorithm) - 双端比较，key 的作用

### 浏览器原理（2题）

- ✅ [从 URL 到页面展示](/questions/browser/url-to-page) - DNS、TCP、渲染流程
- ✅ [重绘与回流](/questions/browser/repaint-reflow) - 性能优化，减少回流

### 网络协议与安全（4题）

- ✅ [HTTP 版本对比](/questions/network/http-versions) - HTTP/1.1, 2.0, 3.0 的区别
- ✅ [TCP 三次握手和四次挥手](/questions/network/tcp-handshake) - 连接建立与断开
- ✅ [跨域 (CORS)](/questions/network/cors) - 同源策略，解决方案
- ✅ [前端安全 (XSS/CSRF)](/questions/network/security) - 攻击原理与防御

## 🚀 快速开始

1. **新手入门**：从 [CSS盒模型](/questions/css/box-model) 和 [数据类型与检测](/questions/javascript/data-types) 开始
2. **进阶学习**：查看 [知识图谱](/knowledge-map/) 了解完整学习路径
3. **系统复习**：按照难度和标签分类查找题目

## 💪 特色功能

### 📝 标准答案模板

每道题都包含：
- **核心要点**：快速掌握关键知识
- **详细说明**：深入理解技术细节
- **代码示例**：可运行的实践代码

### 🧠 深度理解

- **底层原理**：理解技术背后的"为什么"
- **常见误区**：避免踩坑
- **进阶知识**：拓展相关技术

### 💡 面试技巧

- **推荐回答顺序**：结构化表达
- **重点强调**：突出核心优势
- **可能的追问**：提前准备深度问题

## 🔥 高频面试题

### 必考题（⭐⭐⭐⭐⭐）

**JavaScript:**
- [数据类型与检测](/questions/javascript/data-types)
- [原型与原型链](/questions/javascript/prototype-chain)
- [this 指向与箭头函数](/questions/javascript/this-binding)
- [Promise详解](/questions/javascript/promise)
- [async/await原理](/questions/javascript/async-await)
- [事件循环](/questions/javascript/event-loop)
- [闭包](/questions/javascript/closure)
- [深拷贝vs浅拷贝](/questions/javascript/deep-clone)

**Vue:**
- [Vue 2 和 Vue 3 的区别](/questions/vue/vue2-vs-vue3)
- [Vue 生命周期](/questions/vue/lifecycle)
- [computed 和 watch 的区别](/questions/vue/computed-vs-watch)
- [组件通信方式](/questions/vue/component-communication)
- [Vue 的 diff 算法](/questions/vue/diff-algorithm)

### 常考题（⭐⭐⭐⭐）

- [call、apply、bind](/questions/javascript/call-apply-bind)
- [数组的常见方法](/questions/javascript/array-methods)
- [v-if 和 v-show 的区别](/questions/vue/v-if-vs-v-show)
- [水平垂直居中](/questions/css/center-methods)
- [强缓存和协商缓存](/questions/performance/cache-strategy)
