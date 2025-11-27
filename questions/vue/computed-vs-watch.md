---
title: computed 和 watch 的区别
date: 2025-11-27
category: Vue
difficulty: 基础
tags: [computed, watch, 响应式, 计算属性, 侦听器]
related: [vue2-vs-vue3.md, lifecycle.md]
hasCode: true
---

# computed 和 watch 的区别

## 📝 标准答案

### 核心要点

1. **computed（计算属性）**：
   - 基于依赖缓存，只有依赖变化才重新计算
   - 必须有返回值
   - 适合：根据现有数据计算新数据

2. **watch（侦听器）**：
   - 无缓存，每次都执行
   - 不需要返回值
   - 适合：数据变化时执行异步操作或开销较大的操作

3. **使用场景**：
   - computed：数据联动、格式化显示
   - watch：API 调用、数据验证、复杂逻辑

### 详细说明

#### computed 基本用法

```vue
<template>
  <div>
    <p>First Name: <input v-model="firstName" /></p>
    <p>Last Name: <input v-model="lastName" /></p>
    <p>Full Name: {{ fullName }}</p>
    <p>Reversed Name: {{ reversedName }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      firstName: 'John',
      lastName: 'Doe'
    };
  },
  
  computed: {
    // 只读计算属性
    fullName() {
      console.log('Computing fullName');
      return `${this.firstName} ${this.lastName}`;
    },
    
    reversedName() {
      return this.fullName.split('').reverse().join('');
    },
    
    // 可读写计算属性
    fullNameWritable: {
      get() {
        return `${this.firstName} ${this.lastName}`;
      },
      set(value) {
        const names = value.split(' ');
        this.firstName = names[0];
        this.lastName = names[1];
      }
    }
  }
};
</script>
```

**特点：**
- 多次访问 `fullName`，只计算一次（缓存）
- 依赖的 `firstName` 或 `lastName` 变化时才重新计算
- 必须是同步操作，必须有返回值

#### watch 基本用法

```vue
<template>
  <div>
    <p>Question: <input v-model="question" /></p>
    <p>Answer: {{ answer }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      question: '',
      answer: 'Questions usually contain a question mark. ;-)'
    };
  },
  
  watch: {
    // 简单侦听
    question(newVal, oldVal) {
      console.log(`Question changed from "${oldVal}" to "${newVal}"`);
      this.getAnswer();
    },
    
    // 深度侦听
    user: {
      handler(newVal, oldVal) {
        console.log('User changed');
      },
      deep: true,  // 深度侦听对象内部变化
      immediate: true  // 立即执行一次
    }
  },
  
  methods: {
    async getAnswer() {
      if (!this.question.includes('?')) {
        this.answer = 'Questions usually contain a question mark. ;-)';
        return;
      }
      
      this.answer = 'Thinking...';
      
      try {
        const res = await fetch(`/api/answer?q=${this.question}`);
        this.answer = await res.text();
      } catch (err) {
        this.answer = 'Error! Could not reach the API.';
      }
    }
  }
};
</script>
```

**特点：**
- 每次 `question` 变化都执行
- 可以执行异步操作
- 不需要返回值

## 🧠 深度理解

### computed 的缓存机制

```vue
<template>
  <div>
    <p>{{ expensiveComputed }}</p>
    <p>{{ expensiveComputed }}</p>
    <p>{{ expensiveComputed }}</p>
    <button @click="count++">Count: {{ count }}</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0,
      items: [1, 2, 3, 4, 5]
    };
  },
  
  computed: {
    expensiveComputed() {
      console.log('Computing...');  // 只输出一次
      
      // 模拟耗时计算
      let sum = 0;
      for (let i = 0; i < 1000000; i++) {
        sum += i;
      }
      
      return this.items.reduce((a, b) => a + b, 0);
    }
  }
};
</script>
```

**原理：**
```javascript
// Vue 内部实现（简化版）
class ComputedWatcher {
  constructor(vm, getter) {
    this.vm = vm;
    this.getter = getter;
    this.value = undefined;
    this.dirty = true;  // 脏标记
  }
  
  evaluate() {
    if (this.dirty) {
      this.value = this.getter.call(this.vm);
      this.dirty = false;  // 标记为干净
    }
    return this.value;
  }
  
  depend() {
    // 依赖收集
  }
  
  update() {
    this.dirty = true;  // 依赖变化，标记为脏
  }
}
```

### watch 的选项

```vue
<script>
export default {
  data() {
    return {
      user: {
        name: 'Alice',
        age: 25,
        address: {
          city: 'Beijing'
        }
      },
      count: 0
    };
  },
  
  watch: {
    // 1. 简单侦听
    count(newVal, oldVal) {
      console.log(`Count: ${oldVal} → ${newVal}`);
    },
    
    // 2. 深度侦听
    user: {
      handler(newVal, oldVal) {
        console.log('User changed');
        // 注意：newVal 和 oldVal 是同一个对象引用
      },
      deep: true  // 侦听对象内部变化
    },
    
    // 3. 立即执行
    'user.name': {
      handler(newVal) {
        console.log('Name:', newVal);
      },
      immediate: true  // 组件创建时立即执行一次
    },
    
    // 4. 侦听多个数据源（Vue 3）
    // [() => this.firstName, () => this.lastName](newVals, oldVals) {
    //   console.log('Name changed');
    // }
  }
};
</script>
```

### computed vs watch 对比

| 特性 | computed | watch |
|------|----------|-------|
| 缓存 | ✅ 有缓存 | ❌ 无缓存 |
| 返回值 | ✅ 必须有 | ❌ 不需要 |
| 异步 | ❌ 不支持 | ✅ 支持 |
| 依赖 | 自动追踪 | 手动指定 |
| 使用场景 | 数据联动 | 异步操作 |

**示例对比：**

```vue
<script>
export default {
  data() {
    return {
      firstName: 'John',
      lastName: 'Doe'
    };
  },
  
  // ✅ 使用 computed（推荐）
  computed: {
    fullName() {
      return `${this.firstName} ${this.lastName}`;
    }
  },
  
  // ❌ 使用 watch（不推荐）
  watch: {
    firstName(val) {
      this.fullName = `${val} ${this.lastName}`;
    },
    lastName(val) {
      this.fullName = `${this.firstName} ${val}`;
    }
  }
};
</script>
```

### 使用场景

#### computed 适用场景

```vue
<script>
export default {
  data() {
    return {
      items: [
        { name: 'Apple', price: 10, quantity: 2 },
        { name: 'Banana', price: 5, quantity: 3 },
        { name: 'Orange', price: 8, quantity: 1 }
      ],
      searchText: ''
    };
  },
  
  computed: {
    // 1. 数据过滤
    filteredItems() {
      return this.items.filter(item =>
        item.name.toLowerCase().includes(this.searchText.toLowerCase())
      );
    },
    
    // 2. 数据计算
    totalPrice() {
      return this.items.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0);
    },
    
    // 3. 数据格式化
    formattedPrice() {
      return `$${this.totalPrice.toFixed(2)}`;
    },
    
    // 4. 数据排序
    sortedItems() {
      return [...this.items].sort((a, b) => a.price - b.price);
    }
  }
};
</script>
```

#### watch 适用场景

```vue
<script>
export default {
  data() {
    return {
      searchText: '',
      searchResults: [],
      user: null,
      formData: {
        email: '',
        password: ''
      }
    };
  },
  
  watch: {
    // 1. API 调用
    searchText: {
      handler(newVal) {
        this.debouncedSearch(newVal);
      },
      immediate: true
    },
    
    // 2. 数据验证
    'formData.email'(newVal) {
      if (newVal && !this.isValidEmail(newVal)) {
        this.emailError = 'Invalid email';
      } else {
        this.emailError = '';
      }
    },
    
    // 3. 本地存储
    user: {
      handler(newVal) {
        localStorage.setItem('user', JSON.stringify(newVal));
      },
      deep: true
    },
    
    // 4. 路由变化
    '$route'(to, from) {
      console.log(`Route changed from ${from.path} to ${to.path}`);
      this.fetchData();
    }
  },
  
  methods: {
    async debouncedSearch(text) {
      // 防抖处理
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(async () => {
        const res = await fetch(`/api/search?q=${text}`);
        this.searchResults = await res.json();
      }, 300);
    },
    
    isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
  }
};
</script>
```

### 常见误区

1. **误区：computed 中执行异步操作**
   ```vue
   <script>
   export default {
     computed: {
       // ❌ 错误：computed 不支持异步
       async userData() {
         const res = await fetch('/api/user');
         return await res.json();
       }
     },
     
     // ✅ 正确：使用 watch
     watch: {
       userId: {
         async handler(newVal) {
           const res = await fetch(`/api/user/${newVal}`);
           this.userData = await res.json();
         },
         immediate: true
       }
     }
   };
   </script>
   ```

2. **误区：watch 中修改被侦听的数据**
   ```vue
   <script>
   export default {
     watch: {
       count(newVal) {
         // ❌ 错误：可能导致无限循环
         this.count = newVal + 1;
       }
     }
   };
   </script>
   ```

3. **误区：深度侦听的性能问题**
   ```vue
   <script>
   export default {
     watch: {
       // ❌ 不好：深度侦听大对象，性能差
       bigObject: {
         handler() {
           console.log('Changed');
         },
         deep: true
       },
       
       // ✅ 更好：侦听具体属性
       'bigObject.specificProp'() {
         console.log('Changed');
       }
     }
   };
   </script>
   ```

### Vue 3 Composition API

```vue
<script setup>
import { ref, computed, watch, watchEffect } from 'vue';

const firstName = ref('John');
const lastName = ref('Doe');

// computed
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`;
});

// 可写 computed
const fullNameWritable = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (value) => {
    const names = value.split(' ');
    firstName.value = names[0];
    lastName.value = names[1];
  }
});

// watch
watch(firstName, (newVal, oldVal) => {
  console.log(`First name: ${oldVal} → ${newVal}`);
});

// 侦听多个数据源
watch([firstName, lastName], ([newFirst, newLast], [oldFirst, oldLast]) => {
  console.log('Name changed');
});

// watchEffect（自动追踪依赖）
watchEffect(() => {
  console.log(`Full name: ${firstName.value} ${lastName.value}`);
});

// 停止侦听
const stop = watch(firstName, () => {
  console.log('Changed');
});

// 调用 stop() 停止侦听
stop();
</script>
```

## 💡 面试回答技巧

### 推荐回答顺序

1. **先说定义**：
   - "computed 是计算属性，基于依赖缓存"
   - "watch 是侦听器，监听数据变化"

2. **再说区别**：
   - "computed 有缓存，watch 无缓存"
   - "computed 必须有返回值，watch 不需要"
   - "computed 不支持异步，watch 支持"

3. **然后说使用场景**：
   - "computed 适合数据联动、格式化"
   - "watch 适合 API 调用、数据验证"

4. **最后举例说明**：
   - 用 fullName 的例子说明 computed
   - 用搜索的例子说明 watch

### 重点强调

- ✅ **computed 的缓存机制**
- ✅ **watch 支持异步操作**
- ✅ **根据场景选择合适的方式**
- ✅ **避免在 watch 中修改被侦听的数据**

### 可能的追问

**Q1: computed 的缓存是如何实现的？**

A:
- computed 内部维护一个 `dirty` 标记
- 初始为 `true`，计算后设为 `false`
- 依赖变化时重新设为 `true`
- 访问时检查 `dirty`，为 `false` 则返回缓存值

**Q2: watch 的 deep 选项有什么性能问题？**

A:
- `deep: true` 会递归遍历对象的所有属性
- 对于大对象，性能开销大
- 建议侦听具体属性，而不是整个对象

**Q3: watchEffect 和 watch 的区别？**

A:
```javascript
// watch：手动指定依赖
watch(source, callback);

// watchEffect：自动追踪依赖
watchEffect(() => {
  // 自动追踪内部使用的响应式数据
  console.log(count.value);
});
```

**Q4: 如何在 computed 中使用异步数据？**

A:
```vue
<script setup>
import { ref, computed } from 'vue';

const userId = ref(1);
const userData = ref(null);

// 使用 watch 获取异步数据
watch(userId, async (newVal) => {
  const res = await fetch(`/api/user/${newVal}`);
  userData.value = await res.json();
}, { immediate: true });

// computed 使用同步数据
const userName = computed(() => {
  return userData.value?.name || 'Loading...';
});
</script>
```

## 💻 代码示例

### 完整示例：购物车

```vue
<template>
  <div>
    <h2>Shopping Cart</h2>
    
    <!-- 商品列表 -->
    <div v-for="item in items" :key="item.id">
      <span>{{ item.name }}</span>
      <span>${{ item.price }}</span>
      <input
        type="number"
        v-model.number="item.quantity"
        min="0"
      />
      <span>小计: ${{ itemTotal(item) }}</span>
    </div>
    
    <!-- 统计信息 -->
    <div>
      <p>商品数量: {{ totalQuantity }}</p>
      <p>总价: {{ formattedTotal }}</p>
      <p>折扣: {{ discount }}%</p>
      <p>实付: {{ finalPrice }}</p>
    </div>
    
    <!-- 搜索 -->
    <input v-model="searchText" placeholder="搜索商品" />
    <div v-for="item in filteredItems" :key="item.id">
      {{ item.name }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { id: 1, name: 'Apple', price: 10, quantity: 2 },
        { id: 2, name: 'Banana', price: 5, quantity: 3 },
        { id: 3, name: 'Orange', price: 8, quantity: 1 }
      ],
      searchText: '',
      discount: 0
    };
  },
  
  computed: {
    // 单个商品小计
    itemTotal() {
      return (item) => item.price * item.quantity;
    },
    
    // 总数量
    totalQuantity() {
      return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    
    // 总价
    totalPrice() {
      return this.items.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0);
    },
    
    // 格式化总价
    formattedTotal() {
      return `$${this.totalPrice.toFixed(2)}`;
    },
    
    // 实付价格
    finalPrice() {
      const discounted = this.totalPrice * (1 - this.discount / 100);
      return `$${discounted.toFixed(2)}`;
    },
    
    // 过滤商品
    filteredItems() {
      if (!this.searchText) return this.items;
      
      return this.items.filter(item =>
        item.name.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
  },
  
  watch: {
    // 监听总价变化，自动应用折扣
    totalPrice(newVal) {
      if (newVal > 100) {
        this.discount = 10;
      } else if (newVal > 50) {
        this.discount = 5;
      } else {
        this.discount = 0;
      }
    },
    
    // 监听商品变化，保存到本地存储
    items: {
      handler(newVal) {
        localStorage.setItem('cart', JSON.stringify(newVal));
      },
      deep: true
    },
    
    // 监听搜索文本，记录搜索历史
    searchText(newVal) {
      if (newVal) {
        this.saveSearchHistory(newVal);
      }
    }
  },
  
  methods: {
    saveSearchHistory(text) {
      // 保存搜索历史
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      if (!history.includes(text)) {
        history.push(text);
        localStorage.setItem('searchHistory', JSON.stringify(history));
      }
    }
  },
  
  created() {
    // 从本地存储恢复购物车
    const saved = localStorage.getItem('cart');
    if (saved) {
      this.items = JSON.parse(saved);
    }
  }
};
</script>
```

## 🔗 相关知识点

- [Vue 响应式原理](./reactive-principle.md)
- [Vue 2 和 Vue 3 的区别](./vue2-vs-vue3.md)
- [Vue 生命周期](./lifecycle.md)

## 📚 参考资料

- [Vue 计算属性](https://cn.vuejs.org/guide/essentials/computed.html)
- [Vue 侦听器](https://cn.vuejs.org/guide/essentials/watchers.html)
- [Composition API - computed](https://cn.vuejs.org/api/reactivity-core.html#computed)
- [Composition API - watch](https://cn.vuejs.org/api/reactivity-core.html#watch)
