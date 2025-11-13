// modules/effects/fade.js
// Minimal, reusable fade overlay (no navigation). Time-based only.
// Blocks pointer input during animations; unblocks when each ends.

window.Site = window.Site || {};
(function () {
  // ───────────────────────────────────────────────────────────────
  // CONFIG (override via setConfig(...) or per-call options)
  // ───────────────────────────────────────────────────────────────
  const config = {
    overlay_id: 'fadeOverlay',
    overlay_color: '#000',
    overlay_zindex: 10000,

    // Timings (ms)
    fadein_duration: 500,         // black → transparent
    afterfadein_delay: 60,        // small cushion before removing overlay
    fadeout_duration: 750,        // transparent → black
    fadeout_delay: 500,             // wait BEFORE starting fade-out
    afterfadeout_delay: 250,        // wait AFTER reaching full black

    respect_reduced_motion: true,
  };

  // ───────────────────────────────────────────────────────────────
  // Internals (private helpers)
  // ───────────────────────────────────────────────────────────────
  const prefersReducedMotion =
    config.respect_reduced_motion &&
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  const wait = (ms) => new Promise(r => setTimeout(r, prefersReducedMotion ? 0 : ms));

  function ensureOverlay(id = config.overlay_id) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.setAttribute('aria-hidden', 'true');
      Object.assign(el.style, {
        position: 'fixed',
        inset: '0',
        background: config.overlay_color,
        opacity: '1',                // default creation is black
        pointerEvents: 'none',       // we set to 'auto' while animating
        zIndex: String(config.overlay_zindex),
        transition: 'opacity 0ms ease', // duration set per call
      });
      // make sure <body> exists before prepend
      if (document.body) document.body.prepend(el);
      else document.addEventListener('DOMContentLoaded', () => document.body.prepend(el), { once: true });
    }
    return el;
  }

  function removeOverlay(id = config.overlay_id) {
    const el = document.getElementById(id);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function numberOpt(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  // ───────────────────────────────────────────────────────────────
  // Public API (what other code can call)
  // ───────────────────────────────────────────────────────────────

  /**
   * Fade IN: black → transparent, then (small delay) remove overlay.
   * Blocks input during the animation; unblocks and removes at the end.
   */
  async function fadeIn(opts = {}) {
    const id        = opts.overlay_id || config.overlay_id;
    const duration  = numberOpt(opts.fadein_duration,  config.fadein_duration);
    const delayAfter= numberOpt(opts.afterfadein_delay, config.afterfadein_delay);

    const el = ensureOverlay(id);
    el.style.background   = opts.overlay_color || config.overlay_color;
    el.style.zIndex       = String(opts.overlay_zindex ?? config.overlay_zindex);
    el.style.transition   = `opacity ${prefersReducedMotion ? 0 : duration}ms ease`;

    // start at black and block input
    el.style.opacity       = '1';
    el.style.pointerEvents = 'auto';

    // next frame → fade to transparent
    requestAnimationFrame(() => { el.style.opacity = '0'; });

    await wait(duration);

    // animation done—stop blocking immediately, then remove after small cushion
    el.style.pointerEvents = 'none';
    await wait(delayAfter);
    removeOverlay(id);
  }

  /**
   * Fade OUT: (fadeout_delay) → create overlay at 0 → animate to 1 → (afterfadeout_delay).
   * Leaves the overlay on screen (black). Unblocks input at the very end.
   * (Call fadeIn() later when you want to reveal again.)
   */
  async function fadeOut(opts = {}) {
    const id          = opts.overlay_id || config.overlay_id;
    const duration    = numberOpt(opts.fadeout_duration,      config.fadeout_duration);
    const delayBefore = numberOpt(opts.fadeout_delay,         config.fadeout_delay);
    const delayAfter  = numberOpt(opts.afterfadeout_delay,    config.afterfadeout_delay);

    await wait(delayBefore);

    const el = ensureOverlay(id);
    el.style.background   = opts.overlay_color || config.overlay_color;
    el.style.zIndex       = String(opts.overlay_zindex ?? config.overlay_zindex);
    el.style.transition   = `opacity ${prefersReducedMotion ? 0 : duration}ms ease`;

    // start transparent and block input during fade
    el.style.opacity       = '0';
    el.style.pointerEvents = 'auto';

    // force layout then animate to black
    void el.offsetWidth;
    requestAnimationFrame(() => { el.style.opacity = '1'; });

    await wait(duration);
    await wait(delayAfter);

    // fade-out complete; keep overlay, but stop blocking input
    el.style.pointerEvents = 'none';
  }

  /** Update defaults at runtime */
  function setConfig(partial = {}) { Object.assign(config, partial); }

  const fade = { config, setConfig, fadeIn, fadeOut };
  window.Site.effects = Object.assign(window.Site.effects || {}, { fade });
})();
