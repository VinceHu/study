---
title: Vue 双向数据绑定原理 - Vue2 与 Vue3 实现对比
description: 深入理解 Vue 双向数据绑定的实现原理，对比 Vue2 的 Object.defineProperty 和 Vue3 的 Proxy 方案，掌握响应式系统的核心机制
keywords: Vue双向绑定, v-model原理, 响应式原理, Object.defineProperty, Proxy, 数据劫持, 发布订阅
date: 2025-12-12
category: Vue
difficulty: 中级
tags: [Vue, 双向绑定, 响应式, v-model, 数据劫持, Proxy]
related: [vue2-vs-vue3.md, computed-vs-watch.md]
hasCode: true
---

# 题目

请详细说明 Vue 双向数据绑定的原理是什么？结合 Vue2 和 Vue3 的实现进行对比。

## 📝 标准答案

### 核心要点

1. **双向绑定的本质**：通过**数据劫持**结合**发布订阅模式**来实现数据和视图的同步
2. **双向的含义**：数据发生变化，视图跟着变化；视图变化，数据也随之发生改变
3. **Vue2 实现**：使用 `Object.defineProperty` 劫持属性的 getter/setter
4. **Vue3 实现**：使用 `Proxy` 代理整个对象，功能更强大、性能更好

### 什么是双向数据绑定？

根据 [Vue 官方文档](https://cn.vuejs.org/guide/essentials/forms.html)，双向绑定是指：

> 在前端处理表单时，我们常常需要将表单输入框的内容同步给 JavaScript 中相应的变量。手动连接值绑定和更改事件监听器可能会很麻烦，`v-model` 指令帮我们简化了这一步骤。

**双向绑定的两个方向**：

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│    ┌──────────┐                      ┌──────────┐      │
│    │   Data   │  ───── 响应式 ─────→ │   View   │      │
│    │  (数据)  │                      │  (视图)  │      │
│    │          │  ←──── 事件 ────────  │          │      │
│    └──────────┘                      └──────────┘      │
│                                                         │
│    方向1：数据变化 → 视图自动更新（响应式系统）           │
│    方向2：视图变化 → 数据自动更新（事件监听）            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**简单示例**：

```vue
<template>
  <!-- 双向绑定：输入框内容和 message 变量保持同步 -->
  <input v-model="message" />
  <p>{{ message }}</p>
</template>

<script setup>
import { ref } from 'vue';
const message = ref('Hello');

// 当用户在输入框输入时，message 自动更新
// 当代码修改 message 时，输入框内容自动更新
</script>
```

### 实现原理概述

Vue 的双向绑定是通过**数据劫持**结合**发布订阅模式**来实现的：

1. **数据劫持**：拦截对数据的读取和修改操作
2. **发布订阅**：数据变化时通知所有订阅者（视图）更新

```
数据劫持 + 发布订阅 = 响应式系统

┌─────────────────────────────────────────────────────────┐
│                     响应式系统                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐      ┌─────────────┐                  │
│  │  数据劫持    │      │  发布订阅    │                  │
│  │             │      │             │                  │
│  │ 拦截 getter │      │ Dep 收集    │                  │
│  │ 拦截 setter │      │ Watcher     │                  │
│  │             │      │ 通知更新    │                  │
│  └─────────────┘      └─────────────┘                  │
│         │                    │                         │
│         └────────┬───────────┘                         │
│                  ▼                                     │
│         数据变化自动更新视图                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 双向绑定的组成

```
┌─────────────────────────────────────────────────────────┐
│                    Vue 双向绑定                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────┐    数据劫持     ┌─────────┐              │
│   │  Data   │ ─────────────→ │ Observer │              │
│   └─────────┘                └────┬────┘              │
│                                   │                    │
│                          getter/setter                 │
│                                   │                    │
│   ┌─────────┐                ┌────▼────┐              │
│   │ Watcher │ ←───────────── │   Dep   │              │
│   └────┬────┘    依赖收集     └─────────┘              │
│        │                                               │
│        │ 通知更新                                       │
│        ▼                                               │
│   ┌─────────┐                ┌─────────┐              │
│   │ Compiler│ ─────────────→ │  View   │              │
│   └─────────┘    更新视图     └─────────┘              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**四个核心角色**：

| 角色 | 职责 |
|------|------|
| Observer | 数据劫持，监听数据变化 |
| Dep | 依赖收集器，管理所有 Watcher |
| Watcher | 观察者，数据变化时执行回调 |
| Compiler | 编译模板，绑定更新函数 |

## 🧠 深度理解

### Vue2 实现原理

**1. Observer - 数据劫持**

```javascript
class Observer {
  constructor(data) {
    this.walk(data);
  }
  
  walk(data) {
    if (!data || typeof data !== 'object') return;
    
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key]);
    });
  }
  
  defineReactive(obj, key, val) {
    const dep = new Dep();  // 每个属性都有一个 Dep
    
    // 递归处理嵌套对象
    this.walk(val);
    
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        // 依赖收集：将当前 Watcher 添加到 Dep
        if (Dep.target) {
          dep.addSub(Dep.target);
        }
        return val;
      },
      set(newVal) {
        if (newVal === val) return;
        val = newVal;
        // 新值可能是对象，需要重新观察
        this.walk(newVal);
        // 派发更新：通知所有 Watcher
        dep.notify();
      }
    });
  }
}
```

**2. Dep - 依赖收集器**

```javascript
class Dep {
  static target = null;  // 当前正在计算的 Watcher
  
  constructor() {
    this.subs = [];  // 存储所有 Watcher
  }
  
  addSub(watcher) {
    this.subs.push(watcher);
  }
  
  removeSub(watcher) {
    const index = this.subs.indexOf(watcher);
    if (index > -1) {
      this.subs.splice(index, 1);
    }
  }
  
  notify() {
    // 通知所有 Watcher 更新
    this.subs.forEach(watcher => watcher.update());
  }
}
```

**3. Watcher - 观察者**

```javascript
class Watcher {
  constructor(vm, expr, callback) {
    this.vm = vm;
    this.expr = expr;
    this.callback = callback;
    
    // 获取旧值，同时触发依赖收集
    this.oldValue = this.get();
  }
  
  get() {
    // 将当前 Watcher 设为全局目标
    Dep.target = this;
    // 访问数据，触发 getter，完成依赖收集
    const value = this.getVal(this.vm, this.expr);
    // 清空目标
    Dep.target = null;
    return value;
  }
  
  getVal(vm, expr) {
    return expr.split('.').reduce((data, key) => data[key], vm.$data);
  }
  
  update() {
    const newValue = this.getVal(this.vm, this.expr);
    if (newValue !== this.oldValue) {
      this.callback(newValue, this.oldValue);
      this.oldValue = newValue;
    }
  }
}
```

**4. Compiler - 模板编译**

```javascript
class Compiler {
  constructor(el, vm) {
    this.vm = vm;
    this.el = document.querySelector(el);
    this.compile(this.el);
  }
  
  compile(node) {
    const childNodes = node.childNodes;
    
    [...childNodes].forEach(child => {
      if (child.nodeType === 1) {
        // 元素节点：处理指令
        this.compileElement(child);
      } else if (child.nodeType === 3) {
        // 文本节点：处理 {{ }}
        this.compileText(child);
      }
      
      // 递归编译子节点
      if (child.childNodes && child.childNodes.length) {
        this.compile(child);
      }
    });
  }
  
  compileElement(node) {
    const attrs = node.attributes;
    
    [...attrs].forEach(attr => {
      const { name, value } = attr;
      
      if (name.startsWith('v-')) {
        const directive = name.slice(2);
        
        if (directive === 'model') {
          // v-model 双向绑定
          this.model(node, value);
        } else if (directive === 'on:click' || directive === 'click') {
          // 事件绑定
          this.bindEvent(node, value, 'click');
        }
      }
    });
  }
  
  // v-model 实现
  model(node, expr) {
    const value = this.getVal(expr);
    
    // 数据 → 视图
    node.value = value;
    
    // 创建 Watcher，数据变化时更新视图
    new Watcher(this.vm, expr, (newVal) => {
      node.value = newVal;
    });
    
    // 视图 → 数据
    node.addEventListener('input', (e) => {
      this.setVal(expr, e.target.value);
    });
  }
  
  compileText(node) {
    const content = node.textContent;
    const reg = /\{\{(.+?)\}\}/g;
    
    if (reg.test(content)) {
      const expr = RegExp.$1.trim();
      node.textContent = this.getVal(expr);
      
      // 创建 Watcher
      new Watcher(this.vm, expr, (newVal) => {
        node.textContent = newVal;
      });
    }
  }
  
  getVal(expr) {
    return expr.split('.').reduce((data, key) => data[key], this.vm.$data);
  }
  
  setVal(expr, value) {
    const keys = expr.split('.');
    const lastKey = keys.pop();
    const obj = keys.reduce((data, key) => data[key], this.vm.$data);
    obj[lastKey] = value;
  }
}
```

**5. 完整的 Vue2 简易实现**

```javascript
class Vue2 {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    this.$options = options;
    
    if (this.$el) {
      // 1. 数据劫持
      new Observer(this.$data);
      
      // 2. 代理 data 到 vm 实例
      this.proxyData(this.$data);
      
      // 3. 编译模板
      new Compiler(this.$el, this);
    }
  }
  
  proxyData(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        get() {
          return data[key];
        },
        set(newVal) {
          data[key] = newVal;
        }
      });
    });
  }
}

// 使用
const vm = new Vue2({
  el: '#app',
  data: {
    message: 'Hello Vue2',
    user: { name: 'Alice' }
  }
});
```


### Vue3 实现原理

**1. reactive - Proxy 响应式**

```javascript
// 存储依赖关系：target -> key -> effects
const targetMap = new WeakMap();

// 当前正在执行的 effect
let activeEffect = null;

function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      
      // 依赖收集
      track(target, key);
      
      // 深层响应式（懒代理）
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      
      return result;
    },
    
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      
      // 值变化时触发更新
      if (oldValue !== value) {
        trigger(target, key);
      }
      
      return result;
    },
    
    deleteProperty(target, key) {
      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      const result = Reflect.deleteProperty(target, key);
      
      if (hadKey && result) {
        trigger(target, key);
      }
      
      return result;
    }
  });
}
```

**2. track - 依赖收集**

```javascript
function track(target, key) {
  if (!activeEffect) return;
  
  // 获取 target 对应的 depsMap
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  
  // 获取 key 对应的 dep（Set 存储 effects）
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  
  // 添加当前 effect
  dep.add(activeEffect);
}
```

**3. trigger - 派发更新**

```javascript
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  
  const dep = depsMap.get(key);
  if (!dep) return;
  
  // 执行所有 effect
  dep.forEach(effect => {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect();
    }
  });
}
```

**4. effect - 副作用函数**

```javascript
function effect(fn, options = {}) {
  const effectFn = () => {
    activeEffect = effectFn;
    const result = fn();
    activeEffect = null;
    return result;
  };
  
  effectFn.scheduler = options.scheduler;
  
  // 立即执行一次，触发依赖收集
  if (!options.lazy) {
    effectFn();
  }
  
  return effectFn;
}
```

**5. ref - 基本类型响应式**

```javascript
function ref(value) {
  return {
    get value() {
      track(this, 'value');
      return value;
    },
    set value(newValue) {
      if (newValue !== value) {
        value = newValue;
        trigger(this, 'value');
      }
    }
  };
}

// 更完整的实现
class RefImpl {
  constructor(value) {
    this._value = value;
    this.__v_isRef = true;
  }
  
  get value() {
    track(this, 'value');
    return this._value;
  }
  
  set value(newValue) {
    if (newValue !== this._value) {
      this._value = newValue;
      trigger(this, 'value');
    }
  }
}

function ref(value) {
  return new RefImpl(value);
}
```

**6. computed - 计算属性**

```javascript
function computed(getter) {
  let value;
  let dirty = true;  // 是否需要重新计算
  
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true;
      trigger(obj, 'value');
    }
  });
  
  const obj = {
    get value() {
      if (dirty) {
        value = effectFn();
        dirty = false;
      }
      track(obj, 'value');
      return value;
    }
  };
  
  return obj;
}

// 使用
const count = ref(1);
const double = computed(() => count.value * 2);

console.log(double.value);  // 2
count.value = 2;
console.log(double.value);  // 4
```

**7. watch - 侦听器**

```javascript
function watch(source, callback, options = {}) {
  let getter;
  
  if (typeof source === 'function') {
    getter = source;
  } else {
    getter = () => traverse(source);
  }
  
  let oldValue, newValue;
  
  const job = () => {
    newValue = effectFn();
    callback(newValue, oldValue);
    oldValue = newValue;
  };
  
  const effectFn = effect(getter, {
    lazy: true,
    scheduler: job
  });
  
  if (options.immediate) {
    job();
  } else {
    oldValue = effectFn();
  }
}

// 递归遍历对象，触发所有属性的 getter
function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) {
    return value;
  }
  
  seen.add(value);
  
  for (const key in value) {
    traverse(value[key], seen);
  }
  
  return value;
}
```

### Vue2 vs Vue3 对比

| 特性 | Vue2 (Object.defineProperty) | Vue3 (Proxy) |
|------|------------------------------|--------------|
| 监听新增属性 | ❌ 需要 `$set` | ✅ 自动监听 |
| 监听删除属性 | ❌ 需要 `$delete` | ✅ 自动监听 |
| 监听数组索引 | ❌ 不支持 | ✅ 支持 |
| 监听数组 length | ❌ 不支持 | ✅ 支持 |
| 监听 Map/Set | ❌ 不支持 | ✅ 支持 |
| 初始化性能 | 递归遍历所有属性 | 懒代理，按需递归 |
| 内存占用 | 每个属性一个 Dep | 使用 WeakMap |
| 浏览器兼容 | IE9+ | 不支持 IE |

### v-model 的本质

**v-model 是语法糖**：

```vue
<!-- v-model 写法 -->
<input v-model="message" />

<!-- 等价于 -->
<input :value="message" @input="message = $event.target.value" />
```

**自定义组件的 v-model**：

```vue
<!-- Vue2 -->
<template>
  <input :value="value" @input="$emit('input', $event.target.value)" />
</template>

<script>
export default {
  props: ['value']  // 默认 prop 是 value
};
</script>

<!-- Vue3 -->
<template>
  <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
</template>

<script setup>
defineProps(['modelValue']);  // 默认 prop 是 modelValue
defineEmits(['update:modelValue']);
</script>
```

**Vue3 多个 v-model**：

```vue
<!-- 父组件 -->
<UserForm v-model:name="userName" v-model:age="userAge" />

<!-- 子组件 -->
<template>
  <input :value="name" @input="$emit('update:name', $event.target.value)" />
  <input :value="age" @input="$emit('update:age', $event.target.value)" />
</template>

<script setup>
defineProps(['name', 'age']);
defineEmits(['update:name', 'update:age']);
</script>
```


### 常见误区

**1. 误区：双向绑定 = 响应式**

```javascript
// ❌ 错误理解
// 双向绑定和响应式是两个概念

// ✅ 正确理解
// 响应式：数据变化 → 视图更新（单向）
// 双向绑定：数据 ↔ 视图（双向，v-model 实现）
```

**2. 误区：Vue2 无法监听数组变化**

```javascript
// ❌ 错误：Vue2 完全无法监听数组
// ✅ 正确：Vue2 重写了数组的 7 个方法

// Vue2 可以监听的数组操作
const arr = [1, 2, 3];
arr.push(4);     // ✅ 可以监听
arr.pop();       // ✅ 可以监听
arr.shift();     // ✅ 可以监听
arr.unshift(0);  // ✅ 可以监听
arr.splice(1, 1);// ✅ 可以监听
arr.sort();      // ✅ 可以监听
arr.reverse();   // ✅ 可以监听

// Vue2 无法监听的数组操作
arr[0] = 10;     // ❌ 无法监听
arr.length = 0;  // ❌ 无法监听
```

**3. 误区：Proxy 性能一定比 defineProperty 好**

```javascript
// ❌ 错误：Proxy 在所有场景都更快
// ✅ 正确：各有优劣

// Proxy 优势：
// - 懒代理，初始化更快
// - 功能更全面

// defineProperty 优势：
// - 单个属性访问可能更快
// - 兼容性更好
```

## 💡 面试回答技巧

### 🎯 一句话回答（快速版）

> Vue 的双向绑定是通过数据劫持结合发布订阅模式实现的，Vue2 用 Object.defineProperty，Vue3 用 Proxy，实现数据变化自动更新视图，视图变化自动更新数据。

### 📣 口语化回答（推荐）

面试时可以这样回答：

> "Vue 的双向数据绑定是通过**数据劫持**结合**发布订阅模式**来实现的。
>
> 简单来说，就是数据和视图保持同步：数据变了，视图自动更新；用户在页面上输入内容，数据也会自动改变。
>
> 具体实现上，Vue2 用的是 `Object.defineProperty`，它会劫持对象属性的 getter 和 setter。当我们访问数据时，会进行依赖收集，把当前组件记录下来；当数据变化时，会通知所有依赖这个数据的组件去更新。
>
> Vue3 改用了 `Proxy`，它可以代理整个对象，好处是能监听到新增属性、删除属性、数组索引变化这些 Vue2 监听不到的操作。而且 Vue3 用的是懒代理，只有访问到深层属性时才会代理，性能更好。
>
> 另外，我们常用的 `v-model` 其实是个语法糖，本质上就是 `:value` 加 `@input` 的组合，一个负责数据到视图，一个负责视图到数据。"

### 推荐回答顺序

1. **先说双向绑定的本质**：
   - "双向绑定是数据和视图的双向同步"
   - "数据变化自动更新视图，视图变化自动更新数据"

2. **再说实现机制**：
   - "核心是数据劫持 + 发布订阅模式"
   - "Observer 劫持数据，Dep 收集依赖，Watcher 响应变化"

3. **然后对比 Vue2 和 Vue3**：
   - "Vue2 用 Object.defineProperty，Vue3 用 Proxy"
   - "Proxy 可以监听新增/删除属性，性能更好"

4. **最后说 v-model**：
   - "v-model 是语法糖，本质是 :value + @input"

### 加分回答

- 提到依赖收集的时机（getter 中收集）
- 说明 Vue2 数组的特殊处理（重写 7 个方法）
- 对比 Vue3 的懒代理优化
- 提到 WeakMap 的内存优化

### 可能的追问

**Q1: 为什么 Vue2 要重写数组方法？**

A: 因为 `Object.defineProperty` 无法监听数组索引和 length 变化，所以 Vue2 重写了 push、pop、shift、unshift、splice、sort、reverse 这 7 个会改变原数组的方法，在方法内部手动触发更新。

**Q2: Vue3 的 Proxy 为什么是懒代理？**

A: Vue3 只在访问属性时才对嵌套对象进行代理，而不是初始化时递归遍历所有属性。这样可以减少初始化时间和内存占用，特别是对于大型对象。

**Q3: 依赖收集是什么时候发生的？**

A: 在组件渲染时，访问响应式数据会触发 getter，此时会将当前的渲染 Watcher 添加到该属性的 Dep 中。当数据变化时，setter 会通知 Dep 中的所有 Watcher 更新。

**Q4: computed 和 watch 的响应式原理有什么区别？**

A:
- computed：有缓存，只有依赖变化才重新计算，使用 lazy Watcher
- watch：没有缓存，数据变化立即执行回调，可以执行异步操作

## 💻 完整代码示例

### 手写简易 Vue2 响应式

```javascript
// ==================== 完整的 Vue2 响应式实现 ====================

// Dep：依赖收集器
class Dep {
  static target = null;
  
  constructor() {
    this.subs = [];
  }
  
  addSub(watcher) {
    this.subs.push(watcher);
  }
  
  notify() {
    this.subs.forEach(watcher => watcher.update());
  }
}

// Observer：数据劫持
class Observer {
  constructor(data) {
    this.walk(data);
  }
  
  walk(data) {
    if (!data || typeof data !== 'object') return;
    
    // 处理数组
    if (Array.isArray(data)) {
      this.observeArray(data);
      return;
    }
    
    // 处理对象
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key]);
    });
  }
  
  observeArray(arr) {
    // 重写数组方法
    const arrayProto = Array.prototype;
    const arrayMethods = Object.create(arrayProto);
    const methodsToPatch = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
    
    methodsToPatch.forEach(method => {
      arrayMethods[method] = function(...args) {
        const result = arrayProto[method].apply(this, args);
        // 触发更新
        this.__ob__.dep.notify();
        return result;
      };
    });
    
    arr.__proto__ = arrayMethods;
    arr.__ob__ = { dep: new Dep() };
    
    // 观察数组中的每个元素
    arr.forEach(item => this.walk(item));
  }
  
  defineReactive(obj, key, val) {
    const dep = new Dep();
    const self = this;
    
    // 递归处理嵌套对象
    this.walk(val);
    
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        if (Dep.target) {
          dep.addSub(Dep.target);
        }
        return val;
      },
      set(newVal) {
        if (newVal === val) return;
        val = newVal;
        self.walk(newVal);
        dep.notify();
      }
    });
  }
}

// Watcher：观察者
class Watcher {
  constructor(vm, expr, callback) {
    this.vm = vm;
    this.expr = expr;
    this.callback = callback;
    this.oldValue = this.get();
  }
  
  get() {
    Dep.target = this;
    const value = this.getVal();
    Dep.target = null;
    return value;
  }
  
  getVal() {
    return this.expr.split('.').reduce((data, key) => data[key], this.vm.$data);
  }
  
  update() {
    const newValue = this.getVal();
    if (newValue !== this.oldValue) {
      this.callback(newValue, this.oldValue);
      this.oldValue = newValue;
    }
  }
}

// Vue：主类
class Vue2 {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    
    // 数据劫持
    new Observer(this.$data);
    
    // 代理数据
    this.proxyData();
    
    // 编译模板（简化版）
    this.compile();
  }
  
  proxyData() {
    Object.keys(this.$data).forEach(key => {
      Object.defineProperty(this, key, {
        get: () => this.$data[key],
        set: (val) => { this.$data[key] = val; }
      });
    });
  }
  
  compile() {
    // 简化：直接创建 Watcher
  }
  
  $watch(expr, callback) {
    new Watcher(this, expr, callback);
  }
}

// 测试
const vm = new Vue2({
  el: '#app',
  data: {
    message: 'Hello',
    user: { name: 'Alice' }
  }
});

vm.$watch('message', (newVal, oldVal) => {
  console.log(`message 从 ${oldVal} 变为 ${newVal}`);
});

vm.message = 'World';  // 输出：message 从 Hello 变为 World
```

### 手写简易 Vue3 响应式

```javascript
// ==================== 完整的 Vue3 响应式实现 ====================

const targetMap = new WeakMap();
let activeEffect = null;
const effectStack = [];

// track：依赖收集
function track(target, key) {
  if (!activeEffect) return;
  
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  
  dep.add(activeEffect);
}

// trigger：派发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  
  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => {
      if (effect !== activeEffect) {
        effect.scheduler ? effect.scheduler() : effect();
      }
    });
  }
}

// reactive：响应式对象
function reactive(target) {
  if (typeof target !== 'object' || target === null) {
    return target;
  }
  
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key);
      
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      return result;
    },
    
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      
      if (oldValue !== value) {
        trigger(target, key);
      }
      return result;
    },
    
    deleteProperty(target, key) {
      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      const result = Reflect.deleteProperty(target, key);
      
      if (hadKey && result) {
        trigger(target, key);
      }
      return result;
    }
  });
}

// ref：响应式基本类型
function ref(value) {
  return {
    __v_isRef: true,
    get value() {
      track(this, 'value');
      return value;
    },
    set value(newValue) {
      if (newValue !== value) {
        value = newValue;
        trigger(this, 'value');
      }
    }
  };
}

// effect：副作用函数
function effect(fn, options = {}) {
  const effectFn = () => {
    activeEffect = effectFn;
    effectStack.push(effectFn);
    const result = fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return result;
  };
  
  effectFn.scheduler = options.scheduler;
  
  if (!options.lazy) {
    effectFn();
  }
  
  return effectFn;
}

// computed：计算属性
function computed(getter) {
  let value;
  let dirty = true;
  
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true;
      trigger(obj, 'value');
    }
  });
  
  const obj = {
    get value() {
      if (dirty) {
        value = effectFn();
        dirty = false;
      }
      track(obj, 'value');
      return value;
    }
  };
  
  return obj;
}

// 测试
const state = reactive({ count: 0, user: { name: 'Alice' } });

effect(() => {
  console.log('count:', state.count);
});

state.count++;  // 输出：count: 1
state.count++;  // 输出：count: 2

// 测试新增属性
state.newProp = 'test';  // Vue3 可以监听

// 测试 ref
const num = ref(0);
effect(() => {
  console.log('num:', num.value);
});
num.value++;  // 输出：num: 1

// 测试 computed
const double = computed(() => state.count * 2);
console.log(double.value);  // 4
state.count++;
console.log(double.value);  // 6
```

## 🔗 相关知识点

- [Vue2 和 Vue3 的区别](./vue2-vs-vue3.md)
- [computed 和 watch 的区别](./computed-vs-watch.md)
- [Vue 生命周期](./lifecycle.md)

## 📚 参考资料

- [Vue 3 响应式原理](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html)
- [Vue 2 响应式原理](https://v2.cn.vuejs.org/v2/guide/reactivity.html)
- [MDN - Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [MDN - Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
