// ========== Sample Data ==========
const COMPANIES = [
    { id: 1, name: '字节跳动', letter: '字', color: '#667eea,#764ba2', industry: '互联网', size: '10000人以上', stage: '已上市', desc: '字节跳动是全球领先的科技公司，旗下拥有抖音、今日头条、飞书等多款产品，致力于用技术赋能创作与交流。', city: '北京', website: 'bytedance.com', founded: '2012' },
    { id: 2, name: '腾讯', letter: '腾', color: '#f093fb,#f5576c', industry: '互联网', size: '10000人以上', stage: '已上市', desc: '腾讯是中国领先的互联网增值服务提供商，通过微信、QQ等平台连接全球用户。', city: '深圳', website: 'tencent.com', founded: '1998' },
    { id: 3, name: '阿里巴巴', letter: '阿', color: '#4facfe,#00f2fe', industry: '电商/互联网', size: '10000人以上', stage: '已上市', desc: '阿里巴巴集团是全球领先的电子商务和科技公司，致力于让天下没有难做的生意。', city: '杭州', website: 'alibaba.com', founded: '1999' },
    { id: 4, name: '华为', letter: '华', color: '#43e97b,#38f9d7', industry: '通信/科技', size: '10000人以上', stage: '非上市', desc: '华为是全球领先的ICT基础设施和智能终端提供商，致力于构建万物互联的智能世界。', city: '深圳', website: 'huawei.com', founded: '1987' },
    { id: 5, name: '美团', letter: '美', color: '#fa709a,#fee140', industry: '本地生活', size: '10000人以上', stage: '已上市', desc: '美团是中国领先的生活服务电子商务平台，业务覆盖餐饮、酒旅、出行等多个领域。', city: '北京', website: 'meituan.com', founded: '2010' },
    { id: 6, name: '京东', letter: '京', color: '#a18cd1,#fbc2eb', industry: '电商', size: '10000人以上', stage: '已上市', desc: '京东是中国领先的技术驱动型电商和零售基础设施服务商，以供应链为核心。', city: '北京', website: 'jd.com', founded: '1998' },
    { id: 7, name: '小米', letter: '小', color: '#fccb90,#d57eeb', industry: '智能硬件', size: '10000人以上', stage: '已上市', desc: '小米是一家以智能手机、智能硬件和IoT平台为核心的互联网公司。', city: '北京', website: 'mi.com', founded: '2010' },
    { id: 8, name: '网易', letter: '网', color: '#e0c3fc,#8ec5fc', industry: '互联网/游戏', size: '10000人以上', stage: '已上市', desc: '网易是中国领先的互联网技术公司，在游戏、音乐、教育等领域深耕多年。', city: '杭州', website: 'netease.com', founded: '1997' },
    { id: 9, name: '百度', letter: '百', color: '#667eea,#f093fb', industry: '互联网/AI', size: '10000人以上', stage: '已上市', desc: '百度是全球最大的中文搜索引擎和领先的AI公司。', city: '北京', website: 'baidu.com', founded: '2000' },
    { id: 10, name: '滴滴出行', letter: '滴', color: '#4facfe,#43e97b', industry: '出行', size: '10000人以上', stage: '已上市', desc: '滴滴出行是全球领先的移动出行平台，提供出租车、专车、快车等多种出行服务。', city: '北京', website: 'didiglobal.com', founded: '2012' }
];

const JOBS = [
    { id: 1, title: '高级前端开发工程师', company: 1, category: '技术', city: '北京', location: '海淀区中关村', salaryMin: 30, salaryMax: 60, education: '本科', experience: '3-5年', type: '全职', tags: ['React', 'TypeScript', 'Node.js'], benefits: ['五险一金', '年终奖', '股票期权', '免费三餐'], desc: '负责公司核心产品的前端开发工作，参与技术架构设计和优化。', requirements: ['3年以上前端开发经验', '精通React/Vue等主流框架', '熟悉TypeScript', '良好的代码规范和团队协作能力'], responsibilities: ['负责核心业务模块的前端开发', '参与前端技术选型和架构设计', '优化前端性能，提升用户体验', '与产品、设计、后端团队紧密协作'], date: '2026-05-15', views: 1256, applications: 89 },
    { id: 2, title: 'Java后端开发工程师', company: 2, category: '技术', city: '深圳', location: '南山区', salaryMin: 25, salaryMax: 50, education: '本科', experience: '3-5年', type: '全职', tags: ['Java', 'Spring Boot', 'MySQL', 'Redis'], benefits: ['五险一金', '年终奖', '带薪年假', '健身房'], desc: '参与微信支付核心系统的开发与维护。', requirements: ['3年以上Java开发经验', '熟悉Spring生态', '熟悉分布式系统设计', '有高并发系统开发经验优先'], responsibilities: ['负责支付系统核心模块开发', '参与系统架构优化', '编写技术文档和单元测试', '参与代码评审'], date: '2026-05-14', views: 980, applications: 67 },
    { id: 3, title: '产品经理', company: 3, category: '产品', city: '杭州', location: '余杭区', salaryMin: 25, salaryMax: 45, education: '本科', experience: '3-5年', type: '全职', tags: ['B端产品', '数据分析', '项目管理'], benefits: ['五险一金', '年终奖', '股票期权', '弹性工作'], desc: '负责电商平台核心产品线的规划和设计。', requirements: ['3年以上B端产品经验', '优秀的逻辑分析能力', '良好的沟通协调能力', '有电商行业经验优先'], responsibilities: ['负责产品需求分析和功能设计', '撰写产品需求文档', '跟进产品开发进度', '分析产品数据并持续优化'], date: '2026-05-13', views: 856, applications: 78 },
    { id: 4, title: '数据分析师', company: 4, category: '技术', city: '深圳', location: '龙岗区坂田', salaryMin: 20, salaryMax: 40, education: '硕士', experience: '1-3年', type: '全职', tags: ['Python', 'SQL', 'Tableau', '机器学习'], benefits: ['五险一金', '年终奖', '定期体检', '团建活动'], desc: '负责业务数据分析，提供数据驱动的决策支持。', requirements: ['硕士及以上学历', '统计学/数学/计算机相关专业', '精通SQL和Python', '有数据分析项目经验'], responsibilities: ['建立数据分析体系', '定期输出业务分析报告', '搭建数据看板', '参与数据建模'], date: '2026-05-12', views: 723, applications: 56 },
    { id: 5, title: 'UI/UX设计师', company: 5, category: '产品', city: '北京', location: '朝阳区', salaryMin: 20, salaryMax: 35, education: '本科', experience: '1-3年', type: '全职', tags: ['Figma', 'Sketch', '用户研究', '交互设计'], benefits: ['五险一金', '年终奖', '弹性工作', '免费三餐'], desc: '负责美团App的界面设计和用户体验优化。', requirements: ['1年以上UI/UX设计经验', '精通Figma/Sketch等工具', '有移动端设计经验', '优秀的设计审美'], responsibilities: ['负责产品UI设计', '进行用户研究和可用性测试', '维护设计规范和组件库', '与产品经理和开发团队协作'], date: '2026-05-11', views: 645, applications: 45 },
    { id: 6, title: '算法工程师', company: 9, category: '技术', city: '北京', location: '海淀区', salaryMin: 35, salaryMax: 70, education: '硕士', experience: '3-5年', type: '全职', tags: ['深度学习', 'NLP', 'PyTorch', '推荐系统'], benefits: ['五险一金', '年终奖', '股票期权', '免费三餐', '健身房'], desc: '参与百度搜索核心算法的研发。', requirements: ['硕士及以上学历', '3年以上算法开发经验', '精通深度学习框架', '有推荐系统或NLP经验优先'], responsibilities: ['研发搜索推荐算法', '优化模型性能', '参与论文发表', '跟踪前沿技术'], date: '2026-05-10', views: 1560, applications: 120 },
    { id: 7, title: '市场运营经理', company: 10, category: '市场', city: '北京', location: '海淀区', salaryMin: 18, salaryMax: 30, education: '本科', experience: '3-5年', type: '全职', tags: ['品牌营销', '活动策划', '新媒体'], benefits: ['五险一金', '年终奖', '带薪年假'], desc: '负责品牌营销和市场推广策略的制定与执行。', requirements: ['3年以上市场营销经验', '优秀的策划能力', '良好的数据分析能力', '有互联网行业经验优先'], responsibilities: ['制定市场营销策略', '策划品牌活动', '管理新媒体渠道', '分析市场数据和竞品动态'], date: '2026-05-09', views: 534, applications: 42 },
    { id: 8, title: '财务主管', company: 6, category: '金融', city: '北京', location: '亦庄', salaryMin: 20, salaryMax: 35, education: '本科', experience: '5-10年', type: '全职', tags: ['财务管理', '审计', '税务', 'Oracle'], benefits: ['五险一金', '年终奖', '带薪年假', '定期体检'], desc: '负责公司财务核算和财务管理工作。', requirements: ['5年以上财务工作经验', '持有CPA证书', '熟悉企业财务制度', '有大型企业经验优先'], responsibilities: ['负责日常财务核算', '编制财务报表', '管理税务申报', '参与预算编制和成本控制'], date: '2026-05-08', views: 423, applications: 35 },
    { id: 9, title: 'Android开发工程师', company: 7, category: '技术', city: '北京', location: '海淀区', salaryMin: 22, salaryMax: 45, education: '本科', experience: '3-5年', type: '全职', tags: ['Kotlin', 'Jetpack', 'MVVM'], benefits: ['五险一金', '年终奖', '免费三餐', '弹性工作'], desc: '负责小米商城App的Android端开发。', requirements: ['3年以上Android开发经验', '精通Kotlin', '熟悉Jetpack组件', '有大型App开发经验'], responsibilities: ['负责App功能开发', '优化App性能', '参与架构设计', '代码评审'], date: '2026-05-07', views: 678, applications: 52 },
    { id: 10, title: '游戏客户端开发', company: 8, category: '技术', city: '杭州', location: '滨江区', salaryMin: 25, salaryMax: 50, education: '本科', experience: '3-5年', type: '全职', tags: ['Unity', 'C#', 'Shader', '3D'], benefits: ['五险一金', '年终奖', '股票期权', '免费三餐', '健身房'], desc: '参与网易大型游戏项目的客户端开发。', requirements: ['3年以上游戏开发经验', '精通Unity引擎', '熟悉3D渲染', '有上线项目经验'], responsibilities: ['负责游戏客户端模块开发', '优化游戏性能', '实现游戏特效', '与策划和美术团队协作'], date: '2026-05-06', views: 890, applications: 73 },
    { id: 11, title: '销售总监', company: 4, category: '销售', city: '深圳', location: '龙岗区坂田', salaryMin: 40, salaryMax: 80, education: '本科', experience: '10年以上', type: '全职', tags: ['B2B销售', '团队管理', '大客户'], benefits: ['五险一金', '年终奖', '股票期权', '出差补贴'], desc: '负责企业业务销售团队管理和业绩达成。', requirements: ['10年以上B2B销售经验', '5年以上团队管理经验', '有政企客户资源', '优秀的商务谈判能力'], responsibilities: ['制定销售策略和计划', '管理销售团队', '开拓大客户', '完成销售业绩目标'], date: '2026-05-05', views: 456, applications: 28 },
    { id: 12, title: '应届生-前端开发', company: 1, category: '技术', city: '北京', location: '海淀区中关村', salaryMin: 15, salaryMax: 25, education: '本科', experience: '应届生', type: '全职', tags: ['JavaScript', 'Vue.js', 'CSS3'], benefits: ['五险一金', '年终奖', '免费三餐', '导师制'], desc: '面向2026届毕业生的前端开发岗位。', requirements: ['2026年应届毕业生', '计算机相关专业', '了解前端基础技术', '有个人项目经验优先'], responsibilities: ['参与产品前端开发', '学习和使用新技术', '参与代码评审', '完成导师安排的任务'], date: '2026-05-16', views: 2340, applications: 320 },
    { id: 13, title: 'HRBP', company: 5, category: '人事', city: '北京', location: '朝阳区望京', salaryMin: 20, salaryMax: 35, education: '本科', experience: '3-5年', type: '全职', tags: ['HRBP', '招聘', '绩效管理'], benefits: ['五险一金', '年终奖', '弹性工作', '定期体检'], desc: '作为业务线HRBP，支持业务团队的人力资源管理工作。', requirements: ['3年以上HRBP经验', '互联网行业经验', '优秀的沟通能力', '熟悉人力资源各模块'], responsibilities: ['支持业务团队日常HR需求', '推动人才发展计划', '处理员工关系', '参与组织文化建设'], date: '2026-05-14', views: 567, applications: 48 },
    { id: 14, title: 'Go后端开发', company: 2, category: '技术', city: '深圳', location: '南山区', salaryMin: 28, salaryMax: 55, education: '本科', experience: '3-5年', type: '全职', tags: ['Go', '微服务', 'Docker', 'K8s'], benefits: ['五险一金', '年终奖', '带薪年假', '健身房'], desc: '参与腾讯云核心服务的后端开发。', requirements: ['3年以上Go语言开发经验', '熟悉微服务架构', '了解容器化技术', '有云服务开发经验优先'], responsibilities: ['负责云服务后端开发', '设计微服务架构', '优化系统性能和稳定性', '编写技术文档'], date: '2026-05-13', views: 823, applications: 65 },
    { id: 15, title: 'DevOps工程师', company: 3, category: '技术', city: '杭州', location: '余杭区', salaryMin: 25, salaryMax: 45, education: '本科', experience: '3-5年', type: '全职', tags: ['CI/CD', 'Jenkins', 'Ansible', 'Terraform'], benefits: ['五险一金', '年终奖', '股票期权', '弹性工作'], desc: '负责公司CI/CD平台和基础设施的建设和维护。', requirements: ['3年以上DevOps经验', '熟悉CI/CD流程', '精通Linux系统', '了解云平台运维'], responsibilities: ['建设和维护CI/CD平台', '自动化运维工具开发', '监控告警体系建设', '容量规划和性能优化'], date: '2026-05-12', views: 567, applications: 43 }
];

// Sample users (pre-created for demo)
const DEMO_USERS = {
    'demo': { id: 'demo', username: 'demo', email: 'demo@example.com', password: '123456', role: 'jobseeker', company: '', phone: '13800138000', city: '北京', createdAt: '2026-01-01' },
    'recruiter': { id: 'recruiter', username: 'recruiter', email: 'hr@bytedance.com', password: '123456', role: 'recruiter', company: '字节跳动', position: 'HR经理', phone: '13900139000', city: '北京', createdAt: '2026-01-01' }
};

// Sample conversations
const DEMO_CONVERSATIONS = [
    { id: 1, userId: 'recruiter', name: '字节跳动HR', avatar: 'HR', lastMessage: '您好，我们对您的简历很感兴趣，方便聊一下吗？', time: '14:30', unread: 2, messages: [
        { from: 'recruiter', text: '您好，我是字节跳动的HR，看到了您投递的简历。', time: '14:28' },
        { from: 'recruiter', text: '我们对您的背景很感兴趣，方便聊一下吗？', time: '14:30' }
    ]},
    { id: 2, userId: 'hr_tencent', name: '腾讯招聘', avatar: '腾', lastMessage: '感谢您的投递，我们会在3个工作日内回复。', time: '昨天', unread: 0, messages: [
        { from: 'me', text: '您好，我想咨询一下Java后端开发岗位的详细信息。', time: '昨天 10:20' },
        { from: 'hr_tencent', text: '感谢您的投递，我们会在3个工作日内回复。', time: '昨天 10:35' }
    ]}
];

// Sample dashboard data for recruiter
const RECRUITER_JOBS = [
    { id: 1, title: '高级前端开发工程师', status: 'active', views: 1256, applications: 89, interviews: 12, date: '2026-05-15' },
    { id: 2, title: 'Go后端开发', status: 'active', views: 823, applications: 65, interviews: 8, date: '2026-05-13' },
    { id: 3, title: '应届生-前端开发', status: 'active', views: 2340, applications: 320, interviews: 25, date: '2026-05-16' }
];
