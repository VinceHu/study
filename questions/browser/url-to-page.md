---
title: 从输入 URL 到页面展示发生了什么
date: 2025-11-27
category: 浏览器
difficulty: 中级
tags: [浏览器, DNS, TCP, HTTP, 渲染, 性能优化]
related: [repaint-reflow.md, cache-strategy.md]
hasCode: true
---

# 题目

请详细说明从输入 URL 到页面展示发生了什么（DNS 解析 → TCP 握手 → 发送请求 → 接收响应 → 解析 HTML → 构建 DOM/CSSOM → 生成 Render Tree → 布局 → 绘制）。

## 📝 标准答案

### 核心要点

完整流程分为 **9 个主要步骤**：

1. **URL 解析**：解析 URL 的各个部分（协议、域名、端口、路径等）
2. **DNS 解析**：将域名解析为 IP 地址
3. **建立 TCP 连接**：三次握手建立连接
4. **发送 HTTP 请求**：构造并发送请求报文
5. **服务器处理请求**：服务器接收并处理请求
6. **接收 HTTP 响应**：接收响应报文
7. **解析 HTML**：构建 DOM 树
8. **加载资源**：加载 CSS、JS、图片等资源
9. **渲染页面**：构建渲染树、布局、绘制

### 详细说明

#### 1. URL 解析

```
https://www.example.com:443/path/page.html?query=value#hash

协议：https
域名：www.example.com
端口：443（HTTPS 默认端口）
路径：/path/page.html
查询参数：query=value
哈希：hash
```

**浏览器检查：**
- URL 是否合法
- 协议是否支持（http、https、file 等）
- 是否需要编码（中文、特殊字符）

#### 2. DNS 解析（域名 → IP 地址）

```
www.example.com → 93.184.216.34
```

**DNS 查询顺序：**

```
1. 浏览器缓存
   ↓ 未找到
2. 操作系统缓存（hosts 文件）
   ↓ 未找到
3. 路由器缓存
   ↓ 未找到
4. ISP DNS 服务器
   ↓ 未找到
5. 根 DNS 服务器
   ↓
6. 顶级域名服务器（.com）
   ↓
7. 权威 DNS 服务器（example.com）
   ↓
返回 IP 地址
```

**DNS 解析过程：**

```javascript
// 递归查询示例
浏览器 → 本地 DNS 服务器：查询 www.example.com
本地 DNS → 根服务器：查询 www.example.com
根服务器 → 本地 DNS：返回 .com 服务器地址
本地 DNS → .com 服务器：查询 www.example.com
.com 服务器 → 本地 DNS：返回 example.com 服务器地址
本地 DNS → example.com 服务器：查询 www.example.com
example.com 服务器 → 本地 DNS：返回 93.184.216.34
本地 DNS → 浏览器：返回 93.184.216.34
```

**优化：**
- DNS 预解析：`<link rel="dns-prefetch" href="//example.com">`
- DNS 缓存：减少查询次数
- 使用 CDN：就近访问

## 🧠 深度理解

#### 3. 建立 TCP 连接（三次握手）

```
客户端                           服务器
  |                                |
  |  SYN (seq=x)                   |
  |------------------------------->|
  |                                |
  |  SYN-ACK (seq=y, ack=x+1)      |
  |<-------------------------------|
  |                                |
  |  ACK (ack=y+1)                 |
  |------------------------------->|
  |                                |
  |  连接建立，开始传输数据         |
```

**三次握手的原因：**
- 确认双方的收发能力
- 防止已失效的连接请求突然又传到服务器
- 同步序列号

**HTTPS 还需要 TLS 握手：**

```
1. Client Hello（客户端支持的加密套件）
2. Server Hello（选择的加密套件）
3. Certificate（服务器证书）
4. Server Key Exchange（密钥交换）
5. Client Key Exchange（客户端密钥）
6. Change Cipher Spec（切换到加密通信）
7. Finished（握手完成）
```

#### 4. 发送 HTTP 请求

```http
GET /path/page.html HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Accept: text/html,application/xhtml+xml
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Cookie: session_id=abc123
Cache-Control: max-age=0
```

**请求组成：**
- 请求行：方法、路径、协议版本
- 请求头：各种元信息
- 请求体：POST 等方法的数据

#### 5. 服务器处理请求

```
1. 接收请求
2. 解析请求（路由匹配）
3. 业务逻辑处理
4. 数据库查询
5. 生成响应内容
6. 返回响应
```

#### 6. 接收 HTTP 响应

```http
HTTP/1.1 200 OK
Date: Wed, 27 Nov 2025 12:00:00 GMT
Server: nginx/1.18.0
Content-Type: text/html; charset=UTF-8
Content-Length: 1234
Cache-Control: max-age=3600
ETag: "abc123"
Connection: keep-alive

<!DOCTYPE html>
<html>
<head>
  <title>Example</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello World</h1>
  <script src="script.js"></script>
</body>
</html>
```

**响应组成：**
- 状态行：协议版本、状态码、状态描述
- 响应头：各种元信息
- 响应体：HTML 内容

#### 7. 解析 HTML（构建 DOM 树）

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Example</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <div id="app">
      <h1>Hello</h1>
      <p>World</p>
    </div>
    <script src="script.js"></script>
  </body>
</html>
```

**DOM 树构建过程：**

```
1. 字节流 → 字符流
   01001000 01010100 ... → <html><head>...

2. 字符流 → Token
   <html> → StartTag: html
   <head> → StartTag: head
   </head> → EndTag: head

3. Token → Node
   StartTag: html → HTMLHtmlElement
   StartTag: head → HTMLHeadElement

4. Node → DOM Tree
   Document
     └─ html
         ├─ head
         │   └─ title
         └─ body
             └─ div#app
                 ├─ h1
                 └─ p
```

#### 8. 加载资源

**资源加载顺序：**

```
1. HTML 解析（边解析边加载）
2. CSS 文件（阻塞渲染）
3. JavaScript 文件（阻塞解析）
4. 图片、字体等（异步加载）
```

**CSS 加载：**
```html
<!-- 阻塞渲染，不阻塞解析 -->
<link rel="stylesheet" href="style.css">
```

**JavaScript 加载：**
```html
<!-- 阻塞解析和渲染 -->
<script src="script.js"></script>

<!-- 异步加载，不阻塞解析 -->
<script async src="script.js"></script>

<!-- 延迟执行，不阻塞解析 -->
<script defer src="script.js"></script>
```

**资源优先级：**
```
1. HTML（最高）
2. CSS（高）
3. JavaScript（高）
4. 字体（中）
5. 图片（低）
6. 预加载资源（可配置）
```

#### 9. 渲染页面

**渲染流程：**

```
1. 构建 DOM 树
   HTML → DOM Tree

2. 构建 CSSOM 树
   CSS → CSSOM Tree

3. 合并生成渲染树
   DOM + CSSOM → Render Tree
   （只包含可见节点）

4. 布局（Layout/Reflow）
   计算每个节点的位置和大小

5. 绘制（Paint）
   将节点绘制到屏幕上

6. 合成（Composite）
   将多个图层合成最终图像
```

**详细过程：**

```javascript
// 1. DOM Tree
Document
  └─ html
      ├─ head
      │   └─ style
      └─ body
          └─ div
              ├─ h1 (Hello)
              └─ p (World)

// 2. CSSOM Tree
StyleSheet
  └─ div
      ├─ color: blue
      └─ font-size: 16px

// 3. Render Tree（排除 display: none）
RenderObject
  └─ RenderBlock (div)
      ├─ RenderBlock (h1)
      │   └─ RenderText (Hello)
      └─ RenderBlock (p)
          └─ RenderText (World)

// 4. Layout（计算位置）
div: x=0, y=0, width=800, height=600
h1: x=0, y=0, width=800, height=32
p: x=0, y=32, width=800, height=20

// 5. Paint（绘制）
绘制背景色 → 绘制边框 → 绘制文本 → ...

// 6. Composite（合成）
图层1（背景） + 图层2（内容） → 最终画面
```

### 关键渲染路径（Critical Rendering Path）

```
HTML → DOM
CSS → CSSOM
DOM + CSSOM → Render Tree → Layout → Paint → Composite
```

**优化关键渲染路径：**

1. **减少关键资源数量**
   ```html
   <!-- 合并 CSS 文件 -->
   <link rel="stylesheet" href="all.css">
   
   <!-- 内联关键 CSS -->
   <style>
     /* 首屏关键样式 */
   </style>
   ```

2. **减少关键资源大小**
   ```html
   <!-- 压缩 CSS/JS -->
   <link rel="stylesheet" href="style.min.css">
   
   <!-- 移除未使用的 CSS -->
   <!-- 使用 PurgeCSS 等工具 -->
   ```

3. **缩短关键路径长度**
   ```html
   <!-- 使用 CDN -->
   <link rel="stylesheet" href="https://cdn.example.com/style.css">
   
   <!-- 预加载关键资源 -->
   <link rel="preload" href="font.woff2" as="font">
   ```

### 常见误区

1. **误区：DNS 解析很快，不需要优化**
   ```html
   <!-- ❌ 错误：忽略 DNS 优化 -->
   <img src="https://cdn1.example.com/1.jpg">
   <img src="https://cdn2.example.com/2.jpg">
   <img src="https://cdn3.example.com/3.jpg">
   <!-- 每个域名都需要 DNS 解析 -->
   
   <!-- ✅ 正确：DNS 预解析 -->
   <link rel="dns-prefetch" href="//cdn1.example.com">
   <link rel="dns-prefetch" href="//cdn2.example.com">
   <link rel="dns-prefetch" href="//cdn3.example.com">
   ```

2. **误区：CSS 不阻塞页面加载**
   ```html
   <!-- ❌ CSS 会阻塞渲染 -->
   <link rel="stylesheet" href="large.css">
   <!-- 页面会等待 CSS 加载完成才渲染 -->
   
   <!-- ✅ 正确：关键 CSS 内联，非关键 CSS 异步加载 -->
   <style>
     /* 首屏关键样式 */
   </style>
   <link rel="preload" href="non-critical.css" as="style" onload="this.rel='stylesheet'">
   ```

3. **误区：JavaScript 放在 head 中**
   ```html
   <!-- ❌ 错误：阻塞页面解析 -->
   <head>
     <script src="large.js"></script>
   </head>
   
   <!-- ✅ 正确：放在 body 底部或使用 defer/async -->
   <body>
     <!-- 内容 -->
     <script defer src="script.js"></script>
   </body>
   ```

### 进阶知识

#### 1. HTTP/2 的多路复用

```
HTTP/1.1：
请求1 -----> 响应1
请求2 -----> 响应2
请求3 -----> 响应3
（串行，需要多个 TCP 连接）

HTTP/2：
请求1 --|
请求2 --|--> 同一个 TCP 连接 --> 响应1、响应2、响应3
请求3 --|
（并行，单个 TCP 连接）
```

#### 2. 浏览器渲染进程

```
浏览器进程（Browser Process）
  ├─ 网络进程（Network Process）
  │   └─ 负责网络请求
  ├─ GPU 进程（GPU Process）
  │   └─ 负责 3D 绘制
  └─ 渲染进程（Renderer Process）
      ├─ 主线程（Main Thread）
      │   ├─ 解析 HTML/CSS
      │   ├─ 执行 JavaScript
      │   └─ 布局和绘制
      ├─ 合成线程（Compositor Thread）
      │   └─ 图层合成
      └─ 光栅化线程（Raster Thread）
          └─ 位图生成
```

#### 3. 资源提示（Resource Hints）

```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//example.com">

<!-- 预连接（DNS + TCP + TLS） -->
<link rel="preconnect" href="https://example.com">

<!-- 预加载（高优先级） -->
<link rel="preload" href="style.css" as="style">

<!-- 预获取（低优先级，空闲时加载） -->
<link rel="prefetch" href="next-page.html">

<!-- 预渲染（提前渲染整个页面） -->
<link rel="prerender" href="next-page.html">
```

## 💡 面试回答技巧

### 🎯 一句话回答（快速版）

> 主要分两部分：网络请求（DNS 解析 → TCP 连接 → HTTP 请求响应）和页面渲染（解析 HTML → 构建 DOM/CSSOM → 渲染树 → 布局 → 绘制）。

### 📣 口语化回答（推荐）

面试时可以这样回答：

> "从输入 URL 到页面展示，我分**网络请求**和**页面渲染**两部分来说。
>
> **网络请求阶段**：
>
> 首先是 **DNS 解析**，把域名转换成 IP 地址。会依次查询浏览器缓存、系统缓存、路由器缓存、ISP 缓存，都没有才去 DNS 服务器查询。
>
> 然后是 **TCP 连接**，通过三次握手建立连接。如果是 HTTPS 还要进行 TLS 握手。
>
> 接着发送 **HTTP 请求**，服务器返回 HTML 文档。
>
> **页面渲染阶段**：
>
> 浏览器解析 HTML 构建 **DOM 树**，解析 CSS 构建 **CSSOM 树**。
>
> 然后把 DOM 和 CSSOM 合并成**渲染树**，渲染树只包含可见节点，display: none 的不会在里面。
>
> 接着进行**布局**（Layout），计算每个节点的位置和大小。
>
> 最后**绘制**（Paint）到屏幕上。
>
> 优化的话，可以用 DNS 预解析、HTTP/2 多路复用、资源压缩、关键 CSS 内联、JS 延迟加载等。"

### 推荐回答顺序

1. **先说整体流程**：
   - "从输入 URL 到页面展示，主要分为网络请求和页面渲染两大部分"
   - "网络请求包括 DNS 解析、TCP 连接、HTTP 请求响应"
   - "页面渲染包括解析 HTML、构建 DOM/CSSOM、渲染树、布局、绘制"

2. **再详细展开每个步骤**：
   - DNS 解析的查询顺序
   - TCP 三次握手
   - HTTP 请求响应的格式
   - DOM 树和 CSSOM 树的构建
   - 渲染树的生成和渲染流程

3. **然后说优化点**：
   - DNS 预解析
   - HTTP/2 多路复用
   - 资源压缩和合并
   - 关键 CSS 内联
   - JavaScript 延迟加载

4. **最后说注意事项**：
   - CSS 阻塞渲染
   - JavaScript 阻塞解析
   - 关键渲染路径优化

### 重点强调

- ✅ **DNS 解析的缓存机制**
- ✅ **TCP 三次握手的必要性**
- ✅ **渲染树只包含可见节点**
- ✅ **关键渲染路径的优化**

### 可能的追问

**Q1: 为什么需要三次握手，两次不行吗？**

A:
- 两次握手无法确认客户端的接收能力
- 可能导致已失效的连接请求被服务器接受
- 无法正确同步双方的序列号

**Q2: CSS 为什么会阻塞渲染？**

A:
- 浏览器需要 CSSOM 才能构建渲染树
- 如果 CSS 未加载完成，无法确定元素样式
- 为了避免 FOUC（无样式内容闪烁），浏览器会等待 CSS 加载

**Q3: async 和 defer 的区别？**

A:
```html
<!-- async：异步加载，加载完立即执行（可能阻塞解析） -->
<script async src="script.js"></script>

<!-- defer：异步加载，DOMContentLoaded 前执行（不阻塞解析） -->
<script defer src="script.js"></script>
```

执行顺序：
- async：不保证顺序，谁先加载完谁先执行
- defer：保证顺序，按照在文档中的顺序执行

**Q4: 如何减少首屏加载时间？**

A:
1. 减少关键资源：合并 CSS/JS，内联关键 CSS
2. 压缩资源：Gzip、Brotli 压缩
3. 使用 CDN：就近访问，减少延迟
4. 懒加载：图片、非关键资源延迟加载
5. 预加载：DNS 预解析、资源预加载
6. HTTP/2：多路复用，减少连接数

## 💻 代码示例

### 性能监控

```javascript
// 使用 Performance API 监控页面加载性能
window.addEventListener('load', () => {
  const perfData = performance.timing;
  
  // DNS 解析时间
  const dnsTime = perfData.domainLookupEnd - perfData.domainLookupStart;
  console.log('DNS 解析时间:', dnsTime, 'ms');
  
  // TCP 连接时间
  const tcpTime = perfData.connectEnd - perfData.connectStart;
  console.log('TCP 连接时间:', tcpTime, 'ms');
  
  // 请求时间
  const requestTime = perfData.responseStart - perfData.requestStart;
  console.log('请求时间:', requestTime, 'ms');
  
  // 响应时间
  const responseTime = perfData.responseEnd - perfData.responseStart;
  console.log('响应时间:', responseTime, 'ms');
  
  // DOM 解析时间
  const domTime = perfData.domComplete - perfData.domLoading;
  console.log('DOM 解析时间:', domTime, 'ms');
  
  // 首屏时间
  const firstPaintTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
  console.log('首屏时间:', firstPaintTime, 'ms');
  
  // 总加载时间
  const loadTime = perfData.loadEventEnd - perfData.navigationStart;
  console.log('总加载时间:', loadTime, 'ms');
});

// 使用 PerformanceObserver 监控资源加载
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('资源:', entry.name);
    console.log('加载时间:', entry.duration, 'ms');
    console.log('类型:', entry.initiatorType);
  }
});

observer.observe({ entryTypes: ['resource'] });
```

### 优化示例

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>优化示例</title>
  
  <!-- DNS 预解析 -->
  <link rel="dns-prefetch" href="//cdn.example.com">
  
  <!-- 预连接 -->
  <link rel="preconnect" href="https://api.example.com">
  
  <!-- 关键 CSS 内联 -->
  <style>
    /* 首屏关键样式 */
    body { margin: 0; font-family: sans-serif; }
    .header { height: 60px; background: #333; }
  </style>
  
  <!-- 预加载关键资源 -->
  <link rel="preload" href="font.woff2" as="font" crossorigin>
  <link rel="preload" href="hero.jpg" as="image">
  
  <!-- 非关键 CSS 异步加载 -->
  <link rel="preload" href="non-critical.css" as="style" onload="this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="non-critical.css"></noscript>
</head>
<body>
  <header class="header">
    <h1>网站标题</h1>
  </header>
  
  <main>
    <!-- 图片懒加载 -->
    <img data-src="image.jpg" class="lazyload" alt="图片">
  </main>
  
  <!-- JavaScript 延迟加载 -->
  <script defer src="main.js"></script>
  
  <!-- 懒加载脚本 -->
  <script>
    // 图片懒加载
    const lazyImages = document.querySelectorAll('.lazyload');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazyload');
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  </script>
</body>
</html>
```

## 🔗 相关知识点

- [浏览器缓存策略](../performance/cache-strategy.md)
- [重绘与回流](./repaint-reflow.md)
- [HTTP 协议](../network/http-versions.md)

## 📚 参考资料

- [浏览器工作原理](https://developer.mozilla.org/zh-CN/docs/Web/Performance/How_browsers_work)
- [关键渲染路径](https://developers.google.com/web/fundamentals/performance/critical-rendering-path)
- [Performance API](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance)
