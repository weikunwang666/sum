/**
 * MySQL 数据库连接池模块
 */
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'project_hub',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

const pool = mysql.createPool(dbConfig);

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('[DB] ✅ 成功连接到 MySQL 数据库: ' + dbConfig.database);
    connection.release();
    return true;
  } catch (error) {
    console.error('[DB] ❌ 数据库连接失败:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
  dbConfig
};
