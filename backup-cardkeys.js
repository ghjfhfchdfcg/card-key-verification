/**
 * 卡密数据备份脚本
 * 定期备份数据到JSON文件和GitHub
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const Database = require('better-sqlite3');

const BACKUP_DIR = './backups';
const DB_FILE = './cardkeys.db';

// 创建备份目录
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * 导出数据库到JSON
 */
function exportToJSON() {
  try {
    const db = new Database(DB_FILE);
    
    // 获取所有卡密
    const cardKeys = db.prepare(`
      SELECT 
        card_key,
        credential_data,
        created_at,
        used_at,
        status,
        used_by,
        ip_address
      FROM card_keys
      ORDER BY created_at DESC
    `).all();
    
    // 生成备份文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `cardkeys-backup-${timestamp}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
    
    // 写入JSON文件
    const backupData = {
      backupTime: new Date().toISOString(),
      total: cardKeys.length,
      cardKeys: cardKeys
    };
    
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ 备份成功: ${filename}`);
    console.log(`📊 备份了 ${cardKeys.length} 个卡密`);
    
    db.close();
    
    return filepath;
    
  } catch (error) {
    console.error('❌ 备份失败:', error);
    throw error;
  }
}

/**
 * 提交到Git
 */
function commitToGit(filepath) {
  return new Promise((resolve, reject) => {
    const filename = path.basename(filepath);
    const commands = [
      'git add backups/*',
      `git commit -m "自动备份: ${filename}"`,
      'git push origin main'
    ].join(' && ');
    
    exec(commands, (error, stdout, stderr) => {
      if (error) {
        console.error('⚠️ Git提交失败:', error);
        reject(error);
        return;
      }
      console.log('✅ 已提交到GitHub');
      resolve(stdout);
    });
  });
}

/**
 * 清理旧备份(保留最近10个)
 */
function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('cardkeys-backup-'))
      .sort()
      .reverse();
    
    // 删除10个以外的旧备份
    files.slice(10).forEach(file => {
      fs.unlinkSync(path.join(BACKUP_DIR, file));
      console.log(`🗑️ 删除旧备份: ${file}`);
    });
    
  } catch (error) {
    console.error('清理旧备份失败:', error);
  }
}

/**
 * 恢复备份
 */
function restoreFromBackup(backupFile) {
  try {
    const data = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    const db = new Database(DB_FILE);
    
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO card_keys (
        card_key, credential_data, created_at, used_at, status, used_by, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((cardKeys) => {
      for (const item of cardKeys) {
        insertStmt.run(
          item.card_key,
          item.credential_data,
          item.created_at,
          item.used_at,
          item.status,
          item.used_by,
          item.ip_address
        );
      }
    });
    
    insertMany(data.cardKeys);
    
    console.log(`✅ 恢复成功: ${data.cardKeys.length} 个卡密`);
    
    db.close();
    
  } catch (error) {
    console.error('❌ 恢复失败:', error);
    throw error;
  }
}

// 主函数
async function main() {
  console.log('📦 开始备份卡密数据...\n');
  
  try {
    // 导出到JSON
    const backupFile = exportToJSON();
    
    // 清理旧备份
    cleanOldBackups();
    
    // 提交到Git(可选)
    if (process.argv.includes('--git')) {
      try {
        await commitToGit(backupFile);
      } catch (error) {
        console.log('Git提交失败,但本地备份已保存');
      }
    }
    
    console.log('\n✅ 备份完成!');
    
  } catch (error) {
    console.error('\n❌ 备份过程出错:', error);
    process.exit(1);
  }
}

// 如果直接运行
if (require.main === module) {
  main();
}

module.exports = {
  exportToJSON,
  restoreFromBackup,
  cleanOldBackups
};
