# AI 新词站白话课

从发现新词到制作 AI 工具站的交互课程，包含 8 步教程、8 关站长模拟器、成绩单和阅读路线，共 20 个页面。

- 在线访问：https://xianyu110.github.io/ai-new-keyword-course/
- 原始页面：https://claude.ai/artifact/JMBQdS3Y2jCcU652MYtAqP

## 本地预览

无需安装依赖或构建，在项目目录运行：

```bash
python3 -m http.server 8765
```

访问 http://localhost:8765 。

## GitHub Pages

仓库 Settings → Pages → Deploy from a branch，选择 `main` 分支和 `/ (root)` 目录。`.nojekyll` 保证文件按原样发布。

## 文件结构

- `index.html`：总览与路线动画。
- `s1-find.html` 至 `s8-launch.html`：8 步教程。
- `sim-0.html` 至 `sim-8.html`、`sim-end.html`：模拟器及成绩单。
- `reading.html`：阅读路线。
- `assets/site.css`：原版共用样式。
- `assets/kit.js`：导航、术语解释、答题、阅读进度与模拟器共用逻辑。

## 迁移说明

保留公开页面的内容、样式、SVG 动画和交互，移除 Claude 嵌入容器注入的运行时代码，补充中文语言标记。未添加统计、后端服务或用户数据上传。

答题、阅读和模拟器进度只存于当前浏览器的 localStorage，清理浏览器数据会丢失进度。原页面使用 Google Fonts，字体不可用时回退到系统字体。原文链接保留，其中 web.cafe 内容可能需要社群登录。

内容整理来源及标记保留在页面内；Lumibo 2、FramePop 及模拟数据均为教学示意。本仓库仅迁移原公开作品，不对原作者内容另行授予许可。
