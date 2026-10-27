# AI 新词站白话课

**[立即打开在线课程 →](https://xianyu110.github.io/ai-new-keyword-course/)**

给新手的 AI 工具站与 SEO 交互入门课。从发现一个新词，到收词、规划页面、搭建网站、定价收款，再到上线优化，用 8 步教程和 8 关站长模拟器把整条路线走一遍。

共 20 个页面，保留原版动画、动手练习、即时答题反馈和本地学习进度。无需登录，打开网页即可学习。

- **在线网站**：[xianyu110.github.io/ai-new-keyword-course](https://xianyu110.github.io/ai-new-keyword-course/)
- **动手练习**：[进入站长模拟器](https://xianyu110.github.io/ai-new-keyword-course/sim-0.html)
- **阅读资料**：[查看新手阅读路线](https://xianyu110.github.io/ai-new-keyword-course/reading.html)
- **原始作品**：[Claude Artifact](https://claude.ai/artifact/JMBQdS3Y2jCcU652MYtAqP)

## 课程内容

| 步骤 | 学习内容 |
| --- | --- |
| 1 | 找新词：发现机会、判断需求与收费潜力 |
| 2 | 收词、扩词：整理关键词、去重与分组 |
| 3 | 一页放几个词：判断合并还是拆页 |
| 4 | 定结构、定页面：规划网站层级与网址 |
| 5 | 做页面：安排内容、标题与关键词 |
| 6 | 内链、外链：连接页面与引入访问入口 |
| 7 | 做工具、收订阅：估算成本、定价与收款 |
| 8 | 上线验收和优化：观察数据、补充页面与持续迭代 |

每一关模拟器对应一步教程，完成后可查看成绩单，回顾需要补学的知识点。

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
