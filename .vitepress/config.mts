import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/StudyClue/',
  title: "StudyClue",
  description: "系统化的前端面试学习平台 - 标准答案、深度理解、面试技巧",
  lang: 'zh-CN',
  
  // SEO 优化：生成干净的 URL
  cleanUrls: true,
  
  // SEO 优化：生成 sitemap
  sitemap: {
    hostname: 'https://vincehu.github.io/StudyClue'
  },
  
  themeConfig: {
    logo: '/logo.svg',
    
    // 品牌色配置
    // 使用类似 Pinia 的绿色主题
    // --vp-c-brand-1: #42b883
    // --vp-c-brand-2: #35a372
    // --vp-c-brand-3: #299764
    
    nav: [
      { text: 'Home', link: '/' },
      { text: 'CSS', link: '/questions/css/box-model' },
      { text: 'JavaScript', link: '/questions/javascript/data-types' },
      { text: 'Vue', link: '/questions/vue/vue2-vs-vue3' },
      { text: 'Network', link: '/questions/browser/url-to-page' },
      { text: 'Performance', link: '/questions/performance/cache-strategy' },
      { text: '项目实战', link: '/projects/' },
      { text: 'Knowledge Map', link: '/knowledge-map/' }
    ],

    sidebar: {
      '/questions/css/': [
        {
          text: 'CSS',
          items: [
            { text: 'CSS盒模型', link: '/questions/css/box-model' },
            { text: '左固定右自适应布局', link: '/questions/css/layout-flex' },
            { text: 'Position定位', link: '/questions/css/position' },
            { text: '水平垂直居中', link: '/questions/css/center-methods' }
          ]
        }
      ],
      
      '/questions/javascript/': [
        {
          text: 'JavaScript 基础',
          items: [
            { text: '数据类型与检测', link: '/questions/javascript/data-types' },
            { text: 'var/let/const区别', link: '/questions/javascript/var-let-const' },
            { text: 'var作用域', link: '/questions/javascript/var-scope' }
          ]
        },
        {
          text: '数组操作',
          items: [
            { text: '数组的常见方法', link: '/questions/javascript/array-methods' },
            { text: '数组去重', link: '/questions/javascript/array-dedup' },
            { text: '对象数组去重', link: '/questions/javascript/object-array-dedup' }
          ]
        },
        {
          text: '原型与继承',
          items: [
            { text: '原型与原型链', link: '/questions/javascript/prototype-chain' }
          ]
        },
        {
          text: 'this 与函数',
          items: [
            { text: 'this 指向与箭头函数', link: '/questions/javascript/this-binding' },
            { text: 'call、apply、bind', link: '/questions/javascript/call-apply-bind' },
            { text: '闭包', link: '/questions/javascript/closure' },
            { text: '为什么需要闭包', link: '/questions/javascript/why-closure' }
          ]
        },
        {
          text: '异步编程',
          items: [
            { text: 'Promise详解', link: '/questions/javascript/promise' },
            { text: 'async/await原理', link: '/questions/javascript/async-await' },
            { text: '事件循环', link: '/questions/javascript/event-loop' }
          ]
        },
        {
          text: '对象操作',
          items: [
            { text: '深拷贝vs浅拷贝', link: '/questions/javascript/deep-clone' }
          ]
        }
      ],
      
      '/questions/vue/': [
        {
          text: 'Vue 核心概念',
          items: [
            { text: 'Vue 2 和 Vue 3 的区别', link: '/questions/vue/vue2-vs-vue3' },
            { text: 'Vue 生命周期', link: '/questions/vue/lifecycle' },
            { text: 'computed 和 watch 的区别', link: '/questions/vue/computed-vs-watch' }
          ]
        },
        {
          text: '指令与渲染',
          items: [
            { text: 'v-if 和 v-show 的区别', link: '/questions/vue/v-if-vs-v-show' },
            { text: 'Vue 的 diff 算法', link: '/questions/vue/diff-algorithm' }
          ]
        },
        {
          text: '组件通信',
          items: [
            { text: '组件通信方式', link: '/questions/vue/component-communication' }
          ]
        },
        {
          text: '原理机制',
          items: [
            { text: 'nextTick 原理', link: '/questions/vue/nextTick' }
          ]
        },
        {
          text: '状态管理',
          items: [
            { text: '用户信息存储', link: '/questions/vue/user-state' }
          ]
        }
      ],
      
      '/questions/browser/': [
        {
          text: '浏览器原理',
          items: [
            { text: '从 URL 到页面展示', link: '/questions/browser/url-to-page' },
            { text: '重绘与回流', link: '/questions/browser/repaint-reflow' }
          ]
        },
        {
          text: '网络协议',
          items: [
            { text: 'HTTP 版本对比', link: '/questions/network/http-versions' },
            { text: 'TCP 三次握手和四次挥手', link: '/questions/network/tcp-handshake' }
          ]
        },
        {
          text: '网络安全',
          items: [
            { text: '跨域 (CORS)', link: '/questions/network/cors' },
            { text: '前端安全 (XSS/CSRF)', link: '/questions/network/security' }
          ]
        }
      ],
      
      '/questions/network/': [
        {
          text: '浏览器原理',
          items: [
            { text: '从 URL 到页面展示', link: '/questions/browser/url-to-page' },
            { text: '重绘与回流', link: '/questions/browser/repaint-reflow' }
          ]
        },
        {
          text: '网络协议',
          items: [
            { text: 'HTTP 版本对比', link: '/questions/network/http-versions' },
            { text: 'TCP 三次握手和四次挥手', link: '/questions/network/tcp-handshake' }
          ]
        },
        {
          text: '网络安全',
          items: [
            { text: '跨域 (CORS)', link: '/questions/network/cors' },
            { text: '前端安全 (XSS/CSRF)', link: '/questions/network/security' }
          ]
        }
      ],
      
      '/questions/performance/': [
        {
          text: '性能优化',
          items: [
            { text: '强缓存和协商缓存', link: '/questions/performance/cache-strategy' },
            { text: '绝对定位vs Transform', link: '/questions/performance/transform-vs-position' }
          ]
        }
      ],
      
      '/projects/': [
        {
          text: '项目实战',
          items: [
            { text: '栏目介绍', link: '/projects/' }
          ]
        },
        {
          text: '性能优化类',
          items: [
            { text: '企业级大文件上传', link: '/projects/performance/large-file-upload' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/VinceHu/StudyClue' }
    ],

    footer: {
      message: '基于 MIT 许可发布 | <a href="/privacy">隐私政策</a>',
      copyright: 'Copyright © 2025-present'
    },

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3],
      label: '目录'
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },

  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },

  ignoreDeadLinks: true,

  head: [
    // Favicon
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/StudyClue/favicon.svg' }],
    ['link', { rel: 'alternate icon', type: 'image/x-icon', href: '/StudyClue/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', href: '/StudyClue/logo.svg' }],
    
    // SEO Meta Tags
    ['meta', { name: 'theme-color', content: '#42b883' }],
    ['meta', { name: 'keywords', content: '前端面试,面试题,JavaScript面试题,Vue面试题,CSS面试题,前端学习,面试指导,前端知识点,浏览器原理,网络协议,性能优化' }],
    ['meta', { name: 'author', content: 'VinceHu' }],
    
    // Open Graph / Facebook
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://vincehu.github.io/StudyClue/' }],
    ['meta', { property: 'og:title', content: 'StudyClue - 系统化的前端面试学习平台' }],
    ['meta', { property: 'og:description', content: '提供标准答案、深度理解、面试技巧，涵盖 JavaScript、Vue、CSS、浏览器原理、网络协议等核心知识点' }],
    ['meta', { property: 'og:image', content: 'https://vincehu.github.io/StudyClue/logo.svg' }],
    
    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:url', content: 'https://vincehu.github.io/StudyClue/' }],
    ['meta', { name: 'twitter:title', content: 'StudyClue - 系统化的前端面试学习平台' }],
    ['meta', { name: 'twitter:description', content: '提供标准答案、深度理解、面试技巧，涵盖 JavaScript、Vue、CSS、浏览器原理、网络协议等核心知识点' }],
    ['meta', { name: 'twitter:image', content: 'https://vincehu.github.io/StudyClue/logo.svg' }],
    
    // 百度站长验证（需要时添加）
    // ['meta', { name: 'baidu-site-verification', content: 'your-verification-code' }],
    
    // Google 站长验证（需要时添加）
    // ['meta', { name: 'google-site-verification', content: 'your-verification-code' }],
    
    // Fonts
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&display=swap', rel: 'stylesheet' }]
  ]
})
