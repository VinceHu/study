---
title: Promise详解
date: 2025-11-20
category: JavaScript
difficulty: 中级
tags: [Promise, 异步, ES6, 微任务]
related: [event-loop.md, async-await.md]
hasCode: true
---

# 题目

请详细解释什么是Promise，以及它解决了什么问题？

## 📝 标准答案

### 核心要点

1. **定义**：Promise是ES6引入的异步编程解决方案，代表一个异步操作的最终完成或失败
2. **三种状态**：pending（进行中）、fulfilled（已成功）、rejected（已失败）
3. **状态不可逆**：状态一旦改变就不会再变
4. **解决的问题**：回调地狱、错误处理困难、代码可读性差

### 详细说明

#### Promise的三种状态

```javascript
// pending（进行中）
const promise = new Promise((resolve, reject) => {
  // 异步操作
});

// fulfilled（已成功）
const promise = Promise.resolve('成功');

// rejected（已失败）
const promise = Promise.reject('失败');
```

#### 基本用法

```javascript
const promise = new Promise((resolve, reject) => {
  // 异步操作
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve('操作成功'); // 状态变为fulfilled
    } else {
      reject('操作失败');  // 状态变为rejected
    }
  }, 1000);
});

// 使用then处理成功，catch处理失败
promise
  .then(result => {
    console.log(result); // '操作成功'
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
    console.log('无论成功失败都会执行');
  });
```

#### 解决回调地狱

**回调地狱示例：**
```javascript
// 回调地狱（Callback Hell）
getData(function(a) {
  getMoreData(a, function(b) {
    getMoreData(b, function(c) {
      getMoreData(c, function(d) {
        console.log(d);
      });
    });
  });
});
```

**Promise链式调用：**
```javascript
// 使用Promise
getData()
  .then(a => getMoreData(a))
  .then(b => getMoreData(b))
  .then(c => getMoreData(c))
  .then(d => console.log(d))
  .catch(error => console.error(error));
```

## 🧠 深度理解

### 底层原理

#### 1. Promise的状态机

```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';  // 初始状态
    this.value = undefined;  // 成功的值
    this.reason = undefined; // 失败的原因
    this.onFulfilledCallbacks = []; // 成功回调队列
    this.onRejectedCallbacks = [];  // 失败回调队列

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    // 实现链式调用
    return new MyPromise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        try {
          const result = onFulfilled(this.value);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }
      if (this.state === 'rejected') {
        try {
          const result = onRejected(this.reason);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }
      if (this.state === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          try {
            const result = onFulfilled(this.value);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
        this.onRejectedCallbacks.push(() => {
          try {
            const result = onRejected(this.reason);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      }
    });
  }
}
```

#### 2. Promise是微任务

```javascript
console.log('1');

setTimeout(() => {
  console.log('2'); // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('3'); // 微任务
});

console.log('4');

// 输出: 1 4 3 2
// 微任务优先于宏任务执行
```

#### 3. Promise的链式调用

```javascript
Promise.resolve(1)
  .then(value => {
    console.log(value); // 1
    return value + 1;
  })
  .then(value => {
    console.log(value); // 2
    return value + 1;
  })
  .then(value => {
    console.log(value); // 3
  });

// 每个then返回一个新的Promise
```

### 常见误区

- **误区1**：认为Promise是同步的
  - 正解：Promise构造函数是同步的，但then/catch/finally是异步的（微任务）
  
- **误区2**：认为Promise可以取消
  - ��解：Promise一旦创建就会执行，无法取消（可以用AbortController配合fetch）
  
- **误区3**：忘记return导致链式调用断裂
  - 正解：then中必须return才能将值传递给下一个then
  
- **误区4**：没有catch导致错误被吞掉
  - 正解：Promise链末尾一定要加catch处理错误

### 进阶知识

#### Promise静态方法

**1. Promise.all() - 全部成功才成功**
```javascript
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.resolve(3);

Promise.all([p1, p2, p3])
  .then(results => {
    console.log(results); // [1, 2, 3]
  })
  .catch(error => {
    console.error('有一个失败了', error);
  });

// 应用场景：并发请求多个接口，等待全部完成
```

**2. Promise.race() - 第一个完成就返回**
```javascript
const p1 = new Promise(resolve => setTimeout(() => resolve('慢'), 1000));
const p2 = new Promise(resolve => setTimeout(() => resolve('快'), 500));

Promise.race([p1, p2])
  .then(result => {
    console.log(result); // '快'
  });

// 应用场景：请求超时控制
const timeout = new Promise((_, reject) => 
  setTimeout(() => reject('超时'), 5000)
);
Promise.race([fetchData(), timeout]);
```

**3. Promise.allSettled() - 等待全部完成（无论成功失败）**
```javascript
const p1 = Promise.resolve(1);
const p2 = Promise.reject('错误');
const p3 = Promise.resolve(3);

Promise.allSettled([p1, p2, p3])
  .then(results => {
    console.log(results);
    // [
    //   { status: 'fulfilled', value: 1 },
    //   { status: 'rejected', reason: '错误' },
    //   { status: 'fulfilled', value: 3 }
    // ]
  });

// 应用场景：批量操作，需要知道每个操作的结果
```

**4. Promise.any() - 第一个成功就返回**
```javascript
const p1 = Promise.reject('错误1');
const p2 = Promise.resolve('成功');
const p3 = Promise.reject('错误2');

Promise.any([p1, p2, p3])
  .then(result => {
    console.log(result); // '成功'
  })
  .catch(error => {
    console.error('全部失败', error);
  });

// 应用场景：多个备用资源，只要有一个成功即可
```

#### 错误处理最佳实践

```javascript
// 方式1：catch捕获
promise
  .then(result => {
    // 处理成功
  })
  .catch(error => {
    // 处理错误
  });

// 方式2：then的第二个参数
promise.then(
  result => {
    // 处理成功
  },
  error => {
    // 处理错误
  }
);

// 推荐方式1，因为catch可以捕获then中的错误
```

#### Promise与async/await

```javascript
// Promise写法
function getData() {
  return fetch('/api/data')
    .then(response => response.json())
    .then(data => {
      console.log(data);
      return data;
    })
    .catch(error => {
      console.error(error);
    });
}

// async/await写法（更简洁）
async function getData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
}
```


## 💡 面试回答技巧

### 🎯 一句话回答（快速版）

> Promise 是异步编程的解决方案，有三种状态（pending、fulfilled、rejected），通过 then 链式调用解决回调地狱问题，是微任务，优先于宏任务执行。

### 📣 口语化回答（推荐）

面试时可以这样回答：

> "Promise 是 ES6 引入的异步编程解决方案，用来解决回调地狱的问题。
>
> 它有三种状态：**pending**（进行中）、**fulfilled**（成功）、**rejected**（失败）。状态只能从 pending 变成 fulfilled 或 rejected，而且一旦改变就不可逆。
>
> Promise 的核心是 **then 方法**，它返回一个新的 Promise，所以可以链式调用。这样就把嵌套的回调变成了扁平的链式结构，代码更清晰。
>
> 错误处理用 **catch** 方法，它能捕获前面所有 then 里的错误。最佳实践是在链的最后加一个 catch。
>
> 常用的静态方法有：**Promise.all** 等所有都成功才成功，**Promise.race** 谁先完成用谁的结果，**Promise.allSettled** 等所有都完成不管成功失败。
>
> 还有一点，Promise 的回调是**微任务**，会在当前宏任务执行完后、下一个宏任务之前执行，优先级比 setTimeout 高。
>
> 后来 ES7 又出了 async/await，本质上是 Promise 的语法糖，让异步代码写起来更像同步代码。"

### 推荐回答顺序

1. **先说定义**：Promise是异步编程的解决方案，代表一个异步操作的最终结果
2. **说明三种状态**：pending、fulfilled、rejected，状态不可逆
3. **解决的问题**：回调地狱、错误处理、代码可读性
4. **举例说明**：用代码展示基本用法和链式调用
5. **补充进阶**：Promise.all、race等静态方法

### 重点强调

- 强调Promise是微任务，优先于宏任务执行
- 说明then返回新Promise，支持链式调用
- 提到错误处理的重要性（必须catch）
- 说明与async/await的关系

### 可能的追问

**Q1: Promise解决了什么问题？**

A: 主要解决了三个问题：

1. **回调地狱**：多层嵌套的回调函数难以维护
```javascript
// 回调地狱
getData(a => {
  getMoreData(a, b => {
    getMoreData(b, c => {
      console.log(c);
    });
  });
});

// Promise链式调用
getData()
  .then(a => getMoreData(a))
  .then(b => getMoreData(b))
  .then(c => console.log(c));
```

2. **错误处理困难**：每个回调都要处理错误
3. **代码可读性差**：Promise让异步代码更像同步代码

**Q2: Promise的状态可以改变吗？**

A: Promise的状态只能改变一次，且不可逆：
- pending → fulfilled（通过resolve）
- pending → rejected（通过reject）
- 一旦变为fulfilled或rejected，状态就固定了

```javascript
const promise = new Promise((resolve, reject) => {
  resolve('成功');
  reject('失败'); // 无效，状态已经是fulfilled
  resolve('再次成功'); // 无效，状态不可改变
});

promise.then(value => {
  console.log(value); // '成功'
});
```

**Q3: Promise.all和Promise.race的区别？**

A: 

| 方法 | 返回时机 | 返回值 | 失败处理 |
|------|---------|--------|---------|
| Promise.all | 全部成功 | 所有结果数组 | 一个失败就失败 |
| Promise.race | 第一个完成 | 第一个结果 | 第一个失败就失败 |
| Promise.allSettled | 全部完成 | 所有状态数组 | 不会失败 |
| Promise.any | 第一个成功 | 第一个成功结果 | 全部失败才失败 |

```javascript
// Promise.all - 并发请求，全部成功才成功
Promise.all([api1(), api2(), api3()])
  .then(([data1, data2, data3]) => {
    // 全部成功
  })
  .catch(error => {
    // 有一个失败
  });

// Promise.race - 超时控制
const timeout = new Promise((_, reject) => 
  setTimeout(() => reject('超时'), 5000)
);
Promise.race([fetchData(), timeout]);
```

**Q4: then中return和不return有什么区别？**

A: 

```javascript
// 不return - 下一个then收到undefined
Promise.resolve(1)
  .then(value => {
    console.log(value); // 1
    value + 1; // 没有return
  })
  .then(value => {
    console.log(value); // undefined
  });

// return - 下一个then收到返回值
Promise.resolve(1)
  .then(value => {
    console.log(value); // 1
    return value + 1; // 有return
  })
  .then(value => {
    console.log(value); // 2
  });

// return Promise - 下一个then等待Promise完成
Promise.resolve(1)
  .then(value => {
    return new Promise(resolve => {
      setTimeout(() => resolve(value + 1), 1000);
    });
  })
  .then(value => {
    console.log(value); // 2（1秒后）
  });
```

**Q5: 如何实现Promise的串行执行？**

A: 有几种方法：

```javascript
// 方法1: reduce
const tasks = [task1, task2, task3];
tasks.reduce((promise, task) => {
  return promise.then(task);
}, Promise.resolve());

// 方法2: async/await + for循环
async function runSerial(tasks) {
  for (const task of tasks) {
    await task();
  }
}

// 方法3: 递归
function runSerial(tasks) {
  if (tasks.length === 0) return Promise.resolve();
  const [first, ...rest] = tasks;
  return first().then(() => runSerial(rest));
}
```

**Q6: Promise和async/await的关系？**

A: async/await是Promise的语法糖：

```javascript
// Promise写法
function getData() {
  return fetch('/api')
    .then(res => res.json())
    .then(data => {
      console.log(data);
      return data;
    })
    .catch(error => {
      console.error(error);
    });
}

// async/await写法（本质还是Promise）
async function getData() {
  try {
    const res = await fetch('/api');
    const data = await res.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
}

// async函数返回Promise
const promise = getData();
promise.then(data => console.log(data));
```

**优势：**
- 代码更简洁，更像同步代码
- 错误处理更方便（try/catch）
- 调试更容易

**Q7: 如何取消Promise？**

A: Promise本身不能取消，但可以通过其他方式实现：

```javascript
// 方法1: 使用AbortController（fetch专用）
const controller = new AbortController();
const signal = controller.signal;

fetch('/api', { signal })
  .then(res => res.json())
  .catch(error => {
    if (error.name === 'AbortError') {
      console.log('请求被取消');
    }
  });

// 取消请求
controller.abort();

// 方法2: 包装Promise，添加取消标志
function cancelablePromise(promise) {
  let isCanceled = false;
  
  const wrappedPromise = new Promise((resolve, reject) => {
    promise
      .then(value => {
        if (!isCanceled) resolve(value);
      })
      .catch(error => {
        if (!isCanceled) reject(error);
      });
  });
  
  return {
    promise: wrappedPromise,
    cancel: () => { isCanceled = true; }
  };
}

// 使用
const { promise, cancel } = cancelablePromise(fetchData());
promise.then(data => console.log(data));
cancel(); // 取消
```

### 加分项

- 提到Promise/A+规范
- 说明Promise的微任务特性
- 提到实际项目中的应用（接口请求、图片加载等）
- 说明Promise的性能考虑（避免过度嵌套）
- 提到Promise的替代方案（RxJS、async/await）

## 💻 代码示例

### 基本用法

```javascript
// 创建 Promise
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve('操作成功');
    } else {
      reject('操作失败');
    }
  }, 1000);
});

// 使用 Promise
promise
  .then(result => {
    console.log(result); // '操作成功'
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
    console.log('无论成功失败都会执行');
  });
```

### Promise.all 示例

```javascript
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.resolve(3);

Promise.all([p1, p2, p3])
  .then(results => {
    console.log(results); // [1, 2, 3]
  })
  .catch(error => {
    console.error('有一个失败了', error);
  });
```

### 实际应用场景

**1. 并发请求控制**
```javascript
// 限制并发数量
function limitConcurrency(tasks, limit) {
  let index = 0;
  const results = [];
  
  function run() {
    if (index >= tasks.length) {
      return Promise.resolve();
    }
    
    const task = tasks[index++];
    return task()
      .then(result => {
        results.push(result);
        return run();
      });
  }
  
  const workers = Array(limit).fill(null).map(() => run());
  return Promise.all(workers).then(() => results);
}

// 使用
const tasks = urls.map(url => () => fetch(url));
limitConcurrency(tasks, 3); // 最多3个并发
```

**2. 重试机制**
```javascript
function retry(fn, times = 3, delay = 1000) {
  return fn().catch(error => {
    if (times === 0) {
      return Promise.reject(error);
    }
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(retry(fn, times - 1, delay));
      }, delay);
    });
  });
}

// 使用
retry(() => fetch('/api'), 3, 1000)
  .then(data => console.log(data))
  .catch(error => console.error('重试3次后仍失败', error));
```

**3. 超时控制**
```javascript
function timeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('超时')), ms)
    )
  ]);
}

// 使用
timeout(fetch('/api'), 5000)
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

## 🔗 相关知识点

- [事件循环](./event-loop.md) - Promise是微任务
- [async/await](./async-await.md) - Promise的语法糖
- [闭包](./closure.md) - Promise内部使用闭包

## 📚 参考资料

- [MDN - Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Promise/A+规范](https://promisesaplus.com/)
- [JavaScript Promise迷你书](http://liubin.org/promises-book/)
- [深入理解Promise](https://es6.ruanyifeng.com/#docs/promise)
