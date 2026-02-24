# Vercel 部署指南

## 前置要求

1. 注册 [Supabase](https://supabase.com) 账号（免费）
2. 注册 [Vercel](https://vercel.com) 账号
3. 安装 Vercel CLI（可选）：`npm i -g vercel`

## 步骤一：设置 Supabase 数据库

### 1. 创建新项目

1. 登录 Supabase Dashboard
2. 点击 "New Project" 创建新项目
3. 填写项目名称和数据库密码
4. 选择离你最近的区域
5. 等待项目创建完成（约 2 分钟）

### 2. 初始化数据库表

1. 进入项目后，点击左侧 "SQL Editor"
2. 点击 "New Query"
3. 复制 `supabase/init.sql` 文件的全部内容并粘贴
4. 点击 "Run" 执行 SQL

### 3. 获取 API 密钥

1. 点击左侧 "Settings" -> "API"
2. 复制以下两个值：
   - **Project URL** (SUPABASE_URL)
   - **service_role** 密钥 (SUPABASE_SERVICE_KEY) - 点击 "Reveal" 显示

## 步骤二：部署到 Vercel

### 方式 A：通过 Vercel Dashboard（推荐）

1. 将代码推送到 GitHub/GitLab/Bitbucket

2. 登录 [Vercel Dashboard](https://vercel.com/dashboard)

3. 点击 "Add New..." -> "Project"

4. 导入你的 Git 仓库

5. 配置环境变量：
   点击 "Environment Variables"，添加：

   | 名称 | 值 |
   |------|-----|
   | `SUPABASE_URL` | 你的 Supabase Project URL |
   | `SUPABASE_SERVICE_KEY` | 你的 Supabase service_role 密钥 |

6. 点击 "Deploy" 开始部署

7. 等待部署完成，点击生成的 URL 访问网站

### 方式 B：通过 CLI

```bash
# 登录 Vercel
vercel login

# 部署项目
vercel

# 添加环境变量
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_KEY

# 生产环境部署
vercel --prod
```

## 步骤三：配置自定义域名（可选）

1. 在 Vercel 项目页面点击 "Settings" -> "Domains"
2. 添加你的自定义域名
3. 按提示配置 DNS 记录

## 项目结构说明

```
pas-test/
├── api/                    # Vercel Serverless Functions
│   ├── auth/[...auth].js   # 认证 API
│   ├── training/[...training].js  # 训练记录 API
│   └── words/[...words].js # 词语管理 API
├── src/                    # Vue 前端源码
├── supabase/
│   └── init.sql            # 数据库初始化脚本
├── vercel.json             # Vercel 配置
└── .env.production         # 生产环境变量
```

## 环境变量

| 变量名 | 说明 | 在哪里获取 |
|--------|------|-----------|
| `SUPABASE_URL` | Supabase 项目 URL | Supabase Dashboard -> Settings -> API |
| `SUPABASE_SERVICE_KEY` | Supabase 服务密钥 | Supabase Dashboard -> Settings -> API (service_role) |

## 常见问题

### 1. 部署后 API 返回 500 错误

检查环境变量是否正确设置：
- 确保 `SUPABASE_URL` 和 `SUPABASE_SERVICE_KEY` 都已配置
- 确保 service_role 密钥正确（不是 anon 密钥）

### 2. 数据库连接失败

- 确认已在 Supabase SQL Editor 中执行了 `init.sql`
- 检查 Supabase 项目是否处于活跃状态

### 3. 页面刷新后 404

确保 `vercel.json` 中的 rewrites 配置正确，SPA 路由需要返回 `index.html`。

### 4. 如何查看日志

在 Vercel Dashboard 中：
1. 进入项目页面
2. 点击 "Deployments"
3. 选择一个部署
4. 点击 "Functions" 查看服务端日志

## 本地开发

```bash
# 安装依赖
npm install

# 创建 .env.local 文件
echo "VITE_API_BASE=http://localhost:3001/api" > .env.local

# 启动前端
npm run dev

# 在另一个终端启动后端（需要本地 SQLite）
cd server && npm start
```

注意：本地开发仍使用 SQLite，Vercel 部署使用 Supabase。

## 费用说明

- **Supabase 免费套餐**：500MB 数据库，1GB 文件存储，足够小型应用
- **Vercel 免费套餐**：100GB 带宽/月，无限部署次数

对于个人项目或小型应用，完全免费！
