/**
 * Kiro 卡密验证服务器 - Render部署版（内存数据库）
 * 从卡密管理系统API同步数据
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// 卡密管理系统API地址（从环境变量读取，默认为Render部署的地址）
const CARD_MANAGEMENT_API = process.env.CARD_MANAGEMENT_API || 'https://card-key-verification-1.onrender.com/api';

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ⭐ 内存数据库（从管理系统同步）
let cardKeys = [];
let lastSyncTime = null;

// 初始化示例数据（仅用于本地开发）
function initLocalData() {
  if (process.env.NODE_ENV !== 'production') {
    cardKeys = [
      {
        card_key: 'KIRO-TEST-1234-5678',
        status: 'unused',
        created_at: Date.now(),
        used_at: null,
        ip_address: null,
        credential_data: JSON.stringify({
          email: 'test@example.com',
          provider: 'BuilderId',
          refreshToken: 'test_refresh_token_xxx',
          clientId: 'test_client_id',
          clientSecret: 'test_client_secret',
          region: 'us-west-2',
          machineId: 'test-machine-id'
        })
      }
    ];
    console.log('✅ 本地示例数据已加载');
  }
}

// 从管理系统同步卡密数据
async function syncFromManagementSystem() {
  try {
    const response = await fetch(`${CARD_MANAGEMENT_API}/cardkeys?limit=1000`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    if (result.data && Array.isArray(result.data)) {
      cardKeys = result.data;
      lastSyncTime = Date.now();
      console.log(`✅ 同步成功: ${cardKeys.length} 个卡密`);
    }
  } catch (error) {
    console.error('❌ 同步失败:', error.message);
    // 如果是第一次同步失败且没有数据，使用本地示例数据
    if (cardKeys.length === 0) {
      initLocalData();
    }
  }
}

// 启动时同步
syncFromManagementSystem();

// 定期同步（每30秒）
setInterval(syncFromManagementSystem, 30000);

// ==================== 用户接口 ====================

/**
 * 验证卡密
 */
app.post('/api/verify', (req, res) => {
  try {
    const { cardKey } = req.body;
    
    // 验证格式
    if (!cardKey || !cardKey.match(/^KIRO-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/)) {
      return res.json({
        success: false,
        error: 'Invalid cardKey format',
        message: '卡密格式不正确，应为: KIRO-XXXX-XXXX-XXXX'
      });
    }
    
    // 查询卡密
    const cardData = cardKeys.find(k => k.card_key === cardKey);
    
    if (!cardData) {
      return res.json({
        success: false,
        error: 'CardKey not found',
        message: '卡密不存在'
      });
    }
    
    if (cardData.status === 'used') {
      const usedTime = cardData.used_at ? new Date(cardData.used_at).toLocaleString('zh-CN') : '未知时间';
      return res.json({
        success: false,
        error: 'CardKey already used',
        message: `卡密已于 ${usedTime} 使用过`
      });
    }
    
    // 标记为已使用（本地更新）
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    cardData.status = 'used';
    cardData.used_at = Date.now();
    cardData.ip_address = ipAddress;
    
    // 解析凭证数据
    let credential = null;
    try {
      credential = typeof cardData.credential_data === 'string'
        ? JSON.parse(cardData.credential_data)
        : cardData.credential_data;
    } catch (err) {
      console.error('凭证数据解析失败:', err);
    }
    
    // 通知管理系统更新状态（异步，不等待结果）
    fetch(`${CARD_MANAGEMENT_API}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardKey })
    }).catch(err => console.error('通知管理系统失败:', err));
    
    // 返回成功
    res.json({
      success: true,
      message: '验证成功',
      credential: credential
    });
    
    console.log(`✅ 卡密验证成功: ${cardKey}`);
  } catch (error) {
    console.error('验证错误:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '服务器内部错误'
    });
  }
});

/**
 * 获取统计信息（不显示具体数量）
 */
app.get('/api/stats', (req, res) => {
  const total = cardKeys.length;
  const used = cardKeys.filter(k => k.status === 'used').length;
  const unused = total - used;
  
  res.json({
    success: true,
    totalCardKeys: total,
    used: used,
    unused: unused,
    lastSyncTime: lastSyncTime ? new Date(lastSyncTime).toISOString() : null
  });
});

/**
 * 健康检查
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    totalCardKeys: cardKeys.length,
    lastSyncTime: lastSyncTime ? new Date(lastSyncTime).toISOString() : null,
    managementAPI: CARD_MANAGEMENT_API
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

// 启动服务器
app.listen(PORT, HOST, () => {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   🎫 Kiro 卡密验证服务器 (Render版)         ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║   🌐 服务器: http://${HOST}:${PORT}         `);
  console.log(`║   📊 卡密数量: ${cardKeys.length}                              ║`);
  console.log(`║   🔄 同步源: ${CARD_MANAGEMENT_API.substring(0, 30)}...  ║`);
  console.log('╚══════════════════════════════════════════════╝');
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('⚠️ 收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️ 收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});
