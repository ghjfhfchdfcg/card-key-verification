# 🎫 Kiro 卡密验证服务器

升级版卡密验证系统，支持管理接口和自动同步。

## 功能特性

- ✅ 卡密验证（POST /api/verify）
- ✅ 统计信息（GET /api/stats）
- ✅ 管理接口（获取/添加/删除卡密）
- ✅ 批量操作支持
- ✅ SQLite数据库存储

## API 文档

### 用户接口

#### 验证卡密
```bash
POST /api/verify
Content-Type: application/json

{
  "cardKey": "KIRO-XXXX-XXXX-XXXX"
}
```

### 管理接口

#### 获取所有卡密
```bash
GET /api/cardkeys/all
```

#### 添加卡密
```bash
POST /api/cardkeys
Content-Type: application/json

{
  "cardKey": "KIRO-XXXX-XXXX-XXXX",
  "credentialData": { /* 凭证数据 */ }
}
```

#### 删除卡密
```bash
DELETE /api/cardkeys/:cardKey
```

## 部署

### 本地运行
```bash
npm install
npm start
```

### Render部署
1. Fork 本仓库
2. 在 Render 创建 Web Service
3. 连接 GitHub 仓库
4. 自动部署完成

## 环境变量

- `PORT`: 端口号（默认3000）
- `HOST`: 监听地址（默认0.0.0.0）

## License

MIT
