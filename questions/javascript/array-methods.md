---
title: 数组的常见方法
date: 2025-11-25
category: JavaScript
difficulty: 基础
tags: [数组, Array, ES6, 方法]
related: [array-dedup.md, object-array-dedup.md]
hasCode: true
---

# 题目

请详细说明JavaScript中数组的常见方法，包括它们的用法、返回值和是否会改变原数组？

## 📝 标准答案

### 核心要点

1. **改变原数组的方法**：push、pop、shift、unshift、splice、sort、reverse、fill
2. **不改变原数组的方法**：concat、slice、map、filter、forEach、reduce、find、some、every、includes
3. **ES6新增方法**：find、findIndex、includes、flat、flatMap、from、of
4. **返回值类型**：有的返回新数组，有的返回单个值，有的返回布尔值

### 详细说明

#### 一、改变原数组的方法（8个）

**1. push() - 末尾添加元素**
```javascript
const arr = [1, 2, 3];
const length = arr.push(4, 5);
console.log(arr);    // [1, 2, 3, 4, 5]
console.log(length); // 5（返回新长度）
```

**2. pop() - 删除末尾元素**
```javascript
const arr = [1, 2, 3];
const last = arr.pop();
console.log(arr);  // [1, 2]
console.log(last); // 3（返回被删除的元素）
```

**3. unshift() - 开头添加元素**
```javascript
const arr = [1, 2, 3];
const length = arr.unshift(0);
console.log(arr);    // [0, 1, 2, 3]
console.log(length); // 4（返回新长度）
```

**4. shift() - 删除开头元素**
```javascript
const arr = [1, 2, 3];
const first = arr.shift();
console.log(arr);   // [2, 3]
console.log(first); // 1（返回被删除的元素）
```

**5. splice() - 删除/插入/替换元素**
```javascript
const arr = [1, 2, 3, 4, 5];

// 删除：splice(起始位置, 删除个数)
arr.splice(1, 2); // 从索引1开始删除2个
console.log(arr); // [1, 4, 5]

// 插入：splice(起始位置, 0, 新元素...)
arr.splice(1, 0, 2, 3);
console.log(arr); // [1, 2, 3, 4, 5]

// 替换：splice(起始位置, 删除个数, 新元素...)
arr.splice(1, 2, 'a', 'b');
console.log(arr); // [1, 'a', 'b', 4, 5]
```

**6. sort() - 排序**
```javascript
const arr = [3, 1, 4, 1, 5];
arr.sort();
console.log(arr); // [1, 1, 3, 4, 5]

// 自定义排序
const nums = [10, 5, 40, 25];
nums.sort((a, b) => a - b); // 升序
console.log(nums); // [5, 10, 25, 40]

nums.sort((a, b) => b - a); // 降序
console.log(nums); // [40, 25, 10, 5]
```

**7. reverse() - 反转数组**
```javascript
const arr = [1, 2, 3, 4, 5];
arr.reverse();
console.log(arr); // [5, 4, 3, 2, 1]
```

**8. fill() - 填充数组**
```javascript
const arr = [1, 2, 3, 4, 5];
arr.fill(0);
console.log(arr); // [0, 0, 0, 0, 0]

// fill(值, 起始位置, 结束位置)
const arr2 = [1, 2, 3, 4, 5];
arr2.fill(0, 2, 4);
console.log(arr2); // [1, 2, 0, 0, 5]
```

#### 二、不改变原数组的方法（重要）

**1. concat() - 合并数组**
```javascript
const arr1 = [1, 2];
const arr2 = [3, 4];
const arr3 = arr1.concat(arr2);
console.log(arr3); // [1, 2, 3, 4]
console.log(arr1); // [1, 2]（原数组不变）

// 也可以用展开运算符
const arr4 = [...arr1, ...arr2];
```

**2. slice() - 截取数组**
```javascript
const arr = [1, 2, 3, 4, 5];
const sliced = arr.slice(1, 3); // [起始, 结束)
console.log(sliced); // [2, 3]
console.log(arr);    // [1, 2, 3, 4, 5]（原数组不变）

// 复制数组
const copy = arr.slice();
```

**3. map() - 映射数组**
```javascript
const arr = [1, 2, 3];
const doubled = arr.map(x => x * 2);
console.log(doubled); // [2, 4, 6]
console.log(arr);     // [1, 2, 3]（原数组不变）

// 带索引
const indexed = arr.map((item, index) => `${index}: ${item}`);
console.log(indexed); // ['0: 1', '1: 2', '2: 3']
```

**4. filter() - 过滤数组**
```javascript
const arr = [1, 2, 3, 4, 5];
const even = arr.filter(x => x % 2 === 0);
console.log(even); // [2, 4]
console.log(arr);  // [1, 2, 3, 4, 5]（原数组不变）
```

**5. forEach() - 遍历数组**
```javascript
const arr = [1, 2, 3];
arr.forEach((item, index) => {
  console.log(`${index}: ${item}`);
});
// 0: 1
// 1: 2
// 2: 3

// 注意：forEach无法break，要中断用for循环
```

**6. reduce() - 归并数组**
```javascript
const arr = [1, 2, 3, 4, 5];

// 求和
const sum = arr.reduce((acc, cur) => acc + cur, 0);
console.log(sum); // 15

// 求最大值
const max = arr.reduce((acc, cur) => Math.max(acc, cur));
console.log(max); // 5

// 数组去重
const arr2 = [1, 2, 2, 3, 3, 4];
const unique = arr2.reduce((acc, cur) => {
  if (!acc.includes(cur)) acc.push(cur);
  return acc;
}, []);
console.log(unique); // [1, 2, 3, 4]

// 对象数组分组
const users = [
  { name: '张三', age: 20 },
  { name: '李四', age: 20 },
  { name: '王五', age: 30 }
];
const grouped = users.reduce((acc, user) => {
  const key = user.age;
  if (!acc[key]) acc[key] = [];
  acc[key].push(user);
  return acc;
}, {});
console.log(grouped);
// {
//   20: [{ name: '张三', age: 20 }, { name: '李四', age: 20 }],
//   30: [{ name: '王五', age: 30 }]
// }
```

**7. find() - 查找第一个符合条件的元素**
```javascript
const arr = [1, 2, 3, 4, 5];
const found = arr.find(x => x > 3);
console.log(found); // 4（返回第一个符合条件的元素）

const notFound = arr.find(x => x > 10);
console.log(notFound); // undefined
```

**8. findIndex() - 查找第一个符合条件的索引**
```javascript
const arr = [1, 2, 3, 4, 5];
const index = arr.findIndex(x => x > 3);
console.log(index); // 3

const notFound = arr.findIndex(x => x > 10);
console.log(notFound); // -1
```

**9. some() - 是否有元素符合条件**
```javascript
const arr = [1, 2, 3, 4, 5];
const hasEven = arr.some(x => x % 2 === 0);
console.log(hasEven); // true

const hasNegative = arr.some(x => x < 0);
console.log(hasNegative); // false
```

**10. every() - 是否所有元素都符合条件**
```javascript
const arr = [2, 4, 6, 8];
const allEven = arr.every(x => x % 2 === 0);
console.log(allEven); // true

const arr2 = [2, 4, 5, 8];
const allEven2 = arr2.every(x => x % 2 === 0);
console.log(allEven2); // false
```

**11. includes() - 是否包含某个元素**
```javascript
const arr = [1, 2, 3, 4, 5];
console.log(arr.includes(3));  // true
console.log(arr.includes(10)); // false

// 从指定位置开始查找
console.log(arr.includes(3, 3)); // false（从索引3开始找）
```

**12. indexOf() / lastIndexOf() - 查找元素索引**
```javascript
const arr = [1, 2, 3, 2, 1];
console.log(arr.indexOf(2));     // 1（第一个2的索引）
console.log(arr.lastIndexOf(2)); // 3（最后一个2的索引）
console.log(arr.indexOf(10));    // -1（不存在）
```

**13. join() - 数组转字符串**
```javascript
const arr = [1, 2, 3];
console.log(arr.join());     // '1,2,3'
console.log(arr.join('-'));  // '1-2-3'
console.log(arr.join(''));   // '123'
```

**14. flat() - 数组扁平化**
```javascript
const arr = [1, [2, 3], [4, [5, 6]]];
console.log(arr.flat());    // [1, 2, 3, 4, [5, 6]]（默认扁平1层）
console.log(arr.flat(2));   // [1, 2, 3, 4, 5, 6]（扁平2层）
console.log(arr.flat(Infinity)); // [1, 2, 3, 4, 5, 6]（完全扁平）
```

**15. flatMap() - map + flat**
```javascript
const arr = [1, 2, 3];
const result = arr.flatMap(x => [x, x * 2]);
console.log(result); // [1, 2, 2, 4, 3, 6]

// 等价于
const result2 = arr.map(x => [x, x * 2]).flat();
```

#### 三、静态方法

**1. Array.from() - 类数组转数组**
```javascript
// 字符串转数组
console.log(Array.from('hello')); // ['h', 'e', 'l', 'l', 'o']

// Set转数组
const set = new Set([1, 2, 3]);
console.log(Array.from(set)); // [1, 2, 3]

// 带映射函数
console.log(Array.from([1, 2, 3], x => x * 2)); // [2, 4, 6]

// 生成序列
console.log(Array.from({ length: 5 }, (_, i) => i)); // [0, 1, 2, 3, 4]
```

**2. Array.of() - 创建数组**
```javascript
console.log(Array.of(1, 2, 3)); // [1, 2, 3]
console.log(Array.of(7));       // [7]

// 对比 Array 构造函数
console.log(Array(7));    // [empty × 7]（7个空位）
console.log(Array.of(7)); // [7]（包含7的数组）
```

**3. Array.isArray() - 判断是否为数组**
```javascript
console.log(Array.isArray([1, 2, 3])); // true
console.log(Array.isArray('hello'));   // false
console.log(Array.isArray({ 0: 1 }));  // false
```

## 🧠 深度理解

### 底层原理

#### 1. map、filter、reduce的实现

```javascript
// map的实现
Array.prototype.myMap = function(callback) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    result.push(callback(this[i], i, this));
  }
  return result;
};

// filter的实现
Array.prototype.myFilter = function(callback) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (callback(this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};

// reduce的实现
Array.prototype.myReduce = function(callback, initialValue) {
  let acc = initialValue !== undefined ? initialValue : this[0];
  let startIndex = initialValue !== undefined ? 0 : 1;
  
  for (let i = startIndex; i < this.length; i++) {
    acc = callback(acc, this[i], i, this);
  }
  return acc;
};
```

#### 2. 为什么sort()会改变原数组？

```javascript
// sort使用原地排序算法（in-place sorting）
const arr = [3, 1, 2];
arr.sort(); // 直接在原数组上排序，节省内存

// 如果不想改变原数组
const arr2 = [3, 1, 2];
const sorted = [...arr2].sort(); // 先复制再排序
console.log(arr2);   // [3, 1, 2]
console.log(sorted); // [1, 2, 3]
```

#### 3. forEach vs map vs for循环

```javascript
const arr = [1, 2, 3, 4, 5];

// forEach - 无返回值，不能break
arr.forEach(item => {
  if (item === 3) return; // 只是跳过当前循环
  console.log(item);
});

// map - 返回新数组
const doubled = arr.map(x => x * 2);

// for循环 - 可以break
for (let i = 0; i < arr.length; i++) {
  if (arr[i] === 3) break; // 可以中断
  console.log(arr[i]);
}

// for...of - 可以break
for (const item of arr) {
  if (item === 3) break;
  console.log(item);
}
```

**性能对比：**
- for循环最快（直接操作索引）
- forEach次之（有函数调用开销）
- map最慢（创建新数组 + 函数调用）

### 常见误区

**误区1：认为forEach可以用break中断**
```javascript
const arr = [1, 2, 3, 4, 5];
arr.forEach(item => {
  if (item === 3) break; // ❌ 语法错误
  console.log(item);
});

// 正确做法：用for循环或some
arr.some(item => {
  if (item === 3) return true; // 返回true中断
  console.log(item);
});
```

**误区2：sort()默认按数字排序**
```javascript
const arr = [10, 5, 40, 25];
arr.sort();
console.log(arr); // [10, 25, 40, 5] ❌ 错误！按字符串排序

// 正确做法：传入比较函数
arr.sort((a, b) => a - b);
console.log(arr); // [5, 10, 25, 40] ✅
```

**误区3：map中不return导致undefined**
```javascript
const arr = [1, 2, 3];
const result = arr.map(x => {
  x * 2; // ❌ 没有return
});
console.log(result); // [undefined, undefined, undefined]

// 正确做法
const result2 = arr.map(x => x * 2); // ✅
```

**误区4：slice和splice混淆**
```javascript
const arr = [1, 2, 3, 4, 5];

// slice - 不改变原数组
const sliced = arr.slice(1, 3);
console.log(arr);    // [1, 2, 3, 4, 5]
console.log(sliced); // [2, 3]

// splice - 改变原数组
const spliced = arr.splice(1, 3);
console.log(arr);     // [1, 5]
console.log(spliced); // [2, 3, 4]
```

**误区5：reduce不传初始值**
```javascript
const arr = [1, 2, 3];
const sum = arr.reduce((acc, cur) => acc + cur); // ✅ 可以
console.log(sum); // 6

const empty = [];
const sum2 = empty.reduce((acc, cur) => acc + cur); // ❌ 报错
// TypeError: Reduce of empty array with no initial value

// 正确做法：传初始值
const sum3 = empty.reduce((acc, cur) => acc + cur, 0); // ✅
console.log(sum3); // 0
```

### 进阶知识

#### 1. 链式调用

```javascript
const arr = [1, 2, 3, 4, 5, 6];

const result = arr
  .filter(x => x % 2 === 0)  // [2, 4, 6]
  .map(x => x * 2)           // [4, 8, 12]
  .reduce((acc, cur) => acc + cur, 0); // 24

console.log(result); // 24
```

#### 2. 数组去重的多种方法

```javascript
const arr = [1, 2, 2, 3, 3, 4];

// 方法1：Set
const unique1 = [...new Set(arr)];

// 方法2：filter + indexOf
const unique2 = arr.filter((item, index) => arr.indexOf(item) === index);

// 方法3：reduce
const unique3 = arr.reduce((acc, cur) => {
  if (!acc.includes(cur)) acc.push(cur);
  return acc;
}, []);

// 方法4：Map
const unique4 = [...new Map(arr.map(item => [item, item])).values()];

console.log(unique1); // [1, 2, 3, 4]
```

#### 3. 数组扁平化的多种方法

```javascript
const arr = [1, [2, 3], [4, [5, 6]]];

// 方法1：flat
const flat1 = arr.flat(Infinity);

// 方法2：递归
function flatten(arr) {
  return arr.reduce((acc, cur) => {
    return acc.concat(Array.isArray(cur) ? flatten(cur) : cur);
  }, []);
}
const flat2 = flatten(arr);

// 方法3：toString + split（仅适用于数字数组）
const flat3 = arr.toString().split(',').map(Number);

// 方法4：while + some
function flatten2(arr) {
  while (arr.some(item => Array.isArray(item))) {
    arr = [].concat(...arr);
  }
  return arr;
}
const flat4 = flatten2([...arr]);

console.log(flat1); // [1, 2, 3, 4, 5, 6]
```

#### 4. 数组分组

```javascript
const users = [
  { name: '张三', age: 20, city: '北京' },
  { name: '李四', age: 20, city: '上海' },
  { name: '王五', age: 30, city: '北京' }
];

// 按年龄分组
const groupByAge = users.reduce((acc, user) => {
  const key = user.age;
  if (!acc[key]) acc[key] = [];
  acc[key].push(user);
  return acc;
}, {});

console.log(groupByAge);
// {
//   20: [{ name: '张三', ... }, { name: '李四', ... }],
//   30: [{ name: '王五', ... }]
// }

// 通用分组函数
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {});
}

const groupByCity = groupBy(users, 'city');
const groupByAgeRange = groupBy(users, user => user.age >= 25 ? '25+' : '25-');
```

#### 5. 数组求交集、并集、差集

```javascript
const arr1 = [1, 2, 3, 4];
const arr2 = [3, 4, 5, 6];

// 交集
const intersection = arr1.filter(x => arr2.includes(x));
console.log(intersection); // [3, 4]

// 并集
const union = [...new Set([...arr1, ...arr2])];
console.log(union); // [1, 2, 3, 4, 5, 6]

// 差集（arr1有但arr2没有）
const difference = arr1.filter(x => !arr2.includes(x));
console.log(difference); // [1, 2]

// 对称差集（arr1和arr2各自独有的）
const symmetricDiff = arr1
  .filter(x => !arr2.includes(x))
  .concat(arr2.filter(x => !arr1.includes(x)));
console.log(symmetricDiff); // [1, 2, 5, 6]
```

## 💡 面试回答技巧

### 推荐回答顺序

1. **先分类**：改变原数组的方法 vs 不改变原数组的方法
2. **说常用的**：push/pop、map/filter/reduce、forEach
3. **说ES6新增**：find、includes、flat等
4. **举例说明**：用代码展示几个重要方法的用法
5. **补充进阶**：链式调用、性能对比、实际应用

### 重点强调

- 强调哪些方法会改变原数组（面试高频考点）
- 说明map、filter、reduce的区别和应用场景
- 提到forEach不能break，要中断用for循环
- 说明sort()默认按字符串排序，需要传比较函数
- 提到reduce的强大功能（去重、分组、扁平化等）

### 可能的追问

**Q1: map和forEach的区别？**

A: 主要有4个区别：

| 特性 | map | forEach |
|------|-----|---------|
| 返回值 | 返回新数组 | 返回undefined |
| 链式调用 | 支持 | 不支持 |
| 性能 | 稍慢（创建新数组） | 稍快 |
| 使用场景 | 需要转换数组 | 只需遍历 |

```javascript
const arr = [1, 2, 3];

// map - 返回新数组
const doubled = arr.map(x => x * 2);
console.log(doubled); // [2, 4, 6]

// forEach - 无返回值
const result = arr.forEach(x => x * 2);
console.log(result); // undefined

// map支持链式调用
arr.map(x => x * 2).filter(x => x > 2); // ✅

// forEach不支持链式调用
arr.forEach(x => x * 2).filter(x => x > 2); // ❌ 报错
```

**Q2: filter和find的区别？**

A: 

| 特性 | filter | find |
|------|--------|------|
| 返回值 | 数组（所有符合条件的） | 单个元素（第一个符合条件的） |
| 找不到 | 返回空数组[] | 返回undefined |
| 性能 | 遍历整个数组 | 找到第一个就停止 |

```javascript
const arr = [1, 2, 3, 4, 5];

// filter - 返回所有符合条件的
const filtered = arr.filter(x => x > 2);
console.log(filtered); // [3, 4, 5]

// find - 返回第一个符合条件的
const found = arr.find(x => x > 2);
console.log(found); // 3

// 找不到的情况
console.log(arr.filter(x => x > 10)); // []
console.log(arr.find(x => x > 10));   // undefined
```

**Q3: reduce可以做什么？**

A: reduce非常强大，可以实现很多功能：

```javascript
const arr = [1, 2, 3, 4, 5];

// 1. 求和
const sum = arr.reduce((acc, cur) => acc + cur, 0); // 15

// 2. 求最大值
const max = arr.reduce((acc, cur) => Math.max(acc, cur)); // 5

// 3. 数组去重
const arr2 = [1, 2, 2, 3, 3];
const unique = arr2.reduce((acc, cur) => {
  if (!acc.includes(cur)) acc.push(cur);
  return acc;
}, []); // [1, 2, 3]

// 4. 数组扁平化
const nested = [1, [2, 3], [4, [5]]];
const flat = nested.reduce((acc, cur) => {
  return acc.concat(Array.isArray(cur) ? cur.flat() : cur);
}, []); // [1, 2, 3, 4, [5]]

// 5. 对象数组分组
const users = [
  { name: '张三', age: 20 },
  { name: '李四', age: 20 },
  { name: '王五', age: 30 }
];
const grouped = users.reduce((acc, user) => {
  const key = user.age;
  if (!acc[key]) acc[key] = [];
  acc[key].push(user);
  return acc;
}, {});

// 6. 计数
const fruits = ['apple', 'banana', 'apple', 'orange', 'banana'];
const count = fruits.reduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {}); // { apple: 2, banana: 2, orange: 1 }

// 7. 实现map
const mapped = arr.reduce((acc, cur) => {
  acc.push(cur * 2);
  return acc;
}, []); // [2, 4, 6, 8, 10]

// 8. 实现filter
const filtered = arr.reduce((acc, cur) => {
  if (cur % 2 === 0) acc.push(cur);
  return acc;
}, []); // [2, 4]
```

**Q4: 如何判断一个变量是否为数组？**

A: 有4种方法：

```javascript
const arr = [1, 2, 3];

// 方法1：Array.isArray()（推荐）
console.log(Array.isArray(arr)); // true

// 方法2：instanceof
console.log(arr instanceof Array); // true

// 方法3：constructor
console.log(arr.constructor === Array); // true

// 方法4：Object.prototype.toString
console.log(Object.prototype.toString.call(arr) === '[object Array]'); // true

// 推荐使用Array.isArray()，因为：
// 1. 最简洁
// 2. 可以检测跨iframe的数组
// 3. ES5标准方法
```

**Q5: sort()的原理是什么？**

A: 

```javascript
// sort()默认按字符串Unicode码点排序
const arr = [10, 5, 40, 25];
arr.sort();
console.log(arr); // [10, 25, 40, 5]
// 因为 '10' < '25' < '40' < '5'（字符串比较）

// 数字排序需要传比较函数
arr.sort((a, b) => a - b); // 升序
// 返回值 < 0：a排在b前面
// 返回值 = 0：位置不变
// 返回值 > 0：b排在a前面

// 降序
arr.sort((a, b) => b - a);

// 对象数组排序
const users = [
  { name: '张三', age: 30 },
  { name: '李四', age: 20 },
  { name: '王五', age: 25 }
];
users.sort((a, b) => a.age - b.age); // 按年龄升序

// 多条件排序
users.sort((a, b) => {
  if (a.age !== b.age) {
    return a.age - b.age; // 先按年龄
  }
  return a.name.localeCompare(b.name); // 年龄相同按名字
});

// 注意：sort()是原地排序，会改变原数组
// 如果不想改变原数组：
const sorted = [...arr].sort((a, b) => a - b);
```

**Q6: slice和splice的区别？**

A: 

| 特性 | slice | splice |
|------|-------|--------|
| 改变原数组 | 否 | 是 |
| 返回值 | 新数组（截取的部分） | 被删除的元素数组 |
| 参数 | (start, end) | (start, deleteCount, ...items) |
| 功能 | 截取 | 删除/插入/替换 |

```javascript
const arr = [1, 2, 3, 4, 5];

// slice - 截取，不改变原数组
const sliced = arr.slice(1, 3); // [2, 3]
console.log(arr); // [1, 2, 3, 4, 5]（不变）

// splice - 删除/插入/替换，改变原数组
const arr2 = [1, 2, 3, 4, 5];
const deleted = arr2.splice(1, 2); // 从索引1删除2个
console.log(deleted); // [2, 3]
console.log(arr2);    // [1, 4, 5]（改变了）

// splice插入
arr2.splice(1, 0, 2, 3); // 在索引1插入2和3
console.log(arr2); // [1, 2, 3, 4, 5]

// splice替换
arr2.splice(1, 2, 'a', 'b'); // 删除2个，插入'a'和'b'
console.log(arr2); // [1, 'a', 'b', 4, 5]
```

**Q7: 如何实现数组去重？**

A: 有多种方法，各有优缺点：

```javascript
const arr = [1, 2, 2, 3, 3, 4];

// 方法1：Set（最简洁，推荐）
const unique1 = [...new Set(arr)];
// 优点：简洁、性能好
// 缺点：不能去重对象

// 方法2：filter + indexOf
const unique2 = arr.filter((item, index) => arr.indexOf(item) === index);
// 优点：兼容性好
// 缺点：性能差（O(n²)）

// 方法3：reduce
const unique3 = arr.reduce((acc, cur) => {
  if (!acc.includes(cur)) acc.push(cur);
  return acc;
}, []);
// 优点：灵活
// 缺点：性能一般

// 方法4：Map
const unique4 = [...new Map(arr.map(item => [item, item])).values()];
// 优点：可以保留对象
// 缺点：稍复杂

// 对象数组去重
const users = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 1, name: '张三' }
];

// 按id去重
const uniqueUsers = users.reduce((acc, cur) => {
  if (!acc.find(item => item.id === cur.id)) {
    acc.push(cur);
  }
  return acc;
}, []);

// 或用Map
const uniqueUsers2 = [...new Map(users.map(item => [item.id, item])).values()];
```

**Q8: 数组的哪些方法会改变原数组？**

A: 一共8个方法会改变原数组（重要考点）：

```javascript
const arr = [1, 2, 3, 4, 5];

// 1. push() - 末尾添加
arr.push(6); // [1, 2, 3, 4, 5, 6]

// 2. pop() - 删除末尾
arr.pop(); // [1, 2, 3, 4, 5]

// 3. unshift() - 开头添加
arr.unshift(0); // [0, 1, 2, 3, 4, 5]

// 4. shift() - 删除开头
arr.shift(); // [1, 2, 3, 4, 5]

// 5. splice() - 删除/插入/替换
arr.splice(1, 2); // [1, 4, 5]

// 6. sort() - 排序
arr.sort((a, b) => b - a); // [5, 4, 1]

// 7. reverse() - 反转
arr.reverse(); // [1, 4, 5]

// 8. fill() - 填充
arr.fill(0); // [0, 0, 0]

// 记忆技巧：
// - 增删改：push、pop、shift、unshift、splice
// - 排序：sort、reverse
// - 填充：fill
```

### 加分项

- 提到数组方法的时间复杂度（push/pop是O(1)，shift/unshift是O(n)）
- 说明实际项目中的应用场景
- 提到性能优化（大数组用for循环而不是forEach）
- 说明ES6新特性（flat、flatMap、includes等）
- 提到函数式编程思想（map、filter、reduce的组合使用）

## 💻 代码示例

### 实际应用场景

**1. 数据转换**
```javascript
// 后端返回的数据
const users = [
  { id: 1, name: '张三', age: 20 },
  { id: 2, name: '李四', age: 25 },
  { id: 3, name: '王五', age: 30 }
];

// 提取id数组
const ids = users.map(user => user.id); // [1, 2, 3]

// 提取name数组
const names = users.map(user => user.name); // ['张三', '李四', '王五']

// 转换为下拉选项格式
const options = users.map(user => ({
  label: user.name,
  value: user.id
}));
```

**2. 数据过滤**
```javascript
const products = [
  { name: '手机', price: 3000, stock: 10 },
  { name: '电脑', price: 8000, stock: 0 },
  { name: '平板', price: 2000, stock: 5 }
];

// 过滤有库存的商品
const inStock = products.filter(p => p.stock > 0);

// 过滤价格大于3000的商品
const expensive = products.filter(p => p.price > 3000);

// 多条件过滤
const filtered = products.filter(p => p.price > 2000 && p.stock > 0);
```

**3. 数据统计**
```javascript
const orders = [
  { id: 1, amount: 100 },
  { id: 2, amount: 200 },
  { id: 3, amount: 150 }
];

// 计算总金额
const total = orders.reduce((sum, order) => sum + order.amount, 0); // 450

// 计算平均值
const average = total / orders.length; // 150

// 找出最大金额
const max = orders.reduce((max, order) => 
  order.amount > max ? order.amount : max, 0
); // 200
```

**4. 数据分组**
```javascript
const students = [
  { name: '张三', grade: 'A', class: '1班' },
  { name: '李四', grade: 'B', class: '1班' },
  { name: '王五', grade: 'A', class: '2班' }
];

// 按班级分组
const byClass = students.reduce((acc, student) => {
  const key = student.class;
  if (!acc[key]) acc[key] = [];
  acc[key].push(student);
  return acc;
}, {});
// {
//   '1班': [{ name: '张三', ... }, { name: '李四', ... }],
//   '2班': [{ name: '王五', ... }]
// }

// 按成绩分组
const byGrade = students.reduce((acc, student) => {
  const key = student.grade;
  if (!acc[key]) acc[key] = [];
  acc[key].push(student);
  return acc;
}, {});
```

**5. 数组排序**
```javascript
const products = [
  { name: '手机', price: 3000, sales: 100 },
  { name: '电脑', price: 8000, sales: 50 },
  { name: '平板', price: 2000, sales: 150 }
];

// 按价格升序
products.sort((a, b) => a.price - b.price);

// 按销量降序
products.sort((a, b) => b.sales - a.sales);

// 多条件排序（先按价格，价格相同按销量）
products.sort((a, b) => {
  if (a.price !== b.price) {
    return a.price - b.price;
  }
  return b.sales - a.sales;
});
```

**6. 数组查找**
```javascript
const users = [
  { id: 1, name: '张三', age: 20 },
  { id: 2, name: '李四', age: 25 },
  { id: 3, name: '王五', age: 30 }
];

// 查找指定id的用户
const user = users.find(u => u.id === 2);

// 查找第一个成年用户
const adult = users.find(u => u.age >= 18);

// 判断是否有未成年用户
const hasMinor = users.some(u => u.age < 18);

// 判断是否所有用户都成年
const allAdult = users.every(u => u.age >= 18);

// 判断是否包含某个用户
const hasUser = users.some(u => u.name === '张三');
```

**7. 分页处理**
```javascript
const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const pageSize = 3;
const currentPage = 2;

// 获取当前页数据
const start = (currentPage - 1) * pageSize;
const end = start + pageSize;
const pageData = data.slice(start, end); // [4, 5, 6]

// 计算总页数
const totalPages = Math.ceil(data.length / pageSize); // 4
```

**8. 树形数据扁平化**
```javascript
const tree = [
  {
    id: 1,
    name: '节点1',
    children: [
      { id: 2, name: '节点1-1', children: [] },
      { id: 3, name: '节点1-2', children: [] }
    ]
  },
  {
    id: 4,
    name: '节点2',
    children: [
      { id: 5, name: '节点2-1', children: [] }
    ]
  }
];

// 扁平化
function flattenTree(tree) {
  return tree.reduce((acc, node) => {
    const { children, ...rest } = node;
    acc.push(rest);
    if (children && children.length) {
      acc.push(...flattenTree(children));
    }
    return acc;
  }, []);
}

const flat = flattenTree(tree);
// [
//   { id: 1, name: '节点1' },
//   { id: 2, name: '节点1-1' },
//   { id: 3, name: '节点1-2' },
//   { id: 4, name: '节点2' },
//   { id: 5, name: '节点2-1' }
// ]
```

### 性能优化技巧

**1. 避免在循环中创建函数**
```javascript
const arr = [1, 2, 3, 4, 5];

// ❌ 不好：每次循环都创建新函数
arr.forEach(function(item) {
  console.log(item);
});

// ✅ 好：函数复用
function logItem(item) {
  console.log(item);
}
arr.forEach(logItem);
```

**2. 大数组用for循环而不是forEach**
```javascript
const arr = new Array(1000000).fill(1);

// 慢：forEach有函数调用开销
console.time('forEach');
arr.forEach(item => item * 2);
console.timeEnd('forEach');

// 快：for循环直接操作
console.time('for');
for (let i = 0; i < arr.length; i++) {
  arr[i] * 2;
}
console.timeEnd('for');
```

**3. 提前终止循环**
```javascript
const arr = [1, 2, 3, 4, 5];

// ❌ 不好：forEach无法中断
arr.forEach(item => {
  if (item === 3) return; // 只是跳过当前循环
  console.log(item);
});

// ✅ 好：用for循环可以break
for (const item of arr) {
  if (item === 3) break;
  console.log(item);
}

// ✅ 好：用some可以中断
arr.some(item => {
  if (item === 3) return true; // 返回true中断
  console.log(item);
});
```

**4. 链式调用的性能考虑**
```javascript
const arr = [1, 2, 3, 4, 5];

// ❌ 不好：多次遍历
const result1 = arr
  .map(x => x * 2)
  .filter(x => x > 5)
  .reduce((sum, x) => sum + x, 0);

// ✅ 好：一次遍历
const result2 = arr.reduce((sum, x) => {
  const doubled = x * 2;
  if (doubled > 5) {
    return sum + doubled;
  }
  return sum;
}, 0);
```

## 🔗 相关知识点

- [数组去重](./array-dedup.md) - 数组去重的多种方法
- [对象数组去重](./object-array-dedup.md) - 对象数组的去重方法
- [闭包](./closure.md) - 数组方法中的闭包应用

## 📚 参考资料

- [MDN - Array](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [JavaScript数组方法详解](https://es6.ruanyifeng.com/#docs/array)
- [数组方法性能对比](https://jsperf.com/)

## 📊 方法速查表

### 改变原数组（8个）

| 方法 | 功能 | 返回值 | 示例 |
|------|------|--------|------|
| push() | 末尾添加 | 新长度 | arr.push(1) |
| pop() | 删除末尾 | 被删除的元素 | arr.pop() |
| unshift() | 开头添加 | 新长度 | arr.unshift(1) |
| shift() | 删除开头 | 被删除的元素 | arr.shift() |
| splice() | 删除/插入/替换 | 被删除的元素数组 | arr.splice(1, 2) |
| sort() | 排序 | 排序后的数组 | arr.sort() |
| reverse() | 反转 | 反转后的数组 | arr.reverse() |
| fill() | 填充 | 填充后的数组 | arr.fill(0) |

### 不改变原数组（常用）

| 方法 | 功能 | 返回值 | 示例 |
|------|------|--------|------|
| concat() | 合并数组 | 新数组 | arr.concat([1, 2]) |
| slice() | 截取数组 | 新数组 | arr.slice(1, 3) |
| map() | 映射 | 新数组 | arr.map(x => x * 2) |
| filter() | 过滤 | 新数组 | arr.filter(x => x > 2) |
| reduce() | 归并 | 单个值 | arr.reduce((a, b) => a + b) |
| forEach() | 遍历 | undefined | arr.forEach(x => log(x)) |
| find() | 查找元素 | 元素或undefined | arr.find(x => x > 2) |
| findIndex() | 查找索引 | 索引或-1 | arr.findIndex(x => x > 2) |
| some() | 是否有符合条件 | 布尔值 | arr.some(x => x > 2) |
| every() | 是否都符合条件 | 布尔值 | arr.every(x => x > 0) |
| includes() | 是否包含 | 布尔值 | arr.includes(2) |
| indexOf() | 查找索引 | 索引或-1 | arr.indexOf(2) |
| join() | 转字符串 | 字符串 | arr.join('-') |
| flat() | 扁平化 | 新数组 | arr.flat(2) |
| flatMap() | map+flat | 新数组 | arr.flatMap(x => [x, x*2]) |

### 静态方法

| 方法 | 功能 | 示例 |
|------|------|------|
| Array.from() | 类数组转数组 | Array.from('hello') |
| Array.of() | 创建数组 | Array.of(1, 2, 3) |
| Array.isArray() | 判断是否为数组 | Array.isArray([]) |
