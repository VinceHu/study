# GitHub 关联设置指南

## 📋 前提条件

1. 已有 GitHub 账号
2. 已在本地安装 Git

## 🚀 方式一：使用 HTTPS（推荐，简单）

### 步骤 1: 在 GitHub 创建仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `study`（或其他名称）
   - **Description**: `前端面试指导系统`
   - **Public** 或 **Private**（选择公开或私有）
   - ❌ **不要**勾选 "Initialize this repository with a README"
3. 点击 **Create repository**

### 步骤 2: 关联本地仓库

在 `interview-guide` 目录执行：

```bash
# 1. 切换到 HTTPS 地址
git remote set-url origin https://github.com/VinceHu/study.git

# 2. 推送代码
git push -u origin main
```

### 步骤 3: 输入 GitHub 凭证

首次推送时会要求输入：
- **Username**: 你的 GitHub 用户名
- **Password**: 使用 **Personal Access Token**（不是密码）

### 如何获取 Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 点击 **Generate new token** → **Generate new token (classic)**
3. 填写信息：
   - **Note**: `interview-guide`
   - **Expiration**: 选择过期时间（建议 90 days）
   - **Select scopes**: 勾选 `repo`（完整仓库访问权限）
4. 点击 **Generate token**
5. **复制 token**（只显示一次，保存好）

### 步骤 4: 使用 Token 推送

```bash
git push -u origin main

# 输入：
# Username: VinceHu
# Password: ghp_xxxxxxxxxxxxxxxxxxxx（你的 token）
```

### 保存凭证（可选）

避免每次都输入：

```bash
# macOS
git config --global credential.helper osxkeychain

# Windows
git config --global credential.helper wincred

# Linux
git config --global credential.helper store
```

---

## 🔐 方式二：使用 SSH（更安全）

### 步骤 1: 检查是否已有 SSH 密钥

```bash
ls -al ~/.ssh
```

如果看到 `id_rsa.pub` 或 `id_ed25519.pub`，说明已有密钥，跳到步骤 3。

### 步骤 2: 生成 SSH 密钥

```bash
# 生成新密钥（使用你的 GitHub 邮箱）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 如果系统不支持 ed25519，使用 RSA
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 按提示操作：
# - Enter file: 直接回车（使用默认路径）
# - Enter passphrase: 输入密码（可选，直接回车跳过）
```

### 步骤 3: 添加 SSH 密钥到 ssh-agent

```bash
# 启动 ssh-agent
eval "$(ssh-agent -s)"

# 添加密钥
ssh-add ~/.ssh/id_ed25519
# 或
ssh-add ~/.ssh/id_rsa
```

### 步骤 4: 复制公钥

```bash
# macOS
pbcopy < ~/.ssh/id_ed25519.pub

# Linux
cat ~/.ssh/id_ed25519.pub
# 然后手动复制输出内容

# Windows (Git Bash)
clip < ~/.ssh/id_ed25519.pub
```

### 步骤 5: 添加 SSH 密钥到 GitHub

1. 访问 https://github.com/settings/keys
2. 点击 **New SSH key**
3. 填写信息：
   - **Title**: `My Mac`（或其他描述）
   - **Key**: 粘贴刚才复制的公钥
4. 点击 **Add SSH key**

### 步骤 6: 测试 SSH 连接

```bash
ssh -T git@github.com

# 首次连接会提示：
# Are you sure you want to continue connecting (yes/no)?
# 输入 yes

# 成功会显示：
# Hi VinceHu! You've successfully authenticated...
```

### 步骤 7: 推送代码

```bash
# 确保使用 SSH 地址
git remote set-url origin git@github.com:VinceHu/study.git

# 推送
git push -u origin main
```

---

## 🔍 常见问题

### 1. 推送时提示 "Permission denied"

**原因：** SSH 密钥未配置或配置错误

**解决：**
```bash
# 检查 SSH 连接
ssh -T git@github.com

# 如果失败，切换到 HTTPS
git remote set-url origin https://github.com/VinceHu/study.git
```

### 2. 推送时提示 "Authentication failed"

**原因：** HTTPS 凭证错误

**解决：**
- 确保使用 Personal Access Token，不是密码
- 重新生成 token：https://github.com/settings/tokens

### 3. 推送时提示 "Repository not found"

**原因：** 仓库不存在或地址错误

**解决：**
```bash
# 检查远程地址
git remote -v

# 修改地址
git remote set-url origin https://github.com/VinceHu/study.git
```

### 4. 推送时提示 "Updates were rejected"

**原因：** 远程仓库有本地没有的提交

**解决：**
```bash
# 拉取远程更改
git pull origin main --rebase

# 再推送
git push -u origin main
```

### 5. 如何查看当前远程地址

```bash
git remote -v

# 输出：
# origin  https://github.com/VinceHu/study.git (fetch)
# origin  https://github.com/VinceHu/study.git (push)
```

### 6. 如何修改远程地址

```bash
# 修改为 HTTPS
git remote set-url origin https://github.com/VinceHu/study.git

# 修改为 SSH
git remote set-url origin git@github.com:VinceHu/study.git
```

---

## 📝 完整操作流程

### 使用 HTTPS（推荐新手）

```bash
# 1. 进入项目目录
cd interview-guide

# 2. 设置远程地址（HTTPS）
git remote set-url origin https://github.com/VinceHu/study.git

# 3. 推送代码
git push -u origin main

# 4. 输入凭证
# Username: VinceHu
# Password: ghp_xxxxxxxxxxxx（Personal Access Token）
```

### 使用 SSH（推荐有经验的用户）

```bash
# 1. 生成 SSH 密钥（如果没有）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. 添加公钥到 GitHub
# 访问 https://github.com/settings/keys

# 3. 测试连接
ssh -T git@github.com

# 4. 设置远程地址（SSH）
git remote set-url origin git@github.com:VinceHu/study.git

# 5. 推送代码
git push -u origin main
```

---

## 🎯 推送成功后

### 1. 查看仓库

访问：https://github.com/VinceHu/study

### 2. 启用 GitHub Pages

1. 进入仓库设置：https://github.com/VinceHu/study/settings/pages
2. **Source** 选择：**GitHub Actions**
3. 保存

### 3. 等待部署

1. 查看 Actions：https://github.com/VinceHu/study/actions
2. 等待构建完成（2-3分钟）

### 4. 访问网站

在线地址：https://vincehu.github.io/study

---

## 💡 推荐方式

### 对于新手
✅ **使用 HTTPS + Personal Access Token**
- 简单易用
- 不需要配置 SSH
- 适合快速开始

### 对于有经验的用户
✅ **使用 SSH**
- 更安全
- 不需要每次输入密码
- 适合长期使用

---

## 📞 需要帮助？

如果遇到问题：

1. 查看 GitHub 官方文档：
   - [HTTPS 设置](https://docs.github.com/en/get-started/getting-started-with-git/about-remote-repositories#cloning-with-https-urls)
   - [SSH 设置](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

2. 检查错误信息：
   ```bash
   git push -v origin main
   ```

3. 查看 Git 配置：
   ```bash
   git config --list
   ```

---

**提示：** 推荐使用 HTTPS 方式，更简单快捷！
