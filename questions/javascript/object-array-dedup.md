---
title: 对象数组去重
date: 2025-11-20
category: JavaScript
difficulty: 中级
tags: [数组, 对象, 去重, Map, 算法]
related: [array-dedup.md]
hasCode: true
codeFile: ../../code-examples/object-array-dedup.js
---

# 题目

如何实现对象数组的去重？请说明多种实现方式及其适用场景。

## 🎯 一句话回答（快速版）

对象数组去重需要明确去重依据，最常用的是用Map按某个属性去重，时间复杂度O(n)，或者直接用lodash的uniqBy。

## 📣 口语化回答（推荐）

对象数组去重跟普通数组不一样，不能直接用Set，因为Set是按引用比较的，内容相同但引用不同的对象不会被去重。

所以首先要明确去重依据。最常见的是按某个属性去重，比如按id。这种情况推荐用Map来实现，遍历数组时把属性值作为key存到Map里，已存在就跳过，不存在就保留。这样时间复杂度是O(n)，性能很好。

如果需要按多个属性去重，可以把多个属性值拼接成一个key，比如`id|type`这样。

如果需要深度比较，就是对象内容完全相同才算重复，可以用JSON.stringify，但要注意它有局限性：属性顺序不同会被认为不同，而且无法处理undefined、function这些特殊值。

实际项目中，简单场景自己写个Map去重就行，复杂场景推荐用lodash的uniqBy或uniqWith，代码更简洁也更可靠。

还有一点，默认是保留第一个出现的对象，如果需要保留最新的，就从后往前遍历。

## 📝 标准答案

### 核心要点

对象数组去重的关键是**确定去重依据**：

1. **按引用去重**：相同引用的对象才算重复（简单但不常用）
2. **按属性去重**：根据某个或某些属性判断重复（最常用）
3. **按值去重**：对象内容完全相同才算重复（深度比较）

### 详细说明

#### 三种去重方式对比

```javascript
const users = [
  {id: 1, name: 'Alice'},
  {id: 2, name: 'Bob'},
  {id: 1, name: 'Charlie'}, // id重复
  {id: 1, name: 'Alice'}    // 完全重复
];

// 1. 按引用去重（Set）
[...new Set(users)]; 
// 结果: 4个对象，因为都是不同的引用

// 2. 按id属性去重
uniqueBy(users, 'id');
// 结果: [{id:1, name:'Alice'}, {id:2, name:'Bob'}]

// 3. 按值去重（深度比较）
deepUnique(users);
// 结果: [{id:1, name:'Alice'}, {id:2, name:'Bob'}, {id:1, name:'Charlie'}]
```

#### 方案对比表

| 方案 | 时间复杂度 | 适用场景 | 推荐度 |
|------|-----------|---------|--------|
| Map按属性 | O(n) | 按单个属性去重 | ⭐⭐⭐⭐⭐ |
| reduce按属性 | O(n²) | 按单个属性去重 | ⭐⭐⭐ |
| filter+findIndex | O(n²) | 按单个属性去重 | ⭐⭐⭐ |
| JSON.stringify | O(n²) | 按值深度去重 | ⭐⭐ |
| 多属性组合 | O(n) | 按多个属性去重 | ⭐⭐⭐⭐ |
| lodash uniqBy | O(n) | 生产环境 | ⭐⭐⭐⭐⭐ |

## 🧠 深度理解

### 底层原理

#### 1. 为什么Set不能去重对象？

```javascript
const obj1 = {a: 1};
const obj2 = {a: 1};

obj1 === obj2; // false，不同的引用

// Set按引用比较
const set = new Set([obj1, obj2, obj1]);
console.log(set.size); // 2，obj1去重了，但obj1和obj2不同

// 只有相同引用才能去重
const set2 = new Set([obj1, obj1]);
console.log(set2.size); // 1
```

#### 2. Map的优势

Map可以用任何值作为key，包括对象：

```javascript
// 使用Map存储已见过的属性值
function uniqueBy(arr, key) {
  const map = new Map();
  return arr.filter(item => {
    const value = item[key];
    if (map.has(value)) {
      return false; // 已存在，过滤掉
    }
    map.set(value, true);
    return true; // 首次出现，保留
  });
}

// Map的查找是O(1)，比indexOf的O(n)快
```

#### 3. 深度比较的问题

```javascript
// JSON.stringify的局限性
const obj1 = {a: 1, b: 2};
const obj2 = {b: 2, a: 1}; // 属性顺序不同

JSON.stringify(obj1); // '{"a":1,"b":2}'
JSON.stringify(obj2); // '{"b":2,"a":1}'
// 结果不同，但对象实际相同

// 无法处理的情况
JSON.stringify({a: undefined}); // '{}'
JSON.stringify({a: function() {}}); // '{}'
JSON.stringify({a: Symbol('x')}); // '{}'
```

### 常见误区

- **误区1**：认为Set可以去重对象数组
  - 正解：Set只能按引用去重，内容相同但引用不同的对象不会去重
  
- **误区2**：使用JSON.stringify进行深度比较
  - 正解：JSON.stringify有很多局限性（属性顺序、特殊值等）
  
- **误区3**：忽略去重后保留哪个对象
  - 正解：通常保留第一个出现的对象，但有时需要保留最新的
  
- **误区4**：对大数据量使用O(n²)算法
  - 正解：应该使用Map等O(n)算法

### 进阶知识

#### 多属性组合去重

```javascript
// 按多个属性去重
function uniqueByKeys(arr, keys) {
  const map = new Map();
  return arr.filter(item => {
    // 生成组合key
    const key = keys.map(k => item[k]).join('|');
    if (map.has(key)) {
      return false;
    }
    map.set(key, true);
    return true;
  });
}

const data = [
  {id: 1, type: 'A'},
  {id: 1, type: 'B'},
  {id: 1, type: 'A'}, // 重复
  {id: 2, type: 'A'}
];

uniqueByKeys(data, ['id', 'type']);
// [{id:1, type:'A'}, {id:1, type:'B'}, {id:2, type:'A'}]
```

#### 保留最后一个而非第一个

```javascript
function uniqueByLast(arr, key) {
  const map = new Map();
  // 从后往前遍历
  for (let i = arr.length - 1; i >= 0; i--) {
    const value = arr[i][key];
    if (!map.has(value)) {
      map.set(value, arr[i]);
    }
  }
  // 返回时保持原顺序
  return arr.filter(item => map.get(item[key]) === item);
}

const users = [
  {id: 1, name: 'Alice', age: 20},
  {id: 2, name: 'Bob', age: 25},
  {id: 1, name: 'Alice', age: 21} // 更新的数据
];

uniqueByLast(users, 'id');
// [{id: 2, name: 'Bob', age: 25}, {id: 1, name: 'Alice', age: 21}]
```

#### 自定义比较函数

```javascript
function uniqueByComparator(arr, comparator) {
  return arr.filter((item, index, self) => {
    return index === self.findIndex(t => comparator(t, item));
  });
}

// 使用示例：忽略大小写去重
const names = [
  {name: 'Alice'},
  {name: 'alice'},
  {name: 'Bob'}
];

uniqueByComparator(names, (a, b) => 
  a.name.toLowerCase() === b.name.toLowerCase()
);
// [{name: 'Alice'}, {name: 'Bob'}]
```


## 💡 面试回答技巧

### 推荐回答顺序

1. **先明确去重依据**：问清楚是按哪个属性去重，还是深度比较
2. **写Map方案**：这是性能最好的方案（O(n)）
3. **解释实现原理**：说明如何用Map存储已见过的值
4. **补充其他方案**：reduce、filter等，展示知识广度
5. **说明特殊情况**：多属性去重、保留最后一个等

### 重点强调

- 强调对象数组去重必须明确去重依据
- 说明Set不能直接用于对象数组去重（按引用比较）
- 提到Map方案的性能优势（O(n) vs O(n²)）
- 说明实际项目中通常使用lodash的uniqBy

### 可能的追问

**Q1: 为什么不能直接用Set去重对象数组？**

A: 因为Set使用SameValueZero算法比较值，对于对象来说是按引用比较的：

```javascript
const obj1 = {id: 1};
const obj2 = {id: 1};

// 虽然内容相同，但引用不同
obj1 === obj2; // false

// Set无法去重
const arr = [obj1, obj2, obj1];
[...new Set(arr)]; // [obj1, obj2]，只去掉了重复的obj1引用

// 只有完全相同的引用才能去重
const arr2 = [obj1, obj1];
[...new Set(arr2)]; // [obj1]
```

**解决方案：** 需要自己实现按属性或按值的去重逻辑。

**Q2: Map和Object作为存储有什么区别？**

A: 主要区别：

| 特性 | Map | Object |
|------|-----|--------|
| key类型 | 任意类型 | 字符串或Symbol |
| key顺序 | 插入顺序 | 不保证（数字key会排序） |
| 性能 | 频繁增删更快 | 适合固定结构 |
| 大小 | size属性 | 需要Object.keys().length |
| 迭代 | 直接迭代 | 需要Object.keys() |

```javascript
// Map可以用任何类型作为key
const map = new Map();
map.set(1, 'number');
map.set('1', 'string');
map.set(true, 'boolean');
console.log(map.size); // 3

// Object的key会被转为字符串
const obj = {};
obj[1] = 'number';
obj['1'] = 'string'; // 覆盖了上面的
console.log(Object.keys(obj).length); // 1
```

**对象数组去重时：** Map更合适，因为key可能是数字、字符串等多种类型。

**Q3: 如何实现深度去重（按值比较）？**

A: 有几种方法，但都有局限性：

```javascript
// 方法1: JSON.stringify（简单但有局限）
function deepUnique(arr) {
  const seen = new Set();
  return arr.filter(item => {
    const str = JSON.stringify(item);
    if (seen.has(str)) {
      return false;
    }
    seen.add(str);
    return true;
  });
}

// 局限性：
// 1. 属性顺序影响结果
// 2. 无法处理undefined、function、Symbol
// 3. 无法处理循环引用

// 方法2: 自己实现深度比较
function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  if (obj1 === null || obj2 === null) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every(key => deepEqual(obj1[key], obj2[key]));
}

function deepUniqueByEqual(arr) {
  return arr.filter((item, index, self) => {
    return index === self.findIndex(t => deepEqual(t, item));
  });
}

// 方法3: 使用lodash（推荐）
import { isEqual, uniqWith } from 'lodash';
const result = uniqWith(arr, isEqual);
```

**Q4: 如何按多个属性去重？**

A: 生成组合key：

```javascript
// 方法1: 字符串拼接
function uniqueByKeys(arr, keys) {
  const map = new Map();
  return arr.filter(item => {
    const key = keys.map(k => item[k]).join('|');
    if (map.has(key)) return false;
    map.set(key, true);
    return true;
  });
}

// 方法2: 数组作为key（需要转字符串）
function uniqueByKeys(arr, keys) {
  const seen = new Set();
  return arr.filter(item => {
    const key = JSON.stringify(keys.map(k => item[k]));
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// 使用示例
const data = [
  {id: 1, type: 'A', value: 100},
  {id: 1, type: 'B', value: 200},
  {id: 1, type: 'A', value: 150}, // id+type重复
  {id: 2, type: 'A', value: 300}
];

uniqueByKeys(data, ['id', 'type']);
// 保留前3个，过滤掉第3个
```

**Q5: 实际项目中如何选择去重方案？**

A: 根据具体场景：

**1. 简单场景（按单个属性）：**
```javascript
// 自己实现
const uniqueBy = (arr, key) => {
  const map = new Map();
  return arr.filter(item => !map.has(item[key]) && map.set(item[key], true));
};

// 或使用lodash
import { uniqBy } from 'lodash';
uniqBy(users, 'id');
```

**2. 复杂场景（多属性、自定义逻辑）：**
```javascript
import { uniqWith } from 'lodash';

// 自定义比较逻辑
uniqWith(users, (a, b) => 
  a.id === b.id && a.type === b.type
);
```

**3. 性能要求高：**
```javascript
// 使用Map，时间复杂度O(n)
const uniqueBy = (arr, key) => {
  const map = new Map();
  return arr.filter(item => !map.has(item[key]) && map.set(item[key], true));
};
```

**4. 需要保留最新数据：**
```javascript
// 从后往前遍历
function uniqueByLast(arr, key) {
  const map = new Map();
  for (let i = arr.length - 1; i >= 0; i--) {
    const value = arr[i][key];
    if (!map.has(value)) {
      map.set(value, arr[i]);
    }
  }
  return Array.from(map.values()).reverse();
}
```

**Q6: lodash的uniqBy是如何实现的？**

A: 简化版实现：

```javascript
function uniqBy(arr, iteratee) {
  const seen = new Set();
  const result = [];
  
  // iteratee可以是函数或属性名
  const getter = typeof iteratee === 'function' 
    ? iteratee 
    : item => item[iteratee];
  
  arr.forEach(item => {
    const key = getter(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  });
  
  return result;
}

// 使用示例
uniqBy(users, 'id'); // 按属性
uniqBy(users, user => user.id); // 按函数
uniqBy(users, user => user.name.toLowerCase()); // 自定义逻辑
```

### 加分项

- 提到lodash的uniqBy、uniqWith等工具函数
- 说明时间复杂度和空间复杂度的权衡
- 结合实际项目经验，如API数据去重、列表合并等
- 提到性能优化：大数据量时使用Map而非findIndex
- 说明边界情况：空数组、null值、undefined等

## 💻 代码示例

参考代码: [object-array-dedup.js](../../code-examples/object-array-dedup.js)

代码示例包含以下实现方式：
1. Map按属性去重（推荐）
2. reduce按属性去重
3. filter + findIndex
4. JSON.stringify深度去重
5. 多属性组合去重
6. 保留最后一个
7. 自定义比较函数
8. lodash风格实现

## 🔗 相关知识点

- [数组去重](./array-dedup.md) - 基础的数组去重
- [闭包](./closure.md) - 去重函数可能涉及闭包
- [事件循环](./event-loop.md) - 理解JavaScript执行机制

## 📚 参考资料

- [MDN - Map](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [MDN - Set](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [Lodash - uniqBy](https://lodash.com/docs/#uniqBy)
- [Lodash - uniqWith](https://lodash.com/docs/#uniqWith)
