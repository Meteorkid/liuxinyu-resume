#!/usr/bin/env node

/**
 * 使用 Puppeteer 将 HTML 简历转换为 PDF
 * 核心策略：注入完整的「打印重构 CSS」，将所有复杂布局重置为线性流式
 */

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

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

    console.log('📄 正在加载简历页面...');
    await page.goto(`file://${HTML_FILE}`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    await page.emulateMediaType('print');
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ============================================================
    // 注入完整的打印重构 CSS
    // 核心思路：重置所有布局为 block 流式，消除绝对定位/flex/grid 干扰
    // ============================================================
    console.log('🎨 正在注入打印重构样式...');
    await page.addStyleTag({
      content: `
        /* ========== 全局重置 ========== */
        *, *::before, *::after {
          animation: none !important;
          transition: none !important;
          transform: none !important;
          will-change: auto !important;
          filter: none !important;
          backdrop-filter: none !important;
        }

        body {
          background: #fff !important;
          color: #1a1a1a !important;
          font-size: 9pt !important;
          line-height: 1.5 !important;
        }

        /* ========== 隐藏不需要的元素 ========== */
        .scroll-progress, .cursor-glow, .back-to-top, .terminal-skip,
        .hero-scroll, .hero-download, .navbar, .nav-overlay, .section-wave,
        .avatar-glow, .avatar-border, .avatar-status, .avatar-border-inner,
        .project-card-bg-text, .pdf-loading {
          display: none !important;
        }

        /* ========== 所有 section 重置为 block ========== */
        section, div, ul, ol, dl, form, figure, main {
          display: block !important;
        }

        /* ========== Hero 终端区域 ========== */
        .hero {
          background: #0d1117 !important;
          padding: 8mm 0 !important;
          min-height: auto !important;
        }

        .terminal-window {
          max-width: 100% !important;
          background: #161b22 !important;
          border-radius: 6px !important;
          box-shadow: none !important;
          font-size: 8pt !important;
          min-height: auto !important;
        }

        .terminal-header {
          padding: 4px 10px !important;
          background: #21262d !important;
          border-radius: 6px 6px 0 0 !important;
        }

        .terminal-dot {
          width: 8px !important;
          height: 8px !important;
          display: inline-block !important;
          border-radius: 50% !important;
          margin-right: 4px !important;
        }

        .terminal-body {
          padding: 8px 12px !important;
          min-height: auto !important;
        }

        .terminal-line {
          opacity: 1 !important;
          margin-bottom: 2px !important;
          font-size: 8pt !important;
          line-height: 1.5 !important;
          white-space: pre-wrap !important;
          word-break: break-all !important;
        }

        /* ========== About 区域 ========== */
        .about {
          padding: 6mm 0 !important;
          background: #fefcf6 !important;
        }

        .about-grid {
          display: flex !important;
          flex-direction: row !important;
          align-items: flex-start !important;
          gap: 12px !important;
        }

        .about-avatar {
          flex: 0 0 80px !important;
          display: block !important;
          text-align: center !important;
        }

        .avatar-wrapper {
          position: static !important;
          width: 70px !important;
          height: 70px !important;
        }

        .avatar-frame {
          position: static !important;
          width: 70px !important;
          height: 70px !important;
          border-radius: 50% !important;
          overflow: hidden !important;
        }

        .avatar-frame img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          display: block !important;
        }

        .avatar-name {
          font-size: 9pt !important;
          font-weight: bold !important;
          margin-top: 4px !important;
        }

        .avatar-school {
          font-size: 7pt !important;
          color: #666 !important;
          margin-top: 2px !important;
        }

        .about-info {
          flex: 1 !important;
          display: block !important;
        }

        .about-bio {
          font-size: 8.5pt !important;
          line-height: 1.6 !important;
          margin-bottom: 6px !important;
        }

        .about-highlights {
          display: block !important;
        }

        .highlight-item {
          font-size: 8pt !important;
          padding: 2px 0 !important;
          line-height: 1.4 !important;
        }

        .highlight-item::before {
          content: "• " !important;
          color: #F4D758 !important;
          font-weight: bold !important;
        }

        /* ========== 通用 section 标题 ========== */
        .section-label {
          font-size: 7pt !important;
          color: #888 !important;
          text-transform: uppercase !important;
          letter-spacing: 2px !important;
          margin-bottom: 2px !important;
        }

        h2 {
          font-size: 14pt !important;
          margin-bottom: 6px !important;
          color: #1a1a1a !important;
        }

        h2 em {
          color: #2B7FD8 !important;
          font-style: normal !important;
        }

        /* ========== Experience 时间线 ========== */
        .experience {
          padding: 6mm 0 !important;
        }

        .timeline {
          display: block !important;
          position: static !important;
          padding-left: 16px !important;
          border-left: 2px solid #e0e0e0 !important;
        }

        .timeline-line-progress {
          display: none !important;
        }

        .tl-item {
          position: static !important;
          padding: 0 0 8px 12px !important;
          margin-bottom: 4px !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        .tl-dot {
          position: absolute !important;
          left: -21px !important;
          top: 4px !important;
          width: 8px !important;
          height: 8px !important;
          background: #2B7FD8 !important;
          border-radius: 50% !important;
          display: block !important;
        }

        .tl-card {
          display: block !important;
          padding: 0 !important;
          background: none !important;
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
        }

        .tl-year {
          font-size: 7.5pt !important;
          color: #2B7FD8 !important;
          font-weight: bold !important;
          margin-bottom: 2px !important;
        }

        .tl-content h3 {
          font-size: 9.5pt !important;
          margin-bottom: 1px !important;
          color: #1a1a1a !important;
        }

        .tl-company {
          font-size: 8pt !important;
          color: #666 !important;
          margin-bottom: 2px !important;
        }

        .tl-content p {
          font-size: 8pt !important;
          line-height: 1.5 !important;
          color: #333 !important;
        }

        /* ========== Projects 项目卡片 ========== */
        .projects {
          padding: 6mm 0 !important;
          background: #fefcf6 !important;
        }

        .project-grid {
          display: block !important;
        }

        .project-card {
          position: static !important;
          display: block !important;
          padding: 8px 10px !important;
          margin-bottom: 6px !important;
          border-radius: 6px !important;
          min-height: auto !important;
          overflow: visible !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          /* 保留背景色 */
        }

        .project-card--1 { background: linear-gradient(135deg, #F4D758 0%, #F7A946 100%) !important; }
        .project-card--2 { background: linear-gradient(135deg, #2B7FD8 0%, #1a5fa0 100%) !important; color: #fff !important; }
        .project-card--3 { background: linear-gradient(135deg, #6C5CE7 0%, #a55eea 100%) !important; color: #fff !important; }
        .project-card--4 { background: linear-gradient(135deg, #28c840 0%, #1a9c30 100%) !important; color: #fff !important; }

        .project-card-content {
          position: static !important;
          display: block !important;
        }

        .project-card-emoji {
          font-size: 14pt !important;
          display: inline !important;
          margin-right: 4px !important;
        }

        .project-card-title {
          font-size: 10pt !important;
          font-weight: bold !important;
          display: inline !important;
          margin-bottom: 0 !important;
        }

        .project-card-desc {
          font-size: 8pt !important;
          line-height: 1.4 !important;
          margin-top: 3px !important;
          color: inherit !important;
          opacity: 0.9 !important;
        }

        .project-card-tag {
          font-size: 7pt !important;
          padding: 1px 6px !important;
          background: rgba(255,255,255,0.2) !important;
          border-radius: 3px !important;
          display: inline-block !important;
          margin-top: 3px !important;
        }

        /* ========== GitHub 开源项目 ========== */
        .github {
          padding: 6mm 0 !important;
        }

        .github-grid {
          display: block !important;
        }

        .github-card {
          display: block !important;
          padding: 6px 8px !important;
          margin-bottom: 4px !important;
          border: 1px solid #e0e0e0 !important;
          border-radius: 4px !important;
          background: #fff !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        .github-card-name {
          font-size: 9pt !important;
          font-weight: bold !important;
          color: #2B7FD8 !important;
          margin-bottom: 2px !important;
        }

        .github-card-desc {
          font-size: 7.5pt !important;
          line-height: 1.4 !important;
          color: #555 !important;
          margin-bottom: 3px !important;
        }

        .github-card-meta {
          font-size: 7pt !important;
          color: #888 !important;
        }

        .github-card-lang, .github-card-stars, .github-card-forks {
          font-size: 7pt !important;
          color: #888 !important;
        }

        /* ========== Awards 获奖 ========== */
        .awards {
          padding: 6mm 0 !important;
          background: #fefcf6 !important;
        }

        .award-stats {
          display: flex !important;
          flex-direction: row !important;
          gap: 12px !important;
          margin-bottom: 8px !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        .award-stat {
          flex: 1 !important;
          text-align: center !important;
          padding: 4px !important;
        }

        .award-stat-number {
          font-size: 16pt !important;
          font-weight: bold !important;
          color: #F4D758 !important;
        }

        .award-stat-label {
          font-size: 7pt !important;
          color: #888 !important;
        }

        .award-category-title {
          font-size: 9pt !important;
          font-weight: bold !important;
          margin-bottom: 3px !important;
          margin-top: 6px !important;
          color: #1a1a1a !important;
        }

        .award-item {
          padding: 2px 0 !important;
          margin-bottom: 2px !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        .award-text {
          font-size: 8pt !important;
          line-height: 1.4 !important;
          color: #333 !important;
        }

        .award-year {
          font-size: 7pt !important;
          color: #888 !important;
        }

        /* ========== Skills 技能 ========== */
        .skills {
          padding: 6mm 0 !important;
        }

        .skill-grid {
          display: block !important;
        }

        .skill-category {
          margin-bottom: 6px !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        .skill-category-title {
          font-size: 9pt !important;
          font-weight: bold !important;
          margin-bottom: 3px !important;
          color: #1a1a1a !important;
        }

        .skill-tags {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 3px !important;
        }

        .skill-tag {
          font-size: 7.5pt !important;
          padding: 2px 6px !important;
          background: #f0f0f0 !important;
          border-radius: 3px !important;
          color: #333 !important;
          display: inline-block !important;
        }

        /* ========== Contact 联系 ========== */
        .contact {
          padding: 6mm 0 !important;
          background: #fefcf6 !important;
          text-align: center !important;
        }

        .contact-info {
          font-size: 8.5pt !important;
        }

        .contact-link {
          font-size: 8.5pt !important;
          color: #2B7FD8 !important;
          text-decoration: none !important;
        }

        /* ========== 分页控制 ========== */
        .tl-item, .project-card, .github-card, .award-item, .skill-category,
        .terminal-window, .about-grid, .award-stats {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        .section-label, h2, h3, .tl-year, .award-category-title, .skill-category-title {
          break-after: avoid !important;
          page-break-after: avoid !important;
        }

        /* ========== 链接样式 ========== */
        a {
          color: #2B7FD8 !important;
          text-decoration: none !important;
        }
      `
    });

    // DOM 预处理
    console.log('🔧 正在处理 DOM...');
    await page.evaluate(() => {
      // 显示所有动画元素
      document.querySelectorAll('.fade-up, .tl-item, .github-card, .award-item, .skill-card, .skill-tag').forEach(el => {
        el.classList.add('is-visible');
        el.style.opacity = '1';
      });

      // 隐藏装饰元素
      document.querySelectorAll('.scroll-progress, .cursor-glow, .back-to-top, .terminal-skip',
        '.hero-scroll, .hero-download, .navbar, .nav-overlay, .section-wave',
        '.avatar-glow, .avatar-border, .avatar-status, .avatar-border-inner',
        '.project-card-bg-text, .pdf-loading, .timeline-line-progress'
      ).forEach(el => el.style.display = 'none');

      // 终端行全部可见
      document.querySelectorAll('.terminal-line').forEach(el => el.style.opacity = '1');

      // 获奖数字显示
      document.querySelectorAll('.award-stat-number').forEach(el => {
        el.textContent = el.dataset.target;
      });

      // highlight-item 添加 bullet（如果还没有）
      document.querySelectorAll('.highlight-item').forEach(el => {
        if (!el.textContent.startsWith('•')) {
          el.prepend('• ');
        }
      });
    });

    // 生成 PDF
    console.log('📝 正在生成 PDF...');
    await page.pdf({
      path: PDF_FILE,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '8mm',
        right: '10mm',
        bottom: '8mm',
        left: '10mm'
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
