# Kiro 卡密验证+管理系统 v2.0

集成了验证系统和管理系统的完整解决方案,数据永久保存在SQLite数据库中。

## 功能特性

### ✅ 验证系统 (原有功能,完全保留)
- 卡密验证接口 (带验证码保护)
- 用户验证页面
- 统计信息API
- 批量添加卡密
- 自动记录使用信息(IP、时间、User-Agent)

### 🆕 管理系统 (新增)
- 实时查看所有卡密
- 查看使用状态和统计
- 数据自动同步
- 简洁美观的管理界面

## 系统架构

```
验证服务器升级版/
├── server.js              # 主服务器(验证+管理)
├── package.json           # 依赖配置
├── cardkeys.db            # SQLite数据库(自动创建)
└── public/
    ├── index.html         # 用户验证页面
    └── admin.html         # 管理员页面
```

## 部署到Render.com

### 1. 准备GitHub仓库

```bash
cd "C:\Users\Administrator\Desktop\验证服务器升级版"
git init
git add .
git commit -m "Kiro卡密验证+管理系统 v2.0"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

### 2. 在Render创建Web Service

1. 访问 https://render.com
2. 点击 "New +" → "Web Service"
3. 连接你的GitHub仓库
4. 配置:
   - **Name**: kiro-card-verification
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. 点击 "Create Web Service"

### 3. 等待部署完成

部署完成后,你会获得一个公网地址,例如:
```
https://kiro-card-verification.onrender.com
```

## 访问地址

部署成功后:

- **用户验证页面**: https://你的域名.onrender.com/
- **管理页面**: https://你的域名.onrender.com/admin
- **API基础地址**: https://你的域名.onrender.com/api

## API接口文档

### 用户接口(原有,完全保留)

#### 1. 获取验证码
```
GET /api/captcha
```

响应:
```json
{
  "success": true,
  "sessionId": "1234567890-abcdef",
  "question": "3 + 5 = ?"
}
```

#### 2. 验证卡密
```
POST /api/verify
Content-Type: application/json

{
  "cardKey": "KIRO-ABCD-1234-EFGH",
  "captchaSessionId": "1234567890-abcdef",
  "captchaAnswer": "8"
}
```

成功响应:
```json
{
  "success": true,
  "message": "验证成功",
  "credential": {
    "email": "user@example.com",
    "refreshToken": "xxx"
  }
}
```

失败响应:
```json
{
  "success": false,
  "error": "CardKey not found",
  "message": "卡密不存在"
}
```

#### 3. 获取统计
```
GET /api/stats
```

响应:
```json
{
  "success": true,
  "totalCardKeys": 100
}
```

### 管理接口(原有,完全保留)

#### 4. 获取所有卡密
```
GET /api/cardkeys/all
```

响应:
```json
{
  "success": true,
  "cardKeys": [
    {
      "cardKey": "KIRO-ABCD-1234-EFGH",
      "credentialData": {...},
      "createdAt": "2026-07-20 10:00:00",
      "usedAt": null,
      "status": "unused",
      "usedBy": null,
      "ipAddress": null
    }
  ],
  "total": 100
}
```

#### 5. 添加单个卡密
```
POST /api/cardkeys
Content-Type: application/json

{
  "cardKey": "KIRO-ABCD-1234-EFGH",
  "credentialData": {
    "email": "user@example.com",
    "refreshToken": "xxx"
  }
}
```

#### 6. 批量添加卡密
```
POST /api/cardkeys/batch
Content-Type: application/json

{
  "cardKeys": [
    {
      "cardKey": "KIRO-ABCD-1234-EFGH",
      "credentialData": {...}
    },
    {
      "cardKey": "KIRO-WXYZ-5678-IJKL",
      "credentialData": {...}
    }
  ]
}
```

#### 7. 删除卡密
```
DELETE /api/cardkeys/KIRO-ABCD-1234-EFGH
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动服务器
npm start

# 访问
# 用户页面: http://localhost:3000
# 管理页面: http://localhost:3000/admin
```

## 扩展通信

FlowPilot扩展会自动将生成的账号信息上传到验证服务器:

```javascript
// 扩展中的配置
const API_BASE = 'https://你的域名.onrender.com/api';

// 上传凭证
await fetch(`${API_BASE}/cardkeys`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cardKey: generatedCardKey,
    credentialData: {
      email: account.email,
      refreshToken: account.refreshToken,
      // ...其他信息
    }
  })
});
```

## 数据持久化

- SQLite数据库文件: `cardkeys.db`
- Render会自动持久化数据库文件
- 数据永不丢失
- 支持自动备份

## 安全建议

1. 建议为管理页面添加密码保护
2. 使用HTTPS连接(Render自动提供)
3. 定期备份数据库文件
4. 限制API访问频率

## 故障排查

### 数据库锁定
如果出现 "database is locked" 错误,重启服务即可。

### 端口被占用
默认端口3000,可通过环境变量 `PORT` 修改。

### 连接超时
Render免费版会在15分钟无活动后休眠,首次访问需要等待唤醒(约30秒)。

## 技术栈

- **后端**: Node.js + Express
- **数据库**: Better-SQLite3
- **前端**: 原生HTML/CSS/JavaScript
- **部署**: Render.com

## 版本历史

- **v2.0** (2026-07-20)
  - 新增管理界面 `/admin`
  - 保留所有原有验证功能
  - 优化数据库结构
  
- **v1.0**
  - 基础验证功能
  - 批量添加接口

## 许可证

MIT

## 支持

如有问题,请检查:
1. 数据库文件是否存在
2. 网络连接是否正常
3. 日志输出中的错误信息
