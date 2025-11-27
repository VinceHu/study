---
title: 前端安全：XSS 和 CSRF
date: 2025-11-27
category: 网络
difficulty: 中级
tags: [安全, XSS, CSRF, 防御, 攻击]
related: [cors.md, http-versions.md]
hasCode: true
---

# 前端安全：XSS 和 CSRF

## 📝 标准答案

### 核心要点

1. **XSS (Cross-Site Scripting 跨站脚本攻击)**：
   - 攻击者注入恶意脚本到网页中
   - 类型：存储型、反射型、DOM 型
   - 防御：输入过滤、输出转义、CSP、HttpOnly Cookie

2. **CSRF (Cross-Site Request Forgery 跨站请求伪造)**：
   - 攻击者诱导用户在已登录的网站上执行非本意的操作
   - 利用用户的登录状态发送恶意请求
   - 防御：CSRF Token、SameSite Cookie、验证 Referer

### 详细说明

#### XSS 攻击

**1. 存储型 XSS（最危险）**

```javascript
// 攻击场景：评论系统
// 攻击者提交评论
const comment = '<script>alert("XSS")</script>';

// 后端存储到数据库
db.comments.insert({ content: comment });

// 其他用户访问页面时
// ❌ 直接渲染，执行恶意脚本
document.getElementById('comments').innerHTML = comment;
```

**2. 反射型 XSS**

```javascript
// 攻击场景：搜索功能
// URL: https://example.com/search?q=<script>alert("XSS")</script>

// 后端代码
app.get('/search', (req, res) => {
  const query = req.query.q;
  // ❌ 直接输出到页面
  res.send(`<p>搜索结果：${query}</p>`);
});
```

**3. DOM 型 XSS**

```javascript
// 攻击场景：URL 参数直接操作 DOM
// URL: https://example.com/#<img src=x onerror=alert("XSS")>

// ❌ 直接使用 location.hash
document.getElementById('content').innerHTML = location.hash.slice(1);
```

**XSS 的危害：**
- 窃取 Cookie、Session
- 劫持用户会话
- 篡改页面内容
- 钓鱼攻击
- 传播蠕虫

**XSS 防御：**

```javascript
// 1. 输入过滤
function sanitizeInput(input) {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// 2. 输出转义
// 使用模板引擎自动转义
// Vue: {{ message }}  自动转义
// React: {message}  自动转义

// 3. 使用 textContent 代替 innerHTML
element.textContent = userInput;  // ✅ 安全
element.innerHTML = userInput;    // ❌ 危险

// 4. CSP (Content Security Policy)
// HTTP 响应头
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.com

// 或 meta 标签
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">

// 5. HttpOnly Cookie
// 防止 JavaScript 访问 Cookie
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict

// 6. 使用安全的 API
// ❌ 危险
eval(userInput);
new Function(userInput);
setTimeout(userInput);

// ✅ 安全
JSON.parse(userInput);
```

#### CSRF 攻击

**攻击场景：**

```html
<!-- 用户已登录 bank.com -->
<!-- 攻击者网站 evil.com -->
<html>
<body>
  <!-- 方式1：自动提交表单 -->
  <form action="https://bank.com/transfer" method="POST" id="form">
    <input type="hidden" name="to" value="attacker">
    <input type="hidden" name="amount" value="10000">
  </form>
  <script>
    document.getElementById('form').submit();
  </script>
  
  <!-- 方式2：图片标签 -->
  <img src="https://bank.com/transfer?to=attacker&amount=10000">
  
  <!-- 方式3：AJAX 请求 -->
  <script>
    fetch('https://bank.com/transfer', {
      method: 'POST',
      credentials: 'include',  // 携带 Cookie
      body: JSON.stringify({ to: 'attacker', amount: 10000 })
    });
  </script>
</body>
</html>
```

**CSRF 的危害：**
- 盗取用户资金
- 修改用户信息
- 发送垃圾邮件
- 执行未授权操作

**CSRF 防御：**

```javascript
// 1. CSRF Token
// 后端生成 Token
app.get('/form', (req, res) => {
  const csrfToken = generateToken();
  req.session.csrfToken = csrfToken;
  res.render('form', { csrfToken });
});

// 前端提交时携带 Token
<form action="/transfer" method="POST">
  <input type="hidden" name="csrf_token" value="<%= csrfToken %>">
  <input type="text" name="to">
  <input type="number" name="amount">
  <button type="submit">转账</button>
</form>

// 后端验证 Token
app.post('/transfer', (req, res) => {
  const token = req.body.csrf_token;
  if (token !== req.session.csrfToken) {
    return res.status(403).send('Invalid CSRF token');
  }
  // 执行转账操作
});

// 2. SameSite Cookie
Set-Cookie: sessionId=abc123; SameSite=Strict

// Strict: 完全禁止第三方 Cookie
// Lax: 允许部分第三方 Cookie（GET 请求）
// None: 允许所有第三方 Cookie（需要 Secure）

// 3. 验证 Referer
app.post('/transfer', (req, res) => {
  const referer = req.headers.referer;
  if (!referer || !referer.startsWith('https://bank.com')) {
    return res.status(403).send('Invalid referer');
  }
  // 执行转账操作
});

// 4. 双重 Cookie 验证
// 前端从 Cookie 读取 Token，放到请求头
const csrfToken = getCookie('csrf_token');
fetch('/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({ to: 'user', amount: 100 })
});

// 后端验证
app.post('/transfer', (req, res) => {
  const cookieToken = req.cookies.csrf_token;
  const headerToken = req.headers['x-csrf-token'];
  if (cookieToken !== headerToken) {
    return res.status(403).send('Invalid CSRF token');
  }
  // 执行转账操作
});
```

## 🧠 深度理解

### XSS vs CSRF 对比

| 特性 | XSS | CSRF |
|------|-----|------|
| 攻击方式 | 注入恶意脚本 | 伪造用户请求 |
| 攻击目标 | 用户浏览器 | 服务器 |
| 利用对象 | 用户对网站的信任 | 网站对用户的信任 |
| 是否需要登录 | 不一定 | 需要 |
| 防御重点 | 输入输出处理 | 请求验证 |

### 其他安全问题

**1. 点击劫持 (Clickjacking)**

```html
<!-- 攻击者网站 -->
<iframe src="https://bank.com/transfer" style="opacity: 0; position: absolute;"></iframe>
<button style="position: absolute; top: 100px; left: 100px;">
  点击领取奖品
</button>
```

**防御：**
```javascript
// X-Frame-Options 响应头
X-Frame-Options: DENY  // 禁止被嵌入 iframe
X-Frame-Options: SAMEORIGIN  // 只允许同源嵌入

// CSP frame-ancestors
Content-Security-Policy: frame-ancestors 'self'

// JavaScript 防御
if (top !== self) {
  top.location = self.location;
}
```

**2. SQL 注入**

```javascript
// ❌ 危险：直接拼接 SQL
const username = req.body.username;
const sql = `SELECT * FROM users WHERE username = '${username}'`;
// 攻击：username = "admin' OR '1'='1"

// ✅ 安全：使用参数化查询
const sql = 'SELECT * FROM users WHERE username = ?';
db.query(sql, [username]);
```

**3. 中间人攻击 (MITM)**

**防御：**
```javascript
// 使用 HTTPS
// Strict-Transport-Security 响应头
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 常见误区

1. **误区：前端验证就够了**
   ```javascript
   // ❌ 前端验证可以被绕过
   if (amount > 0 && amount < 10000) {
     submitForm();
   }
   
   // ✅ 前后端都要验证
   ```

2. **误区：HTTPS 可以防止 XSS**
   ```javascript
   // ❌ HTTPS 只能防止中间人攻击，不能防止 XSS
   // XSS 是注入到页面中的脚本，HTTPS 无法防御
   ```

3. **误区：只有 POST 请求需要 CSRF 防护**
   ```javascript
   // ❌ GET 请求也可能被 CSRF 攻击
   // 如果 GET 请求有副作用（如转账），也需要防护
   
   // ✅ 所有有副作用的请求都需要防护
   ```

## 💡 面试回答技巧

### 推荐回答顺序

1. **先说 XSS**：
   - "XSS 是注入恶意脚本到网页中"
   - "分为存储型、反射型、DOM 型"
   - "防御：输入过滤、输出转义、CSP"

2. **再说 CSRF**：
   - "CSRF 是伪造用户请求"
   - "利用用户的登录状态"
   - "防御：CSRF Token、SameSite Cookie"

3. **然后说区别**：
   - "XSS 攻击用户，CSRF 攻击服务器"
   - "XSS 利用用户对网站的信任，CSRF 利用网站对用户的信任"

4. **最后说防御措施**：
   - 详细说明各种防御方法
   - 强调前后端都要做防御

### 重点强调

- ✅ **XSS 的三种类型**
- ✅ **CSRF Token 的原理**
- ✅ **HttpOnly 和 SameSite Cookie**
- ✅ **CSP 的作用**

### 可能的追问

**Q1: CSP 是什么？**

A: Content Security Policy（内容安全策略），通过 HTTP 响应头限制资源加载来源，防止 XSS 攻击。

```
Content-Security-Policy: 
  default-src 'self';  // 默认只允许同源
  script-src 'self' https://trusted.com;  // 脚本来源
  style-src 'self' 'unsafe-inline';  // 样式来源
  img-src *;  // 图片来源
  connect-src 'self' https://api.example.com;  // AJAX 来源
```

**Q2: 如何防止 Cookie 被盗取？**

A:
1. HttpOnly：防止 JavaScript 访问
2. Secure：只在 HTTPS 下传输
3. SameSite：限制第三方 Cookie
4. 设置合理的过期时间

**Q3: 什么是 DOM 型 XSS？**

A: DOM 型 XSS 不经过服务器，完全在客户端发生。攻击者通过修改 URL 参数等方式，让页面的 JavaScript 代码执行恶意操作。

**Q4: CSRF Token 为什么安全？**

A:
- Token 存储在服务器 Session 中
- 攻击者无法获取 Token（同源策略）
- 每次请求都验证 Token
- Token 可以设置过期时间

## 💻 代码示例

### 完整的 XSS 防御

```javascript
// XSS 防御工具类
class XSSDefense {
  // HTML 转义
  static escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  
  // 更完整的转义
  static sanitize(str) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    return str.replace(/[&<>"'/]/g, char => map[char]);
  }
  
  // 使用 DOMPurify 库（推荐）
  static clean(dirty) {
    return DOMPurify.sanitize(dirty);
  }
}

// 使用
const userInput = '<script>alert("XSS")</script>';
const safe = XSSDefense.sanitize(userInput);
element.innerHTML = safe;  // &lt;script&gt;alert("XSS")&lt;/script&gt;
```

### 完整的 CSRF 防御

```javascript
// Express CSRF 中间件
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(csrf({ cookie: true }));

// 渲染表单时传递 Token
app.get('/form', (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});

// 验证 Token
app.post('/submit', (req, res) => {
  // 中间件自动验证
  res.send('Success');
});

// 前端 AJAX 请求
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

fetch('/api/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({ data: 'value' })
});
```

## 🔗 相关知识点

- [跨域 (CORS)](./cors.md)
- [HTTP 协议](./http-versions.md)
- [浏览器缓存](../performance/cache-strategy.md)

## 📚 参考资料

- [OWASP XSS](https://owasp.org/www-community/attacks/xss/)
- [OWASP CSRF](https://owasp.org/www-community/attacks/csrf)
- [MDN - CSP](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP)
