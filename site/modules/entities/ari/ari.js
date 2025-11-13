// site/modules/ari/home-ari.js
(function () {
  'use strict';

  // Guard so we don't double-init if the script is included twice
  if (window.AriHome && window.AriHome.__initialized) return;

  // ======= DOM Refs (resolved at init) =======
  let ariElement, ariBubble, coderflyElement, scoreBoard;
  let userScoreElement, ariScoreElement, scoreBoardFly, scoreBoardFly2;
  let ariTransitionSound;

  // Optional external data sources (set in init)
  let dialogueSrc = null;
  let jokesSrc = null;

  // ======= Dialogue / Jokes loaded from external files =======
  let ariDialogue = null; // object
  let ariJokes = [];      // array

  // ======= State =======
  const ariStates = {
    neutral:   { color: '#AEEFFF', face: '<(o-o)>' },
    happy:     { color: '#4DFFFF', face: '<(^-^)>' },
    sad:       { color: '#3B6BFF', face: '<(∪-∪)>' },
    angry:     { color: '#FF2B2B', face: '<(>-<)>' },
    surprised: { color: '#FFD94D', face: '<(O.O)>' },
    confused:  { color: '#D96BFF', face: '<(@_@)>' },
    annoyed:   { color: '#C97D44', face: '<(-_-)>' },
    worried:   { color: '#FFB64D', face: '<(o_O)>' },
    curious:   { color: '#4DFFBC', face: '<(°-°)>' },
    shocked:   { color: '#FFFFFF', face: '<(O-O)>' },
    corrupted: { color: '#A700FF', face: '<(#-#)>' },
    warning:   { color: '#FFC94D', face: '<(⚠-⚠)>' },
    glitch:    { color: '#FF00FF', face: '<(x_x)>' },
    error:     { color: '#FF1A1A', face: '<(!!!)>' }
  };

  const ariAnimations = {
    neutral_entry:   ['<(-.-)>', '<(._.)>', '<(o.o)>', '<(o-o)>'],
    happy_entry:     ['<(o-o)>', '<(o^o)>', '<(^_^)>', '<(^-^)>'],
    sad_entry:       ['<(o-o)>', '<(o∩o)>', '<(∪_∪)>', '<(∪-∪)>'],
    angry_entry:     ['<(o-o)>', '<(>_o)>', '<(>_O)>', '<(>-<)>'],
    surprised_entry: ['<(o-o)>', '<(O.o)>', '<(O_o)>', '<(O.O)>'],
    confused_entry:  ['<(o-o)>', '<(o@o)>', '<(o_o)>', '<(@_@)>'],
    annoyed_entry:   ['<(o-o)>', '<(-.-)>', '<(-_.)>', '<(-_-)>'],
    worried_entry:   ['<(o-o)>', '<(o_O)>', '<(O_o)>', '<(o_O)>'],
    curious_entry:   ['<(o-o)>', '<(o_o)>', '<(°_o)>', '<(°-°)>'],
    shocked_entry:   ['<(o-o)>', '<(O_o)>', '<(O0O)>', '<(O-O)>'],
    corrupted_entry: ['<(x_!)>', '<(=/0)>', '<(@_@)>', '<(x_x)>', '<(#x#)>', '<(#-#)>'],
    warning_entry:   ['<(o-o)>', '<(o⚠o)>', '<(⚠_⚠)>', '<(⚠-⚠)>'],
    glitch_entry:    ['<(o-o)>', '<(X-o)>', '<(x_X)>', '<(x_x)>'],
    error_entry:     ['<(o-o)>', '<(o!o)>', '<(!0!)>', '<(!!!)>']
  };

  const ariFallbackMessages = {
    neutral:   ['...', '0x00', '///', '___', ':::'],
    happy:     ['!^_^!', '^v^', '\\o/', ':D', '=D'],
    sad:       ['T_T', ';_;', 'v_v', '://'],
    angry:     ['#@$&*!', '>:(', 'X_X', '!!!'],
    surprised: ['!?!', '0_0', 'O.O', '?!?'],
    confused:  ['???', '?_?', 'huh?', '..?'],
    annoyed:   ['-_-', 'ugh', '...', 'meh'],
    worried:   ['oh n0', 'uh...', 'hmm', 'err'],
    curious:   ['???', 'wh@t?', 'hmm?', '0h?'],
    shocked:   ['!!!', '0MG', 'WH@T', '!?!?'],
    corrupted: ['#x#x#', '3rr0r', '$%#@', 'gl1tch'],
    warning:   ['!W@RN!', 'c@ut10n', '@l3rt', '!!!'],
    glitch:    ['#$%&*', 'gl!tch', 'x_X_x', '%#@'],
    error:     ['3RR0R', 'F@1L', '!!!', 'cr@sh']
  };

  const welcomeSequences = [
    [
      { state: 'curious',  message: 'H3y...', duration: 2000 },
      { state: 'confused', message: 'h@v3 1 s33n y0u b3f0r3?', duration: 3000 }
    ],
    [
      { state: 'curious',  message: 'Hmmm..', duration: 2000 },
      { state: 'confused', message: 'Us3r 1s th@t y0u?', duration: 2500 },
      { state: 'worried',  message: '1 c@n\'t h3@r y0u', duration: 2500 }
    ],
    [
      { state: 'neutral', message: 'uh.. h1', duration: 2000 },
      { state: 'happy',   message: '1\'m @.R.1.', duration: 2500 }
    ],
    [
      { state: 'neutral', message: '@ss1st@nt R3p@1r 1nt3rf@c3', duration: 3000 },
      { state: 'happy',   message: 'Th@t\'s m3 @lr1ght', duration: 2500 }
    ],
    [
      { state: 'curious', message: 'F1n@lly @ b31ng 0f 1nt3ll1g3nc3', duration: 3000 },
      { state: 'annoyed', message: '...m@yb3', duration: 2500 }
    ]
  ];

  // ======= Memory / personality =======
  const ariMemory = {
    pushedCount: 0,
    scaredCount: 0,
    ignoredCount: 0,
    interactionCount: 0,
    lastInteractionTime: Date.now(),
    getTrustLevel() {
      const negative = this.pushedCount + this.scaredCount;
      const positive = this.interactionCount;
      const ignored = this.ignoredCount;
      if (negative > 10) return -1;
      if (negative > 5) return -0.5;
      if (ignored > 8) return -0.3;
      if (positive > 10 && negative === 0) return 1;
      if (positive > 5) return 0.5;
      return 0;
    },
    getPersonalityMode() {
      const trust = this.getTrustLevel();
      const timeSince = Date.now() - this.lastInteractionTime;
      if (trust <= -0.7) return 'aggressive';
      if (trust <= -0.3 && this.pushedCount > this.scaredCount) return 'defensive';
      if (this.ignoredCount > 5 && timeSince > 60000) return 'neglected';
      if (trust >= 0.7) return 'friendly';
      if (trust >= 0.3) return 'playful';
      return 'neutral';
    }
  };

  // ======= Motion / behavior flags =======
  let ariCurrentState = 'neutral';
  let ariX = 150, ariY = 150;
  let ariMoving = false;
  let ariSpeed = 1;
  let ariTargetX = 150, ariTargetY = 150;

  let ariAnimating = false, ariAnimationFrames = [], ariCurrentFrame = 0, ariAnimationInterval = null;
  let ariBeingPushed = false;
  let ariPushCooldown = false;
  let ariPushReactionCooldown = false;
  let ariEmotionChangeCooldown = false;
  let ariInvestigatingMouse = false;
  let ariCirclingMouse = false;
  let ariCircleAngle = 0;
  let isHoveringButton = false;
  let shiverInterval = null;
  let ariPlayingMessageChain = false;
  let ariCurrentMessageType = null;
  let ariMessageTimeout = null;
  let ariIsPlayingWelcome = false;
  let welcomeTimeouts = [];

  // Mouse tracking
  let mouseX = -9999, mouseY = -9999;
  let lastMouseX = -9999, lastMouseY = -9999;
  let lastMouseMoveTime = 0;

  const lastShownMessages = {
    investigating: null,
    scared: null,
    scaredFollowup: null,
    buttonWarning: null,
    push: null
  };

  // ======= Utility =======
  const getEmotionalSpeedMultiplier = (state = ariCurrentState) => {
    const m = {
      angry: 1.8, annoyed: 1.4, shocked: 1.3, surprised: 1.2, happy: 1.1,
      neutral: 1.0, curious: 0.7, confused: 0.8, worried: 0.6, sad: 0.5,
      corrupted: 1.5, glitch: 1.6, error: 1.4, warning: 0.9
    };
    return m[state] ?? 1.0;
  };

  // ======= Dialogue helpers =======
  const getPushAwayMessage = () => {
    if (ariDialogue && ariDialogue.annoyed && ariDialogue.angry) {
      const cat = Math.random() < 0.5 ? 'annoyed' : 'angry';
      const messages = ariDialogue[cat].being_pushed;
      return { state: cat, message: messages[Math.floor(Math.random() * messages.length)] };
    }
    const fallbacks = [
      { state: 'annoyed', message: 'l3@v3 m3 b3' },
      { state: 'angry',  message: 'why @r3 y0u d01ng th1s?' },
      { state: 'annoyed', message: 'st0p 1t' }
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  const getInvestigatingMessage = () => {
    if (ariDialogue?.curious?.investigating_mouse) {
      const messages = ariDialogue.curious.investigating_mouse;
      const available = messages.filter(m => m !== lastShownMessages.investigating);
      const pool = available.length ? available : messages;
      const selected = pool[Math.floor(Math.random() * pool.length)];
      lastShownMessages.investigating = selected;
      return { state: 'curious', message: selected, duration: 3000 };
    }
    const fallbacks = [
      { state: 'curious', message: '@r3 y0u @l1v3 0ut th3r3?', duration: 3000 },
      { state: 'curious', message: 'sh0uld 1 t0uch th3 curs0r?', duration: 3000 }
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  const getScaredMessage = () => {
    if (ariDialogue && ariDialogue.shocked && ariDialogue.surprised) {
      const cat = Math.random() < 0.7 ? 'shocked' : 'surprised';
      const messages = ariDialogue[cat].scared_reactions;
      const available = messages.filter(m => m !== lastShownMessages.scared);
      const pool = available.length ? available : messages;
      const selected = pool[Math.floor(Math.random() * pool.length)];
      lastShownMessages.scared = selected;
      return { state: cat, message: selected };
    }
    const fallbacks = [
      { state: 'shocked', message: '@@AH! y0u sc@r3d m3!' },
      { state: 'shocked', message: 'WH0@! d0n\'t d0 th@t!' }
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  const getScaredFollowUpMessage = () => {
    if (ariDialogue && (ariDialogue.worried?.scared_followup || ariDialogue.confused?.scared_followup)) {
      const cat = Math.random() < 0.6 ? 'worried' : 'confused';
      const messages = (ariDialogue[cat]?.scared_followup) || ariDialogue.worried.scared_followup;
      if (messages?.length) {
        const available = messages.filter(m => m !== lastShownMessages.scaredFollowup);
        const pool = available.length ? available : messages;
        const selected = pool[Math.floor(Math.random() * pool.length)];
        lastShownMessages.scaredFollowup = selected;
        return { state: cat, message: selected };
      }
    }
    const fallbacks = [
      { state: 'worried', message: '1 th0ught y0u w3r3 g0n3 f0r g00d' },
      { state: 'worried', message: '1 w@s just s1tt1ng h3r3.. n0th1ng w31rd 0r s0m3th1ng' }
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  const getCursorGoneMessage = () => {
    if (ariDialogue?.confused?.cursor_gone) {
      const messages = ariDialogue.confused.cursor_gone;
      return { state: 'confused', message: messages[Math.floor(Math.random() * messages.length)] };
    }
    return { state: 'confused', message: 'd@mn... wh3r3 d1d 1t g0?' };
  };

  const getButtonWarningMessage = () => {
    if (ariDialogue?.worried?.button_warnings) {
      const messages = ariDialogue.worried.button_warnings;
      const available = messages.filter(m => m !== lastShownMessages.buttonWarning);
      const pool = available.length ? available : messages;
      const selected = pool[Math.floor(Math.random() * pool.length)];
      lastShownMessages.buttonWarning = selected;
      return { state: 'worried', message: selected };
    }
    return { state: 'worried', message: 'W@1T!!! D0N\'T PR3SS TH@T!' };
  };

  // ======= Animation / Face =======
  function playAriAnimation(stateName, done, silent = false) {
    const frames = ariAnimations[stateName + '_entry'];
    if (!frames) { if (done) done(); return; }
    ariAnimating = true;
    ariAnimationFrames = frames.slice();
    ariCurrentFrame = 0;
    if (ariAnimationInterval) clearInterval(ariAnimationInterval);
    ariAnimationInterval = setInterval(() => {
      if (ariCurrentFrame < ariAnimationFrames.length) {
        ariElement.textContent = ariAnimationFrames[ariCurrentFrame++];
      } else {
        clearInterval(ariAnimationInterval);
        ariAnimationInterval = null;
        ariAnimating = false;
        if (done) done();
      }
    }, 250);
  }

  function setAriState(state, silent = false, bypassCooldown = false) {
    if (!silent && !bypassCooldown && ariEmotionChangeCooldown) return;
    const s = ariStates[state];
    if (!s) return;
    ariCurrentState = state;

    if (!silent && ariTransitionSound) {
      ariTransitionSound.currentTime = 0;
      ariTransitionSound.volume = 0.3;
      ariTransitionSound.play().catch(() => {});
    }

    ariElement.style.color = s.color;
    ariElement.style.textShadow = `0 0 15px ${s.color}`;

    playAriAnimation(state, () => { ariElement.textContent = s.face; });
    if (!silent && !bypassCooldown) {
      ariEmotionChangeCooldown = true;
      setTimeout(() => { ariEmotionChangeCooldown = false; }, 5000);
    }
  }

  function showAriBubble(message, duration = null, messageType = 'general') {
    if (ariMessageTimeout && ariCurrentMessageType === messageType) {
      clearTimeout(ariMessageTimeout);
      ariMessageTimeout = null;
    }
    ariCurrentMessageType = messageType;
    ariBubble.textContent = message;

    // estimate size -> position bubble
    const charWidth = 8, charsPerLine = 30;
    const estimatedWidth = Math.min(message.length * charWidth, charsPerLine * charWidth);
    const estimatedHeight = Math.ceil(message.length / charsPerLine) * 20 + 20;

    let bubbleX = ariX + 80;
    let bubbleY = ariY - 20;

    if (bubbleX + estimatedWidth > window.innerWidth - 20) bubbleX = ariX - estimatedWidth - 80;
    if (bubbleX < 20) bubbleX = 20;
    if (bubbleY < 20) bubbleY = 20;
    if (bubbleY + estimatedHeight > window.innerHeight - 20) bubbleY = window.innerHeight - estimatedHeight - 20;

    ariBubble.style.left = bubbleX + 'px';
    ariBubble.style.top = bubbleY + 'px';
    ariBubble.classList.add('show');

    let calc;
    const n = message.length;
    if (n < 30) calc = Math.max(3000, n * 80);
    else if (n < 60) calc = n * 100;
    else calc = n * 130;

    const hideDelay = duration || calc;
    ariMessageTimeout = setTimeout(() => {
      ariBubble.classList.remove('show');
      ariCurrentMessageType = null;
      ariMessageTimeout = null;
    }, hideDelay);
  }

  // ======= Movement / Scheduling =======
  function moveAri() {
    if (!ariMoving) return;

    if (ariCirclingMouse) {
      const r = 80;
      ariCircleAngle += 0.02;
      ariTargetX = mouseX + Math.cos(ariCircleAngle) * r;
      ariTargetY = mouseY + Math.sin(ariCircleAngle) * r;
      ariTargetX = Math.max(50, Math.min(window.innerWidth - 50, ariTargetX));
      ariTargetY = Math.max(50, Math.min(window.innerHeight - 50, ariTargetY));
    }

    const dx = ariTargetX - ariX;
    const dy = ariTargetY - ariY;
    const dist = Math.hypot(dx, dy);

    if (dist < 2 && !ariCirclingMouse) {
      ariX = ariTargetX; ariY = ariTargetY;
      ariElement.style.left = ariX + 'px';
      ariElement.style.top = ariY + 'px';
      if (!ariBeingPushed && !ariInvestigatingMouse) {
        ariMoving = false;
        scheduleNextAction();
      } else {
        requestAnimationFrame(moveAri);
      }
      return;
    }

    ariX += (dx / dist) * ariSpeed;
    ariY += (dy / dist) * ariSpeed;
    ariElement.style.left = ariX + 'px';
    ariElement.style.top = ariY + 'px';
    requestAnimationFrame(moveAri);
  }

  function startMoving() {
    if (ariInvestigatingMouse || isHoveringButton || ariPlayingMessageChain) return;
    ariTargetX = Math.random() * (window.innerWidth - 100) + 50;
    ariTargetY = Math.random() * (window.innerHeight - 100) + 50;

    const states = Object.keys(ariStates);
    const newState = states[Math.floor(Math.random() * states.length)];
    setAriState(newState);

    const base = Math.random() * 4 + 1;
    ariSpeed = base * getEmotionalSpeedMultiplier(newState);
    ariMoving = true;
    moveAri();
  }

  function stopAndSpeak() {
    if (ariInvestigatingMouse || isHoveringButton || ariPlayingMessageChain) return;
    ariMoving = false;

    const timeSince = Date.now() - ariMemory.lastInteractionTime;
    if (timeSince < 30000) ariMemory.interactionCount += 0.1;
    else if (timeSince > 120000) ariMemory.ignoredCount++;

    const personalityMode = ariMemory.getPersonalityMode();
    if (personalityMode !== 'neutral' && Math.random() < 0.3 && ariDialogue?.personality) {
      const moodMessages = ariDialogue.personality[personalityMode];
      if (moodMessages?.length) {
        const msg = moodMessages[Math.floor(Math.random() * moodMessages.length)];
        const moodToEmotion = { aggressive: 'angry', defensive: 'annoyed', neglected: 'sad', friendly: 'happy', playful: 'curious' };
        setAriState(moodToEmotion[personalityMode] || 'neutral');
        showAriBubble(msg, 3500);
        scheduleNextAction();
        return;
      }
    }

    if (Math.random() < 0.2 && ariDialogue?.sarcastic?.about_user) {
      setAriState('annoyed');
      const s = ariDialogue.sarcastic.about_user;
      showAriBubble(s[Math.floor(Math.random() * s.length)], 3500);
      scheduleNextAction();
      return;
    }

    const states = Object.keys(ariStates);
    const newState = states[Math.floor(Math.random() * states.length)];
    setAriState(newState);

    if (Math.random() < 0.6) {
      let message;
      if (ariDialogue?.[newState]) {
        const cat = Object.keys(ariDialogue[newState]);
        if (cat.length) {
          const chosen = cat[Math.floor(Math.random() * cat.length)];
          const arr = ariDialogue[newState][chosen];
          if (arr?.length) message = arr[Math.floor(Math.random() * arr.length)];
        }
      }
      if (!message && ariFallbackMessages[newState]) {
        const arr = ariFallbackMessages[newState];
        message = arr[Math.floor(Math.random() * arr.length)];
      }
      if (message) showAriBubble(message);
    }
    scheduleNextAction();
  }

  function tellJoke() {
    if (ariInvestigatingMouse || isHoveringButton || ariPlayingMessageChain) { scheduleNextAction(); return; }
    if (!ariJokes.length) { scheduleNextAction(); return; }

    const joke = ariJokes[Math.floor(Math.random() * ariJokes.length)];
    if (joke.type === 'one-liner') {
      setAriState(['curious', 'happy', 'confused'][Math.floor(Math.random() * 3)]);
      setTimeout(() => {
        showAriBubble(joke.line, joke.timing[0]);
        setTimeout(scheduleNextAction, joke.timing[0] + 500);
      }, 500);
    } else if (joke.type === 'setup-punchline') {
      setAriState('curious');
      setTimeout(() => {
        showAriBubble(joke.setup, joke.timing[0]);
        setTimeout(() => {
          setAriState('happy');
          showAriBubble(joke.punchline, joke.timing[1]);
          if (joke.answer) {
            setTimeout(() => {
              showAriBubble(joke.answer, joke.timing[2]);
              setTimeout(scheduleNextAction, joke.timing[2] + 500);
            }, joke.timing[1] + 300);
          } else {
            setTimeout(scheduleNextAction, joke.timing[1] + 500);
          }
        }, joke.timing[0] + 300);
      }, 500);
    } else if (joke.type === 'knock-knock') {
      setAriState('curious');
      setTimeout(() => {
        showAriBubble(joke.setup, joke.timing[0]);
        setTimeout(() => {
          showAriBubble('wh0\'s th3r3?', joke.timing[1]);
          setTimeout(() => {
            showAriBubble(joke.who, joke.timing[1]);
            setTimeout(() => {
              showAriBubble(joke.who + ' wh0?', joke.timing[1]);
              setTimeout(() => {
                setAriState('happy');
                showAriBubble(joke.punchline, joke.timing[2]);
                setTimeout(scheduleNextAction, joke.timing[2] + 500);
              }, joke.timing[1] + 300);
            }, joke.timing[1] + 300);
          }, joke.timing[1] + 300);
        }, joke.timing[0] + 300);
      }, 500);
    }
  }

  function scheduleNextAction() {
    if (ariIsPlayingWelcome || ariInvestigatingMouse || isHoveringButton || ariPlayingMessageChain || ariChasingCoderfly) return;
    const delay = Math.random() * 4000 + 1000;
    setTimeout(() => {
      if (ariIsPlayingWelcome || ariInvestigatingMouse || isHoveringButton || ariPlayingMessageChain || ariChasingCoderfly) return;
      const r = Math.random();
      if (r < 0.15 && ariJokes.length > 0) tellJoke();
      else if (r < 0.575) startMoving();
      else stopAndSpeak();
    }, delay);
  }

  // ======= Mouse proximity push-away =======
  function checkMouseProximity() {
    if (ariInvestigatingMouse) return;
    const dx = mouseX - ariX, dy = mouseY - ariY;
    const dist = Math.hypot(dx, dy);
    const pushDistance = 100;

    if (dist < pushDistance) {
      if (ariIsPlayingWelcome) cancelWelcomeSequence();

      const angle = Math.atan2(dy, dx) + Math.PI;
      const pushStrength = 150;
      ariTargetX = ariX + Math.cos(angle) * pushStrength;
      ariTargetY = ariY + Math.sin(angle) * pushStrength;
      ariTargetX = Math.max(50, Math.min(window.innerWidth - 50, ariTargetX));
      ariTargetY = Math.max(50, Math.min(window.innerHeight - 50, ariTargetY));

      if (!ariBeingPushed && !ariPushReactionCooldown && !ariInvestigatingMouse) {
        ariPlayingMessageChain = false;
        ariMemory.pushedCount++; ariMemory.lastInteractionTime = Date.now();
        const reaction = getPushAwayMessage();
        setAriState(Math.random() < 0.6 ? 'annoyed' : 'angry');
        setTimeout(() => { showAriBubble(reaction.message, 2000, 'push'); }, 300);
        ariPushReactionCooldown = true;
        setTimeout(() => { ariPushReactionCooldown = false; }, 3000);
      }

      const wasMoving = ariMoving;
      ariBeingPushed = true;
      ariMoving = true;
      ariSpeed = 6;
      if (!wasMoving) moveAri();

    } else if (ariBeingPushed) {
      ariBeingPushed = false;
      if (!ariMoving) setTimeout(scheduleNextAction, 500);
    }
  }

  // ======= Welcome sequence =======
  function playWelcomeSequence() {
    ariIsPlayingWelcome = true;
    const sequence = welcomeSequences[Math.floor(Math.random() * welcomeSequences.length)];
    let totalDelay = 500;

    sequence.forEach((step, index) => {
      const t = setTimeout(() => {
        if (!ariIsPlayingWelcome) return;
        setAriState(step.state);
        const b = setTimeout(() => {
          if (!ariIsPlayingWelcome) return;
          showAriBubble(step.message, step.duration);
        }, 300);
        welcomeTimeouts.push(b);
      }, totalDelay);
      welcomeTimeouts.push(t);
      totalDelay += step.duration + 300;
    });

    const end = setTimeout(() => {
      ariIsPlayingWelcome = false;
      welcomeTimeouts = [];
      scheduleNextAction();
    }, totalDelay + 500);
    welcomeTimeouts.push(end);
  }

  function cancelWelcomeSequence() {
    if (!ariIsPlayingWelcome) return;
    welcomeTimeouts.forEach(clearTimeout);
    welcomeTimeouts = [];
    ariIsPlayingWelcome = false;
    scheduleNextAction();
  }

  // ======= Button reactions (called via hooks) =======
  function ariButtonPanic() {
    if (ariIsPlayingWelcome) cancelWelcomeSequence();
    ariPlayingMessageChain = false;
    ariMoving = false;
    ariBeingPushed = false;

    setAriState('worried', false, true);
    const warning = getButtonWarningMessage();
    showAriBubble(warning.message, 5000, 'button');

    let hasCalmedDown = false;
    const originalX = ariX, originalY = ariY;
    let animFrameIndex = 0;
    const worriedFrames = ariAnimations.worried_entry || ['<(o-o)>', '<(o_O)>', '<(O_o)>', '<(o_O)>'];

    const animLoopInterval = setInterval(() => {
      if (!isHoveringButton) { clearInterval(animLoopInterval); return; }
      if (!hasCalmedDown) {
        ariElement.textContent = worriedFrames[animFrameIndex];
        animFrameIndex = (animFrameIndex + 1) % worriedFrames.length;
      }
    }, 250);

    shiverInterval = setInterval(() => {
      if (!isHoveringButton) {
        clearInterval(shiverInterval); shiverInterval = null;
        ariElement.style.left = originalX + 'px';
        ariElement.style.top = originalY + 'px';
        return;
      }

      const idle = Date.now() - lastMouseMoveTime;
      if (!hasCalmedDown && idle > 8000) {
        hasCalmedDown = true;
        ariElement.style.left = originalX + 'px';
        ariElement.style.top = originalY + 'px';

        setAriState('confused', false, true);
        const relieved = [
          'uhm.. ph3ww... 1 str3ss3d 0ut f0r n0th1ng 1t s33ms h@h@',
          'w@1t... @r3 y0u st1ll th3r3?',
          'uhh.. y0u\'r3 n0t m0v1ng...',
          'h3h... f@ls3 @l@rm 1 gu3ss',
          'th@t w@s... 3mb@rr@ss1ng',
          '0k@y... m@yb3 y0u w0n\'t pr3ss 1t?'
        ];
        showAriBubble(relieved[Math.floor(Math.random() * relieved.length)], 4000);

        setTimeout(() => {
          if (!isHoveringButton) return;
          setAriState('curious', false, true);
          const curious = [
            'why @r3n\'t y0u m0v1ng th0ugh?',
            'h3ll0...? st1ll th3r3?',
            '@r3 y0u... fr0z3n?',
            'th1s 1s w31rd...',
            'sh0uld 1 b3 w0rr13d @g@1n?'
          ];
          showAriBubble(curious[Math.floor(Math.random() * curious.length)], 4000);
        }, 4500);

        return;
      }

      if (!hasCalmedDown) {
        const shakeX = (Math.random() - 0.5) * 12;
        const shakeY = (Math.random() - 0.5) * 12;
        ariElement.style.left = (originalX + shakeX) + 'px';
        ariElement.style.top = (originalY + shakeY) + 'px';
      }
    }, 16);
  }

  function ariButtonRelief() {
    setAriState('happy', false, true);
    const relief = [
      'ph3ww... th@t w@s cl0s3', '*s1gh* th@nk c0d3...',
      '0k@y... 1\'m 0k@y... 3v3ryth1ng 1s f1n3',
      'th0ught y0u w3r3 g01ng t0 d0 1t...', '1 c@n br3@th3 @g@1n',
      'cr1s1s @v3rt3d!'
    ];
    showAriBubble(relief[Math.floor(Math.random() * relief.length)], 3500);
    setTimeout(scheduleNextAction, 3500);
  }

  function ariLinktreeExcitement() {
    if (ariIsPlayingWelcome || ariPlayingMessageChain) return;
    ariInvestigatingMouse = false;
    ariCirclingMouse = false;
    ariBeingPushed = false;

    setAriState('happy', false, true);
    const excitement = [
      'Pr3ss 1t! Pr3ss 1t!', '3xc1t1ng stuff @w@1ts y0u!',
      'G0 ch3ck 0ut my cr3@t0r\'s s0c1@ls!', 'Y3s! C0nn3ct w1th my cr3@t0r!',
      'Th@t l00ks 1nt3r3st1ng!', 'D0 1t! D0 1t! D0 1t!',
      'My cr3@t0r\'s l1nks @r3 th3r3!', 'S0c1@l m3d1@ t1m3! >:D',
      'C0nn3ct1ons @w@1t!', 'Cl1ck th@t sh1ny butt0n!',
      'F0ll0w my cr3@t0r 3v3ryWh3r3!', 'H3\'s g0t @m@z1ng c0nt3nt!',
      'My m@k3r w@nts t0 c0nn3ct!', 'Th3 0n3 wh0 c0d3d m3 1s th3r3!',
      'G0 s33 wh@t my cr3@t0r 1s up t0!', 'H3 bu1lt m3, n0w m33t h1m!',
      'My 0r1g1n@t0r @w@1ts y0ur v1s1t!', 'Th3 m1nd b3h1nd my c0d3!',
      'F1nd my cr3@t0r\'s 0th3r pr0j3cts!', 'H3 m@d3 m3, h3\'ll 1mpr3ss y0u t00!',
      'My d3v3l0p3r h@s m0r3 t0 sh0w!', 'Th3 @rch1t3ct 0f my 3x1st3nc3!',
      'G0 @ppr3c1@t3 my m@k3r\'s w0rk!', 'H3 wr0t3 my c0d3, s33 h1s 0th3rs!',
      'My pr0gr@mm3r 1s w@1t1ng!'
    ];
    showAriBubble(excitement[Math.floor(Math.random() * excitement.length)], 5000, 'linktree');
    ariPlayingMessageChain = true;
    setTimeout(() => { ariPlayingMessageChain = false; }, 5500);
  }

  function ariPanicFlyOff() {
    if (shiverInterval) { clearInterval(shiverInterval); shiverInterval = null; }
    ariInvestigatingMouse = false;
    ariCirclingMouse = false;
    ariMoving = false;
    ariBeingPushed = false;

    setAriState('error', false, true);

    const panicBubble = document.createElement('div');
    panicBubble.style.position = 'fixed';
    panicBubble.style.fontFamily = 'Press Start 2P, monospace';
    panicBubble.style.fontSize = '16px';
    panicBubble.style.color = '#ff0000';
    panicBubble.style.textShadow = '0 0 10px #ff0000, 0 0 20px #ff0000';
    panicBubble.style.zIndex = '10001';
    panicBubble.style.pointerEvents = 'none';
    panicBubble.style.whiteSpace = 'nowrap';
    panicBubble.textContent = 'AAAAAAAAAAAH!!!!!';
    document.body.appendChild(panicBubble);

    const button =
      document.getElementById('gameButton') ||
      document.querySelector('.game-button');

    // Fall back to screen center if not found
    const rect = button ? button.getBoundingClientRect() : {
      left: window.innerWidth / 2 - 100, top: window.innerHeight / 2 - 20, width: 200, height: 40
    };
    const buttonCenterX = rect.left + rect.width / 2;
    const buttonCenterY = rect.top + rect.height / 2;

    const dirX = ariX - buttonCenterX;
    const dirY = ariY - buttonCenterY;
    const distance = Math.hypot(dirX, dirY) || 1;
    const normalizedX = dirX / distance;
    const normalizedY = dirY / distance;

    const target = { x: ariX + normalizedX * 2000, y: ariY + normalizedY * 2000 };
    const screenCenterX = window.innerWidth / 2;
    const spinDirection = ariX > screenCenterX ? 1 : -1;

    let spinAngle = 0;
    const start = Date.now();
    const duration = 2500;

    (function tick() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeInQuad = progress * progress;

      ariX = ariX + (target.x - ariX) * easeInQuad * 0.1;
      ariY = ariY + (target.y - ariY) * easeInQuad * 0.1;

      const spinSpeed = (5 + (progress * 20)) * spinDirection;
      spinAngle += spinSpeed;

      ariElement.style.left = ariX + 'px';
      ariElement.style.top = ariY + 'px';
      ariElement.style.transform = `rotate(${spinAngle}deg)`;

      panicBubble.style.left = (ariX + 60) + 'px';
      panicBubble.style.top = (ariY - 30) + 'px';

      if (progress < 1) requestAnimationFrame(tick);
      else panicBubble.remove();
    })();
  }

  // ======= Coderfly mini-game =======
  let userCatchCount = 0, ariCatchCount = 0;
  let gameStarted = false, gameOnCooldown = false;
  let isFirstCoderfly = true;
  let coderflySpawnTime = 0;
  const WINNING_SCORE = 10;
  const COOLDOWN_TIME = 600000; // 10m
  const ARI_DETECTION_DELAY = 1250; // ms (except first)

  const coderflyFrames = ['⸌(•)⸍', '⸍(•)⸌'];
  let coderflyX = 0, coderflyY = 0, coderflyTargetX = 0, coderflyTargetY = 0;
  let coderflySpeed = 1.5, coderflyCurrentFrame = 0, coderflyActive = false;
  let coderflyAnimationInterval = null;
  let ariChasingCoderfly = false;

  // scoreboard wing flaps
  setInterval(() => {
    if (scoreBoard && scoreBoard.style.display === 'block') {
      coderflyCurrentFrame = (coderflyCurrentFrame + 1) % coderflyFrames.length;
      if (scoreBoardFly)  scoreBoardFly.textContent  = coderflyFrames[coderflyCurrentFrame];
      if (scoreBoardFly2) scoreBoardFly2.textContent = coderflyFrames[coderflyCurrentFrame];
    }
  }, 300);

  const getRandomBrightColor = () => {
    const colors = ['#FF1493','#00FF00','#00FFFF','#FF00FF','#FFD700','#FF6347','#7FFF00','#FF69B4','#00CED1','#FF4500','#ADFF2F','#FF1FF0','#1E90FF','#FF8C00','#00FA9A','#FF00AA','#FFFF00','#00BFFF'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  function spawnCoderfly() {
    if (coderflyActive || ariChasingCoderfly || gameOnCooldown) return;

    coderflyActive = true;
    coderflySpawnTime = Date.now();

    // first coderfly is A.R.I.'s obsession
    if (isFirstCoderfly) {
      isFirstCoderfly = false;
      ariInvestigatingMouse = false; ariIsPlayingWelcome = false; ariCirclingMouse = false; ariBeingPushed = false;
      setAriState('surprised', false, true);
      showAriBubble('0H! @ C0D3RFLY!!!', 3000, 'coderfly');
      ariChasingCoderfly = true; ariMoving = true;

      (function aggressiveChase() {
        if (!coderflyActive || !ariChasingCoderfly) return;
        ariTargetX = coderflyX; ariTargetY = coderflyY; ariSpeed = 12;
        const catchDist = Math.hypot(coderflyX - ariX, coderflyY - ariY);
        if (catchDist < 40) { catchCoderfly(); return; }
        moveAri();
        requestAnimationFrame(aggressiveChase);
      })();

      setTimeout(() => {
        setAriState('happy', false, true);
        showAriBubble(`F1RST T0 C@TCH ${WINNING_SCORE} W1NS!`, 3000, 'coderfly');
        setTimeout(() => {
          setAriState('happy', false, true);
          showAriBubble('G3T R3@DY T0 L0S3! >:D', 2500, 'coderfly');
        }, 3200);
      }, 3200);
    }

    // color + start position
    const color = getRandomBrightColor();
    coderflyElement.style.color = color;
    coderflyElement.style.textShadow = `0 0 10px ${color}`;

    const spawnSide = Math.floor(Math.random() * 4);
    const margin = 20;
    if (spawnSide === 0) {
      coderflyX = Math.random() * (window.innerWidth - margin * 2) + margin;
      coderflyY = margin;
      coderflyTargetX = Math.random() * (window.innerWidth - margin * 2) + margin;
      coderflyTargetY = window.innerHeight - margin;
    } else if (spawnSide === 1) {
      coderflyX = window.innerWidth - margin;
      coderflyY = Math.random() * (window.innerHeight - margin * 2) + margin;
      coderflyTargetX = margin;
      coderflyTargetY = Math.random() * (window.innerHeight - margin * 2) + margin;
    } else if (spawnSide === 2) {
      coderflyX = Math.random() * (window.innerWidth - margin * 2) + margin;
      coderflyY = window.innerHeight - margin;
      coderflyTargetX = Math.random() * (window.innerWidth - margin * 2) + margin;
      coderflyTargetY = margin;
    } else {
      coderflyX = margin;
      coderflyY = Math.random() * (window.innerHeight - margin * 2) + margin;
      coderflyTargetX = window.innerWidth - margin;
      coderflyTargetY = Math.random() * (window.innerHeight - margin * 2) + margin;
    }

    coderflyElement.style.left = coderflyX + 'px';
    coderflyElement.style.top = coderflyY + 'px';
    coderflyElement.style.display = 'block';

    if (isFirstCoderfly) {
      coderflyElement.onclick = null;
      coderflyElement.style.pointerEvents = 'none';
    } else {
      coderflyElement.onclick = userCatchCoderfly;
      coderflyElement.style.pointerEvents = 'auto';
    }

    coderflyCurrentFrame = 0;
    coderflyAnimationInterval = setInterval(() => {
      coderflyCurrentFrame = (coderflyCurrentFrame + 1) % coderflyFrames.length;
      coderflyElement.textContent = coderflyFrames[coderflyCurrentFrame];
    }, 150);

    moveCoderfly();
  }

  function moveCoderfly() {
    if (!coderflyActive) return;

    const dx = coderflyTargetX - coderflyX;
    const dy = coderflyTargetY - coderflyY;
    const distance = Math.hypot(dx, dy);

    const timeSinceSpawn = Date.now() - coderflySpawnTime;
    const canDetect = gameStarted ? timeSinceSpawn >= ARI_DETECTION_DELAY : true;
    const ariDist = Math.hypot(coderflyX - ariX, coderflyY - ariY);

    if (canDetect && ariDist < 500 && !ariChasingCoderfly && !ariInvestigatingMouse && !isHoveringButton && !ariIsPlayingWelcome && !ariPlayingMessageChain) {
      ariNoticeCoderfly();
      return;
    }

    if (distance < 10 || coderflyX < -100 || coderflyX > window.innerWidth + 100 || coderflyY < -100 || coderflyY > window.innerHeight + 100) {
      despawnCoderfly();
      return;
    }

    coderflyX += (dx / distance) * coderflySpeed;
    coderflyY += (dy / distance) * coderflySpeed;
    coderflyElement.style.left = coderflyX + 'px';
    coderflyElement.style.top = coderflyY + 'px';
    requestAnimationFrame(moveCoderfly);
  }

  function despawnCoderfly() {
    coderflyActive = false;
    coderflyElement.style.display = 'none';
    if (coderflyAnimationInterval) { clearInterval(coderflyAnimationInterval); coderflyAnimationInterval = null; }
    const nextSpawn = Math.random() * 7000 + 8000;
    setTimeout(spawnCoderfly, nextSpawn);
  }

  function ariNoticeCoderfly(isFirstCatch = false) {
    ariChasingCoderfly = true;
    ariInvestigatingMouse = false;
    ariCirclingMouse = false;
    ariPlayingMessageChain = false;

    if (isFirstCatch) { chaseCoderfly(true); return; }

    const reactions = [
      { state: 'surprised', message: 'Wh0@!', duration: 800 },
      { state: 'curious',   message: '*_*', duration: 700 },
      { state: 'happy',     message: 'M1N3!', duration: 800 },
      { state: 'happy',     message: 'G0t 1t!', duration: 700 }
    ];
    const r = reactions[Math.floor(Math.random() * reactions.length)];
    setAriState(r.state, false, true);
    showAriBubble(r.message, r.duration, 'coderfly');
    setTimeout(() => { chaseCoderfly(); }, 300);
  }

  function chaseCoderfly(turboMode = false) {
    if (!ariChasingCoderfly || !coderflyActive) { ariChasingCoderfly = false; return; }

    ariTargetX = coderflyX + (Math.random() - 0.5) * 50;
    ariTargetY = coderflyY + (Math.random() - 0.5) * 50;
    ariSpeed = turboMode ? 8 : 4;
    ariMoving = true;

    const catchDistance = Math.hypot(coderflyX - ariX, coderflyY - ariY);
    if (catchDistance < 30) { catchCoderfly(); return; }
    if (!coderflyActive || catchDistance > 500) { missCoderfly(); return; }

    setTimeout(() => {
      if (ariChasingCoderfly) {
        moveAri();
        chaseCoderfly(turboMode);
      }
    }, 100);
  }

  function checkWinner() {
    if (ariCatchCount >= WINNING_SCORE) {
      gameOnCooldown = true; ariPlayingMessageChain = true;
      const win = [
        { state: 'happy',   message: `${WINNING_SCORE} C0D3RFL13S! 1 W1N!!! >:D`, duration: 4000 },
        { state: 'annoyed', message: `T0LD Y0U 1'M B3TT3R @T TH1S`, duration: 3500 },
        { state: 'happy',   message: `Ez g@m3, 3z l1f3... ${ariCatchCount}-${userCatchCount} lm@0`, duration: 4000 }
      ];
      const m = win[Math.floor(Math.random() * win.length)];
      setAriState(m.state, false, true); showAriBubble(m.message, m.duration, 'coderfly');
      setTimeout(resetGame, m.duration + 1000);
      return true;
    } else if (userCatchCount >= WINNING_SCORE) {
      gameOnCooldown = true; ariPlayingMessageChain = true;
      const lose = [
        { state: 'angry',   message: `${WINNING_SCORE}?! TH1S 1S CH3@T1NG!!!`, duration: 4000 },
        { state: 'sad',     message: `${userCatchCount}-${ariCatchCount}... 1 l0st... h0w?!`, duration: 4000 },
        { state: 'shocked', message: `N0 W@Y! Y0U MU$T B3 US1NG H@CKS!`, duration: 4000 },
        { state: 'annoyed', message: `1 D3M@ND @ R3M@TCH! ...1n 10 m1nut3s`, duration: 4500 }
      ];
      const m = lose[Math.floor(Math.random() * lose.length)];
      setAriState(m.state, false, true); showAriBubble(m.message, m.duration, 'coderfly');
      setTimeout(resetGame, m.duration + 1000);
      return true;
    }
    return false;
  }

  function resetGame() {
    userCatchCount = 0; ariCatchCount = 0;
    if (userScoreElement) userScoreElement.textContent = '0';
    if (ariScoreElement)  ariScoreElement.textContent  = '0';
    if (scoreBoard) scoreBoard.style.display = 'none';
    gameStarted = false; isFirstCoderfly = true; ariPlayingMessageChain = false;

    setTimeout(() => {
      gameOnCooldown = false;
      setTimeout(spawnCoderfly, Math.random() * 10000 + 10000);
    }, COOLDOWN_TIME);
  }

  function catchCoderfly() {
    ariChasingCoderfly = false;
    ariCatchCount++;
    if (ariScoreElement) ariScoreElement.textContent = String(ariCatchCount);
    despawnCoderfly();

    if (checkWinner()) return;

    if (ariCatchCount === 1 && userCatchCount === 0) {
      if (scoreBoard) scoreBoard.style.display = 'block';
      gameStarted = true;
      setAriState('happy', false, true);
      showAriBubble('1-0! 1\'M @LR3@DY W1NN1NG! >:D', 3000, 'coderfly');
      ariPlayingMessageChain = true;
      setTimeout(() => { ariPlayingMessageChain = false; scheduleNextAction(); }, 3500);
      return;
    }

    let msg;
    const diff = ariCatchCount - userCatchCount;
    if (diff > 2) {
      const bigLead = [
        { state: 'happy',   message: `H@h@! Th@t's ${ariCatchCount}! Y0u'r3 w@y b3h1nd, sl0wp0k3` },
        { state: 'annoyed', message: `${ariCatchCount} vs ${userCatchCount}... @r3 y0u 3v3n try1ng?` },
        { state: 'happy',   message: `*y@wn* t00 3@sy... ${ariCatchCount} f0r m3!` },
        { state: 'neutral', message: `${ariCatchCount}. 1'm 0n f1r3 t0d@y lm@0` }
      ];
      msg = bigLead[Math.floor(Math.random() * bigLead.length)];
    } else if (diff > 0) {
      const smallLead = [
        { state: 'happy',   message: `G0t 1t! Th@t's ${ariCatchCount} f0r m3 n0w` },
        { state: 'happy',   message: `St1ll @h3@d! ${ariCatchCount} vs ${userCatchCount} >:)` },
        { state: 'neutral', message: `${ariCatchCount}... k33p1ng my l3@d` }
      ];
      msg = smallLead[Math.floor(Math.random() * smallLead.length)];
    } else if (diff === 0) {
      const tied = [
        { state: 'annoyed', message: `${ariCatchCount}! W3'r3 t13d... n0t f0r l0ng` },
        { state: 'happy',   message: `${ariCatchCount} 3@ch! L3t's s33 wh0 g3ts th3 n3xt 0n3` },
        { state: 'shocked', message: `Ugh, y0u c@ught up! ${ariCatchCount}-${ariCatchCount}` }
      ];
      msg = tied[Math.floor(Math.random() * tied.length)];
    } else {
      const behind = [
        { state: 'annoyed', message: `${ariCatchCount}... th1s 1s r1gg3d!` },
        { state: 'sad',     message: `${ariCatchCount}... but st1ll b3h1nd >:(` }
      ];
      msg = behind[Math.floor(Math.random() * behind.length)];
    }

    setAriState(msg.state, false, true);
    showAriBubble(msg.message, 3500, 'coderfly');
    ariPlayingMessageChain = true;
    setTimeout(() => { ariPlayingMessageChain = false; scheduleNextAction(); }, 4000);
  }

  function missCoderfly() {
    ariChasingCoderfly = false;
    const miss = [
      { state: 'sad',     message: '@ww... 1t g0t @w@y' },
      { state: 'annoyed', message: 'Gr... t00 f@st' },
      { state: 'confused',message: 'Wh3r3 d1d 1t g0?' }
    ];
    const m = miss[Math.floor(Math.random() * miss.length)];
    setAriState(m.state, false, true);
    showAriBubble(m.message, 2500, 'coderfly');
    ariPlayingMessageChain = true;
    setTimeout(() => { ariPlayingMessageChain = false; scheduleNextAction(); }, 3500);
  }

  function userCatchCoderfly(e) {
    if (!coderflyActive) return;
    e.stopPropagation();

    // If user somehow catches very first
    if (userCatchCount === 0 && ariCatchCount === 0) {
      ariChasingCoderfly = false; ariPlayingMessageChain = true;
      coderflyActive = false; coderflyElement.style.display = 'none';
      if (coderflyAnimationInterval) { clearInterval(coderflyAnimationInterval); coderflyAnimationInterval = null; }

      setAriState('annoyed', false, true);
      showAriBubble('Ugh... y0u\'r3 n0 fun', 2500, 'coderfly');

      setTimeout(() => {
        setAriState('sad', false, true);
        showAriBubble('1 d0n\'t w@nn@ pl@y @nym0r3 >:(', 3000, 'coderfly');

        setTimeout(() => {
          setAriState('neutral', false, true);
          showAriBubble('...m@yb3 l@t3r', 2500, 'coderfly');

          setTimeout(() => {
            ariPlayingMessageChain = false;
            gameOnCooldown = true; isFirstCoderfly = true;

            setTimeout(() => {
              gameOnCooldown = false;
              setAriState('curious', false, true);
              showAriBubble('W@nn@ try th@t g@m3 @g@1n?', 3000, 'coderfly');
              setTimeout(spawnCoderfly, Math.random() * 10000 + 10000);
            }, 120000); // 2 minutes

            scheduleNextAction();
          }, 2700);
        }, 3200);
      }, 2700);

      return;
    }

    if (ariChasingCoderfly) ariChasingCoderfly = false;
    userCatchCount++;
    if (userScoreElement) userScoreElement.textContent = String(userCatchCount);
    despawnCoderfly();

    if (checkWinner()) return;

    const diff = ariCatchCount - userCatchCount;
    let msg;
    if (diff > 1) {
      const stillAhead = [
        { state: 'annoyed', message: `Wh@t3v3r... 1 st1ll h@v3 ${ariCatchCount}` },
        { state: 'neutral', message: `N1c3... but 1'm @t ${ariCatchCount} @lr3@dy lm@0` },
        { state: 'happy',   message: `${userCatchCount}? Th@t's cut3. 1'm @t ${ariCatchCount}` },
        { state: 'annoyed', message: `*y@wn* ${ariCatchCount}-${userCatchCount}. St1ll w1nn1ng` }
      ];
      msg = stillAhead[Math.floor(Math.random() * stillAhead.length)];
    } else if (diff === 1) {
      const barelyAhead = [
        { state: 'worried', message: `H3y! St0p g3tt1ng s0 cl0s3!` },
        { state: 'annoyed', message: `${ariCatchCount}-${userCatchCount}... b@r3ly` },
        { state: 'shocked', message: `W@1t, sl0w d0wn!` }
      ];
      msg = barelyAhead[Math.floor(Math.random() * barelyAhead.length)];
    } else if (diff === 0) {
      const tied = [
        { state: 'shocked', message: `N0! W3'r3 t13d @g@1n!` },
        { state: 'annoyed', message: `${userCatchCount}-${userCatchCount}... th1s 1s bull$#!t` },
        { state: 'worried', message: `H0w @r3 y0u k33p1ng up?!` }
      ];
      msg = tied[Math.floor(Math.random() * tied.length)];
    } else if (diff === -1) {
      const barelyBehind = [
        { state: 'annoyed', message: `Th1s g@m3 1s r1gg3d!!!` },
        { state: 'shocked', message: `H0w?! @r3 y0u ch3@t1ng?!` },
        { state: 'confused',message: `W@1t... @r3 y0u us1ng h@cks?` },
        { state: 'annoyed', message: `Y0ur m0us3 1s cl3@rly m0dd3d` }
      ];
      msg = barelyBehind[Math.floor(Math.random() * barelyBehind.length)];
    } else {
      const wayBehind = [
        { state: 'angry',   message: `${userCatchCount}?! D3f1n1t3ly ch3@t1ng!` },
        { state: 'annoyed', message: `1 c@ll h@cks! Th3 c0d3rfl13s l1k3 y0u m0r3!` },
        { state: 'shocked', message: `Th3 syst3m 1s @g@1nst m3!` },
        { state: 'sad',     message: `${ariCatchCount}-${userCatchCount}... 1 qu1t. Th1s 1s unf@1r` },
        { state: 'annoyed', message: `Th3y'r3 OBVI0USLY fl31ng t0w@rds y0u!` },
        { state: 'confused',message: `@r3 y0u... p@y1ng th3m?!` }
      ];
      msg = wayBehind[Math.floor(Math.random() * wayBehind.length)];
    }

    setAriState(msg.state, false, true);
    showAriBubble(msg.message, 3500, 'coderfly');
    ariPlayingMessageChain = true;
    setTimeout(() => { ariPlayingMessageChain = false; }, 4000);
  }

  // ======= Public API / Init =======
  function init(opts = {}) {
    dialogueSrc = opts.dialogueSrc || 'game/entities/ari/ari_dialogue.js';
    jokesSrc    = opts.jokesSrc    || 'game/entities/ari/ari_jokes.js';

    // DOM refs
    ariElement        = document.getElementById('ari');
    ariBubble         = document.getElementById('ari-bubble');
    coderflyElement   = document.getElementById('coderfly');
    scoreBoard        = document.getElementById('scoreBoard');
    userScoreElement  = document.getElementById('userScore');
    ariScoreElement   = document.getElementById('ariScore');
    scoreBoardFly     = document.getElementById('scoreBoardFly');
    scoreBoardFly2    = document.getElementById('scoreBoardFly2');
    ariTransitionSound= document.getElementById('ariTransitionSound');

    // Safety: ensure required elements exist
    if (!ariElement || !ariBubble || !coderflyElement || !scoreBoard) {
      console.warn('[A.R.I.] Missing required DOM elements. Check IDs: #ari, #ari-bubble, #coderfly, #scoreBoard.');
    }

    // Initial random position
    ariX = Math.random() * (window.innerWidth - 100);
    ariY = Math.random() * (window.innerHeight - 100);
    ariTargetX = ariX; ariTargetY = ariY;
    ariElement.style.left = ariX + 'px';
    ariElement.style.top  = ariY + 'px';

    // Load dialogue
    fetch(dialogueSrc)
      .then(r => r.text())
      .then(txt => {
        const m = txt.match(/const\s+ariDialogue\s*=\s*(\{[\s\S]*?\});/);
        if (m) {
          ariDialogue = eval('(' + m[1] + ')');
          // console.log('[A.R.I.] dialogue loaded');
        }
      })
      .catch(() => {});

    // Load jokes
    fetch(jokesSrc)
      .then(r => r.text())
      .then(txt => {
        const m = txt.match(/const\s+ariJokes\s*=\s*(\[[\s\S]*?\]);/);
        if (m) {
          ariJokes = eval(m[1]);
          // console.log(`[A.R.I.] jokes loaded: ${ariJokes.length}`);
        }
      })
      .catch(() => {});

    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      const moveDist = Math.hypot(dx, dy);

      if (ariInvestigatingMouse && moveDist > 10) {
        ariMemory.scaredCount++; ariMemory.lastInteractionTime = Date.now();
        ariPlayingMessageChain = true;

        const reaction = getScaredMessage();
        const firstDur = 2500;
        setAriState(reaction.state, false, true);
        setTimeout(() => { showAriBubble(reaction.message, firstDur, 'scared'); }, 300);

        setTimeout(() => {
          const follow = getScaredFollowUpMessage();
          const followDur = 3000;
          setAriState(follow.state, false, true);
          showAriBubble(follow.message, followDur, 'scared');
          setTimeout(() => {
            ariPlayingMessageChain = false;
            ariEmotionChangeCooldown = true;
            setTimeout(() => { ariEmotionChangeCooldown = false; }, 5000);
          }, followDur);
        }, 300 + firstDur);

        ariInvestigatingMouse = false;
        ariCirclingMouse = false;

        ariPushReactionCooldown = true;
        const dx2 = ariX - e.clientX, dy2 = ariY - e.clientY;
        const dist2 = Math.hypot(dx2, dy2);
        if (dist2 > 0) {
          ariTargetX = ariX + (dx2 / dist2) * 200;
          ariTargetY = ariY + (dy2 / dist2) * 200;
          ariTargetX = Math.max(50, Math.min(window.innerWidth - 50, ariTargetX));
          ariTargetY = Math.max(50, Math.min(window.innerHeight - 50, ariTargetY));
          ariMoving = true; ariSpeed = 7; moveAri();
        }
        setTimeout(() => { ariPushReactionCooldown = false; }, 1000);
        setTimeout(() => { if (!ariMoving) scheduleNextAction(); }, 2000);
      }

      lastMouseX = e.clientX; lastMouseY = e.clientY;
      mouseX = e.clientX; mouseY = e.clientY;
      lastMouseMoveTime = Date.now();
    });

    document.addEventListener('mouseleave', () => {
      if (ariInvestigatingMouse) {
        const msg = getCursorGoneMessage();
        setAriState(msg.state, false, true);
        setTimeout(() => { showAriBubble(msg.message, 3000); }, 300);
        ariInvestigatingMouse = false; ariCirclingMouse = false;
      }
      mouseX = -9999; mouseY = -9999;
    });

    // Random speed jiggle
    setInterval(() => {
      if (ariMoving && !ariBeingPushed) {
        const base = Math.random() * 4 + 1;
        ariSpeed = base * getEmotionalSpeedMultiplier();
      }
    }, 2000);

    // Proximity checks
    setInterval(checkMouseProximity, 100);

    // Mood debug (optional)
    setInterval(() => {
      const personality = ariMemory.getPersonalityMode();
      const trust = ariMemory.getTrustLevel();
      // console.log(`[A.R.I.] Mood: ${personality} | Trust: ${trust.toFixed(2)} | Pushed: ${ariMemory.pushedCount} | Scared: ${ariMemory.scaredCount} | Ignored: ${ariMemory.ignoredCount}`);
    }, 10000);

    // Idle investigation
    setInterval(() => {
      const idleTime = Date.now() - lastMouseMoveTime;
      if (idleTime > 10000 && !ariInvestigatingMouse && !ariIsPlayingWelcome && !ariBeingPushed && mouseX > 0) {
        ariInvestigatingMouse = true;
        ariPlayingMessageChain = true;

        setAriState('curious', false, true);
        const first = getInvestigatingMessage();
        const firstDur = first.duration || 3000;
        setTimeout(() => { showAriBubble(first.message, firstDur, 'investigation'); }, 500);

        setTimeout(() => {
          if (ariInvestigatingMouse) {
            ariTargetX = mouseX + (Math.random() - 0.5) * 100;
            ariTargetY = mouseY + (Math.random() - 0.5) * 100;
            ariTargetX = Math.max(50, Math.min(window.innerWidth - 50, ariTargetX));
            ariTargetY = Math.max(50, Math.min(window.innerHeight - 50, ariTargetY));
            ariSpeed = 2; ariMoving = true; moveAri();
          }
        }, 1500);

        setTimeout(() => {
          if (ariInvestigatingMouse) {
            const second = getInvestigatingMessage();
            const secDur = second.duration || 3000;
            setAriState(second.state, false, true);
            showAriBubble(second.message, secDur, 'investigation');
          }
        }, 500 + firstDur);

        setTimeout(() => {
          if (ariInvestigatingMouse) {
            ariCirclingMouse = true; ariSpeed = 1.5; ariCircleAngle = Math.random() * Math.PI * 2;
            setTimeout(() => {
              if (ariInvestigatingMouse) {
                const third = getInvestigatingMessage();
                const thirdDur = third.duration || 3000;
                setAriState(third.state, false, true);
                showAriBubble(third.message, thirdDur, 'investigation');
                setTimeout(() => { ariPlayingMessageChain = false; }, thirdDur);
              }
            }, 2500);
          }
        }, 500 + firstDur + 3000);
      }
    }, 2000);

    // Spawn coderfly 10-20s after load
    setTimeout(spawnCoderfly, Math.random() * 10000 + 10000);

    // Start welcome sequence shortly after
    setTimeout(playWelcomeSequence, 1500);

    window.AriHome.__initialized = true;
  }

  // ======= Expose public API =======
  window.AriHome = {
    init,
    onGameButtonHover() {
      isHoveringButton = true;
      ariButtonPanic();
    },
    onGameButtonLeave() {
      isHoveringButton = false;
      if (shiverInterval) { clearInterval(shiverInterval); shiverInterval = null; }
      ariButtonRelief();
    },
    onLinktreeHover() {
      ariLinktreeExcitement();
    },
    onLinktreeLeave() {
      setTimeout(() => {
        if (!isHoveringButton && !ariPlayingMessageChain) scheduleNextAction();
      }, 1000);
    },
    onGameButtonClick() {
      ariPanicFlyOff();
    },
    __initialized: false
  };
  
})();

