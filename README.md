[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

# 刘鑫宇个人简历网站

个人简历网站，展示全栈开发技能、开源项目与实习经历。

**在线预览**：https://meteorkid.github.io/liuxinyu-resume/

## 功能

- **完整简历展示**：教育背景、实习经历、开源项目、获奖记录、技能清单
- **交互式设计**：3D 卡片倾斜、鼠标光晕、时间线进度等动态视觉效果
- **PDF 下载**：一键生成 A4 排版 PDF 简历
- **单文件自包含**：头像以 Base64 嵌入 HTML，传输只需一个文件
- **响应式布局**：桌面端与移动端自适应

## 技术栈

| 层 | 技术 |
|---|---|
| 页面 | HTML5 + CSS3 + 原生 JavaScript（零框架依赖） |
| PDF 生成 | Puppeteer 服务端渲染 |
| 图片嵌入 | Base64 编码，单文件自包含 |

## 快速使用

```bash
# 克隆仓库
git clone https://github.com/Meteorkid/liuxinyu-resume.git
cd liuxinyu-resume

# 安装依赖
npm install

# 生成 PDF 简历
npm run pdf
```

直接打开 `index.html` 即可浏览完整简历网站。

## PDF 生成方案

经过 6 次迭代，最终采用「数据提取 + 独立模板」方案：

1. 从原页面提取数据（时间线、项目、获奖、技能）
2. 生成干净的 PDF 专用 HTML
3. 用 Puppeteer `page.setContent()` 渲染并导出 PDF

优势：不依赖原网页复杂 CSS 布局，排版稳定可靠。

## 项目结构

```
liuxinyu-resume/
├── index.html                      # 主页面（自包含，含 base64 图片）
├── generate-pdf.mjs                # PDF 生成脚本
├── 大头照.jpg                       # 头像原图
├── 设计思路与创意亮点.md            # 设计文档
└── 刘鑫宇_全栈开发工程师_简历.pdf   # 生成的 PDF
```

## 更新日志

### 2026-05-06

- **HTML 单文件自包含**：头像图片以 base64 嵌入 HTML，传输只需一个文件
- **PDF 排版优化**：采用「数据提取 + 独立模板」方案，解决组件拆分、头像重叠问题

### 2026-05-04

- **PDF 下载功能**：使用 Puppeteer 服务端生成 A4 排版 PDF
- **新增 CodexBar 项目卡片**：GitHub 开源项目展示增至 7 个
- **全站动态视觉升级**：3D 卡片倾斜、鼠标光晕、时间线进度等交互效果

### 2026-05-03

- **初始版本**：个人简历网站上线

## License

[MIT](LICENSE)
