#!/usr/bin/env node

/**
 * 使用 Puppeteer 将 HTML 简历转换为 PDF
 * 完美保留所有 CSS 样式、颜色、布局
 */

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HTML_FILE = resolve(__dirname, 'index.html');
const PDF_FILE = resolve(__dirname, '刘鑫宇_全栈开发工程师_简历.pdf');

async function generatePDF() {
  console.log('🚀 正在启动浏览器...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 加载 HTML 文件
    console.log('📄 正在加载简历页面...');
    await page.goto(`file://${HTML_FILE}`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // 模拟打印媒体类型
    await page.emulateMediaType('print');

    // 等待字体加载
    await page.evaluateHandle('document.fonts.ready');

    // 等待一段时间让动画完成
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 注入打印专用 CSS，防止组件被页面拆分
    await page.addStyleTag({
      content: `
        /* 单个卡片/条目禁止内部断页 */
        .project-card,
        .github-card,
        .tl-item,
        .award-item,
        .terminal-window {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        /* 标题与紧跟的内容不分离 */
        .section-label,
        .about-headline,
        .experience-headline,
        .projects-headline,
        .github-headline,
        .awards-headline,
        .skills-headline,
        h2,
        h3 {
          break-after: avoid !important;
          page-break-after: avoid !important;
        }

        /* 覆盖可能导致断页问题的 min-height */
        .hero,
        .terminal-window,
        .terminal-body,
        .project-card {
          min-height: auto !important;
        }

        /* Grid 改为纵向排列，避免同行卡片一起跨页 */
        .project-grid {
          display: block !important;
        }

        .project-grid .project-card {
          margin-bottom: 0.5rem !important;
        }

        .github-grid {
          display: block !important;
        }

        .github-grid .github-card {
          margin-bottom: 0.3rem !important;
        }

        /* 获奖统计行保持整体 */
        .award-stats {
          break-inside: avoid !important;
        }

        /* 全局紧凑间距 */
        section {
          padding-top: 0.3rem !important;
          padding-bottom: 0.3rem !important;
        }

        .hero {
          padding: 0.3rem !important;
          min-height: auto !important;
        }

        .about-inner,
        .experience-inner,
        .projects-inner,
        .github-inner,
        .awards-inner,
        .skills-inner,
        .contact-inner {
          padding-top: 0.2rem !important;
          padding-bottom: 0.2rem !important;
        }

        /* 缩小卡片间距 */
        .project-grid,
        .github-grid {
          gap: 0.5rem !important;
        }

        .tl-item {
          padding-bottom: 0.3rem !important;
          margin-bottom: 0.3rem !important;
        }

        .award-item {
          margin-bottom: 0.4rem !important;
        }

        .skill-grid {
          gap: 0.3rem !important;
        }

        .skill-tag {
          padding: 0.12rem 0.4rem !important;
          font-size: 0.7rem !important;
        }

        /* 缩小标题字号 */
        .section-label {
          font-size: 0.6rem !important;
          margin-bottom: 0.15rem !important;
        }

        h2 {
          font-size: 1.2rem !important;
          margin-bottom: 0.5rem !important;
        }

        /* 技能标签 */
        .skill-category-title {
          font-size: 0.75rem !important;
          margin-bottom: 0.3rem !important;
        }

        .skill-tags {
          gap: 0.2rem !important;
        }

        /* 减少头像区域 */
        .about-avatar {
          width: 70px !important;
          height: 70px !important;
        }

        .avatar-glow {
          display: none !important;
        }

        /* 终端窗口紧凑 */
        .terminal-window {
          font-size: 0.68rem !important;
          max-width: 100% !important;
          border-radius: 8px !important;
          min-height: auto !important;
        }

        .terminal-body {
          padding: 0.3rem 0.5rem !important;
          line-height: 1.4 !important;
          min-height: auto !important;
        }

        .terminal-header {
          padding: 0.25rem 0.5rem !important;
        }

        .terminal-line {
          margin-bottom: 0.1rem !important;
        }

        /* 项目卡片紧凑 */
        .project-card {
          padding: 0.5rem !important;
          border-radius: 8px !important;
          min-height: auto !important;
        }

        .project-card-title {
          font-size: 0.8rem !important;
          margin-bottom: 0.2rem !important;
        }

        .project-card-desc {
          font-size: 0.65rem !important;
          line-height: 1.3 !important;
        }

        .project-card-tag {
          font-size: 0.6rem !important;
          padding: 0.1rem 0.4rem !important;
        }

        .project-card-emoji {
          font-size: 1.2rem !important;
        }

        .project-card-bg-text {
          font-size: 3rem !important;
        }

        /* GitHub 卡片紧凑 */
        .github-card {
          padding: 0.4rem !important;
          border-radius: 6px !important;
        }

        .github-card-name {
          font-size: 0.75rem !important;
          margin-bottom: 0.15rem !important;
        }

        .github-card-desc {
          font-size: 0.6rem !important;
          line-height: 1.3 !important;
          margin-bottom: 0.3rem !important;
        }

        .github-card-lang {
          font-size: 0.55rem !important;
        }

        .github-card-stars,
        .github-card-forks {
          font-size: 0.55rem !important;
        }

        /* 关于区域紧凑 */
        .about-bio {
          font-size: 0.75rem !important;
          line-height: 1.4 !important;
        }

        .about-highlight-item {
          font-size: 0.7rem !important;
          padding: 0.3rem 0.5rem !important;
        }

        .about-highlights {
          gap: 0.3rem !important;
        }

        /* 获奖区域 */
        .award-stat-number {
          font-size: 1.3rem !important;
        }

        .award-stat-label {
          font-size: 0.6rem !important;
        }

        .award-category-title {
          font-size: 0.8rem !important;
          margin-bottom: 0.3rem !important;
        }

        .award-text {
          font-size: 0.7rem !important;
        }

        .award-item {
          padding: 0.3rem 0 !important;
        }

        /* 时间线 */
        .tl-content h3 {
          font-size: 0.8rem !important;
          margin-bottom: 0.15rem !important;
        }

        .tl-content p {
          font-size: 0.7rem !important;
        }

        .tl-content .tl-company {
          font-size: 0.7rem !important;
        }

        .tl-dot {
          width: 8px !important;
          height: 8px !important;
        }

        /* 联系区域 */
        .contact-info {
          font-size: 0.75rem !important;
        }

        .contact-link {
          font-size: 0.75rem !important;
        }
      `
    });

    // 预处理：强制显示所有动画元素，隐藏交互元素
    console.log('🎨 正在优化页面样式...');
    await page.evaluate(() => {
      // 强制显示所有动画元素
      document.querySelectorAll('.fade-up, .tl-item, .github-card, .award-item, .skill-card, .skill-tag').forEach(el => {
        el.classList.add('is-visible');
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.transition = 'none';
      });

      // 隐藏交互元素和装饰元素
      document.querySelectorAll('.scroll-progress, .cursor-glow, .back-to-top, .terminal-skip, .hero-scroll, .hero-download, .navbar, .nav-overlay, .section-wave, .avatar-glow').forEach(el => {
        el.style.display = 'none';
      });

      // 调整 hero 区域
      const hero = document.querySelector('.hero');
      if (hero) {
        hero.style.minHeight = 'auto';
        hero.style.padding = '0.8rem';
      }

      // 终端窗口去掉阴影
      const terminal = document.querySelector('.terminal-window');
      if (terminal) {
        terminal.style.boxShadow = 'none';
      }

      // 确保所有终端行可见
      document.querySelectorAll('.terminal-line').forEach(el => {
        el.style.opacity = '1';
      });

      // 压缩所有 section 的间距
      document.querySelectorAll('section').forEach(el => {
        el.style.paddingTop = '0.6rem';
        el.style.paddingBottom = '0.6rem';
      });

      // 压缩各区域内部容器间距
      document.querySelectorAll('.about-inner, .experience-inner, .projects-inner, .github-inner, .awards-inner, .skills-inner, .contact-inner').forEach(el => {
        el.style.paddingTop = '0.4rem';
        el.style.paddingBottom = '0.4rem';
      });

      // 压缩卡片间距
      document.querySelectorAll('.project-grid, .github-grid').forEach(el => {
        el.style.gap = '0.5rem';
      });

      // 压缩时间线间距
      document.querySelectorAll('.tl-item').forEach(el => {
        el.style.paddingBottom = '0.3rem';
        el.style.marginBottom = '0.3rem';
      });

      // 获奖数字确保显示
      document.querySelectorAll('.award-stat-number').forEach(el => {
        const target = el.dataset.target;
        el.textContent = target;
      });

      // 将 Grid 布局改为 Block 布局（直接修改 DOM）
      document.querySelectorAll('.project-grid, .github-grid').forEach(el => {
        el.style.display = 'block';
      });

      // 给卡片添加下边距
      document.querySelectorAll('.project-card').forEach(el => {
        el.style.marginBottom = '0.5rem';
      });
      document.querySelectorAll('.github-card').forEach(el => {
        el.style.marginBottom = '0.3rem';
      });

      // 确保所有容器允许分页
      document.querySelectorAll('.project-grid, .github-grid, .timeline, .award-list, .skill-grid').forEach(el => {
        el.style.overflow = 'visible';
      });

      // 确保卡片没有 transform 等影响分页的属性
      document.querySelectorAll('.project-card, .github-card, .tl-item, .award-item').forEach(el => {
        el.style.transform = 'none';
        el.style.position = 'static';
        el.style.willChange = 'auto';
      });
    });

    // 生成 PDF
    console.log('📝 正在生成 PDF...');
    await page.pdf({
      path: PDF_FILE,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '4mm',
        right: '6mm',
        bottom: '4mm',
        left: '6mm'
      },
      preferCSSPageSize: false,
      displayHeaderFooter: false
    });

    console.log(`✅ PDF 已生成: ${PDF_FILE}`);

  } catch (error) {
    console.error('❌ 生成失败:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

generatePDF();
