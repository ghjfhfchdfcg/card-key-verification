/**
 * Kiro 卡密验证服务器 - 升级版
 * 新增：管理接口 /api/cardkeys/all
 */

const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // 允许外网访问

// ⭐ 验证码存储（简单内存存储）
const captchaStore = new Map();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 数据库初始化（Railway持久化支持）
const fs = require('fs');

// 确保数据目录存在（Railway Volume挂载点）
const dataDir = process.env.DATA_DIR || './data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`✅ 创建数据目录: ${dataDir}`);
}

const dbPath = path.join(dataDir, 'cardkeys.db');
console.log(`📁 数据库路径: ${dbPath}`);

let db;
try {
  db = new Database(dbPath);
  console.log('✅ 数据库连接成功');
  initDatabase();
} catch (err) {
  console.error('数据库连接失败:', err);
  process.exit(1);
}

// 初始化数据库表
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS card_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_key TEXT UNIQUE NOT NULL,
      credential_data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      used_at DATETIME,
      status TEXT DEFAULT 'unused',
      used_by TEXT,
      ip_address TEXT,
      user_agent TEXT
    )
  `);
  console.log('✅ 数据库表已就绪');
}

// ==================== 用户接口 ====================

/**
 * 生成验证码
 */
app.get('/api/captcha', (req, res) => {
  const sessionId = Date.now() + '-' + Math.random().toString(36).substring(7);
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const answer = num1 + num2;
  
  // 存储答案（10分钟过期）
  captchaStore.set(sessionId, {
    answer,
    expires: Date.now() + 10 * 60 * 1000
  });
  
  // 清理过期验证码
  for (const [key, value] of captchaStore.entries()) {
    if (value.expires < Date.now()) {
      captchaStore.delete(key);
    }
  }
  
  res.json({
    success: true,
    sessionId,
    question: `${num1} + ${num2} = ?`
  });
});

/**
 * 验证卡密
 */
app.post('/api/verify', (req, res) => {
  try {
    const { cardKey, captchaSessionId, captchaAnswer } = req.body;
    
    // 验证码检查
    if (!captchaSessionId || !captchaAnswer) {
      return res.json({
        success: false,
        error: 'Missing captcha',
        message: '请输入验证码'
      });
    }
    
    const captcha = captchaStore.get(captchaSessionId);
    if (!captcha) {
      return res.json({
        success: false,
        error: 'Invalid captcha session',
        message: '验证码已过期，请刷新页面重新获取'
      });
    }
    
    if (captcha.expires < Date.now()) {
      captchaStore.delete(captchaSessionId);
      return res.json({
        success: false,
        error: 'Captcha expired',
        message: '验证码已过期，请刷新页面重新获取'
      });
    }
    
    if (parseInt(captchaAnswer) !== captcha.answer) {
      return res.json({
        success: false,
        error: 'Wrong captcha',
        message: '验证码错误'
      });
    }
    
    // 验证通过后删除验证码
    captchaStore.delete(captchaSessionId);
    
    // 验证格式
    if (!cardKey || !cardKey.match(/^KIRO-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/)) {
      return res.json({
        success: false,
        error: 'Invalid cardKey format',
        message: '卡密格式不正确，应为: KIRO-XXXX-XXXX-XXXX'
      });
    }
    
    // 查询卡密
    const stmt = db.prepare('SELECT * FROM card_keys WHERE card_key = ?');
    const row = stmt.get(cardKey);
    
    if (!row) {
      return res.json({
        success: false,
        error: 'CardKey not found',
        message: '卡密不存在'
      });
    }
    
    if (row.status === 'used') {
      return res.json({
        success: false,
        error: 'CardKey already used',
        message: `卡密已于 ${new Date(row.used_at).toLocaleString('zh-CN')} 使用过`
      });
    }
    
    // 标记为已使用
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    const updateStmt = db.prepare(`
      UPDATE card_keys
      SET status = 'used',
          used_at = CURRENT_TIMESTAMP,
          ip_address = ?,
          user_agent = ?
      WHERE card_key = ?
    `);
    
    updateStmt.run(ipAddress, userAgent, cardKey);
    
    // 返回凭证
    const credential = JSON.parse(row.credential_data);
    
    res.json({
      success: true,
      message: '验证成功',
      credential: credential
    });
    
    console.log(`[验证] 卡密 ${cardKey} 已被使用 - IP: ${ipAddress}`);
    
  } catch (error) {
    console.error('验证失败:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: '服务器错误'
    });
  }
});

/**
 * 获取统计信息（公开）
 */
app.get('/api/stats', (req, res) => {
  try {
    const totalRow = db.prepare('SELECT COUNT(*) as total FROM card_keys').get();
    
    res.json({
      success: true,
      totalCardKeys: totalRow.total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== 管理接口（新增） ====================

/**
 * 获取所有卡密（供管理系统同步）
 */
app.get('/api/cardkeys/all', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        card_key as cardKey,
        credential_data as credentialData,
        created_at as createdAt,
        used_at as usedAt,
        status,
        used_by as usedBy,
        ip_address as ipAddress
      FROM card_keys
      ORDER BY created_at DESC
    `);
    
    const rows = stmt.all();
    
    // 解析 credential_data
    const cardKeys = rows.map(row => ({
      cardKey: row.cardKey,
      credentialData: JSON.parse(row.credentialData || '{}'),
      createdAt: row.createdAt,
      usedAt: row.usedAt,
      status: row.status,
      usedBy: row.usedBy,
      ipAddress: row.ipAddress
    }));
    
    res.json({
      success: true,
      cardKeys: cardKeys,
      total: cardKeys.length
    });
    
  } catch (error) {
    console.error('获取卡密列表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 添加卡密（管理接口）
 */
app.post('/api/cardkeys', (req, res) => {
  try {
    const { cardKey, credentialData } = req.body;
    
    if (!cardKey) {
      return res.status(400).json({
        success: false,
        error: '卡密不能为空'
      });
    }
    
    // 验证格式
    if (!cardKey.match(/^KIRO-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/)) {
      return res.status(400).json({
        success: false,
        error: '卡密格式不正确'
      });
    }
    
    const stmt = db.prepare(`
      INSERT INTO card_keys (card_key, credential_data)
      VALUES (?, ?)
    `);
    
    const result = stmt.run(cardKey, JSON.stringify(credentialData));
    
    res.json({
      success: true,
      id: result.lastInsertRowid,
      cardKey
    });
    
    console.log(`[添加] 新卡密: ${cardKey}`);
    
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(409).json({
        success: false,
        error: '卡密已存在'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 批量添加卡密（管理接口）
 */
app.post('/api/cardkeys/batch', (req, res) => {
  try {
    const { cardKeys } = req.body;
    
    if (!Array.isArray(cardKeys) || cardKeys.length === 0) {
      return res.status(400).json({
        success: false,
        error: '卡密列表不能为空'
      });
    }
    
    const stmt = db.prepare('INSERT OR IGNORE INTO card_keys (card_key, credential_data) VALUES (?, ?)');
    
    let successCount = 0;
    let errorCount = 0;
    
    const insertMany = db.transaction((cards) => {
      for (const item of cards) {
        try {
          const result = stmt.run(item.cardKey, JSON.stringify(item.credentialData || {}));
          if (result.changes > 0) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }
    });
    
    insertMany(cardKeys);
    
    console.log(`[批量添加] 成功: ${successCount}, 失败: ${errorCount}`);
    
    res.json({
      success: true,
      successCount,
      errorCount,
      total: cardKeys.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 删除卡密（管理接口）⭐ 新增
 */
app.delete('/api/cardkeys/:cardKey', (req, res) => {
  try {
    const { cardKey } = req.params;
    
    const stmt = db.prepare('DELETE FROM card_keys WHERE card_key = ?');
    const result = stmt.run(cardKey);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: '卡密不存在'
      });
    }
    
    console.log(`[删除] 卡密已删除: ${cardKey}`);
    
    res.json({
      success: true,
      message: '删除成功'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== 前端页面 ====================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== 启动服务器 ====================

app.listen(PORT, HOST, () => {
  // 获取本机IP地址
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  Object.keys(interfaces).forEach(name => {
    interfaces[name].forEach(net => {
      if (net.family === 'IPv4' && !net.internal) {
        localIP = net.address;
      }
    });
  });
  
  console.log(`
╔══════════════════════════════════════════════╗
║   🎫 Kiro 卡密验证服务器（升级版）            ║
║                                              ║
║   本地访问: http://localhost:${PORT}         ║
║   局域网访问: http://${localIP}:${PORT}      ║
║                                              ║
║   用户接口:                                  ║
║   - POST /api/verify          验证卡密       ║
║   - GET  /api/stats           统计信息       ║
║                                              ║
║   管理接口（新增）:                           ║
║   - GET    /api/cardkeys/all  获取所有卡密   ║
║   - POST   /api/cardkeys      添加卡密       ║
║   - POST   /api/cardkeys/batch 批量添加      ║
║   - DELETE /api/cardkeys/:key  删除卡密      ║
║                                              ║
╚══════════════════════════════════════════════╝
  `);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  db.close();
  console.log('✅ 数据库已关闭');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n正在关闭服务器...');
  db.close();
  console.log('✅ 数据库已关闭');
  process.exit(0);
});
