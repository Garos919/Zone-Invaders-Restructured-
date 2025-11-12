// site/modules/ui/buttons.js

import { SFX } from '../audio/sfx.js';
import { fadeOutAndNavigate } from '../effects/fade.js';
import { boomAt } from '../effects/boom.js';

const DEFAULTS = {
  hoverName: 'hover',
  boomName:  'boom',
  enableBoom: true,
  boomDelayMs: 900, // let particles + sfx breathe before fading out
  fadeMs: 800
};

/**
 * Returns a rect to use as the VISUAL boom origin for the "ZONE / INVADERS" logo.
 * Strategy:
 *   1) If a child with `.js-boom-origin` exists, use its rect.
 *   2) Else, find `.button-zone` and `.button-invaders`, union their rects.
 *   3) Else, fall back to the link's rect itself.
 */
function visualButtonRect(linkEl) {
  if (!linkEl) return null;

  // 1) explicit origin if user marks one
  const explicit = linkEl.querySelector('.js-boom-origin');
  if (explicit) return explicit.getBoundingClientRect();

  // 2) union of the two transformed lines (best match for your design)
  const z = linkEl.querySelector('.button-zone');
  const i = linkEl.querySelector('.button-invaders');
  if (z || i) {
    const zr = z ? z.getBoundingClientRect() : null;
    const ir = i ? i.getBoundingClientRect() : null;

    if (zr && !ir) return zr;
    if (!zr && ir) return ir;

    const left   = Math.min(zr.left,   ir.left);
    const top    = Math.min(zr.top,    ir.top);
    const right  = Math.max(zr.right,  ir.right);
    const bottom = Math.max(zr.bottom, ir.bottom);
    return { left, top, right, bottom, width: right - left, height: bottom - top };
  }

  // 3) fallback to anchor itself
  return linkEl.getBoundingClientRect();
}

/** center of a rect in viewport coords */
function rectCenter(r) {
  return [r.left + r.width / 2, r.top + r.height / 2];
}

export function wireButtons(cfg = {}) {
  const opts = { ...DEFAULTS, ...cfg };

  const gameLink   = document.querySelector('.js-game-link');
  const socialLink = document.querySelector('.js-social-link');
  const hoverTargets = [gameLink, socialLink].filter(Boolean);

  // hover/focus SFX
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => SFX.play(opts.hoverName));
    el.addEventListener('focus',      () => SFX.play(opts.hoverName));
    el.addEventListener('touchstart', () => SFX.play(opts.hoverName), { passive: true });
  });

  let navigating = false;

  if (gameLink) {
    const href = cfg.gameHref || gameLink.getAttribute('href');

    const go = (e) => {
      e.preventDefault();
      if (navigating) return;
      navigating = true;

      // Always derive the boom origin from the visual geometry, not event coords.
      const r = visualButtonRect(gameLink);
      const [cx, cy] = rectCenter(r);

      if (opts.enableBoom) boomAt(cx, cy);
      if (opts.boomName)   SFX.play(opts.boomName);

      setTimeout(() => fadeOutAndNavigate(href, opts.fadeMs), opts.boomDelayMs);
    };

    // Support both mouse and touch
    gameLink.addEventListener('click', go);
    gameLink.addEventListener('touchend', go);
  }

  if (socialLink) {
    const href = cfg.socialHref || socialLink.getAttribute('href');
    socialLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (navigating) return;
      navigating = true;
      fadeOutAndNavigate(href, opts.fadeMs);
    });
  }
}
