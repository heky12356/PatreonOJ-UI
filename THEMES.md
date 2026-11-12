# 站点主题与首页幻灯片

管理员登录后进入“后台 → 设置”。“站点主题”用于切换全站外观；“首页幻灯片”独立保存，可开关、上传图片、设置链接、调整顺序和轮播间隔。两个区域分别保存，切换主题不会覆盖图片配置。

主题和幻灯片设置保存在后端数据库中，所有访问者在刷新页面或重新切回窗口后获取最新设置。关闭幻灯片只停止展示，不删除已保存的图片和链接。

## 本地主题目录

默认主题位于 `src/themes/default.js`。部署专用主题放在 `src/themes/private/<theme-id>/`，整个 `private` 目录已被 Git 忽略。主题入口为 `index.js`，返回一个描述对象：

```js
import Home from './Home.jsx';
import './theme.css';

export default {
  id: 'local-lab',
  name: '实验室主题',
  description: '用于本地部署的实验室外观。',
  swatch: '#315577',
  brand: { name: '实验室', subtitle: '程序设计学习平台' },
  variables: { primary: '#315577', 'page-bg': '#f8f9fb' },
  antdToken: { colorPrimary: '#315577' },
  Home,
};
```

`Home` 可省略；提供时接收 `totalProblems`、`problems`、`latestProblems`、`homeText`、`announcement`。幻灯片由公共页面层渲染，不放在主题组件内。

CSS 必须限制在 `html[data-site-theme="local-lab"]` 下，避免影响其他主题。公共组件支持 `--site-primary`、`--site-primary-dark`、`--site-primary-soft`、`--site-primary-subtle`、`--site-primary-glow`、`--site-page-bg` 等 CSS 变量；没有定义的变量沿用原来的默认值。

构建时自动发现本地主题。目录不存在时仍可正常构建和使用默认主题；如果数据库选择的主题未安装，前台回退到默认主题，后台显示提示。新增或修改主题程序需要重新构建；已安装主题之间的切换、幻灯片内容修改不需要构建。

## 部署与备份

从 GitHub 克隆时不会包含私有主题。请在执行 Docker Compose 构建前，将私下保存的 `private` 目录复制到服务器的 `PatreonOJ-UI/src/themes/private/`，再按部署指南构建 `web` 服务。后端目录为 `PatreonOJ`，前端目录以 GitHub 克隆结果 `PatreonOJ-UI` 为准。

私有主题代码、学校或社团图片单独保存在部署者的受限目录中，升级时复制到新的发布目录。备份需包含私有主题、MySQL 和对象存储；仅备份 Git 仓库不能恢复私有主题。

上传支持 JPG、PNG、GIF，最大 8 MB；图片可以公开读取，但上传和修改配置只允许管理员。图片使用独立对象命名空间，不开放测试数据目录。链接允许站内绝对路径（如 `/problem`）或 HTTP(S) 网址，不允许脚本和协议相对地址。

## 接口

| 方法 | 路径 | 权限 |
| --- | --- | --- |
| GET | `/api/site/settings` | 公开读取站点外观和幻灯片配置 |
| PUT | `/api/site/settings` | 管理员；只传 `theme_id` 或 `carousel` 即可独立更新 |
| POST | `/api/site/images` | 管理员；multipart 字段 `file` |
| GET | `/api/site/images/:name` | 公开读取已上传的幻灯片图片 |

`carousel` 的结构为 `{ enabled, interval_ms, slides }`；间隔支持 3000 到 30000 毫秒，最多 10 张。每张包含 `id`、`title`、`image_url`、`link_url`，数组顺序即展示顺序。数据库主键、隐藏测试、用户信息不会出现在这份公开配置中。
