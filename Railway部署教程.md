# Railway.app 部署教程 - 免费永久存储方案

## 🎯 为什么选Railway?

- ✅ **完全免费** - 每月$5额度
- ✅ **自动持久化** - 数据永不丢失
- ✅ **无需改代码** - 支持SQLite
- ✅ **自动HTTPS** - 安全连接
- ✅ **全球CDN** - 访问速度快

---

## 📋 部署步骤

### 1️⃣ 注册Railway账号

1. 访问: https://railway.app
2. 点击右上角 **"Login"**
3. 选择 **"Login with GitHub"**
4. 授权Railway访问您的GitHub

### 2️⃣ 创建新项目

1. 登录后,点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 在列表中找到并选择: **`card-key-verification`**
4. 点击 **"Deploy Now"**

### 3️⃣ Railway自动配置

Railway会自动:
- ✅ 检测Node.js项目
- ✅ 安装依赖(`npm install`)
- ✅ 启动服务(`npm start`)
- ✅ 分配域名

**无需任何配置!**

### 4️⃣ 添加持久化存储(重要!)

**这一步很关键,确保数据永不丢失:**

1. 在项目页面,点击您的服务
2. 找到 **"Settings"** 标签
3. 滚动到 **"Volumes"** 区域
4. 点击 **"+ New Volume"**
5. 配置:
   - **Mount Path**: `/app/data`
   - **Size**: 1GB (免费够用)
6. 点击 **"Add"**

### 5️⃣ 添加环境变量

1. 在 **"Variables"** 标签
2. 点击 **"+ New Variable"**
3. 添加:
   ```
   NODE_ENV=production
   PORT=3000
   ```

### 6️⃣ 获取部署URL

1. 在 **"Settings"** → **"Domains"**
2. 点击 **"Generate Domain"**
3. 复制生成的URL(类似: `https://your-app.up.railway.app`)

### 7️⃣ 测试验证服务器

在浏览器打开您的Railway URL:
```
https://your-app.up.railway.app
```

应该看到验证服务器界面!

---

## 🔄 更新管理系统API地址

### 方法1: 在Railway部署管理系统

1. 重复上面的步骤,部署 `kiro-admin-panel` 仓库
2. 添加环境变量:
   ```
   VERIFICATION_API=https://your-verification-app.up.railway.app
   ```

### 方法2: 本地管理系统

修改 `C:\Users\Administrator\Desktop\卡密管理系统\server.js`:

```javascript
const VERIFICATION_API = 'https://your-verification-app.up.railway.app';
```

---

## 📊 确认数据持久化

### 测试步骤:

1. 在管理系统添加一个测试卡密
2. 在Railway项目点击 **"Redeploy"**
3. 等待重新部署完成
4. 访问验证服务器查看卡密列表
5. ✅ 测试卡密仍然存在 = 成功!

---

## 💾 数据库文件位置

Railway会自动将SQLite数据库保存在:
```
/app/data/cardkeys.db
```

这个文件会永久保存,即使重启也不会丢失!

---

## 🎁 Railway免费额度说明

### 免费计划包含:

- 💰 **$5/月** 免费额度
- ⏱️ **500小时/月** 运行时间(够用!)
- 💾 **1GB** 持久化存储
- 🌐 **自动HTTPS**
- 📊 **实时日志**

### 使用估算:

您的服务器很轻量:
- 约 **0.5GB RAM**
- 约 **0.1 vCPU**
- 月费用约 **$2-3**

**结论: 完全在免费额度内!** ✅

---

## 🔧 常见问题

### Q1: Railway需要绑定信用卡吗?

**A:** 不需要!可以直接使用GitHub登录

### Q2: 数据真的永不丢失吗?

**A:** 是的!只要配置了Volume持久化存储,数据会永久保存

### Q3: 如何查看日志?

**A:** Railway项目页面 → 点击服务 → **"Deployments"** 标签 → 实时日志

### Q4: 如何更新代码?

**A:** 推送代码到GitHub,Railway自动重新部署:
```bash
git add .
git commit -m "更新"
git push
```

### Q5: 国内访问速度如何?

**A:** Railway使用全球CDN,速度可接受(比Render快)

---

## 📱 手机查看部署状态

1. 下载Railway App(iOS/Android)
2. 随时查看服务状态
3. 查看实时日志

---

## 🎯 下一步

部署完成后:

1. ✅ 更新FlowPilot扩展的验证API地址
2. ✅ 更新管理系统的API地址
3. ✅ 测试注册流程
4. ✅ 添加卡密测试
5. ✅ 重启Railway服务测试数据持久化

---

## 🆘 需要帮助?

遇到问题可以:
1. 查看Railway文档: https://docs.railway.app
2. 查看实时日志排查问题
3. 联系我协助

---

## 🔗 重要链接

- Railway官网: https://railway.app
- 文档: https://docs.railway.app
- 状态页面: https://status.railway.app
- 社区: https://discord.gg/railway

---

**现在去Railway部署吧!5分钟搞定!** 🚀
