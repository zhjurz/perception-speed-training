# 知觉反应与速度训练测试系统 - 部署指南

## 项目结构

```
pas-test/
├── src/                 # 前端源码
├── server/              # 后端源码
├── dist/                # 前端构建输出
├── package.json         # 前端依赖
└── vite.config.js       # Vite 配置
```

## 方案一：传统服务器部署

### 1. 环境要求

- Node.js 18+
- npm 或 pnpm
- PM2 (进程管理)

### 2. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server && npm install && cd ..
```

### 3. 构建前端

```bash
npm run build
```

构建后的文件在 `dist/` 目录。

### 4. 配置后端

修改 `server/index.js`，添加静态文件服务：

```javascript
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync, existsSync } from 'fs'
import { randomUUID } from 'crypto'
import db from './database.js'
import authRoutes from './routes/auth.js'
import wordsRoutes from './routes/words.js'
import trainingRoutes from './routes/training.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dataDir = join(__dirname, 'data')
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// API 路由
app.use('/api/auth', authRoutes)
app.use('/api/words', wordsRoutes)
app.use('/api/training', trainingRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 生产环境：服务前端静态文件
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '../dist')
  app.use(express.static(distPath))
  
  // 所有非 API 路由返回 index.html (SPA 支持)
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
}

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: '服务器内部错误' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

process.on('SIGINT', () => {
  db.close()
  process.exit(0)
})
```

### 5. 创建 PM2 配置文件

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'pas-training',
    cwd: './server',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
```

### 6. 启动服务

```bash
# 开发环境
pm2 start ecosystem.config.cjs

# 生产环境
pm2 start ecosystem.config.cjs --env production

# 查看状态
pm2 status

# 查看日志
pm2 logs pas-training

# 设置开机自启
pm2 startup
pm2 save
```

### 7. Nginx 反向代理（可选）

```nginx
# /etc/nginx/sites-available/pas-training
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/pas-training /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 方案二：Docker 部署

### 1. 创建 Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# 复制前端依赖并构建
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 复制后端依赖并安装
WORKDIR /app/server
RUN npm ci

# 返回根目录
WORKDIR /app

# 环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["node", "server/index.js"]
```

### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    volumes:
      - ./server/data:/app/server/data
    environment:
      - NODE_ENV=production
      - PORT=3001
    restart: unless-stopped
```

### 3. 构建并运行

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 方案三：分离部署

### 前端部署到静态托管

适合部署到：Vercel、Netlify、Cloudflare Pages

```bash
# 构建
npm run build

# dist/ 目录上传到静态托管平台
```

**注意**：需要修改前端 API 地址为实际后端地址。

修改 `src/stores/training.js` 和 `src/components/UserLogin.vue` 中的 `API_BASE`：

```javascript
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'
```

创建 `.env.production`：

```
VITE_API_BASE=https://your-api-server.com/api
```

### 后端部署到云服务器

按方案一的步骤部署后端即可。

---

## 环境变量配置

创建 `.env` 文件（生产环境）：

```env
NODE_ENV=production
PORT=3001
```

---

## 常用命令

```bash
# 前端开发
npm run dev

# 前端构建
npm run build

# 前端预览构建结果
npm run preview

# 后端启动
cd server && npm start

# PM2 管理
pm2 start ecosystem.config.cjs --env production
pm2 stop pas-training
pm2 restart pas-training
pm2 logs pas-training
```

---

## 数据备份

SQLite 数据库文件位于 `server/data/training.db`，定期备份即可：

```bash
# 备份
cp server/data/training.db server/data/training.db.backup

# 或使用定时任务
crontab -e
# 添加：每天凌晨 3 点备份
0 3 * * * cp /path/to/pas-test/server/data/training.db /path/to/backup/training_$(date +\%Y\%m\%d).db
```
