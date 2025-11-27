---
title: Vue 2 和 Vue 3 的核心区别
date: 2025-11-27
category: Vue
difficulty: 中级
tags: [Vue2, Vue3, 响应式, Proxy, Composition API, 性能优化]
related: [reactive-principle.md, composition-api.md]
hasCode: true
---

# Vue 2 和 Vue 3 的核心区别

## 📝 标准答案

### 核心要点

1. **响应式原理**：
   - Vue 2：`Object.defineProperty`，需要递归遍历，无法监听新增/删除属性
   - Vue 3：`Proxy`，可以监听所有操作，性能更好

2. **API 风格**：
   - Vue 2：Options API（data、methods、computed 等选项）
   - Vue 3：Composition API（setup 函数，更灵活的逻辑组织）

3. **性能优化**：
   - Vue 3：编译优化、Tree-shaking、更小的包体积
   - 初始渲染快 55%，更新快 133%，内存占用减少 54%

4. **TypeScript 支持**：
   - Vue 3：用 TypeScript 重写，类型推导更好

### 详细说明

#### 响应式原理对比

**Vue 2 - Object.defineProperty：**

```javascript
// Vue 2 响应式实现（简化版）
function defineReactive(obj, key, val) {
  // 递归处理嵌套对象
  observe(val);
  
  Object.defineProperty(obj, key, {
    get() {
      console.log(`获取 ${key}: ${val}`);
      // 依赖收集
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      console.log(`设置 ${key}: ${newVal}`);
      val = newVal;
      // 派发更新
      observe(newVal);
    }
  });
}

function observe(obj) {
  if (typeof obj !== 'object' || obj === null) return;
  
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key]);
  });
}

// 使用
const data = { name: 'Alice', age: 25 };
observe(data);

data.name = 'Bob';  // ✅ 可以监听
data.age = 30;      // ✅ 可以监听

// ❌ 无法监听新增属性
data.gender = 'female';  // 不会触发更新

// ❌ 无法监听删除属性
delete data.age;  // 不会触发更新

// ❌ 无法监听数组索引和 length
const arr = [1, 2, 3];
observe(arr);
arr[0] = 10;      // 不会触发更新
arr.length = 0;   // 不会触发更新
```

**Vue 3 - Proxy：**

```javascript
// Vue 3 响应式实现（简化版）
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      console.log(`获取 ${key}`);
      const result = Reflect.get(target, key, receiver);
      
      // 依赖收集
      track(target, key);
      
      // 如果是对象，递归代理（懒代理）
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      
      return result;
    },
    
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      
      if (oldValue !== value) {
        console.log(`设置 ${key}: ${value}`);
        // 派发更新
        trigger(target, key);
      }
      
      return result;
    },
    
    deleteProperty(target, key) {
      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      const result = Reflect.deleteProperty(target, key);
      
      if (hadKey && result) {
        console.log(`删除 ${key}`);
        // 派发更新
        trigger(target, key);
      }
      
      return result;
    }
  });
}

// 使用
const data = reactive({ name: 'Alice', age: 25 });

data.name = 'Bob';  // ✅ 可以监听
data.age = 30;      // ✅ 可以监听

// ✅ 可以监听新增属性
data.gender = 'female';  // 触发更新

// ✅ 可以监听删除属性
delete data.age;  // 触发更新

// ✅ 可以监听数组操作
const arr = reactive([1, 2, 3]);
arr[0] = 10;      // 触发更新
arr.length = 0;   // 触发更新
arr.push(4);      // 触发更新
```

**对比总结：**

| 特性 | Vue 2 (Object.defineProperty) | Vue 3 (Proxy) |
|------|------------------------------|---------------|
| 新增属性 | ❌ 需要 `$set` | ✅ 自动监听 |
| 删除属性 | ❌ 需要 `$delete` | ✅ 自动监听 |
| 数组索引 | ❌ 不支持 | ✅ 支持 |
| 数组 length | ❌ 不支持 | ✅ 支持 |
| Map/Set | ❌ 不支持 | ✅ 支持 |
| 性能 | 初始化时递归遍历 | 懒代理，按需递归 |
| 兼容性 | IE9+ | IE11+ (不支持 IE) |

## 🧠 深度理解

### Options API vs Composition API

**Vue 2 - Options API：**

```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    };
  },
  
  computed: {
    doubleCount() {
      return this.count * 2;
    }
  },
  
  methods: {
    increment() {
      this.count++;
    }
  },
  
  mounted() {
    console.log('Component mounted');
  }
};
</script>
```

**问题：**
- 逻辑分散在不同选项中
- 难以复用逻辑（需要 mixin，容易命名冲突）
- TypeScript 支持不好

**Vue 3 - Composition API：**

```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// 所有逻辑集中在一起
const count = ref(0);

const doubleCount = computed(() => count.value * 2);

const increment = () => {
  count.value++;
};

onMounted(() => {
  console.log('Component mounted');
});
</script>
```

**优势：**
- 逻辑组织更灵活
- 更好的代码复用（composables）
- 更好的 TypeScript 支持
- 更小的打包体积（Tree-shaking）

**逻辑复用对比：**

```javascript
// Vue 2 - Mixin（容易命名冲突）
const counterMixin = {
  data() {
    return { count: 0 };
  },
  methods: {
    increment() {
      this.count++;
    }
  }
};

export default {
  mixins: [counterMixin]
};

// Vue 3 - Composable（清晰明确）
function useCounter() {
  const count = ref(0);
  
  const increment = () => {
    count.value++;
  };
  
  return { count, increment };
}

// 使用
const { count, increment } = useCounter();
```

### 性能优化

**1. 编译优化**

```vue
<!-- Vue 2 -->
<template>
  <div>
    <p>Static text</p>
    <p>{{ dynamic }}</p>
  </div>
</template>

<!-- 编译后：整个模板都会重新渲染 -->

<!-- Vue 3 -->
<template>
  <div>
    <p>Static text</p>  <!-- 静态提升 -->
    <p>{{ dynamic }}</p>  <!-- 只有这部分会更新 -->
  </div>
</template>

<!-- 编译后：静态节点被提升，只更新动态部分 -->
```

**2. 静态提升（Static Hoisting）**

```javascript
// Vue 2 编译结果
function render() {
  return h('div', [
    h('p', 'Static text'),  // 每次都创建
    h('p', this.dynamic)
  ]);
}

// Vue 3 编译结果
const _hoisted_1 = h('p', 'Static text');  // 提升到外部，只创建一次

function render() {
  return h('div', [
    _hoisted_1,  // 复用
    h('p', this.dynamic)
  ]);
}
```

**3. 事件监听缓存**

```vue
<!-- Vue 2 -->
<button @click="handleClick">Click</button>
<!-- 每次渲染都创建新的事件处理函数 -->

<!-- Vue 3 -->
<button @click="handleClick">Click</button>
<!-- 事件处理函数被缓存 -->
```

**4. Tree-shaking**

```javascript
// Vue 2：全量引入
import Vue from 'vue';

// Vue 3：按需引入
import { ref, computed, watch } from 'vue';
```

### 生命周期对比

| Vue 2 | Vue 3 Options API | Vue 3 Composition API |
|-------|-------------------|----------------------|
| beforeCreate | beforeCreate | setup() |
| created | created | setup() |
| beforeMount | beforeMount | onBeforeMount |
| mounted | mounted | onMounted |
| beforeUpdate | beforeUpdate | onBeforeUpdate |
| updated | updated | onUpdated |
| beforeDestroy | beforeUnmount | onBeforeUnmount |
| destroyed | unmounted | onUnmounted |
| errorCaptured | errorCaptured | onErrorCaptured |

```vue
<!-- Vue 3 Composition API -->
<script setup>
import { onMounted, onUpdated, onUnmounted } from 'vue';

onMounted(() => {
  console.log('Component mounted');
});

onUpdated(() => {
  console.log('Component updated');
});

onUnmounted(() => {
  console.log('Component unmounted');
});
</script>
```

### 其他重要区别

**1. 多根节点（Fragment）**

```vue
<!-- Vue 2：必须有单个根节点 -->
<template>
  <div>
    <header>Header</header>
    <main>Main</main>
  </div>
</template>

<!-- Vue 3：支持多个根节点 -->
<template>
  <header>Header</header>
  <main>Main</main>
  <footer>Footer</footer>
</template>
```

**2. Teleport（传送门）**

```vue
<!-- Vue 3 新特性 -->
<template>
  <div>
    <button @click="showModal = true">Open Modal</button>
    
    <!-- 将模态框传送到 body -->
    <Teleport to="body">
      <div v-if="showModal" class="modal">
        <p>Modal content</p>
        <button @click="showModal = false">Close</button>
      </div>
    </Teleport>
  </div>
</template>
```

**3. Suspense（异步组件）**

```vue
<!-- Vue 3 新特性 -->
<template>
  <Suspense>
    <!-- 异步组件 -->
    <template #default>
      <AsyncComponent />
    </template>
    
    <!-- 加载中显示 -->
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

**4. 自定义渲染器**

```javascript
// Vue 3 支持自定义渲染器
import { createRenderer } from '@vue/runtime-core';

const renderer = createRenderer({
  createElement(type) {
    // 自定义创建元素逻辑
  },
  insert(el, parent) {
    // 自定义插入逻辑
  },
  // ...
});

// 可以渲染到 Canvas、WebGL、原生移动端等
```

### 常见误区

1. **误区：Vue 3 完全抛弃了 Options API**
   ```javascript
   // ❌ 错误认知
   // Vue 3 仍然支持 Options API
   
   // ✅ 正确
   // Vue 3 同时支持 Options API 和 Composition API
   export default {
     data() {
       return { count: 0 };
     },
     methods: {
       increment() {
         this.count++;
       }
     }
   };
   ```

2. **误区：Composition API 只是语法糖**
   ```javascript
   // ❌ 错误
   // Composition API 不仅是语法糖，还带来了：
   // - 更好的逻辑复用
   // - 更好的 TypeScript 支持
   // - 更好的 Tree-shaking
   ```

3. **误区：Vue 3 不兼容 Vue 2**
   ```javascript
   // ✅ 正确
   // Vue 3 提供了迁移构建版本
   // 大部分 Vue 2 代码可以在 Vue 3 中运行
   // 官方提供了迁移指南和工具
   ```

## 💡 面试回答技巧

### 推荐回答顺序

1. **先说响应式原理**：
   - "Vue 2 使用 Object.defineProperty，Vue 3 使用 Proxy"
   - "Proxy 可以监听新增/删除属性，性能更好"

2. **再说 API 风格**：
   - "Vue 2 主要是 Options API，Vue 3 引入了 Composition API"
   - "Composition API 逻辑组织更灵活，复用更方便"

3. **然后说性能优化**：
   - "Vue 3 编译优化、静态提升、事件缓存"
   - "初始渲染快 55%，更新快 133%"

4. **最后说其他特性**：
   - "Fragment、Teleport、Suspense 等新特性"
   - "更好的 TypeScript 支持"

### 重点强调

- ✅ **Proxy 的优势**：可以监听所有操作
- ✅ **Composition API 的优势**：逻辑复用和组织
- ✅ **性能提升**：具体的数据（55%、133%）
- ✅ **向后兼容**：Vue 3 仍支持 Options API

### 可能的追问

**Q1: 为什么 Vue 3 不支持 IE11？**

A:
- Proxy 是 ES6 特性，无法被 polyfill
- IE11 不支持 Proxy
- Vue 3 官方提供了 @vue/compat 兼容版本，但性能会下降

**Q2: Composition API 和 React Hooks 的区别？**

A:
```javascript
// React Hooks：每次渲染都执行
function Counter() {
  const [count, setCount] = useState(0);  // 每次都执行
  
  useEffect(() => {
    console.log(count);
  }, [count]);
  
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// Vue Composition API：只在 setup 时执行一次
const Counter = {
  setup() {
    const count = ref(0);  // 只执行一次
    
    watch(count, () => {
      console.log(count.value);
    });
    
    return { count };
  }
};
```

区别：
- Vue 的 setup 只执行一次，React 的函数组件每次渲染都执行
- Vue 不需要依赖数组，自动追踪依赖
- Vue 不需要 useCallback/useMemo 优化

**Q3: 如何从 Vue 2 迁移到 Vue 3？**

A:
1. 使用 @vue/compat 兼容构建
2. 运行迁移工具检查不兼容的代码
3. 逐步替换废弃的 API
4. 测试和修复问题
5. 移除兼容构建，使用纯 Vue 3

**Q4: Vue 3 的响应式系统如何处理深层嵌套？**

A:
```javascript
// Vue 3 使用懒代理（Lazy Proxy）
const state = reactive({
  user: {
    profile: {
      name: 'Alice'
    }
  }
});

// 只有访问时才会代理深层对象
console.log(state.user);  // 此时 user 被代理
console.log(state.user.profile);  // 此时 profile 被代理
```

优势：
- 按需代理，性能更好
- 避免初始化时递归遍历所有属性

## 💻 代码示例

### 完整的响应式对比

```javascript
// ========== Vue 2 响应式 ==========
class Vue2Reactive {
  constructor(data) {
    this.data = data;
    this.observe(data);
  }
  
  observe(obj) {
    if (typeof obj !== 'object' || obj === null) return;
    
    Object.keys(obj).forEach(key => {
      this.defineReactive(obj, key, obj[key]);
    });
  }
  
  defineReactive(obj, key, val) {
    this.observe(val);  // 递归
    
    const dep = [];  // 依赖收集
    
    Object.defineProperty(obj, key, {
      get() {
        console.log(`[Vue 2] 获取 ${key}`);
        return val;
      },
      set(newVal) {
        if (newVal === val) return;
        console.log(`[Vue 2] 设置 ${key} = ${newVal}`);
        val = newVal;
        this.observe(newVal);
        // 通知更新
        dep.forEach(fn => fn());
      }
    });
  }
}

// ========== Vue 3 响应式 ==========
class Vue3Reactive {
  constructor(data) {
    return this.reactive(data);
  }
  
  reactive(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    return new Proxy(obj, {
      get(target, key, receiver) {
        console.log(`[Vue 3] 获取 ${key}`);
        const result = Reflect.get(target, key, receiver);
        
        // 懒代理：只有访问时才代理深层对象
        if (typeof result === 'object' && result !== null) {
          return new Vue3Reactive(result);
        }
        
        return result;
      },
      
      set(target, key, value, receiver) {
        const oldValue = target[key];
        const result = Reflect.set(target, key, value, receiver);
        
        if (oldValue !== value) {
          console.log(`[Vue 3] 设置 ${key} = ${value}`);
        }
        
        return result;
      },
      
      deleteProperty(target, key) {
        console.log(`[Vue 3] 删除 ${key}`);
        return Reflect.deleteProperty(target, key);
      }
    });
  }
}

// 测试
console.log('=== Vue 2 ===');
const vue2Data = new Vue2Reactive({ name: 'Alice', age: 25 });
vue2Data.data.name = 'Bob';  // ✅ 监听到
vue2Data.data.gender = 'female';  // ❌ 监听不到

console.log('\n=== Vue 3 ===');
const vue3Data = new Vue3Reactive({ name: 'Alice', age: 25 });
vue3Data.name = 'Bob';  // ✅ 监听到
vue3Data.gender = 'female';  // ✅ 监听到
delete vue3Data.age;  // ✅ 监听到
```

### Composition API 实战

```vue
<template>
  <div>
    <h2>User: {{ user.name }}</h2>
    <p>Posts: {{ posts.length }}</p>
    <button @click="fetchData">Refresh</button>
    <div v-if="loading">Loading...</div>
    <div v-if="error">Error: {{ error }}</div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

// 封装可复用的逻辑
function useFetch(url) {
  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);
  
  const fetchData = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(url);
      data.value = await response.json();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };
  
  return { data, loading, error, fetchData };
}

// 使用
const { data: user, loading: userLoading, fetchData: fetchUser } = 
  useFetch('/api/user');

const { data: posts, loading: postsLoading, fetchData: fetchPosts } = 
  useFetch('/api/posts');

const loading = computed(() => userLoading.value || postsLoading.value);

const fetchData = () => {
  fetchUser();
  fetchPosts();
};

onMounted(() => {
  fetchData();
});
</script>
```

## 🔗 相关知识点

- [Vue 响应式原理](./reactive-principle.md)
- [Composition API 详解](./composition-api.md)
- [Vue 生命周期](./lifecycle.md)

## 📚 参考资料

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vue 3 迁移指南](https://v3-migration.vuejs.org/)
- [Vue 3 设计理念](https://github.com/vuejs/rfcs)
- [Vue 3 性能对比](https://docs.google.com/spreadsheets/d/1VJFx-kQ4KjJmnpDXIEaig-cVAAJtpIGLZNbv3Lr4CR0/edit#gid=0)
