---
title: 强缓存和协商缓存
date: 2025-11-27
category: Performance
difficulty: 中级
tags: [HTTP缓存, 性能优化, 浏览器缓存, 强缓存, 协商缓存]
related: []
hasCode: true
---

# 题目

什么是强缓存和协商缓存？它们有什么区别？如何配置？

## 📝 标准答案

### 核心要点

1. **强缓存**：浏览器直接从本地缓存读取资源，不发送HTTP请求（状态码200 from cache）
2. **协商缓存**：浏览器发送请求到服务器，服务器判断缓存是否有效（状态码304 Not Modified）
3. **优先级**：强缓存优先级高于协商缓存
4. **控制字段**：
   - 强缓存：`Cache-Control`、`Expires`
   - 协商缓存：`ETag/If-None-Match`、`Last-Modified/If-Modified-Since`

### 详细说明

#### 1. 强缓存（Strong Cache）

**定义**：浏览器直接从本地缓存读取资源，不向服务器发送请求。

**控制字段：**

**Cache-Control（HTTP/1.1，优先级更高）：**
```http
Cache-Control: max-age=3600
```

常用指令：
- `max-age=<秒>`：缓存有效期（相对时间）
- `no-cache`：不使用强缓存，使用协商缓存
- `no-store`：不缓存任何内容
- `public`：可被任何缓存（浏览器、CDN）缓存
- `private`：只能被浏览器缓存
- `immutable`：资源永不改变

**Expires（HTTP/1.0）：**
```http
Expires: Wed, 27 Nov 2025 10:00:00 GMT
```
- 绝对时间，受客户端时间影响
- 优先级低于Cache-Control

**流程：**
```
1. 浏览器请求资源
2. 检查缓存是否过期
3. 未过期 → 直接使用缓存（200 from cache）
4. 已过期 → 进入协商缓存流程
```

#### 2. 协商缓存（Negotiation Cache）

**定义**：浏览器发送请求到服务器，由服务器判断缓存是否可用。

**控制字段：**

**ETag / If-None-Match（优先级更高）：**
```http
# 服务器响应
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"

# 浏览器再次请求
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```
- ETag是资源的唯一标识（通常是文件内容的hash值）
- 精确判断资源是否变化

**Last-Modified / If-Modified-Since：**
```http
# 服务器响应
Last-Modified: Wed, 27 Nov 2025 09:00:00 GMT

# 浏览器再次请求
If-Modified-Since: Wed, 27 Nov 2025 09:00:00 GMT
```
- 基于文件修改时间
- 精度只到秒级，可能不够准确

**流程：**
```
1. 浏览器请求资源（携带If-None-Match或If-Modified-Since）
2. 服务器对比标识
3. 未改变 → 返回304 Not Modified（不返回资源内容）
4. 已改变 → 返回200和新资源
```

## 🧠 深度理解

### 缓存策略对比

| 特性 | 强缓存 | 协商缓存 |
|------|--------|----------|
| 是否发送请求 | 否 | 是 |
| 状态码 | 200 (from cache) | 304 Not Modified |
| 性能 | 最优 | 较优 |
| 控制字段 | Cache-Control, Expires | ETag, Last-Modified |
| 适用场景 | 不常变化的资源 | 可能变化的资源 |

### 完整的缓存流程

```
请求资源
    ↓
是否有缓存？
    ↓ 否 → 请求服务器 → 返回200 + 资源 + 缓存头
    ↓ 是
强缓存是否过期？
    ↓ 否 → 使用缓存（200 from cache）
    ↓ 是
发送协商缓存请求（带If-None-Match/If-Modified-Since）
    ↓
服务器判断资源是否变化？
    ↓ 否 → 返回304（使用缓存）
    ↓ 是 → 返回200 + 新资源
```

### 实际配置示例

#### Nginx配置

```nginx
server {
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        # 强缓存：1年
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location ~* \.(html)$ {
        # 不使用强缓存，使用协商缓存
        add_header Cache-Control "no-cache";
        etag on;
    }
    
    location /api/ {
        # 不缓存API请求
        add_header Cache-Control "no-store";
    }
}
```

#### Node.js (Express) 配置

```javascript
const express = require('express');
const app = express();

// 静态资源强缓存
app.use('/static', express.static('public', {
    maxAge: '1y',
    immutable: true
}));

// HTML使用协商缓存
app.get('/', (req, res) => {
    res.set({
        'Cache-Control': 'no-cache',
        'ETag': generateETag(content)
    });
    
    // 检查协商缓存
    if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
    }
    
    res.send(content);
});

// API不缓存
app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});
```

### 最佳实践

#### 1. 静态资源（JS、CSS、图片）

```http
# 使用文件指纹（hash）+ 强缓存
Cache-Control: max-age=31536000, immutable
```

```html
<!-- 文件名包含hash，内容变化时文件名变化 -->
<script src="/static/app.a3f2b1c.js"></script>
<link rel="stylesheet" href="/static/style.d4e5f6.css">
```

**优点**：
- 缓存时间长，性能最优
- 内容变化时文件名变化，自动更新
- 不需要协商缓存

#### 2. HTML文件

```http
# 不使用强缓存，使用协商缓存
Cache-Control: no-cache
ETag: "abc123"
```

**原因**：
- HTML是入口文件，需要及时更新
- 通过协商缓存确保获取最新版本

#### 3. API接口

```http
# 不缓存
Cache-Control: no-store
```

**原因**：
- 数据实时性要求高
- 避免返回过期数据

#### 4. 频繁变化的资源

```http
# 短时间强缓存 + 协商缓存
Cache-Control: max-age=60, must-revalidate
ETag: "xyz789"
```

### 常见问题

#### 1. 为什么有时候Ctrl+F5刷新才能看到最新内容？

- 普通刷新（F5）：使用协商缓存
- 强制刷新（Ctrl+F5）：跳过所有缓存，直接请求服务器

```http
# 普通刷新
Cache-Control: max-age=0

# 强制刷新
Cache-Control: no-cache
Pragma: no-cache
```

#### 2. ETag vs Last-Modified 如何选择？

**ETag优势：**
- 更精确（基于内容hash）
- 不受时间精度限制
- 适合内容频繁变化但修改时间不变的场景

**Last-Modified优势：**
- 性能更好（不需要计算hash）
- 兼容性更好

**建议**：两者同时使用，ETag优先级更高

#### 3. 如何清除缓存？

**方法1：修改文件名（推荐）**
```html
<!-- 添加版本号或hash -->
<script src="/app.js?v=1.0.1"></script>
<script src="/app.a3f2b1c.js"></script>
```

**方法2：修改Cache-Control**
```http
Cache-Control: no-cache, no-store, must-revalidate
```

**方法3：用户手动清除**
- Chrome: Ctrl+Shift+Delete
- 开发者工具: Disable cache

## 💡 面试回答技巧

### 推荐回答顺序

1. **定义区别**：强缓存不发请求，协商缓存发请求但可能返回304
2. **控制字段**：说明Cache-Control、ETag等字段
3. **流程说明**：先强缓存，再协商缓存
4. **实际应用**：静态资源用强缓存，HTML用协商缓存
5. **优化建议**：文件指纹 + 长缓存

### 可能的追问

**Q1: Cache-Control的常用指令有哪些？**

A:
```http
# 缓存时间
max-age=3600          # 缓存3600秒
s-maxage=3600         # CDN缓存时间（优先级高于max-age）

# 缓存策略
no-cache              # 使用协商缓存
no-store              # 不缓存
must-revalidate       # 过期后必须验证
immutable             # 资源永不改变

# 缓存范围
public                # 可被任何缓存
private               # 只能被浏览器缓存
```

**Q2: 如何实现静态资源的长缓存？**

A: 使用文件指纹（hash）+ 强缓存

```javascript
// Webpack配置
module.exports = {
    output: {
        filename: '[name].[contenthash].js',
        chunkFilename: '[name].[contenthash].js'
    }
};
```

```nginx
# Nginx配置
location ~* \.(js|css|png|jpg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**优势**：
- 缓存时间长（1年），性能最优
- 内容变化时hash变化，自动更新
- 不需要协商缓存，减少请求

**Q3: 304状态码是什么意思？**

A: 304 Not Modified表示资源未修改，可以使用缓存。

**流程**：
1. 浏览器发送请求，携带`If-None-Match`或`If-Modified-Since`
2. 服务器对比资源是否变化
3. 未变化 → 返回304，不返回资源内容
4. 浏览器使用本地缓存

**优势**：
- 节省带宽（不传输资源内容）
- 比200请求快，但比强缓存慢

**Q4: from memory cache 和 from disk cache 的区别？**

A:
- **from memory cache**：从内存读取，速度最快，关闭标签页后清除
- **from disk cache**：从硬盘读取，速度较快，持久化存储

**浏览器策略**：
- 当前页面使用的资源 → memory cache
- 其他资源 → disk cache
- 内存不足时 → 优先使用disk cache

**Q5: 如何调试缓存问题？**

A: 使用Chrome DevTools

**Network面板**：
- Size列：显示`(memory cache)`、`(disk cache)`
- Status列：显示200或304
- Response Headers：查看缓存相关头

**禁用缓存**：
- 勾选"Disable cache"（仅在DevTools打开时生效）
- 或使用Ctrl+Shift+R强制刷新

**Application面板**：
- Cache Storage：查看缓存内容
- Clear storage：清除所有缓存

## 🔗 相关知识点

- [Transform vs Position性能对比](./transform-vs-position.md) - 性能优化
- HTTP协议 - 理解HTTP头部字段
- CDN原理 - 缓存在CDN中的应用

## 📚 参考资料

- [MDN - HTTP缓存](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Caching)
- [Google - HTTP缓存最佳实践](https://web.dev/http-cache/)
- [RFC 7234 - HTTP/1.1 Caching](https://tools.ietf.org/html/rfc7234)
