---
title: Vue 的 diff 算法与 key 的作用 - 双端比较原理详解
description: 深入理解 Vue 的虚拟 DOM diff 算法，掌握双端比较策略，学习 key 的作用和为什么不能用 index 作为 key
keywords: Vue diff算法, 虚拟DOM, key作用, 双端比较, Vue性能优化, Vue面试
date: 2025-11-27
category: Vue
difficulty: 高级
tags: [diff算法, 虚拟DOM, key, 性能优化, 双端比较]
related: [vue2-vs-vue3.md, v-if-vs-v-show.md]
hasCode: true
---

# 题目

请简述 Vue 的 diff 算法，以及 key 的作用。

## 📝 标准答案

### 核心要点

1. **diff 算法目的**：
   - 高效更新 DOM
   - 最小化 DOM 操作
   - 时间复杂度 O(n)

2. **Vue 2 diff 算法**：
   - 双端比较（头头、尾尾、头尾、尾头）
   - 同层比较，不跨层级
   - 使用 key 优化节点复用

3. **Vue 3 diff 算法**：
   - 静态标记（PatchFlag）
   - 最长递增子序列
   - 更快的更新性能

4. **key 的作用**：
   - 唯一标识节点
   - 帮助 Vue 识别哪些元素改变了
   - 避免就地复用导致的问题

### 详细说明

#### 虚拟 DOM 和 diff 算法

```javascript
// 虚拟 DOM 结构
const vnode = {
  tag: 'div',
  props: { class: 'container' },
  children: [
    { tag: 'p', children: 'Hello' },
    { tag: 'p', children: 'World' }
  ]
};

// diff 算法比较新旧虚拟 DOM
function patch(oldVNode, newVNode) {
  // 1. 如果节点类型不同，直接替换
  if (oldVNode.tag !== newVNode.tag) {
    return replaceNode(oldVNode, newVNode);
  }
  
  // 2. 如果节点类型相同，更新属性
  patchProps(oldVNode, newVNode);
  
  // 3. 比较子节点
  patchChildren(oldVNode.children, newVNode.children);
}
```

## 🧠 深度理解

### Vue 2 的 diff 算法（双端比较）

```javascript
// Vue 2 diff 算法（简化版）
function updateChildren(oldCh, newCh) {
  let oldStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let newStartIdx = 0;
  let newEndIdx = newCh.length - 1;
  
  let oldStartVNode = oldCh[0];
  let oldEndVNode = oldCh[oldEndIdx];
  let newStartVNode = newCh[0];
  let newEndVNode = newCh[newEndIdx];
  
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (!oldStartVNode) {
      oldStartVNode = oldCh[++oldStartIdx];
    } else if (!oldEndVNode) {
      oldEndVNode = oldCh[--oldEndIdx];
    }
    // 1. 头头比较
    else if (sameVNode(oldStartVNode, newStartVNode)) {
      patchVNode(oldStartVNode, newStartVNode);
      oldStartVNode = oldCh[++oldStartIdx];
      newStartVNode = newCh[++newStartIdx];
    }
    // 2. 尾尾比较
    else if (sameVNode(oldEndVNode, newEndVNode)) {
      patchVNode(oldEndVNode, newEndVNode);
      oldEndVNode = oldCh[--oldEndIdx];
      newEndVNode = newCh[--newEndIdx];
    }
    // 3. 头尾比较
    else if (sameVNode(oldStartVNode, newEndVNode)) {
      patchVNode(oldStartVNode, newEndVNode);
      // 移动节点
      nodeOps.insertBefore(parentElm, oldStartVNode.elm, nodeOps.nextSibling(oldEndVNode.elm));
      oldStartVNode = oldCh[++oldStartIdx];
      newEndVNode = newCh[--newEndIdx];
    }
    // 4. 尾头比较
    else if (sameVNode(oldEndVNode, newStartVNode)) {
      patchVNode(oldEndVNode, newStartVNode);
      // 移动节点
      nodeOps.insertBefore(parentElm, oldEndVNode.elm, oldStartVNode.elm);
      oldEndVNode = oldCh[--oldEndIdx];
      newStartVNode = newCh[++newStartIdx];
    }
    // 5. 使用 key 查找
    else {
      const idxInOld = findIdxInOld(newStartVNode, oldCh, oldStartIdx, oldEndIdx);
      
      if (!idxInOld) {
        // 新节点，创建
        createElm(newStartVNode);
      } else {
        // 找到相同 key 的节点，移动
        const vnodeToMove = oldCh[idxInOld];
        patchVNode(vnodeToMove, newStartVNode);
        oldCh[idxInOld] = undefined;
        nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVNode.elm);
      }
      
      newStartVNode = newCh[++newStartIdx];
    }
  }
  
  // 处理剩余节点
  if (oldStartIdx > oldEndIdx) {
    // 新增节点
    addVNodes(newCh, newStartIdx, newEndIdx);
  } else if (newStartIdx > newEndIdx) {
    // 删除节点
    removeVNodes(oldCh, oldStartIdx, oldEndIdx);
  }
}

function sameVNode(a, b) {
  return (
    a.key === b.key &&
    a.tag === b.tag &&
    a.isComment === b.isComment &&
    isDef(a.data) === isDef(b.data) &&
    sameInputType(a, b)
  );
}
```

**双端比较示例：**

```
旧节点：A B C D
新节点：D A B C

第1轮：
  头头比较：A !== D ❌
  尾尾比较：D === D ✅ → 复用 D
  
旧节点：A B C [D已处理]
新节点：[D已处理] A B C

第2轮：
  头头比较：A === A ✅ → 复用 A
  
旧节点：[A已处理] B C
新节点：[A已处理] B C

第3轮：
  头头比较：B === B ✅ → 复用 B
  
第4轮：
  头头比较：C === C ✅ → 复用 C

结果：只移动了 D，其他节点复用
```

### Vue 3 的 diff 算法优化

#### 1. 静态标记（PatchFlag）

```javascript
// Vue 3 编译优化
<template>
  <div>
    <p>Static text</p>  <!-- 静态节点，不参与 diff -->
    <p>{{ dynamic }}</p>  <!-- 动态节点，标记为 TEXT -->
    <p :class="className">Text</p>  <!-- 标记为 CLASS -->
  </div>
</template>

// 编译后
const _hoisted_1 = createVNode("p", null, "Static text");  // 静态提升

function render() {
  return createVNode("div", null, [
    _hoisted_1,  // 静态节点，直接复用
    createVNode("p", null, _ctx.dynamic, 1 /* TEXT */),  // 只更新文本
    createVNode("p", { class: _ctx.className }, "Text", 2 /* CLASS */)  // 只更新 class
  ]);
}
```

**PatchFlag 类型：**

```javascript
export const enum PatchFlags {
  TEXT = 1,           // 动态文本
  CLASS = 1 << 1,     // 动态 class
  STYLE = 1 << 2,     // 动态 style
  PROPS = 1 << 3,     // 动态属性
  FULL_PROPS = 1 << 4,  // 动态 key 的属性
  HYDRATE_EVENTS = 1 << 5,  // 事件监听器
  STABLE_FRAGMENT = 1 << 6,  // 稳定的 fragment
  KEYED_FRAGMENT = 1 << 7,   // 带 key 的 fragment
  UNKEYED_FRAGMENT = 1 << 8, // 不带 key 的 fragment
  NEED_PATCH = 1 << 9,       // 需要 patch
  DYNAMIC_SLOTS = 1 << 10,   // 动态插槽
  HOISTED = -1,              // 静态提升
  BAIL = -2                  // 退出优化
}
```

#### 2. 最长递增子序列

```javascript
// Vue 3 使用最长递增子序列优化移动操作
function patchKeyedChildren(oldCh, newCh) {
  // 1. 从头开始比较
  let i = 0;
  while (i < oldCh.length && i < newCh.length) {
    if (sameVNode(oldCh[i], newCh[i])) {
      patch(oldCh[i], newCh[i]);
      i++;
    } else {
      break;
    }
  }
  
  // 2. 从尾开始比较
  let oldEnd = oldCh.length - 1;
  let newEnd = newCh.length - 1;
  while (oldEnd >= i && newEnd >= i) {
    if (sameVNode(oldCh[oldEnd], newCh[newEnd])) {
      patch(oldCh[oldEnd], newCh[newEnd]);
      oldEnd--;
      newEnd--;
    } else {
      break;
    }
  }
  
  // 3. 处理中间部分
  if (i > oldEnd) {
    // 新增节点
    while (i <= newEnd) {
      mount(newCh[i++]);
    }
  } else if (i > newEnd) {
    // 删除节点
    while (i <= oldEnd) {
      unmount(oldCh[i++]);
    }
  } else {
    // 4. 使用最长递增子序列优化移动
    const keyToNewIndexMap = new Map();
    for (let j = i; j <= newEnd; j++) {
      keyToNewIndexMap.set(newCh[j].key, j);
    }
    
    const newIndexToOldIndexMap = new Array(newEnd - i + 1).fill(-1);
    
    for (let j = i; j <= oldEnd; j++) {
      const newIndex = keyToNewIndexMap.get(oldCh[j].key);
      if (newIndex !== undefined) {
        newIndexToOldIndexMap[newIndex - i] = j;
        patch(oldCh[j], newCh[newIndex]);
      } else {
        unmount(oldCh[j]);
      }
    }
    
    // 计算最长递增子序列
    const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap);
    
    // 移动节点
    let j = increasingNewIndexSequence.length - 1;
    for (let k = newEnd - i; k >= 0; k--) {
      if (newIndexToOldIndexMap[k] === -1) {
        // 新节点，挂载
        mount(newCh[k + i]);
      } else if (k !== increasingNewIndexSequence[j]) {
        // 需要移动
        move(newCh[k + i]);
      } else {
        // 不需要移动
        j--;
      }
    }
  }
}

// 最长递增子序列算法
function getSequence(arr) {
  const len = arr.length;
  const result = [0];
  const p = arr.slice();
  
  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== -1) {
      const j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      
      let left = 0;
      let right = result.length - 1;
      while (left < right) {
        const mid = (left + right) >> 1;
        if (arr[result[mid]] < arrI) {
          left = mid + 1;
        } else {
          right = mid;
        }
      }
      
      if (arrI < arr[result[left]]) {
        if (left > 0) {
          p[i] = result[left - 1];
        }
        result[left] = i;
      }
    }
  }
  
  let len2 = result.length;
  let idx = result[len2 - 1];
  while (len2-- > 0) {
    result[len2] = idx;
    idx = p[idx];
  }
  
  return result;
}
```

**示例：**

```
旧节点：A B C D E F G
新节点：A B D E C F G

1. 从头比较：A B 相同
2. 从尾比较：F G 相同
3. 中间部分：C D E → D E C

计算最长递增子序列：
  索引映射：[2, 3, 4] → [4, 2, 3]
  最长递增子序列：[2, 3]（对应 D E）
  
结果：只需要移动 C，D E 不动
```

### key 的作用

#### 1. 没有 key 的问题

```vue
<template>
  <div>
    <div v-for="item in items">
      <input :value="item.name" />
      <button @click="remove(item)">Remove</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' }
      ]
    };
  },
  
  methods: {
    remove(item) {
      const index = this.items.indexOf(item);
      this.items.splice(index, 1);
    }
  }
};
</script>
```

**问题：**
- 删除 Bob 后，Charlie 的 input 会显示 Bob 的值
- 因为 Vue 就地复用了 DOM 元素
- input 的值没有绑定到数据，导致错乱

#### 2. 使用 key 解决

```vue
<template>
  <div>
    <!-- ✅ 使用 key -->
    <div v-for="item in items" :key="item.id">
      <input :value="item.name" />
      <button @click="remove(item)">Remove</button>
    </div>
  </div>
</template>
```

**效果：**
- Vue 根据 key 识别每个元素
- 删除 Bob 后，Charlie 的元素保持不变
- 不会出现数据错乱

#### 3. key 的最佳实践

```vue
<template>
  <div>
    <!-- ✅ 使用唯一 ID -->
    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>
    
    <!-- ❌ 不要使用 index -->
    <div v-for="(item, index) in items" :key="index">
      {{ item.name }}
    </div>
    <!-- 问题：删除/插入元素时，index 会变化 -->
    
    <!-- ❌ 不要使用随机数 -->
    <div v-for="item in items" :key="Math.random()">
      {{ item.name }}
    </div>
    <!-- 问题：每次渲染都会重新创建元素 -->
  </div>
</template>
```

### 常见误区

1. **误区：key 可以提高性能**
   ```vue
   <!-- ❌ 错误理解 -->
   <!-- key 不是用来提高性能的，而是用来正确识别节点 -->
   
   <!-- 某些情况下，不使用 key 反而更快（就地复用） -->
   <div v-for="item in items">
     {{ item }}
   </div>
   
   <!-- 但如果有状态（如 input），必须使用 key -->
   <div v-for="item in items" :key="item.id">
     <input v-model="item.value" />
   </div>
   ```

2. **误区：使用 index 作为 key**
   ```vue
   <!-- ❌ 错误：index 会变化 -->
   <div v-for="(item, index) in items" :key="index">
     <input v-model="item.value" />
   </div>
   
   <!-- 删除第一个元素后：
        原来的 index 1 变成 index 0
        导致 input 的值错乱 -->
   
   <!-- ✅ 正确：使用唯一 ID -->
   <div v-for="item in items" :key="item.id">
     <input v-model="item.value" />
   </div>
   ```

3. **误区：所有列表都需要 key**
   ```vue
   <!-- 静态列表，不需要 key -->
   <div v-for="item in staticItems">
     {{ item }}
   </div>
   
   <!-- 动态列表，需要 key -->
   <div v-for="item in dynamicItems" :key="item.id">
     {{ item }}
   </div>
   ```

## 💡 面试回答技巧

### 🎯 一句话回答（快速版）

> Vue 的 diff 算法通过同层比较和 key 标识，将传统 O(n³) 的复杂度优化到 O(n)，实现高效的 DOM 更新。key 的作用是帮助 Vue 正确识别节点，避免就地复用导致的问题。

### 📣 口语化回答（推荐）

面试时可以这样回答：

> "Vue 的 diff 算法是用来高效更新 DOM 的。当数据变化时，Vue 会生成新的虚拟 DOM，然后和旧的虚拟 DOM 进行对比，找出需要更新的部分，最小化真实 DOM 操作。
>
> 传统的 diff 算法是 O(n³) 的复杂度，Vue 做了优化，降到了 O(n)。主要是三个策略：
>
> 第一，**只比较同层节点**，不跨层级比较。如果父节点不同，直接替换整个子树，不会去比较子节点。
>
> 第二，**不同类型的节点直接替换**，不会去比较内容。比如 div 变成 span，直接删掉 div 创建 span。
>
> 第三，**用 key 来标识节点**。这样在列表更新时，Vue 能知道哪些节点是移动了，哪些是新增或删除的，而不是傻傻地按顺序比较。
>
> 说到 key，它的作用是帮助 Vue 正确识别节点。如果不加 key 或者用 index 作为 key，Vue 会采用"就地复用"策略，可能导致一些奇怪的 bug，比如输入框内容错乱。所以最佳实践是用唯一 ID 作为 key。
>
> Vue 3 相比 Vue 2 还做了进一步优化，用最长递增子序列算法来减少节点移动次数，还有静态标记来跳过静态节点的比较。"

### 推荐回答顺序

1. **先说 diff 算法的目的**：
   - "高效更新 DOM，最小化 DOM 操作"
   - "时间复杂度 O(n)"

2. **再说 diff 算法的策略**：
   - "同层比较，不跨层级"
   - "Vue 2 使用双端比较"
   - "Vue 3 使用最长递增子序列"

3. **然后说 key 的作用**：
   - "唯一标识节点"
   - "帮助 Vue 识别哪些元素改变了"
   - "避免就地复用导致的问题"

4. **最后说最佳实践**：
   - "使用唯一 ID 作为 key"
   - "不要使用 index 或随机数"

### 重点强调

- ✅ **diff 算法是同层比较**
- ✅ **key 用于正确识别节点，不是提高性能**
- ✅ **Vue 3 的优化：静态标记、最长递增子序列**
- ✅ **不要使用 index 作为 key**

### 可能的追问

**Q1: 为什么 diff 算法是 O(n) 而不是 O(n³)？**

A:
- 传统 diff 算法是 O(n³)（树的编辑距离）
- Vue 做了三个假设优化：
  1. 只比较同层节点，不跨层级
  2. 不同类型的节点直接替换
  3. 使用 key 识别节点
- 这样时间复杂度降到 O(n)

**Q2: Vue 2 和 Vue 3 的 diff 算法有什么区别？**

A:
| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 策略 | 双端比较 | 最长递增子序列 |
| 静态优化 | 无 | 静态标记 |
| 性能 | 较快 | 更快 |

**Q3: 什么时候不需要 key？**

A:
- 静态列表（不会改变）
- 简单的文本列表（无状态）
- 列表只用于展示（不涉及交互）

**Q4: key 相同但内容不同会怎样？**

A:
```vue
<!-- 两个元素 key 相同 -->
<div key="same">A</div>
<div key="same">B</div>

<!-- Vue 会认为是同一个元素，只更新内容 -->
<!-- 结果：复用 DOM，只改变文本 A → B -->
```

## 💻 代码示例

### diff 算法演示

```javascript
// 简化的 diff 算法实现
class VNode {
  constructor(tag, props, children) {
    this.tag = tag;
    this.props = props;
    this.children = children;
    this.key = props?.key;
  }
}

function patch(oldVNode, newVNode, container) {
  // 1. 旧节点不存在，直接挂载
  if (!oldVNode) {
    mount(newVNode, container);
    return;
  }
  
  // 2. 新节点不存在，卸载旧节点
  if (!newVNode) {
    unmount(oldVNode);
    return;
  }
  
  // 3. 节点类型不同，替换
  if (oldVNode.tag !== newVNode.tag) {
    unmount(oldVNode);
    mount(newVNode, container);
    return;
  }
  
  // 4. 节点类型相同，更新
  const el = (newVNode.el = oldVNode.el);
  
  // 更新 props
  patchProps(el, oldVNode.props, newVNode.props);
  
  // 更新 children
  patchChildren(oldVNode, newVNode, el);
}

function patchChildren(oldVNode, newVNode, container) {
  const oldChildren = oldVNode.children;
  const newChildren = newVNode.children);
  
  // 1. 新children是文本
  if (typeof newChildren === 'string') {
    if (Array.isArray(oldChildren)) {
      oldChildren.forEach(child => unmount(child));
    }
    container.textContent = newChildren;
  }
  // 2. 新children是数组
  else if (Array.isArray(newChildren)) {
    if (Array.isArray(oldChildren)) {
      // 核心 diff 算法
      patchKeyedChildren(oldChildren, newChildren, container);
    } else {
      container.textContent = '';
      newChildren.forEach(child => mount(child, container));
    }
  }
  // 3. 新children不存在
  else {
    if (Array.isArray(oldChildren)) {
      oldChildren.forEach(child => unmount(child));
    } else {
      container.textContent = '';
    }
  }
}

function patchKeyedChildren(oldChildren, newChildren, container) {
  // 双端比较算法
  let oldStartIdx = 0;
  let oldEndIdx = oldChildren.length - 1;
  let newStartIdx = 0;
  let newEndIdx = newChildren.length - 1;
  
  let oldStartVNode = oldChildren[0];
  let oldEndVNode = oldChildren[oldEndIdx];
  let newStartVNode = newChildren[0];
  let newEndVNode = newChildren[newEndIdx];
  
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (!oldStartVNode) {
      oldStartVNode = oldChildren[++oldStartIdx];
    } else if (!oldEndVNode) {
      oldEndVNode = oldChildren[--oldEndIdx];
    } else if (oldStartVNode.key === newStartVNode.key) {
      // 头头比较
      patch(oldStartVNode, newStartVNode, container);
      oldStartVNode = oldChildren[++oldStartIdx];
      newStartVNode = newChildren[++newStartIdx];
    } else if (oldEndVNode.key === newEndVNode.key) {
      // 尾尾比较
      patch(oldEndVNode, newEndVNode, container);
      oldEndVNode = oldChildren[--oldEndIdx];
      newEndVNode = newChildren[--newEndIdx];
    } else if (oldStartVNode.key === newEndVNode.key) {
      // 头尾比较
      patch(oldStartVNode, newEndVNode, container);
      container.insertBefore(oldStartVNode.el, oldEndVNode.el.nextSibling);
      oldStartVNode = oldChildren[++oldStartIdx];
      newEndVNode = newChildren[--newEndIdx];
    } else if (oldEndVNode.key === newStartVNode.key) {
      // 尾头比较
      patch(oldEndVNode, newStartVNode, container);
      container.insertBefore(oldEndVNode.el, oldStartVNode.el);
      oldEndVNode = oldChildren[--oldEndIdx];
      newStartVNode = newChildren[++newStartIdx];
    } else {
      // 使用 key 查找
      const idxInOld = oldChildren.findIndex(
        node => node && node.key === newStartVNode.key
      );
      
      if (idxInOld > 0) {
        const vnodeToMove = oldChildren[idxInOld];
        patch(vnodeToMove, newStartVNode, container);
        container.insertBefore(vnodeToMove.el, oldStartVNode.el);
        oldChildren[idxInOld] = undefined;
      } else {
        mount(newStartVNode, container, oldStartVNode.el);
      }
      
      newStartVNode = newChildren[++newStartIdx];
    }
  }
  
  // 处理剩余节点
  if (oldStartIdx > oldEndIdx && newStartIdx <= newEndIdx) {
    // 新增节点
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      mount(newChildren[i], container);
    }
  } else if (newStartIdx > newEndIdx && oldStartIdx <= oldEndIdx) {
    // 删除节点
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      unmount(oldChildren[i]);
    }
  }
}
```

## 🔗 相关知识点

- [Vue 2 和 Vue 3 的区别](./vue2-vs-vue3.md)
- [v-if 和 v-show 的区别](./v-if-vs-v-show.md)
- [Vue 性能优化](./performance-optimization.md)

## 📚 参考资料

- [Vue 虚拟 DOM](https://cn.vuejs.org/guide/extras/rendering-mechanism.html)
- [Vue 3 diff 算法源码](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/renderer.ts)
- [最长递增子序列算法](https://en.wikipedia.org/wiki/Longest_increasing_subsequence)
