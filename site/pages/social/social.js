// ───────────────────────────────────────────────────────────────
// BACKGROUND CONFIG FOR THIS PAGE
// This is your "background" box: control everything from here.
// All keys are optional overrides for /modules/effects/background.js
// ───────────────────────────────────────────────────────────────
const SOCIAL_BG_CONFIG = {
  // --- Feature toggles ---
  enable_code_bg: true,    // scrolling code wall
  enable_ascii_stars: true, // drifting ascii symbols
  enable_error_lines: false,// scattered error lines

  // --- CODE BG (scrolling) ---
  // If you ever turn enable_code_bg: true, these apply:
  code_font_size: 15,       // px
  code_line_height: 15,     // px
  code_opacity: 0.15,
  code_lines_extra: 10,     // offscreen buffer lines above/below
  code_color: '#0f0',
  code_scroll_speed: 22,    // px/sec downward (0 = no movement)

  // You could also override code_templates here if you want a
  // different "script" for this page:
  // code_templates: [
  //   'console.log("Hello from SOCIAL page");',
  //   ...
  // ],

  // --- ASCII STARS ---
  stars_count: 80,          // how many symbols to spawn
  star_symbols: ['(', ')', '{', '}', '[', ']', '<', '>', '/', '\\', '|', ';', ':', '.', ',', '=', '+', '-', '*', '&', '%', '$', '#', '@', '!', '?', '"', "'", '`'],
  star_font_min: 8,
  star_font_max: 18,
  star_anim_delay_max: 3,   // seconds (for twinkle CSS animation)

  // --- ERROR LINES ---
  // Only used if enable_error_lines: true
  errors_count: 18,
  errors_font_min: 8,
  errors_font_max: 12,
  errors_opacity_min: 0.3,
  errors_opacity_max: 0.6,
  // errors_messages: [ ... ] // you can override the whole list if you want
};

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
