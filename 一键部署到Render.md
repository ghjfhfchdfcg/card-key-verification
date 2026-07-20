# 🚀 一键部署到 Render（3步完成）

## 你的 GitHub 账号
- 用户名：`ghjfhfchdfcg`
- 仓库名：`kiro-cardkey-verification`

---

## 📦 第一步：创建 GitHub 仓库（30秒）

1. 访问：https://github.com/new
2. 填写仓库信息：
   - **Repository name**：`kiro-cardkey-verification`
   - **Description**：`Kiro卡密验证服务器 - 支持Render免费部署`
   - **Public**（公开）
   - ⚠️ **不要勾选**任何初始化选项（不要README、不要.gitignore、不要License）
3. 点击 **Create repository**

---

## 📤 第二步：推送代码到 GitHub（10秒）

仓库创建完成后，复制以下命令到PowerShell运行：

```powershell
cd "C:\Users\Administrator\Desktop\验证服务器升级版"
git push -u origin main --force
```

如果提示输入用户名密码：
- Username: `ghjfhfchdfcg`
- Password: 使用 GitHub Personal Access Token（不是密码）

**如何获取 Token：**
1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. Note: `Render Deploy`
4. 勾选：`repo`（完整访问权限）
5. 点击 "Generate token"
6. 复制 token（格式：`ghp_xxxxxxxxxxxx`）
7. 粘贴作为密码使用

---

## 🌐 第三步：部署到 Render（2分钟）

### 1. 登录 Render
访问：https://dashboard.render.com

### 2. 创建 Web Service
点击 **New +** → **Web Service**

### 3. 连接 GitHub
- 如果是第一次使用，点击 "Connect GitHub"
- 授权 Render 访问你的 GitHub

### 4. 选择仓库
找到并选择：`ghjfhfchdfcg/kiro-cardkey-verification`

### 5. 配置部署参数
填写以下信息：

| 字段 | 值 |
|------|-----|
| **Name** | `kiro-verify`（或任意名称） |
| **Region** | `Singapore`（新加坡，速度快） |
| **Branch** | `main` |
| **Root Directory** | 留空 |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 6. 点击 "Create Web Service"

### 7. 等待部署完成（3-5分钟）
- 你会看到部署日志滚动
- 完成后显示 "Live"

---

## ✅ 部署成功！

### 你会获得一个公网地址：
```
https://kiro-verify.onrender.com
```
（实际地址会根据你填写的 Name 生成）

### 这个地址的特点：
- ✅ **全球任何人都能访问**
- ✅ **24小时在线**（不需要你的电脑开机）
- ✅ **自动HTTPS加密**
- ✅ **永久免费**
- ✅ **自动SSL证书**

### 测试验证
访问：`https://kiro-verify.onrender.com`
应该能看到卡密验证界面

---

## 📋 第四步（可选）：部署卡密管理系统

如果你也想部署管理系统，重复上述步骤：

### GitHub 仓库名：
`kiro-cardkey-management`

### Render 配置：
- **Name**: `kiro-admin`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**（环境变量）:
  ```
  VERIFICATION_SERVER_URL = https://kiro-verify.onrender.com
  ```

---

## ⚠️ 注意事项

### 1. 免费版限制
- **休眠机制**：15分钟无访问会休眠，下次访问需要30秒唤醒
- **解决方案**：
  - 使用 UptimeRobot 定时ping（免费）
  - 或升级 Render 付费版（$7/月）

### 2. 数据库持久化
- 免费版使用临时存储，重启会丢失数据
- **建议**：
  - 使用外部数据库（如 Railway 免费PostgreSQL）
  - 或定期备份数据

### 3. 推送更新
以后修改代码后，只需：
```powershell
cd "C:\Users\Administrator\Desktop\验证服务器升级版"
git add .
git commit -m "更新说明"
git push
```
Render 会自动检测并重新部署

---

## 🎁 额外功能：自定义域名

### 免费二级域名
Render 自动提供：`xxx.onrender.com`

### 使用自己的域名
1. 在 Render 控制台点击 "Settings"
2. 找到 "Custom Domain"
3. 添加你的域名（例如：api.yourdomain.com）
4. 去你的域名服务商添加 CNAME 记录：
   ```
   CNAME api -> your-app.onrender.com
   ```
5. 等待 DNS 生效（5-30分钟）

---

## 🆘 常见问题

### Q1: push 失败怎么办？
**错误**: `fatal: unable to access`  
**解决**: 使用 GitHub Personal Access Token 作为密码

### Q2: 部署失败怎么办？
**检查**:
1. package.json 是否存在
2. Build Command 是否正确
3. Start Command 是否正确
4. 查看 Render 日志找错误

### Q3: 访问速度慢怎么办？
**原因**: Render 免费版服务器在国外  
**解决**: 
- 选择 Singapore 区域（最快）
- 或使用 Cloudflare CDN 加速

### Q4: 如何添加卡密？
**方法1**: 访问管理系统界面手动添加  
**方法2**: 使用 API：
```bash
curl -X POST https://kiro-verify.onrender.com/api/cardkeys \
  -H "Content-Type: application/json" \
  -d '{"cardKey":"KIRO-XXXX-XXXX-XXXX","credentialData":{}}'
```

---

## 📞 下一步

部署完成后，你就可以：
1. **发送验证地址给客户**：`https://kiro-verify.onrender.com`
2. **客户输入卡密验证**
3. **你在管理后台查看使用情况**

🎉 恭喜！你的卡密验证系统已经全球可访问了！
