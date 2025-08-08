# PatreonOJ-UI

一个现代化的算法学习和练习平台，提供题目练习、排行榜、学习资源等功能。

## 项目介绍

PatreonOJ-UI 是一个基于 React 19.1.0 构建的前端项目，用于 PatreonOJ 平台的用户界面。该项目采用 Vite 7.0.0 作为构建工具，使用 Ant Design 5.26.2 和 Bootstrap 5.3.7 作为 UI 组件库。

## 🚀 项目特性

- **现代化UI设计**: 基于 Ant Design 和 Bootstrap 的混合设计系统
- **响应式布局**: 支持桌面端和移动端的完美适配
- **路由导航**: 使用 React Router 实现单页面应用导航
- **题目管理**: 支持题目浏览、搜索和详情查看
- **用户系统**: 包含登录、注册和个人中心功能
- **排行榜系统**: 实时展示用户排名和成绩
- **代码编辑器**: 集成 Monaco Editor 支持多语言代码编写

## 🛠️ 技术栈

- **前端框架**: React 19.1.0
- **构建工具**: Vite 7.0.0
- **UI组件库**: 
  - Ant Design 5.26.2
  - Bootstrap 5.3.7
- **路由管理**: React Router DOM 7.6.3
- **图标库**: Ant Design Icons 6.0.0
- **代码编辑器**: Monaco Editor React 4.7.0
- **图表库**: Chart.js 4.5.0 + React Chart.js 2
- **样式处理**: Emotion React/Styled

## 📦 安装和运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
# 克隆项目
git clone https://gitee.com/tju2025-grand-innovation/patreon-oj-ui.git
cd patreon-oj-ui

# 安装依赖
npm install
```

### 开发环境运行
```bash
# 启动开发服务器
npm run dev

# 项目将在 http://localhost:5173 运行
```

### 生产环境构建
```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 📁 项目结构

```
src/
├── components/          # 组件目录
│   ├── HeaderNav/      # 顶部导航栏
│   ├── SideMenu/       # 侧边菜单
│   ├── ContentComponent/ # 内容组件
│   └── RightSider/     # 右侧边栏
├── pages/              # 页面组件
│   ├── Login.jsx       # 登录页面
│   └── Register.jsx    # 注册页面
├── data/               # 数据文件
├── assets/             # 静态资源
├── App.jsx             # 应用主组件
├── MainLayout.jsx      # 主布局组件
└── main.jsx           # 应用入口
```

## 🎯 主要功能

### 1. 导航系统
- 顶部导航栏：包含主要功能入口、搜索框和用户认证
- 侧边菜单：提供详细的功能分类导航
- 面包屑导航：显示当前页面位置

### 2. 题目系统
- 题目列表：支持分页和筛选
- 题目详情：包含题目描述、示例和提交功能
- 代码编辑器：支持多种编程语言的语法高亮

### 3. 用户系统
- 用户注册和登录
- 个人中心：查看个人信息和提交记录
- 排行榜：展示用户排名和积分

### 4. 学习资源
- 算法教程和学习资料
- 题目分类和标签系统
- 学习进度跟踪

## 🎨 设计系统

项目采用绿色主题色彩方案：
- 主色调：`#51624f` (深绿色)
- 背景色：`#c6d1bd` (浅绿色)
- 文字色：`#253B22` (深绿色)

## 🔧 开发指南

### 代码规范
- 使用 ESLint 进行代码检查
- 遵循 React Hooks 最佳实践
- 组件采用函数式组件 + Hooks 模式

### 样式规范
- 优先使用 Ant Design 组件
- 自定义样式使用 CSS Modules 或 styled-components
- 响应式设计遵循移动端优先原则

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 📄 许可证

本项目采用 MIT 许可证。

## 另： 保留
#### 特技
好看万岁

#### 鸣谢
感谢 J.Lu 和 琳琳2233，为本项目做出特别大的贡献