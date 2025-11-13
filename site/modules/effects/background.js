// /site/modules/effects/background.js
// Scrolling code wall (downward) with dynamic line generation/removal,
// plus optional ASCII stars and scattered error lines.
//
// Usage (e.g. in /site/page/home/home.js):
//   window.Site.effects.background.init({
//     enable_code_bg: true,
//     code_scroll_speed: 22, // px/sec downward
//     code_color: '#0f0',
//     code_font_size: 11,
//     code_line_height: 14,
//     code_lines_extra: 15,  // ~how many lines to keep as offscreen buffers (top & bottom)
//     enable_error_lines: true,
//     enable_ascii_stars: true
//   });

window.Site = window.Site || {};
(function () {
  // ───────────────────────────────────────────────────────────────
  // CONFIG — override via background.setConfig(...) or init(opts)
  // ───────────────────────────────────────────────────────────────
  const cfg = {
    // toggles
    enable_code_bg: true,
    enable_error_lines: true,
    enable_ascii_stars: true,

    // layer ids
    code_id:   'codeBg',
    errors_id: 'errorLayer',
    stars_id:  'starLayer',

    // z-indexes (keep under your content z-index:2; fade overlay is 10000)
    z_index_code: 1,
    z_index_errors: 1,
    z_index_stars: 1,

    // CODE BG (scrolling)
    code_font_size: 15,          // px
    code_line_height: 15,        // px
    code_opacity: 0.15,
    code_lines_extra: 10,        // offscreen buffer lines (kept above AND below)
    code_color: '#0f0',
    code_scroll_speed: 22,       // px per second (downward). 0 = no scroll
    code_templates: [
      'const socialMedia = { platforms: ["Instagram", "YouTube", "TikTok", "X"] };',
      'function connectWithCreator() { return "Follow for updates!"; }',
      'class SocialNetwork { constructor(handle) { this.followers = "growing"; } }',
      'const devLife = { coding: true, creating: true, sharing: true };',
      'async function loadContent() { return await fetch("/api/latest-posts"); }',
      'const creator = { name: "Nicholas Garos", passion: "development" };',
      '// Building connections one follower at a time',
      'export default { instagram: "@1mb_memory", youtube: "@1MB_Memory" };',
      'const engagement = followers.map(f => f.interact());',
      'if (interested) { clickFollow(); } else { keepBrowsing(); }',
      'function shareContent() { return "Spread the digital word!"; }',
      'const community = users.filter(u => u.isAwesome === true);',
      '// Social media: where code meets creativity',
      'const platforms = ["📷", "📺", "🎵", "🐦"].map(icon => icon);',
      'function buildFollowing() { return consistency + quality; }'
    ],

    // ASCII STARS
    stars_count: 80,
    star_symbols: ['(', ')', '{', '}', '[', ']', '<', '>', '/', '\\', '|', ';', ':', '.', ',', '=', '+', '-', '*', '&', '%', '$', '#', '@', '!', '?', '"', "'", '`'],
    star_font_min: 8,
    star_font_max: 18,
    star_anim_delay_max: 3,      // seconds

    // ERROR LINES
    errors_messages: [
      "SyntaxError: Unexpected token '{'",
      "TypeError: Cannot read property 'length'",
      "ReferenceError: foo is not defined",
      "Error: Missing closing bracket ']'",
      "Warning: Deprecated function call",
      "Uncaught Error: undefined is not a function",
      "Error: Expected ';' but found '}'",
      "Warning: Unused variable 'result'",
      "TypeError: null is not an object",
      "SyntaxError: Invalid or unexpected token",
      "ReferenceError: $ is not defined",
      "Error: Cannot find module './config'",
      'Warning: React Hook useEffect has a missing dependency',
      'TypeError: map is not a function',
      'SyntaxError: Unexpected end of input',
      'Error: Maximum call stack size exceeded',
      'Warning: Each child should have a unique "key" prop',
      'ReferenceError: process is not defined',
      "TypeError: Cannot destructure property 'name'",
      'Error: await is only valid in async functions'
    ],
    errors_font_min: 8,
    errors_font_max: 12,
    errors_opacity_min: 0.3,
    errors_opacity_max: 0.6,
    errors_count: 18 // how many to scatter (will sample from messages)
  };

  // ───────────────────────────────────────────────────────────────
  // Utils
  // ───────────────────────────────────────────────────────────────
  const rand    = (a, b) => Math.random() * (b - a) + a;
  const randint = (a, b) => Math.floor(rand(a, b + 1));
  const $id     = (id) => document.getElementById(id);

  function ensureLayer(id, z, className, extraStyles = {}) {
    let el = $id(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      if (className) el.className = className;
      el.style.position = 'fixed';
      el.style.inset = '0';
      el.style.pointerEvents = 'none';
      el.style.zIndex = String(z);
      Object.assign(el.style, extraStyles);
      document.body.prepend(el);
    }
    return el;
  }

  function removeLayer(id) {
    const el = $id(id);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  // ───────────────────────────────────────────────────────────────
  // CODE BACKGROUND — infinite downward stream
  // We keep a queue of <div> lines. We start with:
  // totalLines = viewLines + 2 * code_lines_extra
  // Initial translateY = -(topBuffer * lineHeight).
  // As we scroll downward, when translateY crosses 0, we prepend a new line
  // (appearing from the top) and subtract one lineHeight. We also remove a line
  // from the bottom to keep totalLines constant. No gaps, minimal DOM churn.
  // ───────────────────────────────────────────────────────────────
  let codeInner = null;
  let lineQueue = [];          // array<HTMLElement>, top -> bottom
  let translateY = 0;          // px (applied to codeInner)
  let viewLines = 0;
  let totalLines = 0;
  let topBuffer = 0;           // lines kept above viewport
  let bottomBuffer = 0;        // lines kept below viewport
  let lastTs = 0;
  let scrollRAF = 0;
  let isVisible = true;

  function genLineText() {
    const line = cfg.code_templates[randint(0, cfg.code_templates.length - 1)];
    const indent = '  '.repeat(randint(0, 3));
    return indent + line;
  }

  function makeLineEl(text) {
    const el = document.createElement('div');
    el.textContent = text;
    return el;
  }

  function buildInitialLines() {
    // compute counts
    viewLines = Math.ceil(window.innerHeight / cfg.code_line_height);
    topBuffer = Math.max(0, cfg.code_lines_extra | 0);
    bottomBuffer = Math.max(0, cfg.code_lines_extra | 0);
    totalLines = viewLines + topBuffer + bottomBuffer;

    // build queue
    lineQueue.length = 0;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < totalLines; i++) {
      const el = makeLineEl(genLineText());
      frag.appendChild(el);
      lineQueue.push(el);
    }
    codeInner.innerHTML = '';
    codeInner.appendChild(frag);

    // start with topBuffer lines "above" the viewport
    translateY = -(topBuffer * cfg.code_line_height);
    applyTransform();
  }

  function applyTransform() {
    codeInner.style.transform = `translateY(${translateY}px)`;
  }

  function setupCodeLayer() {
    const layer = ensureLayer(
      cfg.code_id,
      cfg.z_index_code,
      'code-bg',
      {
        whiteSpace: 'pre',
        overflow: 'hidden',
        color: cfg.code_color,
        opacity: String(cfg.code_opacity),
        fontFamily: 'Courier New, monospace',
        fontSize: cfg.code_font_size + 'px',
        lineHeight: cfg.code_line_height + 'px'
      }
    );

    // inner scroller column
    codeInner = document.createElement('div');
    codeInner.style.position = 'absolute';
    codeInner.style.left = '0';
    codeInner.style.top = '0';
    codeInner.style.right = '0';
    codeInner.style.willChange = 'transform';
    layer.innerHTML = '';
    layer.appendChild(codeInner);

    buildInitialLines();
    startCodeScroll();
  }

  function startCodeScroll() {
    stopCodeScroll();

    document.addEventListener('visibilitychange', onVis, { passive: true });

    const speed = Math.max(0, Number(cfg.code_scroll_speed) || 0);
    if (speed === 0) {
      codeInner && (codeInner.style.transform = 'translateY(0px)');
      return;
    }

    const step = (ts) => {
      if (!isVisible) { scrollRAF = requestAnimationFrame(step); return; }

      if (!lastTs) lastTs = ts;
      const dt = (ts - lastTs) / 1000; // sec
      lastTs = ts;

      translateY += speed * dt;

      // Whenever we’ve moved by >= one line height, we:
      // - prepend a fresh line at the top
      // - subtract one lineHeight from translateY
      // - remove one line from the bottom (keep length stable)
      const lh = cfg.code_line_height;
      while (translateY >= -0.0001 && translateY >= 0) {
        // prepend
        const newEl = makeLineEl(genLineText());
        codeInner.insertBefore(newEl, codeInner.firstChild);
        lineQueue.unshift(newEl);

        // keep queue size bounded (drop from bottom)
        if (lineQueue.length > totalLines) {
          const old = lineQueue.pop();
          if (old && old.parentNode) old.parentNode.removeChild(old);
        }

        translateY -= lh; // consume one line worth of travel
      }

      applyTransform();
      scrollRAF = requestAnimationFrame(step);
    };

    scrollRAF = requestAnimationFrame(step);
  }

  function stopCodeScroll() {
    if (scrollRAF) {
      cancelAnimationFrame(scrollRAF);
      scrollRAF = 0;
    }
    document.removeEventListener('visibilitychange', onVis);
    lastTs = 0;
  }

  function onVis() {
    isVisible = document.visibilityState !== 'hidden';
  }

  function buildCodeBg() {
    setupCodeLayer();
  }

  // ───────────────────────────────────────────────────────────────
  // ASCII STARS
  // ───────────────────────────────────────────────────────────────
  function buildStars() {
    const layer = ensureLayer(cfg.stars_id, cfg.z_index_stars, '');
    layer.innerHTML = '';
    for (let i = 0; i < cfg.stars_count; i++) {
      const s = document.createElement('div');
      s.className = 'star'; // relies on your existing @keyframes twinkle
      s.textContent = cfg.star_symbols[randint(0, cfg.star_symbols.length - 1)];
      s.style.position = 'absolute';
      s.style.left = rand(0, 100) + '%';
      s.style.top  = rand(0, 100) + '%';
      s.style.fontSize = rand(cfg.star_font_min, cfg.star_font_max) + 'px';
      s.style.animationDelay = rand(0, cfg.star_anim_delay_max) + 's';
      s.style.color = '#fff';
      s.style.opacity = '0.8';
      s.style.pointerEvents = 'none';
      layer.appendChild(s);
    }
  }

  // ───────────────────────────────────────────────────────────────
  // ERROR LINES
  // ───────────────────────────────────────────────────────────────
  function buildErrors() {
    const layer = ensureLayer(cfg.errors_id, cfg.z_index_errors, '');
    layer.innerHTML = '';
    const msgs = cfg.errors_messages.slice();
    for (let i = 0; i < cfg.errors_count; i++) {
      const msg = msgs[i % msgs.length];
      const el = document.createElement('div');
      el.className = 'error-line';
      el.textContent = msg;
      el.style.position = 'absolute';
      el.style.left = rand(5, 95) + '%';
      el.style.top  = rand(5, 95) + '%';
      el.style.fontFamily = 'Courier New, monospace';
      el.style.fontSize = rand(cfg.errors_font_min, cfg.errors_font_max) + 'px';
      el.style.color = '#f33';
      el.style.opacity = rand(cfg.errors_opacity_min, cfg.errors_opacity_max).toFixed(2);
      el.style.pointerEvents = 'none';
      layer.appendChild(el);
    }
  }

  // ───────────────────────────────────────────────────────────────
  // Public API
  // ───────────────────────────────────────────────────────────────
  let resizeRaf = 0;
  let resizeBound = false;

  function init(options = {}) {
    setConfig(options);

    if (cfg.enable_code_bg)     buildCodeBg();
    if (cfg.enable_ascii_stars) buildStars();
    if (cfg.enable_error_lines) buildErrors();

    if (!resizeBound) {
      resizeBound = true;
      window.addEventListener('resize', () => {
        cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
          // Rebuild all layers on resize to keep measurements correct
          if (cfg.enable_code_bg) { stopCodeScroll(); buildCodeBg(); }
          if (cfg.enable_ascii_stars) buildStars();
          if (cfg.enable_error_lines) buildErrors();
        });
      }, { passive: true });
    }
  }

  function destroy() {
    stopCodeScroll();
    removeLayer(cfg.code_id);
    removeLayer(cfg.errors_id);
    removeLayer(cfg.stars_id);
  }

  function setConfig(partial = {}) {
    Object.assign(cfg, partial);
  }

  function rebuild(parts = { code:true, stars:true, errors:true }) {
    if (parts.code) {
      cfg.enable_code_bg ? (stopCodeScroll(), buildCodeBg()) : (stopCodeScroll(), removeLayer(cfg.code_id));
    }
    if (parts.stars)  cfg.enable_ascii_stars ? buildStars()  : removeLayer(cfg.stars_id);
    if (parts.errors) cfg.enable_error_lines ? buildErrors() : removeLayer(cfg.errors_id);
  }

  window.Site.effects = Object.assign(window.Site.effects || {}, {
    background: { init, destroy, rebuild, setConfig, config: cfg }
  });
})();
