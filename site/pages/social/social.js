// ───────────────────────────────────────────────────────────────
// Background controller
// Per-page overrides for /site/modules/effects/background.js
// We start from the module defaults and override only what we need.
// ───────────────────────────────────────────────────────────────
const bg = window.Site?.effects?.background;

const SOCIAL_BG_CONFIG = bg
  ? bg.createConfig({
      // ── Toggles for features ─────────────────────────────────
      enable_code_bg:     true,   // scrolling code wall
      enable_ascii_stars: true,   // drifting ASCII symbols
      enable_error_lines: false,  // no red error lines on this page

      // You can override anything else here if you want:
      // code_scroll_speed: 16,
      // stars_count: 60,
      // code_color: '#0ff',
    })
  : {};


// ───────────────────────────────────────────────────────────────
// AUDIO + PAGE FX
// ───────────────────────────────────────────────────────────────

// Start ambient music
const ambientMusic = document.getElementById('ambientMusic');
const hoverSound = document.getElementById('hoverSound');
ambientMusic.volume = 0.3;

const startMusic = () => {
  ambientMusic.play().catch(e => console.log('Autoplay prevented:', e));
};

// Page load fade-in effect, music, and background init
window.addEventListener('load', () => {
  startMusic();

  // Init shared background system just for this page
  if (window.Site && window.Site.effects && window.Site.effects.background) {
    window.Site.effects.background.init(SOCIAL_BG_CONFIG);
  }

  const fadeOverlay = document.getElementById('fadeOverlay');
  if (fadeOverlay) {
    setTimeout(() => {
      fadeOverlay.classList.add('fade-out');
    }, 100);
  }
});

// Ensure music plays on any user interaction
const ensureMusicPlaying = () => {
  if (ambientMusic.paused) {
    ambientMusic.play().catch(e => {});
  }
};

document.addEventListener('click', ensureMusicPlaying, { once: true });
document.addEventListener('keydown', ensureMusicPlaying, { once: true });
document.addEventListener('touchstart', ensureMusicPlaying, { once: true });

// Add hover sound to all social links and back button
document.querySelectorAll('.social-link, .back-button').forEach(link => {
  link.addEventListener('mouseenter', () => {
    if (hoverSound) {
      hoverSound.currentTime = 0;
      hoverSound.volume = 0.3;
      hoverSound.play().catch(e => {});
    }
  });
});

// Optional: keep this if you want to force-start music immediately
startMusic();

// ───────────────────────────────────────────────────────────────
// NOTE: Old manual code background + stars were removed:
//  - NO more codeBg text generation
//  - NO more `for (let i = 0; i < 80; i++) { ... star ... }`
// The shared /site/modules/effects/background.js now owns all that.
// ───────────────────────────────────────────────────────────────
