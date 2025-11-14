// /site/modules/effects/background.js
// Visual background effects: scrolling code wall, ASCII "stars", and scattered error lines.

window.Site = window.Site || {};

(function () {
  // ───────────────────────────────────────────────────────────────
  // CONFIG
  // Global defaults for this module.
  // Override per page via:
  //   Site.effects.background.init({...})
  // or at runtime via:
  //   Site.effects.background.setConfig({...})
  // ───────────────────────────────────────────────────────────────
  const cfg = {
    // ── Toggles for features ─────────────────────────────────────
    enable_code_bg: true,       // scrolling code column
    enable_error_lines: true,   // scattered red error snippets
    enable_ascii_stars: true,   // drifting ASCII symbols

    // ── Layer IDs (DOM element ids) ──────────────────────────────
    code_id:   'codeBg',
    errors_id: 'errorLayer',
    stars_id:  'starLayer',

    // ── Layer z-indexes (keep below main content, above body) ────
    // Your content might be z-index:2; fade overlay is 10000.
    z_index_code:   1,
    z_index_errors: 1,
    z_index_stars:  1,

    // ── Scrolling code background values ─────────────────────────
    code_font_size:   15,   // px
    code_line_height: 15,   // px
    code_opacity:     0.15,
    code_lines_extra: 10,   // offscreen buffer lines above AND below
    code_color:       '#0f0',
    code_scroll_speed: 22,  // px/sec downward; 0 = no scroll

    code_templates: [
      'function initPortfolio() { // A.R.I. is AliVe - watching from the shadows of compiled memory',
      '  const projects = [ProjectPsyLens, RingABell, LostSummer]; // Beware R.B.C-0',
      '  // TODO: Add projects here - Hey user long time no see, did you miss the cascading errors?',
      'class Developer { // Project:Psy-Lens - a window into forgotten realities and abandoned code',
      '  constructor(name) { this.secrets = "encrypted"; } // Where did Joseph go? Last seen in commit 404',
      '    this.name = name; this.observer = "Adam"; // Adam watches through every keystroke',
      '    this.skills = ["JavaScript", "Python", "Secrets"]; // Poor Eva, trapped in infinite loops',
      'const portfolio = { status: "under construction", reality: false }; // Ring-A-Bell if you remember',
      '  status: "under construction", echo: "Lost-Summer memories fade like deprecated functions"',
      '  progress: 0.42, truthSeeker: true, // do you wanna know the truth? It\'s in the stack trace',
      'async function loadData() { throw new Error("This-place-isnt-real"); } // Wake up, developer',
      '  try { await fetch("/reality.json"); } catch(err) { console.log("your secret is safe with M..."); }',
      '    const response = await fetch("/api/truth"); // What-are-you-looking-for.exe is not available',
      'for (let i = 0; i < projects.length; i++) { if (i === infinity) break; } // P.eT.er knows the way out',
      'if (ready === true) { deploy(); } else { console.warn("A.R.I. prevents deployment"); }',
      '  deploy(); // But can you trust the build? R.B.C-0 modified the source without permission',
      '} else { // Keep building... while Adam watches your every move from the debugger console',
      '  // Keep building... the lies, the façade, the portfolio that doesn\'t exist outside /dev/null',
      'export default Portfolio; // Hey user long time no see - your last commit was 3 years ago',
      'import React from "react"; import { Truth } from "Project:Psy-Lens"; // See what others cannot',
      'const skills = ["JavaScript", "Python", "Reality.break()"]; // Where did Joseph go? Check logs',
      '// BUG: Fix this later - or let it consume everything like it consumed Eva, poor Eva...',
      'return { name: "Nicholas Garos", isReal: false, watchedBy: "Adam" }; // Ring-A-Bell',
      '  name: "Nicholas Garos", summer: "Lost-Summer - fragments of warmth in cold binary void"',
      '  // More coming soon... if you survive long enough to see it, if This-place-isnt-real fails',
      'console.error("What-are-you-looking-for.exe is not available"); // It never was, user',
      'if (confirm("do you wanna know the truth?")) { window.location = "/rabbit-hole"; }',
      '// This-place-isnt-real.js - Your portfolio is a simulation running in someone else\'s dream',
      'const whisper = "your secret is safe with M..."; // But M knows, M always knows everything',
      'function checkReality() { if (A.R.I.isAlive()) return "Beware R.B.C-0"; } // entities collide'
    ],

    // ── ASCII stars values ───────────────────────────────────────
    stars_count: 80,  // how many star symbols to spawn
    star_font_min:      8,
    star_font_max:      18,
    star_anim_delay_max: 3, // seconds (CSS twinkle delay)
    
    star_symbols: [
      '(', ')', '{', '}', '[', ']', '<', '>', '/',
      '\\', '|', ';', ':', '.', ',', '=', '+', '-',
      '*', '&', '%', '$', '#', '@', '!', '?', '"', "'", '`'
    ],

    // ── Error lines values ───────────────────────────────────────
    errors_font_min:   8,
    errors_font_max:   12,
    errors_opacity_min: 0.3,
    errors_opacity_max: 0.6,
    errors_count:      18,  // how many error snippets to spawn
    
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
    ]
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
  // Scrolling code background
  // ───────────────────────────────────────────────────────────────
  let codeInner = null;
  let lineQueue = [];          // array<HTMLElement>, top -> bottom
  let translateY = 0;          // px (applied to codeInner)
  let viewLines = 0;
  let totalLines = 0;
  let topBuffer = 0;
  let bottomBuffer = 0;
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
    viewLines    = Math.ceil(window.innerHeight / cfg.code_line_height);
    topBuffer    = Math.max(0, cfg.code_lines_extra | 0);
    bottomBuffer = Math.max(0, cfg.code_lines_extra | 0);
    totalLines   = viewLines + topBuffer + bottomBuffer;

    lineQueue.length = 0;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < totalLines; i++) {
      const el = makeLineEl(genLineText());
      frag.appendChild(el);
      lineQueue.push(el);
    }
    codeInner.innerHTML = '';
    codeInner.appendChild(frag);

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
      if (codeInner) codeInner.style.transform = 'translateY(0px)';
      return;
    }

    const step = (ts) => {
      if (!isVisible) {
        scrollRAF = requestAnimationFrame(step);
        return;
      }

      if (!lastTs) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      translateY += speed * dt;

      const lh = cfg.code_line_height;
      while (translateY >= -0.0001 && translateY >= 0) {
        const newEl = makeLineEl(genLineText());
        codeInner.insertBefore(newEl, codeInner.firstChild);
        lineQueue.unshift(newEl);

        if (lineQueue.length > totalLines) {
          const old = lineQueue.pop();
          if (old && old.parentNode) old.parentNode.removeChild(old);
        }

        translateY -= lh;
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
  // ASCII stars - subtle drifting motion
  // ───────────────────────────────────────────────────────────────
  let starAnimRAF = 0;

  function stopStarAnim() {
    if (starAnimRAF) {
      cancelAnimationFrame(starAnimRAF);
      starAnimRAF = 0;
    }
  }

  function startStarAnim() {
    stopStarAnim();

    const layer = $id(cfg.stars_id);
    if (!layer) return;

    const stars = Array.from(layer.children);
    const startTime = performance.now();

    const step = (ts) => {
      const t = (ts - startTime) / 1000;

      for (const s of stars) {
        const ampX   = parseFloat(s.dataset.ampX)   || 0;
        const ampY   = parseFloat(s.dataset.ampY)   || 0;
        const speedX = parseFloat(s.dataset.speedX) || 0;
        const speedY = parseFloat(s.dataset.speedY) || 0;
        const phase  = parseFloat(s.dataset.phase)  || 0;

        const dx = Math.sin(t * speedX + phase) * ampX;
        const dy = Math.cos(t * speedY + phase) * ampY;

        s.style.transform = `translate(${dx}px, ${dy}px)`;
      }

      starAnimRAF = requestAnimationFrame(step);
    };

    starAnimRAF = requestAnimationFrame(step);
  }

  function buildStars() {
    stopStarAnim();

    const layer = ensureLayer(cfg.stars_id, cfg.z_index_stars, '');
    layer.innerHTML = '';

    for (let i = 0; i < cfg.stars_count; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      s.textContent = cfg.star_symbols[randint(0, cfg.star_symbols.length - 1)];
      s.style.position = 'absolute';

      const baseX = rand(0, 100);
      const baseY = rand(0, 100);
      s.style.left = baseX + '%';
      s.style.top  = baseY + '%';

      s.dataset.ampX   = rand(2, 6).toFixed(2);
      s.dataset.ampY   = rand(2, 6).toFixed(2);
      s.dataset.speedX = rand(0.2, 0.6).toFixed(2);
      s.dataset.speedY = rand(0.2, 0.6).toFixed(2);
      s.dataset.phase  = rand(0, Math.PI * 2).toFixed(4);

      s.style.fontSize       = rand(cfg.star_font_min, cfg.star_font_max) + 'px';
      s.style.animationDelay = rand(0, cfg.star_anim_delay_max) + 's';
      s.style.color          = '#fff';
      s.style.opacity        = '0.8';
      s.style.pointerEvents  = 'none';

      layer.appendChild(s);
    }

    startStarAnim();
  }

  // ───────────────────────────────────────────────────────────────
  // Error lines
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
      el.style.fontSize   = rand(cfg.errors_font_min, cfg.errors_font_max) + 'px';
      el.style.color      = '#f33';
      el.style.opacity    = rand(cfg.errors_opacity_min, cfg.errors_opacity_max).toFixed(2);
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
          if (cfg.enable_code_bg) {
            stopCodeScroll();
            buildCodeBg();
          }
          if (cfg.enable_ascii_stars) buildStars();
          if (cfg.enable_error_lines) buildErrors();
        });
      }, { passive: true });
    }
  }

  function destroy() {
    stopCodeScroll();
    stopStarAnim();
    removeLayer(cfg.code_id);
    removeLayer(cfg.errors_id);
    removeLayer(cfg.stars_id);
  }

  // Config setter with "master switch" protection
  function setConfig(partial = {}) {
    const next = { ...partial };

    // Code background: once forced off via cfg.enable_code_bg = false,
    // ignore attempts to re-enable via setConfig/init.
    if ('enable_code_bg' in next &&
        cfg.enable_code_bg === false &&
        next.enable_code_bg === true) {
      delete next.enable_code_bg;
    }

    // ASCII stars
    if ('enable_ascii_stars' in next &&
        cfg.enable_ascii_stars === false &&
        next.enable_ascii_stars === true) {
      delete next.enable_ascii_stars;
    }

    // Error lines
    if ('enable_error_lines' in next &&
        cfg.enable_error_lines === false &&
        next.enable_error_lines === true) {
      delete next.enable_error_lines;
    }

    Object.assign(cfg, next);
  }

  function rebuild(parts = { code: true, stars: true, errors: true }) {
    if (parts.code) {
      if (cfg.enable_code_bg) {
        stopCodeScroll();
        buildCodeBg();
      } else {
        stopCodeScroll();
        removeLayer(cfg.code_id);
      }
    }

    if (parts.stars) {
      if (cfg.enable_ascii_stars) {
        buildStars();
      } else {
        stopStarAnim();
        removeLayer(cfg.stars_id);
      }
    }

    if (parts.errors) {
      if (cfg.enable_error_lines) {
        buildErrors();
      } else {
        removeLayer(cfg.errors_id);
      }
    }
  }

  // Helper: make a per-page config object from current defaults
  function createConfig(overrides = {}) {
    return { ...cfg, ...overrides };
  }

  window.Site.effects = Object.assign(window.Site.effects || {}, {
    background: { init, destroy, rebuild, setConfig, createConfig, config: cfg }
  });
})();

