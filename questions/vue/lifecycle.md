---
title: Vue 生命周期详解 - 父子组件执行顺序与钩子函数
description: 深入理解 Vue 生命周期的 8 个钩子函数，掌握父子组件生命周期的执行顺序，学习生命周期的最佳实践
keywords: Vue生命周期, 钩子函数, 父子组件, beforeCreate created mounted, Vue面试
date: 2025-11-27
category: Vue
difficulty: 基础
tags: [生命周期, 父子组件, 钩子函数, 执行顺序]
related: [vue2-vs-vue3.md, component-communication.md]
hasCode: true
---

# 题目

请详细说明 Vue 的生命周期，以及父子组件生命周期的执行顺序。

## 📝 标准答案

### 核心要点

1. **Vue 2 生命周期（8个）**：
   - 创建阶段：beforeCreate、created
   - 挂载阶段：beforeMount、mounted
   - 更新阶段：beforeUpdate、updated
   - 销毁阶段：beforeDestroy、destroyed

2. **Vue 3 生命周期**：
   - 销毁阶段改名：beforeUnmount、unmounted
   - Composition API：onMounted、onUpdated 等

3. **父子组件生命周期执行顺序**：
   - 挂载：父 beforeCreate → 父 created → 父 beforeMount → 子 beforeCreate → 子 created → 子 beforeMount → 子 mounted → 父 mounted
   - 更新：父 beforeUpdate → 子 beforeUpdate → 子 updated → 父 updated
   - 销毁：父 beforeDestroy → 子 beforeDestroy → 子 destroyed → 父 destroyed

### 详细说明

#### Vue 2 生命周期

```vue
<script>
export default {
  // 1. 创建前：实例初始化之后，数据观测和事件配置之前
  beforeCreate() {
    console.log('beforeCreate');
    console.log('data:', this.message);  // undefined
    console.log('methods:', this.sayHi);  // undefined
  },
  
  // 2. 创建后：实例创建完成，数据观测、属性和方法的运算、watch/event 事件回调已配置
  created() {
    console.log('created');
    console.log('data:', this.message);  // 'Hello'
    console.log('methods:', this.sayHi);  // function
    console.log('$el:', this.$el);  // undefined（DOM 未挂载）
    
    // ✅ 适合：数据初始化、API 调用
    this.fetchData();
  },
  
  // 3. 挂载前：在挂载开始之前被调用，render 函数首次被调用
  beforeMount() {
    console.log('beforeMount');
    console.log('$el:', this.$el);  // 虚拟 DOM
  },
  
  // 4. 挂载后：实例被挂载后调用，el 被新创建的 vm.$el 替换
  mounted() {
    console.log('mounted');
    console.log('$el:', this.$el);  // 真实 DOM
    
    // ✅ 适合：DOM 操作、第三方库初始化
    this.$refs.input.focus();
  },
  
  // 5. 更新前：数据更新时调用，发生在虚拟 DOM 打补丁之前
  beforeUpdate() {
    console.log('beforeUpdate');
    console.log('DOM:', this.$el.textContent);  // 旧值
    console.log('data:', this.message);  // 新值
  },
  
  // 6. 更新后：虚拟 DOM 重新渲染和打补丁之后调用
  updated() {
    console.log('updated');
    console.log('DOM:', this.$el.textContent);  // 新值
    
    // ⚠️ 避免在此修改数据，可能导致无限循环
  },
  
  // 7. 销毁前：实例销毁之前调用，实例仍然完全可用
  beforeDestroy() {
    console.log('beforeDestroy');
    
    // ✅ 适合：清理定时器、取消订阅、解绑事件
    clearInterval(this.timer);
    window.removeEventListener('resize', this.handleResize);
  },
  
  // 8. 销毁后：实例销毁后调用，所有指令被解绑，事件监听器被移除
  destroyed() {
    console.log('destroyed');
  },
  
  data() {
    return {
      message: 'Hello'
    };
  },
  
  methods: {
    sayHi() {
      console.log('Hi');
    },
    fetchData() {
      // API 调用
    }
  }
};
</script>
```

#### Vue 3 生命周期

**Options API（与 Vue 2 类似）：**

```vue
<script>
export default {
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeUnmount() {},  // Vue 2 的 beforeDestroy
  unmounted() {},      // Vue 2 的 destroyed
  errorCaptured() {}
};
</script>
```

**Composition API：**

```vue
<script setup>
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured
} from 'vue';

// setup() 相当于 beforeCreate 和 created
console.log('setup');

onBeforeMount(() => {
  console.log('onBeforeMount');
});

onMounted(() => {
  console.log('onMounted');
  // DOM 操作
});

onBeforeUpdate(() => {
  console.log('onBeforeUpdate');
});

onUpdated(() => {
  console.log('onUpdated');
});

onBeforeUnmount(() => {
  console.log('onBeforeUnmount');
  // 清理工作
});

onUnmounted(() => {
  console.log('onUnmounted');
});

onErrorCaptured((err, instance, info) => {
  console.log('onErrorCaptured', err);
  return false;  // 阻止错误继续传播
});
</script>
```

## 🧠 深度理解

### 父子组件生命周期执行顺序

#### 1. 挂载阶段

```vue
<!-- Parent.vue -->
<template>
  <div>
    <p>Parent</p>
    <Child />
  </div>
</template>

<script>
export default {
  beforeCreate() { console.log('父 beforeCreate'); },
  created() { console.log('父 created'); },
  beforeMount() { console.log('父 beforeMount'); },
  mounted() { console.log('父 mounted'); }
};
</script>

<!-- Child.vue -->
<script>
export default {
  beforeCreate() { console.log('子 beforeCreate'); },
  created() { console.log('子 created'); },
  beforeMount() { console.log('子 beforeMount'); },
  mounted() { console.log('子 mounted'); }
};
</script>
```

**执行顺序：**
```
父 beforeCreate
父 created
父 beforeMount
  子 beforeCreate
  子 created
  子 beforeMount
  子 mounted
父 mounted
```

**记忆口诀**：父创建 → 父挂载前 → 子创建 → 子挂载 → 父挂载

#### 2. 更新阶段

```vue
<!-- Parent.vue -->
<template>
  <div>
    <p>{{ parentMsg }}</p>
    <Child :msg="parentMsg" />
    <button @click="parentMsg = 'Updated'">Update</button>
  </div>
</template>

<script>
export default {
  data() {
    return { parentMsg: 'Hello' };
  },
  beforeUpdate() { console.log('父 beforeUpdate'); },
  updated() { console.log('父 updated'); }
};
</script>

<!-- Child.vue -->
<script>
export default {
  props: ['msg'],
  beforeUpdate() { console.log('子 beforeUpdate'); },
  updated() { console.log('子 updated'); }
};
</script>
```

**执行顺序：**
```
父 beforeUpdate
子 beforeUpdate
子 updated
父 updated
```

**记忆口诀**：父更新前 → 子更新前 → 子更新后 → 父更新后

#### 3. 销毁阶段

```vue
<!-- Parent.vue -->
<template>
  <div>
    <Child v-if="show" />
    <button @click="show = false">Destroy</button>
  </div>
</template>

<script>
export default {
  data() {
    return { show: true };
  },
  beforeDestroy() { console.log('父 beforeDestroy'); },
  destroyed() { console.log('父 destroyed'); }
};
</script>

<!-- Child.vue -->
<script>
export default {
  beforeDestroy() { console.log('子 beforeDestroy'); },
  destroyed() { console.log('子 destroyed'); }
};
</script>
```

**执行顺序：**
```
父 beforeDestroy
子 beforeDestroy
子 destroyed
父 destroyed
```

**记忆口诀**：父销毁前 → 子销毁前 → 子销毁后 → 父销毁后

### 生命周期的应用场景

#### 1. created - 数据初始化

```vue
<script>
export default {
  data() {
    return {
      user: null,
      posts: []
    };
  },
  
  created() {
    // ✅ 适合：API 调用、数据初始化
    this.fetchUser();
    this.fetchPosts();
    
    // ✅ 适合：设置定时器
    this.timer = setInterval(() => {
      this.checkNotifications();
    }, 5000);
    
    // ✅ 适合：事件监听（非 DOM）
    this.$bus.$on('refresh', this.handleRefresh);
  },
  
  methods: {
    async fetchUser() {
      const res = await fetch('/api/user');
      this.user = await res.json();
    },
    async fetchPosts() {
      const res = await fetch('/api/posts');
      this.posts = await res.json();
    }
  }
};
</script>
```

#### 2. mounted - DOM 操作

```vue
<template>
  <div>
    <input ref="input" />
    <div ref="chart"></div>
  </div>
</template>

<script>
export default {
  mounted() {
    // ✅ 适合：DOM 操作
    this.$refs.input.focus();
    
    // ✅ 适合：第三方库初始化
    this.chart = echarts.init(this.$refs.chart);
    this.chart.setOption({
      // ...
    });
    
    // ✅ 适合：DOM 事件监听
    window.addEventListener('resize', this.handleResize);
    
    // ✅ 适合：获取 DOM 尺寸
    const { width, height } = this.$el.getBoundingClientRect();
    console.log(width, height);
  },
  
  methods: {
    handleResize() {
      this.chart.resize();
    }
  }
};
</script>
```

#### 3. beforeDestroy/beforeUnmount - 清理工作

```vue
<script>
export default {
  data() {
    return {
      timer: null,
      observer: null
    };
  },
  
  mounted() {
    // 设置定时器
    this.timer = setInterval(() => {
      console.log('tick');
    }, 1000);
    
    // 创建观察器
    this.observer = new IntersectionObserver(entries => {
      // ...
    });
    this.observer.observe(this.$el);
    
    // 监听事件
    window.addEventListener('resize', this.handleResize);
    this.$bus.$on('refresh', this.handleRefresh);
  },
  
  beforeDestroy() {
    // ✅ 清理定时器
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    // ✅ 断开观察器
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    // ✅ 移除事件监听
    window.removeEventListener('resize', this.handleResize);
    this.$bus.$off('refresh', this.handleRefresh);
    
    // ✅ 取消未完成的请求
    if (this.cancelToken) {
      this.cancelToken.cancel('Component destroyed');
    }
  }
};
</script>
```

### 常见误区

1. **误区：在 created 中操作 DOM**
   ```vue
   <script>
   export default {
     created() {
       // ❌ 错误：此时 DOM 还未挂载
       this.$refs.input.focus();  // undefined
     },
     
     mounted() {
       // ✅ 正确：DOM 已挂载
       this.$refs.input.focus();
     }
   };
   </script>
   ```

2. **误区：在 updated 中修改数据**
   ```vue
   <script>
   export default {
     data() {
       return { count: 0 };
     },
     
     updated() {
       // ❌ 错误：可能导致无限循环
       this.count++;
     }
   };
   </script>
   ```

3. **误区：忘记清理副作用**
   ```vue
   <script>
   export default {
     mounted() {
       this.timer = setInterval(() => {
         console.log('tick');
       }, 1000);
       
       // ❌ 忘记清理，导致内存泄漏
     }
   };
   </script>
   ```

4. **误区：在 beforeCreate 中访问 data**
   ```vue
   <script>
   export default {
     data() {
       return { message: 'Hello' };
     },
     
     beforeCreate() {
       // ❌ 错误：data 还未初始化
       console.log(this.message);  // undefined
     },
     
     created() {
       // ✅ 正确：data 已初始化
       console.log(this.message);  // 'Hello'
     }
   };
   </script>
   ```

### 进阶知识

#### 1. keep-alive 的生命周期

```vue
<template>
  <keep-alive>
    <component :is="currentComponent" />
  </keep-alive>
</template>

<script>
export default {
  // 组件被激活时调用
  activated() {
    console.log('Component activated');
    // 刷新数据
    this.fetchData();
  },
  
  // 组件被停用时调用
  deactivated() {
    console.log('Component deactivated');
    // 暂停定时器
    clearInterval(this.timer);
  }
};
</script>
```

#### 2. errorCaptured - 错误捕获

```vue
<script>
export default {
  errorCaptured(err, instance, info) {
    console.error('捕获到错误:', err);
    console.log('错误组件:', instance);
    console.log('错误信息:', info);
    
    // 上报错误
    this.reportError(err);
    
    // 返回 false 阻止错误继续传播
    return false;
  },
  
  methods: {
    reportError(err) {
      // 发送到错误监控平台
      fetch('/api/error', {
        method: 'POST',
        body: JSON.stringify({
          message: err.message,
          stack: err.stack
        })
      });
    }
  }
};
</script>
```

#### 3. 异步组件的生命周期

```vue
<script>
export default {
  components: {
    AsyncComponent: () => import('./AsyncComponent.vue')
  },
  
  async mounted() {
    // 异步组件加载完成后才会执行其 mounted
    await this.$nextTick();
    console.log('All components mounted');
  }
};
</script>
```

## 💡 面试回答技巧

### 🎯 一句话回答（快速版）

> Vue 生命周期分为创建、挂载、更新、销毁四个阶段，常用的钩子有 created（数据初始化）、mounted（DOM 操作）、beforeDestroy（清理工作）。

### 📣 口语化回答（推荐）

面试时可以这样回答：

> "Vue 的生命周期分为四个阶段：**创建、挂载、更新、销毁**，每个阶段都有 before 和 after 两个钩子。
>
> 常用的几个钩子：
>
> **created** 是数据已经初始化好了，但 DOM 还没渲染，适合做数据初始化、调用 API 获取数据这些操作。
>
> **mounted** 是 DOM 已经挂载完成了，可以操作 DOM，适合初始化第三方库，比如 ECharts、地图这些需要 DOM 节点的库。
>
> **beforeDestroy**（Vue 3 改名叫 beforeUnmount）适合做清理工作，比如清除定时器、取消事件监听、取消未完成的请求，防止内存泄漏。
>
> 如果是父子组件的话，执行顺序是：父 beforeCreate → 父 created → 父 beforeMount → 子 beforeCreate → 子 created → 子 beforeMount → 子 mounted → 父 mounted。简单说就是父组件要等所有子组件挂载完才会触发自己的 mounted。
>
> Vue 3 的 Composition API 里用 onMounted、onUnmounted 这些函数来代替，写法不一样但原理是一样的。"

### 推荐回答顺序

1. **先说生命周期阶段**：
   - "Vue 生命周期分为创建、挂载、更新、销毁四个阶段"
   - "每个阶段有 before 和 after 两个钩子"

2. **再说常用钩子**：
   - "created 适合数据初始化和 API 调用"
   - "mounted 适合 DOM 操作和第三方库初始化"
   - "beforeDestroy 适合清理定时器和事件监听"

3. **然后说父子组件顺序**：
   - "挂载：父创建 → 子创建 → 子挂载 → 父挂载"
   - "更新：父更新前 → 子更新前 → 子更新后 → 父更新后"
   - "销毁：父销毁前 → 子销毁前 → 子销毁后 → 父销毁后"

4. **最后说注意事项**：
   - "created 中不能操作 DOM"
   - "updated 中避免修改数据"
   - "记得清理副作用"

### 重点强调

- ✅ **created vs mounted 的区别**
- ✅ **父子组件的执行顺序**
- ✅ **清理副作用的重要性**
- ✅ **Vue 3 的命名变化**

### 可能的追问

**Q1: 为什么父组件的 mounted 在子组件之后？**

A:
- 父组件需要等待所有子组件挂载完成
- 确保整个组件树都已渲染到 DOM
- 类似于 DFS（深度优先搜索）的后序遍历

**Q2: 如何在 created 中获取 DOM？**

A:
```vue
<script>
export default {
  async created() {
    // 使用 $nextTick 等待 DOM 更新
    await this.$nextTick();
    console.log(this.$el);  // 仍然是 undefined
    
    // ❌ created 中无法获取 DOM
    // ✅ 应该在 mounted 中操作 DOM
  }
};
</script>
```

**Q3: 多个子组件的生命周期顺序？**

A:
```vue
<template>
  <div>
    <Child1 />
    <Child2 />
    <Child3 />
  </div>
</template>
```

执行顺序：
```
父 beforeCreate
父 created
父 beforeMount
  Child1 beforeCreate
  Child1 created
  Child1 beforeMount
  Child1 mounted
  Child2 beforeCreate
  Child2 created
  Child2 beforeMount
  Child2 mounted
  Child3 beforeCreate
  Child3 created
  Child3 beforeMount
  Child3 mounted
父 mounted
```

**Q4: 如何在组件销毁前确认？**

A:
```vue
<script>
export default {
  beforeDestroy() {
    if (this.hasUnsavedChanges) {
      const confirmed = confirm('有未保存的更改，确定离开吗？');
      if (!confirmed) {
        // 无法阻止销毁，需要在路由守卫中处理
      }
    }
  }
};

// 使用路由守卫
export default {
  beforeRouteLeave(to, from, next) {
    if (this.hasUnsavedChanges) {
      const confirmed = confirm('有未保存的更改，确定离开吗？');
      next(confirmed);
    } else {
      next();
    }
  }
};
</script>
```

## 💻 代码示例

### 完整的生命周期演示

```vue
<template>
  <div ref="container">
    <h2>{{ title }}</h2>
    <p>Count: {{ count }}</p>
    <button @click="count++">Increment</button>
    <Child v-if="showChild" />
  </div>
</template>

<script>
export default {
  name: 'LifecycleDemo',
  
  data() {
    return {
      title: 'Lifecycle Demo',
      count: 0,
      showChild: true,
      timer: null
    };
  },
  
  // 1. 创建前
  beforeCreate() {
    console.log('1. beforeCreate');
    console.log('  - data:', this.title);  // undefined
    console.log('  - $el:', this.$el);  // undefined
  },
  
  // 2. 创建后
  created() {
    console.log('2. created');
    console.log('  - data:', this.title);  // 'Lifecycle Demo'
    console.log('  - $el:', this.$el);  // undefined
    
    // 数据初始化
    this.fetchData();
    
    // 设置定时器
    this.timer = setInterval(() => {
      console.log('Timer tick');
    }, 5000);
  },
  
  // 3. 挂载前
  beforeMount() {
    console.log('3. beforeMount');
    console.log('  - $el:', this.$el);  // undefined 或虚拟 DOM
  },
  
  // 4. 挂载后
  mounted() {
    console.log('4. mounted');
    console.log('  - $el:', this.$el);  // 真实 DOM
    console.log('  - $refs:', this.$refs.container);  // DOM 元素
    
    // DOM 操作
    this.$refs.container.style.border = '1px solid red';
  },
  
  // 5. 更新前
  beforeUpdate() {
    console.log('5. beforeUpdate');
    console.log('  - DOM count:', this.$el.querySelector('p').textContent);
    console.log('  - data count:', this.count);
  },
  
  // 6. 更新后
  updated() {
    console.log('6. updated');
    console.log('  - DOM count:', this.$el.querySelector('p').textContent);
    console.log('  - data count:', this.count);
  },
  
  // 7. 销毁前
  beforeDestroy() {
    console.log('7. beforeDestroy');
    
    // 清理定时器
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  
  // 8. 销毁后
  destroyed() {
    console.log('8. destroyed');
  },
  
  methods: {
    fetchData() {
      console.log('Fetching data...');
    }
  }
};
</script>
```

### Composition API 生命周期

```vue
<template>
  <div ref="container">
    <h2>{{ title }}</h2>
    <p>Count: {{ count }}</p>
    <button @click="count++">Increment</button>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from 'vue';

const container = ref(null);
const title = ref('Lifecycle Demo');
const count = ref(0);
let timer = null;

// setup 相当于 beforeCreate 和 created
console.log('setup (beforeCreate + created)');

// 数据初始化
const fetchData = () => {
  console.log('Fetching data...');
};
fetchData();

// 设置定时器
timer = setInterval(() => {
  console.log('Timer tick');
}, 5000);

onBeforeMount(() => {
  console.log('onBeforeMount');
});

onMounted(() => {
  console.log('onMounted');
  console.log('container:', container.value);
  
  // DOM 操作
  container.value.style.border = '1px solid red';
});

onBeforeUpdate(() => {
  console.log('onBeforeUpdate');
  console.log('DOM count:', container.value.querySelector('p').textContent);
  console.log('data count:', count.value);
});

onUpdated(() => {
  console.log('onUpdated');
  console.log('DOM count:', container.value.querySelector('p').textContent);
  console.log('data count:', count.value);
});

onBeforeUnmount(() => {
  console.log('onBeforeUnmount');
  
  // 清理定时器
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});

onUnmounted(() => {
  console.log('onUnmounted');
});
</script>
```

## 🔗 相关知识点

- [Vue 2 和 Vue 3 的区别](./vue2-vs-vue3.md)
- [组件通信方式](./component-communication.md)
- [nextTick 原理](./nextTick.md)

## 📚 参考资料

- [Vue 2 生命周期](https://v2.cn.vuejs.org/v2/guide/instance.html#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%9B%BE%E7%A4%BA)
- [Vue 3 生命周期](https://cn.vuejs.org/guide/essentials/lifecycle.html)
- [Vue 生命周期图示](https://cn.vuejs.org/guide/essentials/lifecycle.html#lifecycle-diagram)
