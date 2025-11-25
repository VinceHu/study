import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/study/',
  title: "StudyClue",
  description: "Your systematic guide to frontend interview preparation",
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '首页', link: '/' },
      { text: 'CSS', link: '/questions/css/box-model' },
      { text: 'JavaScript', link: '/questions/javascript/array-dedup' },
      { text: 'Vue', link: '/questions/vue/user-state' },
      { text: '知识图谱', link: '/knowledge-map/' }
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
            { text: '绝对定位vs Transform', link: '/questions/performance/transform-vs-position' }
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
            { text: '绝对定位vs Transform', link: '/questions/performance/transform-vs-position' }
          ]
        }
      ],
      
      '/questions/javascript/': [
        {
          text: 'JavaScript',
          items: [
            { text: '数组的常见方法', link: '/questions/javascript/array-methods' },
            { text: '数组去重', link: '/questions/javascript/array-dedup' },
            { text: '对象数组去重', link: '/questions/javascript/object-array-dedup' },
            { text: 'Promise详解', link: '/questions/javascript/promise' },
            { text: '事件循环', link: '/questions/javascript/event-loop' },
            { text: 'var/let/const区别', link: '/questions/javascript/var-let-const' },
            { text: 'var作用域', link: '/questions/javascript/var-scope' },
            { text: '闭包', link: '/questions/javascript/closure' },
            { text: '为什么需要闭包', link: '/questions/javascript/why-closure' }
          ]
        }
      ],
      
      '/questions/vue/': [
        {
          text: 'Vue',
          items: [
            { text: '用户信息存储', link: '/questions/vue/user-state' },
            { text: 'nextTick原理', link: '/questions/vue/nextTick' }
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
