---
title: 深拷贝 vs 浅拷贝 - 手写深拷贝处理循环引用
description: 详解 JavaScript 深拷贝和浅拷贝的区别，掌握 JSON.parse 的缺陷，学习手写深拷贝处理循环引用、特殊对象的完整实现
keywords: 深拷贝浅拷贝, 手写深拷贝, 循环引用, JSON.parse, WeakMap, JavaScript面试
date: 2025-11-27
category: JavaScript
difficulty: 中级
tags: [深拷贝, 浅拷贝, 循环引用, 递归, WeakMap]
related: [data-types.md, closure.md]
hasCode: true
---

# 题目

请详细说明深拷贝和浅拷贝的区别，JSON.parse(JSON.stringify()) 的缺陷，以及如何手写一个深拷贝（考虑循环引用）。

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

## 🏢 企业级应用场景

### 为什么要使用深拷贝？

在企业级项目中，深拷贝主要用于以下场景：

#### 1. 状态管理（不可变数据）

```javascript
// Redux/Vuex 中的状态更新
const state = {
  user: {
    name: 'Alice',
    profile: {
      age: 25,
      city: 'Beijing'
    }
  }
};

// ❌ 错误：直接修改（违反不可变原则）
function updateUser(state, newAge) {
  state.user.profile.age = newAge;  // 直接修改原对象
  return state;
}

// ✅ 正确：深拷贝后修改
function updateUser(state, newAge) {
  const newState = deepClone(state);
  newState.user.profile.age = newAge;
  return newState;
}
```

**为什么需要不可变数据？**
- 便于追踪状态变化（时间旅行调试）
- 优化性能（浅比较即可判断是否更新）
- 避免副作用（纯函数）

#### 2. 表单数据备份与重置

```javascript
// 表单编辑场景
class FormManager {
  constructor(initialData) {
    this.originalData = deepClone(initialData);  // 备份原始数据
    this.currentData = deepClone(initialData);   // 当前编辑数据
  }
  
  // 修改数据
  updateField(field, value) {
    this.currentData[field] = value;
  }
  
  // 重置表单
  reset() {
    this.currentData = deepClone(this.originalData);
  }
  
  // 检查是否有修改
  isDirty() {
    return JSON.stringify(this.currentData) !== JSON.stringify(this.originalData);
  }
}

// 使用
const form = new FormManager({
  name: 'Alice',
  email: 'alice@example.com',
  settings: {
    notifications: true,
    theme: 'dark'
  }
});

form.updateField('name', 'Bob');
console.log(form.isDirty());  // true

form.reset();  // 恢复到原始数据
console.log(form.currentData.name);  // 'Alice'
```

#### 3. API 请求数据隔离

```javascript
// 防止修改缓存数据
class ApiCache {
  constructor() {
    this.cache = new Map();
  }
  
  set(key, data) {
    // 存储时深拷贝
    this.cache.set(key, deepClone(data));
  }
  
  get(key) {
    const data = this.cache.get(key);
    // 返回时深拷贝，防止外部修改缓存
    return data ? deepClone(data) : null;
  }
}

// 使用
const cache = new ApiCache();

const userData = { name: 'Alice', age: 25 };
cache.set('user:1', userData);

// 获取数据
const user = cache.get('user:1');
user.age = 30;  // 修改不会影响缓存

console.log(cache.get('user:1').age);  // 25 ✅ 缓存未被污染
```

#### 4. 配置对象的安全传递

```javascript
// 插件系统中的配置隔离
class Plugin {
  constructor(options) {
    // 深拷贝配置，防止外部修改
    this.options = deepClone(options);
    
    // 合并默认配置
    this.options = {
      ...this.defaultOptions,
      ...this.options
    };
  }
  
  get defaultOptions() {
    return {
      enabled: true,
      timeout: 5000,
      retry: 3
    };
  }
}

// 使用
const config = {
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json'
  }
};

const plugin = new Plugin(config);

// 外部修改不影响插件
config.timeout = 10000;
console.log(plugin.options.timeout);  // 3000 ✅
```

#### 5. 撤销/重做功能

```javascript
// 编辑器的历史记录
class HistoryManager {
  constructor(initialState) {
    this.history = [deepClone(initialState)];
    this.currentIndex = 0;
  }
  
  // 保存新状态
  push(state) {
    // 删除当前位置之后的历史
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // 添加新状态
    this.history.push(deepClone(state));
    this.currentIndex++;
  }
  
  // 撤销
  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return deepClone(this.history[this.currentIndex]);
    }
    return null;
  }
  
  // 重做
  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return deepClone(this.history[this.currentIndex]);
    }
    return null;
  }
}

// 使用
const editor = new HistoryManager({ content: '' });

editor.push({ content: 'Hello' });
editor.push({ content: 'Hello World' });

const prevState = editor.undo();
console.log(prevState.content);  // 'Hello'
```

### 什么时候使用深拷贝？

#### ✅ 应该使用深拷贝的场景

1. **需要保持数据不可变性**
   - Redux/Vuex 状态更新
   - React 的 setState
   - 函数式编程

2. **需要备份原始数据**
   - 表单编辑前备份
   - 撤销/重做功能
   - 数据对比

3. **需要隔离数据**
   - API 缓存
   - 配置对象传递
   - 多实例数据隔离

4. **需要避免副作用**
   - 纯函数实现
   - 工具函数
   - 第三方库集成

#### ❌ 不应该使用深拷贝的场景

1. **性能敏感的场景**
   ```javascript
   // ❌ 在循环中深拷贝大对象
   for (let i = 0; i < 10000; i++) {
     const cloned = deepClone(largeObject);  // 性能问题
   }
   
   // ✅ 使用浅拷贝或引用
   for (let i = 0; i < 10000; i++) {
     const ref = largeObject;  // 直接引用
   }
   ```

2. **数据量很大的场景**
   ```javascript
   // ❌ 克隆大型数据集
   const bigData = Array(1000000).fill({ id: 1, data: {...} });
   const cloned = deepClone(bigData);  // 内存和性能问题
   
   // ✅ 使用分页或虚拟滚动
   const page = bigData.slice(0, 100);
   ```

3. **只需要浅拷贝的场景**
   ```javascript
   // ❌ 过度使用深拷贝
   const obj = { a: 1, b: 2 };
   const cloned = deepClone(obj);  // 没必要
   
   // ✅ 浅拷贝即可
   const cloned = { ...obj };
   ```

4. **包含不可克隆对象的场景**
   ```javascript
   // ❌ 克隆包含 DOM 节点的对象
   const obj = {
     element: document.getElementById('app'),
     data: { ... }
   };
   const cloned = deepClone(obj);  // DOM 节点无法克隆
   
   // ✅ 只克隆数据部分
   const cloned = { data: deepClone(obj.data) };
   ```

### Options 安全相关

在企业级项目中，配置对象（options）的安全性非常重要：

#### 1. 防止配置污染

```javascript
// ❌ 不安全：直接使用外部配置
class HttpClient {
  constructor(options) {
    this.options = options;  // 危险！外部可以修改
  }
  
  request(url) {
    // 使用配置
    return fetch(url, this.options);
  }
}

const options = { timeout: 5000 };
const client = new HttpClient(options);

// 外部恶意修改
options.timeout = 0;  // 破坏了客户端配置
options.headers = { 'X-Evil': 'hack' };  // 注入恶意头部

// ✅ 安全：深拷贝配置
class HttpClient {
  constructor(options) {
    this.options = deepClone(options);  // 隔离外部修改
    Object.freeze(this.options);  // 冻结配置
  }
}
```

#### 2. 配置合并安全

```javascript
// ❌ 不安全：浅合并导致原型污染
function mergeOptions(defaults, options) {
  return { ...defaults, ...options };  // 浅合并
}

const defaults = {
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
};

const userOptions = {
  headers: {
    'Authorization': 'Bearer token'
  }
};

const merged = mergeOptions(defaults, userOptions);
console.log(merged.headers);
// { 'Authorization': 'Bearer token' }
// ❌ 'Content-Type' 丢失了！

// ✅ 安全：深度合并
function deepMerge(target, source) {
  const result = deepClone(target);
  
  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

const merged = deepMerge(defaults, userOptions);
console.log(merged.headers);
// {
//   'Content-Type': 'application/json',
//   'Authorization': 'Bearer token'
// }
// ✅ 两个配置都保留了
```

#### 3. 防止原型污染攻击

```javascript
// 原型污染攻击示例
const maliciousPayload = JSON.parse('{"__proto__":{"isAdmin":true}}');

// ❌ 不安全：直接合并
function unsafeMerge(target, source) {
  for (let key in source) {
    if (typeof source[key] === 'object') {
      target[key] = unsafeMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

const config = {};
unsafeMerge(config, maliciousPayload);

const user = {};
console.log(user.isAdmin);  // true ❌ 原型被污染！

// ✅ 安全：过滤危险键
function safeMerge(target, source) {
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  
  for (let key in source) {
    // 跳过危险键
    if (dangerousKeys.includes(key)) continue;
    
    // 只处理自有属性
    if (!source.hasOwnProperty(key)) continue;
    
    if (typeof source[key] === 'object' && source[key] !== null) {
      target[key] = safeMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  
  return target;
}
```

#### 4. 配置验证

```javascript
// 配置验证和清理
class SecureConfig {
  constructor(options) {
    // 1. 深拷贝隔离
    const cloned = deepClone(options);
    
    // 2. 验证配置
    this.options = this.validate(cloned);
    
    // 3. 冻结配置
    Object.freeze(this.options);
  }
  
  validate(options) {
    const validated = {};
    
    // 白名单验证
    const allowedKeys = ['timeout', 'retry', 'headers'];
    
    for (let key of allowedKeys) {
      if (key in options) {
        // 类型验证
        if (key === 'timeout' && typeof options[key] === 'number') {
          validated[key] = Math.max(0, Math.min(options[key], 30000));
        } else if (key === 'retry' && typeof options[key] === 'number') {
          validated[key] = Math.max(0, Math.min(options[key], 5));
        } else if (key === 'headers' && typeof options[key] === 'object') {
          validated[key] = this.sanitizeHeaders(options[key]);
        }
      }
    }
    
    return validated;
  }
  
  sanitizeHeaders(headers) {
    const sanitized = {};
    const allowedHeaders = ['Content-Type', 'Authorization', 'Accept'];
    
    for (let key of allowedHeaders) {
      if (key in headers && typeof headers[key] === 'string') {
        sanitized[key] = headers[key];
      }
    }
    
    return sanitized;
  }
}

// 使用
const config = new SecureConfig({
  timeout: 5000,
  retry: 3,
  headers: {
    'Content-Type': 'application/json',
    'X-Evil': 'hack'  // 会被过滤
  },
  __proto__: { isAdmin: true }  // 会被过滤
});

console.log(config.options);
// {
//   timeout: 5000,
//   retry: 3,
//   headers: { 'Content-Type': 'application/json' }
// }
```

#### 5. 最佳实践总结

```javascript
// 企业级配置管理最佳实践
class ConfigManager {
  constructor(options = {}) {
    // 1. 深拷贝用户配置
    const userConfig = deepClone(options);
    
    // 2. 深度合并默认配置
    this.config = this.deepMerge(this.getDefaults(), userConfig);
    
    // 3. 验证和清理
    this.config = this.validate(this.config);
    
    // 4. 冻结配置（防止运行时修改）
    Object.freeze(this.config);
  }
  
  getDefaults() {
    return {
      timeout: 5000,
      retry: 3,
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
  
  deepMerge(target, source) {
    const result = deepClone(target);
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    
    for (let key in source) {
      if (dangerousKeys.includes(key)) continue;
      if (!source.hasOwnProperty(key)) continue;
      
      if (this.isPlainObject(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
  
  isPlainObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }
  
  validate(config) {
    // 实现验证逻辑
    return config;
  }
  
  // 提供安全的配置访问
  get(key) {
    // 返回深拷贝，防止外部修改
    return deepClone(this.config[key]);
  }
}
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
