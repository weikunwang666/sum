/**
 * Project Universe Hub - 核心应用交互脚本 (支持 MySQL 数据库持久化)
 * ------------------------------------------------------------------
 * 1. 自动连接 MySQL 后端 API (/api/projects)
 * 2. 若服务未启动，自动降级使用本地静态数据 (js/data.js)
 * 3. 支持直接在网页中通过表单往 MySQL 中写入新项目
 * 4. 多维筛选、即时搜索与详情弹窗
 */

(function () {
  'use strict';

  // API 地址（自动识别同域或本地 3000 端口）
  const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? `${window.location.origin}/api`
    : 'http://localhost:3000/api';

  // 运行时状态
  const state = {
    projects: [...(typeof PROJECTS_DATA !== 'undefined' ? PROJECTS_DATA : [])],
    category: 'all',        // 'all' | 'game' | 'web' | 'software'
    architecture: 'all',    // 'all' | 'frontend' | 'fullstack'
    status: 'all',          // 'all' | 'online' | 'local' | 'dev'
    searchQuery: '',
    sortBy: 'featured',     // 'featured' | 'latest' | 'name'
    isDbConnected: false    // 是否已连接 MySQL 数据库
  };

  // DOM 元素缓存
  const dom = {
    grid: document.getElementById('projectsGrid'),
    search: document.getElementById('searchInput'),
    sort: document.getElementById('sortSelect'),
    categoryTabs: document.getElementById('categoryTabs'),
    archFilters: document.getElementById('archFilters'),
    statusFilters: document.getElementById('statusFilters'),
    dbStatusBadge: document.getElementById('dbStatusBadge'),
    
    // 统计数字
    statTotal: document.getElementById('statTotal'),
    statGames: document.getElementById('statGames'),
    statWebs: document.getElementById('statWebs'),
    statSoftware: document.getElementById('statSoftware'),
    statOnline: document.getElementById('statOnline'),

    // 详情模态框
    detailModal: document.getElementById('detailModal'),
    detailBanner: document.getElementById('detailBanner'),
    detailTitle: document.getElementById('detailTitle'),
    detailSubtitle: document.getElementById('detailSubtitle'),
    detailBadges: document.getElementById('detailBadges'),
    detailDesc: document.getElementById('detailDesc'),
    detailHighlights: document.getElementById('detailHighlights'),
    detailTech: document.getElementById('detailTech'),
    detailActions: document.getElementById('detailActions'),

    // 新增项目模态框
    addModal: document.getElementById('addModal'),
    btnAddProject: document.getElementById('btnAddProject'),
    addForm: document.getElementById('addProjectForm'),
    codeOutput: document.getElementById('generatedCodeBox'),
    btnSaveToDb: document.getElementById('btnSaveToDb'),
    btnCopyCode: document.getElementById('btnCopyCode'),

    // 全局 Toast
    toast: document.getElementById('toastNotice'),
    toastText: document.getElementById('toastText')
  };

  /**
   * 初始化应用
   */
  async function init() {
    bindEvents();
    render(); // 先用本地数据快速渲染，秒开不白屏

    // 尝试从 MySQL 数据库拉取最新数据
    await fetchProjectsFromDb();
  }

  /**
   * 从 MySQL 后端 API 拉取项目数据
   */
  async function fetchProjectsFromDb() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${API_BASE}/projects`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        state.projects = json.data;
        state.isDbConnected = true;
        updateDbStatus(true);
        updateStatistics();
        render();
        console.log(`[ProjectHub] ✅ 成功从 MySQL 读取 ${json.data.length} 个项目`);
      }
    } catch (err) {
      console.warn('[ProjectHub] 未检测到 MySQL API 服务，使用本地备份数据:', err.message);
      state.isDbConnected = false;
      updateDbStatus(false);
      updateStatistics();
    }
  }

  /**
   * 更新界面上的数据库连接指示器
   */
  function updateDbStatus(connected) {
    if (!dom.dbStatusBadge) return;
    if (connected) {
      dom.dbStatusBadge.innerHTML = `<span class="dot-live"></span> <span>MySQL 已接入</span>`;
      dom.dbStatusBadge.className = 'db-badge-connected';
      dom.dbStatusBadge.title = '当前连接到本地 MySQL 数据库 project_hub';
    } else {
      dom.dbStatusBadge.innerHTML = `<span class="dot-offline"></span> <span>本地静态模式</span>`;
      dom.dbStatusBadge.className = 'db-badge-offline';
      dom.dbStatusBadge.title = '双击 start.bat 可启动 MySQL 后端服务';
    }
  }

  /**
   * 绑定界面交互事件
   */
  function bindEvents() {
    // 搜索输入
    dom.search.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      render();
    });

    // 排序选择
    dom.sort.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      render();
    });

    // 一级分类切换
    dom.categoryTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      const cat = btn.dataset.category;
      state.category = cat;
      
      dom.categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });

    // 二级架构分类切换 (前端 / 前+后端)
    dom.archFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip-btn');
      if (!btn) return;
      const arch = btn.dataset.arch;
      state.architecture = arch;

      dom.archFilters.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });

    // 状态分类切换 (已上线 / 本地 / 开发中)
    dom.statusFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip-btn');
      if (!btn) return;
      const st = btn.dataset.status;
      state.status = st;

      dom.statusFilters.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });

    // 模态框关闭按键 (ESC 与 点击遮罩)
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.closest('.btn-modal-close')) {
          closeAllModals();
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllModals();
    });

    // 打开新增项目模态框
    dom.btnAddProject.addEventListener('click', () => {
      openAddModal();
    });

    // 新增项目表单实时生成代码与保存
    if (dom.addForm) {
      dom.addForm.addEventListener('input', updateGeneratedCode);
      if (dom.btnCopyCode) dom.btnCopyCode.addEventListener('click', copyGeneratedCode);
      if (dom.btnSaveToDb) dom.btnSaveToDb.addEventListener('click', handleSaveToDb);
    }
  }

  /**
   * 刷新顶部统计数字和主分类标签角标
   */
  function updateStatistics() {
    const list = state.projects;
    const total = list.length;
    const games = list.filter(p => p.category === 'game').length;
    const webs = list.filter(p => p.category === 'web').length;
    const software = list.filter(p => p.category === 'software').length;
    const online = list.filter(p => p.status === 'online').length;

    if (dom.statTotal) dom.statTotal.textContent = total;
    if (dom.statGames) dom.statGames.textContent = games;
    if (dom.statWebs) dom.statWebs.textContent = webs;
    if (dom.statSoftware) dom.statSoftware.textContent = software;
    if (dom.statOnline) dom.statOnline.textContent = online;

    // 更新 Tab 角标数字
    const countAll = document.getElementById('countAll');
    const countGame = document.getElementById('countGame');
    const countWeb = document.getElementById('countWeb');
    const countSoftware = document.getElementById('countSoftware');

    if (countAll) countAll.textContent = total;
    if (countGame) countGame.textContent = games;
    if (countWeb) countWeb.textContent = webs;
    if (countSoftware) countSoftware.textContent = software;
  }

  /**
   * 数据过滤与排序
   */
  function getFilteredProjects() {
    let result = state.projects.filter(item => {
      // 一级主分类
      if (state.category !== 'all' && item.category !== state.category) {
        return false;
      }
      // 二级架构
      if (state.architecture !== 'all' && item.architecture !== state.architecture) {
        return false;
      }
      // 三级状态
      if (state.status !== 'all' && item.status !== state.status) {
        return false;
      }
      // 搜索关键词匹配
      if (state.searchQuery) {
        const q = state.searchQuery;
        const inTitle = (item.title || '').toLowerCase().includes(q);
        const inSubtitle = (item.subtitle || '').toLowerCase().includes(q);
        const inSummary = (item.summary || '').toLowerCase().includes(q);
        const inTags = (item.tags || []).some(t => t.toLowerCase().includes(q));
        const inTech = (item.techStack || []).some(t => t.toLowerCase().includes(q));
        if (!inTitle && !inSubtitle && !inSummary && !inTags && !inTech) {
          return false;
        }
      }
      return true;
    });

    // 排序
    result.sort((a, b) => {
      if (state.sortBy === 'featured') {
        if (a.featured !== b.featured) {
          return a.featured ? -1 : 1;
        }
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      }
      if (state.sortBy === 'latest') {
        return (b.releaseDate || '').localeCompare(a.releaseDate || '');
      }
      if (state.sortBy === 'name') {
        return (a.title || '').localeCompare(b.title || '', 'zh-Hans-CN');
      }
      return 0;
    });

    return result;
  }

  /**
   * 渲染项目卡片网格
   */
  function render() {
    const list = getFilteredProjects();

    if (list.length === 0) {
      dom.grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3 class="empty-title">未匹配到相关项目</h3>
          <p class="empty-desc">换个搜索词试试，或者重置分类和架构筛选条件</p>
          <button class="chip-btn active" onclick="window.ProjectHub.resetFilters()">重置所有筛选条件</button>
        </div>
      `;
      return;
    }

    dom.grid.innerHTML = list.map(project => {
      const catMeta = (typeof CATEGORY_MAP !== 'undefined' && CATEGORY_MAP[project.category]) || { label: project.category, icon: '📦' };
      const archMeta = (typeof ARCHITECTURE_MAP !== 'undefined' && ARCHITECTURE_MAP[project.architecture]) || { label: '前端', badge: '前端' };
      const statusMeta = (typeof STATUS_MAP !== 'undefined' && STATUS_MAP[project.status]) || { label: '本地就绪', class: 'status-local', text: '本地就绪' };

      // 按钮文案与行为
      let actionBtnText = '🎮 立即体验';
      if (project.category === 'web') {
        actionBtnText = '🌐 访问网站';
      } else if (project.category === 'software') {
        actionBtnText = '💻 立即运行';
      }

      if (project.status === 'dev') {
        actionBtnText = '⏳ 规划中';
      } else if (project.status === 'local') {
        actionBtnText = '💻 本地启动/预览';
      }

      // 标签渲染
      const tagsList = Array.isArray(project.tags) ? project.tags : [];
      const techList = Array.isArray(project.techStack) ? project.techStack : [];
      const tagsHtml = tagsList.slice(0, 4).map(t => `<span class="tag-badge">#${t}</span>`).join('');
      const techHtml = techList.slice(0, 2).map(t => `<span class="tag-badge tech-tag">${t}</span>`).join('');

      return `
        <article class="project-card" data-id="${project.id}">
          <div class="card-cover">
            ${project.cover 
              ? `<img src="${project.cover}" alt="${project.title}" loading="lazy" onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\\'cover-placeholder\\'>${catMeta.icon}</div>'">`
              : `<div class="cover-placeholder">${catMeta.icon}</div>`
            }

            <div class="card-badges-top">
              <span class="badge-category">${catMeta.icon} ${catMeta.label}</span>
              ${project.featured ? `<span class="badge-featured">⭐ 精选推荐</span>` : ''}
            </div>

            <div class="card-status-pill ${statusMeta.class}">
              <span class="dot"></span>
              <span>${statusMeta.text || statusMeta.label}</span>
            </div>

            <div class="card-arch-pill">
              ${archMeta.icon || ''} ${archMeta.badge || archMeta.label}
            </div>
          </div>

          <div class="card-content">
            <div class="card-header">
              <h3 class="card-title">${project.title}</h3>
              <p class="card-subtitle">${project.subtitle || ''}</p>
            </div>

            <p class="card-summary">${project.summary || '暂无简介'}</p>

            <div class="card-tags">
              ${techHtml}
              ${tagsHtml}
            </div>

            <div class="card-actions">
              <button 
                class="btn-primary-action" 
                onclick="window.ProjectHub.handleLaunch('${project.id}')"
                title="启动体验 ${project.title}">
                <span>${actionBtnText}</span>
              </button>

              <button 
                class="btn-detail-action" 
                onclick="window.ProjectHub.openDetailModal('${project.id}')"
                title="查看详情">
                📖 详情
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  /**
   * 启动/体验项目的处理逻辑
   */
  function handleLaunch(projectId) {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return;

    if (project.status === 'online') {
      if (project.playUrl) {
        showToast(`🚀 正在新标签页中打开：${project.title}`);
        window.open(project.playUrl, '_blank', 'noopener,noreferrer');
      } else {
        showToast('⚠️ 该项目标记为已上线，但尚未配置有效链接！');
      }
    } else if (project.status === 'local') {
      if (project.localPath) {
        showToast(`💻 正在打开本地项目：${project.title}`);
        window.open(project.localPath, '_blank');
      } else {
        openDetailModal(projectId);
      }
    } else if (project.status === 'dev') {
      showToast(`⏳ 【${project.title}】正在研发规划中，敬请期待！`);
      openDetailModal(projectId);
    }
  }

  /**
   * 打开项目详情模态框
   */
  function openDetailModal(projectId) {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return;

    const catMeta = (typeof CATEGORY_MAP !== 'undefined' && CATEGORY_MAP[project.category]) || { label: project.category, icon: '📦' };
    const archMeta = (typeof ARCHITECTURE_MAP !== 'undefined' && ARCHITECTURE_MAP[project.architecture]) || { label: '前端', badge: '纯前端' };
    const statusMeta = (typeof STATUS_MAP !== 'undefined' && STATUS_MAP[project.status]) || { label: '本地就绪', class: 'status-local', text: '本地就绪' };

    // 横幅图
    dom.detailBanner.innerHTML = project.cover
      ? `<img src="${project.cover}" alt="${project.title}">`
      : `<div class="cover-placeholder" style="height:100%">${catMeta.icon}</div>`;

    dom.detailTitle.textContent = project.title;
    dom.detailSubtitle.textContent = project.subtitle || '';

    // 徽章
    dom.detailBadges.innerHTML = `
      <span class="badge-category">${catMeta.icon} ${catMeta.label}</span>
      <span class="card-arch-pill" style="position:static">${archMeta.icon || ''} ${archMeta.label}</span>
      <span class="card-status-pill ${statusMeta.class}" style="position:static">
        <span class="dot"></span>
        <span>${statusMeta.text || statusMeta.label}</span>
      </span>
      ${project.releaseDate ? `<span class="tag-badge">📅 ${project.releaseDate}</span>` : ''}
    `;

    // 描述
    dom.detailDesc.textContent = project.description || project.summary || '暂无详细描述';

    // 亮点
    const highlights = Array.isArray(project.highlights) ? project.highlights : [];
    if (highlights.length > 0) {
      dom.detailHighlights.innerHTML = `
        <h4 class="detail-section-title">✨ 核心亮点与特色</h4>
        <ul class="highlight-list">
          ${highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>
      `;
    } else {
      dom.detailHighlights.innerHTML = '';
    }

    // 技术栈
    const techStack = Array.isArray(project.techStack) ? project.techStack : [];
    const tags = Array.isArray(project.tags) ? project.tags : [];
    dom.detailTech.innerHTML = `
      <h4 class="detail-section-title">🛠️ 技术实现与架构</h4>
      <div class="card-tags">
        ${techStack.map(t => `<span class="tag-badge tech-tag">${t}</span>`).join('')}
        ${tags.map(t => `<span class="tag-badge">#${t}</span>`).join('')}
      </div>
    `;

    // 底部操作按钮
    let launchButtons = '';
    if (project.status === 'online' && project.playUrl) {
      launchButtons += `
        <a href="${project.playUrl}" target="_blank" rel="noopener" class="btn-primary-action">
          🚀 立即在线体验
        </a>
      `;
    } else if (project.localPath) {
      launchButtons += `
        <a href="${project.localPath}" target="_blank" class="btn-primary-action">
          💻 打开本地项目预览
        </a>
      `;
    }

    if (project.playUrl) {
      launchButtons += `
        <button class="btn-detail-action" onclick="window.ProjectHub.copyLink('${project.playUrl}')">
          🔗 复制体验网址
        </button>
      `;
    }

    // 如果连接了数据库，提供直接从数据库删除的快捷按钮
    if (state.isDbConnected) {
      launchButtons += `
        <button class="btn-detail-action" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3);" 
          onclick="window.ProjectHub.deleteProjectFromDb('${project.id}')" title="从 MySQL 数据库删除">
          🗑️ 从数据库删除
        </button>
      `;
    }

    dom.detailActions.innerHTML = launchButtons;
    dom.detailModal.classList.add('active');
  }

  /**
   * 关闭所有模态框
   */
  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('active');
    });
  }

  /**
   * 打开新增项目模态框
   */
  function openAddModal() {
    dom.addModal.classList.add('active');
    updateGeneratedCode();
  }

  /**
   * 获取表单数据对象
   */
  function getFormData() {
    const title = document.getElementById('newTitle').value.trim();
    const subtitle = document.getElementById('newSubtitle').value.trim();
    const category = document.getElementById('newCategory').value;
    const arch = document.getElementById('newArch').value;
    const status = document.getElementById('newStatus').value;
    const playUrl = document.getElementById('newUrl').value.trim();
    const cover = document.getElementById('newCover').value.trim() || 'assets/covers/default.jpg';
    const summary = document.getElementById('newSummary').value.trim();
    const techStack = (document.getElementById('newTech').value.trim() || '')
      .split(/[,，]/)
      .map(s => s.trim())
      .filter(Boolean);
    const tags = (document.getElementById('newTags').value.trim() || '')
      .split(/[,，]/)
      .map(s => s.trim())
      .filter(Boolean);

    const id = title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'project-' + Date.now().toString(36);

    return {
      id: id,
      title: title || '新项目名称',
      subtitle: subtitle || 'PROJECT SUBTITLE',
      category: category,
      architecture: arch,
      status: status,
      cover: cover,
      summary: summary || '暂无项目介绍',
      description: summary || '暂无详细描述',
      highlights: ['项目核心特色1', '项目核心特色2'],
      techStack: techStack.length > 0 ? techStack : ['JavaScript', 'HTML5'],
      tags: tags.length > 0 ? tags : ['独立开发'],
      playUrl: playUrl,
      localPath: `../${id}/index.html`,
      releaseDate: new Date().toISOString().slice(0, 7),
      featured: false
    };
  }

  /**
   * 根据表单内容动态生成 JavaScript 配置代码
   */
  function updateGeneratedCode() {
    const obj = getFormData();
    if (dom.codeOutput) {
      dom.codeOutput.textContent = JSON.stringify(obj, null, 2) + ',';
    }
    return obj;
  }

  /**
   * 将新项目直接写入 MySQL 数据库
   */
  async function handleSaveToDb() {
    const data = getFormData();
    if (!data.title || data.title === '新项目名称') {
      showToast('⚠️ 请填写有效的项目名称！');
      document.getElementById('newTitle').focus();
      return;
    }

    showToast('⏳ 正在写入 MySQL 数据库...');

    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || result.error || '保存失败');
      }

      showToast(`🎉 成功存入 MySQL：【${data.title}】！`);
      closeAllModals();

      // 重新从数据库拉取最新完整列表
      await fetchProjectsFromDb();
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } catch (err) {
      console.error('[Save Error]', err);
      showToast(`❌ 写入数据库失败: ${err.message}。如果服务未启动，可先点击复制配置代码！`);
    }
  }

  /**
   * 从数据库中删除项目
   */
  async function deleteProjectFromDb(id) {
    if (!confirm('确定要将该项目从 MySQL 数据库中永久删除吗？')) return;

    showToast('⏳ 正在从数据库删除...');
    try {
      const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || '删除失败');
      }

      showToast('✅ 项目已成功从 MySQL 数据库删除！');
      closeAllModals();
      await fetchProjectsFromDb();
    } catch (err) {
      showToast('❌ 删除失败: ' + err.message);
    }
  }

  /**
   * 复制生成的代码到剪贴板
   */
  function copyGeneratedCode() {
    if (!dom.codeOutput) return;
    const code = dom.codeOutput.textContent;
    navigator.clipboard.writeText(code).then(() => {
      showToast('✅ 已复制静态配置代码！可备份至 js/data.js');
    }).catch(() => {
      showToast('⚠️ 复制失败，请手动全选复制框内代码');
    });
  }

  /**
   * 复制指定链接
   */
  function copyLink(url) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('✅ 链接已成功复制到剪贴板！');
    }).catch(() => {
      showToast('⚠️ 复制失败，请手动复制：' + url);
    });
  }

  /**
   * 浮动 Toast 提示
   */
  function showToast(message) {
    if (!dom.toastText || !dom.toast) return;
    dom.toastText.textContent = message;
    dom.toast.classList.add('show');
    clearTimeout(dom.toast._timer);
    dom.toast._timer = setTimeout(() => {
      dom.toast.classList.remove('show');
    }, 3500);
  }

  /**
   * 重置所有筛选
   */
  function resetFilters() {
    state.category = 'all';
    state.architecture = 'all';
    state.status = 'all';
    state.searchQuery = '';
    dom.search.value = '';

    dom.categoryTabs.querySelectorAll('.tab-btn').forEach((b, i) => {
      b.classList.toggle('active', i === 0);
    });
    dom.archFilters.querySelectorAll('.chip-btn').forEach((b, i) => {
      b.classList.toggle('active', i === 0);
    });
    dom.statusFilters.querySelectorAll('.chip-btn').forEach((b, i) => {
      b.classList.toggle('active', i === 0);
    });

    render();
  }

  // 挂载全局 API 供 HTML 属性调用
  window.ProjectHub = {
    handleLaunch,
    openDetailModal,
    closeAllModals,
    copyLink,
    resetFilters,
    deleteProjectFromDb
  };

  // 页面加载完成后运行
  document.addEventListener('DOMContentLoaded', init);
})();
