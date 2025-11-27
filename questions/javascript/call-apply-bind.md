---
title: call、apply、bind 的区别与实现
date: 2025-11-27
category: JavaScript
difficulty: 中级
tags: [call, apply, bind, this, 手写实现]
related: [this-binding.md, closure.md]
hasCode: true
---

# call、apply、bind 的区别与实现

## 📝 标准答案

### 核心要点

1. **共同点**：都用于改变函数的 this 指向

2. **区别**：
   - `call`：立即调用，参数逐个传递
   - `apply`：立即调用，参数以数组传递
   - `bind`：返回新函数，不立即调用，支持柯里化

3. **使用场景**：
   - `call`：参数数量确定且较少
   - `apply`：参数以数组形式存在（如 Math.max）
   - `bind`：需要延迟调用或固定 this（如事件处理）

### 详细说明

```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const person = { name: 'Alice' };

// call：立即调用，参数逐个传递
greet.call(person, 'Hello', '!');  // "Hello, I'm Alice!"

// apply：立即调用，参数以数组传递
greet.apply(person, ['Hi', '.']);  // "Hi, I'm Alice."

// bind：返回新函数，不立即调用
const boundGreet = greet.bind(person);
boundGreet('Hey', '~');  // "Hey, I'm Alice~"

// bind 支持预设参数（柯里化）
const boundGreetWithHello = greet.bind(person, 'Hello');
boundGreetWithHello('!');  // "Hello, I'm Alice!"
```

## 🧠 深度理解

### call 的实现原理

```javascript
Function.prototype.myCall = function(context, ...args) {
  // 1. 处理 context 为 null/undefined 的情况
  context = context || window;
  
  // 2. 将函数作为 context 的方法
  // 使用 Symbol 避免属性名冲突
  const fn = Symbol('fn');
  context[fn] = this;
  
  // 3. 调用函数
  const result = context[fn](...args);
  
  // 4. 删除临时属性
  delete context[fn];
  
  // 5. 返回结果
  return result;
};

// 测试
function greet(greeting) {
  console.log(`${greeting}, I'm ${this.name}`);
}

const person = { name: 'Alice' };
greet.myCall(person, 'Hello');  // "Hello, I'm Alice"
```

**原理解析：**
```javascript
// call 的本质是将函数作为对象的方法调用
const person = { name: 'Alice' };

function greet() {
  console.log(this.name);
}

// greet.call(person) 等价于：
person.greet = greet;
person.greet();  // 'Alice'
delete person.greet;
```

### apply 的实现原理

```javascript
Function.prototype.myApply = function(context, args = []) {
  // 1. 处理 context
  context = context || window;
  
  // 2. 将函数作为 context 的方法
  const fn = Symbol('fn');
  context[fn] = this;
  
  // 3. 调用函数（参数以数组形式传递）
  const result = context[fn](...args);
  
  // 4. 删除临时属性
  delete context[fn];
  
  // 5. 返回结果
  return result;
};

// 测试
function sum(a, b, c) {
  console.log(this.name, a + b + c);
}

const obj = { name: 'Calculator' };
sum.myApply(obj, [1, 2, 3]);  // "Calculator 6"
```

### bind 的实现原理

```javascript
Function.prototype.myBind = function(context, ...args1) {
  // 保存原函数
  const fn = this;
  
  // 返回新函数
  return function boundFn(...args2) {
    // 判断是否是 new 调用
    if (this instanceof boundFn) {
      // new 调用：this 指向新对象，忽略传入的 context
      return new fn(...args1, ...args2);
    }
    
    // 普通调用：使用 apply 绑定 this
    return fn.apply(context, [...args1, ...args2]);
  };
};

// 测试
function Person(name, age) {
  this.name = name;
  this.age = age;
}

const obj = { x: 1 };

// 普通调用
const boundPerson = Person.myBind(obj, 'Alice');
boundPerson(25);
console.log(obj);  // { x: 1, name: 'Alice', age: 25 }

// new 调用
const instance = new boundPerson(30);
console.log(instance);  // Person { name: 'Alice', age: 30 }
console.log(obj);  // { x: 1, name: 'Alice', age: 25 }（不受影响）
```

**bind 的关键特性：**

1. **支持柯里化（预设参数）**
```javascript
function sum(a, b, c) {
  return a + b + c;
}

const add5 = sum.bind(null, 5);
console.log(add5(10, 15));  // 30（5 + 10 + 15）

const add5And10 = sum.bind(null, 5, 10);
console.log(add5And10(15));  // 30（5 + 10 + 15）
```

2. **支持 new 调用**
```javascript
function Point(x, y) {
  this.x = x;
  this.y = y;
}

const BoundPoint = Point.bind(null, 10);
const point = new BoundPoint(20);
console.log(point);  // Point { x: 10, y: 20 }
```

3. **多次 bind 只有第一次生效**
```javascript
function foo() {
  console.log(this.name);
}

const obj1 = { name: 'obj1' };
const obj2 = { name: 'obj2' };

const bound1 = foo.bind(obj1);
const bound2 = bound1.bind(obj2);  // 无效

bound2();  // 'obj1'（第一次 bind 生效）
```

### 性能对比

```javascript
const obj = { name: 'Alice' };

function greet() {
  return this.name;
}

// 性能测试
console.time('call');
for (let i = 0; i < 1000000; i++) {
  greet.call(obj);
}
console.timeEnd('call');  // 约 10ms

console.time('apply');
for (let i = 0; i < 1000000; i++) {
  greet.apply(obj);
}
console.timeEnd('apply');  // 约 12ms（略慢于 call）

console.time('bind');
const boundGreet = greet.bind(obj);
for (let i = 0; i < 1000000; i++) {
  boundGreet();
}
console.timeEnd('bind');  // 约 8ms（最快，因为只绑定一次）
```

**结论**：
- `call` 和 `apply` 性能相近，`call` 略快
- `bind` 适合多次调用的场景，只需绑定一次

### 常见误区

1. **误区：认为 apply 只能传数组**
   ```javascript
   // ✅ 可以传类数组对象
   function sum() {
     return Array.from(arguments).reduce((a, b) => a + b, 0);
   }
   
   sum.apply(null, { 0: 1, 1: 2, 2: 3, length: 3 });  // 6
   ```

2. **误区：忘记 bind 返回的是新函数**
   ```javascript
   const obj = {
     name: 'Alice',
     sayHi() {
       console.log(this.name);
     }
   };
   
   // ❌ 错误：bind 返回新函数，需要调用
   obj.sayHi.bind(obj);  // 什么都不输出
   
   // ✅ 正确
   obj.sayHi.bind(obj)();  // 'Alice'
   ```

3. **误区：在箭头函数上使用 call/apply/bind**
   ```javascript
   const arrow = () => console.log(this.name);
   const obj = { name: 'Alice' };
   
   arrow.call(obj);   // undefined（无效）
   arrow.apply(obj);  // undefined（无效）
   arrow.bind(obj)(); // undefined（无效）
   ```

### 进阶知识

#### 1. 借用数组方法

```javascript
// 类数组对象借用数组方法
const arrayLike = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3
};

// 借用 slice
const arr = Array.prototype.slice.call(arrayLike);
console.log(arr);  // ['a', 'b', 'c']

// 借用 forEach
Array.prototype.forEach.call(arrayLike, item => {
  console.log(item);  // 'a', 'b', 'c'
});

// 借用 map
const upper = Array.prototype.map.call(arrayLike, item => item.toUpperCase());
console.log(upper);  // ['A', 'B', 'C']
```

#### 2. 获取数组最大值/最小值

```javascript
const numbers = [5, 6, 2, 3, 7];

// 使用 apply
const max = Math.max.apply(null, numbers);
console.log(max);  // 7

const min = Math.min.apply(null, numbers);
console.log(min);  // 2

// ES6 展开运算符（更简洁）
console.log(Math.max(...numbers));  // 7
console.log(Math.min(...numbers));  // 2
```

#### 3. 判断数据类型

```javascript
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

console.log(getType([]));        // 'array'
console.log(getType({}));        // 'object'
console.log(getType(null));      // 'null'
console.log(getType(new Date())); // 'date'
```

#### 4. 实现函数柯里化

```javascript
function curry(fn) {
  return function curried(...args) {
    // 如果参数够了，直接调用
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    
    // 否则返回新函数，继续收集参数
    return function(...args2) {
      return curried.apply(this, [...args, ...args2]);
    };
  };
}

// 测试
function sum(a, b, c) {
  return a + b + c;
}

const curriedSum = curry(sum);
console.log(curriedSum(1)(2)(3));  // 6
console.log(curriedSum(1, 2)(3));  // 6
console.log(curriedSum(1)(2, 3));  // 6
```

## 💡 面试回答技巧

### 推荐回答顺序

1. **先说共同点**：
   - "三者都用于改变函数的 this 指向"

2. **再说区别**：
   - "call 和 apply 立即调用，bind 返回新函数"
   - "call 参数逐个传递，apply 参数以数组传递"
   - "bind 支持柯里化，可以预设参数"

3. **然后说使用场景**：
   - "call 适合参数确定的场景"
   - "apply 适合参数以数组形式存在的场景"
   - "bind 适合需要延迟调用或固定 this 的场景"

4. **最后说实现原理**：
   - "核心思想是将函数作为对象的方法调用"
   - "bind 需要处理 new 调用和柯里化"

### 重点强调

- ✅ **call 和 apply 的性能差异很小**
- ✅ **bind 返回新函数，支持 new 调用**
- ✅ **多次 bind 只有第一次生效**
- ✅ **箭头函数无法改变 this**

### 可能的追问

**Q1: 为什么需要 call/apply/bind？**

A: 主要用于：
1. 改变 this 指向
2. 借用其他对象的方法
3. 实现继承
4. 函数柯里化

**Q2: call 和 apply 的性能差异？**

A: 
- `call` 略快于 `apply`（约 10-20%）
- 原因：`apply` 需要处理数组参数
- 实际开发中差异可忽略，选择更易读的方式

**Q3: bind 的 polyfill 如何实现？**

A: 见上面的 `myBind` 实现，关键点：
1. 返回新函数
2. 支持柯里化（合并参数）
3. 支持 new 调用（判断 this instanceof）

**Q4: 如何实现一个 softBind？**

A: softBind 允许手动修改 this，而 bind 不允许：
```javascript
Function.prototype.softBind = function(context, ...args1) {
  const fn = this;
  
  return function(...args2) {
    // 如果 this 是 window 或 undefined，使用绑定的 context
    // 否则使用当前的 this
    const finalContext = (!this || this === window) ? context : this;
    return fn.apply(finalContext, [...args1, ...args2]);
  };
};

// 测试
function foo() {
  console.log(this.name);
}

const obj1 = { name: 'obj1' };
const obj2 = { name: 'obj2' };

const softBound = foo.softBind(obj1);
softBound();  // 'obj1'
softBound.call(obj2);  // 'obj2'（可以修改）

const hardBound = foo.bind(obj1);
hardBound();  // 'obj1'
hardBound.call(obj2);  // 'obj1'（无法修改）
```

## 💻 代码示例

### 完整的手写实现（带注释）

```javascript
// ========== call 实现 ==========
Function.prototype.myCall = function(context, ...args) {
  // 1. 处理 context
  // null/undefined 指向 window，原始值需要包装
  if (context == null) {
    context = window;
  } else {
    context = Object(context);  // 包装原始值
  }
  
  // 2. 创建唯一属性名
  const fn = Symbol('fn');
  
  // 3. 将函数作为 context 的方法
  context[fn] = this;
  
  // 4. 调用函数
  const result = context[fn](...args);
  
  // 5. 删除临时属性
  delete context[fn];
  
  // 6. 返回结果
  return result;
};

// ========== apply 实现 ==========
Function.prototype.myApply = function(context, args = []) {
  // 处理 context
  if (context == null) {
    context = window;
  } else {
    context = Object(context);
  }
  
  // 创建唯一属性名
  const fn = Symbol('fn');
  context[fn] = this;
  
  // 调用函数（展开数组参数）
  const result = context[fn](...args);
  
  // 删除临时属性
  delete context[fn];
  
  return result;
};

// ========== bind 实现 ==========
Function.prototype.myBind = function(context, ...args1) {
  // 保存原函数
  const fn = this;
  
  // 返回绑定函数
  function boundFn(...args2) {
    // 判断是否是 new 调用
    if (this instanceof boundFn) {
      // new 调用：this 指向新对象
      return new fn(...args1, ...args2);
    }
    
    // 普通调用：使用 apply 绑定 this
    return fn.apply(context, [...args1, ...args2]);
  }
  
  // 维护原型链
  if (fn.prototype) {
    boundFn.prototype = Object.create(fn.prototype);
  }
  
  return boundFn;
};

// ========== 测试 ==========
function greet(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
  return `${greeting}, I'm ${this.name}${punctuation}`;
}

const person = { name: 'Alice' };

// 测试 call
console.log('=== myCall ===');
greet.myCall(person, 'Hello', '!');  // "Hello, I'm Alice!"

// 测试 apply
console.log('\n=== myApply ===');
greet.myApply(person, ['Hi', '.']);  // "Hi, I'm Alice."

// 测试 bind
console.log('\n=== myBind ===');
const boundGreet = greet.myBind(person, 'Hey');
boundGreet('~');  // "Hey, I'm Alice~"

// 测试 bind 的 new 调用
console.log('\n=== myBind with new ===');
function Person(name, age) {
  this.name = name;
  this.age = age;
}

const BoundPerson = Person.myBind(null, 'Bob');
const instance = new BoundPerson(25);
console.log(instance);  // Person { name: 'Bob', age: 25 }
```

### 实战应用示例

```javascript
// 1. 数组扁平化
function flatten(arr) {
  return Array.prototype.concat.apply([], arr);
}

console.log(flatten([[1, 2], [3, 4], [5]]));  // [1, 2, 3, 4, 5]

// 2. 获取数组最大值
function getMax(arr) {
  return Math.max.apply(null, arr);
}

console.log(getMax([1, 5, 3, 9, 2]));  // 9

// 3. 类数组转数组
function toArray(arrayLike) {
  return Array.prototype.slice.call(arrayLike);
}

console.log(toArray({ 0: 'a', 1: 'b', length: 2 }));  // ['a', 'b']

// 4. 判断数据类型
function type(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

console.log(type([]));     // 'array'
console.log(type(null));   // 'null'
console.log(type(/abc/));  // 'regexp'

// 5. 防抖函数（使用 bind）
function debounce(fn, delay) {
  let timer = null;
  
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 6. 偏函数（使用 bind）
function multiply(a, b) {
  return a * b;
}

const double = multiply.bind(null, 2);
console.log(double(5));  // 10

const triple = multiply.bind(null, 3);
console.log(triple(5));  // 15
```

## 🔗 相关知识点

- [this 指向与箭头函数](./this-binding.md)
- [闭包](./closure.md)
- [函数柯里化](./currying.md)

## 📚 参考资料

- [MDN - Function.prototype.call()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/call)
- [MDN - Function.prototype.apply()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)
- [MDN - Function.prototype.bind()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
