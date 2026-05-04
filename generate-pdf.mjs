#!/usr/bin/env node

/**
 * 使用 Puppeteer 将 HTML 简历转换为 PDF
 *
 * 策略：从原页面提取数据 → 生成干净的 PDF 专用 HTML → 渲染 PDF
 * 这样完全不依赖原网页的复杂 CSS 布局
 */

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

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

    await page.evaluateHandle('document.fonts.ready');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ============================================================
    // 第一步：从原页面提取所有数据
    // ============================================================
    console.log('📦 正在提取页面数据...');
    const data = await page.evaluate(() => {
      const getText = (sel) => {
        const el = document.querySelector(sel);
        return el ? el.textContent.trim() : '';
      };
      const getAll = (sel) => Array.from(document.querySelectorAll(sel)).map(el => el.textContent.trim());
      const getHTML = (sel) => {
        const el = document.querySelector(sel);
        return el ? el.innerHTML : '';
      };

      // 终端行
      const terminalLines = Array.from(document.querySelectorAll('.terminal-line')).map(el => ({
        html: el.innerHTML,
        isCommand: el.querySelector('.prompt') !== null
      }));

      // 时间线
      const timeline = Array.from(document.querySelectorAll('.tl-item')).map(el => ({
        year: el.querySelector('.tl-year')?.textContent.trim() || '',
        title: el.querySelector('.tl-title')?.textContent.trim() || '',
        company: '',
        desc: el.querySelector('.tl-desc')?.textContent.trim() || ''
      }));

      // 项目
      const projects = Array.from(document.querySelectorAll('.project-card')).map(el => ({
        emoji: el.querySelector('.project-card-emoji')?.textContent.trim() || '',
        title: el.querySelector('.project-card-title')?.textContent.trim() || '',
        desc: el.querySelector('.project-card-desc')?.textContent.trim() || '',
        tag: el.querySelector('.project-card-tag')?.textContent.trim() || '',
        colorClass: el.className.match(/project-card--\d/)?.[0] || 'project-card--1'
      }));

      // GitHub
      const githubCards = Array.from(document.querySelectorAll('.github-card')).map(el => ({
        name: el.querySelector('.github-card-name')?.textContent.trim() || '',
        desc: el.querySelector('.github-card-desc')?.textContent.trim() || '',
        lang: el.querySelector('.github-card-lang')?.textContent.trim() || '',
        stars: el.querySelector('.github-card-stars')?.textContent.trim() || '',
        forks: el.querySelector('.github-card-forks')?.textContent.trim() || ''
      }));

      // 获奖统计
      const awardStats = Array.from(document.querySelectorAll('.award-stat')).map(el => ({
        number: el.querySelector('.award-stat-number')?.dataset.target || el.querySelector('.award-stat-number')?.textContent.trim() || '0',
        label: el.querySelector('.award-stat-label')?.textContent.trim() || ''
      }));

      // 获奖分类
      const awardCategories = Array.from(document.querySelectorAll('.award-group')).map(cat => ({
        title: cat.querySelector('.award-group-title')?.textContent.trim() || '',
        items: Array.from(cat.querySelectorAll('.award-item')).map(item => ({
          text: item.querySelector('.award-detail')?.textContent.trim() || item.querySelector('.award-title')?.textContent.trim() || '',
          year: ''
        }))
      }));

      // 技能
      const skills = Array.from(document.querySelectorAll('.skill-card')).map(cat => ({
        title: cat.querySelector('.skill-card-title')?.textContent.trim() || '',
        tags: Array.from(cat.querySelectorAll('.skill-tag')).map(t => t.textContent.trim())
      }));

      // 联系
      const contactLinks = Array.from(document.querySelectorAll('.contact-link')).map(el => ({
        text: el.textContent.trim(),
        href: el.href
      }));

      // 头像
      const avatarImg = document.querySelector('.avatar-frame img');
      const avatarSrc = avatarImg ? avatarImg.src : '';

      return {
        terminalLines,
        timeline,
        projects,
        githubCards,
        awardStats,
        awardCategories,
        skills,
        contactLinks,
        avatarSrc
      };
    });

    console.log(`   提取到: ${data.terminalLines.length} 终端行, ${data.timeline.length} 经历, ${data.projects.length} 项目, ${data.githubCards.length} 开源, ${data.skills.length} 技能分类`);

    // ============================================================
    // 第二步：生成 PDF 专用的干净 HTML
    // ============================================================
    console.log('🎨 正在生成 PDF 专用 HTML...');

    const colorMap = {
      'project-card--1': 'background:linear-gradient(135deg,#F4D758,#F7A946)',
      'project-card--2': 'background:linear-gradient(135deg,#2B7FD8,#1a5fa0);color:#fff',
      'project-card--3': 'background:linear-gradient(135deg,#6C5CE7,#a55eea);color:#fff',
      'project-card--4': 'background:linear-gradient(135deg,#28c840,#1a9c30);color:#fff'
    };

    const pdfHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 10mm 12mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif;
    color: #1a1a1a;
    font-size: 9pt;
    line-height: 1.55;
    background: #fff;
  }

  /* ===== Hero ===== */
  .hero {
    background: #0d1117;
    padding: 10px 14px;
    border-radius: 6px;
    margin-bottom: 10px;
    color: #c9d1d9;
    font-family: "SF Mono", "Fira Code", "Consolas", monospace;
    font-size: 8pt;
    line-height: 1.6;
  }
  .hero-header {
    display: flex; align-items: center; gap: 6px;
    margin-bottom: 6px; padding-bottom: 6px;
    border-bottom: 1px solid #21262d;
  }
  .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
  .dot-r { background: #ff5f57; }
  .dot-y { background: #febc2e; }
  .dot-g { background: #28c840; }
  .hero-title { color: #8b949e; font-size: 7.5pt; margin-left: 6px; }
  .line { margin-bottom: 1px; }
  .line-cmd { color: #58a6ff; }
  .line-prompt { color: #F4D758; }
  .line-val { color: #c9d1d9; }

  /* ===== About ===== */
  .about { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 10px; }
  .about-avatar { flex: 0 0 72px; }
  .about-avatar img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; display: block; }
  .about-avatar-name { font-size: 9pt; font-weight: bold; text-align: center; margin-top: 4px; }
  .about-avatar-school { font-size: 7pt; color: #888; text-align: center; margin-top: 1px; }
  .about-body { flex: 1; }
  .about-bio { font-size: 8.5pt; margin-bottom: 5px; }
  .about-highlights { list-style: none; }
  .about-highlights li { font-size: 8pt; padding: 1px 0; }
  .about-highlights li::before { content: "• "; color: #F4D758; font-weight: bold; }

  /* ===== Section Header ===== */
  .sec-label { font-size: 7pt; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1px; }
  .sec-title { font-size: 13pt; font-weight: bold; margin-bottom: 6px; color: #1a1a1a; }
  .sec-title em { font-style: normal; color: #2B7FD8; }
  .section { margin-bottom: 10px; }

  /* ===== Timeline ===== */
  .timeline { padding-left: 16px; border-left: 2px solid #e0e0e0; }
  .tl-item { position: relative; padding-left: 12px; padding-bottom: 8px; margin-bottom: 4px; break-inside: avoid; }
  .tl-dot { position: absolute; left: -21px; top: 5px; width: 8px; height: 8px; background: #2B7FD8; border-radius: 50%; }
  .tl-year { font-size: 8pt; color: #2B7FD8; font-weight: bold; margin-bottom: 1px; }
  .tl-title { font-size: 9.5pt; font-weight: bold; color: #1a1a1a; }
  .tl-company { font-size: 8pt; color: #666; }
  .tl-desc { font-size: 8pt; color: #444; margin-top: 2px; line-height: 1.5; }

  /* ===== Project Cards ===== */
  .project-card {
    padding: 7px 10px; border-radius: 6px; margin-bottom: 5px;
    break-inside: avoid;
  }
  .project-card--1 { background: linear-gradient(135deg, #F4D758, #F7A946); }
  .project-card--2 { background: linear-gradient(135deg, #2B7FD8, #1a5fa0); color: #fff; }
  .project-card--3 { background: linear-gradient(135deg, #6C5CE7, #a55eea); color: #fff; }
  .project-card--4 { background: linear-gradient(135deg, #28c840, #1a9c30); color: #fff; }
  .project-emoji { font-size: 12pt; margin-right: 4px; }
  .project-title { font-size: 10pt; font-weight: bold; display: inline; }
  .project-desc { font-size: 7.5pt; margin-top: 2px; opacity: 0.9; }
  .project-tag { font-size: 6.5pt; padding: 1px 5px; background: rgba(255,255,255,0.2); border-radius: 3px; display: inline-block; margin-top: 2px; }

  /* ===== GitHub Grid ===== */
  .github-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
  .github-card {
    padding: 5px 7px; border: 1px solid #e5e5e5; border-radius: 4px;
    break-inside: avoid;
  }
  .gh-name { font-size: 8.5pt; font-weight: bold; color: #2B7FD8; }
  .gh-desc { font-size: 7pt; color: #666; margin: 1px 0; }
  .gh-meta { font-size: 6.5pt; color: #999; }

  /* ===== Awards ===== */
  .award-stats { display: flex; gap: 10px; margin-bottom: 6px; break-inside: avoid; }
  .award-stat { flex: 1; text-align: center; background: #f8f8f8; padding: 4px; border-radius: 4px; }
  .award-num { font-size: 16pt; font-weight: bold; color: #F4D758; }
  .award-lbl { font-size: 6.5pt; color: #888; }
  .award-cat-title { font-size: 9pt; font-weight: bold; margin: 5px 0 2px; }
  .award-item { font-size: 8pt; padding: 1px 0; break-inside: avoid; }
  .award-year { font-size: 6.5pt; color: #999; margin-left: 4px; }

  /* ===== Skills ===== */
  .skill-cat { margin-bottom: 5px; break-inside: avoid; }
  .skill-cat-title { font-size: 8.5pt; font-weight: bold; margin-bottom: 2px; }
  .skill-tags { display: flex; flex-wrap: wrap; gap: 3px; }
  .skill-tag { font-size: 7.5pt; padding: 2px 6px; background: #f0f0f0; border-radius: 3px; }

  /* ===== Contact ===== */
  .contact { text-align: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e0e0e0; }
  .contact a { color: #2B7FD8; text-decoration: none; font-size: 8.5pt; margin: 0 8px; }
</style>
</head>
<body>

<!-- Hero -->
<div class="hero">
  <div class="hero-header">
    <span class="dot dot-r"></span>
    <span class="dot dot-y"></span>
    <span class="dot dot-g"></span>
    <span class="hero-title">liuxinyu@gdstnu ~ %</span>
  </div>
  ${data.terminalLines.map(l => `<div class="line">${l.html}</div>`).join('\n  ')}
</div>

<!-- About -->
<div class="section">
  <div class="sec-label">About Me</div>
  <div class="sec-title">技术与创意的<em>交叉探索者</em></div>
  <div class="about">
    <div class="about-avatar">
      ${data.avatarSrc ? `<img src="${data.avatarSrc}" alt="头像">` : ''}
      <div class="about-avatar-name">刘鑫宇</div>
      <div class="about-avatar-school">广东技术师范大学<br>国际教育学院 · 计算机科学与技术</div>
    </div>
    <div class="about-body">
      <div class="about-bio">我是刘鑫宇，广东技术师范大学国际教育学院 2024 级计算机科学与技术专业学生。现任学院科创部负责人，曾任新媒体信息部代理部长、组织委员、街舞社副社长等职务。热衷于小程序开发、Python 数据分析与新媒体视觉设计，在技术与创意的交叉领域持续探索——既写代码也做设计。</div>
      <ul class="about-highlights">
        <li>省级大创立项项目核心成员，负责小程序前端开发</li>
        <li>Python 数据爬取与分析，单项目处理数据量 10,000+</li>
        <li>学院新媒体信息部骨干，单条视频点击量突破 30,000</li>
        <li>累计获省级 / 市级 / 校级 / 院级奖项 20+ 项</li>
        <li>3 段实习经历（新西兰 / 广州 / 佛山），具备跨文化协作能力</li>
        <li>GitHub 开源项目贡献，涵盖 AI 工具链、跨境电商、代码分析</li>
      </ul>
    </div>
  </div>
</div>

<!-- Experience -->
<div class="section">
  <div class="sec-label">Experience</div>
  <div class="sec-title">实习与<em>成长轨迹</em></div>
  <div class="timeline">
    ${data.timeline.map(t => `
    <div class="tl-item">
      <div class="tl-dot"></div>
      <div class="tl-year">${t.year}</div>
      <div class="tl-title">${t.title}</div>
      ${t.company ? `<div class="tl-company">${t.company}</div>` : ''}
      <div class="tl-desc">${t.desc}</div>
    </div>`).join('')}
  </div>
</div>

<!-- Projects -->
<div class="section">
  <div class="sec-label">Projects</div>
  <div class="sec-title">核心项目作品</div>
  ${data.projects.map(p => `
  <div class="project-card ${p.colorClass}">
    <span class="project-emoji">${p.emoji}</span>
    <span class="project-title">${p.title}</span>
    <div class="project-desc">${p.desc}</div>
    <span class="project-tag">${p.tag}</span>
  </div>`).join('')}
</div>

<!-- GitHub -->
<div class="section">
  <div class="sec-label">Open Source</div>
  <div class="sec-title">GitHub 开源项目</div>
  <div class="github-grid">
    ${data.githubCards.map(g => `
    <div class="github-card">
      <div class="gh-name">${g.name}</div>
      <div class="gh-desc">${g.desc}</div>
      <div class="gh-meta">${[g.lang, g.stars, g.forks].filter(Boolean).join(' · ')}</div>
    </div>`).join('')}
  </div>
</div>

<!-- Awards -->
<div class="section">
  <div class="sec-label">Awards</div>
  <div class="sec-title">获奖与荣誉</div>
  <div class="award-stats">
    ${data.awardStats.map(s => `
    <div class="award-stat">
      <div class="award-num">${s.number}</div>
      <div class="award-lbl">${s.label}</div>
    </div>`).join('')}
  </div>
  ${data.awardCategories.map(cat => `
  <div class="award-cat-title">${cat.title}</div>
  ${cat.items.map(item => `
  <div class="award-item">• ${item.text}<span class="award-year">${item.year}</span></div>`).join('')}`).join('')}
</div>

<!-- Skills -->
<div class="section">
  <div class="sec-label">Skills</div>
  <div class="sec-title">技术栈</div>
  ${data.skills.map(s => `
  <div class="skill-cat">
    <div class="skill-cat-title">${s.title}</div>
    <div class="skill-tags">
      ${s.tags.map(t => `<span class="skill-tag">${t}</span>`).join('')}
    </div>
  </div>`).join('')}
</div>

<!-- Contact -->
<div class="contact">
  ${data.contactLinks.map(c => `<a href="${c.href}">${c.text}</a>`).join('')}
</div>

</body>
</html>`;

    // ============================================================
    // 第三步：用生成的 HTML 渲染 PDF
    // ============================================================
    console.log('📝 正在渲染 PDF...');

    // 设置页面内容
    await page.setContent(pdfHTML, { waitUntil: 'domcontentloaded' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(resolve => setTimeout(resolve, 500));

    await page.pdf({
      path: PDF_FILE,
      format: 'A4',
      printBackground: true,
      margin: { top: '8mm', right: '10mm', bottom: '8mm', left: '10mm' },
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
