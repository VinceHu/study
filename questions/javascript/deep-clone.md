---
title: 深拷贝 vs 浅拷贝
date: 2025-11-27
category: JavaScript
difficulty: 中级
tags: [深拷贝, 浅拷贝, 循环引用, 递归, WeakMap]
related: [data-types.md, closure.md]
hasCode: true
---

# 深拷贝 vs 浅拷贝

## 📝 标准答案

### 核心要点

1. **浅拷贝**：
   - 只复制第一层属性
   - 引用类型属性仍然共享
   - 方法：`Object.assign()`、展开运算符 `...`、`Array.prototype.slice()`

2. **深拷贝**：
   - 递归复制所有层级
   - 完全独立，互不影响
   - 方法：`JSON.parse(JSON.stringify())`、递归实现、第三方库

3. **JSON 方法的缺陷**：
   - 无法处理函数、undefined、Symbol
   - 无法处理循环引用
   - 无法处理 Date、RegExp 等特殊对象
   - 会丢失原型链

### 详细说明

#### 浅拷贝示例

```javascript
const obj1 = {
  name: 'Alice',
  age: 25,
  hobbies: ['reading', 'coding']
};

// 方法1：Object.assign()
const obj2 = Object.assign({}, obj1);

// 方法2：展开运算符
const obj3 = { ...obj1 };

// 方法3：手动复制
const obj4 = {};
for (let key in obj1) {
  obj4[key] = obj1[key];
}

// 修改嵌套对象
obj2.hobbies.push('gaming');

console.log(obj1.hobbies);  // ['reading', 'coding', 'gaming'] ❌ 被影响
console.log(obj2.hobbies);  // ['reading', 'coding', 'gaming']
```

#### 深拷贝示例

```javascript
const obj1 = {
  name: 'Alice',
  age: 25,
  hobbies: ['reading', 'coding'],
  address: {
    city: 'Beijing',
    country: 'China'
  }
};

// JSON 方法（简单但有缺陷）
const obj2 = JSON.parse(JSON.stringify(obj1));

// 修改嵌套对象
obj2.address.city = 'Shanghai';

console.log(obj1.address.city);  // 'Beijing' ✅ 不受影响
console.log(obj2.address.city);  // 'Shanghai'
```

## 🧠 深度理解

### JSON.parse(JSON.stringify()) 的缺陷

```javascript
const obj = {
  // ✅ 可以处理
  string: 'hello',
  number: 123,
  boolean: true,
  null: null,
  array: [1, 2, 3],
  object: { a: 1 },
  
  // ❌ 无法处理
  undefined: undefined,        // 丢失
  symbol: Symbol('id'),        // 丢失
  function: function() {},     // 丢失
  date: new Date(),            // 转为字符串
  regexp: /abc/,               // 转为空对象 {}
  nan: NaN,                    // 转为 null
  infinity: Infinity,          // 转为 null
};

const cloned = JSON.parse(JSON.stringify(obj));

console.log(cloned);
// {
//   string: 'hello',
//   number: 123,
//   boolean: true,
//   null: null,
//   array: [1, 2, 3],
//   object: { a: 1 },
//   date: '2025-11-27T...',  // 字符串
//   regexp: {},              // 空对象
//   nan: null,
//   infinity: null
// }
// undefined、symbol、function 丢失
```

**循环引用问题：**
```javascript
const obj = { name: 'Alice' };
obj.self = obj;  // 循环引用

// ❌ 报错
JSON.parse(JSON.stringify(obj));  // TypeError: Converting circular structure to JSON
```

### 手写深拷贝（基础版）

```javascript
function deepClone(obj) {
  // 1. 处理基本类型和 null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // 2. 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  // 3. 处理对象
  const cloned = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

// 测试
const obj1 = {
  name: 'Alice',
  hobbies: ['reading', 'coding'],
  address: {
    city: 'Beijing'
  }
};

const obj2 = deepClone(obj1);
obj2.address.city = 'Shanghai';

console.log(obj1.address.city);  // 'Beijing' ✅
console.log(obj2.address.city);  // 'Shanghai'
```

### 手写深拷贝（完整版）

```javascript
function deepClone(obj, hash = new WeakMap()) {
  // 1. 处理 null 和基本类型
  if (obj === null) return obj;
  if (typeof obj !== 'object') return obj;
  
  // 2. 处理 Date
  if (obj instanceof Date) {
    return new Date(obj);
  }
  
  // 3. 处理 RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  
  // 4. 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }
  
  // 5. 处理数组和对象
  // 保持原型链
  const cloned = new obj.constructor();
  
  // 存储到 hash 中，用于处理循环引用
  hash.set(obj, cloned);
  
  // 6. 递归复制属性（包括 Symbol 属性）
  Reflect.ownKeys(obj).forEach(key => {
    cloned[key] = deepClone(obj[key], hash);
  });
  
  return cloned;
}

// 测试
const obj1 = {
  // 基本类型
  string: 'hello',
  number: 123,
  boolean: true,
  null: null,
  undefined: undefined,
  symbol: Symbol('id'),
  
  // 引用类型
  array: [1, 2, { a: 3 }],
  object: { nested: { deep: 'value' } },
  
  // 特殊对象
  date: new Date(),
  regexp: /abc/gi,
  
  // 函数
  fn: function() { console.log('hello'); },
  
  // Symbol 属性
  [Symbol('key')]: 'symbol value'
};

// 循环引用
obj1.self = obj1;

const obj2 = deepClone(obj1);

// 验证
console.log(obj2.string);  // 'hello'
console.log(obj2.date instanceof Date);  // true
console.log(obj2.regexp instanceof RegExp);  // true
console.log(obj2.self === obj2);  // true（循环引用保持）
console.log(obj2.self === obj1);  // false（不是同一个对象）

// 修改不影响原对象
obj2.object.nested.deep = 'changed';
console.log(obj1.object.nested.deep);  // 'value' ✅
```

### 处理特殊类型

```javascript
function deepClone(obj, hash = new WeakMap()) {
  // null 和基本类型
  if (obj === null) return obj;
  if (typeof obj !== 'object') return obj;
  
  // 处理循环引用
  if (hash.has(obj)) return hash.get(obj);
  
  // 获取类型
  const type = Object.prototype.toString.call(obj);
  
  let cloned;
  
  switch (type) {
    // Date
    case '[object Date]':
      return new Date(obj);
    
    // RegExp
    case '[object RegExp]':
      return new RegExp(obj.source, obj.flags);
    
    // Map
    case '[object Map]':
      cloned = new Map();
      hash.set(obj, cloned);
      obj.forEach((value, key) => {
        cloned.set(key, deepClone(value, hash));
      });
      return cloned;
    
    // Set
    case '[object Set]':
      cloned = new Set();
      hash.set(obj, cloned);
      obj.forEach(value => {
        cloned.add(deepClone(value, hash));
      });
      return cloned;
    
    // Array
    case '[object Array]':
      cloned = [];
      hash.set(obj, cloned);
      obj.forEach((item, index) => {
        cloned[index] = deepClone(item, hash);
      });
      return cloned;
    
    // Object
    case '[object Object]':
      cloned = {};
      hash.set(obj, cloned);
      Reflect.ownKeys(obj).forEach(key => {
        cloned[key] = deepClone(obj[key], hash);
      });
      return cloned;
    
    // 其他类型（Function、Error 等）直接返回
    default:
      return obj;
  }
}

// 测试
const map = new Map([['key', { value: 1 }]]);
const set = new Set([{ id: 1 }, { id: 2 }]);

const obj = {
  map,
  set,
  date: new Date(),
  regexp: /test/gi
};

const cloned = deepClone(obj);

// 修改不影响原对象
cloned.map.get('key').value = 999;
console.log(obj.map.get('key').value);  // 1 ✅

cloned.set.forEach(item => item.id = 999);
console.log([...obj.set]);  // [{ id: 1 }, { id: 2 }] ✅
```

### 性能优化

```javascript
// 使用迭代代替递归（避免栈溢出）
function deepCloneIterative(obj) {
  const hash = new WeakMap();
  const root = {};
  
  // 栈
  const stack = [
    {
      parent: root,
      key: undefined,
      data: obj
    }
  ];
  
  while (stack.length) {
    const { parent, key, data } = stack.pop();
    
    // 初始化克隆对象
    let result = parent;
    if (key !== undefined) {
      result = parent[key] = {};
    }
    
    // 处理循环引用
    if (hash.has(data)) {
      parent[key] = hash.get(data);
      continue;
    }
    
    hash.set(data, result);
    
    // 遍历属性
    for (let k in data) {
      if (data.hasOwnProperty(k)) {
        if (typeof data[k] === 'object' && data[k] !== null) {
          // 引用类型，入栈
          stack.push({
            parent: result,
            key: k,
            data: data[k]
          });
        } else {
          // 基本类型，直接复制
          result[k] = data[k];
        }
      }
    }
  }
  
  return root;
}
```

### 常见误区

1. **误区：认为浅拷贝完全独立**
   ```javascript
   const obj1 = { a: { b: 1 } };
   const obj2 = { ...obj1 };
   
   obj2.a.b = 2;
   console.log(obj1.a.b);  // 2 ❌ 被影响
   ```

2. **误区：忘记处理循环引用**
   ```javascript
   const obj = { name: 'Alice' };
   obj.self = obj;
   
   // ❌ 栈溢出
   function deepClone(obj) {
     const cloned = {};
     for (let key in obj) {
       cloned[key] = deepClone(obj[key]);  // 无限递归
     }
     return cloned;
   }
   ```

3. **误区：使用 JSON 方法处理所有情况**
   ```javascript
   const obj = {
     fn: function() {},
     date: new Date()
   };
   
   const cloned = JSON.parse(JSON.stringify(obj));
   console.log(cloned.fn);    // undefined ❌
   console.log(cloned.date);  // 字符串 ❌
   ```

### 进阶知识

#### 1. 使用 structuredClone（新 API）

```javascript
// 浏览器原生深拷贝（Chrome 98+）
const obj = {
  date: new Date(),
  regexp: /test/,
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3])
};

obj.self = obj;  // 循环引用

const cloned = structuredClone(obj);

console.log(cloned.date instanceof Date);  // true
console.log(cloned.self === cloned);  // true

// 注意：不能克隆函数
const obj2 = { fn: () => {} };
structuredClone(obj2);  // DataCloneError
```

#### 2. 使用第三方库

```javascript
// Lodash
import _ from 'lodash';
const cloned = _.cloneDeep(obj);

// Ramda
import R from 'ramda';
const cloned = R.clone(obj);
```

#### 3. 消息通道实现深拷贝

```javascript
function deepClone(obj) {
  return new Promise(resolve => {
    const { port1, port2 } = new MessageChannel();
    port2.onmessage = ev => resolve(ev.data);
    port1.postMessage(obj);
  });
}

// 使用
const obj = { a: { b: 1 } };
deepClone(obj).then(cloned => {
  console.log(cloned);
});
```

## 💡 面试回答技巧

### 推荐回答顺序

1. **先说概念**：
   - "浅拷贝只复制第一层，深拷贝递归复制所有层级"

2. **再说方法**：
   - "浅拷贝：Object.assign、展开运算符"
   - "深拷贝：JSON 方法、递归实现、structuredClone"

3. **然后说 JSON 方法的缺陷**：
   - "无法处理函数、undefined、Symbol"
   - "无法处理循环引用"
   - "特殊对象会丢失类型"

4. **最后说完整实现**：
   - "使用 WeakMap 处理循环引用"
   - "使用 Reflect.ownKeys 处理 Symbol"
   - "针对不同类型做特殊处理"

### 重点强调

- ✅ **循环引用的处理（WeakMap）**
- ✅ **JSON 方法的局限性**
- ✅ **特殊对象的处理（Date、RegExp、Map、Set）**
- ✅ **性能考虑（递归 vs 迭代）**

### 可能的追问

**Q1: 为什么使用 WeakMap 而不是 Map？**

A:
- `WeakMap` 的键是弱引用，不会阻止垃圾回收
- 克隆完成后，`WeakMap` 会自动释放内存
- `Map` 会一直持有引用，可能导致内存泄漏

**Q2: 如何处理函数的深拷贝？**

A:
```javascript
function cloneFunction(fn) {
  // 箭头函数和原生函数无法完美克隆
  if (!fn.prototype) return fn;
  
  // 普通函数：使用 eval 或 Function 构造函数
  const fnStr = fn.toString();
  return new Function('return ' + fnStr)();
}

// 注意：这种方法有局限性，通常直接返回原函数
```

**Q3: 深拷贝的性能如何优化？**

A:
1. 使用迭代代替递归（避免栈溢出）
2. 缓存已克隆的对象（WeakMap）
3. 对于大对象，考虑使用 Web Worker
4. 使用原生 API（structuredClone）

**Q4: 如何实现一个支持自定义克隆的深拷贝？**

A:
```javascript
function deepClone(obj, hash = new WeakMap()) {
  // 如果对象有自定义克隆方法
  if (obj && typeof obj.clone === 'function') {
    return obj.clone();
  }
  
  // 否则使用默认克隆逻辑
  // ...
}

// 使用
class Person {
  constructor(name) {
    this.name = name;
  }
  
  clone() {
    return new Person(this.name);
  }
}
```

## 💻 代码示例

### 完整的深拷贝实现（生产级别）

```javascript
function deepClone(obj, hash = new WeakMap()) {
  // 处理 null
  if (obj === null) return obj;
  
  // 处理基本类型
  if (typeof obj !== 'object') return obj;
  
  // 处理循环引用
  if (hash.has(obj)) return hash.get(obj);
  
  // 获取类型
  const type = Object.prototype.toString.call(obj);
  
  let cloned;
  
  // 根据类型处理
  switch (type) {
    case '[object Date]':
      return new Date(obj.getTime());
    
    case '[object RegExp]':
      const reFlags = /\w*$/;
      const result = new obj.constructor(obj.source, reFlags.exec(obj));
      result.lastIndex = obj.lastIndex;
      return result;
    
    case '[object Map]':
      cloned = new Map();
      hash.set(obj, cloned);
      obj.forEach((value, key) => {
        cloned.set(deepClone(key, hash), deepClone(value, hash));
      });
      return cloned;
    
    case '[object Set]':
      cloned = new Set();
      hash.set(obj, cloned);
      obj.forEach(value => {
        cloned.add(deepClone(value, hash));
      });
      return cloned;
    
    case '[object Array]':
      cloned = [];
      hash.set(obj, cloned);
      obj.forEach((item, index) => {
        cloned[index] = deepClone(item, hash);
      });
      return cloned;
    
    case '[object Object]':
      // 保持原型链
      cloned = Object.create(Object.getPrototypeOf(obj));
      hash.set(obj, cloned);
      
      // 复制所有属性（包括 Symbol）
      Reflect.ownKeys(obj).forEach(key => {
        cloned[key] = deepClone(obj[key], hash);
      });
      
      return cloned;
    
    case '[object Function]':
      // 函数直接返回（无法完美克隆）
      return obj;
    
    default:
      // 其他类型（Error、Promise 等）直接返回
      return obj;
  }
}

// 测试用例
const testObj = {
  // 基本类型
  num: 123,
  str: 'hello',
  bool: true,
  null: null,
  undef: undefined,
  sym: Symbol('test'),
  
  // 引用类型
  arr: [1, 2, [3, 4]],
  obj: { a: { b: { c: 1 } } },
  
  // 特殊对象
  date: new Date('2025-11-27'),
  regexp: /test/gi,
  map: new Map([['key1', 'value1'], ['key2', { nested: true }]]),
  set: new Set([1, 2, { id: 3 }]),
  
  // 函数
  fn: function() { return 'hello'; },
  arrow: () => 'world',
  
  // Symbol 属性
  [Symbol('hidden')]: 'secret'
};

// 循环引用
testObj.self = testObj;
testObj.arr.push(testObj.arr);

// 克隆
const cloned = deepClone(testObj);

// 验证
console.log('=== 基本类型 ===');
console.log(cloned.num === testObj.num);  // true
console.log(cloned.str === testObj.str);  // true

console.log('\n=== 引用类型（不共享）===');
cloned.obj.a.b.c = 999;
console.log(testObj.obj.a.b.c);  // 1 ✅

console.log('\n=== 特殊对象 ===');
console.log(cloned.date instanceof Date);  // true
console.log(cloned.regexp instanceof RegExp);  // true
console.log(cloned.map instanceof Map);  // true
console.log(cloned.set instanceof Set);  // true

console.log('\n=== 循环引用 ===');
console.log(cloned.self === cloned);  // true
console.log(cloned.self === testObj);  // false
console.log(cloned.arr[3] === cloned.arr);  // true

console.log('\n=== Symbol 属性 ===');
const symKey = Object.getOwnPropertySymbols(cloned)[0];
console.log(cloned[symKey]);  // 'secret'
```

## 🔗 相关知识点

- [数据类型与检测](./data-types.md)
- [闭包](./closure.md)
- [WeakMap 和 WeakSet](./weakmap-weakset.md)

## 📚 参考资料

- [MDN - structuredClone()](https://developer.mozilla.org/zh-CN/docs/Web/API/structuredClone)
- [MDN - WeakMap](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)
- [Lodash - cloneDeep](https://lodash.com/docs/#cloneDeep)
