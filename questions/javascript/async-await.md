---
title: async/await 原理与应用 - Generator + 自动执行器实现
description: 深入理解 async/await 的底层实现原理，掌握 Generator 函数和自动执行器，学习异步并发控制和错误处理最佳实践
keywords: async await, Generator, Promise, 异步编程, JavaScript面试, 并发控制
date: 2025-11-27
category: JavaScript
difficulty: 中级
tags: [async, await, Promise, Generator, 异步编程]
related: [promise.md, event-loop.md, closure.md]
hasCode: true
---

# 题目

请详细说明 async/await 的原理（Generator + 自动执行器），以及如何使用 async/await 进行异步编程。

## 📝 标准答案

### 核心要点

1. **async/await 是什么**：
   - ES2017 引入的异步编程语法糖
   - 基于 Promise 和 Generator 实现
   - 让异步代码看起来像同步代码

2. **async 函数特点**：
   - 返回值自动包装成 Promise
   - 内部可以使用 await
   - 异常可以用 try/catch 捕获

3. **await 关键字**：
   - 只能在 async 函数内使用
   - 等待 Promise 完成，返回结果
   - 暂停函数执行，不阻塞主线程

4. **底层原理**：
   - Generator + 自动执行器
   - 状态机模式
   - 微任务队列

### 详细说明

#### 基本用法

```javascript
// Promise 方式
function fetchUser() {
  return fetch('/api/user')
    .then(res => res.json())
    .then(data => {
      console.log(data);
      return data;
    })
    .catch(err => {
      console.error(err);
    });
}

// async/await 方式（更清晰）
async function fetchUser() {
  try {
    const res = await fetch('/api/user');
    const data = await res.json();
    console.log(data);
    return data;
  } catch (err) {
    console.error(err);
  }
}
```

#### async 函数返回值

```javascript
// 返回值自动包装成 Promise
async function foo() {
  return 'hello';
}

// 等价于
function foo() {
  return Promise.resolve('hello');
}

// 使用
foo().then(value => {
  console.log(value);  // 'hello'
});

// 抛出异常
async function bar() {
  throw new Error('error');
}

// 等价于
function bar() {
  return Promise.reject(new Error('error'));
}

// 使用
bar().catch(err => {
  console.error(err);  // Error: error
});
```

## 🧠 深度理解

### async/await 的底层原理

#### 1. Generator 基础

```javascript
// Generator 函数
function* gen() {
  const a = yield 1;
  console.log('a:', a);
  const b = yield 2;
  console.log('b:', b);
  return 3;
}

// 手动执行
const g = gen();
console.log(g.next());      // { value: 1, done: false }
console.log(g.next('x'));   // a: x, { value: 2, done: false }
console.log(g.next('y'));   // b: y, { value: 3, done: true }
```

#### 2. Generator + Promise

```javascript
function* fetchUser() {
  const res = yield fetch('/api/user');
  const data = yield res.json();
  return data;
}

// 手动执行（繁琐）
const g = fetchUser();
const p1 = g.next().value;  // fetch Promise

p1.then(res => {
  const p2 = g.next(res).value;  // json Promise
  
  p2.then(data => {
    g.next(data);  // 完成
  });
});
```

#### 3. 自动执行器

```javascript
// 实现一个自动执行器
function run(gen) {
  return new Promise((resolve, reject) => {
    const g = gen();
    
    function step(nextFn) {
      let next;
      
      try {
        next = nextFn();
      } catch (err) {
        return reject(err);
      }
      
      if (next.done) {
        return resolve(next.value);
      }
      
      // 将 yield 的值包装成 Promise
      Promise.resolve(next.value).then(
        value => step(() => g.next(value)),
        err => step(() => g.throw(err))
      );
    }
    
    step(() => g.next());
  });
}

// 使用
function* fetchUser() {
  const res = yield fetch('/api/user');
  const data = yield res.json();
  return data;
}

run(fetchUser).then(data => {
  console.log(data);
});

// async/await 就是这个模式的语法糖
async function fetchUser() {
  const res = await fetch('/api/user');
  const data = await res.json();
  return data;
}
```

### async/await 与 Promise 的对比

```javascript
// Promise 链式调用
function getUser() {
  return fetch('/api/user')
    .then(res => res.json())
    .then(user => {
      return fetch(`/api/posts/${user.id}`);
    })
    .then(res => res.json())
    .then(posts => {
      return { user, posts };  // ❌ user 不在作用域内
    });
}

// async/await（更清晰）
async function getUser() {
  const userRes = await fetch('/api/user');
  const user = await userRes.json();
  
  const postsRes = await fetch(`/api/posts/${user.id}`);
  const posts = await postsRes.json();
  
  return { user, posts };  // ✅ 变量在作用域内
}
```

### 错误处理

```javascript
// Promise 方式
function fetchData() {
  return fetch('/api/data')
    .then(res => res.json())
    .catch(err => {
      console.error('Fetch error:', err);
      throw err;
    });
}

// async/await 方式
async function fetchData() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Fetch error:', err);
    throw err;
  }
}

// 多个 await 的错误处理
async function fetchMultiple() {
  try {
    const user = await fetchUser();
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    return { user, posts, comments };
  } catch (err) {
    // 任何一个 await 失败都会被捕获
    console.error('Error:', err);
  }
}

// 单独处理每个错误
async function fetchMultiple() {
  let user, posts, comments;
  
  try {
    user = await fetchUser();
  } catch (err) {
    console.error('User error:', err);
    return;
  }
  
  try {
    posts = await fetchPosts(user.id);
  } catch (err) {
    console.error('Posts error:', err);
    return;
  }
  
  try {
    comments = await fetchComments(posts[0].id);
  } catch (err) {
    console.error('Comments error:', err);
  }
  
  return { user, posts, comments };
}
```

### 并发执行

```javascript
// ❌ 串行执行（慢）
async function fetchAll() {
  const user = await fetchUser();      // 等待 1s
  const posts = await fetchPosts();    // 等待 1s
  const comments = await fetchComments();  // 等待 1s
  return { user, posts, comments };    // 总共 3s
}

// ✅ 并发执行（快）
async function fetchAll() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ]);
  return { user, posts, comments };  // 总共 1s
}

// 部分并发
async function fetchAll() {
  // 先并发获取 user 和 posts
  const [user, posts] = await Promise.all([
    fetchUser(),
    fetchPosts()
  ]);
  
  // 再获取 comments（依赖 posts）
  const comments = await fetchComments(posts[0].id);
  
  return { user, posts, comments };
}
```

### 循环中的 async/await

```javascript
const urls = ['/api/1', '/api/2', '/api/3'];

// ❌ forEach 不支持 await
urls.forEach(async url => {
  const res = await fetch(url);  // 不会等待
  console.log(res);
});

// ✅ for...of 串行执行
async function fetchSequential() {
  for (const url of urls) {
    const res = await fetch(url);
    console.log(res);
  }
}

// ✅ map + Promise.all 并发执行
async function fetchConcurrent() {
  const promises = urls.map(url => fetch(url));
  const results = await Promise.all(promises);
  console.log(results);
}

// ✅ for 循环串行执行
async function fetchSequential() {
  for (let i = 0; i < urls.length; i++) {
    const res = await fetch(urls[i]);
    console.log(res);
  }
}

// ✅ reduce 串行执行
async function fetchSequential() {
  await urls.reduce(async (prev, url) => {
    await prev;
    const res = await fetch(url);
    console.log(res);
  }, Promise.resolve());
}
```

### 常见误区

1. **误区：忘记 await**
   ```javascript
   // ❌ 错误：没有 await
   async function fetchData() {
     const data = fetch('/api/data');  // 返回 Promise，不是数据
     console.log(data);  // Promise { <pending> }
   }
   
   // ✅ 正确
   async function fetchData() {
     const data = await fetch('/api/data');
     console.log(data);  // Response 对象
   }
   ```

2. **误区：在非 async 函数中使用 await**
   ```javascript
   // ❌ 错误
   function fetchData() {
     const data = await fetch('/api/data');  // SyntaxError
   }
   
   // ✅ 正确
   async function fetchData() {
     const data = await fetch('/api/data');
   }
   
   // ✅ 顶层 await（ES2022，模块中）
   const data = await fetch('/api/data');
   ```

3. **误区：串行执行独立的异步操作**
   ```javascript
   // ❌ 慢：串行执行
   async function fetchAll() {
     const user = await fetchUser();
     const posts = await fetchPosts();  // 不依赖 user，但要等待
     return { user, posts };
   }
   
   // ✅ 快：并发执行
   async function fetchAll() {
     const [user, posts] = await Promise.all([
       fetchUser(),
       fetchPosts()
     ]);
     return { user, posts };
   }
   ```

4. **误区：忘记处理错误**
   ```javascript
   // ❌ 错误未处理
   async function fetchData() {
     const data = await fetch('/api/data');  // 可能失败
     return data;
   }
   
   // ✅ 正确
   async function fetchData() {
     try {
       const data = await fetch('/api/data');
       return data;
     } catch (err) {
       console.error(err);
       throw err;
     }
   }
   ```

### 进阶知识

#### 1. 实现 sleep 函数

```javascript
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 使用
async function demo() {
  console.log('Start');
  await sleep(2000);
  console.log('After 2 seconds');
}
```

#### 2. 实现超时控制

```javascript
function timeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), ms);
    })
  ]);
}

// 使用
async function fetchWithTimeout() {
  try {
    const data = await timeout(fetch('/api/data'), 5000);
    return data;
  } catch (err) {
    console.error('Request timeout or failed:', err);
  }
}
```

#### 3. 实现重试机制

```javascript
async function retry(fn, times = 3, delay = 1000) {
  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === times - 1) throw err;
      await sleep(delay);
      console.log(`Retry ${i + 1}/${times}`);
    }
  }
}

// 使用
async function fetchData() {
  return await retry(() => fetch('/api/data'), 3, 1000);
}
```

#### 4. 实现并发控制

```javascript
async function concurrentLimit(tasks, limit) {
  const results = [];
  const executing = [];
  
  for (const task of tasks) {
    const p = Promise.resolve().then(() => task());
    results.push(p);
    
    if (limit <= tasks.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  
  return Promise.all(results);
}

// 使用
const tasks = urls.map(url => () => fetch(url));
const results = await concurrentLimit(tasks, 3);  // 最多 3 个并发
```

## 💡 面试回答技巧

### 🎯 一句话回答（快速版）

> async/await 是 Promise 的语法糖，让异步代码写起来像同步代码。async 函数返回 Promise，await 等待 Promise 完成并返回结果，错误处理用 try/catch。

### 📣 口语化回答（推荐）

面试时可以这样回答：

> "async/await 是 ES2017 引入的，本质上是 Promise 的语法糖，让异步代码写起来更像同步代码。
>
> **async** 关键字用来声明一个异步函数，这个函数会自动返回一个 Promise。函数里 return 的值会被包装成 Promise.resolve()，抛出的错误会被包装成 Promise.reject()。
>
> **await** 只能在 async 函数里用，它会等待后面的 Promise 完成，然后返回结果。在等待期间，函数会暂停执行，但不会阻塞主线程，其他代码可以继续跑。
>
> 错误处理的话，用 **try/catch** 就行，比 Promise 的 catch 更直观。
>
> 有个要注意的点是**并发优化**。如果有多个独立的异步操作，不要一个一个 await，那样是串行的。应该用 `Promise.all` 并发执行，比如 `await Promise.all([fetch1(), fetch2()])`。
>
> 底层原理的话，async/await 是基于 Generator 和自动执行器实现的。await 相当于 yield，遇到 await 就暂停，Promise 完成后再继续执行。"

### 推荐回答顺序

1. **先说是什么**：
   - "async/await 是 ES2017 引入的异步编程语法糖"
   - "基于 Promise 和 Generator 实现"

2. **再说特点**：
   - "async 函数返回 Promise"
   - "await 等待 Promise 完成"
   - "让异步代码看起来像同步代码"

3. **然后说原理**：
   - "底层是 Generator + 自动执行器"
   - "await 暂停函数执行，等待 Promise 完成"
   - "通过微任务队列实现异步"

4. **最后说应用**：
   - "错误处理更方便（try/catch）"
   - "避免回调地狱"
   - "注意并发执行优化"

### 重点强调

- ✅ **async/await 是语法糖，本质是 Promise**
- ✅ **await 只能在 async 函数内使用**
- ✅ **独立的异步操作应该并发执行**
- ✅ **错误处理用 try/catch**

### 可能的追问

**Q1: async/await 和 Promise 的区别？**

A:
- `async/await` 是 `Promise` 的语法糖
- `async/await` 代码更清晰，像同步代码
- `async/await` 错误处理更方便（try/catch）
- `Promise` 更灵活，支持链式调用

**Q2: await 会阻塞主线程吗？**

A:
- 不会阻塞主线程
- `await` 只是暂停当前 async 函数的执行
- 其他代码可以继续执行
- 类似于 `yield`，是协程的概念

**Q3: 如何实现 async/await？**

A: 见上面的自动执行器实现，核心是：
1. Generator 函数提供暂停/恢复能力
2. 自动执行器递归调用 next()
3. 将 yield 的值包装成 Promise
4. Promise 完成后继续执行

**Q4: 顶层 await 是什么？**

A:
```javascript
// ES2022：模块顶层可以使用 await
const data = await fetch('/api/data');

// 等价于
export default (async () => {
  const data = await fetch('/api/data');
  // ...
})();
```

## 💻 代码示例

### 综合示例：用户数据获取

```javascript
// 模拟 API
const api = {
  fetchUser: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, name: 'Alice', age: 25 });
      }, 1000);
    });
  },
  
  fetchPosts: (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, title: 'Post 1', userId },
          { id: 2, title: 'Post 2', userId }
        ]);
      }, 1000);
    });
  },
  
  fetchComments: (postId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, text: 'Comment 1', postId },
          { id: 2, text: 'Comment 2', postId }
        ]);
      }, 1000);
    });
  }
};

// ❌ Promise 方式（回调地狱）
function getUserData(userId) {
  return api.fetchUser(userId)
    .then(user => {
      return api.fetchPosts(user.id)
        .then(posts => {
          return api.fetchComments(posts[0].id)
            .then(comments => {
              return { user, posts, comments };
            });
        });
    })
    .catch(err => {
      console.error(err);
    });
}

// ✅ async/await 方式（清晰）
async function getUserData(userId) {
  try {
    const user = await api.fetchUser(userId);
    const posts = await api.fetchPosts(user.id);
    const comments = await api.fetchComments(posts[0].id);
    return { user, posts, comments };
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// ✅ 优化：并发获取（更快）
async function getUserDataOptimized(userId) {
  try {
    const user = await api.fetchUser(userId);
    
    // 并发获取 posts 和其他数据
    const posts = await api.fetchPosts(user.id);
    
    // 获取所有 posts 的 comments（并发）
    const commentsPromises = posts.map(post => 
      api.fetchComments(post.id)
    );
    const commentsArrays = await Promise.all(commentsPromises);
    
    // 合并 comments
    const comments = commentsArrays.flat();
    
    return { user, posts, comments };
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// 测试
getUserDataOptimized(1).then(data => {
  console.log(data);
});
```

### 实战：实现一个请求队列

```javascript
class RequestQueue {
  constructor(limit = 3) {
    this.limit = limit;
    this.queue = [];
    this.running = 0;
  }
  
  async add(fn) {
    // 如果达到并发限制，等待
    while (this.running >= this.limit) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    
    this.running++;
    
    try {
      return await fn();
    } finally {
      this.running--;
      
      // 通知下一个任务
      const resolve = this.queue.shift();
      if (resolve) resolve();
    }
  }
}

// 使用
const queue = new RequestQueue(3);

const urls = Array.from({ length: 10 }, (_, i) => `/api/${i}`);

async function fetchAll() {
  const promises = urls.map(url => 
    queue.add(() => fetch(url))
  );
  
  const results = await Promise.all(promises);
  console.log(results);
}

fetchAll();
```

## 🔗 相关知识点

- [Promise 详解](./promise.md)
- [事件循环](./event-loop.md)
- [Generator 函数](./generator.md)

## 📚 参考资料

- [MDN - async function](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN - await](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/await)
- [ES2017 - Async Functions](https://tc39.es/ecma262/#sec-async-function-definitions)
