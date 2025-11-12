// === CONTROL BOX (Home boot options) ==============================
export const HOME_CFG = {
  startAmbientOnLoad: true,
  resumeOnInteraction: true,

  // Page-local audio sources (relative to THIS page URL)
  audio: {
    ambient: '../../../game/assets/audio/under-construction.mp3',
    hover:   '../../../game/assets/audio/hover2.mp3',
    boom:    '../../../game/assets/audio/mass--explosion.mp3',
  },
};

// === Boot =========================================================
import { initFade } from '../../modules/effects/fade.js';
import { startAmbient, setAmbientSrc } from '../../modules/audio/ambient.js';
import { wireButtons } from '../../modules/ui/buttons.js';
import { initSfx, SFX } from '../../modules/audio/sfx.js';

function boot() {
  // 1) Fade overlay wiring (also triggers initial fade-out)
  initFade();

  // 2) Register SFX used on this page
  initSfx({
    hover: HOME_CFG.audio.hover,
    boom:  HOME_CFG.audio.boom,
  });

  // 3) Make sure SFX hover/boom are gesture-unlocked on first touch/key
  SFX.enableAutoplayUnlock();

  // 4) Ambient setup (+ optional autoplay)
  setAmbientSrc(HOME_CFG.audio.ambient);
  if (HOME_CFG.startAmbientOnLoad) startAmbient();

  // 5) Audio gesture fallback (mobile/safari)
  if (HOME_CFG.resumeOnInteraction) {
    const resume = () => {
      startAmbient();
      SFX.play('hover'); // primes a channel after a real gesture
    };
    window.addEventListener('pointerdown', resume, { once: true });
    window.addEventListener('keydown', resume, { once: true });
    window.addEventListener('touchstart', resume, { once: true, passive: true });
  }

  // 6) Buttons: hover SFX + boom SFX + particle + fade+nav
  wireButtons({ hoverName: 'hover', boomName: 'boom' });
}

window.addEventListener('load', boot);
