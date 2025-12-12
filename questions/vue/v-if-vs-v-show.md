---
title: v-if 和 v-show 的区别
date: 2025-11-27
category: Vue
difficulty: 基础
tags: [指令, v-if, v-show, 条件渲染, 性能优化]
related: [lifecycle.md, diff-algorithm.md]
hasCode: true
---

# 题目

请详细说明 v-if 和 v-show 的区别，以及各自的使用场景。

## 📝 标准答案

### 核心要点

1. **实现方式**：
   - `v-if`：条件渲染，动态创建/销毁 DOM 元素
   - `v-show`：条件显示，通过 CSS `display` 属性控制显示/隐藏

2. **性能差异**：
   - `v-if`：切换开销大，适合不频繁切换的场景
   - `v-show`：初始渲染开销大，适合频繁切换的场景

3. **生命周期**：
   - `v-if`：会触发组件的创建和销毁生命周期
   - `v-show`：不会触发生命周期，只是隐藏

4. **使用场景**：
   - `v-if`：权限控制、大型组件的按需加载
   - `v-show`：Tab 切换、模态框显示/隐藏

### 详细说明

#### 基本用法

```vue
<template>
  <div>
    <!-- v-if：条件为 false 时，元素不存在于 DOM 中 -->
    <div v-if="show">
      使用 v-if
    </div>
    
    <!-- v-show：条件为 false 时，元素存在但 display: none -->
    <div v-show="show">
      使用 v-show
    </div>
    
    <button @click="show = !show">Toggle</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: true
    };
  }
};
</script>
```

**渲染结果对比：**

```html
<!-- show = true 时 -->
<div>使用 v-if</div>
<div style="">使用 v-show</div>

<!-- show = false 时 -->
<!-- v-if 的元素不存在 -->
<div style="display: none;">使用 v-show</div>
```

## 🧠 深度理解

### 实现原理

#### v-if 的实现

```javascript
// Vue 编译后的代码（简化版）
function render() {
  return this.show
    ? h('div', '使用 v-if')  // 条件为 true，创建 VNode
    : null;  // 条件为 false，返回 null
}

// 当 show 从 true 变为 false
// 1. 触发 beforeDestroy 钩子
// 2. 移除 DOM 元素
// 3. 触发 destroyed 钩子

// 当 show 从 false 变为 true
// 1. 触发 beforeCreate 钩子
// 2. 触发 created 钩子
// 3. 触发 beforeMount 钩子
// 4. 创建 DOM 元素
// 5. 触发 mounted 钩子
```

#### v-show 的实现

```javascript
// Vue 编译后的代码（简化版）
function render() {
  return h('div', {
    style: {
      display: this.show ? '' : 'none'  // 通过 CSS 控制
    }
  }, '使用 v-show');
}

// 当 show 切换时
// 只修改 style.display 属性
// 不触发任何生命周期钩子
```

### 性能对比

#### 1. 初始渲染

```vue
<template>
  <div>
    <!-- v-if：初始为 false 时不渲染，性能好 -->
    <HeavyComponent v-if="show" />
    
    <!-- v-show：初始为 false 时也会渲染，性能差 -->
    <HeavyComponent v-show="show" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: false  // 初始为 false
    };
  }
};
</script>
```

**性能测试：**

```javascript
// 假设 HeavyComponent 渲染需要 100ms

// v-if (show = false)
// 初始渲染：0ms（不渲染）
// 切换为 true：100ms（创建组件）
// 总计：100ms

// v-show (show = false)
// 初始渲染：100ms（渲染但隐藏）
// 切换为 true：0ms（只改变 display）
// 总计：100ms
```

#### 2. 频繁切换

```vue
<template>
  <div>
    <button @click="toggle">Toggle ({{ count }} times)</button>
    
    <!-- v-if：每次切换都创建/销毁，性能差 -->
    <div v-if="show">v-if content</div>
    
    <!-- v-show：每次切换只改变 display，性能好 -->
    <div v-show="show">v-show content</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: true,
      count: 0
    };
  },
  
  methods: {
    toggle() {
      this.show = !this.show;
      this.count++;
    }
  }
};
</script>
```

**性能测试：**

```javascript
// 切换 1000 次

// v-if
// 每次切换：创建 VNode + 操作 DOM + 生命周期
// 总耗时：约 500ms

// v-show
// 每次切换：只修改 style.display
// 总耗时：约 50ms
```

### 生命周期差异

```vue
<template>
  <div>
    <button @click="show = !show">Toggle</button>
    
    <LifecycleComponent v-if="show" key="v-if" />
    <LifecycleComponent v-show="show" key="v-show" />
  </div>
</template>

<script>
// LifecycleComponent.vue
export default {
  name: 'LifecycleComponent',
  
  beforeCreate() {
    console.log('beforeCreate');
  },
  
  created() {
    console.log('created');
  },
  
  beforeMount() {
    console.log('beforeMount');
  },
  
  mounted() {
    console.log('mounted');
  },
  
  beforeDestroy() {
    console.log('beforeDestroy');
  },
  
  destroyed() {
    console.log('destroyed');
  }
};
</script>
```

**执行结果：**

```javascript
// v-if：show 从 true 变为 false
// 输出：beforeDestroy → destroyed

// v-if：show 从 false 变为 true
// 输出：beforeCreate → created → beforeMount → mounted

// v-show：切换时
// 输出：（无任何输出）
```

### 使用场景

#### 1. v-if 适用场景

```vue
<template>
  <div>
    <!-- ✅ 权限控制 -->
    <AdminPanel v-if="isAdmin" />
    
    <!-- ✅ 按需加载大型组件 -->
    <HeavyChart v-if="showChart" />
    
    <!-- ✅ 条件很少改变 -->
    <WelcomeMessage v-if="isFirstVisit" />
    
    <!-- ✅ 懒加载 -->
    <LazyComponent v-if="isVisible" />
  </div>
</template>

<script>
export default {
  computed: {
    isAdmin() {
      return this.$store.state.user.role === 'admin';
    }
  }
};
</script>
```

#### 2. v-show 适用场景

```vue
<template>
  <div>
    <!-- ✅ Tab 切换 -->
    <div v-show="activeTab === 'home'">Home</div>
    <div v-show="activeTab === 'about'">About</div>
    <div v-show="activeTab === 'contact'">Contact</div>
    
    <!-- ✅ 模态框 -->
    <Modal v-show="showModal" />
    
    <!-- ✅ 下拉菜单 -->
    <Dropdown v-show="isOpen" />
    
    <!-- ✅ 频繁切换的内容 -->
    <div v-show="isExpanded">
      Expanded content
    </div>
  </div>
</template>
```

### 常见误区

1. **误区：v-show 比 v-if 性能好**
   ```vue
   <!-- ❌ 错误：初始不显示的大型组件用 v-show -->
   <HeavyComponent v-show="false" />
   <!-- 问题：组件会被渲染，浪费资源 -->
   
   <!-- ✅ 正确：用 v-if -->
   <HeavyComponent v-if="false" />
   <!-- 不会渲染，节省资源 -->
   ```

2. **误区：v-if 和 v-for 一起使用**
   ```vue
   <!-- ❌ 错误：v-if 和 v-for 在同一元素上 -->
   <div v-for="item in items" v-if="item.isActive">
     {{ item.name }}
   </div>
   <!-- Vue 2：v-for 优先级高，每次都会遍历
      Vue 3：v-if 优先级高，但仍不推荐 -->
   
   <!-- ✅ 正确：使用 computed 过滤 -->
   <div v-for="item in activeItems" :key="item.id">
     {{ item.name }}
   </div>
   
   <script>
   export default {
     computed: {
       activeItems() {
         return this.items.filter(item => item.isActive);
       }
     }
   };
   </script>
   ```

3. **误区：v-show 可以用在组件上**
   ```vue
   <!-- ✅ 可以，但要注意 -->
   <MyComponent v-show="show" />
   <!-- 组件的根元素会被设置 display: none -->
   
   <!-- 如果组件有多个根元素（Vue 3） -->
   <template>
     <div>Root 1</div>
     <div>Root 2</div>
   </template>
   <!-- v-show 会失效，应该用 v-if -->
   ```

### 进阶知识

#### 1. v-if 的惰性

```vue
<template>
  <div>
    <!-- v-if 是惰性的，初始为 false 时不会渲染 -->
    <ExpensiveComponent v-if="show" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: false
    };
  },
  
  mounted() {
    // 延迟加载
    setTimeout(() => {
      this.show = true;
    }, 2000);
  }
};
</script>
```

#### 2. v-if 与 v-else-if、v-else

```vue
<template>
  <div>
    <div v-if="type === 'A'">Type A</div>
    <div v-else-if="type === 'B'">Type B</div>
    <div v-else-if="type === 'C'">Type C</div>
    <div v-else>Not A/B/C</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      type: 'A'
    };
  }
};
</script>
```

#### 3. key 的作用

```vue
<template>
  <div>
    <!-- 不使用 key：Vue 会复用元素 -->
    <input v-if="loginType === 'username'" placeholder="用户名" />
    <input v-else placeholder="邮箱" />
    <!-- 切换时，input 元素被复用，输入的内容不会清空 -->
    
    <!-- 使用 key：强制替换元素 -->
    <input v-if="loginType === 'username'" key="username" placeholder="用户名" />
    <input v-else key="email" placeholder="邮箱" />
    <!-- 切换时，input 元素被替换，输入的内容会清空 -->
  </div>
</template>
```

#### 4. 自定义指令实现 v-show

```javascript
// 自定义 v-show 指令
Vue.directive('show', {
  bind(el, binding) {
    el.style.display = binding.value ? '' : 'none';
  },
  
  update(el, binding) {
    el.style.display = binding.value ? '' : 'none';
  }
});

// 使用
<div v-show="isVisible">Content</div>
```

## 💡 面试回答技巧

### 🎯 一句话回答（快速版）

> v-if 是真正的条件渲染，会创建/销毁 DOM；v-show 只是 CSS 的 display 切换。频繁切换用 v-show，不频繁切换用 v-if。

### 📣 口语化回答（推荐）

面试时可以这样回答：

> "v-if 和 v-show 都能控制元素的显示隐藏，但实现方式不一样。
>
> **v-if** 是真正的条件渲染，条件为 false 时，DOM 元素根本不会存在，条件为 true 时才会创建。所以它有更高的切换开销，每次切换都要创建或销毁 DOM。
>
> **v-show** 只是通过 CSS 的 `display: none` 来控制显示隐藏，DOM 元素始终存在。所以它有更高的初始渲染开销，但切换开销很低。
>
> 选择的话，**频繁切换用 v-show，不频繁切换用 v-if**。比如 Tab 切换、模态框这种频繁显示隐藏的场景用 v-show；权限控制、按需加载这种不怎么变的场景用 v-if。
>
> 另外，v-if 会触发组件的生命周期，每次显示都会重新走 created、mounted，隐藏会走 destroyed。v-show 不会触发生命周期，组件状态会保留。
>
> 还有一点，v-if 可以和 v-else、v-else-if 配合使用，v-show 不行。"

### 推荐回答顺序

1. **先说实现方式**：
   - "v-if 是条件渲染，动态创建/销毁 DOM"
   - "v-show 是条件显示，通过 CSS display 控制"

2. **再说性能差异**：
   - "v-if 切换开销大，适合不频繁切换"
   - "v-show 初始渲染开销大，适合频繁切换"

3. **然后说生命周期**：
   - "v-if 会触发组件的创建和销毁生命周期"
   - "v-show 不会触发生命周期"

4. **最后说使用场景**：
   - "v-if 适合权限控制、按需加载"
   - "v-show 适合 Tab 切换、模态框"

### 重点强调

- ✅ **v-if 是真正的条件渲染**
- ✅ **v-show 只是 CSS 控制**
- ✅ **根据场景选择合适的指令**
- ✅ **避免 v-if 和 v-for 一起使用**

### 可能的追问

**Q1: v-if 和 v-show 可以一起使用吗？**

A:
```vue
<!-- 可以，但没有意义 -->
<div v-if="condition1" v-show="condition2">
  Content
</div>

<!-- 等价于 -->
<div v-if="condition1 && condition2">
  Content
</div>
```

**Q2: 如何优化 v-if 的性能？**

A:
1. 使用 v-show 代替频繁切换的 v-if
2. 使用 computed 缓存条件
3. 使用 keep-alive 缓存组件
4. 懒加载大型组件

```vue
<template>
  <div>
    <!-- 使用 computed 缓存 -->
    <div v-if="shouldShow">Content</div>
    
    <!-- 使用 keep-alive 缓存 -->
    <keep-alive>
      <component :is="currentComponent" />
    </keep-alive>
  </div>
</template>

<script>
export default {
  computed: {
    shouldShow() {
      // 复杂的条件判断
      return this.condition1 && this.condition2 && this.condition3;
    }
  }
};
</script>
```

**Q3: v-if 的优先级是多少？**

A:
- Vue 2：v-for > v-if
- Vue 3：v-if > v-for
- 但都不推荐在同一元素上使用

**Q4: 如何实现条件渲染的过渡效果？**

A:
```vue
<template>
  <div>
    <!-- v-if 配合 transition -->
    <transition name="fade">
      <div v-if="show">Content</div>
    </transition>
    
    <!-- v-show 配合 transition -->
    <transition name="fade">
      <div v-show="show">Content</div>
    </transition>
  </div>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
```

## 💻 代码示例

### 性能对比测试

```vue
<template>
  <div>
    <h2>性能对比测试</h2>
    
    <button @click="toggleVIf">Toggle v-if ({{ vIfCount }} times)</button>
    <button @click="toggleVShow">Toggle v-show ({{ vShowCount }} times)</button>
    
    <p>v-if 耗时: {{ vIfTime }}ms</p>
    <p>v-show 耗时: {{ vShowTime }}ms</p>
    
    <div v-if="showVIf">
      <HeavyComponent />
    </div>
    
    <div v-show="showVShow">
      <HeavyComponent />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showVIf: true,
      showVShow: true,
      vIfCount: 0,
      vShowCount: 0,
      vIfTime: 0,
      vShowTime: 0
    };
  },
  
  methods: {
    toggleVIf() {
      const start = performance.now();
      this.showVIf = !this.showVIf;
      this.$nextTick(() => {
        const end = performance.now();
        this.vIfTime = (end - start).toFixed(2);
        this.vIfCount++;
      });
    },
    
    toggleVShow() {
      const start = performance.now();
      this.showVShow = !this.showVShow;
      this.$nextTick(() => {
        const end = performance.now();
        this.vShowTime = (end - start).toFixed(2);
        this.vShowCount++;
      });
    }
  }
};
</script>
```

### 实战应用

```vue
<template>
  <div>
    <!-- Tab 切换：使用 v-show -->
    <div class="tabs">
      <button @click="activeTab = 'home'">Home</button>
      <button @click="activeTab = 'about'">About</button>
      <button @click="activeTab = 'contact'">Contact</button>
    </div>
    
    <div class="tab-content">
      <div v-show="activeTab === 'home'">Home Content</div>
      <div v-show="activeTab === 'about'">About Content</div>
      <div v-show="activeTab === 'contact'">Contact Content</div>
    </div>
    
    <!-- 权限控制：使用 v-if -->
    <AdminPanel v-if="isAdmin" />
    <UserPanel v-else />
    
    <!-- 模态框：使用 v-show -->
    <div v-show="showModal" class="modal">
      <div class="modal-content">
        <h2>Modal Title</h2>
        <p>Modal content</p>
        <button @click="showModal = false">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'home',
      showModal: false
    };
  },
  
  computed: {
    isAdmin() {
      return this.$store.state.user.role === 'admin';
    }
  }
};
</script>
```

## 🔗 相关知识点

- [Vue 生命周期](./lifecycle.md)
- [Vue 的 diff 算法](./diff-algorithm.md)
- [条件渲染优化](./performance-optimization.md)

## 📚 参考资料

- [Vue 条件渲染](https://cn.vuejs.org/guide/essentials/conditional.html)
- [v-if vs v-show](https://cn.vuejs.org/guide/essentials/conditional.html#v-if-vs-v-show)
- [Vue 性能优化](https://cn.vuejs.org/guide/best-practices/performance.html)
