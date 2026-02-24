# 知觉反应与速度训练测试系统

一个基于 Vue 3 的知觉反应与速度训练测试网站，帮助用户提升知觉反应速度。

## 功能特性

- **知觉速度训练**：5×3 词语表格，10 道题目
- **多难度级别**：简单/中等/困难（随机干扰/近义词干扰/形似字干扰）
- **用户系统**：注册、登录、训练记录
- **管理后台**：用户管理、词语管理、训练记录查看
- **响应式设计**：支持桌面端和移动端

## 技术栈

- **前端**：Vue 3 + Vite + Pinia + Vue Router
- **后端**：Express.js（本地开发）/ Vercel Serverless Functions（生产）
- **数据库**：SQLite（本地）/ Supabase（生产）

## 本地开发

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server && npm install && cd ..

# 启动后端（终端1）
cd server && npm start

# 启动前端（终端2）
npm run dev
```

访问 http://localhost:3000

## 部署

### Vercel + Supabase 部署

详细步骤请查看 [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

### 传统服务器部署

详细步骤请查看 [DEPLOY.md](./DEPLOY.md)

## 项目结构

```
pas-test/
├── src/                    # 前端源码
│   ├── components/         # Vue 组件
│   ├── composables/        # 组合式函数
│   ├── data/               # 静态数据
│   ├── router/             # 路由配置
│   ├── stores/             # Pinia 状态管理
│   ├── styles/             # 全局样式
│   └── views/              # 页面视图
├── server/                 # 后端源码（本地开发）
│   ├── routes/             # API 路由
│   ├── data/               # SQLite 数据库
│   └── index.js            # 服务入口
├── api/                    # Vercel Serverless Functions
│   ├── auth/               # 认证 API
│   ├── training/           # 训练记录 API
│   └── words/              # 词语管理 API
├── supabase/               # Supabase 配置
│   └── init.sql            # 数据库初始化
├── vercel.json             # Vercel 配置
└── vite.config.js          # Vite 配置
```

## 使用说明

1. 注册/登录账号
2. 选择难度级别
3. 点击"开始测试"
4. 观察左侧词语表格
5. 判断每道题中有多少词语来自表格
6. 完成所有题目后提交

## License

MIT
