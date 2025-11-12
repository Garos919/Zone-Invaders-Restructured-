// === CONTROL BOX (SFX routing/volumes) ============================
export const SFX_CFG = {
  volume: {
    hover: 0.28,
    boom:  0.55,
  },
  maxConcurrentPerKey: 3, // cap overlapping clones per sound
};

const _bank = new Map();   // key -> { src, pool: HTMLAudioElement[] }
let _unlocked = false;

// Pre-warm a pool so play() is instant
function ensurePool(key, src) {
  if (_bank.has(key)) return _bank.get(key);
  if (!src) return null;
  const a = new Audio(src);
  a.preload = 'auto';
  const entry = { src, pool: [a] };
  _bank.set(key, entry);
  return entry;
}

function getChannel(entry) {
  // reuse paused channel or clone up to the cap
  for (const a of entry.pool) if (a.paused) return a;
  if (entry.pool.length < Math.max(1, SFX_CFG.maxConcurrentPerKey | 0)) {
    const a = new Audio(entry.src);
    a.preload = 'auto';
    entry.pool.push(a);
    return a;
  }
  return entry.pool[0]; // steal oldest
}

/** Register/merge sound sources (e.g., { hover: 'x.mp3', boom: 'y.mp3' }) */
export function initSfx(sources = {}) {
  Object.entries(sources).forEach(([key, src]) => {
    if (!src) return;
    ensurePool(key, src);
  });
}

/** Imperative play by key registered via initSfx */
export const SFX = {
  play(key) {
    const entry = _bank.get(key);
    if (!entry) return;
    const chan = getChannel(entry);
    chan.volume = SFX_CFG.volume[key] ?? 0.4;
    chan.currentTime = 0;
    chan.play().catch(() => {});
  },

  unlock() {
    if (_unlocked) return;
    _unlocked = true;
    _bank.forEach(({ pool }) => {
      pool.forEach(a => {
        const prev = a.volume;
        a.volume = 0;
        a.play().then(() => {
          a.pause();
          a.volume = prev;
        }).catch(() => {});
      });
    });
  },

  enableAutoplayUnlock() {
    const once = () => {
      SFX.unlock();
      window.removeEventListener('pointerdown', once);
      window.removeEventListener('keydown', once);
      window.removeEventListener('touchstart', once, { passive: true });
    };
    window.addEventListener('pointerdown', once);
    window.addEventListener('keydown', once);
    window.addEventListener('touchstart', once, { passive: true });
  }
};
