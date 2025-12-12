---
title: 数组去重
date: 2025-11-20
category: JavaScript
difficulty: 基础
tags: [数组, 去重, Set, ES6, 算法]
related: [object-array-dedup.md]
hasCode: true
codeFile: ../../code-examples/array-dedup.js
---

# 题目

请实现数组去重，并说明多种实现方式及其优缺点。

## 🎯 一句话回答（快速版）

最简单的方式是用ES6的Set：`[...new Set(arr)]`，一行代码搞定，时间复杂度O(n)，还能正确处理NaN。

## 📣 口语化回答（推荐）

数组去重最推荐的方式是用ES6的Set，一行代码就能搞定：`[...new Set(arr)]`。

Set的优势很明显：首先代码简洁，其次性能好，时间复杂度是O(n)，因为Set内部用哈希表实现，查找是O(1)。另外Set还能正确处理NaN，因为它用的是SameValueZero算法。

传统方案有filter配合indexOf，但有两个问题：一是时间复杂度是O(n²)，数据量大时性能差；二是indexOf无法识别NaN，因为NaN !== NaN。

如果需要处理NaN但不能用Set，可以用includes代替indexOf，因为includes能正确识别NaN。

还有一点要注意，所有这些方法都不能去重对象，因为对象是按引用比较的。如果需要对象数组去重，得用Map按某个属性去重，或者用JSON.stringify做深度比较。

实际项目中，简单数组用Set就够了，对象数组可以用lodash的uniqBy。

## 📝 标准答案

### 核心要点

常见的数组去重方法：

1. **ES6 Set**：最简洁的方案，推荐使用
2. **filter + indexOf**：传统方案，兼容性好
3. **reduce**：函数式编程风格
4. **双层循环**：最基础的实现
5. **Map**：利用Map的key唯一性
6. **Object键值对**：利用对象属性名唯一性

### 详细说明

#### 方案对比表

| 方案 | 时间复杂度 | 空间复杂度 | NaN处理 | 对象去重 | 推荐度 |
|------|-----------|-----------|---------|---------|--------|
| Set | O(n) | O(n) | ✅ 正确 | ❌ 引用 | ⭐⭐⭐⭐⭐ |
| filter+indexOf | O(n²) | O(n) | ❌ 错误 | ❌ 引用 | ⭐⭐⭐ |
| reduce | O(n²) | O(n) | ❌ 错误 | ❌ 引用 | ⭐⭐⭐ |
| 双层循环 | O(n²) | O(1) | ✅ 正确 | ❌ 引用 | ⭐⭐ |
| Map | O(n) | O(n) | ✅ 正确 | ❌ 引用 | ⭐⭐⭐⭐ |
| Object | O(n) | O(n) | ⚠️ 转字符串 | ⚠️ 转字符串 | ⭐⭐ |

## 🧠 深度理解

### 底层原理

#### 1. Set的实现原理

Set内部使用哈希表存储值，查找时间复杂度为O(1)：

```javascript
// Set的特点
const set = new Set([1, 2, 2, 3]);
console.log(set); // Set(3) {1, 2, 3}

// Set对NaN的处理
const set2 = new Set([NaN, NaN]);
console.log(set2.size); // 1，NaN被认为是相同的

// Set对对象的处理
const obj = {a: 1};
const set3 = new Set([obj, obj, {a: 1}]);
console.log(set3.size); // 2，对象按引用比较
```

#### 2. indexOf的局限性

```javascript
// indexOf无法正确处理NaN
[NaN, NaN].indexOf(NaN); // -1
// 因为 NaN !== NaN

// 导致去重失败
[1, NaN, 2, NaN].filter((item, index, arr) => {
  return arr.indexOf(item) === index;
});
// 结果: [1, NaN, 2, NaN]，NaN没有被去重
```

#### 3. 对象去重的问题

```javascript
// 所有方法都无法去重对象（按值比较）
const arr = [{a: 1}, {a: 1}];

// Set去重
[...new Set(arr)]; // [{a: 1}, {a: 1}]，因为是不同的引用

// 如果是同一个引用，可以去重
const obj = {a: 1};
[...new Set([obj, obj])]; // [{a: 1}]
```

### 常见误区

- **误区1**：认为所有去重方法都能正确处理NaN
  - 正解：只有Set、Map、双层循环（使用Object.is）能正确处理
  
- **误区2**：认为去重可以处理对象（按值比较）
  - 正解：基本去重方法都是按引用比较，需要特殊处理
  
- **误区3**：认为indexOf和includes效果一样
  - 正解：includes可以识别NaN，indexOf不能
  
- **误区4**：使用Object键值对时忽略类型转换
  - 正解：对象的键会被转为字符串，导致1和"1"被认为相同

### 进阶知识

#### 使用includes代替indexOf

```javascript
// includes可以正确识别NaN
[NaN, NaN].includes(NaN); // true

// 用includes实现去重
function unique(arr) {
  const result = [];
  arr.forEach(item => {
    if (!result.includes(item)) {
      result.push(item);
    }
  });
  return result;
}

unique([1, NaN, 2, NaN]); // [1, NaN, 2]
```

#### 对象数组去重

```javascript
// 基于某个属性去重
function uniqueBy(arr, key) {
  const seen = new Map();
  return arr.filter(item => {
    const k = item[key];
    if (seen.has(k)) {
      return false;
    }
    seen.set(k, true);
    return true;
  });
}

const users = [
  {id: 1, name: 'Alice'},
  {id: 2, name: 'Bob'},
  {id: 1, name: 'Alice'}
];
uniqueBy(users, 'id'); // [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}]
```

#### 深度去重（按值比较对象）

```javascript
function deepUnique(arr) {
  const seen = [];
  return arr.filter(item => {
    const exists = seen.some(seenItem => 
      JSON.stringify(seenItem) === JSON.stringify(item)
    );
    if (!exists) {
      seen.push(item);
    }
    return !exists;
  });
}

deepUnique([{a: 1}, {a: 1}, {a: 2}]); 
// [{a: 1}, {a: 2}]
```


## 💡 面试回答技巧

### 推荐回答顺序

1. **先写Set方案**：这是最简洁的现代方案，一行代码搞定
2. **解释Set的原理**：说明Set如何保证唯一性
3. **补充传统方案**：filter+indexOf、双层循环等，展示知识广度
4. **说明各方案优缺点**：时间复杂度、NaN处理、兼容性等
5. **提到特殊情况**：NaN、对象去重等边界情况

### 重点强调

- 强调Set方案的优势：代码简洁、性能好（O(n)）、正确处理NaN
- 说明indexOf的局限性：无法识别NaN
- 提到实际项目中的应用场景
- 说明对象去重需要特殊处理

### 可能的追问

**Q1: 为什么indexOf无法识别NaN？**

A: 因为NaN的特殊性：`NaN !== NaN`。

```javascript
NaN === NaN; // false
NaN == NaN;  // false

// indexOf内部使用严格相等（===）比较
[NaN].indexOf(NaN); // -1

// includes使用SameValueZero算法，可以识别NaN
[NaN].includes(NaN); // true

// Object.is也可以识别
Object.is(NaN, NaN); // true
```

**解决方案：**
- 使用Set（推荐）
- 使用includes代替indexOf
- 使用Object.is进行比较

**Q2: Set和Array的区别是什么？**

A: 主要区别：

| 特性 | Set | Array |
|------|-----|-------|
| 元素唯一性 | ✅ 自动去重 | ❌ 可重复 |
| 有序性 | ✅ 插入顺序 | ✅ 索引顺序 |
| 访问方式 | 迭代器 | 索引 |
| 查找性能 | O(1) | O(n) |
| 适用场景 | 去重、存在性检查 | 有序列表、随机访问 |

```javascript
// Set的特点
const set = new Set([1, 2, 3]);
set.has(2); // O(1) 时间复杂度
set.add(4);
set.delete(1);
set.size; // 3

// 转换
const arr = [...set]; // Set转Array
const set2 = new Set(arr); // Array转Set
```

**Q3: 如何实现对象数组的去重？**

A: 需要指定去重的依据（按哪个属性）：

```javascript
// 方法1: 使用Map（推荐）
function uniqueBy(arr, key) {
  const map = new Map();
  return arr.filter(item => {
    const k = item[key];
    if (map.has(k)) {
      return false;
    }
    map.set(k, true);
    return true;
  });
}

// 方法2: 使用reduce
function uniqueBy(arr, key) {
  return arr.reduce((acc, item) => {
    if (!acc.find(x => x[key] === item[key])) {
      acc.push(item);
    }
    return acc;
  }, []);
}

// 方法3: 深度比较（按值去重）
function deepUnique(arr) {
  return arr.filter((item, index, self) => {
    return index === self.findIndex(t => 
      JSON.stringify(t) === JSON.stringify(item)
    );
  });
}

// 使用示例
const users = [
  {id: 1, name: 'Alice'},
  {id: 2, name: 'Bob'},
  {id: 1, name: 'Charlie'}
];
uniqueBy(users, 'id'); 
// [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}]
```

**Q4: 时间复杂度和空间复杂度如何分析？**

A: 

**Set方案：**
- 时间复杂度：O(n)，遍历一次数组
- 空间复杂度：O(n)，需要额外的Set存储

**filter + indexOf方案：**
- 时间复杂度：O(n²)，filter遍历n次，每次indexOf也是O(n)
- 空间复杂度：O(n)，结果数组

**双层循环方案：**
- 时间复杂度：O(n²)，两层循环
- 空间复杂度：O(1)，原地修改（如果splice）或O(n)（如果新建数组）

```javascript
// 性能测试
const arr = Array.from({length: 10000}, (_, i) => i % 1000);

console.time('Set');
[...new Set(arr)];
console.timeEnd('Set'); // 约1ms

console.time('filter+indexOf');
arr.filter((item, index) => arr.indexOf(item) === index);
console.timeEnd('filter+indexOf'); // 约100ms

// Set性能明显更好
```

**Q5: 如何处理包含NaN的数组去重？**

A: 推荐使用Set或includes：

```javascript
const arr = [1, NaN, 2, NaN, 3];

// 方法1: Set（推荐）
[...new Set(arr)]; // [1, NaN, 2, 3]

// 方法2: includes
function unique(arr) {
  const result = [];
  arr.forEach(item => {
    if (!result.includes(item)) {
      result.push(item);
    }
  });
  return result;
}

// 方法3: Object.is
function unique(arr) {
  return arr.filter((item, index) => {
    return arr.findIndex(x => Object.is(x, item)) === index;
  });
}

// 错误示例: indexOf
arr.filter((item, index) => arr.indexOf(item) === index);
// [1, NaN, 2, NaN, 3]，NaN没有被去重
```

**Q6: 在实际项目中如何选择去重方案？**

A: 根据具体场景选择：

**1. 简单数组去重（推荐）：**
```javascript
const unique = arr => [...new Set(arr)];
```

**2. 需要兼容老浏览器：**
```javascript
function unique(arr) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}
```

**3. 对象数组去重：**
```javascript
// 使用lodash
import { uniqBy } from 'lodash';
uniqBy(users, 'id');

// 或自己实现
const uniqueBy = (arr, key) => {
  const map = new Map();
  return arr.filter(item => !map.has(item[key]) && map.set(item[key], true));
};
```

**4. 需要保持原数组不变：**
```javascript
const unique = arr => [...new Set(arr)]; // 返回新数组
```

**5. 性能要求高、数据量大：**
```javascript
// 使用Set，时间复杂度O(n)
const unique = arr => [...new Set(arr)];
```

### 加分项

- 提到Set的底层实现（哈希表）
- 说明SameValueZero算法（Set和includes使用）
- 提到lodash的uniqBy方法
- 结合实际项目经验，如API返回数据去重
- 提到性能优化：大数据量时使用Set而非indexOf

## 💻 代码示例

### 方法一：ES6 Set（推荐）

```javascript
function uniqueBySet(arr) {
  return [...new Set(arr)];
  // 或者: return Array.from(new Set(arr));
}

// 使用
const arr = [1, 2, 2, 3, 4, 4, 5];
console.log(uniqueBySet(arr)); // [1, 2, 3, 4, 5]
```

### 方法二：filter + indexOf

```javascript
function uniqueByIndexOf(arr) {
  return arr.filter((item, index) => {
    return arr.indexOf(item) === index;
  });
}

// 注意：无法正确处理 NaN
const arr = [1, NaN, 2, NaN, 3];
console.log(uniqueByIndexOf(arr)); // [1, NaN, 2, NaN, 3] ❌
```

### 方法三：Map

```javascript
function uniqueByMap(arr) {
  const map = new Map();
  const result = [];
  
  arr.forEach(item => {
    if (!map.has(item)) {
      map.set(item, true);
      result.push(item);
    }
  });
  
  return result;
}
```

### 方法四：includes（处理 NaN）

```javascript
function uniqueByIncludes(arr) {
  const result = [];
  
  arr.forEach(item => {
    if (!result.includes(item)) {
      result.push(item);
    }
  });
  
  return result;
}

// 可以正确处理 NaN
const arr = [1, NaN, 2, NaN, 3];
console.log(uniqueByIncludes(arr)); // [1, NaN, 2, 3] ✅
```

### 完整代码示例

查看完整代码（包含所有方法和测试用例）：[array-dedup.js](../../code-examples/array-dedup.js)

## 🔗 相关知识点

- [对象数组去重](./object-array-dedup.md) - 更复杂的去重场景
- [闭包](./closure.md) - 去重函数可能涉及闭包
- [事件循环](./event-loop.md) - 理解JavaScript执行机制

## 📚 参考资料

- [MDN - Set](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN - Array.prototype.filter](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
- [MDN - Array.prototype.includes](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)
- [JavaScript数组去重的多种方法](https://segmentfault.com/a/1190000016418021)
