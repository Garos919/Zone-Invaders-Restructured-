// --- Core (definitions & helpers first) ---
import './core/constants.js';
import './core/utils.js';
import './core/difficultySystem.js';

// --- Modules & systems (so they register themselves) ---
import './player/player.js';
import './enemies/enemySystem.js';

import './systems/background/backgroundController.js';
import './systems/background/backgroundSystem.js';
import './systems/collectibleSystem.js';
import './systems/obstacleSystem.js';
import './systems/particleSystem.js';
import './systems/powerUpSystem.js';
import './systems/touch/touch-instructions.js';

import './ui/introSequence.js';
import './ui/menu.js';
import './ui/deathScreen.js';

import './narrative/ari.js';

// --- Engine LAST, so it can wire everything together and start the loop ---
import './core/engine.js';
