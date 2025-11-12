// === CONTROL BOX (Boom effect tuning) ============================
export const BOOM_CFG = {
  particles: 140,
  sizePx: 4,
  maxSpeed: 16,
  glow: true,
  svgFlashMs: 500
};

/**
 * Spawns a particle burst + star flash exactly at viewport coords (clientX/Y).
 * STAR FIX: the SVG is centered via its own `transform: translate(-50%,-50%)`
 * inside a 0×0 fixed container placed at (x,y) — same strategy as your original.
 */
export function boomAt(x, y, {
  particles = BOOM_CFG.particles,
  sizePx    = BOOM_CFG.sizePx,
  maxSpeed  = BOOM_CFG.maxSpeed,
  glow      = BOOM_CFG.glow,
} = {}) {

  // ---- PARTICLES (centered around the point) --------------------
  const origin = document.createElement('div');
  origin.style.position = 'fixed';
  origin.style.left = x + 'px';
  origin.style.top  = y + 'px';
  origin.style.width = '0';
  origin.style.height = '0';
  origin.style.pointerEvents = 'none';
  origin.style.zIndex = '9999';
  document.body.appendChild(origin);

  const parts = [];
  for (let i = 0; i < particles; i++) {
    const d = document.createElement('div');
    d.style.position = 'absolute';
    d.style.left = '0';
    d.style.top  = '0';
    d.style.width = sizePx + 'px';
    d.style.height = sizePx + 'px';
    d.style.background = '#fff';
    d.style.pointerEvents = 'none';
    if (glow) d.style.boxShadow = '0 0 6px #fff, 0 0 14px #fff';
    origin.appendChild(d);

    const ang = Math.random() * Math.PI * 2;
    const spd = 6 + Math.random() * maxSpeed;
    parts.push({ el: d, tx: 0, ty: 0, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd });
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

  // ---- STAR FLASH (exactly like your original centering) --------
  const flash = document.createElement('div');
  flash.style.position = 'fixed';
  flash.style.left = x + 'px';
  flash.style.top  = y + 'px';
  flash.style.width = '0';
  flash.style.height = '0';
  flash.style.pointerEvents = 'none';
  flash.style.zIndex = '10000';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '1000');
  svg.setAttribute('height', '400');
  svg.setAttribute('viewBox', '0 0 1000 400');
  // center the SVG itself (this is the crucial fix)
  svg.style.position = 'absolute';
  svg.style.left = '50%';
  svg.style.top  = '50%';
  svg.style.transform = 'translate(-50%, -50%)';
  svg.style.filter = 'drop-shadow(0 0 20px #fff) drop-shadow(0 0 40px #fff)';

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const cx = 500, cy = 200;
  const d = `
    M ${cx},${cy - 200}
    Q ${cx + 50},${cy - 50} ${cx + 450},${cy}
    Q ${cx + 50},${cy + 50} ${cx},${cy + 200}
    Q ${cx - 50},${cy + 50} ${cx - 450},${cy}
    Q ${cx - 50},${cy - 50} ${cx},${cy - 200}
    Z
  `;
  path.setAttribute('d', d);
  path.setAttribute('fill', '#fff');
  svg.appendChild(path);

  flash.appendChild(svg);
  document.body.appendChild(flash);

  // Web Animations API version of your starBurst keyframes
  const anim = svg.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0.1)', opacity: 1, filter: 'drop-shadow(0 0 20px #fff) drop-shadow(0 0 40px #fff)' },
      { transform: 'translate(-50%, -50%) scale(1.0)', opacity: 1, filter: 'drop-shadow(0 0 60px #fff) drop-shadow(0 0 120px #fff) drop-shadow(0 0 200px #fff)' },
      { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 0, filter: 'drop-shadow(0 0 40px #fff) drop-shadow(0 0 80px #fff)' }
    ],
    { duration: BOOM_CFG.svgFlashMs, easing: 'ease-out', fill: 'forwards' }
  );
  anim.onfinish = () => flash.remove();
}
