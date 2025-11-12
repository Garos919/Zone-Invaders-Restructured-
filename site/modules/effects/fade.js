// === CONTROL BOX (fade) ===========================================
export const FADE_CFG = {
  overlayId: 'fadeOverlay',
  fadeOutMs: 800,  // to transparent on load
  navFadeMs: 800,  // to black on navigation
};

// === API ==========================================================
export function initFade() {
  const el = document.getElementById(FADE_CFG.overlayId);
  if (!el) return;

  // if page came from bfcache, ensure we start from black again then fade out
  requestAnimationFrame(() => {
    // kick the fade to transparent
    el.classList.add('fade-out');
  });
}

export function fadeOutAndNavigate(href, duration = FADE_CFG.navFadeMs) {
  const el = document.getElementById(FADE_CFG.overlayId);
  if (!el) { window.location.href = href; return; }

  // remove fade-out so it goes back to opaque black
  el.classList.remove('fade-out');

  // after the transition, navigate
  setTimeout(() => {
    window.location.href = href;
  }, duration);
}
