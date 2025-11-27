---
title: 重绘 (Repaint) 与回流 (Reflow)
date: 2025-11-27
category: 浏览器
difficulty: 中级
tags: [重绘, 回流, 性能优化, 渲染, Layout]
related: [url-to-page.md, cache-strategy.md]
hasCode: true
---

# 重绘 (Repaint) 与回流 (Reflow)

## 📝 标准答案

### 核心要点

1. **回流 (Reflow/Layout)**：
   - 元素的几何属性（位置、尺寸）发生变化
   - 需要重新计算布局
   - 性能开销大

2. **重绘 (Repaint)**：
   - 元素的外观属性（颜色、背景）发生变化
   - 不影响布局
   - 性能开销相对较小

3. **关系**：
   - 回流必定引起重绘
   - 重绘不一定引起回流

4. **优化原则**：
   - 减少回流次数
   - 批量修改样式
   - 使用 transform 代替 top/left
   - 使用文档片段

### 详细说明

#### 什么是回流 (Reflow)

**定义**：当元素的几何属性（尺寸、位置）发生变化时，浏览器需要重新计算元素的几何属性，并重新构建渲染树的过程。

**触发回流的操作：**

```javascript
// 1. 添加/删除可见的 DOM 元素
document.body.appendChild(element);
element.remove();

// 2. 元素位置改变
element.style.top = '100px';
element.style.left = '100px';

// 3. 元素尺寸改变
element.style.width = '200px';
element.style.height = '100px';
element.style.padding = '10px';
element.style.margin = '10px';
element.style.border = '1px solid red';

// 4. 内容改变
element.textContent = 'New content';
element.innerHTML = '<div>New HTML</div>';

// 5. 页面初始渲染
// 6. 浏览器窗口尺寸改变
window.addEventListener('resize', () => {
  // 触发回流
});

// 7. 获取某些属性（强制同步布局）
const height = element.offsetHeight;
const width = element.offsetWidth;
const top = element.offsetTop;
const left = element.offsetLeft;
const scrollTop = element.scrollTop;
const clientHeight = element.clientHeight;
```

#### 什么是重绘 (Repaint)

**定义**：当元素的外观属性（颜色、背景、阴影等）发生变化，但不影响布局时，浏览器只需要重新绘制元素的过程。

**触发重绘的操作：**

```javascript
// 1. 颜色改变
element.style.color = 'red';
element.style.backgroundColor = 'blue';

// 2. 边框样式改变（不改变宽度）
element.style.borderStyle = 'dashed';
element.style.borderColor = 'red';

// 3. 阴影改变
element.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
element.style.textShadow = '1px 1px 2px black';

// 4. 可见性改变
element.style.visibility = 'hidden';  // 重绘，不回流
element.style.opacity = 0.5;

// 5. 背景图片改变
element.style.backgroundImage = 'url(image.jpg)';
```

## 🧠 深度理解

### 回流 vs 重绘对比

| 特性 | 回流 (Reflow) | 重绘 (Repaint) |
|------|--------------|---------------|
| 定义 | 重新计算布局 | 重新绘制外观 |
| 触发条件 | 几何属性变化 | 外观属性变化 |
| 性能开销 | 大 | 相对较小 |
| 影响范围 | 可能影响整个文档 | 只影响元素本身 |
| 是否触发重绘 | 是 | 否 |

### 触发回流的属性

```javascript
// 盒模型相关
width, height, padding, margin, border

// 定位相关
position, top, right, bottom, left

// 浮动和清除
float, clear

// 尺寸相关
min-width, max-width, min-height, max-height

// 文本相关
font-size, font-family, font-weight, line-height, text-align, vertical-align, white-space

// 显示相关
display, overflow, overflow-x, overflow-y
```

### 只触发重绘的属性

```javascript
// 颜色相关
color, background-color, border-color

// 边框样式
border-style, border-radius

// 阴影
box-shadow, text-shadow

// 轮廓
outline, outline-color, outline-style, outline-width

// 可见性
visibility, opacity

// 背景
background, background-image, background-position, background-repeat, background-size
```

### 强制同步布局 (Forced Synchronous Layout)

```javascript
// ❌ 错误：频繁读取布局属性，导致强制同步布局
function badExample() {
  for (let i = 0; i < 1000; i++) {
    const element = document.getElementById(`item-${i}`);
    
    // 读取布局属性，触发回流
    const height = element.offsetHeight;
    
    // 修改样式，标记需要回流
    element.style.height = height + 10 + 'px';
    
    // 下次读取时，浏览器被迫立即执行回流
  }
}

// ✅ 正确：批量读取，批量写入
function goodExample() {
  const heights = [];
  
  // 批量读取
  for (let i = 0; i < 1000; i++) {
    const element = document.getElementById(`item-${i}`);
    heights.push(element.offsetHeight);
  }
  
  // 批量写入
  for (let i = 0; i < 1000; i++) {
    const element = document.getElementById(`item-${i}`);
    element.style.height = heights[i] + 10 + 'px';
  }
}
```

### 浏览器的优化机制

**渲染队列机制：**

```javascript
// 浏览器会将多次修改放入队列，批量执行
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';
// 浏览器会合并这些操作，只触发一次回流

// 但如果读取布局属性，会强制刷新队列
element.style.width = '100px';
const width = element.offsetWidth;  // 强制刷新队列，触发回流
element.style.height = '100px';  // 又触发一次回流
```

### 减少回流的方法

#### 1. 批量修改样式

```javascript
// ❌ 错误：逐个修改
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';

// ✅ 方法1：使用 cssText
element.style.cssText = 'width: 100px; height: 100px; margin: 10px;';

// ✅ 方法2：使用 class
element.className = 'new-style';

// ✅ 方法3：使用 classList
element.classList.add('new-style');
```

#### 2. 离线操作 DOM

```javascript
// ❌ 错误：直接操作 DOM
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  ul.appendChild(li);  // 每次都触发回流
}

// ✅ 方法1：使用文档片段
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  fragment.appendChild(li);
}
ul.appendChild(fragment);  // 只触发一次回流

// ✅ 方法2：先隐藏元素
ul.style.display = 'none';
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  ul.appendChild(li);
}
ul.style.display = 'block';  // 只触发一次回流

// ✅ 方法3：克隆节点
const clone = ul.cloneNode(true);
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  clone.appendChild(li);
}
ul.parentNode.replaceChild(clone, ul);  // 只触发一次回流
```

#### 3. 使用 transform 代替 top/left

```javascript
// ❌ 错误：修改 top/left，触发回流
element.style.top = '100px';
element.style.left = '100px';

// ✅ 正确：使用 transform，只触发合成
element.style.transform = 'translate(100px, 100px)';
```

**原理：**
- `top/left` 改变元素在文档流中的位置，触发回流
- `transform` 在合成层操作，不触发回流

#### 4. 使用 will-change 提示浏览器

```css
.element {
  /* 提示浏览器该元素会发生变化，创建独立图层 */
  will-change: transform, opacity;
}
```

```javascript
// 动态添加
element.style.willChange = 'transform';

// 动画结束后移除
element.addEventListener('transitionend', () => {
  element.style.willChange = 'auto';
});
```

#### 5. 避免使用 table 布局

```html
<!-- ❌ table 布局：一个单元格变化，整个表格回流 -->
<table>
  <tr>
    <td>Cell 1</td>
    <td>Cell 2</td>
  </tr>
</table>

<!-- ✅ flex/grid 布局：局部回流 -->
<div style="display: flex;">
  <div>Cell 1</div>
  <div>Cell 2</div>
</div>
```

#### 6. 使用虚拟滚动

```javascript
// 长列表优化：只渲染可见区域
class VirtualScroll {
  constructor(container, items, itemHeight) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
    
    this.render();
    this.container.addEventListener('scroll', () => this.render());
  }
  
  render() {
    const scrollTop = this.container.scrollTop;
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = startIndex + this.visibleCount;
    
    // 只渲染可见区域的元素
    const visibleItems = this.items.slice(startIndex, endIndex);
    
    this.container.innerHTML = '';
    visibleItems.forEach((item, index) => {
      const div = document.createElement('div');
      div.style.height = this.itemHeight + 'px';
      div.style.transform = `translateY(${(startIndex + index) * this.itemHeight}px)`;
      div.textContent = item;
      this.container.appendChild(div);
    });
  }
}
```

### 常见误区

1. **误区：display: none 不触发回流**
   ```javascript
   // ❌ 错误理解
   element.style.display = 'none';  // 触发回流（元素从渲染树移除）
   
   // visibility: hidden 只触发重绘
   element.style.visibility = 'hidden';  // 只触发重绘
   ```

2. **误区：opacity 触发回流**
   ```javascript
   // ✅ opacity 只触发重绘（如果有独立图层，只触发合成）
   element.style.opacity = 0.5;
   ```

3. **误区：所有 CSS 属性都会触发回流或重绘**
   ```javascript
   // ✅ transform 和 opacity 在独立图层上只触发合成
   element.style.transform = 'translateX(100px)';
   element.style.opacity = 0.5;
   ```

### 进阶知识

#### 1. 图层 (Layer)

```css
/* 创建独立图层的方式 */

/* 1. 3D transform */
.element {
  transform: translateZ(0);
  /* 或 */
  transform: translate3d(0, 0, 0);
}

/* 2. will-change */
.element {
  will-change: transform;
}

/* 3. video、canvas、iframe */

/* 4. position: fixed */
.element {
  position: fixed;
}

/* 5. CSS 动画或过渡 */
.element {
  animation: slide 1s;
}
```

**图层的优势：**
- 独立渲染，不影响其他元素
- GPU 加速
- 只触发合成，不触发回流/重绘

**图层的劣势：**
- 占用内存
- 过多图层反而降低性能

#### 2. 渲染流程

```
JavaScript → Style → Layout → Paint → Composite
   ↓           ↓        ↓        ↓         ↓
修改 DOM   计算样式   计算布局   绘制像素   合成图层
```

**不同操作触发的流程：**

```javascript
// 1. 修改几何属性：完整流程
element.style.width = '100px';
// JavaScript → Style → Layout → Paint → Composite

// 2. 修改外观属性：跳过 Layout
element.style.color = 'red';
// JavaScript → Style → Paint → Composite

// 3. 修改 transform/opacity：跳过 Layout 和 Paint
element.style.transform = 'translateX(100px)';
// JavaScript → Style → Composite
```

## 💡 面试回答技巧

### 推荐回答顺序

1. **先说定义**：
   - "回流是重新计算元素的几何属性和布局"
   - "重绘是重新绘制元素的外观"

2. **再说区别**：
   - "回流影响布局，重绘只影响外观"
   - "回流性能开销大，重绘相对较小"
   - "回流必定引起重绘，重绘不一定引起回流"

3. **然后说触发条件**：
   - "回流：修改尺寸、位置、添加删除元素"
   - "重绘：修改颜色、背景、阴影"

4. **最后说优化方法**：
   - "批量修改样式"
   - "使用文档片段"
   - "使用 transform 代替 top/left"
   - "避免频繁读取布局属性"

### 重点强调

- ✅ **回流的性能开销远大于重绘**
- ✅ **强制同步布局的危害**
- ✅ **transform 和 opacity 的优势**
- ✅ **批量操作的重要性**

### 可能的追问

**Q1: 为什么 transform 性能更好？**

A:
- `transform` 在合成层操作，不触发回流和重绘
- 可以利用 GPU 加速
- 不影响文档流中的其他元素

**Q2: 如何检测页面的回流和重绘？**

A:
```javascript
// 1. Chrome DevTools Performance 面板
// 2. 使用 Performance API
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Layout:', entry.duration);
  }
});
observer.observe({ entryTypes: ['measure'] });

// 3. 使用 requestAnimationFrame 监控帧率
let lastTime = performance.now();
let frames = 0;

function checkFPS() {
  const now = performance.now();
  frames++;
  
  if (now >= lastTime + 1000) {
    const fps = Math.round((frames * 1000) / (now - lastTime));
    console.log('FPS:', fps);
    frames = 0;
    lastTime = now;
  }
  
  requestAnimationFrame(checkFPS);
}

checkFPS();
```

**Q3: 什么是合成 (Composite)？**

A:
- 合成是将多个图层合并成最终图像的过程
- 在 GPU 上执行，性能很好
- 只修改 transform 和 opacity 时，只触发合成

**Q4: 如何优化动画性能？**

A:
```css
/* 1. 只使用 transform 和 opacity */
.element {
  animation: slide 1s;
}

@keyframes slide {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100px);
    opacity: 0;
  }
}

/* 2. 使用 will-change 提示 */
.element {
  will-change: transform, opacity;
}

/* 3. 使用 GPU 加速 */
.element {
  transform: translateZ(0);
}
```

## 💻 代码示例

### 性能对比测试

```javascript
// 测试回流 vs 重绘 vs 合成的性能
function testPerformance() {
  const element = document.getElementById('test');
  const iterations = 1000;
  
  // 测试1：回流（修改 width）
  console.time('Reflow');
  for (let i = 0; i < iterations; i++) {
    element.style.width = (100 + i) + 'px';
  }
  console.timeEnd('Reflow');  // 约 50ms
  
  // 测试2：重绘（修改 color）
  console.time('Repaint');
  for (let i = 0; i < iterations; i++) {
    element.style.color = `rgb(${i % 255}, 0, 0)`;
  }
  console.timeEnd('Repaint');  // 约 20ms
  
  // 测试3：合成（修改 transform）
  console.time('Composite');
  for (let i = 0; i < iterations; i++) {
    element.style.transform = `translateX(${i}px)`;
  }
  console.timeEnd('Composite');  // 约 5ms
}
```

### 优化实战

```javascript
// 优化前：频繁触发回流
function badAnimation() {
  const element = document.getElementById('box');
  let left = 0;
  
  setInterval(() => {
    left += 1;
    element.style.left = left + 'px';  // 每次都触发回流
  }, 16);
}

// 优化后：使用 transform
function goodAnimation() {
  const element = document.getElementById('box');
  let x = 0;
  
  function animate() {
    x += 1;
    element.style.transform = `translateX(${x}px)`;  // 只触发合成
    requestAnimationFrame(animate);
  }
  
  animate();
}

// 批量操作优化
function batchUpdate() {
  const elements = document.querySelectorAll('.item');
  
  // ❌ 错误：读写交替
  elements.forEach(el => {
    const height = el.offsetHeight;  // 读
    el.style.height = height + 10 + 'px';  // 写
  });
  
  // ✅ 正确：批量读，批量写
  const heights = Array.from(elements).map(el => el.offsetHeight);
  elements.forEach((el, i) => {
    el.style.height = heights[i] + 10 + 'px';
  });
}
```

## 🔗 相关知识点

- [从输入 URL 到页面展示](./url-to-page.md)
- [浏览器缓存策略](../performance/cache-strategy.md)
- [CSS 性能优化](../css/performance.md)

## 📚 参考资料

- [渲染性能](https://developers.google.com/web/fundamentals/performance/rendering)
- [避免大型、复杂的布局和布局抖动](https://developers.google.com/web/fundamentals/performance/rendering/avoid-large-complex-layouts-and-layout-thrashing)
- [CSS Triggers](https://csstriggers.com/)
