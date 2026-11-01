-- =================================================================
-- Project Universe Hub - 数据库初始化脚本
-- 数据库：MySQL 8.0+
-- 字符集：utf8mb4
-- =================================================================

CREATE DATABASE IF NOT EXISTS `project_hub` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `project_hub`;

-- 项目信息主表
CREATE TABLE IF NOT EXISTS `projects` (
  `id` VARCHAR(64) NOT NULL COMMENT '项目唯一ID (如 cow-logic)',
  `title` VARCHAR(128) NOT NULL COMMENT '项目名称',
  `subtitle` VARCHAR(128) DEFAULT '' COMMENT '副标题 / 英文标识',
  `category` VARCHAR(32) NOT NULL DEFAULT 'game' COMMENT '分类: game(游戏), web(网站), software(软件)',
  `architecture` VARCHAR(32) NOT NULL DEFAULT 'frontend' COMMENT '架构: frontend(前端), fullstack(全栈)',
  `status` VARCHAR(32) NOT NULL DEFAULT 'local' COMMENT '状态: online(已上线), local(本地就绪), dev(开发规划)',
  `cover` VARCHAR(255) DEFAULT '' COMMENT '封面图路径',
  `summary` TEXT COMMENT '卡片简述',
  `description` TEXT COMMENT '完整详细描述',
  `highlights` JSON COMMENT '核心亮点列表 (JSON 数组)',
  `tech_stack` JSON COMMENT '技术栈列表 (JSON 数组)',
  `tags` JSON COMMENT '玩法与分类标签 (JSON 数组)',
  `play_url` VARCHAR(255) DEFAULT '' COMMENT '线上体验链接',
  `local_path` VARCHAR(255) DEFAULT '' COMMENT '本地相对路径',
  `repo_url` VARCHAR(255) DEFAULT '' COMMENT '代码仓库或文档地址',
  `release_date` VARCHAR(32) DEFAULT '' COMMENT '发布时间 (如 2026-10)',
  `featured` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否置顶/精选',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序权重 (越小越靠前)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='作品聚合导航项目表';

-- 插入初始项目数据（如已存在则更新）
INSERT INTO `projects` (
  `id`, `title`, `subtitle`, `category`, `architecture`, `status`,
  `cover`, `summary`, `description`, `highlights`, `tech_stack`, `tags`,
  `play_url`, `local_path`, `repo_url`, `release_date`, `featured`, `sort_order`
) VALUES 
(
  'cow-logic',
  '赛博牛马：逆袭董事长',
  'CYBER CORPORATE MERGE SIMULATOR',
  'game',
  'frontend',
  'online',
  'assets/covers/cow_logic.jpg',
  '职场魔性解压合成游戏，从最底层的实习牛马一路合成逆袭，步步高升终成集团董事长！',
  '《赛博牛马》是一款带有强烈幽默与职场讽刺意味的2D合成益智类游戏。玩家从初入职场的实习生起步，通过观察盘面逻辑与拖拽合并相同阶级的打工人，逐步解锁项目组长、部门经理、业务总监，直至登顶集团最高王座。游戏融合了魔性音效、动感视觉动画与真实的职场升级彩蛋。',
  '["完整的10级职场阶梯进阶体系与特色立绘", "流畅的拖拽碰撞与丝滑合成视效反馈", "趣味魔性的职场毒鸡汤与沉浸式背景音效", "完美适配移动端触屏与PC端鼠标操作"]',
  '["原生 JavaScript", "HTML5 Canvas", "CSS3 Flex/Grid", "Web Audio API"]',
  '["合成益智", "职场梗", "休闲解压", "移动自适应"]',
  'http://172.197.217.156/?utm_source=chatgpt.com',
  '../cow_logic/index.html',
  '',
  '2026-10',
  1,
  1
),
(
  'wilderness-survival',
  '荒野求生：失落边境',
  'WILDERNESS SURVIVAL: THE LOST FRONTIER',
  'game',
  'frontend',
  'online',
  'assets/covers/wilderness.png',
  '末日废土边境生存冒险RPG，在恶劣环境中搜集物资、制造工具、抵御野兽，追寻生存曙光。',
  '《荒野求生：失落边境》是一款沉浸式文字剧情与网格化探索结合的废土生存RPG游戏。玩家置身于无人回应的荒凉边境，需要实时把控饱食度、水分、体温、生命值与精神状态。通过在破碎河谷、古老森林与废弃设施中探索采集、制作工具武器、搭建营地，抵御饥饿与夜行野兽的致命威胁。',
  '["精细的多维生理状态系统（生命、饥饿、水分、体温）", "动态网格地图探索与迷雾机制", "完整的物品搜集、工具锻造与营地制造系统", "昼夜交替时间线与随机野生动物战斗事件", "纯前端本地持久化存档支持"]',
  '["JavaScript (ES6+)", "面向对象架构", "CSS3 动态视差", "LocalStorage 引擎"]',
  '["生存冒险", "RPG探索", "状态模拟", "锻造合成", "网格地图"]',
  'http://172.197.217.156/wilderness-survival/?utm_source=chatgpt.com',
  '../wilderness-survival/index.html',
  '',
  '2026-10',
  1,
  2
),
(
  'movie-hub',
  'MovieHub 影视精选系统',
  'MODERN RESPONSIVE MOVIE SHOWCASE',
  'web',
  'frontend',
  'local',
  'assets/covers/movie_hub.jpg',
  '现代暗黑系高颜值经典电影介绍与检索平台，海量高分经典大片，支持实时模糊搜索与分类榜单。',
  '《MovieHub 影视精选系统》是一个专注于高分经典电影展示与检索的响应式 Web 平台。采用现代深色霓虹视觉基调，包含《星际穿越》、《肖申克的救赎》、《盗梦空间》等多部经典巨作。提供顶部沉浸式巨幕海报、热门榜单筛选、实时键盘按键模糊搜索及沉浸式卡片详情交互体验。',
  '["现代化深色玻璃拟态 (Glassmorphism) 视觉设计", "实时输入关键词模糊搜索与多分类切换过滤", "电影评分、上映年代、导演演职员及详细剧情展示", "PC端宽屏与移动端垂直流瀑布响应式全自适应"]',
  '["HTML5 语义化", "CSS3 Flex/Grid", "Vanilla JavaScript", "响应式布局"]',
  '["影视聚合", "UI交互", "经典电影", "响应式全端", "纯前端"]',
  '',
  '../movie-hub/index.html',
  '',
  '2026-10',
  0,
  3
),
(
  'cyber-cloud-console',
  'Nexus Cloud 开发者全栈控制中心',
  'FULLSTACK API & SERVICE PLATFORM',
  'software',
  'fullstack',
  'dev',
  'assets/covers/cow_bg.jpg',
  '规划中的全栈式开发者中台：集成多游戏云端存档、排行榜API与自动化数据监控分析。',
  '《Nexus Cloud 控制中心》是专为聚合站下各个游戏与Web应用打造的通用全栈服务基石。规划包含统一用户鉴权服务、全站各小游戏全局高分排行榜 API、玩家存档云端自动备份同步，以及服务器状态监控看板。前端通过简洁高效的仪表盘呈现，后端采用轻量级高并发微服务架构。',
  '["前后端分离架构，提供标准化 RESTful 数据 API", "跨游戏全局高分榜单与玩家存档云同步机制", "可视化的访问量统计与服务运行状态仪表盘", "支持 Docker 容器化一键式自动化部署"]',
  '["Node.js (Express/Fastify)", "Vue.js / React", "MySQL / Redis", "RESTful API"]',
  '["全栈项目", "云端中台", "排行榜API", "数据大屏", "服务监控"]',
  '',
  '',
  '',
  '2026-11 (规划中)',
  0,
  4
)
ON DUPLICATE KEY UPDATE 
  `title` = VALUES(`title`),
  `subtitle` = VALUES(`subtitle`),
  `category` = VALUES(`category`),
  `architecture` = VALUES(`architecture`),
  `status` = VALUES(`status`),
  `cover` = VALUES(`cover`),
  `summary` = VALUES(`summary`),
  `description` = VALUES(`description`),
  `highlights` = VALUES(`highlights`),
  `tech_stack` = VALUES(`tech_stack`),
  `tags` = VALUES(`tags`),
  `play_url` = VALUES(`play_url`),
  `local_path` = VALUES(`local_path`),
  `release_date` = VALUES(`release_date`),
  `featured` = VALUES(`featured`),
  `sort_order` = VALUES(`sort_order`);
