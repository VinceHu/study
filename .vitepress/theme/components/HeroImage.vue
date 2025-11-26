<template>
  <div class="hero-image-container">
    <svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg" class="hero-illustration">
      <!-- 背景装饰元素 -->
      <circle cx="100" cy="80" r="15" fill="#00bcd4" opacity="0.6" class="float-1"/>
      <circle cx="520" cy="120" r="20" fill="#ff4081" opacity="0.6" class="float-2"/>
      <rect x="480" y="50" width="30" height="30" fill="#ffeb3b" opacity="0.6" class="float-3" transform="rotate(45 495 65)"/>
      
      <!-- 主代码编辑器窗口 -->
      <g class="code-window">
        <!-- 窗口背景 -->
        <rect x="80" y="150" width="440" height="300" rx="0" fill="#2c3e50" stroke="#000" stroke-width="5"/>
        
        <!-- 窗口标题栏 -->
        <rect x="80" y="150" width="440" height="40" fill="#34495e" stroke="#000" stroke-width="5"/>
        <circle cx="105" cy="170" r="8" fill="#ff5f56" stroke="#000" stroke-width="2"/>
        <circle cx="130" cy="170" r="8" fill="#ffbd2e" stroke="#000" stroke-width="2"/>
        <circle cx="155" cy="170" r="8" fill="#27c93f" stroke="#000" stroke-width="2"/>
        
        <!-- 代码行 -->
        <rect x="110" y="210" width="180" height="12" rx="2" fill="#e74c3c"/>
        <rect x="110" y="235" width="240" height="12" rx="2" fill="#3498db"/>
        <rect x="130" y="260" width="200" height="12" rx="2" fill="#2ecc71"/>
        <rect x="130" y="285" width="160" height="12" rx="2" fill="#f39c12"/>
        <rect x="110" y="310" width="220" height="12" rx="2" fill="#9b59b6"/>
        <rect x="130" y="335" width="180" height="12" rx="2" fill="#1abc9c"/>
        <rect x="110" y="360" width="200" height="12" rx="2" fill="#e67e22"/>
        
        <!-- 代码高亮点 -->
        <circle cx="320" cy="216" r="4" fill="#ffeb3b" class="pulse"/>
        <circle cx="370" cy="241" r="4" fill="#ff4081" class="pulse" style="animation-delay: 0.5s"/>
        <circle cx="350" cy="266" r="4" fill="#00bcd4" class="pulse" style="animation-delay: 1s"/>
      </g>
      
      <!-- 浮动的文档卡片 -->
      <g class="doc-card float-card-1">
        <rect x="350" y="80" width="180" height="120" rx="0" fill="#00bcd4" stroke="#000" stroke-width="5"/>
        <text x="370" y="110" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="#000">面试题库</text>
        <rect x="370" y="125" width="140" height="8" rx="2" fill="#000" opacity="0.3"/>
        <rect x="370" y="145" width="120" height="8" rx="2" fill="#000" opacity="0.3"/>
        <rect x="370" y="165" width="100" height="8" rx="2" fill="#000" opacity="0.3"/>
      </g>
      
      <!-- 浮动的笔记卡片 -->
      <g class="note-card float-card-2">
        <rect x="40" y="280" width="160" height="140" rx="0" fill="#ffeb3b" stroke="#000" stroke-width="5"/>
        <text x="60" y="310" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="#000">学习笔记</text>
        <rect x="60" y="325" width="120" height="6" rx="2" fill="#000" opacity="0.3"/>
        <rect x="60" y="340" width="100" height="6" rx="2" fill="#000" opacity="0.3"/>
        <rect x="60" y="355" width="110" height="6" rx="2" fill="#000" opacity="0.3"/>
        <rect x="60" y="370" width="90" height="6" rx="2" fill="#000" opacity="0.3"/>
        <circle cx="70" cy="395" r="5" fill="#ff4081" stroke="#000" stroke-width="2"/>
        <circle cx="90" cy="395" r="5" fill="#00bcd4" stroke="#000" stroke-width="2"/>
        <circle cx="110" cy="395" r="5" fill="#8bc34a" stroke="#000" stroke-width="2"/>
      </g>
      
      <!-- 播放按钮图标 -->
      <g class="play-button">
        <circle cx="480" cy="250" r="35" fill="#ff4081" stroke="#000" stroke-width="5" class="pulse-big"/>
        <polygon points="470,235 470,265 495,250" fill="#fff" stroke="#000" stroke-width="3"/>
      </g>
      
      <!-- 装饰性元素 -->
      <text x="520" y="400" font-family="Arial, sans-serif" font-size="60" font-weight="900" fill="#8bc34a" opacity="0.3" class="rotate-slow">{ }</text>
      <text x="30" y="120" font-family="Arial, sans-serif" font-size="50" font-weight="900" fill="#ff5722" opacity="0.3" class="rotate-slow" style="animation-delay: 1s">&lt;/&gt;</text>
      
      <!-- 星星装饰 -->
      <polygon points="560,350 565,360 575,362 567,370 569,380 560,375 551,380 553,370 545,362 555,360" fill="#ffc107" stroke="#000" stroke-width="2" class="twinkle"/>
      <polygon points="90,450 93,456 100,457 95,462 96,469 90,465 84,469 85,462 80,457 87,456" fill="#e91e63" stroke="#000" stroke-width="2" class="twinkle" style="animation-delay: 0.7s"/>
      
      <!-- POW 文字效果 -->
      <text x="200" y="100" font-family="Arial, sans-serif" font-size="40" font-weight="900" fill="#ff5722" stroke="#000" stroke-width="3" class="pop-text">POW!</text>
    </svg>
  </div>
</template>

<style scoped>
.hero-image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-illustration {
  width: 100%;
  max-width: 600px;
  height: auto;
  filter: drop-shadow(8px 8px 0 rgba(0, 0, 0, 0.2));
}

/* 浮动动画 */
.float-1 {
  animation: float 3s ease-in-out infinite;
}

.float-2 {
  animation: float 4s ease-in-out infinite;
  animation-delay: 0.5s;
}

.float-3 {
  animation: float 3.5s ease-in-out infinite;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* 卡片浮动 */
.float-card-1 {
  animation: floatCard 4s ease-in-out infinite;
}

.float-card-2 {
  animation: floatCard 5s ease-in-out infinite;
  animation-delay: 1s;
}

@keyframes floatCard {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(2deg);
  }
}

/* 脉冲动画 */
.pulse {
  animation: pulse 2s ease-in-out infinite;
}

.pulse-big {
  animation: pulseBig 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    r: 4;
  }
  50% {
    opacity: 0.5;
    r: 6;
  }
}

@keyframes pulseBig {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 旋转动画 */
.rotate-slow {
  animation: rotateSlow 20s linear infinite;
  transform-origin: center;
}

@keyframes rotateSlow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 闪烁动画 */
.twinkle {
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

/* POP 文字动画 */
.pop-text {
  animation: popText 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

@keyframes popText {
  0%, 100% {
    transform: scale(1) rotate(-5deg);
  }
  50% {
    transform: scale(1.2) rotate(5deg);
  }
}

/* 代码窗口动画 */
.code-window {
  animation: slideIn 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes slideIn {
  from {
    transform: translateX(100px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .hero-illustration {
    max-width: 400px;
  }
}
</style>
