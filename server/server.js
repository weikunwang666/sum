/**
 * Project Universe Hub - 后端 API 与静态托管服务
 * 基于 Node.js 原生 http 模块 + mysql2
 * 
 * 路由：
 * GET    /api/projects     - 获取所有项目列表（从 MySQL 实时读取）
 * POST   /api/projects     - 新增项目（写入 MySQL 数据库）
 * PUT    /api/projects/:id - 修改项目信息
 * DELETE /api/projects/:id - 删除指定项目
 * GET    /api/health       - 服务与数据库健康检查
 * 静态资源直接映射前端网页 (index.html, css, js, assets 等)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { pool, testConnection, dbConfig } = require('./db');

const PORT = process.env.PORT || 3000;
const STATIC_DIR = path.resolve(__dirname, '..');

// MIME 类型字典
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

// 辅助：设置通用 CORS 响应头
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// 辅助：解析 JSON 请求体
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // 限制 1MB 请求体
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        if (!body) return resolve({});
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

// 辅助：发送 JSON 响应
function sendJson(res, statusCode, data) {
  setCorsHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

// 辅助：将 MySQL 下划线行转换为前端驼峰格式
function formatProjectRow(row) {
  const parseJsonField = (val) => {
    if (!val) return [];
    if (typeof val === 'object') return val;
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  };

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || '',
    category: row.category,
    architecture: row.architecture,
    status: row.status,
    cover: row.cover || '',
    summary: row.summary || '',
    description: row.description || '',
    highlights: parseJsonField(row.highlights),
    techStack: parseJsonField(row.tech_stack),
    tags: parseJsonField(row.tags),
    playUrl: row.play_url || '',
    localPath: row.local_path || '',
    repoUrl: row.repo_url || '',
    releaseDate: row.release_date || '',
    featured: Boolean(row.featured),
    sortOrder: row.sort_order || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// 创建 HTTP 服务器
const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  // 处理预检请求 (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // ========================================================
  // API 路由
  // ========================================================

  // 1. GET /api/health - 健康检查
  if (req.method === 'GET' && pathname === '/api/health') {
    try {
      const [rows] = await pool.query('SELECT 1 as is_alive');
      sendJson(res, 200, {
        status: 'healthy',
        database: 'connected',
        serverTime: new Date().toISOString()
      });
    } catch (err) {
      sendJson(res, 500, {
        status: 'degraded',
        database: 'error',
        error: err.message
      });
    }
    return;
  }

  // 2. GET /api/projects - 获取所有项目列表 (从 MySQL 查询)
  if (req.method === 'GET' && pathname === '/api/projects') {
    try {
      const query = `
        SELECT * FROM projects 
        ORDER BY featured DESC, sort_order ASC, created_at DESC
      `;
      const [rows] = await pool.query(query);
      const formatted = rows.map(formatProjectRow);
      sendJson(res, 200, {
        success: true,
        source: 'mysql',
        count: formatted.length,
        data: formatted
      });
    } catch (err) {
      console.error('[API Error] 查询项目失败:', err);
      sendJson(res, 500, { success: false, error: err.message });
    }
    return;
  }

  // 3. POST /api/projects - 新增项目到 MySQL
  if (req.method === 'POST' && pathname === '/api/projects') {
    try {
      const data = await parseJsonBody(req);

      if (!data.title || !data.title.trim()) {
        sendJson(res, 400, { success: false, message: '项目名称不能为空' });
        return;
      }

      // 生成唯一 ID（如果前端未传或不合规）
      let id = (data.id || '').trim();
      if (!id) {
        id = 'p-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
      }

      const title = data.title.trim();
      const subtitle = data.subtitle || '';
      const category = ['game', 'web', 'software'].includes(data.category) ? data.category : 'game';
      const architecture = ['frontend', 'fullstack'].includes(data.architecture) ? data.architecture : 'frontend';
      const status = ['online', 'local', 'dev'].includes(data.status) ? data.status : 'local';
      const cover = data.cover || '';
      const summary = data.summary || '';
      const description = data.description || summary;
      const highlights = JSON.stringify(Array.isArray(data.highlights) ? data.highlights : []);
      const techStack = JSON.stringify(Array.isArray(data.techStack) ? data.techStack : []);
      const tags = JSON.stringify(Array.isArray(data.tags) ? data.tags : []);
      const playUrl = data.playUrl || '';
      const localPath = data.localPath || '';
      const repoUrl = data.repoUrl || '';
      const releaseDate = data.releaseDate || new Date().toISOString().slice(0, 7);
      const featured = data.featured ? 1 : 0;
      const sortOrder = parseInt(data.sortOrder || '0', 10);

      const insertSql = `
        INSERT INTO projects (
          id, title, subtitle, category, architecture, status,
          cover, summary, description, highlights, tech_stack, tags,
          play_url, local_path, repo_url, release_date, featured, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await pool.query(insertSql, [
        id, title, subtitle, category, architecture, status,
        cover, summary, description, highlights, techStack, tags,
        playUrl, localPath, repoUrl, releaseDate, featured, sortOrder
      ]);

      // 查询最新插入的记录并返回
      const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
      const newProject = formatProjectRow(rows[0]);

      console.log(`[DB] 成功插入新项目到 MySQL: 【${title}】 (ID: ${id})`);
      sendJson(res, 201, {
        success: true,
        message: '项目已成功保存入 MySQL 数据库！',
        data: newProject
      });
    } catch (err) {
      console.error('[API Error] 插入项目失败:', err);
      // 处理主键重复错误
      if (err.code === 'ER_DUP_ENTRY') {
        sendJson(res, 409, { success: false, message: '已存在相同ID的项目，请更换项目标识！' });
      } else {
        sendJson(res, 500, { success: false, error: err.message });
      }
    }
    return;
  }

  // 4. PUT /api/projects/:id - 更新项目
  if (req.method === 'PUT' && pathname.startsWith('/api/projects/')) {
    try {
      const id = decodeURIComponent(pathname.replace('/api/projects/', ''));
      const data = await parseJsonBody(req);

      const updateSql = `
        UPDATE projects SET
          title = COALESCE(?, title),
          subtitle = COALESCE(?, subtitle),
          category = COALESCE(?, category),
          architecture = COALESCE(?, architecture),
          status = COALESCE(?, status),
          cover = COALESCE(?, cover),
          summary = COALESCE(?, summary),
          description = COALESCE(?, description),
          highlights = COALESCE(?, highlights),
          tech_stack = COALESCE(?, tech_stack),
          tags = COALESCE(?, tags),
          play_url = COALESCE(?, play_url),
          local_path = COALESCE(?, local_path),
          release_date = COALESCE(?, release_date),
          featured = COALESCE(?, featured)
        WHERE id = ?
      `;

      await pool.query(updateSql, [
        data.title,
        data.subtitle,
        data.category,
        data.architecture,
        data.status,
        data.cover,
        data.summary,
        data.description,
        data.highlights ? JSON.stringify(data.highlights) : null,
        data.techStack ? JSON.stringify(data.techStack) : null,
        data.tags ? JSON.stringify(data.tags) : null,
        data.playUrl,
        data.localPath,
        data.releaseDate,
        data.featured !== undefined ? (data.featured ? 1 : 0) : null,
        id
      ]);

      sendJson(res, 200, { success: true, message: '项目更新成功' });
    } catch (err) {
      console.error('[API Error] 更新项目失败:', err);
      sendJson(res, 500, { success: false, error: err.message });
    }
    return;
  }

  // 5. DELETE /api/projects/:id - 删除项目
  if (req.method === 'DELETE' && pathname.startsWith('/api/projects/')) {
    try {
      const id = decodeURIComponent(pathname.replace('/api/projects/', ''));
      await pool.query('DELETE FROM projects WHERE id = ?', [id]);
      console.log(`[DB] 成功从 MySQL 删除项目: ID=${id}`);
      sendJson(res, 200, { success: true, message: '项目已从数据库中删除' });
    } catch (err) {
      console.error('[API Error] 删除项目失败:', err);
      sendJson(res, 500, { success: false, error: err.message });
    }
    return;
  }

  // ========================================================
  // 静态文件托管
  // ========================================================
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';

  const filePath = path.join(STATIC_DIR, safePath);

  // 检查文件是否存在
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

// 启动服务
server.listen(PORT, async () => {
  console.log('========================================================');
  console.log(`🚀 Project Universe Hub 服务启动成功！`);
  console.log(`📡 访问主站: http://localhost:${PORT}`);
  console.log(`🔗 API 接口: http://localhost:${PORT}/api/projects`);
  console.log('========================================================');
  await testConnection();
});
