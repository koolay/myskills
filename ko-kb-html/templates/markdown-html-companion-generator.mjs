/**
 * Template: Markdown -> self-contained HTML companion with build-time Mermaid SVG.
 *
 * Copy this into the target project and replace SOURCE_PATH / OUTPUT_PATH.
 * Requires project-installed `marked`, `mermaid`, and existing Playwright.
 * Do not add these dependencies automatically; ask if they are missing.
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { chromium } from "@playwright/test";
import { marked } from "marked";

const SOURCE_PATH = resolve("docs/architecture/example.md");
const OUTPUT_PATH = resolve("docs/architecture/example.html");
const MERMAID_RUNTIME_PATH = resolve("node_modules/mermaid/dist/mermaid.min.js");

const markdown = stripFrontmatter(readFileSync(SOURCE_PATH, "utf8"));
const title = markdown.match(/^#\s+(.+)$/m)?.[1] ?? "Document";
const headings = collectHeadings(markdown);
const diagrams = collectMermaidBlocks(markdown, headings);
const renderedSvgs = await renderMermaidSvg(diagrams.map((diagram) => diagram.source));

marked.setOptions({ gfm: true, breaks: false });

let diagramIndex = 0;
const bodyMarkdown = markdown.replace(/```mermaid\n([\s\S]*?)```/g, () => {
  const index = diagramIndex;
  diagramIndex += 1;
  return renderDiagramFigure(index, diagrams[index], renderedSvgs[index]);
});

let bodyHtml = marked(bodyMarkdown);
bodyHtml = injectHeadingIds(bodyHtml, headings);
bodyHtml = wrapTables(bodyHtml);

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(title)}</title>
  <style>${getCss()}</style>
</head>
<body>
  <div class="page-shell" data-nav-shell>
    <aside class="doc-nav">${renderToc(headings)}</aside>
    <main class="doc-main">
      <header class="hero">
        <p class="eyebrow">Document Companion</p>
        <h1>${escapeHtml(title)}</h1>
        <p class="subtitle">Replace with a document-specific, decision-oriented summary.</p>
      </header>
      <section class="content-panel"><div class="content">${bodyHtml}</div></section>
    </main>
  </div>
  <script>${getJs()}</script>
</body>
</html>`;

writeFileSync(OUTPUT_PATH, html);
console.log(`Wrote ${OUTPUT_PATH}`);

function stripFrontmatter(source) {
  return source.replace(/^---\n[\s\S]*?\n---\n+/, "");
}

function collectHeadings(source) {
  const found = [];
  const counts = new Map();
  const pattern = /^(#{1,4})\s+(.+)$/gm;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const base = slug(title);
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    found.push({ level, title, id: count === 0 ? base : `${base}-${count + 1}`, offset: match.index });
  }
  return found;
}

function collectMermaidBlocks(source, allHeadings) {
  const diagrams = [];
  const pattern = /```mermaid\n([\s\S]*?)```/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const heading = [...allHeadings].filter((item) => item.offset < match.index).at(-1);
    const mermaidSource = match[1].trim();
    diagrams.push({
      source: mermaidSource,
      caption: heading?.title ?? `Diagram ${diagrams.length + 1}`,
      type: mermaidSource.split("\n")[0]?.trim() ?? "Mermaid",
    });
  }
  return diagrams;
}

async function renderMermaidSvg(sources) {
  if (sources.length === 0) return [];
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.setContent("<!doctype html><html><body></body></html>");
    await page.addScriptTag({ path: MERMAID_RUNTIME_PATH });
    return await page.evaluate(async (items) => {
      window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        theme: "base",
        themeVariables: {
          background: "#ffffff",
          mainBkg: "#f8fafc",
          primaryColor: "#eef6ff",
          primaryBorderColor: "#2563eb",
          primaryTextColor: "#0f172a",
          lineColor: "#475569",
          textColor: "#0f172a",
          edgeLabelBackground: "#ffffff",
        },
      });
      const svgs = [];
      for (let index = 0; index < items.length; index += 1) {
        const result = await window.mermaid.render(`diagram_${index}`, items[index]);
        svgs.push(result.svg);
      }
      return svgs;
    }, sources);
  } finally {
    await browser.close();
  }
}

function renderDiagramFigure(index, diagram, svg) {
  const safeSource = escapeHtml(diagram.source);
  const safeSvg = svg.replace(/<script[\s\S]*?<\/script>/gi, "");
  return `<figure class="doc-figure diagram" data-diagram-zoomable="true">
  <figcaption><span>${escapeHtml(`${index + 1}. ${diagram.caption}`)}</span><small>${escapeHtml(diagram.type)}</small></figcaption>
  <div class="diagram-shell">
    <div class="diagram-viewport"><div class="diagram-svg">${safeSvg}</div></div>
    <div class="diagram-toolbar">
      <button type="button" data-diagram-action="zoom-out">-</button>
      <span class="diagram-zoom-label">100%</span>
      <button type="button" data-diagram-action="zoom-in">+</button>
      <button type="button" data-diagram-action="fit">Fit</button>
      <button type="button" data-diagram-action="reset">Reset</button>
      <button type="button" data-diagram-action="download">SVG</button>
      <button type="button" data-diagram-action="fullscreen">Full</button>
    </div>
  </div>
  <details class="diagram-source"><summary>Mermaid source</summary><pre><code>${safeSource}</code></pre></details>
</figure>`;
}

function renderToc(allHeadings) {
  const items = allHeadings
    .filter((heading) => heading.level === 2 || heading.level === 3)
    .map((heading) => `<li class="toc-depth-${heading.level}"><a href="#${heading.id}">${escapeHtml(heading.title)}</a></li>`)
    .join("");
  return `<div class="nav-card"><button class="nav-toggle" type="button" data-nav-toggle aria-label="折叠或展开目录" aria-expanded="true">目录</button><p class="nav-kicker">Companion</p><h2>目录</h2><ol>${items}</ol></div>`;
}

function injectHeadingIds(html, allHeadings) {
  let next = 0;
  return html.replace(/<h([1-4])>([\s\S]*?)<\/h\1>/g, (match, level, inner) => {
    const heading = allHeadings[next];
    next += 1;
    return heading ? `<h${level} id="${heading.id}">${inner}<a class="anchor" href="#${heading.id}">#</a></h${level}>` : match;
  });
}

function wrapTables(html) {
  return html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, "</table></div>");
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[`*_[\](){}:：/.,，。]/g, "")
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getCss() {
  return `
*{box-sizing:border-box}body{margin:0;background:#f5f7fb;color:#102033;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.65}.page-shell{display:grid;grid-template-columns:320px minmax(0,1fr);gap:24px;max-width:1500px;margin:0 auto;padding:24px;transition:grid-template-columns .18s ease}.page-shell.nav-collapsed{grid-template-columns:72px minmax(0,1fr);max-width:1760px}.doc-nav{position:sticky;top:24px;align-self:start}.nav-card,.hero,.content-panel{background:#fff;border:1px solid #dbe4ef;border-radius:18px;box-shadow:0 18px 45px rgba(15,23,42,.08);padding:22px}.nav-card{position:relative}.nav-toggle{display:block;width:100%;border:1px solid #cbd5e1;background:#f8fafc;color:#102033;border-radius:10px;padding:8px 10px;font:inherit;font-weight:800;cursor:pointer;text-align:left}.nav-toggle::after{content:"‹";float:right;font-size:1.1rem}.page-shell.nav-collapsed .nav-toggle{writing-mode:vertical-rl;text-align:center;min-height:92px;padding:10px 6px}.page-shell.nav-collapsed .nav-toggle::after{content:"›";float:none}.page-shell.nav-collapsed .nav-kicker,.page-shell.nav-collapsed .doc-nav h2,.page-shell.nav-collapsed .doc-nav ol{display:none}.doc-nav ol{list-style:none;margin:12px 0 0;padding:0}.doc-nav a{display:block;padding:7px 9px;border-radius:10px;color:#1e293b;text-decoration:none}.toc-depth-3{padding-left:14px}.hero h1{margin:0;font-size:clamp(2rem,5vw,4.5rem);line-height:1.05}.eyebrow{color:#2563eb;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.subtitle{color:#475569}.content>h1:first-child{display:none}.content h2{font-size:clamp(1.45rem,2.2vw,2.25rem);line-height:1.16}.anchor{margin-left:8px;opacity:0}.content h2:hover .anchor,.content h3:hover .anchor{opacity:.65}code{background:#eef2f7;border-radius:6px;padding:.12rem .34rem}.table-wrap{overflow:auto;border:1px solid #dbe4ef;border-radius:14px;margin:16px 0;background:#fff}table{border-collapse:collapse;width:100%;min-width:720px}th,td{padding:10px 12px;border-bottom:1px solid #e5edf5;text-align:left;vertical-align:top}.doc-figure{margin:22px 0;border:1px solid #cbd5e1;border-radius:18px;background:#f8fafc;padding:16px}.diagram-shell{position:relative;background:#fff;border:1px solid #dbe4ef;border-radius:16px;padding:46px 10px 10px}.diagram-viewport{overflow:hidden;min-height:340px;background:#fff;border-radius:12px;cursor:grab;touch-action:none}.diagram-svg{display:inline-block;padding:16px;will-change:transform}.diagram-svg svg{display:block;max-width:none;height:auto;background:#fff}.diagram-toolbar{position:absolute;top:10px;right:10px;display:flex;gap:6px;align-items:center;background:rgba(248,250,252,.94);border:1px solid #dbe4ef;border-radius:12px;padding:6px;z-index:2}.diagram-toolbar button{border:1px solid #cbd5e1;background:#fff;border-radius:8px;padding:5px 8px;cursor:pointer}.diagram-zoom-label{min-width:44px;text-align:center;font-weight:800}.diagram-dialog-open{overflow:hidden}.diagram-dialog-layer{position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,.86);display:flex;align-items:center;justify-content:center;padding:18px}.diagram-dialog-panel{width:min(96vw,1500px);height:min(94vh,980px);background:#f8fafc;border-radius:18px;padding:12px;display:flex}.diagram-dialog-panel .doc-figure{margin:0;flex:1;display:flex;flex-direction:column;min-height:0}.diagram-dialog-panel .diagram-shell{flex:1;display:flex;flex-direction:column;min-height:0}.diagram-dialog-panel .diagram-viewport{flex:1}.diagram-close{position:absolute;top:14px;right:18px;border:0;background:#fff;border-radius:999px;padding:8px 12px;font-weight:900;cursor:pointer}@media(max-width:1100px){.page-shell,.page-shell.nav-collapsed{grid-template-columns:1fr;max-width:1500px}.doc-main{order:1}.doc-nav{order:2;position:relative;top:auto}.page-shell.nav-collapsed .nav-kicker,.page-shell.nav-collapsed .doc-nav h2,.page-shell.nav-collapsed .doc-nav ol{display:block}.page-shell.nav-collapsed .nav-toggle{writing-mode:horizontal-tb;min-height:0}.page-shell.nav-collapsed .nav-toggle::after{content:"‹";float:right}}@media(max-width:720px){.page-shell{padding:12px}.diagram-toolbar{position:static;margin-bottom:8px;flex-wrap:wrap}.diagram-shell{padding:10px}table{min-width:640px}}@media print{.doc-nav,.diagram-toolbar,.diagram-source{display:none}.page-shell{display:block;padding:0}.hero,.content-panel,.doc-figure{box-shadow:none;break-inside:avoid}}`;
}

function getJs() {
  return `
(() => {
  const states = new WeakMap();
  let dialogLayer = null;
  initNav();
  document.querySelectorAll('[data-diagram-zoomable="true"]').forEach(initDiagram);
  window.addEventListener('resize', () => document.querySelectorAll('[data-diagram-zoomable="true"]').forEach(fitDiagram));
  function initNav() {
    const shell = document.querySelector('[data-nav-shell]');
    const toggle = document.querySelector('[data-nav-toggle]');
    if (!shell || !toggle) return;
    const saved = localStorage.getItem('doc-nav-collapsed');
    if (saved === 'true' && window.matchMedia('(min-width: 1101px)').matches) {
      shell.classList.add('nav-collapsed');
      toggle.setAttribute('aria-expanded', 'false');
    }
    toggle.addEventListener('click', () => {
      const collapsed = shell.classList.toggle('nav-collapsed');
      toggle.setAttribute('aria-expanded', String(!collapsed));
      localStorage.setItem('doc-nav-collapsed', String(collapsed));
      document.querySelectorAll('[data-diagram-zoomable="true"]').forEach(fitDiagram);
    });
  }
  function initDiagram(figure) {
    const viewport = figure.querySelector('.diagram-viewport');
    const layer = figure.querySelector('.diagram-svg');
    const svg = figure.querySelector('svg');
    const label = figure.querySelector('.diagram-zoom-label');
    if (!viewport || !layer || !svg || !label) return;
    const viewBox = (svg.getAttribute('viewBox') || '').split(/\\s+/).map(Number);
    const state = { zoom: 1, panX: 0, panY: 0, naturalWidth: Number(svg.getAttribute('width')) || viewBox[2] || 1000, dragging: false, startX: 0, startY: 0, originX: 0, originY: 0 };
    states.set(figure, state);
    figure.querySelectorAll('[data-diagram-action]').forEach((button) => button.addEventListener('click', () => handleAction(figure, button.dataset.diagramAction)));
    viewport.addEventListener('wheel', (event) => { event.preventDefault(); zoomAt(figure, event.deltaY < 0 ? 1.12 : 0.88, event.offsetX, event.offsetY); }, { passive: false });
    viewport.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button,a,summary,input,textarea,select')) return;
      state.dragging = true; state.startX = event.clientX; state.startY = event.clientY; state.originX = state.panX; state.originY = state.panY;
      viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener('pointermove', (event) => {
      if (!state.dragging) return;
      state.panX = state.originX + event.clientX - state.startX;
      state.panY = state.originY + event.clientY - state.startY;
      applyState(figure);
    });
    viewport.addEventListener('pointerup', (event) => { state.dragging = false; viewport.releasePointerCapture(event.pointerId); });
    fitDiagram(figure);
  }
  function handleAction(figure, action) {
    if (action === 'zoom-in') zoomAt(figure, 1.18);
    if (action === 'zoom-out') zoomAt(figure, 0.84);
    if (action === 'fit') fitDiagram(figure);
    if (action === 'reset') resetDiagram(figure);
    if (action === 'download') downloadSvg(figure);
    if (action === 'fullscreen') openFullscreen(figure);
  }
  function zoomAt(figure, factor, x = null, y = null) {
    const state = states.get(figure);
    if (!state) return;
    const before = state.zoom;
    const next = Math.min(4, Math.max(0.35, before * factor));
    if (x !== null && y !== null) {
      state.panX = x - (x - state.panX) * (next / before);
      state.panY = y - (y - state.panY) * (next / before);
    }
    state.zoom = next;
    applyState(figure);
  }
  function fitDiagram(figure) {
    const state = states.get(figure);
    const viewport = figure.querySelector('.diagram-viewport');
    if (!state || !viewport) return;
    state.zoom = Math.min(1, Math.max(260, viewport.clientWidth - 42) / state.naturalWidth);
    state.panX = 0; state.panY = 0; applyState(figure);
  }
  function resetDiagram(figure) {
    const state = states.get(figure);
    if (!state) return;
    state.zoom = 1; state.panX = 0; state.panY = 0; applyState(figure);
  }
  function applyState(figure) {
    const state = states.get(figure);
    const svg = figure.querySelector('svg');
    const layer = figure.querySelector('.diagram-svg');
    const label = figure.querySelector('.diagram-zoom-label');
    if (!state || !svg || !layer || !label) return;
    svg.style.width = Math.max(120, state.naturalWidth * state.zoom) + 'px';
    svg.style.maxWidth = 'none';
    layer.style.transform = 'translate3d(' + state.panX + 'px,' + state.panY + 'px,0)';
    label.textContent = Math.round(state.zoom * 100) + '%';
  }
  function downloadSvg(figure) {
    const svg = figure.querySelector('svg');
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'diagram.svg'; link.click(); URL.revokeObjectURL(url);
  }
  function openFullscreen(figure) {
    if (dialogLayer) return;
    const placeholder = document.createComment('diagram-placeholder');
    figure.parentNode.insertBefore(placeholder, figure);
    dialogLayer = document.createElement('div'); dialogLayer.className = 'diagram-dialog-layer';
    const panel = document.createElement('div'); panel.className = 'diagram-dialog-panel';
    const close = document.createElement('button'); close.className = 'diagram-close'; close.type = 'button'; close.textContent = 'Close';
    panel.appendChild(figure); dialogLayer.appendChild(panel); dialogLayer.appendChild(close); document.body.appendChild(dialogLayer);
    document.body.classList.add('diagram-dialog-open'); fitDiagram(figure);
    close.addEventListener('click', closeFullscreen);
    function closeFullscreen() { placeholder.replaceWith(figure); dialogLayer.remove(); dialogLayer = null; document.body.classList.remove('diagram-dialog-open'); fitDiagram(figure); }
  }
})();`;
}
