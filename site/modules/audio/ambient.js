window.Site = window.Site || {};
(function () {
  function initAudio() {
    const ambient = document.getElementById('ambientMusic');
    if (!ambient) return;
    ambient.volume = 0.3;
    const start = () => ambient.play().catch(() => {});
    window.addEventListener('load', start);
    ['click','keydown','touchstart'].forEach(evt =>
      document.addEventListener(evt, () => ambient.play().catch(() => {}), { once: true })
    );
  }
  window.Site.audio = { initAudio };
})();
