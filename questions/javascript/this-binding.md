---
title: this 指向与箭头函数
date: 2025-11-27
category: JavaScript
difficulty: 中级
tags: [this, 箭头函数, call, apply, bind, 作用域]
related: [closure.md, prototype-chain.md]
hasCode: true
---

# this 指向与箭头函数

## 📝 标准答案

### 核心要点

1. **this 的四种绑定规则**：
   - 默认绑定：独立函数调用，指向 window（严格模式下是 undefined）
   - 隐式绑定：对象方法调用，指向调用对象
   - 显式绑定：call/apply/bind，指向指定对象
   - new 绑定：构造函数调用，指向新创建的对象

2. **箭头函数的 this**：
   - 没有自己的 this，继承外层作用域的 this
   - 不能用 call/apply/bind 改变 this
   - 不能作为构造函数使用

3. **箭头函数 vs 普通函数**：
   - this 指向不同
   - 没有 arguments 对象
   - 没有 prototype 属性
   - 不能用作 Generator 函数

### 详细说明

#### this 的四种绑定规则

```javascript
// 1. 默认绑定
function foo() {
  console.log(this);
}
foo();  // window（非严格模式）或 undefined（严格模式）

// 2. 隐式绑定
const obj = {
  name: 'Alice',
  sayHi() {
    console.log(this.name);
  }
};
obj.sayHi();  // 'Alice'（this 指向 obj）

// 3. 显式绑定
function greet() {
  console.log(this.name);
}
const person = { name: 'Bob' };
greet.call(person);   // 'Bob'
greet.apply(person);  // 'Bob'
const boundGreet = greet.bind(person);
boundGreet();  // 'Bob'

// 4. new 绑定
function Person(name) {
  this.name = name;
}
const alice = new Person('Alice');
console.log(alice.name);  // 'Alice'（this 指向新对象）
```

#### 箭头函数的 this

```javascript
// 普通函数：this 取决于调用方式
const obj1 = {
  name: 'Alice',
  sayHi: function() {
    console.log(this.name);
  }
};

obj1.sayHi();  // 'Alice'
const fn1 = obj1.sayHi;
fn1();  // undefined（this 指向 window）

// 箭头函数：this 继承外层作用域
const obj2 = {
  name: 'Bob',
  sayHi: () => {
    console.log(this.name);
  }
};

obj2.sayHi();  // undefined（this 指向外层作用域，即 window）
```

## 🧠 深度理解

### this 绑定的优先级

**优先级：new 绑定 > 显式绑定 > 隐式绑定 > 默认绑定**

```javascript
function foo() {
  console.log(this.name);
}

const obj1 = { name: 'obj1', foo };
const obj2 = { name: 'obj2' };

// 隐式绑定
obj1.foo();  // 'obj1'

// 显式绑定 > 隐式绑定
obj1.foo.call(obj2);  // 'obj2'

// new 绑定 > 隐式绑定
const instance = new obj1.foo();  // undefined（新对象没有 name 属性）

// new 绑定 > 显式绑定
const boundFoo = foo.bind(obj1);
const instance2 = new boundFoo();  // undefined（new 优先级更高）
```

### 隐式绑定丢失

```javascript
// 情况1：赋值给变量
const obj = {
  name: 'Alice',
  sayHi() {
    console.log(this.name);
  }
};

const fn = obj.sayHi;
fn();  // undefined（this 丢失，指向 window）

// 情况2：作为回调函数
setTimeout(obj.sayHi, 1000);  // undefined

// 情况3：传递给其他函数
function execute(callback) {
  callback();
}
execute(obj.sayHi);  // undefined

// 解决方案1：箭头函数
setTimeout(() => obj.sayHi(), 1000);  // 'Alice'

// 解决方案2：bind
setTimeout(obj.sayHi.bind(obj), 1000);  // 'Alice'

// 解决方案3：保存 this
const that = obj;
setTimeout(function() {
  that.sayHi();
}, 1000);  // 'Alice'
```

### 箭头函数的典型应用场景

#### 1. 回调函数中保持 this

```javascript
class Button {
  constructor(label) {
    this.label = label;
    this.clickCount = 0;
  }
  
  // ❌ 普通函数：this 丢失
  handleClickWrong() {
    document.querySelector('#btn').addEventListener('click', function() {
      this.clickCount++;  // this 指向 button 元素，不是 Button 实例
      console.log(this.clickCount);
    });
  }
  
  // ✅ 箭头函数：this 指向 Button 实例
  handleClickRight() {
    document.querySelector('#btn').addEventListener('click', () => {
      this.clickCount++;
      console.log(`${this.label} clicked ${this.clickCount} times`);
    });
  }
  
  // ✅ bind 方案
  handleClickBind() {
    document.querySelector('#btn').addEventListener('click', function() {
      this.clickCount++;
      console.log(this.clickCount);
    }.bind(this));
  }
}
```

#### 2. 数组方法中保持 this

```javascript
class TodoList {
  constructor() {
    this.todos = ['Learn JS', 'Learn React'];
    this.prefix = 'TODO:';
  }
  
  // ❌ 普通函数：this 丢失
  printWrong() {
    this.todos.forEach(function(todo) {
      console.log(this.prefix + todo);  // this.prefix is undefined
    });
  }
  
  // ✅ 箭头函数
  printRight() {
    this.todos.forEach(todo => {
      console.log(this.prefix + todo);  // 'TODO: Learn JS'
    });
  }
  
  // ✅ 传递 thisArg 参数
  printWithThisArg() {
    this.todos.forEach(function(todo) {
      console.log(this.prefix + todo);
    }, this);  // 第二个参数指定 this
  }
}
```

#### 3. 定时器中保持 this

```javascript
class Counter {
  constructor() {
    this.count = 0;
  }
  
  // ❌ 普通函数：this 丢失
  startWrong() {
    setInterval(function() {
      this.count++;  // this 指向 window
      console.log(this.count);
    }, 1000);
  }
  
  // ✅ 箭头函数
  startRight() {
    setInterval(() => {
      this.count++;
      console.log(this.count);
    }, 1000);
  }
  
  // ✅ 保存 this
  startWithThat() {
    const that = this;
    setInterval(function() {
      that.count++;
      console.log(that.count);
    }, 1000);
  }
}
```

### 箭头函数不适用的场景

#### 1. 对象方法

```javascript
// ❌ 错误：this 不指向对象
const obj = {
  name: 'Alice',
  sayHi: () => {
    console.log(this.name);  // undefined（this 指向外层作用域）
  }
};

// ✅ 正确：使用普通函数或方法简写
const obj = {
  name: 'Alice',
  sayHi() {
    console.log(this.name);  // 'Alice'
  }
};
```

#### 2. 原型方法

```javascript
// ❌ 错误
function Person(name) {
  this.name = name;
}

Person.prototype.sayHi = () => {
  console.log(this.name);  // undefined
};

// ✅ 正确
Person.prototype.sayHi = function() {
  console.log(this.name);  // 'Alice'
};
```

#### 3. 构造函数

```javascript
// ❌ 错误：箭头函数不能作为构造函数
const Person = (name) => {
  this.name = name;
};

new Person('Alice');  // TypeError: Person is not a constructor

// ✅ 正确
function Person(name) {
  this.name = name;
}
```

#### 4. 需要动态 this 的场景

```javascript
// ❌ 错误：事件处理器中需要访问 DOM 元素
document.querySelector('#btn').addEventListener('click', () => {
  this.classList.toggle('active');  // this 不是 button 元素
});

// ✅ 正确
document.querySelector('#btn').addEventListener('click', function() {
  this.classList.toggle('active');  // this 是 button 元素
});
```

### call、apply、bind 的区别

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
const boundGreet = greet.bind(person, 'Hey');
boundGreet('~');  // "Hey, I'm Alice~"
```

**手写实现：**

```javascript
// 手写 call
Function.prototype.myCall = function(context, ...args) {
  // 处理 context 为 null/undefined 的情况
  context = context || window;
  
  // 创建唯一的属性名，避免覆盖原有属性
  const fn = Symbol('fn');
  context[fn] = this;
  
  // 执行函数
  const result = context[fn](...args);
  
  // 删除临时属性
  delete context[fn];
  
  return result;
};

// 手写 apply
Function.prototype.myApply = function(context, args = []) {
  context = context || window;
  const fn = Symbol('fn');
  context[fn] = this;
  const result = context[fn](...args);
  delete context[fn];
  return result;
};

// 手写 bind
Function.prototype.myBind = function(context, ...args1) {
  const fn = this;
  
  return function(...args2) {
    // 如果是 new 调用，this 指向新对象
    if (this instanceof fn) {
      return new fn(...args1, ...args2);
    }
    
    // 否则使用 apply 绑定 this
    return fn.apply(context, [...args1, ...args2]);
  };
};

// 测试
function greet(greeting) {
  console.log(`${greeting}, I'm ${this.name}`);
}

const person = { name: 'Alice' };
greet.myCall(person, 'Hello');   // "Hello, I'm Alice"
greet.myApply(person, ['Hi']);   // "Hi, I'm Alice"

const boundGreet = greet.myBind(person);
boundGreet('Hey');  // "Hey, I'm Alice"
```

### 常见误区

1. **误区：认为箭头函数可以用 call/apply/bind 改变 this**
   ```javascript
   const obj = { name: 'Alice' };
   const arrow = () => console.log(this.name);
   
   arrow.call(obj);   // undefined（无效）
   arrow.apply(obj);  // undefined（无效）
   arrow.bind(obj)(); // undefined（无效）
   ```

2. **误区：在对象字面量中使用箭头函数**
   ```javascript
   // ❌ 错误
   const obj = {
     name: 'Alice',
     sayHi: () => console.log(this.name)  // this 不是 obj
   };
   ```

3. **误区：认为箭头函数没有 this**
   ```javascript
   // 箭头函数有 this，只是继承自外层
   function outer() {
     const arrow = () => {
       console.log(this);  // 继承 outer 的 this
     };
     arrow();
   }
   
   outer.call({ name: 'Alice' });  // { name: 'Alice' }
   ```

## 💡 面试回答技巧

### 推荐回答顺序

1. **先说 this 的绑定规则**：
   - "this 有四种绑定规则：默认、隐式、显式、new"
   - "优先级：new > 显式 > 隐式 > 默认"

2. **再说箭头函数的特点**：
   - "箭头函数没有自己的 this，继承外层作用域"
   - "不能用 call/apply/bind 改变 this"
   - "不能作为构造函数"

3. **然后说应用场景**：
   - "箭头函数适合回调函数、数组方法等需要保持 this 的场景"
   - "不适合对象方法、原型方法、构造函数"

4. **最后说 call/apply/bind**：
   - "call 和 apply 立即调用，bind 返回新函数"
   - "call 参数逐个传递，apply 参数以数组传递"

### 重点强调

- ✅ **this 的动态性**：取决于调用方式，不是定义位置
- ✅ **箭头函数的静态性**：this 在定义时确定，不会改变
- ✅ **隐式绑定丢失**：赋值、回调等场景容易丢失 this
- ✅ **call/apply/bind 的区别**：调用时机和参数传递方式

### 可能的追问

**Q1: 如何判断 this 的指向？**

A: 按优先级判断：
1. 是否是 new 调用？指向新对象
2. 是否用 call/apply/bind？指向指定对象
3. 是否是对象方法调用？指向调用对象
4. 否则指向 window（严格模式下是 undefined）

**Q2: 箭头函数和普通函数的完整区别？**

A:
```javascript
// 1. this 指向
function normal() { console.log(this); }
const arrow = () => console.log(this);

// 2. arguments
function normal() { console.log(arguments); }  // 有 arguments
const arrow = () => console.log(arguments);    // 没有 arguments

// 3. prototype
console.log(normal.prototype);  // { constructor: normal }
console.log(arrow.prototype);   // undefined

// 4. 构造函数
new normal();  // ✅ 可以
new arrow();   // ❌ TypeError

// 5. Generator
function* normal() { yield 1; }  // ✅ 可以
const arrow = *() => { yield 1; };  // ❌ 语法错误
```

**Q3: 如何在箭头函数中获取 arguments？**

A:
```javascript
// 方法1：使用剩余参数
const fn = (...args) => {
  console.log(args);  // 数组
};

// 方法2：外层函数的 arguments
function outer() {
  const arrow = () => {
    console.log(arguments);  // 继承 outer 的 arguments
  };
  arrow();
}

outer(1, 2, 3);  // [1, 2, 3]
```

**Q4: bind 多次调用会怎样？**

A:
```javascript
function foo() {
  console.log(this.name);
}

const obj1 = { name: 'obj1' };
const obj2 = { name: 'obj2' };

const bound1 = foo.bind(obj1);
const bound2 = bound1.bind(obj2);  // 无效

bound2();  // 'obj1'（第一次 bind 生效，后续 bind 无效）
```

## 💻 代码示例

### 综合示例：this 的各种场景

```javascript
// 全局作用域
console.log(this);  // window

// 函数调用
function globalFn() {
  console.log(this);  // window（非严格模式）
}
globalFn();

// 严格模式
'use strict';
function strictFn() {
  console.log(this);  // undefined
}
strictFn();

// 对象方法
const obj = {
  name: 'Alice',
  sayHi() {
    console.log(this.name);  // 'Alice'
  },
  nested: {
    name: 'Bob',
    sayHi() {
      console.log(this.name);  // 'Bob'（this 指向 nested）
    }
  }
};

obj.sayHi();
obj.nested.sayHi();

// 隐式绑定丢失
const fn = obj.sayHi;
fn();  // undefined

// call/apply/bind
const person = { name: 'Charlie' };
obj.sayHi.call(person);  // 'Charlie'

// 构造函数
function Person(name) {
  this.name = name;
  console.log(this);  // Person { name: 'David' }
}
new Person('David');

// 箭头函数
const arrowObj = {
  name: 'Eve',
  sayHi: () => {
    console.log(this.name);  // undefined（this 指向外层）
  },
  nested: function() {
    const arrow = () => {
      console.log(this.name);  // 'Eve'（继承 nested 的 this）
    };
    arrow();
  }
};

arrowObj.sayHi();
arrowObj.nested();
```

### 实战：实现一个支持链式调用的计算器

```javascript
class Calculator {
  constructor(value = 0) {
    this.value = value;
  }
  
  add(num) {
    this.value += num;
    return this;  // 返回 this 支持链式调用
  }
  
  subtract(num) {
    this.value -= num;
    return this;
  }
  
  multiply(num) {
    this.value *= num;
    return this;
  }
  
  divide(num) {
    this.value /= num;
    return this;
  }
  
  getResult() {
    return this.value;
  }
}

// 链式调用
const result = new Calculator(10)
  .add(5)
  .multiply(2)
  .subtract(10)
  .divide(2)
  .getResult();

console.log(result);  // 10
```

## 🔗 相关知识点

- [闭包](./closure.md)
- [原型与原型链](./prototype-chain.md)
- [call、apply、bind 实现](./call-apply-bind.md)

## 📚 参考资料

- [MDN - this](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)
- [MDN - 箭头函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
- [You Don't Know JS - this & Object Prototypes](https://github.com/getify/You-Dont-Know-JS/tree/1st-ed/this%20%26%20object%20prototypes)
