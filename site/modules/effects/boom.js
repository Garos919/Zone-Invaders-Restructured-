// === CONTROL BOX (Boom effect tuning) ============================
export const BOOM_CFG = {
  particles: 140,
  sizePx: 4,
  maxSpeed: 16,
  glow: true,
  svgFlashMs: 500
};

/**
 * Spawns a centered particle + flash boom at viewport coords (clientX/Y).
 * Uses a fixed-position origin wrapper at (x,y) with translate(-50%,-50%)
 * so everything is truly centered visually—even with different particle sizes.
 */
export function boomAt(x, y, {
  particles = BOOM_CFG.particles,
  sizePx    = BOOM_CFG.sizePx,
  maxSpeed  = BOOM_CFG.maxSpeed,
  glow      = BOOM_CFG.glow,
} = {}) {

  // Origin wrapper, centered at (x,y) in the viewport
  const origin = document.createElement('div');
  origin.style.position = 'fixed';
  origin.style.left = x + 'px';
  origin.style.top  = y + 'px';
  origin.style.transform = 'translate(-50%, -50%)';
  origin.style.width = '0';
  origin.style.height = '0';
  origin.style.pointerEvents = 'none';
  origin.style.zIndex = '20001'; // above fade overlay
  document.body.appendChild(origin);

  const parts = [];

  // Create particles positioned relative to origin center
  for (let i = 0; i < particles; i++) {
    const d = document.createElement('div');
    d.style.position = 'absolute';
    d.style.left = '0';
    d.style.top = '0';
    d.style.width = sizePx + 'px';
    d.style.height = sizePx + 'px';
    d.style.background = '#fff';
    d.style.pointerEvents = 'none';
    if (glow) d.style.boxShadow = '0 0 6px #fff, 0 0 14px #fff';
    origin.appendChild(d);

    const ang = Math.random() * Math.PI * 2;
    const spd = 6 + Math.random() * maxSpeed;

    // Track offsets from the origin center; we render via CSS transform
    parts.push({
      el: d,
      tx: 0, ty: 0,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd
    });
  }

  const t0 = performance.now();
  const dur = 1100;

  (function tick(now) {
    const k = Math.min(1, (now - t0) / dur);
    for (const p of parts) {
      p.tx += p.vx;
      p.ty += p.vy;
      p.el.style.transform = `translate(${p.tx}px, ${p.ty}px)`;
      p.el.style.opacity = (1 - k).toString();
    }
    if (k < 1) requestAnimationFrame(tick);
    else origin.remove();
  })(t0);

  // Centered 4-point flash (curved) at the same origin
  const flash = document.createElement('div');
  flash.style.position = 'fixed';
  flash.style.left = x + 'px';
  flash.style.top = y + 'px';
  flash.style.transform = 'translate(-50%, -50%)';
  flash.style.width = '0';
  flash.style.height = '0';
  flash.style.zIndex = '20002'; // above particles and overlay
  flash.style.pointerEvents = 'none';
  flash.innerHTML = `<svg width="900" height="360" viewBox="0 0 900 360">
    <path d="M450,10 Q500,140 850,180 Q500,220 450,350 Q400,220 50,180 Q400,140 450,10 Z" fill="#fff"/>
  </svg>`;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), BOOM_CFG.svgFlashMs);
}
