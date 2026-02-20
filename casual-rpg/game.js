/* ═══════════════════════════════════════════
   Game Loop, Start / Restart / Game Over,
   Card Selection, Input
   (depends on: state.js, config.js, ui.js,
    enemies.js, player.js)
   ═══════════════════════════════════════════ */

let lastFrameTime = 0;  // for dt calculation (sword spin)

// ────────────────────────────────────
//  Start / Restart / Game Over
// ────────────────────────────────────
function startGame() {
    // read difficulty pick
    const sel = document.getElementById('difficultySelect');
    if (sel) gameState.difficulty = sel.value;

    document.getElementById('startScreen').classList.add('hidden');
    gameState.running = true;
    lastFrameTime = performance.now();
    spawnWave();
    startLoop();
}

function restartGame() {
    clearSpawnTimers();

    gameState.wave = 1;
    gameState.kills = 0;
    gameState.cardsCollected = 0;
    gameState.enemiesRemaining = 0;
    gameState.enemiesSpawned = 0;
    gameState.enemiesExpected = 0;
    gameState.isBossWave = false;
    gameState.enemies = [];
    gameState.bullets = [];
    gameState.enemyBullets = [];
    gameState.buffs = [];
    gameState.debuffs = [];

    gameState.player = defaultPlayer();

    // clear DOM
    document.querySelectorAll('.enemy, .bullet, .cannon-bullet, .enemy-bullet, .spinning-sword, .cannon-explosion, .damage-number').forEach(e => e.remove());
    swordEl = null;   // reset sword element reference
    document.getElementById('gameOver').classList.remove('active');

    updateUI();
    updateBuffsDisplay();
    gameState.running = true;
    lastFrameTime = performance.now();
    spawnWave();
    startLoop();
}

function gameOver() {
    gameState.running = false;
    clearSpawnTimers();
    document.getElementById('finalWave').textContent  = gameState.wave;
    document.getElementById('finalKills').textContent  = gameState.kills;
    document.getElementById('finalCards').textContent   = gameState.cardsCollected;
    document.getElementById('gameOver').classList.add('active');
}

// ────────────────────────────────────
//  Card Selection
// ────────────────────────────────────
function showCardSelection() {
    gameState.running = false;

    const isBoss   = gameState.isBossWave;
    const cardPool = isBoss ? bossCards : normalCards;

    cardTitle.textContent = isBoss
        ? '🏆 Boss Defeated! Choose a Legendary Reward! 🏆'
        : 'Choose Your Reward!';
    cardTitle.className = isBoss ? 'boss-reward' : '';

    // filter out unlock cards for weapons already owned,
    // and upgrade cards for weapons not yet owned
    const p = gameState.player;
    const filtered = cardPool.filter(card => {
        // hide unlock cards once you have item
        if (card.name === 'Spinning Blade' && p.hasSword) return false;
        if (card.name === 'Cannon Unlock'  && p.hasCannon) return false;
        if (card.name === 'Arsenal Mastery' && p.hasSword && p.hasCannon) return false;
        // hide sword upgrade cards if you don't own sword yet
        if (['Sharpen Blade','Wider Orbit','Longer Spin'].includes(card.name) && !p.hasSword) return false;
        // hide cannon upgrade cards if you don't own cannon yet
        if (['Heavier Shells','Bigger Blast'].includes(card.name) && !p.hasCannon) return false;
        // hide Glass Cannon if armor already locked
        if (card.name === 'Glass Cannon' && p.armorLocked) return false;
        return true;
    });
    const poolCopy = [...filtered];
    // ensure we have at least 3 cards (shouldn't be an issue)
    while (poolCopy.length < 3) poolCopy.push(...filtered);
    const chosen = [];
    for (let i = 0; i < 3; i++) {
        const idx = Math.floor(Math.random() * poolCopy.length);
        chosen.push(poolCopy.splice(idx, 1)[0]);
    }

    // From wave 5+, chance to replace one card with a mythical
    if (gameState.wave >= 5 && mythicalCards.length > 0 && Math.random() < 0.4) {
        const mPool = mythicalCards.filter(c => {
            if (c.name === 'Glass Cannon' && p.armorLocked) return false;
            return true;
        });
        if (mPool.length > 0) {
            const mc = mPool[Math.floor(Math.random() * mPool.length)];
            chosen[Math.floor(Math.random() * chosen.length)] = mc;
        }
    }

    cardsContainer.innerHTML = '';
    chosen.forEach(card => {
        const el = document.createElement('div');
        const isMythical = card.rarity === 'mythical';
        let cls = 'card';
        if (isBoss && !isMythical) cls += ' boss-card';
        if (isMythical) cls += ' mythical-card';
        el.className = cls;

        let debuffHtml = '';
        if (isMythical && card.debuffText) {
            debuffHtml = `<div class="card-debuff">⚠️ ${card.debuffText}</div>`;
        }

        el.innerHTML = `
            <div class="card-icon">${card.icon}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-description">${card.description}</div>
            ${debuffHtml}
            <div class="card-rarity rarity-${card.rarity}">${card.rarity.toUpperCase()}</div>`;
        el.onclick = () => selectCard(card);
        cardsContainer.appendChild(el);
    });

    cardModal.classList.add('active');
}

function selectCard(card) {
    card.effect(gameState.player);
    gameState.buffs.push(card);
    gameState.cardsCollected++;

    // If it's a mythical card, record the debuff
    if (card.rarity === 'mythical' && card.debuffText) {
        gameState.debuffs.push(card.debuffText);
    }

    // If armorLocked by Glass Cannon, enforce it
    if (gameState.player.armorLocked) gameState.player.armor = 0;

    cardModal.classList.remove('active');
    updateUI();
    updateBuffsDisplay();

    gameState.wave++;
    gameState.running = true;
    spawnWave();
    startLoop();
}

// ────────────────────────────────────
//  Main Game Loop  (safe against double-start)
// ────────────────────────────────────
function startLoop() {
    if (gameState.animFrameId) cancelAnimationFrame(gameState.animFrameId);
    gameState.animFrameId = requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    if (!gameState.running) {
        gameState.animFrameId = null;
        return;
    }

    // delta time in seconds (for sword spin)
    const dt = (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp;

    updatePlayer();              // movement + facing   (player.js)
    playerAutoShoot();           // auto-fire pistol    (player.js)
    playerCannonShoot();         // heavy cannon        (player.js)
    updateSpinningSword(dt);     // orbiting sword      (player.js)
    updateBullets();             // move bullets + hits  (player.js)
    updateEnemies();             // enemy AI + attacks   (enemies.js)
    updateUI();                  // HUD + positions      (ui.js)

    gameState.animFrameId = requestAnimationFrame(gameLoop);
}

// ────────────────────────────────────
//  Input  (movement only – gun fires automatically)
// ────────────────────────────────────
document.addEventListener('keydown', e => {
    gameState.keys[e.code] = true;
});

document.addEventListener('keyup', e => {
    gameState.keys[e.code] = false;
});

// initial render
updateUI();
