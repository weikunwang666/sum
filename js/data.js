/**
 * 项目中心数据配置文件 (Project Hub Data)
 * -------------------------------------------------------------
 * 提示：后续每次做了新游戏、新网站或新软件，直接在此数组中追加一个对象即可！
 * 网页会自动读取并生成卡片、筛选标签和详情弹窗。
 * 
 * 字段说明：
 * @property {string} id             - 唯一英文ID（如 'cow-logic'）
 * @property {string} title          - 项目中文名称
 * @property {string} subtitle       - 英文副标题或简短口号
 * @property {string} category       - 主分类：'game' (游戏项目) | 'web' (网站项目) | 'software' (软件项目)
 * @property {string} architecture   - 架构分类：'frontend' (前端项目) | 'fullstack' (前+后端项目)
 * @property {string} status         - 上线状态：'online' (已上线) | 'local' (本地可预览) | 'dev' (开发规划中)
 * @property {string} cover          - 封面图片路径（相对路径或网络URL）
 * @property {string} summary        - 卡片简短介绍（20-40字）
 * @property {string} description    - 弹窗详细介绍（可分段描述）
 * @property {string[]} highlights   - 核心功能亮点（列表）
 * @property {string[]} techStack    - 核心技术栈标签
 * @property {string[]} tags         - 玩法/业务特性标签
 * @property {string} playUrl        - 在线访问/体验链接（已上线项目使用）
 * @property {string} localPath      - 本地文件预览相对路径（本地项目使用）
 * @property {string} [repoUrl]      - 代码仓库或文档地址（可选）
 * @property {string} releaseDate    - 创建或发布年月
 * @property {boolean} featured      - 是否作为推荐/置顶项目展示
 */

const PROJECTS_DATA = [
  {
    id: 'cow-logic',
    title: '赛博牛马：逆袭董事长',
    subtitle: 'CYBER CORPORATE MERGE SIMULATOR',
    category: 'game',             // 游戏项目
    architecture: 'frontend',     // 前端项目
    status: 'online',             // 已上线
    cover: 'assets/covers/cow_logic.jpg',
    summary: '职场魔性解压合成游戏，从最底层的实习牛马一路合成逆袭，步步高升终成集团董事长！',
    description: '《赛博牛马》是一款带有强烈幽默与职场讽刺意味的2D合成益智类游戏。玩家从初入职场的实习生起步，通过观察盘面逻辑与拖拽合并相同阶级的打工人，逐步解锁项目组长、部门经理、业务总监，直至登顶集团最高王座。游戏融合了魔性音效、动感视觉动画与真实的职场升级彩蛋。',
    highlights: [
      '完整的10级职场阶梯进阶体系与特色立绘',
      '流畅的拖拽碰撞与丝滑合成视效反馈',
      '趣味魔性的职场毒鸡汤与沉浸式背景音效',
      '完美适配移动端触屏与PC端鼠标操作'
    ],
    techStack: ['原生 JavaScript', 'HTML5 Canvas', 'CSS3 Flex/Grid', 'Web Audio API'],
    tags: ['合成益智', '职场梗', '休闲解压', '移动自适应'],
    playUrl: 'http://172.197.217.156/?utm_source=chatgpt.com',
    localPath: '../cow_logic/index.html',
    repoUrl: '',
    releaseDate: '2026-10',
    featured: true
  },
  {
    id: 'wilderness-survival',
    title: '荒野求生：失落边境',
    subtitle: 'WILDERNESS SURVIVAL: THE LOST FRONTIER',
    category: 'game',             // 游戏项目
    architecture: 'frontend',     // 前端项目
    status: 'online',             // 已上线
    cover: 'assets/covers/wilderness.png',
    summary: '末日废土边境生存冒险RPG，在恶劣环境中搜集物资、制造工具、抵御野兽，追寻生存曙光。',
    description: '《荒野求生：失落边境》是一款沉浸式文字剧情与网格化探索结合的废土生存RPG游戏。玩家置身于无人回应的荒凉边境，需要实时把控饱食度、水分、体温、生命值与精神状态。通过在破碎河谷、古老森林与废弃设施中探索采集、制作工具武器、搭建营地，抵御饥饿与夜行野兽的致命威胁。',
    highlights: [
      '精细的多维生理状态系统（生命、饥饿、水分、体温）',
      '动态网格地图探索与迷雾机制',
      '完整的物品搜集、工具锻造与营地制造系统',
      '昼夜交替时间线与随机野生动物战斗事件',
      '纯前端本地持久化存档支持'
    ],
    techStack: ['JavaScript (ES6+)', '面向对象架构', 'CSS3 动态视差', 'LocalStorage 引擎'],
    tags: ['生存冒险', 'RPG探索', '状态模拟', '锻造合成', '网格地图'],
    playUrl: 'http://172.197.217.156/wilderness-survival/?utm_source=chatgpt.com',
    localPath: '../wilderness-survival/index.html',
    repoUrl: '',
    releaseDate: '2026-10',
    featured: true
  },
  {
    id: 'movie-hub',
    title: 'MovieHub 影视精选系统',
    subtitle: 'MODERN RESPONSIVE MOVIE SHOWCASE',
    category: 'web',              // 网站项目
    architecture: 'frontend',     // 前端项目
    status: 'local',              // 本地可预览 (未上线服务器)
    cover: 'assets/covers/movie_hub.jpg',
    summary: '现代暗黑系高颜值经典电影介绍与检索平台，海量高分经典大片，支持实时模糊搜索与分类榜单。',
    description: '《MovieHub 影视精选系统》是一个专注于高分经典电影展示与检索的响应式 Web 平台。采用现代深色霓虹视觉基调，包含《星际穿越》、《肖申克的救赎》、《盗梦空间》等多部经典巨作。提供顶部沉浸式巨幕海报、热门榜单筛选、实时键盘按键模糊搜索及沉浸式卡片详情交互体验。',
    highlights: [
      '现代化深色玻璃拟态 (Glassmorphism) 视觉设计',
      '实时输入关键词模糊搜索与多分类切换过滤',
      '电影评分、上映年代、导演演职员及详细剧情展示',
      'PC端宽屏与移动端垂直流瀑布响应式全自适应'
    ],
    techStack: ['HTML5 语义化', 'CSS3 Flex/Grid', 'Vanilla JavaScript', '响应式布局'],
    tags: ['影视聚合', 'UI交互', '经典电影', '响应式全端', '纯前端'],
    playUrl: '',                  // 尚未部署到公网服务器
    localPath: '../movie-hub/index.html',
    repoUrl: '',
    releaseDate: '2026-10',
    featured: false
  },
  {
    id: 'cyber-cloud-console',
    title: 'Nexus Cloud 开发者全栈控制中心',
    subtitle: 'FULLSTACK API & SERVICE PLATFORM',
    category: 'software',         // 软件项目
    architecture: 'fullstack',    // 前+后端项目
    status: 'dev',                // 开发规划中
    cover: 'assets/covers/cow_bg.jpg',
    summary: '规划中的全栈式开发者中台：集成多游戏云端存档、排行榜API与自动化数据监控分析。',
    description: '《Nexus Cloud 控制中心》是专为聚合站下各个游戏与Web应用打造的通用全栈服务基石。规划包含统一用户鉴权服务、全站各小游戏全局高分排行榜 API、玩家存档云端自动备份同步，以及服务器状态监控看板。前端通过简洁高效的仪表盘呈现，后端采用轻量级高并发微服务架构。',
    highlights: [
      '前后端分离架构，提供标准化 RESTful 数据 API',
      '跨游戏全局高分榜单与玩家存档云同步机制',
      '可视化的访问量统计与服务运行状态仪表盘',
      '支持 Docker 容器化一键式自动化部署'
    ],
    techStack: ['Node.js (Express/Fastify)', 'Vue.js / React', 'SQLite / PostgreSQL', 'RESTful API'],
    tags: ['全栈项目', '云端中台', '排行榜API', '数据大屏', '服务监控'],
    playUrl: '',
    localPath: '',
    repoUrl: '',
    releaseDate: '2026-11 (规划中)',
    featured: false
  }
];

// 分类元数据字典
const CATEGORY_MAP = {
  all: { label: '全部项目', icon: '✨' },
  game: { label: '游戏项目', icon: '🎮' },
  web: { label: '网站项目', icon: '🌐' },
  software: { label: '软件项目', icon: '💻' }
};

// 架构类型字典
const ARCHITECTURE_MAP = {
  all: { label: '全部架构', badge: 'ALL' },
  frontend: { label: '纯前端项目', badge: '前端', icon: '⚡' },
  fullstack: { label: '前+后端项目', badge: '全栈', icon: '🚀' }
};

// 状态字典
const STATUS_MAP = {
  all: { label: '全部状态' },
  online: { label: '已上线', class: 'status-online', icon: '🟢', text: '在线运行中' },
  local: { label: '本地就绪 / 待上线', class: 'status-local', icon: '🟡', text: '本地可预览' },
  dev: { label: '开发规划中', class: 'status-dev', icon: '🔵', text: '开发筹备中' }
};
