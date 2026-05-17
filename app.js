// ============================================================
//  智聘通 - 完整应用逻辑
// ============================================================

// ========== 状态管理 ==========
let currentUser = null;
let currentPage = 'home';
let filteredJobs = [...JOBS];
let currentJobPage = 1;
const jobsPerPage = 8;
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let applications = JSON.parse(localStorage.getItem('applications') || '[]');
let resumeData = JSON.parse(localStorage.getItem('resumeData') || '{}');
let userSkills = JSON.parse(localStorage.getItem('userSkills') || '[]');
let educationList = JSON.parse(localStorage.getItem('educationList') || '[]');
let workExpList = JSON.parse(localStorage.getItem('workExpList') || '[]');
let projectList = JSON.parse(localStorage.getItem('projectList') || '[]');
let conversations = JSON.parse(localStorage.getItem('conversations') || 'null') || [
    { id: 1, userId: 'hr_bytedance', name: '字节跳动HR', avatar: '字', online: true,
      lastMessage: '您好，我们对您的简历很感兴趣！', time: '14:30', unread: 2,
      messages: [
        { from: 'hr_bytedance', text: '您好，我是字节跳动的HR，看到了您投递的简历。', time: '14:28' },
        { from: 'hr_bytedance', text: '我们对您的背景很感兴趣，方便聊一下吗？', time: '14:30' }
    ]},
    { id: 2, userId: 'hr_tencent', name: '腾讯招聘', avatar: '腾', online: true,
      lastMessage: '感谢您的投递，我们会在3个工作日内回复。', time: '昨天', unread: 0,
      messages: [
        { from: 'me', text: '您好，我想咨询一下Java后端开发岗位的详细信息。', time: '昨天 10:20' },
        { from: 'hr_tencent', text: '感谢您的投递，我们会在3个工作日内回复。', time: '昨天 10:35' }
    ]},
    { id: 3, userId: 'hr_huawei', name: '华为校招', avatar: '华', online: false,
      lastMessage: '校招笔试通知已发送至您的邮箱，请注意查收。', time: '05-14', unread: 1,
      messages: [
        { from: 'hr_huawei', text: '恭喜您通过简历筛选！', time: '05-13 09:00' },
        { from: 'hr_huawei', text: '校招笔试通知已发送至您的邮箱，请注意查收。', time: '05-14 10:00' }
    ]}
];
let activeConversation = null;
let typingWords = ['理想工作', '职业机会', '美好未来', '精彩人生'];
let typingIndex = 0;
let charIndex = 0;
let isDeleting = false;
let confirmedCallback = null;

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    startTyping();
    animateStats();
    renderFeaturedJobs();
    renderHomeCompanies();
    renderCompanies();
    checkAuthState();
    updateResumeProgress();
    renderResumeData();
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) {
            const dd = document.getElementById('dropdownMenu');
            if (dd) dd.classList.remove('show');
        }
    });
});

// ========== 粒子动画 ==========
function initParticles() {
    const c = document.getElementById('particles');
    if (!c) return;
    for (let i = 0; i < 25; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (Math.random() * 12 + 8) + 's';
        p.style.animationDelay = Math.random() * 8 + 's';
        const size = Math.random() * 5 + 2;
        p.style.width = p.style.height = size + 'px';
        c.appendChild(p);
    }
}

// ========== 打字效果 ==========
function startTyping() {
    const el = document.getElementById('typingText');
    if (!el) return;
    const word = typingWords[typingIndex];
    if (isDeleting) { el.textContent = word.substring(0, --charIndex); }
    else { el.textContent = word.substring(0, ++charIndex); }
    let delay = isDeleting ? 80 : 150;
    if (!isDeleting && charIndex === word.length) { delay = 2000; isDeleting = true; }
    else if (isDeleting && charIndex === 0) { isDeleting = false; typingIndex = (typingIndex + 1) % typingWords.length; delay = 400; }
    setTimeout(startTyping, delay);
}

// ========== 数字动画 ==========
function animateStats() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                const start = performance.now();
                (function tick(now) {
                    const p = Math.min((now - start) / 2000, 1);
                    const eased = 1 - Math.pow(1 - p, 3);
                    const v = Math.floor(target * eased);
                    el.textContent = v >= 10000 ? (v / 10000).toFixed(v >= 100000 ? 0 : 1) + '万' : v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v;
                    if (p < 1) requestAnimationFrame(tick);
                })(start);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.stat-number[data-target]').forEach(s => obs.observe(s));
}

// ========== 页面导航 ==========
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const el = document.getElementById(page + 'Page');
    if (el) { el.classList.add('active'); currentPage = page; }
    const nav = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (nav) nav.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('navLinks').classList.remove('show');
    // 页面初始化
    const inits = {
        jobs: () => { filteredJobs = [...JOBS]; currentJobPage = 1; renderJobs(); },
        companies: () => renderCompanies(),
        salary: () => renderSalaryPage(),
        blog: () => renderBlog(),
        dashboard: () => renderDashboard(),
        messages: () => renderConversations(),
        profile: () => renderProfile(),
        applications: () => renderApplications('all'),
        favorites: () => renderFavorites(),
        resume: () => { renderResumeData(); updateResumeProgress(); },
        myJobs: () => renderMyJobs(),
        candidates: () => renderCandidates()
    };
    if (inits[page]) inits[page]();
    return false;
}

function toggleMobileMenu() {
    document.getElementById('navLinks').classList.toggle('show');
}

// ========== 主题 ==========
function toggleTheme() {
    const dark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', dark ? '' : 'dark');
    document.querySelector('.theme-toggle i').className = dark ? 'fas fa-moon' : 'fas fa-sun';
    localStorage.setItem('theme', dark ? '' : 'dark');
}
if (localStorage.getItem('theme') === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    document.querySelector('.theme-toggle i').className = 'fas fa-sun';
}

// ========== 认证 ==========
function checkAuthState() {
    const s = localStorage.getItem('currentUser');
    if (s) { currentUser = JSON.parse(s); updateAuthUI(); }
}

function updateAuthUI() {
    const authBtns = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    if (currentUser) {
        authBtns.style.display = 'none';
        userMenu.style.display = 'block';
        document.getElementById('userInitial').textContent = currentUser.username.charAt(0).toUpperCase();
        document.getElementById('dropdownName').textContent = currentUser.username;
        const rb = document.getElementById('dropdownRole');
        rb.textContent = currentUser.role === 'recruiter' ? '招聘者' : '求职者';
        rb.className = 'role-badge ' + currentUser.role;
        document.querySelectorAll('.auth-only').forEach(el => el.style.display = '');
        document.querySelectorAll('.jobseeker-only').forEach(el => el.style.display = currentUser.role === 'jobseeker' ? '' : 'none');
        document.querySelectorAll('.recruiter-only').forEach(el => el.style.display = currentUser.role === 'recruiter' ? '' : 'none');
    } else {
        authBtns.style.display = 'flex';
        userMenu.style.display = 'none';
        document.querySelectorAll('.auth-only').forEach(el => el.style.display = 'none');
    }
}

function toggleDropdown() {
    document.getElementById('dropdownMenu').classList.toggle('show');
}

function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if (!username || !password) { showToast('请填写用户名和密码', 'warning'); return; }
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const allUsers = { ...DEMO_USERS, ...users };
    const user = allUsers[username];
    if (!user || user.password !== password) { showToast('用户名或密码错误', 'error'); return; }
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    updateAuthUI();
    closeModal('loginModal');
    showToast('登录成功，欢迎回来 ' + user.username + '！', 'success');
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    showPage(currentUser.role === 'recruiter' ? 'dashboard' : 'dashboard');
}

function register() {
    const role = document.getElementById('registerRole').value;
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const confirm = document.getElementById('regConfirmPassword').value.trim();
    if (!username || !email || !password) { showToast('请填写所有必填项', 'warning'); return; }
    if (password.length < 6) { showToast('密码至少6位', 'warning'); return; }
    if (password !== confirm) { showToast('两次密码不一致', 'error'); return; }
    if (!document.getElementById('agreeTerms').checked) { showToast('请同意用户协议', 'warning'); return; }
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username] || DEMO_USERS[username]) { showToast('用户名已存在', 'error'); return; }
    const newUser = {
        id: username, username, email, password, role,
        company: role === 'recruiter' ? document.getElementById('regCompany').value : '',
        position: role === 'recruiter' ? document.getElementById('regPosition').value : '',
        phone: '', city: '', createdAt: new Date().toISOString().split('T')[0]
    };
    users[username] = newUser;
    localStorage.setItem('users', JSON.stringify(users));
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    updateAuthUI();
    closeModal('registerModal');
    showToast('注册成功！欢迎加入智聘通', 'success');
    ['regUsername','regEmail','regPassword','regConfirmPassword'].forEach(id => document.getElementById(id).value = '');
    showPage('dashboard');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showPage('home');
    showToast('已退出登录', 'info');
}

function switchRegisterTab(role) {
    document.getElementById('registerRole').value = role;
    document.querySelectorAll('.register-tab').forEach(t => t.classList.remove('active'));
    event.target.closest('.register-tab').classList.add('active');
    document.getElementById('recruiterFields').style.display = role === 'recruiter' ? 'block' : 'none';
}

// ========== 模态框 ==========
function showModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.add('show'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.remove('show'); document.body.style.overflow = ''; }
}
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal') && e.target.classList.contains('show')) {
        e.target.classList.remove('show'); document.body.style.overflow = '';
    }
});

// ========== 通知 ==========
function showToast(message, type = 'info') {
    const c = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    const icons = { success: 'circle-check', error: 'circle-exclamation', warning: 'triangle-exclamation', info: 'circle-info' };
    t.innerHTML = '<i class="fas fa-' + icons[type] + '"></i> ' + message;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(80px)'; setTimeout(() => t.remove(), 300); }, 3000);
}

// ========== 首页企业滚动 ==========
function renderHomeCompanies() {
    const c = document.getElementById('homeCompanies');
    if (!c) return;
    c.innerHTML = COMPANIES.map(co =>
        '<div class="company-logo-card" onclick="showCompanyDetail(' + co.id + ')">' +
        '<div class="company-logo" style="background:linear-gradient(135deg,' + co.color + ')">' + co.letter + '</div>' +
        '<span>' + co.name + '</span></div>'
    ).join('');
}

// ========== 推荐职位 ==========
function renderFeaturedJobs() {
    const c = document.getElementById('featuredJobs');
    if (!c) return;
    c.innerHTML = JOBS.slice(0, 6).map(j => createJobCard(j)).join('');
}

function createJobCard(job) {
    const co = COMPANIES.find(c => c.id === job.company);
    const fav = favorites.includes(job.id);
    return '<div class="job-card" onclick="showJobDetail(' + job.id + ')">' +
        '<div class="job-card-header"><div><div class="job-title">' + job.title + '</div>' +
        '<div class="job-company"><div class="job-company-logo" style="background:linear-gradient(135deg,' + co.color + ')">' + co.letter + '</div>' +
        '<span class="job-company-name">' + co.name + '</span></div></div>' +
        '<div class="job-salary">' + job.salaryMin + 'K-' + job.salaryMax + 'K</div></div>' +
        '<div class="job-tags"><span class="job-tag">' + job.city + '</span><span class="job-tag">' + job.experience + '</span>' +
        '<span class="job-tag">' + job.education + '</span>' +
        job.tags.slice(0, 3).map(t => '<span class="job-tag">' + t + '</span>').join('') + '</div>' +
        '<div class="job-card-footer"><div class="job-meta"><span><i class="fas fa-eye"></i> ' + job.views + '</span><span>' + job.date + '</span></div>' +
        '<div class="job-actions"><button class="favorite-btn ' + (fav ? 'active' : '') + '" onclick="event.stopPropagation();toggleFavorite(' + job.id + ',this)">' +
        '<i class="fa' + (fav ? 's' : 'r') + ' fa-heart"></i></button></div></div></div>';
}

// ========== 搜索 ==========
function handleHeroSearch(e) { if (e.key === 'Enter') performHeroSearch(); }
function performHeroSearch() {
    const kw = document.getElementById('heroSearch').value.trim();
    if (kw) searchKeyword(kw);
}
function searchKeyword(kw) {
    document.getElementById('heroSearch').value = kw;
    showPage('jobs');
    filteredJobs = JOBS.filter(j => j.title.includes(kw) || j.tags.some(t => t.includes(kw)) || COMPANIES.find(c => c.id === j.company).name.includes(kw));
    currentJobPage = 1; renderJobs();
}
function searchCategory(cat) {
    showPage('jobs');
    filteredJobs = JOBS.filter(j => j.category === cat);
    currentJobPage = 1; renderJobs();
}

// ========== 职位筛选 ==========
function filterJobs() {
    const city = document.getElementById('filterCity').value;
    const exp = document.getElementById('filterExp').value;
    const edu = document.getElementById('filterEdu').value;
    const sal = parseInt(document.getElementById('filterSalary').value) || 0;
    filteredJobs = JOBS.filter(j => {
        if (city && j.city !== city) return false;
        if (exp && j.experience !== exp) return false;
        if (edu && j.education !== edu) return false;
        if (sal && j.salaryMax * 1000 < sal) return false;
        return true;
    });
    sortJobs();
}
function sortJobs() {
    const s = document.getElementById('jobsSort').value;
    if (s === 'salary-high') filteredJobs.sort((a, b) => b.salaryMax - a.salaryMax);
    else if (s === 'salary-low') filteredJobs.sort((a, b) => a.salaryMin - b.salaryMin);
    else if (s === 'date') filteredJobs.sort((a, b) => new Date(b.date) - new Date(a.date));
    currentJobPage = 1; renderJobs();
}
function resetFilters() {
    ['filterCity','filterExp','filterEdu','filterSalary'].forEach(id => document.getElementById(id).value = '');
    filteredJobs = [...JOBS]; currentJobPage = 1; renderJobs();
}
function renderJobs() {
    const list = document.getElementById('jobsList');
    const count = document.getElementById('jobsCount');
    const pag = document.getElementById('pagination');
    if (!list) return;
    count.textContent = filteredJobs.length;
    const start = (currentJobPage - 1) * jobsPerPage;
    const pageJobs = filteredJobs.slice(start, start + jobsPerPage);
    list.innerHTML = pageJobs.length === 0
        ? '<div class="empty-state"><i class="fas fa-magnifying-glass"></i><p>暂无符合条件的职位</p><button class="btn btn-primary btn-sm" onclick="resetFilters()">重置筛选</button></div>'
        : pageJobs.map(j => createJobCard(j)).join('');
    const total = Math.ceil(filteredJobs.length / jobsPerPage);
    if (total <= 1) { pag.innerHTML = ''; return; }
    let h = '';
    if (currentJobPage > 1) h += '<button class="page-btn" onclick="goToPage(' + (currentJobPage - 1) + ')"><i class="fas fa-chevron-left"></i></button>';
    for (let i = 1; i <= total; i++) h += '<button class="page-btn ' + (i === currentJobPage ? 'active' : '') + '" onclick="goToPage(' + i + ')">' + i + '</button>';
    if (currentJobPage < total) h += '<button class="page-btn" onclick="goToPage(' + (currentJobPage + 1) + ')"><i class="fas fa-chevron-right"></i></button>';
    pag.innerHTML = h;
}
function goToPage(p) { currentJobPage = p; renderJobs(); window.scrollTo({ top: 200, behavior: 'smooth' }); }

// ========== 职位详情 ==========
function showJobDetail(id) {
    const job = JOBS.find(j => j.id === id);
    if (!job) return;
    const co = COMPANIES.find(c => c.id === job.company);
    const fav = favorites.includes(id);
    const applied = applications.some(a => a.jobId === id);
    const c = document.getElementById('jobDetailContent');
    c.innerHTML =
        '<div class="job-detail-header"><div class="job-detail-title"><div><h1>' + job.title + '</h1>' +
        '<div class="job-salary">' + job.salaryMin + 'K - ' + job.salaryMax + 'K / 月</div></div></div>' +
        '<div class="job-detail-company"><div class="company-brief-logo" style="background:linear-gradient(135deg,' + co.color + ')">' + co.letter + '</div>' +
        '<div class="company-info"><h3 style="cursor:pointer" onclick="showCompanyDetail(' + co.id + ')">' + co.name + '</h3>' +
        '<p>' + co.industry + ' · ' + co.size + '</p></div></div>' +
        '<div class="job-detail-tags"><span class="job-tag">' + job.city + ' ' + job.location + '</span><span class="job-tag">' + job.experience + '</span>' +
        '<span class="job-tag">' + job.education + '</span><span class="job-tag">' + job.type + '</span></div>' +
        '<div class="job-detail-actions">' +
        (applied ? '<button class="btn btn-secondary" disabled><i class="fas fa-check"></i> 已投递</button>'
                 : '<button class="btn btn-primary" onclick="applyJob(' + id + ')"><i class="fas fa-paper-plane"></i> 立即投递</button>') +
        '<button class="btn ' + (fav ? 'btn-danger' : 'btn-outline') + '" onclick="toggleFavorite(' + id + ')">' +
        '<i class="fa' + (fav ? 's' : 'r') + ' fa-heart"></i> ' + (fav ? '已收藏' : '收藏') + '</button>' +
        '<button class="btn btn-outline" onclick="startChat(\'' + co.name + '\',\'' + co.letter + '\')"><i class="fas fa-comment"></i> 沟通</button>' +
        '</div></div>' +
        '<div class="job-detail-body"><div class="job-detail-content">' +
        '<h3><i class="fas fa-list-check"></i> 岗位职责</h3><ul>' + job.responsibilities.map(r => '<li>' + r + '</li>').join('') + '</ul>' +
        '<h3><i class="fas fa-clipboard-check"></i> 任职要求</h3><ul>' + job.requirements.map(r => '<li>' + r + '</li>').join('') + '</ul>' +
        '<h3><i class="fas fa-gift"></i> 职位福利</h3><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">' +
        job.benefits.map(b => '<span class="job-tag">' + b + '</span>').join('') + '</div></div>' +
        '<div class="job-detail-sidebar"><div class="sidebar-card"><h4>公司信息</h4>' +
        '<div class="company-brief"><div class="company-brief-logo" style="background:linear-gradient(135deg,' + co.color + ')">' + co.letter + '</div>' +
        '<div><strong>' + co.name + '</strong><br><span style="font-size:13px;color:var(--text-muted)">' + co.industry + '</span></div></div>' +
        '<p style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:14px">' + co.desc + '</p>' +
        '<div style="font-size:13px;color:var(--text-muted)"><p><i class="fas fa-map-marker-alt" style="width:20px"></i> ' + co.city + '</p>' +
        '<p><i class="fas fa-users" style="width:20px"></i> ' + co.size + '</p><p><i class="fas fa-globe" style="width:20px"></i> ' + co.website + '</p></div>' +
        '<button class="btn btn-outline btn-block btn-sm" style="margin-top:14px" onclick="showCompanyDetail(' + co.id + ')">查看公司详情</button></div>' +
        '<div class="sidebar-card"><h4>相似职位</h4>' +
        JOBS.filter(j => j.category === job.category && j.id !== id).slice(0, 3).map(j =>
            '<div style="padding:10px 0;border-bottom:1px solid var(--divider);cursor:pointer" onclick="showJobDetail(' + j.id + ')">' +
            '<div style="font-size:14px;font-weight:600">' + j.title + '</div>' +
            '<div style="font-size:12px;color:var(--text-muted)">' + COMPANIES.find(x => x.id === j.company).name + ' · ' + j.salaryMin + 'K-' + j.salaryMax + 'K</div></div>'
        ).join('') + '</div></div></div>';
    showPage('jobDetail');
}

// ========== 职位操作 ==========
function applyJob(jobId) {
    if (!currentUser) { showToast('请先登录后再投递', 'warning'); showModal('loginModal'); return; }
    if (currentUser.role !== 'jobseeker') { showToast('招聘者角色无法投递职位', 'warning'); return; }
    if (applications.some(a => a.jobId === jobId)) { showToast('您已投递过该职位', 'warning'); return; }
    const job = JOBS.find(j => j.id === jobId);
    const co = COMPANIES.find(c => c.id === job.company);
    applications.push({
        id: Date.now(), jobId, userId: currentUser.id,
        title: job.title, company: co.name, companyLetter: co.letter, companyColor: co.color,
        status: 'pending', date: new Date().toISOString().split('T')[0]
    });
    localStorage.setItem('applications', JSON.stringify(applications));
    showToast('🎉 投递成功！请关注消息通知', 'success');
    showJobDetail(jobId);
}

function toggleFavorite(jobId, btnEl) {
    if (!currentUser) { showToast('请先登录', 'warning'); showModal('loginModal'); return; }
    const idx = favorites.indexOf(jobId);
    if (idx >= 0) { favorites.splice(idx, 1); showToast('已取消收藏', 'info'); }
    else { favorites.push(jobId); showToast('❤️ 已收藏', 'success'); }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    if (btnEl) btnEl.classList.toggle('active');
    if (btnEl) { const icon = btnEl.querySelector('i'); icon.className = favorites.includes(jobId) ? 'fas fa-heart' : 'far fa-heart'; }
    if (currentPage === 'favorites') renderFavorites();
    if (currentPage === 'jobDetail') showJobDetail(jobId);
}

// ========== 公司 ==========
function renderCompanies() {
    const c = document.getElementById('companiesList');
    if (!c) return;
    c.innerHTML = COMPANIES.map(co =>
        '<div class="company-card" onclick="showCompanyDetail(' + co.id + ')">' +
        '<div class="company-card-logo" style="background:linear-gradient(135deg,' + co.color + ')">' + co.letter + '</div>' +
        '<h3>' + co.name + '</h3><p class="company-desc">' + co.desc + '</p>' +
        '<div class="company-meta"><span><i class="fas fa-map-marker-alt"></i> ' + co.city + '</span>' +
        '<span><i class="fas fa-users"></i> ' + co.size + '</span>' +
        '<span><i class="fas fa-briefcase"></i> ' + JOBS.filter(j => j.company === co.id).length + '个职位</span></div></div>'
    ).join('');
}

function filterCompanies() {
    const kw = document.getElementById('companySearch').value.trim().toLowerCase();
    const c = document.getElementById('companiesList');
    c.innerHTML = COMPANIES.filter(co => co.name.toLowerCase().includes(kw) || co.industry.toLowerCase().includes(kw)).map(co =>
        '<div class="company-card" onclick="showCompanyDetail(' + co.id + ')">' +
        '<div class="company-card-logo" style="background:linear-gradient(135deg,' + co.color + ')">' + co.letter + '</div>' +
        '<h3>' + co.name + '</h3><p class="company-desc">' + co.desc + '</p></div>'
    ).join('');
}

function showCompanyDetail(id) {
    const co = COMPANIES.find(x => x.id === id);
    if (!co) return;
    const cjobs = JOBS.filter(j => j.company === id);
    const c = document.getElementById('companyDetailContent');
    c.innerHTML =
        '<div class="company-detail-header"><div class="company-detail-logo" style="background:linear-gradient(135deg,' + co.color + ')">' + co.letter + '</div>' +
        '<h1>' + co.name + '</h1><p class="company-desc">' + co.desc + '</p>' +
        '<div class="company-meta"><span><i class="fas fa-map-marker-alt"></i> ' + co.city + '</span><span><i class="fas fa-users"></i> ' + co.size + '</span>' +
        '<span><i class="fas fa-building"></i> ' + co.industry + '</span><span><i class="fas fa-globe"></i> ' + co.website + '</span>' +
        '<span><i class="fas fa-calendar"></i> 成立于' + co.founded + '年</span><span><i class="fas fa-chart-line"></i> ' + co.stage + '</span></div></div>' +
        '<div class="company-jobs-section"><h2>在招职位 (' + cjobs.length + ')</h2>' +
        '<div class="jobs-grid">' + cjobs.map(j => createJobCard(j)).join('') + '</div></div>';
    showPage('companyDetail');
}

// ========== 工作台 ==========
function renderDashboard() {
    if (!currentUser) return;
    const h = new Date().getHours();
    document.getElementById('dashboardGreeting').textContent = (h < 12 ? '早上好' : h < 18 ? '下午好' : '晚上好') + '，' + currentUser.username + '！';
    const statsEl = document.getElementById('dashboardStats');
    const contentEl = document.getElementById('dashboardContent');
    if (currentUser.role === 'jobseeker') {
        const myApps = applications.filter(a => a.userId === currentUser.id);
        statsEl.innerHTML =
            '<div class="dashboard-stat"><div class="dashboard-stat-icon purple"><i class="fas fa-paper-plane"></i></div><div class="dashboard-stat-info"><h3>' + myApps.length + '</h3><p>已投递</p></div></div>' +
            '<div class="dashboard-stat"><div class="dashboard-stat-icon blue"><i class="fas fa-eye"></i></div><div class="dashboard-stat-info"><h3>' + myApps.filter(a => a.status === 'viewed').length + '</h3><p>已查看</p></div></div>' +
            '<div class="dashboard-stat"><div class="dashboard-stat-icon green"><i class="fas fa-calendar-check"></i></div><div class="dashboard-stat-info"><h3>' + myApps.filter(a => a.status === 'interview').length + '</h3><p>面试邀请</p></div></div>' +
            '<div class="dashboard-stat"><div class="dashboard-stat-icon orange"><i class="fas fa-heart"></i></div><div class="dashboard-stat-info"><h3>' + favorites.length + '</h3><p>收藏职位</p></div></div>';
        const recent = myApps.slice(-5).reverse();
        contentEl.innerHTML =
            '<div class="dashboard-card"><h3><i class="fas fa-clock"></i> 最近投递</h3>' +
            (recent.length ? recent.map(a =>
                '<div class="application-card" onclick="showJobDetail(' + a.jobId + ')" style="margin-bottom:8px;cursor:pointer">' +
                '<div class="app-company-logo" style="background:linear-gradient(135deg,' + a.companyColor + ')">' + a.companyLetter + '</div>' +
                '<div class="app-info"><h4>' + a.title + '</h4><p>' + a.company + '</p></div>' +
                '<span class="app-status ' + a.status + '">' + getStatusText(a.status) + '</span><span class="app-date">' + a.date + '</span></div>'
            ).join('') : '<p style="text-align:center;color:var(--text-muted);padding:30px">暂无投递记录，<a href="#" onclick="showPage(\'jobs\')" style="color:var(--apple-blue)">去看看职位</a></p>') +
            '</div><div class="dashboard-card"><h3><i class="fas fa-lightbulb"></i> 推荐职位</h3>' +
            '<div class="jobs-grid">' + JOBS.slice(0, 4).map(j => createJobCard(j)).join('') + '</div></div>';
    } else {
        // 招聘者工作台
        const myPosted = JOBS.slice(0, 3);
        const totalApps = myPosted.reduce((s, j) => s + j.applications, 0);
        statsEl.innerHTML =
            '<div class="dashboard-stat"><div class="dashboard-stat-icon purple"><i class="fas fa-briefcase"></i></div><div class="dashboard-stat-info"><h3>' + myPosted.length + '</h3><p>发布职位</p></div></div>' +
            '<div class="dashboard-stat"><div class="dashboard-stat-icon blue"><i class="fas fa-file-alt"></i></div><div class="dashboard-stat-info"><h3>' + totalApps + '</h3><p>收到简历</p></div></div>' +
            '<div class="dashboard-stat"><div class="dashboard-stat-icon green"><i class="fas fa-calendar-check"></i></div><div class="dashboard-stat-info"><h3>45</h3><p>面试安排</p></div></div>' +
            '<div class="dashboard-stat"><div class="dashboard-stat-icon orange"><i class="fas fa-chart-line"></i></div><div class="dashboard-stat-info"><h3>' + Math.round(totalApps / myPosted.length) + '</h3><p>平均投递/职位</p></div></div>';
        contentEl.innerHTML =
            '<div class="dashboard-card"><h3><i class="fas fa-briefcase"></i> 我的职位 <button class="btn btn-primary btn-sm" style="margin-left:auto" onclick="showPage(\'postJob\')"><i class="fas fa-plus"></i> 发布新职位</button></h3>' +
            myPosted.map(j =>
                '<div class="my-job-card" style="margin-bottom:8px;cursor:pointer" onclick="showJobDetail(' + j.id + ')">' +
                '<div class="my-job-info"><h4>' + j.title + '</h4><div class="job-meta"><span>' + j.date + '</span>' +
                '<span class="app-status" style="background:rgba(52,199,89,0.1);color:var(--apple-green)">招聘中</span></div></div>' +
                '<div class="my-job-stats"><div class="my-job-stat"><span>' + j.views + '</span><label>浏览</label></div>' +
                '<div class="my-job-stat"><span>' + j.applications + '</span><label>投递</label></div>' +
                '<div class="my-job-stat"><span>' + Math.floor(j.applications * 0.15) + '</span><label>面试</label></div></div></div>'
            ).join('') + '</div>' +
            '<div class="dashboard-card"><h3><i class="fas fa-chart-pie"></i> 数据概览</h3>' +
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:16px">' +
            '<div style="text-align:center;padding:20px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><div style="font-size:28px;font-weight:700;color:var(--apple-blue)">' + JOBS.reduce((s, j) => s + j.views, 0) + '</div><div style="font-size:13px;color:var(--text-muted)">总浏览量</div></div>' +
            '<div style="text-align:center;padding:20px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><div style="font-size:28px;font-weight:700;color:var(--apple-green)">' + totalApps + '</div><div style="font-size:13px;color:var(--text-muted)">总投递数</div></div>' +
            '<div style="text-align:center;padding:20px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><div style="font-size:28px;font-weight:700;color:var(--apple-orange)">92%</div><div style="font-size:13px;color:var(--text-muted)">响应率</div></div></div></div>';
    }
}

function getStatusText(s) {
    return { pending: '待处理', viewed: '已查看', interview: '面试邀请', rejected: '未通过', offer: '已录用' }[s] || s;
}

// ========== 投递记录 ==========
function renderApplications(status) {
    const list = document.getElementById('applicationsList');
    if (!currentUser || !list) return;
    let apps = applications.filter(a => a.userId === currentUser.id);
    if (status !== 'all') apps = apps.filter(a => a.status === status);
    list.innerHTML = apps.length === 0
        ? '<div class="empty-state"><i class="fas fa-inbox"></i><p>暂无记录</p><button class="btn btn-primary btn-sm" onclick="showPage(\'jobs\')">去找工作</button></div>'
        : apps.map(a =>
            '<div class="application-card"><div class="app-company-logo" style="background:linear-gradient(135deg,' + a.companyColor + ')">' + a.companyLetter + '</div>' +
            '<div class="app-info"><h4 style="cursor:pointer" onclick="showJobDetail(' + a.jobId + ')">' + a.title + '</h4><p>' + a.company + '</p></div>' +
            '<span class="app-status ' + a.status + '">' + getStatusText(a.status) + '</span><span class="app-date">' + a.date + '</span></div>'
        ).join('');
}
function filterApplications(status, btn) {
    document.querySelectorAll('#applicationsPage .tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderApplications(status);
}

// ========== 收藏 ==========
function renderFavorites() {
    const list = document.getElementById('favoritesList');
    if (!currentUser || !list) return;
    const favJobs = JOBS.filter(j => favorites.includes(j.id));
    list.innerHTML = favJobs.length === 0
        ? '<div class="empty-state"><i class="far fa-heart"></i><p>暂无收藏职位</p><button class="btn btn-primary btn-sm" onclick="showPage(\'jobs\')">去逛逛</button></div>'
        : favJobs.map(j => {
            const co = COMPANIES.find(c => c.id === j.company);
            return '<div class="application-card" onclick="showJobDetail(' + j.id + ')">' +
                '<div class="app-company-logo" style="background:linear-gradient(135deg,' + co.color + ')">' + co.letter + '</div>' +
                '<div class="app-info"><h4>' + j.title + '</h4><p>' + co.name + ' · ' + j.city + '</p></div>' +
                '<div class="job-salary">' + j.salaryMin + 'K-' + j.salaryMax + 'K</div>' +
                '<button class="favorite-btn active" onclick="event.stopPropagation();toggleFavorite(' + j.id + ')"><i class="fas fa-heart"></i></button></div>';
        }).join('');
}

// ========== 简历 ==========
function switchResumeSection(sec, el) {
    document.querySelectorAll('.resume-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.resume-nav a').forEach(a => a.classList.remove('active'));
    const target = document.getElementById('resume' + sec.charAt(0).toUpperCase() + sec.slice(1));
    if (target) target.classList.add('active');
    if (el) el.classList.add('active');
    return false;
}

function renderResumeData() {
    const set = (id, val) => { const e = document.getElementById(id); if (e && val) e.value = val; };
    set('resumeName', resumeData.name);
    set('resumePhone', resumeData.phone);
    set('resumeEmail', resumeData.email || (currentUser && currentUser.email) || '');
    set('resumeCity', resumeData.city);
    set('jobStatus', resumeData.jobStatus);
    set('workYears', resumeData.workYears);
    set('expectedPosition', resumeData.expectedPosition);
    set('expectedSalary', resumeData.expectedSalary);
    set('expectedCity', resumeData.expectedCity);
    set('selfEvaluation', resumeData.selfEvaluation);
    renderEducationList(); renderWorkExpList(); renderProjectList(); renderSkills(); updateCharCount();
}

function saveResume() {
    resumeData = {
        name: document.getElementById('resumeName').value,
        phone: document.getElementById('resumePhone').value,
        email: document.getElementById('resumeEmail').value,
        city: document.getElementById('resumeCity').value,
        jobStatus: document.getElementById('jobStatus').value,
        workYears: document.getElementById('workYears').value,
        expectedPosition: document.getElementById('expectedPosition').value,
        expectedSalary: document.getElementById('expectedSalary').value,
        expectedCity: document.getElementById('expectedCity').value,
        selfEvaluation: resumeData.selfEvaluation || ''
    };
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
    showToast('✅ 基本信息已保存', 'success'); updateResumeProgress();
}

function saveSelfEvaluation() {
    resumeData.selfEvaluation = document.getElementById('selfEvaluation').value;
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
    showToast('✅ 自我评价已保存', 'success'); updateResumeProgress();
}

function updateCharCount() {
    const el = document.getElementById('selfEvaluation');
    const c = document.getElementById('charCount');
    if (el && c) c.textContent = el.value.length;
}

// 教育
function saveEducation() {
    const school = document.getElementById('eduSchool').value.trim();
    const major = document.getElementById('eduMajor').value.trim();
    if (!school || !major) { showToast('请填写学校和专业', 'warning'); return; }
    educationList.push({ id: Date.now(), school, degree: document.getElementById('eduDegree').value, major,
        start: document.getElementById('eduStart').value, end: document.getElementById('eduEnd').value,
        description: document.getElementById('eduDescription').value });
    localStorage.setItem('educationList', JSON.stringify(educationList));
    renderEducationList(); closeModal('educationModal'); document.getElementById('educationForm').reset();
    showToast('✅ 教育经历已添加', 'success'); updateResumeProgress();
}
function renderEducationList() {
    const c = document.getElementById('educationList');
    if (!c) return;
    c.innerHTML = educationList.map(e =>
        '<div class="experience-item"><h4>' + e.school + '</h4><div class="exp-meta">' + e.degree + ' · ' + e.major + ' | ' + (e.start||'') + ' - ' + (e.end||'至今') + '</div>' +
        (e.description ? '<div class="exp-desc">' + e.description + '</div>' : '') +
        '<div class="exp-actions"><button class="btn-icon" onclick="deleteEducation(' + e.id + ')"><i class="fas fa-trash" style="color:var(--apple-red);font-size:13px"></i></button></div></div>'
    ).join('');
}
function deleteEducation(id) {
    educationList = educationList.filter(e => e.id !== id);
    localStorage.setItem('educationList', JSON.stringify(educationList));
    renderEducationList(); updateResumeProgress(); showToast('已删除', 'info');
}

// 工作经历
function saveWorkExperience() {
    const co = document.getElementById('expCompany').value.trim();
    const pos = document.getElementById('expPosition').value.trim();
    if (!co || !pos) { showToast('请填写公司和职位', 'warning'); return; }
    workExpList.push({ id: Date.now(), company: co, position: pos,
        start: document.getElementById('expStart').value,
        end: document.getElementById('expCurrent').checked ? '至今' : document.getElementById('expEnd').value,
        description: document.getElementById('expDescription').value });
    localStorage.setItem('workExpList', JSON.stringify(workExpList));
    renderWorkExpList(); closeModal('experienceModal'); document.getElementById('experienceForm').reset();
    showToast('✅ 工作经历已添加', 'success'); updateResumeProgress();
}
function renderWorkExpList() {
    const c = document.getElementById('experienceList');
    if (!c) return;
    c.innerHTML = workExpList.map(e =>
        '<div class="experience-item"><h4>' + e.company + ' · ' + e.position + '</h4>' +
        '<div class="exp-meta">' + (e.start||'') + ' - ' + (e.end||'至今') + '</div>' +
        (e.description ? '<div class="exp-desc">' + e.description + '</div>' : '') +
        '<div class="exp-actions"><button class="btn-icon" onclick="deleteWorkExp(' + e.id + ')"><i class="fas fa-trash" style="color:var(--apple-red);font-size:13px"></i></button></div></div>'
    ).join('');
}
function deleteWorkExp(id) {
    workExpList = workExpList.filter(e => e.id !== id);
    localStorage.setItem('workExpList', JSON.stringify(workExpList));
    renderWorkExpList(); updateResumeProgress(); showToast('已删除', 'info');
}

// 项目
function saveProject() {
    const name = document.getElementById('projName').value.trim();
    const desc = document.getElementById('projDescription').value.trim();
    if (!name || !desc) { showToast('请填写项目名称和描述', 'warning'); return; }
    projectList.push({ id: Date.now(), name,
        start: document.getElementById('projStart').value, end: document.getElementById('projEnd').value,
        description: desc, role: document.getElementById('projRole').value, tech: document.getElementById('projTech').value });
    localStorage.setItem('projectList', JSON.stringify(projectList));
    renderProjectList(); closeModal('projectModal'); document.getElementById('projectForm').reset();
    showToast('✅ 项目经历已添加', 'success'); updateResumeProgress();
}
function renderProjectList() {
    const c = document.getElementById('projectsList');
    if (!c) return;
    c.innerHTML = projectList.map(p =>
        '<div class="experience-item"><h4>' + p.name + '</h4>' +
        '<div class="exp-meta">' + (p.start||'') + ' - ' + (p.end||'至今') + (p.tech ? ' | ' + p.tech : '') + '</div>' +
        '<div class="exp-desc">' + p.description + '</div>' +
        (p.role ? '<div class="exp-desc" style="margin-top:4px"><strong>个人职责：</strong>' + p.role + '</div>' : '') +
        '<div class="exp-actions"><button class="btn-icon" onclick="deleteProject(' + p.id + ')"><i class="fas fa-trash" style="color:var(--apple-red);font-size:13px"></i></button></div></div>'
    ).join('');
}
function deleteProject(id) {
    projectList = projectList.filter(p => p.id !== id);
    localStorage.setItem('projectList', JSON.stringify(projectList));
    renderProjectList(); updateResumeProgress(); showToast('已删除', 'info');
}

// 技能
function addSkill(e) { if (e.key === 'Enter') { e.preventDefault(); addSkillManual(); } }
function addSkillManual() {
    const input = document.getElementById('skillInput');
    const s = input.value.trim();
    if (!s) return;
    if (userSkills.includes(s)) { showToast('该技能已存在', 'warning'); return; }
    userSkills.push(s); localStorage.setItem('userSkills', JSON.stringify(userSkills));
    input.value = ''; renderSkills(); updateResumeProgress();
}
function addSuggestedSkill(s) {
    if (userSkills.includes(s)) { showToast('该技能已存在', 'warning'); return; }
    userSkills.push(s); localStorage.setItem('userSkills', JSON.stringify(userSkills));
    renderSkills(); updateResumeProgress(); showToast('已添加 ' + s, 'success');
}
function removeSkill(i) {
    userSkills.splice(i, 1); localStorage.setItem('userSkills', JSON.stringify(userSkills));
    renderSkills(); updateResumeProgress();
}
function renderSkills() {
    const c = document.getElementById('skillsTags');
    if (!c) return;
    c.innerHTML = userSkills.map((s, i) =>
        '<span class="skill-tag">' + s + ' <span class="remove-skill" onclick="removeSkill(' + i + ')">&times;</span></span>'
    ).join('');
}

// 进度
function updateResumeProgress() {
    let score = 0;
    if (resumeData.name && resumeData.phone && resumeData.email) score++;
    if (educationList.length > 0) score++;
    if (workExpList.length > 0) score++;
    if (userSkills.length > 0) score++;
    if (projectList.length > 0) score++;
    if (resumeData.selfEvaluation && resumeData.selfEvaluation.length > 20) score++;
    const pct = Math.round((score / 6) * 100);
    const circ = 2 * Math.PI * 54;
    const circle = document.getElementById('progressCircle');
    const text = document.getElementById('progressText');
    if (circle) circle.style.strokeDashoffset = circ - (pct / 100) * circ;
    if (text) text.textContent = pct + '%';
}

// 简历预览
function showResumePreview() {
    const p = document.getElementById('resumePreview');
    p.innerHTML =
        '<div class="resume-preview-header"><h1>' + (resumeData.name || '未填写姓名') + '</h1>' +
        '<div class="contact-info">' +
        (resumeData.phone ? '<span><i class="fas fa-phone"></i> ' + resumeData.phone + '</span>' : '') +
        (resumeData.email ? '<span><i class="fas fa-envelope"></i> ' + resumeData.email + '</span>' : '') +
        (resumeData.city ? '<span><i class="fas fa-map-marker-alt"></i> ' + resumeData.city + '</span>' : '') + '</div>' +
        '<div style="margin-top:8px;display:flex;justify-content:center;gap:16px;font-size:13px;color:var(--text-muted)">' +
        (resumeData.expectedPosition ? '<span>期望：' + resumeData.expectedPosition + '</span>' : '') +
        (resumeData.expectedSalary ? '<span>薪资：' + resumeData.expectedSalary + '</span>' : '') +
        (resumeData.workYears ? '<span>经验：' + resumeData.workYears + '</span>' : '') + '</div></div>' +
        (educationList.length ? '<div class="resume-preview-section"><h2><i class="fas fa-graduation-cap"></i> 教育经历</h2>' + educationList.map(e => '<div class="resume-preview-item"><h4>' + e.school + ' - ' + e.degree + ' - ' + e.major + '</h4><div class="preview-meta">' + (e.start||'') + ' - ' + (e.end||'至今') + '</div>' + (e.description ? '<p>' + e.description + '</p>' : '') + '</div>').join('') + '</div>' : '') +
        (workExpList.length ? '<div class="resume-preview-section"><h2><i class="fas fa-briefcase"></i> 工作经历</h2>' + workExpList.map(e => '<div class="resume-preview-item"><h4>' + e.company + ' - ' + e.position + '</h4><div class="preview-meta">' + (e.start||'') + ' - ' + (e.end||'至今') + '</div><p>' + (e.description||'') + '</p></div>').join('') + '</div>' : '') +
        (userSkills.length ? '<div class="resume-preview-section"><h2><i class="fas fa-cogs"></i> 专业技能</h2><div class="preview-skills">' + userSkills.map(s => '<span class="preview-skill">' + s + '</span>').join('') + '</div></div>' : '') +
        (projectList.length ? '<div class="resume-preview-section"><h2><i class="fas fa-diagram-project"></i> 项目经历</h2>' + projectList.map(p => '<div class="resume-preview-item"><h4>' + p.name + '</h4><div class="preview-meta">' + (p.start||'') + ' - ' + (p.end||'') + (p.tech ? ' | ' + p.tech : '') + '</div><p>' + p.description + '</p>' + (p.role ? '<p><strong>个人职责：</strong>' + p.role + '</p>' : '') + '</div>').join('') + '</div>' : '') +
        (resumeData.selfEvaluation ? '<div class="resume-preview-section"><h2><i class="fas fa-star"></i> 自我评价</h2><p style="font-size:14px;line-height:1.8;color:var(--text-secondary)">' + resumeData.selfEvaluation + '</p></div>' : '');
    showModal('resumePreviewModal');
}

// ========== 发布职位 ==========
function toggleBenefit(el) { el.classList.toggle('selected'); }

function publishJob() {
    if (!currentUser || currentUser.role !== 'recruiter') { showToast('仅招聘者可发布职位', 'warning'); return; }
    const title = document.getElementById('jobTitle').value.trim();
    const cat = document.getElementById('jobCategory').value;
    const loc = document.getElementById('jobLocation').value.trim();
    const sMin = parseInt(document.getElementById('salaryMin').value);
    const sMax = parseInt(document.getElementById('salaryMax').value);
    const resp = document.getElementById('jobResponsibilities').value.trim();
    const req = document.getElementById('jobRequirements').value.trim();
    if (!title || !cat || !loc || !sMin || !sMax || !resp || !req) { showToast('请填写所有必填项', 'warning'); return; }
    const benefits = [];
    document.querySelectorAll('.benefit-tag.selected').forEach(el => benefits.push(el.textContent));
    const cityMap = { '北京': '北京', '上海': '上海', '深圳': '深圳', '杭州': '杭州', '广州': '广州', '成都': '成都' };
    let city = '其他';
    for (let k in cityMap) { if (loc.includes(k)) { city = k; break; } }
    const newJob = {
        id: JOBS.length + 100, title, company: 1, category: cat, city, location: loc,
        salaryMin: sMin, salaryMax: sMax,
        education: document.getElementById('jobEducation').value,
        experience: document.getElementById('jobExperience').value,
        type: document.getElementById('jobType').value,
        tags: [cat], benefits, desc: title,
        requirements: req.split('\n').filter(x => x.trim()),
        responsibilities: resp.split('\n').filter(x => x.trim()),
        date: new Date().toISOString().split('T')[0], views: 0, applications: 0
    };
    JOBS.unshift(newJob);
    showToast('🎉 职位发布成功！', 'success');
    document.getElementById('postJobForm').reset();
    document.querySelectorAll('.benefit-tag').forEach(t => t.classList.remove('selected'));
    showPage('myJobs');
}

// ========== 我的职位 ==========
function renderMyJobs() {
    const c = document.getElementById('myJobsList');
    if (!c) return;
    const myJobs = JOBS.slice(0, 5);
    c.innerHTML = myJobs.map(j =>
        '<div class="my-job-card"><div class="my-job-info"><h4>' + j.title + '</h4>' +
        '<div class="job-meta"><span>发布日期：' + j.date + '</span>' +
        '<span class="app-status" style="background:rgba(52,199,89,0.1);color:var(--apple-green)">招聘中</span></div></div>' +
        '<div class="my-job-stats"><div class="my-job-stat"><span>' + j.views + '</span><label>浏览</label></div>' +
        '<div class="my-job-stat"><span>' + j.applications + '</span><label>投递</label></div>' +
        '<div class="my-job-stat"><span>' + Math.floor(j.applications * 0.15) + '</span><label>面试</label></div></div>' +
        '<div class="my-job-actions"><button class="btn btn-sm btn-outline" onclick="showPage(\'candidates\')"><i class="fas fa-users"></i> 查看候选人</button></div></div>'
    ).join('');
}

// ========== 候选人 ==========
function renderCandidates() {
    const c = document.getElementById('candidatesList');
    if (!c) return;
    const candidates = [
        { name: '张三', pos: '高级前端开发', exp: '3年经验', edu: '本科', status: 'pending', avatar: '张', job: '高级前端开发工程师' },
        { name: '李四', pos: '前端开发工程师', exp: '5年经验', edu: '硕士', status: 'viewed', avatar: '李', job: '高级前端开发工程师' },
        { name: '王五', pos: 'Go后端开发', exp: '4年经验', edu: '本科', status: 'interview', avatar: '王', job: 'Java后端开发工程师' },
        { name: '赵六', pos: '应届前端', exp: '应届生', edu: '本科', status: 'pending', avatar: '赵', job: '应届生-前端开发' },
        { name: '孙七', pos: '应届前端', exp: '应届生', edu: '硕士', status: 'rejected', avatar: '孙', job: '应届生-前端开发' },
        { name: '周八', pos: '产品经理', exp: '3年经验', edu: '本科', status: 'offer', avatar: '周', job: '产品经理' }
    ];
    c.innerHTML = candidates.map((cd, i) =>
        '<div class="candidate-card"><div class="candidate-avatar">' + cd.avatar + '</div>' +
        '<div class="candidate-info"><h4>' + cd.name + '</h4><p>' + cd.pos + ' · ' + cd.exp + ' · ' + cd.edu + ' · 投递：' + cd.job + '</p></div>' +
        '<span class="app-status ' + cd.status + '">' + getStatusText(cd.status) + '</span>' +
        '<div class="candidate-actions">' +
        (cd.status === 'pending' || cd.status === 'viewed'
            ? '<button class="btn btn-sm btn-success" onclick="showToast(\'已发送面试邀请\',\'success\')">邀请面试</button><button class="btn btn-sm btn-danger" onclick="showToast(\'已拒绝\',\'info\')">拒绝</button>'
            : '') +
        '<button class="btn btn-sm btn-outline" onclick="showToast(\'查看简历功能开发中\',\'info\')">简历</button>' +
        (cd.status === 'interview' ? '<button class="btn btn-sm btn-primary" onclick="showToast(\'已发放Offer\',\'success\')">发Offer</button>' : '') +
        '</div></div>'
    ).join('');
}
function filterCandidates() { renderCandidates(); }

// ========== 消息 ==========
function renderConversations() {
    const c = document.getElementById('conversationsList');
    if (!c) return;
    c.innerHTML = conversations.map(cv =>
        '<div class="conversation-item ' + (cv.unread > 0 ? 'unread' : '') + ' ' + (activeConversation === cv.id ? 'active' : '') + '" onclick="openConversation(' + cv.id + ')">' +
        '<div class="conv-avatar">' + cv.avatar + (cv.online ? '<div class="online-dot"></div>' : '') + '</div>' +
        '<div class="conv-info"><h4>' + cv.name + ' <span>' + cv.time + '</span></h4><p>' + cv.lastMessage + '</p></div>' +
        (cv.unread > 0 ? '<div class="unread-dot"></div>' : '') + '</div>'
    ).join('');
}

function openConversation(id) {
    activeConversation = id;
    const cv = conversations.find(c => c.id === id);
    if (!cv) return;
    document.getElementById('chatAvatar').textContent = cv.avatar;
    document.getElementById('chatName').textContent = cv.name;
    document.getElementById('chatStatus').textContent = cv.online ? '在线' : '离线';
    document.getElementById('chatStatus').style.color = cv.online ? 'var(--apple-green)' : 'var(--text-tertiary)';
    document.getElementById('chatInput').style.display = 'flex';
    const msgs = document.getElementById('chatMessages');
    msgs.innerHTML = cv.messages.map(m =>
        '<div class="message-bubble ' + (m.from === 'me' ? 'sent' : 'received') + '">' +
        '<div>' + m.text + '</div><div class="message-time">' + m.time + '</div></div>'
    ).join('');
    msgs.scrollTop = msgs.scrollHeight;
    cv.unread = 0;
    saveConversations(); renderConversations();
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text || !activeConversation) return;
    const cv = conversations.find(c => c.id === activeConversation);
    if (!cv) return;
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    cv.messages.push({ from: 'me', text, time });
    cv.lastMessage = text; cv.time = time;
    input.value = '';
    saveConversations(); openConversation(activeConversation);
    // 模拟自动回复
    setTimeout(() => {
        const replies = ['好的，收到！', '我理解了，稍后回复您。', '感谢您的消息！我们安排一下。', '好的，我们会尽快处理。', '收到，已转达给相关部门。'];
        const replyTime = new Date();
        const rt = replyTime.getHours().toString().padStart(2, '0') + ':' + replyTime.getMinutes().toString().padStart(2, '0');
        cv.messages.push({ from: cv.userId, text: replies[Math.floor(Math.random() * replies.length)], time: rt });
        cv.lastMessage = cv.messages[cv.messages.length - 1].text; cv.time = rt;
        saveConversations();
        if (activeConversation === cv.id) openConversation(cv.id);
    }, 1500);
}

function handleMessageInput(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }

function markAllRead() {
    conversations.forEach(c => c.unread = 0);
    saveConversations(); renderConversations(); showToast('已全部标为已读', 'success');
}

function saveConversations() {
    localStorage.setItem('conversations', JSON.stringify(conversations));
}

function startChat(name, avatar) {
    if (!currentUser) { showToast('请先登录', 'warning'); showModal('loginModal'); return; }
    let conv = conversations.find(c => c.name === name);
    if (!conv) {
        conv = { id: Date.now(), userId: 'chat_' + Date.now(), name, avatar, online: true,
            lastMessage: '新会话', time: '刚刚', unread: 0, messages: [] };
        conversations.unshift(conv);
        saveConversations();
    }
    showPage('messages');
    openConversation(conv.id);
}

// ========== 个人中心 ==========
function renderProfile() {
    if (!currentUser) return;
    document.getElementById('profileAvatar').textContent = currentUser.username.charAt(0).toUpperCase();
    document.getElementById('profileName').textContent = currentUser.username;
    const rb = document.getElementById('profileRole');
    rb.textContent = currentUser.role === 'recruiter' ? '招聘者' : '求职者';
    rb.className = 'role-badge ' + currentUser.role;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileUsername').value = currentUser.username;
    document.getElementById('profileEmailInput').value = currentUser.email;
    document.getElementById('profilePhone').value = currentUser.phone || '';
    document.getElementById('profileCity').value = currentUser.city || '';
    document.getElementById('profileStat1').textContent = applications.filter(a => a.userId === currentUser.id).length;
    document.getElementById('profileStat2').textContent = favorites.length;
    document.getElementById('profileStat3').textContent = applications.filter(a => a.userId === currentUser.id && a.status === 'interview').length;
}

function saveProfile() {
    if (!currentUser) return;
    currentUser.phone = document.getElementById('profilePhone').value;
    currentUser.city = document.getElementById('profileCity').value;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[currentUser.id]) { users[currentUser.id] = { ...users[currentUser.id], ...currentUser }; localStorage.setItem('users', JSON.stringify(users)); }
    showToast('✅ 个人信息已更新', 'success');
}

function changePassword() {
    const cur = document.getElementById('currentPassword').value;
    const np = document.getElementById('newPassword').value;
    const cf = document.getElementById('confirmPassword').value;
    if (!cur || !np) { showToast('请填写密码', 'warning'); return; }
    if (np !== cf) { showToast('两次密码不一致', 'error'); return; }
    if (np.length < 6) { showToast('密码至少6位', 'warning'); return; }
    if (cur !== currentUser.password) { showToast('当前密码错误', 'error'); return; }
    currentUser.password = np;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[currentUser.id]) { users[currentUser.id].password = np; localStorage.setItem('users', JSON.stringify(users)); }
    ['currentPassword','newPassword','confirmPassword'].forEach(id => document.getElementById(id).value = '');
    showToast('✅ 密码修改成功', 'success');
}

// ========== 薪资页面 ==========
function renderSalaryPage() {
    const salaryData = [
        { rank: 1, title: '算法工程师', avg: '¥45,000', range: '30K-70K', growth: '+18.5%' },
        { rank: 2, title: '架构师', avg: '¥42,000', range: '30K-60K', growth: '+15.2%' },
        { rank: 3, title: '数据科学家', avg: '¥38,000', range: '25K-55K', growth: '+16.8%' },
        { rank: 4, title: '前端开发', avg: '¥28,000', range: '15K-50K', growth: '+12.3%' },
        { rank: 5, title: '后端开发', avg: '¥30,000', range: '18K-55K', growth: '+13.1%' },
        { rank: 6, title: '产品经理', avg: '¥26,000', range: '15K-45K', growth: '+10.5%' },
        { rank: 7, title: 'UI设计师', avg: '¥20,000', range: '12K-35K', growth: '+8.7%' },
        { rank: 8, title: '运维工程师', avg: '¥22,000', range: '12K-40K', growth: '+9.2%' },
        { rank: 9, title: '测试工程师', avg: '¥18,000', range: '10K-30K', growth: '+7.5%' },
        { rank: 10, title: '市场运营', avg: '¥16,000', range: '8K-30K', growth: '+6.8%' }
    ];
    const tbody = document.getElementById('salaryTableBody');
    if (tbody) {
        tbody.innerHTML = salaryData.map(s =>
            '<tr style="border-bottom:0.5px solid var(--divider)">' +
            '<td style="padding:16px 24px"><span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;font-size:13px;font-weight:700;' + (s.rank <= 3 ? 'background:var(--apple-blue);color:white' : 'background:var(--bg-tertiary);color:var(--text-secondary)') + '">' + s.rank + '</span></td>' +
            '<td style="padding:16px 24px;font-weight:600;font-size:15px">' + s.title + '</td>' +
            '<td style="padding:16px 24px;font-size:16px;font-weight:700;color:var(--apple-red)">' + s.avg + '</td>' +
            '<td style="padding:16px 24px;color:var(--text-secondary);font-size:14px">' + s.range + '</td>' +
            '<td style="padding:16px 24px;color:var(--apple-green);font-weight:600;font-size:14px">' + s.growth + '</td></tr>'
        ).join('');
    }
    const cityChart = document.getElementById('citySalaryChart');
    if (cityChart) {
        const cities = [{name:'北京',v:100},{name:'上海',v:95},{name:'深圳',v:94},{name:'杭州',v:86},{name:'广州',v:77},{name:'成都',v:65}];
        cityChart.innerHTML = cities.map(c =>
            '<div style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px"><span style="font-weight:500">' + c.name + '</span><span style="color:var(--apple-blue);font-weight:600">¥' + Math.round(c.v * 285) + '</span></div>' +
            '<div style="background:var(--bg-tertiary);border-radius:980px;height:8px;overflow:hidden"><div style="background:var(--gradient-blue);height:100%;border-radius:980px;width:' + c.v + '%"></div></div></div>'
        ).join('');
    }
    const eduChart = document.getElementById('eduSalaryChart');
    if (eduChart) {
        const edus = [{name:'博士',v:100,s:'¥38,000'},{name:'硕士',v:74,s:'¥28,000'},{name:'本科',v:53,s:'¥20,000'},{name:'大专',v:37,s:'¥14,000'}];
        eduChart.innerHTML = edus.map(e =>
            '<div style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px"><span style="font-weight:500">' + e.name + '</span><span style="color:var(--apple-green);font-weight:600">' + e.s + '</span></div>' +
            '<div style="background:var(--bg-tertiary);border-radius:980px;height:8px;overflow:hidden"><div style="background:var(--gradient-cool);height:100%;border-radius:980px;width:' + e.v + '%"></div></div></div>'
        ).join('');
    }
}

// ========== 职场资讯 ==========
const BLOG_POSTS = [
    { id:1, cat:'tips', title:'2026年简历撰写完全指南', excerpt:'一份优秀的简历是求职成功的第一步。本文从格式、内容、关键词优化等多个维度，为你提供全面的简历撰写指导。', author:'智聘通编辑部', date:'2026-05-15', read:'8分钟', views:12580, color:'#007AFF' },
    { id:2, cat:'interview', title:'大厂面试常见算法题 TOP 50', excerpt:'汇总了字节、腾讯、阿里等头部企业的高频算法面试题，附带详细解题思路和代码实现。', author:'技术面试官', date:'2026-05-14', read:'15分钟', views:28900, color:'#AF52DE' },
    { id:3, cat:'industry', title:'AI 时代，哪些岗位最有前景？', excerpt:'人工智能正在重塑就业市场。分析当前最具潜力的AI相关岗位，以及如何为AI时代做好职业准备。', author:'行业研究院', date:'2026-05-13', read:'10分钟', views:18700, color:'#FF9500' },
    { id:4, cat:'career', title:'从初级到高级：程序员的成长路线图', excerpt:'技术深度、架构思维、管理能力...全面解析程序员职业发展的三大阶段和关键能力。', author:'资深CTO', date:'2026-05-12', read:'12分钟', views:15300, color:'#34C759' },
    { id:5, cat:'tips', title:'如何谈出满意的薪资？谈判技巧全攻略', excerpt:'薪资谈判是求职过程中最关键的环节之一。掌握这些策略和话术，帮你争取到应有的报酬。', author:'职业规划师', date:'2026-05-11', read:'7分钟', views:9800, color:'#FF2D55' },
    { id:6, cat:'industry', title:'远程办公趋势报告：2026年最新数据', excerpt:'后疫情时代远程办公成为新常态。数据显示65%的科技公司支持混合办公模式。', author:'数据研究中心', date:'2026-05-10', read:'6分钟', views:7600, color:'#5AC8FA' },
    { id:7, cat:'interview', title:'行为面试 STAR 法则详解与实战案例', excerpt:'掌握STAR法则，让你在行为面试中脱颖而出。附20个常见行为面试问题的参考回答。', author:'面试辅导专家', date:'2026-05-09', read:'11分钟', views:11200, color:'#5856D6' },
    { id:8, cat:'career', title:'30岁转行，来得及吗？', excerpt:'真实案例分享：5位成功转行者的经历和建议。转行不难，关键在于方法和心态。', author:'智聘通编辑部', date:'2026-05-08', read:'9分钟', views:22100, color:'#FF3B30' }
];

function getCatName(c) { return {tips:'求职技巧',industry:'行业动态',career:'职业规划',interview:'面试经验'}[c]||c; }

function renderBlog() {
    const g = document.getElementById('blogGrid');
    if (!g) return;
    renderBlogPosts(BLOG_POSTS);
}
function renderBlogPosts(posts) {
    const g = document.getElementById('blogGrid');
    if (!g) return;
    g.innerHTML = posts.map(p =>
        '<div class="blog-card" onclick="showToast(\'文章详情页开发中\',\'info\')" style="background:var(--bg-secondary);border-radius:var(--radius-lg);border:1px solid var(--divider);overflow:hidden;cursor:pointer;transition:var(--transition)">' +
        '<div style="height:4px;background:' + p.color + '"></div><div style="padding:24px">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">' +
        '<span style="padding:3px 10px;border-radius:980px;font-size:11px;font-weight:600;background:' + p.color + '18;color:' + p.color + '">' + getCatName(p.cat) + '</span>' +
        '<span style="font-size:12px;color:var(--text-tertiary)">' + p.read + '阅读</span></div>' +
        '<h3 style="font-size:17px;font-weight:600;margin-bottom:10px;line-height:1.4">' + p.title + '</h3>' +
        '<p style="font-size:13px;color:var(--text-secondary);line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:16px">' + p.excerpt + '</p>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--text-tertiary)">' +
        '<span>' + p.author + '</span><span><i class="fas fa-eye" style="margin-right:4px"></i>' + (p.views/1000).toFixed(1) + 'K</span></div></div></div>'
    ).join('');
}
function filterBlog(cat, btn) {
    document.querySelectorAll('#blogPage .tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderBlogPosts(cat === 'all' ? BLOG_POSTS : BLOG_POSTS.filter(p => p.cat === cat));
}
