---
title: JavaScript 原型与原型链详解 - __proto__ vs prototype 区别
description: 深入理解 JavaScript 原型链机制，掌握 __proto__ 和 prototype 的区别，学习 ES5 寄生组合继承和 ES6 class extends 的实现原理
keywords: JavaScript原型链, prototype, __proto__, 继承, ES6 class, 寄生组合继承, 前端面试题
date: 2025-11-27
category: JavaScript
difficulty: 中级
tags: [原型, 原型链, 继承, __proto__, prototype, class]
related: [data-types.md, this-binding.md]
hasCode: true
---

# 题目

请详细说明 JavaScript 的原型与原型链，以及如何实现继承（ES5 寄生组合继承 vs ES6 class extends）。

## 📝 标准答案

### 核心要点

1. **prototype（原型对象）**：
   - 每个函数都有 `prototype` 属性
   - 指向一个对象，包含共享的属性和方法
   - 用于实现继承

2. **__proto__（原型链）**：
   - 每个对象都有 `__proto__` 属性
   - 指向创建该对象的构造函数的 `prototype`
   - 形成原型链，用于属性查找

3. **原型链查找机制**：
   - 访问对象属性时，先在自身查找
   - 找不到则沿着 `__proto__` 向上查找
   - 直到 `Object.prototype`，再找不到返回 `undefined`

4. **继承方式**：
   - ES5：寄生组合继承（最佳）
   - ES6：class extends（语法糖）

### 详细说明

#### prototype vs __proto__

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHi = function() {
  console.log(`Hi, I'm ${this.name}`);
};

const alice = new Person('Alice');

// prototype：函数的属性，指向原型对象
console.log(Person.prototype);  // { sayHi: f, constructor: Person }

// __proto__：对象的属性，指向构造函数的 prototype
console.log(alice.__proto__ === Person.prototype);  // true

// 原型链
console.log(alice.__proto__.__proto__ === Object.prototype);  // true
console.log(alice.__proto__.__proto__.__proto__);  // null
```

**关系图：**
```
alice
  ├─ name: 'Alice'
  └─ __proto__ → Person.prototype
                   ├─ sayHi: function
                   ├─ constructor: Person
                   └─ __proto__ → Object.prototype
                                    ├─ toString: function
                                    ├─ valueOf: function
                                    └─ __proto__ → null
```

## 🧠 深度理解

### 原型链的完整图解

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function() {
  console.log(`${this.name} is eating`);
};

function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}

// 设置原型链
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  console.log('Woof!');
};

const dog = new Dog('Buddy', 'Golden');

// 原型链查找过程
console.log(dog.name);        // 'Buddy' - 在 dog 自身找到
console.log(dog.breed);       // 'Golden' - 在 dog 自身找到
dog.bark();                   // 'Woof!' - 在 Dog.prototype 找到
dog.eat();                    // 'Buddy is eating' - 在 Animal.prototype 找到
console.log(dog.toString());  // '[object Object]' - 在 Object.prototype 找到

// 原型链结构
console.log(dog.__proto__ === Dog.prototype);                    // true
console.log(dog.__proto__.__proto__ === Animal.prototype);       // true
console.log(dog.__proto__.__proto__.__proto__ === Object.prototype);  // true
console.log(dog.__proto__.__proto__.__proto__.__proto__);        // null
```

### ES5 继承方式对比

#### 1. 原型链继承（不推荐）

```javascript
function Parent() {
  this.colors = ['red', 'blue'];
}

function Child() {}
Child.prototype = new Parent();

const child1 = new Child();
const child2 = new Child();

child1.colors.push('green');
console.log(child2.colors);  // ['red', 'blue', 'green'] ❌ 引用类型被共享
```

**缺点**：
- 引用类型属性被所有实例共享
- 无法向父类构造函数传参

#### 2. 构造函数继承（不推荐）

```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}

Parent.prototype.sayHi = function() {
  console.log('Hi');
};

function Child(name) {
  Parent.call(this, name);
}

const child = new Child('Alice');
console.log(child.colors);  // ['red', 'blue'] ✅ 不共享
child.sayHi();  // TypeError ❌ 无法继承原型方法
```

**缺点**：
- 无法继承父类原型上的方法
- 每次创建实例都会创建方法，浪费内存

#### 3. 组合继承（不推荐）

```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}

Parent.prototype.sayHi = function() {
  console.log('Hi');
};

function Child(name, age) {
  Parent.call(this, name);  // 第二次调用 Parent
  this.age = age;
}

Child.prototype = new Parent();  // 第一次调用 Parent ❌
Child.prototype.constructor = Child;

const child = new Child('Alice', 10);
```

**缺点**：
- 调用了两次父类构造函数
- 子类原型上有多余的父类实例属性

#### 4. 寄生组合继承（✅ 推荐）

```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}

Parent.prototype.sayHi = function() {
  console.log(`Hi, I'm ${this.name}`);
};

function Child(name, age) {
  Parent.call(this, name);  // 继承实例属性
  this.age = age;
}

// 继承原型方法（关键：使用 Object.create）
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

Child.prototype.sayAge = function() {
  console.log(`I'm ${this.age} years old`);
};

// 测试
const child1 = new Child('Alice', 10);
const child2 = new Child('Bob', 12);

child1.colors.push('green');
console.log(child1.colors);  // ['red', 'blue', 'green']
console.log(child2.colors);  // ['red', 'blue'] ✅ 不共享

child1.sayHi();   // 'Hi, I'm Alice' ✅ 继承原型方法
child1.sayAge();  // 'I'm 10 years old'
```

**优点**：
- 只调用一次父类构造函数
- 避免在子类原型上创建多余属性
- 保持原型链不变
- 能正常使用 instanceof 和 isPrototypeOf

**封装继承函数：**
```javascript
function inherit(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype);
  Child.prototype.constructor = Child;
}

// 使用
function Animal(name) {
  this.name = name;
}

function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}

inherit(Dog, Animal);
```

### ES6 Class 继承

```javascript
class Parent {
  constructor(name) {
    this.name = name;
    this.colors = ['red', 'blue'];
  }
  
  sayHi() {
    console.log(`Hi, I'm ${this.name}`);
  }
  
  // 静态方法
  static create(name) {
    return new Parent(name);
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name);  // 必须先调用 super
    this.age = age;
  }
  
  sayAge() {
    console.log(`I'm ${this.age} years old`);
  }
  
  // 重写父类方法
  sayHi() {
    super.sayHi();  // 调用父类方法
    console.log(`And I'm ${this.age} years old`);
  }
}

// 测试
const child = new Child('Alice', 10);
child.sayHi();
// 输出：
// Hi, I'm Alice
// And I'm 10 years old

// 静态方法继承
console.log(Child.create('Bob'));  // Parent { name: 'Bob', colors: [...] }
```

**ES6 Class 的本质：**
```javascript
// class 只是语法糖，本质还是基于原型
console.log(typeof Child);  // 'function'
console.log(Child.prototype.constructor === Child);  // true

// 等价于 ES5 的寄生组合继承
console.log(Object.getPrototypeOf(Child.prototype) === Parent.prototype);  // true
```

### 常见误区

1. **误区：直接赋值父类原型**
   ```javascript
   // ❌ 错误
   Child.prototype = Parent.prototype;
   // 问题：修改子类原型会影响父类
   
   // ✅ 正确
   Child.prototype = Object.create(Parent.prototype);
   ```

2. **误区：忘记修复 constructor**
   ```javascript
   Child.prototype = Object.create(Parent.prototype);
   // ❌ 此时 Child.prototype.constructor === Parent
   
   // ✅ 正确
   Child.prototype.constructor = Child;
   ```

3. **误区：在 super() 之前使用 this**
   ```javascript
   class Child extends Parent {
     constructor(name, age) {
       this.age = age;  // ❌ ReferenceError
       super(name);
     }
   }
   
   // ✅ 正确
   class Child extends Parent {
     constructor(name, age) {
       super(name);
       this.age = age;
     }
   }
   ```

### 进阶知识

#### 1. 原型链的性能优化

```javascript
// ❌ 不好：每次创建实例都创建方法
function Person(name) {
  this.name = name;
  this.sayHi = function() {
    console.log(`Hi, I'm ${this.name}`);
  };
}

// ✅ 好：方法放在原型上，所有实例共享
function Person(name) {
  this.name = name;
}

Person.prototype.sayHi = function() {
  console.log(`Hi, I'm ${this.name}`);
};
```

#### 2. 使用 Object.create 创建纯净对象

```javascript
// 普通对象有原型链
const obj1 = {};
console.log(obj1.toString);  // function toString() { [native code] }

// 纯净对象没有原型链
const obj2 = Object.create(null);
console.log(obj2.toString);  // undefined
console.log(obj2.__proto__);  // undefined

// 用途：作为 Map 使用，避免原型污染
const map = Object.create(null);
map['toString'] = 'custom value';  // 不会覆盖原型方法
```

#### 3. 检查原型关系

```javascript
function Person() {}
const person = new Person();

// 方法1：instanceof
console.log(person instanceof Person);  // true
console.log(person instanceof Object);  // true

// 方法2：isPrototypeOf
console.log(Person.prototype.isPrototypeOf(person));  // true
console.log(Object.prototype.isPrototypeOf(person));  // true

// 方法3：Object.getPrototypeOf
console.log(Object.getPrototypeOf(person) === Person.prototype);  // true

// 方法4：hasOwnProperty（检查自身属性）
person.name = 'Alice';
console.log(person.hasOwnProperty('name'));  // true
console.log(person.hasOwnProperty('toString'));  // false
```

## 💡 面试回答技巧

### 🎯 一句话回答（快速版）

> 每个对象都有 `__proto__` 指向其构造函数的 `prototype`，形成原型链。访问属性时沿着原型链向上查找，直到 Object.prototype。这是 JavaScript 实现继承的基础。

### 📣 口语化回答（推荐）

面试时可以这样回答：

> "原型链是 JavaScript 实现继承的核心机制。
>
> 首先要理解两个属性：**prototype** 是函数才有的，指向原型对象；**__proto__** 是所有对象都有的，指向创建这个对象的构造函数的 prototype。
>
> 比如 `const arr = []`，arr 的 `__proto__` 指向 `Array.prototype`，`Array.prototype` 的 `__proto__` 又指向 `Object.prototype`，`Object.prototype` 的 `__proto__` 是 null。这样就形成了一条链，叫原型链。
>
> 原型链的作用是**属性查找**。当我们访问对象的属性时，先在对象自身找，找不到就沿着 `__proto__` 往上找，一直找到 `Object.prototype`，还找不到就返回 undefined。
>
> 继承的话，ES5 最佳实践是**寄生组合继承**，用 `Object.create()` 继承原型，用 `call()` 继承属性。ES6 的 `class extends` 写法更简洁，但本质上还是基于原型链的语法糖。"

### 推荐回答顺序

1. **先解释概念**：
   - "每个函数都有 prototype 属性，指向原型对象"
   - "每个对象都有 __proto__ 属性，指向构造函数的 prototype"
   - "通过 __proto__ 形成原型链，实现属性查找和继承"

2. **再说查找机制**：
   - "访问对象属性时，先在自身查找"
   - "找不到则沿着原型链向上查找"
   - "直到 Object.prototype，找不到返回 undefined"

3. **然后说继承方式**：
   - "ES5 最佳方式是寄生组合继承"
   - "ES6 使用 class extends，本质是语法糖"

4. **最后画图或写代码**：
   - 画出原型链关系图
   - 或手写寄生组合继承

### 重点强调

- ✅ **prototype 和 __proto__ 的区别**
- ✅ **原型链的查找机制**
- ✅ **寄生组合继承的优势**
- ✅ **ES6 class 只是语法糖**

### 可能的追问

**Q1: new 操作符做了什么？**

A:
```javascript
function myNew(Constructor, ...args) {
  // 1. 创建空对象，原型指向构造函数的 prototype
  const obj = Object.create(Constructor.prototype);
  
  // 2. 执行构造函数，this 指向新对象
  const result = Constructor.apply(obj, args);
  
  // 3. 如果构造函数返回对象，则返回该对象，否则返回新对象
  return result instanceof Object ? result : obj;
}

// 测试
function Person(name) {
  this.name = name;
}

const person = myNew(Person, 'Alice');
console.log(person.name);  // 'Alice'
console.log(person instanceof Person);  // true
```

**Q2: 如何实现多重继承？**

A: JavaScript 不支持多重继承，但可以通过 Mixin 模式实现：
```javascript
// Mixin 函数
function mixin(target, ...sources) {
  Object.assign(target.prototype, ...sources);
}

// 定义多个功能模块
const canEat = {
  eat() {
    console.log('Eating');
  }
};

const canWalk = {
  walk() {
    console.log('Walking');
  }
};

const canSwim = {
  swim() {
    console.log('Swimming');
  }
};

// 组合多个功能
function Person() {}
mixin(Person, canEat, canWalk);

function Fish() {}
mixin(Fish, canEat, canSwim);

const person = new Person();
person.eat();   // 'Eating'
person.walk();  // 'Walking'

const fish = new Fish();
fish.eat();   // 'Eating'
fish.swim();  // 'Swimming'
```

**Q3: Object.create() 和 new 的区别？**

A:
```javascript
// Object.create()：创建对象，指定原型
const proto = { sayHi() { console.log('Hi'); } };
const obj1 = Object.create(proto);
obj1.sayHi();  // 'Hi'

// new：创建对象，执行构造函数
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  console.log('Hi');
};
const obj2 = new Person('Alice');
obj2.sayHi();  // 'Hi'

// 区别：
// 1. Object.create() 不执行构造函数
// 2. new 会执行构造函数，初始化实例属性
```

**Q4: 如何防止原型被修改？**

A:
```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHi = function() {
  console.log('Hi');
};

// 冻结原型，防止修改
Object.freeze(Person.prototype);

// 尝试修改（静默失败或报错）
Person.prototype.sayBye = function() {
  console.log('Bye');
};

console.log(Person.prototype.sayBye);  // undefined
```

## 💻 代码示例

### 完整的继承实现

```javascript
// ES5 寄生组合继承
function Animal(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}

Animal.prototype.eat = function() {
  console.log(`${this.name} is eating`);
};

Animal.prototype.sleep = function() {
  console.log(`${this.name} is sleeping`);
};

function Dog(name, breed) {
  // 继承实例属性
  Animal.call(this, name);
  this.breed = breed;
}

// 继承原型方法
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// 添加子类方法
Dog.prototype.bark = function() {
  console.log('Woof! Woof!');
};

// 重写父类方法
Dog.prototype.eat = function() {
  console.log(`${this.name} the ${this.breed} is eating`);
};

// 测试
const dog1 = new Dog('Buddy', 'Golden Retriever');
const dog2 = new Dog('Max', 'Husky');

dog1.colors.push('green');
console.log(dog1.colors);  // ['red', 'blue', 'green']
console.log(dog2.colors);  // ['red', 'blue']

dog1.eat();    // 'Buddy the Golden Retriever is eating'
dog1.sleep();  // 'Buddy is sleeping'
dog1.bark();   // 'Woof! Woof!'

console.log(dog1 instanceof Dog);     // true
console.log(dog1 instanceof Animal);  // true
console.log(dog1 instanceof Object);  // true
```

### ES6 Class 完整示例

```javascript
class Animal {
  // 实例属性（新语法）
  colors = ['red', 'blue'];
  
  constructor(name) {
    this.name = name;
  }
  
  eat() {
    console.log(`${this.name} is eating`);
  }
  
  sleep() {
    console.log(`${this.name} is sleeping`);
  }
  
  // 静态方法
  static create(name) {
    return new Animal(name);
  }
  
  // 静态属性
  static kingdom = 'Animalia';
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }
  
  bark() {
    console.log('Woof! Woof!');
  }
  
  // 重写父类方法
  eat() {
    console.log(`${this.name} the ${this.breed} is eating`);
  }
  
  // 调用父类方法
  eatAndSleep() {
    super.eat();
    this.sleep();
  }
  
  // Getter
  get info() {
    return `${this.name} is a ${this.breed}`;
  }
  
  // Setter
  set info(value) {
    const [name, breed] = value.split(' is a ');
    this.name = name;
    this.breed = breed;
  }
}

// 测试
const dog = new Dog('Buddy', 'Golden Retriever');
console.log(dog.info);  // 'Buddy is a Golden Retriever'
dog.info = 'Max is a Husky';
console.log(dog.name);   // 'Max'
console.log(dog.breed);  // 'Husky'

dog.eat();          // 'Max the Husky is eating'
dog.eatAndSleep();  // 'Max is eating' + 'Max is sleeping'

console.log(Dog.kingdom);  // 'Animalia'（继承静态属性）
```

## 🔗 相关知识点

- [数据类型与检测](./data-types.md)
- [this 指向](./this-binding.md)
- [闭包](./closure.md)

## 📚 参考资料

- [MDN - 继承与原型链](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [MDN - Object.create()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
- [MDN - Class](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes)
