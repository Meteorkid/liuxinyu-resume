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

    // 等待字体加载
    await page.evaluateHandle('document.fonts.ready');

    // 等待一段时间让动画完成
    await new Promise(resolve => setTimeout(resolve, 2000));

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

      // 隐藏交互元素
      document.querySelectorAll('.scroll-progress, .cursor-glow, .back-to-top, .terminal-skip, .hero-scroll, .hero-download, .navbar, .nav-overlay, .section-wave').forEach(el => {
        el.style.display = 'none';
      });

      // 调整 hero 区域
      const hero = document.querySelector('.hero');
      if (hero) {
        hero.style.minHeight = 'auto';
        hero.style.padding = '2rem';
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

      // 获奖数字确保显示
      document.querySelectorAll('.award-stat-number').forEach(el => {
        const target = el.dataset.target;
        el.textContent = target;
      });
    });

    // 生成 PDF
    console.log('📝 正在生成 PDF...');
    await page.pdf({
      path: PDF_FILE,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
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
