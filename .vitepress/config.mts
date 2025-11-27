import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/study/',
  title: "StudyClue",
  description: "Your systematic guide to frontend interview preparation",
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Home', link: '/' },
      { text: 'CSS', link: '/questions/css/box-model' },
      { text: 'JavaScript', link: '/questions/javascript/data-types' },
      { text: 'Vue', link: '/questions/vue/vue2-vs-vue3' },
      { text: 'Browser', link: '/questions/browser/url-to-page' },
      { text: 'Network', link: '/questions/network/http-versions' },
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
        },
        {
          text: '性能优化',
          items: [
            { text: '绝对定位vs Transform', link: '/questions/performance/transform-vs-position' },
            { text: '强缓存和协商缓存', link: '/questions/performance/cache-strategy' }
          ]
        }
      ],
      
      // 性能优化页面也使用 CSS 的侧边栏
      '/questions/performance/': [
        {
          text: 'CSS',
          items: [
            { text: 'CSS盒模型', link: '/questions/css/box-model' },
            { text: '左固定右自适应布局', link: '/questions/css/layout-flex' },
            { text: 'Position定位', link: '/questions/css/position' },
            { text: '水平垂直居中', link: '/questions/css/center-methods' }
          ]
        },
        {
          text: '性能优化',
          items: [
            { text: '绝对定位vs Transform', link: '/questions/performance/transform-vs-position' },
            { text: '强缓存和协商缓存', link: '/questions/performance/cache-strategy' }
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
        }
      ],
      
      '/questions/network/': [
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
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/VinceHu/study' }
    ],

    footer: {
      message: '基于 MIT 许可发布',
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
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'keywords', content: '前端面试,面试题,CSS,JavaScript,Vue,面试指导' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&display=swap', rel: 'stylesheet' }]
  ]
})
