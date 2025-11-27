---
title: 跨域 (CORS) 问题与解决方案
date: 2025-11-27
category: 网络
difficulty: 中级
tags: [跨域, CORS, 同源策略, JSONP, 代理]
related: [http-versions.md, security.md]
hasCode: true
---

# 跨域 (CORS) 问题与解决方案

## 📝 标准答案

### 核心要点

1. **同源策略 (Same-Origin Policy)**：
   - 协议、域名、端口三者完全相同才算同源
   - 浏览器的安全机制，防止恶意网站读取其他网站的数据
   - 限制：Cookie、LocalStorage、DOM、AJAX 请求

2. **跨域解决方案**：
   - CORS（跨域资源共享）- 服务器配置响应头
   - JSONP - 利用 script 标签不受同源策略限制
   - 代理服务器 - 服务器端转发请求
   - postMessage - 跨窗口通信
   - WebSocket - 不受同源策略限制

### 详细说明

#### 什么是同源策略

**同源的定义：**

```
协议 + 域名 + 端口 完全相同

示例：
当前页面：https://www.example.com:443/page.html

同源：
https://www.example.com:443/api/data  ✅
https://www.example.com/other.html    ✅（端口默认 443）

不同源：
http://www.example.com/api/data       ❌（协议不同）
https://api.example.com/data          ❌（域名不同）
https://www.example.com:8080/data     ❌（端口不同）
```

**同源策略的限制：**

```javascript
// 1. Cookie、LocalStorage、IndexedDB 无法读取
document.cookie  // 无法访问其他域的 Cookie
localStorage.getItem('key')  // 无法访问其他域的 LocalStorage

// 2. DOM 无法获取
const iframe = document.getElementById('iframe');
iframe.contentDocument  // 跨域 iframe 无法访问

// 3. AJAX 请求无法发送
fetch('https://api.example.com/data')  // 跨域请求被阻止
  .then(res => res.json())
  .catch(err => console.error(err));
```

## 🧠 深度理解

### 解决方案 1：CORS（跨域资源共享）

**简单请求：**

```javascript
// 前端代码
fetch('https://api.example.com/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

```javascript
// 后端代码（Node.js + Express）
app.get('/data', (req, res) => {
  // 设置 CORS 响应头
  res.setHeader('Access-Control-Allow-Origin', 'https://www.example.com');
  // 或允许所有域名
  // res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.json({ message: 'Success' });
});
```

**预检请求（Preflight）：**

当请求满足以下条件时，浏览器会先发送 OPTIONS 请求：
- 使用 PUT、DELETE、PATCH 等方法
- Content-Type 不是 application/x-www-form-urlencoded、multipart/form-data、text/plain
- 自定义请求头

```javascript
// 前端代码
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'value'
  },
  body: JSON.stringify({ name: 'Alice' })
});
```

```
// 浏览器自动发送预检请求
OPTIONS /data HTTP/1.1
Host: api.example.com
Origin: https://www.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, X-Custom-Header
```

```javascript
// 后端处理预检请求
app.options('/data', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.example.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Custom-Header');
  res.setHeader('Access-Control-Max-Age', '86400');  // 预检结果缓存 24 小时
  res.sendStatus(204);
});

// 处理实际请求
app.post('/data', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.example.com');
  res.json({ message: 'Success' });
});
```

**CORS 响应头详解：**

```javascript
// 1. Access-Control-Allow-Origin（必需）
// 指定允许访问的域名
res.setHeader('Access-Control-Allow-Origin', 'https://www.example.com');
// 或允许所有域名（不推荐，不安全）
res.setHeader('Access-Control-Allow-Origin', '*');

// 2. Access-Control-Allow-Methods
// 指定允许的 HTTP 方法
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

// 3. Access-Control-Allow-Headers
// 指定允许的请求头
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Custom-Header');

// 4. Access-Control-Allow-Credentials
// 是否允许发送 Cookie
res.setHeader('Access-Control-Allow-Credentials', 'true');
// 注意：如果设置为 true，Access-Control-Allow-Origin 不能为 *

// 5. Access-Control-Expose-Headers
// 指定浏览器可以访问的响应头
res.setHeader('Access-Control-Expose-Headers', 'X-Custom-Header');

// 6. Access-Control-Max-Age
// 预检请求的缓存时间（秒）
res.setHeader('Access-Control-Max-Age', '86400');
```

**携带 Cookie 的跨域请求：**

```javascript
// 前端代码
fetch('https://api.example.com/data', {
  method: 'GET',
  credentials: 'include'  // 携带 Cookie
})
.then(res => res.json());

// 或使用 XMLHttpRequest
const xhr = new XMLHttpRequest();
xhr.withCredentials = true;  // 携带 Cookie
xhr.open('GET', 'https://api.example.com/data');
xhr.send();
```

```javascript
// 后端代码
app.get('/data', (req, res) => {
  // 必须指定具体域名，不能使用 *
  res.setHeader('Access-Control-Allow-Origin', 'https://www.example.com');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.json({ message: 'Success' });
});
```

### 解决方案 2：JSONP

**原理**：利用 `<script>` 标签不受同源策略限制的特性。

```javascript
// 前端代码
function handleResponse(data) {
  console.log('Received:', data);
}

// 动态创建 script 标签
const script = document.createElement('script');
script.src = 'https://api.example.com/data?callback=handleResponse';
document.body.appendChild(script);

// 封装 JSONP 函数
function jsonp(url, callback) {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonp_${Date.now()}_${Math.random().toString(36).substr(2)}`;
    
    window[callbackName] = (data) => {
      resolve(data);
      delete window[callbackName];
      document.body.removeChild(script);
    };
    
    const script = document.createElement('script');
    script.src = `${url}?callback=${callbackName}`;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// 使用
jsonp('https://api.example.com/data')
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

```javascript
// 后端代码（Node.js）
app.get('/data', (req, res) => {
  const callback = req.query.callback;
  const data = { message: 'Success' };
  
  // 返回 JavaScript 代码
  res.send(`${callback}(${JSON.stringify(data)})`);
});
```

**JSONP 的优缺点：**

优点：
- 兼容性好，支持老浏览器
- 实现简单

缺点：
- 只支持 GET 请求
- 安全性差，容易受到 XSS 攻击
- 错误处理困难
- 需要服务器支持

### 解决方案 3：代理服务器

**原理**：同源策略只存在于浏览器，服务器之间通信不受限制。

```javascript
// 前端代码（请求同域的代理服务器）
fetch('/api/data')
  .then(res => res.json())
  .then(data => console.log(data));
```

```javascript
// 代理服务器（Node.js + Express）
const express = require('express');
const axios = require('axios');
const app = express();

// 代理中间件
app.use('/api', async (req, res) => {
  try {
    // 转发请求到目标服务器
    const response = await axios({
      method: req.method,
      url: `https://api.example.com${req.url}`,
      data: req.body,
      headers: req.headers
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

**Webpack Dev Server 代理配置：**

```javascript
// webpack.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
};
```

**Vite 代理配置：**

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
};
```

### 解决方案 4：postMessage

**用于跨窗口通信（iframe、window.open）：**

```html
<!-- 父页面 (https://www.example.com) -->
<iframe id="iframe" src="https://other.example.com/page.html"></iframe>

<script>
const iframe = document.getElementById('iframe');

// 发送消息
iframe.contentWindow.postMessage('Hello from parent', 'https://other.example.com');

// 接收消息
window.addEventListener('message', (event) => {
  // 验证来源
  if (event.origin !== 'https://other.example.com') return;
  
  console.log('Received:', event.data);
});
</script>
```

```html
<!-- 子页面 (https://other.example.com/page.html) -->
<script>
// 接收消息
window.addEventListener('message', (event) => {
  // 验证来源
  if (event.origin !== 'https://www.example.com') return;
  
  console.log('Received:', event.data);
  
  // 回复消息
  event.source.postMessage('Hello from child', event.origin);
});
</script>
```

### 解决方案 5：WebSocket

**WebSocket 不受同源策略限制：**

```javascript
// 前端代码
const ws = new WebSocket('wss://api.example.com/socket');

ws.onopen = () => {
  console.log('Connected');
  ws.send('Hello Server');
};

ws.onmessage = (event) => {
  console.log('Received:', event.data);
};

ws.onerror = (error) => {
  console.error('Error:', error);
};

ws.onclose = () => {
  console.log('Disconnected');
};
```

```javascript
// 后端代码（Node.js + ws）
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    console.log('Received:', message);
    ws.send('Hello Client');
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
```

### 常见误区

1. **误区：CORS 是前端配置的**
   ```javascript
   // ❌ 错误：前端无法解决 CORS 问题
   fetch('https://api.example.com/data', {
     headers: {
       'Access-Control-Allow-Origin': '*'  // 无效
     }
   });
   
   // ✅ 正确：CORS 需要服务器配置响应头
   ```

2. **误区：所有跨域请求都会发送预检请求**
   ```javascript
   // 简单请求不会发送预检请求
   fetch('https://api.example.com/data', {
     method: 'GET',
     headers: {
       'Content-Type': 'application/json'
     }
   });
   
   // 复杂请求会发送预检请求
   fetch('https://api.example.com/data', {
     method: 'PUT',  // 非简单方法
     headers: {
       'X-Custom-Header': 'value'  // 自定义头
     }
   });
   ```

3. **误区：JSONP 可以发送 POST 请求**
   ```javascript
   // ❌ JSONP 只支持 GET 请求
   // script 标签只能发送 GET 请求
   ```

## 💡 面试回答技巧

### 推荐回答顺序

1. **先说同源策略**：
   - "同源策略是浏览器的安全机制"
   - "协议、域名、端口三者完全相同才算同源"
   - "限制 Cookie、LocalStorage、DOM、AJAX 请求"

2. **再说跨域解决方案**：
   - "CORS：服务器配置响应头，最常用"
   - "JSONP：利用 script 标签，只支持 GET"
   - "代理：服务器转发请求"
   - "postMessage：跨窗口通信"
   - "WebSocket：不受同源策略限制"

3. **然后详细说 CORS**：
   - "简单请求和预检请求"
   - "Access-Control-Allow-Origin 等响应头"
   - "携带 Cookie 的配置"

4. **最后说注意事项**：
   - "CORS 需要服务器配置"
   - "携带 Cookie 时不能使用 *"
   - "预检请求可以缓存"

### 重点强调

- ✅ **同源策略的三要素：协议、域名、端口**
- ✅ **CORS 是服务器配置，不是前端**
- ✅ **简单请求 vs 预检请求**
- ✅ **各种方案的优缺点**

### 可能的追问

**Q1: 什么是简单请求？**

A: 满足以下条件的请求是简单请求：
1. 方法：GET、POST、HEAD
2. Content-Type：
   - application/x-www-form-urlencoded
   - multipart/form-data
   - text/plain
3. 没有自定义请求头

**Q2: 为什么需要预检请求？**

A:
- 避免对服务器产生副作用
- 确认服务器是否允许跨域请求
- 减少不必要的请求（预检结果可以缓存）

**Q3: 如何调试 CORS 问题？**

A:
1. 查看浏览器控制台的错误信息
2. 检查 Network 面板的响应头
3. 确认服务器是否正确配置 CORS 响应头
4. 使用 curl 或 Postman 测试（不受同源策略限制）

**Q4: nginx 如何配置 CORS？**

A:
```nginx
location /api {
    add_header 'Access-Control-Allow-Origin' '$http_origin' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    
    if ($request_method = 'OPTIONS') {
        return 204;
    }
    
    proxy_pass http://backend;
}
```

## 💻 代码示例

### 完整的 CORS 中间件

```javascript
// Express CORS 中间件
function cors(options = {}) {
  const {
    origin = '*',
    methods = 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders = 'Content-Type,Authorization',
    credentials = false,
    maxAge = 86400
  } = options;
  
  return (req, res, next) => {
    // 处理 origin
    if (origin === '*') {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      const requestOrigin = req.headers.origin;
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }
    
    // 其他响应头
    res.setHeader('Access-Control-Allow-Methods', methods);
    res.setHeader('Access-Control-Allow-Headers', allowedHeaders);
    
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Max-Age', maxAge);
      return res.sendStatus(204);
    }
    
    next();
  };
}

// 使用
app.use(cors({
  origin: ['https://www.example.com', 'https://app.example.com'],
  credentials: true
}));
```

### 完整的 JSONP 实现

```javascript
// 前端 JSONP 封装
class JSONP {
  static request(url, options = {}) {
    const {
      timeout = 10000,
      callbackName = `jsonp_${Date.now()}_${Math.random().toString(36).substr(2)}`
    } = options;
    
    return new Promise((resolve, reject) => {
      // 超时处理
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error('JSONP request timeout'));
      }, timeout);
      
      // 清理函数
      const cleanup = () => {
        clearTimeout(timer);
        delete window[callbackName];
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
      
      // 回调函数
      window[callbackName] = (data) => {
        cleanup();
        resolve(data);
      };
      
      // 创建 script 标签
      const script = document.createElement('script');
      script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${callbackName}`;
      script.onerror = () => {
        cleanup();
        reject(new Error('JSONP request failed'));
      };
      
      document.body.appendChild(script);
    });
  }
}

// 使用
JSONP.request('https://api.example.com/data', { timeout: 5000 })
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

## 🔗 相关知识点

- [HTTP 协议](./http-versions.md)
- [前端安全](./security.md)
- [浏览器缓存](../performance/cache-strategy.md)

## 📚 参考资料

- [MDN - CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)
- [MDN - 同源策略](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy)
- [CORS 规范](https://fetch.spec.whatwg.org/#http-cors-protocol)
