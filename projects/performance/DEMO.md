# 大文件上传 Demo 说明

## 🎯 如何运行 Demo

由于这是一个完整的前后端项目，需要分别启动前端和后端服务。

### 方式一：在线 Demo（推荐）

访问在线 Demo：[https://your-demo-url.com](https://your-demo-url.com)

### 方式二：本地运行

#### 1. 创建项目目录

```bash
mkdir large-file-upload-demo
cd large-file-upload-demo
```

#### 2. 创建前端项目

```bash
# 使用 Vite 创建 Vue 3 项目
npm create vite@latest client -- --template vue-ts
cd client
npm install

# 安装依赖
npm install element-plus axios spark-md5
npm install @element-plus/icons-vue

# 安装类型定义
npm install -D @types/spark-md5
```

#### 3. 创建后端项目

```bash
cd ..
mkdir server
cd server
npm init -y

# 安装依赖
npm install express multer fs-extra cors
npm install -D nodemon
```

#### 4. 复制代码

将文章中的代码复制到对应的文件中：

**前端文件结构：**
```
client/
├── src/
│   ├── components/
│   │   └── FileUpload.vue
│   ├── composables/
│   │   └── useFileUpload.ts
│   ├── utils/
│   │   ├── file.ts
│   │   ├── hash.ts
│   │   └── request.ts
│   ├── workers/
│   │   └── hash.worker.ts
│   ├── App.vue
│   └── main.ts
```

**后端文件结构：**
```
server/
├── uploads/
├── index.js
└── upload.js
```

#### 5. 启动服务

```bash
# 启动后端（终端 1）
cd server
node index.js

# 启动前端（终端 2）
cd client
npm run dev
```

#### 6. 访问应用

打开浏览器访问：http://localhost:5173

## 📝 测试步骤

1. **选择文件**：点击上传区域或拖拽文件
2. **查看 Hash 计算**：观察 Hash 计算进度
3. **开始上传**：点击"开始上传"按钮
4. **查看进度**：观察整体进度和分片状态
5. **测试暂停**：点击"暂停"按钮
6. **测试继续**：点击"继续"按钮
7. **测试断点续传**：刷新页面，重新选择同一文件
8. **测试秒传**：上传完成后，重新选择同一文件

## 🎨 效果预览

### 主要功能界面

1. **文件选择界面**：支持点击选择或拖拽上传
2. **Hash 计算界面**：显示文件 Hash 计算进度
3. **上传进度界面**：显示整体进度和分片状态
4. **上传完成界面**：显示上传结果和文件信息

> 💡 提示：运行 Demo 后可以看到完整的交互效果

## 💡 注意事项

1. **文件大小限制**：建议测试文件大小在 100MB - 2GB 之间
2. **浏览器兼容性**：需要支持 Web Worker 和 File API 的现代浏览器
3. **服务器配置**：确保服务器有足够的磁盘空间
4. **网络环境**：建议在本地网络测试，避免公网带宽限制

## 🐛 常见问题

### Q: 上传失败怎么办？

A: 检查以下几点：
- 后端服务是否正常运行
- uploads 目录是否有写入权限
- 浏览器控制台是否有错误信息

### Q: Hash 计算很慢？

A: 这是正常的，大文件计算 Hash 需要时间。可以：
- 使用更快的电脑
- 减小测试文件大小
- 使用抽样计算（需要修改代码）

### Q: 如何部署到生产环境？

A: 需要考虑：
- 使用 OSS 存储文件
- 添加用户认证
- 添加文件类型和大小限制
- 添加上传速率限制
- 添加监控和日志

## 📚 扩展阅读

- [完整项目文档](./large-file-upload.md)
- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
