// /site/page/home/home.js
// Bootstraps the Home page: audio, background effects, fade-in on load,
// and fade-out navigation for the two main buttons. Also boots A.R.I.

(function () {
  // ---- 1) Audio -------------------------------------------------------------
  try {
    // Provided by /site/modules/audio/ambient.js
    window.Site?.audio?.initAudio?.();
  } catch (e) {
    // console.warn('[home] audio init failed', e);
  }

  // ---- 2) Background layers (code wall, stars, scattered errors) -----------
  try {
    // Provided by /site/modules/effects/background.js
    // Toggle/override counts here as needed.
    window.Site?.effects?.background?.init({
      enable_code_bg: true,
      enable_error_lines: true,
      enable_ascii_stars: true,
      stars_count: 80,  // matches your previous setup
      errors_count: 20  // close to the number of hardcoded lines you had
    });
  } catch (e) {
    // console.warn('[home] background init failed', e);
  }

  // ---- 3) Fade-in on load (black -> transparent, then remove overlay) ------
  try {
    // Provided by /site/modules/effects/fade.js
    // Small rAF to ensure the overlay is in the DOM before we animate.
    requestAnimationFrame(() => {
      window.Site?.effects?.fade?.fadeIn?.({
        // Keep your defaults, override here if you want:
        // fadein_duration: 500,
      });
    });
  } catch (e) {
    // console.warn('[home] fade-in failed', e);
  }

  // ---- 4) Wire buttons to fade-out navigation ------------------------------
  function wireNavWithFade(anchor, fadeOptions) {
    if (!anchor) return;

    anchor.addEventListener('click', async (e) => {
      // Let modifier-clicks open in new tab/window
      if (anchor.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      e.preventDefault();

      try {
        // Fade out to black, then proceed
        await window.Site?.effects?.fade?.fadeOut?.(Object.assign({
          // Defaults—tweak as desired:
          fadeout_delay: 0,         // wait before starting fade-out
          fadeout_duration: 500,    // transparent -> black
          afterfadeout_delay: 100   // wait at full black before continuing
        }, fadeOptions || {}));
      } catch (err) {
        // If fade fails, still proceed
      }

      // Now navigate
      window.location.href = anchor.href;
    }, { passive: false });
  }

  // ---- 5) When DOM is ready, attach handlers + boot UI + A.R.I. ------------
  document.addEventListener('DOMContentLoaded', () => {
    // Buttons
    const gameBtn = document.getElementById('gameButton');
    const linkBtn = document.getElementById('linktreeButton');

    // Apply the same fade-out on both buttons (no particles per your request)
    wireNavWithFade(gameBtn, {
      // Example: slightly longer after-black before we switch pages for the game
      afterfadeout_delay: 150
    });
    wireNavWithFade(linkBtn);

    // UI hooks for hover reactions, etc. (from /site/modules/ui/home-ui.js)
    try {
      window.Site?.ui?.initHomeUI?.();
    } catch (e) {
      // console.warn('[home] ui init failed', e);
    }

    // Boot A.R.I. (dialogue/jokes paths relative to /site/page/home/)
    try {
      window.AriHome?.init?.({
        dialogueSrc: '../../../game/entities/ari/ari_dialogue.js',
        jokesSrc: '../../../game/entities/ari/ari_jokes.js'
      });
    } catch (e) {
      // console.warn('[home] A.R.I. init failed', e);
    }
  });
})();
