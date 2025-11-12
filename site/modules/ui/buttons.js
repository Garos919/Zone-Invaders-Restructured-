// site/modules/ui/buttons.js
import { SFX } from '../audio/sfx.js';
import { fadeOutAndNavigate } from '../effects/fade.js';
import { boomAt } from '../effects/boom.js';

const DEFAULTS = {
  hoverName: 'hover',
  boomName:  'boom',
  enableBoom: true,
  boomDelayMs: 900,
  fadeMs: 800
};

/**
 * Try to use a child marked as `.js-boom-origin`; if not present, union the
 * two lines "ZONE" + "INVADERS"; otherwise fall back to the link rect.
 */
function visualButtonRect(linkEl) {
  if (!linkEl) return null;

  const explicit = linkEl.querySelector('.js-boom-origin');
  if (explicit) return explicit.getBoundingClientRect();

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

  return linkEl.getBoundingClientRect();
}

/** Get clientX/Y; on iOS "click" after touch can be 0,0 -> fall back to rect center. */
function eventViewportXY(e, fallbackRect) {
  let x = e?.clientX ?? 0;
  let y = e?.clientY ?? 0;

  const t = e?.changedTouches?.[0] ?? e?.touches?.[0];
  if ((x === 0 && y === 0) && t) {
    x = t.clientX;
    y = t.clientY;
  }

  if ((!x && !y) && fallbackRect) {
    x = fallbackRect.left + fallbackRect.width  / 2;
    y = fallbackRect.top  + fallbackRect.height / 2;
  }
  return [x, y];
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

      const rect = visualButtonRect(gameLink);
      const [cx, cy] = eventViewportXY(e, rect);

      if (opts.enableBoom) boomAt(cx, cy);
      if (opts.boomName)   SFX.play(opts.boomName);

      setTimeout(() => fadeOutAndNavigate(href, opts.fadeMs), opts.boomDelayMs);
    };

    gameLink.addEventListener('click', go);
    gameLink.addEventListener('touchend', go, { passive: false });
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
