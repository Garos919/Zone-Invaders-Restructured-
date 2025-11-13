window.Site = window.Site || {};
(function () {
  function initHomeUI() {
    const hoverSound = document.getElementById('hoverSound');
    const gameBtn = document.getElementById('gameButton');
    const linkBtn = document.getElementById('linktreeButton');

    const playHover = (vol=0.3) => {
      if (!hoverSound) return;
      hoverSound.currentTime = 0;
      hoverSound.volume = vol;
      hoverSound.play().catch(() => {});
    };

    // Game button hovers/click
    if (gameBtn) {
      gameBtn.addEventListener('mouseenter', () => {
        playHover(0.3);
        window.AriHome?.onGameButtonHover?.();
      });
      gameBtn.addEventListener('mouseleave', () => window.AriHome?.onGameButtonLeave?.());
      gameBtn.addEventListener('click', (e) => {
        e.preventDefault();
        gameBtn.style.pointerEvents = 'none';
        window.AriHome?.onGameButtonClick?.();

 // flash star like the original + hide the button for drama
  gameBtn.style.opacity = '0';
  window.Site.effects?.createStarFlash?.(gameBtn);
        
        // sound fade
        const boom = document.getElementById('massExplosionSound');
        if (boom) {
          boom.currentTime = 0;
          boom.volume = 0.5;
          boom.play().catch(() => {});
          setTimeout(() => {
            const start = Date.now(), dur = 500, v0 = boom.volume;
            const fade = () => {
              const p = Math.min((Date.now()-start)/dur, 1);
              boom.volume = v0 * (1 - p);
              if (p < 1) requestAnimationFrame(fade);
              else { boom.pause(); boom.currentTime = 0; }
            };
            requestAnimationFrame(fade);
          }, 2000);
        }

        // particles + fade-out + nav
        window.Site.effects?.createButtonExplosion?.(gameBtn);
        const go = () => location.href = '../../../game/game.html';
        window.Site.effects?.fadeOutThen ? window.Site.effects.fadeOutThen(go) : go();
      });
    }

    // Linktree hovers
    if (linkBtn) {
      linkBtn.addEventListener('mouseenter', () => {
        playHover(0.2);
        window.AriHome?.onLinktreeHover?.();
      });
      linkBtn.addEventListener('mouseleave', () => window.AriHome?.onLinktreeLeave?.());
      // No click handler: plain anchor handles nav (path already fixed to ../social/social-index.html)
    }
  }

  window.Site.ui = { initHomeUI };
})();
