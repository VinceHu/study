---
title: Vue 组件通信方式
date: 2025-11-27
category: Vue
difficulty: 中级
tags: [组件通信, Props, Emit, Provide/Inject, EventBus, Vuex, Pinia]
related: [lifecycle.md, vue2-vs-vue3.md]
hasCode: true
---

# Vue 组件通信方式

## 📝 标准答案

### 核心要点

1. **父子组件通信**：
   - Props（父 → 子）
   - $emit（子 → 父）
   - $parent / $children（不推荐）
   - ref（父访问子）

2. **跨层级通信**：
   - Provide / Inject（祖先 → 后代）
   - $attrs / $listeners（Vue 2）
   - EventBus（事件总线，Vue 3 已移除）

3. **全局状态管理**：
   - Vuex（Vue 2/3）
   - Pinia（Vue 3 推荐）

4. **其他方式**：
   - $root（访问根实例）
   - Slot（插槽通信）

### 详细说明

#### 1. Props / $emit（父子通信）

```vue
<!-- Parent.vue -->
<template>
  <div>
    <h2>Parent</h2>
    <p>Count from child: {{ childCount }}</p>
    
    <!-- 传递 props -->
    <Child
      :message="parentMessage"
      :count="parentCount"
      @update="handleUpdate"
      @increment="handleIncrement"
    />
  </div>
</template>

<script>
import Child from './Child.vue';

export default {
  components: { Child },
  
  data() {
    return {
      parentMessage: 'Hello from parent',
      parentCount: 0,
      childCount: 0
    };
  },
  
  methods: {
    handleUpdate(newMessage) {
      console.log('Child updated:', newMessage);
    },
    
    handleIncrement(count) {
      this.childCount = count;
    }
  }
};
</script>

<!-- Child.vue -->
<template>
  <div>
    <h3>Child</h3>
    <p>Message: {{ message }}</p>
    <p>Count: {{ count }}</p>
    <p>Internal count: {{ internalCount }}</p>
    
    <button @click="updateMessage">Update Message</button>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
export default {
  // 接收 props
  props: {
    message: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  data() {
    return {
      internalCount: 0
    };
  },
  
  methods: {
    updateMessage() {
      // 触发自定义事件
      this.$emit('update', 'Hello from child');
    },
    
    increment() {
      this.internalCount++;
      this.$emit('increment', this.internalCount);
    }
  }
};
</script>
```

**Props 验证：**

```javascript
export default {
  props: {
    // 基础类型检查
    age: Number,
    
    // 多种类型
    value: [String, Number],
    
    // 必填字符串
    name: {
      type: String,
      required: true
    },
    
    // 带默认值的数字
    count: {
      type: Number,
      default: 0
    },
    
    // 对象/数组默认值必须从工厂函数返回
    user: {
      type: Object,
      default: () => ({ name: 'Guest' })
    },
    
    // 自定义验证函数
    email: {
      type: String,
      validator: (value) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }
    }
  }
};
```

## 🧠 深度理解

### 2. Provide / Inject（跨层级通信）

```vue
<!-- Grandparent.vue -->
<template>
  <div>
    <h2>Grandparent</h2>
    <Parent />
  </div>
</template>

<script>
export default {
  // 提供数据
  provide() {
    return {
      theme: 'dark',
      user: this.user,
      updateUser: this.updateUser
    };
  },
  
  data() {
    return {
      user: {
        name: 'Alice',
        age: 25
      }
    };
  },
  
  methods: {
    updateUser(newUser) {
      this.user = newUser;
    }
  }
};
</script>

<!-- Parent.vue -->
<template>
  <div>
    <h3>Parent</h3>
    <Child />
  </div>
</template>

<!-- Child.vue -->
<template>
  <div>
    <h4>Child</h4>
    <p>Theme: {{ theme }}</p>
    <p>User: {{ user.name }}, {{ user.age }}</p>
    <button @click="changeUser">Change User</button>
  </div>
</template>

<script>
export default {
  // 注入数据
  inject: ['theme', 'user', 'updateUser'],
  
  methods: {
    changeUser() {
      this.updateUser({ name: 'Bob', age: 30 });
    }
  }
};
</script>
```

**Vue 3 响应式 Provide/Inject：**

```vue
<script setup>
import { provide, inject, ref, readonly } from 'vue';

// Grandparent
const theme = ref('dark');
const user = ref({ name: 'Alice', age: 25 });

// 提供响应式数据
provide('theme', readonly(theme));  // 只读
provide('user', user);  // 可修改

// Child
const theme = inject('theme');
const user = inject('user');

// 修改会响应式更新
user.value.name = 'Bob';
</script>
```

### 3. EventBus（事件总线）

**Vue 2：**

```javascript
// eventBus.js
import Vue from 'vue';
export const EventBus = new Vue();

// ComponentA.vue
import { EventBus } from './eventBus';

export default {
  methods: {
    sendMessage() {
      EventBus.$emit('message', 'Hello from A');
    }
  }
};

// ComponentB.vue
import { EventBus } from './eventBus';

export default {
  created() {
    EventBus.$on('message', (msg) => {
      console.log('Received:', msg);
    });
  },
  
  beforeDestroy() {
    // 记得移除监听
    EventBus.$off('message');
  }
};
```

**Vue 3（使用第三方库）：**

```javascript
// Vue 3 移除了 $on、$off、$once
// 使用 mitt 库代替

// eventBus.js
import mitt from 'mitt';
export const EventBus = mitt();

// ComponentA.vue
import { EventBus } from './eventBus';

export default {
  methods: {
    sendMessage() {
      EventBus.emit('message', 'Hello from A');
    }
  }
};

// ComponentB.vue
import { EventBus } from './eventBus';
import { onMounted, onUnmounted } from 'vue';

export default {
  setup() {
    const handleMessage = (msg) => {
      console.log('Received:', msg);
    };
    
    onMounted(() => {
      EventBus.on('message', handleMessage);
    });
    
    onUnmounted(() => {
      EventBus.off('message', handleMessage);
    });
  }
};
```

### 4. Vuex（全局状态管理）

```javascript
// store/index.js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    count: 0,
    user: null
  },
  
  getters: {
    doubleCount: state => state.count * 2
  },
  
  mutations: {
    INCREMENT(state) {
      state.count++;
    },
    
    SET_USER(state, user) {
      state.user = user;
    }
  },
  
  actions: {
    async fetchUser({ commit }) {
      const res = await fetch('/api/user');
      const user = await res.json();
      commit('SET_USER', user);
    }
  }
});

// Component.vue
export default {
  computed: {
    count() {
      return this.$store.state.count;
    },
    
    doubleCount() {
      return this.$store.getters.doubleCount;
    }
  },
  
  methods: {
    increment() {
      this.$store.commit('INCREMENT');
    },
    
    fetchUser() {
      this.$store.dispatch('fetchUser');
    }
  }
};
```

### 5. Pinia（Vue 3 推荐）

```javascript
// stores/counter.js
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2
  },
  
  actions: {
    increment() {
      this.count++;
    },
    
    async fetchUser() {
      const res = await fetch('/api/user');
      this.user = await res.json();
    }
  }
});

// Component.vue
<script setup>
import { useCounterStore } from '@/stores/counter';

const counter = useCounterStore();

// 访问 state
console.log(counter.count);

// 访问 getters
console.log(counter.doubleCount);

// 调用 actions
counter.increment();
</script>
```

### 6. $attrs / $listeners（Vue 2）

```vue
<!-- Parent.vue -->
<template>
  <Child
    :name="name"
    :age="age"
    @update="handleUpdate"
    @delete="handleDelete"
  />
</template>

<!-- Child.vue -->
<template>
  <div>
    <!-- 透传所有 props 和事件到 Grandchild -->
    <Grandchild v-bind="$attrs" v-on="$listeners" />
  </div>
</template>

<script>
export default {
  // 不继承 attrs
  inheritAttrs: false
};
</script>

<!-- Grandchild.vue -->
<template>
  <div>
    <p>Name: {{ name }}</p>
    <p>Age: {{ age }}</p>
    <button @click="$emit('update')">Update</button>
    <button @click="$emit('delete')">Delete</button>
  </div>
</template>

<script>
export default {
  props: ['name', 'age']
};
</script>
```

**Vue 3（$listeners 合并到 $attrs）：**

```vue
<!-- Child.vue -->
<template>
  <Grandchild v-bind="$attrs" />
</template>

<script>
export default {
  inheritAttrs: false
};
</script>
```

### 7. ref（父访问子）

```vue
<!-- Parent.vue -->
<template>
  <div>
    <Child ref="child" />
    <button @click="callChildMethod">Call Child Method</button>
  </div>
</template>

<script>
export default {
  methods: {
    callChildMethod() {
      // 访问子组件的方法和数据
      this.$refs.child.childMethod();
      console.log(this.$refs.child.childData);
    }
  }
};
</script>

<!-- Child.vue -->
<script>
export default {
  data() {
    return {
      childData: 'Hello'
    };
  },
  
  methods: {
    childMethod() {
      console.log('Child method called');
    }
  }
};
</script>
```

**Vue 3 Composition API：**

```vue
<!-- Parent.vue -->
<script setup>
import { ref } from 'vue';
import Child from './Child.vue';

const child = ref(null);

const callChildMethod = () => {
  child.value.childMethod();
};
</script>

<template>
  <Child ref="child" />
  <button @click="callChildMethod">Call Child Method</button>
</template>

<!-- Child.vue -->
<script setup>
import { defineExpose } from 'vue';

const childData = ref('Hello');

const childMethod = () => {
  console.log('Child method called');
};

// 暴露给父组件
defineExpose({
  childData,
  childMethod
});
</script>
```

### 常见误区

1. **误区：直接修改 props**
   ```vue
   <script>
   export default {
     props: ['count'],
     
     methods: {
       increment() {
         // ❌ 错误：不要直接修改 props
         this.count++;
       }
     }
   };
   </script>
   
   <!-- ✅ 正确：使用 $emit 通知父组件 -->
   <script>
   export default {
     props: ['count'],
     
     methods: {
       increment() {
         this.$emit('update:count', this.count + 1);
       }
     }
   };
   </script>
   ```

2. **误区：EventBus 忘记移除监听**
   ```javascript
   // ❌ 错误：可能导致内存泄漏
   created() {
     EventBus.$on('event', this.handler);
   }
   
   // ✅ 正确：记得移除
   created() {
     EventBus.$on('event', this.handler);
   },
   beforeDestroy() {
     EventBus.$off('event', this.handler);
   }
   ```

3. **误区：过度使用 Vuex/Pinia**
   ```javascript
   // ❌ 错误：简单的父子通信也用 Vuex
   // 增加复杂度，不易维护
   
   // ✅ 正确：根据场景选择
   // - 父子通信：Props/$emit
   // - 跨层级：Provide/Inject
   // - 全局状态：Vuex/Pinia
   ```

## 💡 面试回答技巧

### 推荐回答顺序

1. **先说父子通信**：
   - "Props 传递数据，$emit 触发事件"
   - "这是最常用的方式"

2. **再说跨层级通信**：
   - "Provide/Inject 适合祖先和后代通信"
   - "EventBus 适合兄弟组件通信（Vue 3 已移除）"

3. **然后说全局状态**：
   - "Vuex/Pinia 适合复杂的全局状态管理"
   - "Pinia 是 Vue 3 的推荐方案"

4. **最后说其他方式**：
   - "ref 可以访问子组件"
   - "$attrs 可以透传属性"

### 重点强调

- ✅ **Props 是单向数据流**
- ✅ **不要直接修改 props**
- ✅ **EventBus 要记得移除监听**
- ✅ **根据场景选择合适的通信方式**

### 可能的追问

**Q1: Props 为什么是单向数据流？**

A:
- 防止子组件意外修改父组件的状态
- 使数据流向更清晰，易于调试
- 避免多个子组件修改同一数据导致混乱

**Q2: 如何实现双向绑定？**

A:
```vue
<!-- 方式1：.sync 修饰符（Vue 2） -->
<Child :value.sync="parentValue" />

<!-- 等价于 -->
<Child
  :value="parentValue"
  @update:value="parentValue = $event"
/>

<!-- 方式2：v-model（Vue 3） -->
<Child v-model:value="parentValue" />

<!-- 等价于 -->
<Child
  :value="parentValue"
  @update:value="parentValue = $event"
/>
```

**Q3: Vuex 和 Pinia 的区别？**

A:
| 特性 | Vuex | Pinia |
|------|------|-------|
| Mutations | 必须 | 没有（直接修改 state） |
| TypeScript | 支持一般 | 完美支持 |
| 模块化 | 需要配置 | 天然支持 |
| DevTools | 支持 | 更好的支持 |
| 体积 | 较大 | 更小 |

**Q4: 如何选择通信方式？**

A:
```
父子组件 → Props/$emit
祖先后代 → Provide/Inject
兄弟组件 → EventBus（Vue 2）或 Pinia（Vue 3）
全局状态 → Vuex/Pinia
访问子组件 → ref
透传属性 → $attrs
```

## 💻 代码示例

### 完整的通信示例

```vue
<!-- App.vue -->
<template>
  <div>
    <h1>Component Communication Demo</h1>
    
    <!-- 1. Props/$emit -->
    <Parent />
    
    <!-- 2. Provide/Inject -->
    <Grandparent />
    
    <!-- 3. Pinia -->
    <Counter />
  </div>
</template>

<!-- Parent.vue -->
<template>
  <div>
    <h2>Parent (Props/$emit)</h2>
    <p>Message from child: {{ childMessage }}</p>
    
    <Child
      :parent-message="parentMessage"
      @update="handleUpdate"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      parentMessage: 'Hello from parent',
      childMessage: ''
    };
  },
  
  methods: {
    handleUpdate(msg) {
      this.childMessage = msg;
    }
  }
};
</script>

<!-- Child.vue -->
<template>
  <div>
    <h3>Child</h3>
    <p>{{ parentMessage }}</p>
    <button @click="sendMessage">Send Message</button>
  </div>
</template>

<script>
export default {
  props: ['parentMessage'],
  
  methods: {
    sendMessage() {
      this.$emit('update', 'Hello from child');
    }
  }
};
</script>

<!-- Grandparent.vue -->
<template>
  <div>
    <h2>Grandparent (Provide/Inject)</h2>
    <p>Theme: {{ theme }}</p>
    <button @click="toggleTheme">Toggle Theme</button>
    <Parent />
  </div>
</template>

<script>
export default {
  provide() {
    return {
      theme: this.theme,
      toggleTheme: this.toggleTheme
    };
  },
  
  data() {
    return {
      theme: 'light'
    };
  },
  
  methods: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
    }
  }
};
</script>

<!-- Grandchild.vue -->
<template>
  <div>
    <h4>Grandchild</h4>
    <p>Theme: {{ theme }}</p>
    <button @click="toggleTheme">Toggle Theme</button>
  </div>
</template>

<script>
export default {
  inject: ['theme', 'toggleTheme']
};
</script>

<!-- Counter.vue (Pinia) -->
<script setup>
import { useCounterStore } from '@/stores/counter';

const counter = useCounterStore();
</script>

<template>
  <div>
    <h2>Counter (Pinia)</h2>
    <p>Count: {{ counter.count }}</p>
    <p>Double: {{ counter.doubleCount }}</p>
    <button @click="counter.increment">Increment</button>
  </div>
</template>
```

## 🔗 相关知识点

- [Vue 生命周期](./lifecycle.md)
- [Vue 2 和 Vue 3 的区别](./vue2-vs-vue3.md)
- [Vuex 状态管理](./vuex.md)

## 📚 参考资料

- [Vue 组件通信](https://cn.vuejs.org/guide/components/events.html)
- [Provide / Inject](https://cn.vuejs.org/guide/components/provide-inject.html)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Vuex 官方文档](https://vuex.vuejs.org/zh/)
