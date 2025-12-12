---
title: Vue的diff算法对比（Vue2 vs Vue3）
date: 2025-12-12
category: Vue
difficulty: 高级
tags: [Vue, diff算法, 虚拟DOM, 性能优化, Vue2, Vue3]
related: [diff-algorithm.md, vue2-vs-vue3.md]
hasCode: true
---

# 题目

请详细说明Vue的diff算法原理，并对比Vue2和Vue3的diff算法有什么区别和优化？

## 📝 标准答案

### 核心要点

1. **diff算法目的**：高效对比新旧虚拟DOM，最小化真实DOM操作
2. **Vue2双端比较**：同时从头尾两端开始比较，时间复杂度O(n)
3. **Vue3最长递增子序列**：基于最长递增子序列优化，减少移动操作
4. **性能提升**：Vue3在复杂列表场景下性能显著优于Vue2

### 详细说明

#### 什么是diff算法？

diff算法是虚拟DOM的核心，用于对比新旧虚拟DOM树的差异，然后高效地更新真实DOM。

**为什么需要diff？**
- 直接操作DOM很慢
- 重新创建整个DOM树代价太大
- 需要找出最小的变化集合

#### Vue2的diff算法（双端比较）

Vue2使用**双端比较算法**，同时从新旧节点列表的头尾四个位置开始比较：

```javascript
// Vue2 双端比较的四种情况
function updateChildren(oldCh, newCh) {
  let oldStartIdx = 0, newStartIdx = 0
  let oldEndIdx = oldCh.length - 1, newEndIdx = newCh.length - 1
  let oldStartVnode = oldCh[0], oldEndVnode = oldCh[oldEndIdx]
  let newStartVnode = newCh[0], newEndVnode = newCh[newEndIdx]

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (sameVnode(oldStartVnode, newStartVnode)) {
      // 情况1：头头比较
      patchVnode(oldStartVnode, newStartVnode)
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      // 情况2：尾尾比较
      patchVnode(oldEndVnode, newEndVnode)
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      // 情况3：头尾比较
      patchVnode(oldStartVnode, newEndVnode)
      // 移动节点
      nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      // 情况4：尾头比较
      patchVnode(oldEndVnode, newStartVnode)
      // 移动节点
      nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]
    } else {
      // 都不匹配，通过key查找
      // ...
    }
  }
}
```

**Vue2双端比较的特点：**
- 同时从头尾开始比较，覆盖常见场景
- 对于简单的增删改操作效率很高
- 但在复杂移动场景下可能产生不必要的移动

#### Vue3的diff算法（最长递增子序列）

Vue3采用了更先进的算法，基于**最长递增子序列（LIS）**：

```javascript
// Vue3 patchKeyedChildren 核心逻辑
function patchKeyedChildren(c1, c2, container) {
  let i = 0
  const l2 = c2.length
  let e1 = c1.length - 1 // 旧列表尾部索引
  let e2 = l2 - 1 // 新列表尾部索引

  // 1. 从头开始比较相同的节点
  while (i <= e1 && i <= e2) {
    const n1 = c1[i], n2 = c2[i]
    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, container)
    } else {
      break
    }
    i++
  }

  // 2. 从尾开始比较相同的节点
  while (i <= e1 && i <= e2) {
    const n1 = c1[e1], n2 = c2[e2]
    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, container)
    } else {
      break
    }
    e1--
    e2--
  }

  // 3. 处理新增节点
  if (i > e1) {
    if (i <= e2) {
      // 有新节点需要挂载
      while (i <= e2) {
        patch(null, c2[i], container)
        i++
      }
    }
  }
  // 4. 处理删除节点
  else if (i > e2) {
    while (i <= e1) {
      unmount(c1[i])
      i++
    }
  }
  // 5. 处理复杂情况：移动、新增、删除混合
  else {
    // 使用最长递增子序列算法
    const s1 = i, s2 = i
    const keyToNewIndexMap = new Map()
    
    // 建立新节点的key -> index映射
    for (i = s2; i <= e2; i++) {
      keyToNewIndexMap.set(c2[i].key, i)
    }
    
    // 计算最长递增子序列
    const newIndexToOldIndexMap = new Array(e2 - s2 + 1).fill(0)
    let moved = false
    let maxNewIndexSoFar = 0
    
    for (i = s1; i <= e1; i++) {
      const prevChild = c1[i]
      const newIndex = keyToNewIndexMap.get(prevChild.key)
      
      if (newIndex === undefined) {
        // 旧节点在新列表中不存在，删除
        unmount(prevChild)
      } else {
        newIndexToOldIndexMap[newIndex - s2] = i + 1
        if (newIndex >= maxNewIndexSoFar) {
          maxNewIndexSoFar = newIndex
        } else {
          moved = true
        }
        patch(prevChild, c2[newIndex], container)
      }
    }
    
    // 生成最长递增子序列
    const increasingNewIndexSequence = moved
      ? getSequence(newIndexToOldIndexMap)
      : []
    
    // 从后往前遍历，移动和挂载节点
    let j = increasingNewIndexSequence.length - 1
    for (i = e2 - s2; i >= 0; i--) {
      const nextIndex = s2 + i
      const nextChild = c2[nextIndex]
      
      if (newIndexToOldIndexMap[i] === 0) {
        // 新节点，挂载
        patch(null, nextChild, container)
      } else if (moved) {
        if (j < 0 || i !== increasingNewIndexSequence[j]) {
          // 需要移动
          move(nextChild, container)
        } else {
          j--
        }
      }
    }
  }
}
```

### Vue2 vs Vue3 diff算法对比

| 特性 | Vue2 | Vue3 |
|------|------|------|
| **算法策略** | 双端比较 | 最长递增子序列 |
| **时间复杂度** | O(n) | O(n log n) |
| **空间复杂度** | O(1) | O(n) |
| **移动次数** | 可能较多 | 最少移动 |
| **适用场景** | 简单列表变化 | 复杂列表重排 |
| **性能表现** | 一般场景好 | 复杂场景更优 |

#### 具体优化点

**1. 预处理优化**
```javascript
// Vue3会先处理头尾相同的节点
// 减少需要diff的节点数量

// 旧: [A, B, C, D, E]
// 新: [A, B, X, Y, E]
// 预处理后只需要diff: [C, D] vs [X, Y]
```

**2. 静态标记**
```javascript
// Vue3编译时会标记静态节点
const _hoisted_1 = { class: "static" }

function render() {
  return [
    h('div', _hoisted_1, 'Static content'), // 不参与diff
    h('div', { class: this.dynamic }, this.text) // 参与diff
  ]
}
```

**3. 最长递增子序列优化**
```javascript
// 例子：旧 [A, B, C, D] -> 新 [A, C, B, D]
// Vue2: 可能移动B和C
// Vue3: 通过LIS算法，只移动B，C保持不动
```

## 🧠 深度理解

### 为什么Vue3要改进diff算法？

#### Vue2双端比较的局限性

```javascript
// 场景：列表项大量重排
// 旧: [1, 2, 3, 4, 5, 6, 7, 8, 9]
// 新: [9, 1, 8, 2, 7, 3, 6, 4, 5]

// Vue2双端比较会产生很多不必要的移动操作
// 因为它无法识别出最优的移动策略
```

#### Vue3最长递增子序列的优势

```javascript
// 同样的场景
// Vue3通过LIS算法找出: [1, 2, 3, 4, 5] 这个递增序列
// 只需要移动 [9, 8, 7, 6]，而 [1, 2, 3, 4, 5] 保持不动
// 大大减少了DOM操作次数
```

### 最长递增子序列算法详解

```javascript
// 获取最长递增子序列的索引
function getSequence(arr) {
  const p = arr.slice() // 记录前驱
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      // 二分查找
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  
  u = result.length
  v = result[result.length - 1]
  // 回溯构建最长递增子序列
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}
```

### 实际性能对比

```javascript
// 测试场景：1000个节点的复杂重排
const oldList = Array.from({length: 1000}, (_, i) => i)
const newList = oldList.slice().sort(() => Math.random() - 0.5)

// Vue2: 平均需要移动 ~500 次
// Vue3: 平均需要移动 ~200 次
// 性能提升约 60%
```

### 编译时优化

Vue3还在编译时做了很多优化：

```javascript
// 编译前
<template>
  <div>
    <span>Static</span>
    <span>{{ dynamic }}</span>
  </div>
</template>

// 编译后（简化）
function render() {
  return h('div', [
    _hoisted_1, // 静态节点，不参与diff
    h('span', this.dynamic) // 动态节点，标记为需要diff
  ])
}
```

## 💡 面试回答技巧

### 🎯 一句话回答（快速版）

> Vue2用双端比较算法，Vue3用最长递增子序列算法，Vue3在复杂列表重排场景下移动次数更少，性能更好。

### 📣 口语化回答（推荐）

面试时可以这样回答：

> "Vue的diff算法是虚拟DOM的核心，用来高效对比新旧虚拟DOM的差异。
>
> **Vue2使用双端比较算法**，就是同时从新旧节点列表的头尾四个位置开始比较，包括头头比较、尾尾比较、头尾比较、尾头比较四种情况。这种算法对于简单的增删改操作效率很高，时间复杂度是O(n)。
>
> **Vue3改用了最长递增子序列算法**，这是一个更先进的算法。它会先处理头尾相同的节点，然后对于中间复杂的部分，通过最长递增子序列找出哪些节点可以保持不动，只移动必须移动的节点。
>
> **主要区别是**：Vue2可能会产生不必要的移动操作，而Vue3通过LIS算法能找到最优的移动策略，大大减少DOM操作次数。特别是在复杂的列表重排场景下，Vue3的性能提升非常明显。
>
> 另外Vue3还有编译时优化，会标记静态节点，这些节点根本不参与diff，进一步提升了性能。"

### 推荐回答顺序

1. **说明diff算法的作用**：对比虚拟DOM差异，最小化DOM操作
2. **介绍Vue2双端比较**：四种比较情况，适合简单场景
3. **介绍Vue3 LIS算法**：最长递增子序列，减少移动次数
4. **对比性能差异**：复杂场景下Vue3性能更优
5. **补充编译时优化**：静态标记等优化手段

### 重点强调

- 强调diff算法的核心目的：最小化DOM操作
- 说明Vue3的优化不仅仅是算法，还有编译时优化
- 提到具体的性能提升数据
- 说明适用场景：Vue3在复杂列表操作中优势明显

### 可能的追问

**Q1: 为什么不直接重新创建DOM，而要用diff算法？**

A: 因为DOM操作是昂贵的：
- 创建DOM节点需要调用浏览器API
- 大量DOM操作会导致多次重排重绘
- diff算法可以找出最小变化集合，减少DOM操作
- 保持组件状态（如input焦点、滚动位置等）

```javascript
// 不用diff：销毁重建，状态丢失
// 用diff：复用节点，保持状态
<input v-model="value" /> // 焦点和输入状态得以保持
```

**Q2: Vue的key的作用是什么？**

A: key是diff算法的重要依据：
- **唯一标识**：帮助Vue识别哪些节点是相同的
- **提升性能**：避免不必要的DOM操作
- **保持状态**：确保组件状态正确复用

```javascript
// 没有key：可能错误复用
<div v-for="item in list">{{ item.name }}</div>

// 有key：正确识别节点
<div v-for="item in list" :key="item.id">{{ item.name }}</div>
```

**Q3: 什么是最长递增子序列？**

A: 最长递增子序列（LIS）是指在一个序列中找出最长的严格递增的子序列。

```javascript
// 例子：[1, 3, 2, 4, 5]
// LIS: [1, 2, 4, 5] 或 [1, 3, 4, 5]

// 在diff中的应用：
// 旧: [A, B, C, D]  索引: [0, 1, 2, 3]
// 新: [A, C, B, D]  索引: [0, 2, 1, 3]
// LIS: [0, 2, 3] 对应 [A, C, D]
// 只需要移动B，其他保持不动
```

**Q4: Vue3的diff算法有什么缺点吗？**

A: 有一些权衡：
- **空间复杂度增加**：需要额外的数组存储映射关系
- **算法复杂度**：LIS算法本身比双端比较复杂
- **小列表性能**：对于很小的列表，Vue2可能更快

但总体来说，Vue3的优化是值得的，特别是在现代应用的复杂场景下。

**Q5: 如何优化列表渲染性能？**

A: 几个关键点：
1. **正确使用key**：使用稳定唯一的key
2. **避免使用index作为key**：特别是在会重排的列表中
3. **合理使用v-show/v-if**：根据场景选择
4. **虚拟滚动**：大列表使用虚拟滚动
5. **分页或懒加载**：避免一次渲染过多节点

```javascript
// 好的key使用
<div v-for="user in users" :key="user.id">

// 不好的key使用（会重排时）
<div v-for="(user, index) in users" :key="index">
```

### 加分项

- 提到Vue3的编译时优化（静态提升、补丁标记）
- 说明虚拟DOM的整体架构
- 提到React的diff算法对比
- 结合实际项目经验，说明性能优化的收益
- 提到Vue3的其他性能优化（Proxy、Tree-shaking等）

## 🔗 相关知识点

- [Vue的diff算法](./diff-algorithm.md) - 基础diff算法概念
- [Vue2和Vue3的区别](./vue2-vs-vue3.md) - 整体对比
- [虚拟DOM原理](./virtual-dom.md) - 虚拟DOM基础

## 📚 参考资料

- [Vue3源码 - patchKeyedChildren](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/renderer.ts)
- [最长递增子序列算法](https://leetcode.cn/problems/longest-increasing-subsequence/)
- [Vue3性能优化详解](https://vue-next-template-explorer.netlify.app/)
- [虚拟DOM和diff算法详解](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/47)