
    // Start ambient music
    const ambientMusic = document.getElementById('ambientMusic');
    const hoverSound = document.getElementById('hoverSound');
    ambientMusic.volume = 0.3;
    
    const startMusic = () => {
      ambientMusic.play().catch(e => console.log('Autoplay prevented:', e));
    };
    
    // Page load fade-in effect and music
    window.addEventListener('load', () => {
      startMusic();
      
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
    
    startMusic();
    
    // Generate unfinished code background
    const codeLines = [
      'const socialMedia = { platforms: ["Instagram", "YouTube", "TikTok", "X"] };',
      'function connectWithCreator() { return "Follow for updates!"; }',
      'class SocialNetwork { constructor(handle) { this.followers = "growing"; } }',
      'const devLife = { coding: true, creating: true, sharing: true };',
      'async function loadContent() { return await fetch("/api/latest-posts"); }',
      'const creator = { name: "Nicholas Garos", passion: "development" };',
      '// Building connections one follower at a time',
      'export default { instagram: "@1mb_memory", youtube: "@1MB_Memory" };',
      'const engagement = followers.map(f => f.interact());',
      'if (interested) { clickFollow(); } else { keepBrowsing(); }',
      'function shareContent() { return "Spread the digital word!"; }',
      'const community = users.filter(u => u.isAwesome === true);',
      '// Social media: where code meets creativity',
      'const platforms = ["📷", "📺", "🎵", "🐦"].map(icon => icon);',
      'function buildFollowing() { return consistency + quality; }'
    ];
    
    const codeBg = document.getElementById('codeBg');
    let bgText = '';
    const lines = Math.floor(window.innerHeight / 14) + 10;
    
    for (let i = 0; i < lines; i++) {
      const randomLine = codeLines[Math.floor(Math.random() * codeLines.length)];
      const indent = '  '.repeat(Math.floor(Math.random() * 4));
      bgText += indent + randomLine + '\n';
    }
    
    codeBg.textContent = bgText;
    
    // Coding symbols for stars
    const codeSymbols = ['(', ')', '{', '}', '[', ']', '<', '>', '/', '\\', '|', ';', ':', '.', ',', '=', '+', '-', '*', '&', '%', '$', '#', '@', '!', '?', '"', "'", '`'];
    
    // Generate stars
    for (let i = 0; i < 80; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.textContent = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];
      star.style.fontSize = (Math.random() * 10 + 8) + 'px';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 3 + 's';
      document.body.appendChild(star);
    }
  