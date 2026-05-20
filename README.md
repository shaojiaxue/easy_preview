# Easy Preview

一个简洁高效的多格式实时预览工具，支持 **Markdown**、**HTML**、**JSON**、**SQL** 四种格式的编辑与预览。

![GitHub Pages](https://github.com/shaojiaxue/easy_preview/actions/workflows/deploy.yml/badge.svg)

## 功能特性

- **Markdown 预览** — 实时渲染 Markdown 为 HTML，支持标题、列表、代码块、表格、引用等完整语法
- **HTML 预览** — 通过沙箱 iframe 安全渲染，支持内联样式和交互
- **JSON 预览** — 自动格式化并语法高亮（键名蓝色、字符串绿色、数字红色、布尔值黄色）
- **SQL 预览** — 关键字紫色高亮、函数蓝色、字符串绿色、注释灰色
- **左右分栏布局** — 中间可拖拽调整宽度
- **快捷键支持** — `Ctrl + Enter` 快速预览
- **白色主题** — 清新明亮的界面设计

## 在线预览

部署后访问：`https://shaojiaxue.github.io/easy_preview`

## 技术栈

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- marked（Markdown 解析）
- lucide-react（图标）

## 本地构建

### 环境要求

- [Node.js](https://nodejs.org/) 18+

### 构建步骤

```bash
# 1. 克隆仓库
git clone https://github.com/shaojiaxue/easy_preview.git
cd easy_preview

# 2. 安装依赖
npm install

# 3. 启动开发服务器（支持热更新）
npm run dev
```

开发服务器启动后，浏览器访问 `http://localhost:5173` 即可使用。

### 生产构建

```bash
# 构建生产版本
npm run build
```

构建产物输出到 `dist/` 目录：

```
dist/
├── index.html          # 入口文件
└── assets/
    ├── index-xxx.css   # 样式文件
    └── index-xxx.js    # 脚本文件
```

直接用浏览器打开 `dist/index.html` 即可查看：

```bash
# Mac
open dist/index.html

# Linux
xdg-open dist/index.html

# Windows
start dist/index.html
```

## 部署

### GitHub Pages 自动部署

本项目已配置 GitHub Actions 自动部署工作流（`.github/workflows/deploy.yml`）。

每次推送代码到 `main` 分支时，会自动构建并部署到 GitHub Pages。

手动触发方式：
1. 进入仓库 **Actions** 标签页
2. 选择 **Deploy to GitHub Pages**
3. 点击 **Run workflow**

### 其他部署方式

`dist/` 文件夹中的文件是纯静态资源，可以部署到任何静态托管服务：

- [Nginx](https://nginx.org/)
- [Caddy](https://caddyserver.com/)
- [Cloudflare Pages](https://pages.cloudflare.com/)
- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)

## 许可证

MIT
