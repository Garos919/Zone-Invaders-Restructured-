// === CONTROL BOX (ambient) =======================================
export const AMBIENT_CFG = {
  elementId: 'ambientMusic',
  defaultVolume: 0.30,
  fadeMs: 800,
};

let _el = null;

function resolveEl() {
  if (_el) return _el;
  _el = document.getElementById(AMBIENT_CFG.elementId);
  return _el;
}

// === API ==========================================================
export function setAmbientSrc(src) {
  const el = resolveEl();
  if (!el || !src) return;
  if (el.getAttribute('src') !== src) {
    el.setAttribute('src', src);
    try { el.load(); } catch {}
  }
  el.volume = AMBIENT_CFG.defaultVolume;
}

export function startAmbient() {
  const el = resolveEl();
  if (!el) return;
  el.volume = AMBIENT_CFG.defaultVolume;
  const p = el.play();
  if (p && typeof p.catch === 'function') p.catch(()=>{});
}

export function fadeInAmbient(duration = AMBIENT_CFG.fadeMs, targetVol = AMBIENT_CFG.defaultVolume) {
  const el = resolveEl();
  if (!el) return;
  el.volume = 0;
  const steps = 60;
  const dt = duration / steps;
  const dv = targetVol / steps;
  let i = 0;
  const tick = () => {
    i++;
    el.volume = Math.min(targetVol, el.volume + dv);
    if (i < steps) setTimeout(tick, dt);
  };
  startAmbient();
  setTimeout(tick, dt);
}

export function stopAmbient() {
  const el = resolveEl();
  if (!el) return;
  try { el.pause(); } catch {}
}

export function fadeOutAmbient(duration = AMBIENT_CFG.fadeMs) {
  const el = resolveEl();
  if (!el) return;
  const start = el.volume;
  const steps = 60;
  const dt = duration / steps;
  const dv = start / steps;
  let i = 0;
  const tick = () => {
    i++;
    el.volume = Math.max(0, el.volume - dv);
    if (i < steps) setTimeout(tick, dt);
    else { try { el.pause(); } catch {}; }
  };
  setTimeout(tick, dt);
}
