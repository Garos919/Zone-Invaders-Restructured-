// modules/effects/particles.js
// Reusable particle bursts with a clean config + small public API.
//
// Usage examples:
//   // 1) Burst at coordinates
//   Site.effects.particles.burst({ x: 400, y: 300 });
//
//   // 2) Burst from a button center with custom color/count/speed
//   Site.effects.particles.burstFromElement(myBtn, {
//     colors: ['#0ff', '#fff'],
//     count: 120,
//     speed: [8, 20],
//     glow: true
//   });
//
//   // 3) Directional burst (30° cone), heavier gravity
//   Site.effects.particles.burst({ x: 200, y: 200, spread: 30, baseAngle: -90, gravity: 0.25 });
//
//   // 4) Fly-to target (all particles head toward a point)
//   Site.effects.particles.burst({ x: 200, y: 200, to: { x: 800, y: 300 }, speed: [10, 14] });
//
//   // 5) Update defaults at runtime
//   Site.effects.particles.setConfig({ colors: '#fff', count: 80 });

window.Site = window.Site || {};
(function () {
  // ───────────────────────────────────────────────────────────────
  // CONFIG (override via setConfig or per-call options)
  // ───────────────────────────────────────────────────────────────
  const config = {
    // Visuals
    colors: ['#ffffff'],   // string or array of strings
    shape: 'square',       // 'square' | 'circle'
    size: [3, 4],          // px, range [min, max]
    glow: true,            // drop-shadow glow
    zIndex: 10000,

    // Emission
    count: 160,            // particles per burst
    speed: [8, 23],        // px/frame initial speed range
    spread: 360,           // degrees cone width (360 = radial)
    baseAngle: 0,          // degrees center of the cone (0 = right, -90 = up)
    to: null,              // optional { x, y } target point (overrides spread)

    // Motion
    gravity: 0,            // px/frame^2 downward acceleration
    drag: 0.98,            // velocity multiplier per frame (0.98 ~ light air drag)
    jitter: 0,             // small random noise per frame added to vx/vy

    // Lifetime
    lifetime: 1200,        // ms total lifetime
    fade: true,            // fade alpha to 0 across lifetime

    // Accessibility
    respect_reduced_motion: true
  };

  // ───────────────────────────────────────────────────────────────
  // Internals (private state + helpers)
  // ───────────────────────────────────────────────────────────────
  const prefersReducedMotion =
    config.respect_reduced_motion &&
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  const live = [];       // active particles
  let rafId = null;      // global RAF loop id

  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const toRad = (deg) => (deg * Math.PI) / 180;

  function startLoop() {
    if (rafId) return;
    let prev = performance.now();
    const tick = (now) => {
      rafId = requestAnimationFrame(tick);
      const dt = Math.min(48, now - prev); // cap delta for stability
      prev = now;

      for (let i = live.length - 1; i >= 0; i--) {
        const p = live[i];
        const lifeP = Math.min(1, (now - p.birth) / p.lifetime);

        // Integrate velocity → position
        if (p.gravity) p.vy += p.gravity;
        if (p.jitter) {
          p.vx += (Math.random() - 0.5) * p.jitter;
          p.vy += (Math.random() - 0.5) * p.jitter;
        }
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.x += p.vx;
        p.y += p.vy;

        // Style updates
        if (p.fade) p.el.style.opacity = String(1 - lifeP);
        p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;

        // Reap
        if (lifeP >= 1) {
          p.el.remove();
          live.splice(i, 1);
        }
      }

      if (!live.length) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
    rafId = requestAnimationFrame(tick);
  }

  function elementCenter(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function makeParticleElement(opts) {
    const el = document.createElement('div');
    const size = Math.round(rand(...(Array.isArray(opts.size) ? opts.size : [opts.size, opts.size])));

    el.style.position = 'fixed';
    el.style.left = '0';
    el.style.top = '0';
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.pointerEvents = 'none';
    el.style.willChange = 'transform, opacity';
    el.style.zIndex = String(opts.zIndex);

    // Color
    const color = Array.isArray(opts.colors) ? pick(opts.colors) : opts.colors;
    el.style.backgroundColor = color;

    // Shape
    if (opts.shape === 'circle') {
      el.style.borderRadius = '50%';
    }

    // Glow
    if (opts.glow) {
      el.style.boxShadow = `0 0 ${Math.max(5, size * 1.5)}px ${color}, 0 0 ${Math.max(10, size * 3)}px ${color}`;
    }

    // Initial transform + opacity
    el.style.transform = `translate3d(${opts.x}px, ${opts.y}px, 0)`;
    el.style.opacity = '1';

    document.body.appendChild(el);
    return el;
  }

  function createParticle(base, now) {
    const useTarget = !!base.to;
    let angle, speed;

    if (useTarget) {
      // Head toward target — normalize vector and scale by speed
      const dx = base.to.x - base.x;
      const dy = base.to.y - base.y;
      const dist = Math.max(0.0001, Math.hypot(dx, dy));
      angle = Math.atan2(dy, dx);
      speed = rand(...base.speed);
      return {
        el: makeParticleElement(base),
        x: base.x, y: base.y,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        birth: now,
        lifetime: base.lifetime,
        gravity: base.gravity,
        drag: base.drag,
        jitter: base.jitter,
        fade: base.fade
      };
    }

    // Radial / cone emission
    const half = base.spread / 2;
    angle = toRad(base.baseAngle + rand(-half, half));
    speed = rand(...base.speed);

    return {
      el: makeParticleElement(base),
      x: base.x, y: base.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      birth: now,
      lifetime: base.lifetime,
      gravity: base.gravity,
      drag: base.drag,
      jitter: base.jitter,
      fade: base.fade
    };
  }

  // ───────────────────────────────────────────────────────────────
  // Public API
  // ───────────────────────────────────────────────────────────────

  /**
   * Emit a burst of particles at (x, y).
   * All options override defaults from config.
   */
  function burst(options) {
    if (prefersReducedMotion) return; // respect user setting

    const now = performance.now();
    const opts = Object.assign({}, config, options);

    const count = Math.max(1, Math.round(opts.count));
    for (let i = 0; i < count; i++) {
      live.push(createParticle(opts, now));
    }
    startLoop();
  }

  /**
   * Emit a burst at the visual center of a DOM element.
   */
  function burstFromElement(el, options) {
    const { x, y } = elementCenter(el);
    burst(Object.assign({}, options, { x, y }));
  }

  /**
   * Update default config at runtime.
   */
  function setConfig(partial = {}) {
    Object.assign(config, partial);
  }

  window.Site.effects = Object.assign(window.Site.effects || {}, {
    particles: { config, setConfig, burst, burstFromElement }
  });
})();
