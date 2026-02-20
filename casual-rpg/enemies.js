/* ═══════════════════════════════════════════
   Enemies – Types, Spawning, AI, DOM Helpers
   ═══════════════════════════════════════════ */

// ─── Enemy Type Templates ───
//  type: 'normal' | 'speed' | 'strong' | 'tough' | 'ranged' | 'boss'
function enemyTemplate(wave) {
    const d = diff();
    const base = {
        id: Date.now() + Math.random(),
        maxHealth: Math.floor((30 + wave * 10) * d.hpMul),
        damage:    Math.floor((5 + Math.floor(wave / 2)) * d.dmgMul),
        speed:     (1 + Math.random() * 0.6) * d.spdMul,
        lastAttack: 0,
        isBoss: false,
        type: 'normal',
        shootCooldown: 0,
        lastShot: 0
    };
    base.health = base.maxHealth;
    return base;
}

function pickEnemyType(wave) {
    // gradually introduce harder types
    const pool = ['normal', 'normal', 'normal'];
    if (wave >= 2)  pool.push('speed', 'speed');
    if (wave >= 3)  pool.push('strong');
    if (wave >= 4)  pool.push('tough');
    if (wave >= 6)  pool.push('ranged', 'ranged');
    if (wave >= 8)  pool.push('strong', 'tough', 'ranged');
    return pool[Math.floor(Math.random() * pool.length)];
}

function applyType(enemy, type) {
    const d = diff();
    enemy.type = type;
    switch (type) {
        case 'speed':
            enemy.speed *= 1.8;
            enemy.maxHealth = Math.floor(enemy.maxHealth * 0.6);
            enemy.health = enemy.maxHealth;
            break;
        case 'strong':
            enemy.damage = Math.floor(enemy.damage * 1.8);
            enemy.speed *= 0.85;
            break;
        case 'tough':
            enemy.maxHealth = Math.floor(enemy.maxHealth * 2.2);
            enemy.health = enemy.maxHealth;
            enemy.speed *= 0.7;
            break;
        case 'ranged':
            enemy.shootCooldown = 2000;
            enemy.lastShot = 0;
            enemy.speed *= 0.75;
            break;
    }
    return enemy;
}

// ─── Spawn Logic ───
function spawnWave() {
    const d = diff();
    gameState.isBossWave = (gameState.wave % 5 === 0);

    if (gameState.isBossWave) {
        waveInfo.classList.add('boss-wave');
        waveInfo.textContent = `⚠️ BOSS WAVE ${gameState.wave} ⚠️`;

        // Boss + a horde of special minions scaled by wave & difficulty
        const minionCount = Math.floor((4 + Math.floor(gameState.wave / 3) * 2) * d.spawnMul);
        const totalEnemies = 1 + minionCount; // boss + minions
        gameState.enemiesExpected  = totalEnemies;
        gameState.enemiesSpawned   = 0;
        gameState.enemiesRemaining = totalEnemies;

        spawnBoss();

        // Spawn minions in quick bursts – all special types, no normals
        for (let i = 0; i < minionCount; i++) {
            const tid = setTimeout(() => spawnBossMinion(), 600 + i * 350);
            gameState.spawnTimers.push(tid);
        }
    } else {
        waveInfo.classList.remove('boss-wave');
        waveInfo.textContent = `Wave ${gameState.wave}`;
        const count = Math.floor((3 + Math.floor(gameState.wave / 2)) * d.spawnMul);
        gameState.enemiesExpected  = count;
        gameState.enemiesSpawned   = 0;
        gameState.enemiesRemaining = count;

        for (let i = 0; i < count; i++) {
            const tid = setTimeout(() => spawnEnemy(), i * 500);
            gameState.spawnTimers.push(tid);
        }
    }
}

function randomEdgePosition() {
    const w = arenaW(), h = arenaH();
    const side = Math.floor(Math.random() * 4);
    switch (side) {
        case 0: return { x: Math.random() * w, y: -20 };
        case 1: return { x: Math.random() * w, y: h + 20 };
        case 2: return { x: -20, y: Math.random() * h };
        case 3: return { x: w + 20, y: Math.random() * h };
    }
}

function spawnEnemy() {
    if (!gameState.running) return;
    const pos = randomEdgePosition();
    let enemy = enemyTemplate(gameState.wave);
    enemy.x = pos.x;
    enemy.y = pos.y;
    enemy = applyType(enemy, pickEnemyType(gameState.wave));
    gameState.enemies.push(enemy);
    gameState.enemiesSpawned++;
    createEnemyElement(enemy);
}

function spawnBoss() {
    const d = diff();
    const pos = randomEdgePosition();
    const boss = {
        id: Date.now() + Math.random(),
        x: pos.x,
        y: pos.y,
        maxHealth: Math.floor((200 + gameState.wave * 50) * d.hpMul),
        damage:    Math.floor((15 + gameState.wave * 2) * d.dmgMul),
        speed:     0.7 * d.spdMul,
        lastAttack: 0,
        isBoss: true,
        type: 'boss',
        shootCooldown: 1500,
        lastShot: 0
    };
    boss.health = boss.maxHealth;
    gameState.enemies.push(boss);
    gameState.enemiesSpawned++;
    createEnemyElement(boss);
}

// Boss-wave minions – only special types, buffed slightly
function pickBossMinionType(wave) {
    const pool = ['speed', 'strong'];
    if (wave >= 10) pool.push('tough', 'tough');
    if (wave >= 10) pool.push('ranged', 'ranged');
    if (wave >= 15) pool.push('strong', 'ranged', 'tough');
    return pool[Math.floor(Math.random() * pool.length)];
}

function spawnBossMinion() {
    if (!gameState.running) return;
    const pos = randomEdgePosition();
    let enemy = enemyTemplate(gameState.wave);
    // boss minions are a bit tougher than normal wave enemies
    enemy.maxHealth = Math.floor(enemy.maxHealth * 1.2);
    enemy.health = enemy.maxHealth;
    enemy.damage = Math.floor(enemy.damage * 1.1);
    enemy.x = pos.x;
    enemy.y = pos.y;
    enemy = applyType(enemy, pickBossMinionType(gameState.wave));
    gameState.enemies.push(enemy);
    gameState.enemiesSpawned++;
    createEnemyElement(enemy);
}

// ─── Enemy DOM ───
function enemyTypeClass(enemy) {
    if (enemy.isBoss) return ' boss';
    if (enemy.type !== 'normal') return ` enemy-${enemy.type}`;
    return '';
}

function createEnemyElement(enemy) {
    const el = document.createElement('div');
    el.className = `entity enemy${enemyTypeClass(enemy)}`;
    el.id = `enemy-${enemy.id}`;
    const label = enemy.isBoss ? '' : (enemy.type !== 'normal' ? `<div class="enemy-label">${enemy.type}</div>` : '');
    el.innerHTML = `
        <div class="enemy-health"><div class="enemy-health-fill" style="width:100%"></div></div>
        ${label}
        <div class="enemy-face"></div>`;
    el.style.left = enemy.x + 'px';
    el.style.top  = enemy.y + 'px';
    arena.appendChild(el);
}

function updateEnemyEl(enemy) {
    const el = document.getElementById(`enemy-${enemy.id}`);
    if (!el) return;
    el.style.left = enemy.x + 'px';
    el.style.top  = enemy.y + 'px';
    el.querySelector('.enemy-health-fill').style.width =
        (enemy.health / enemy.maxHealth * 100) + '%';
}

function removeEnemy(enemy) {
    const el = document.getElementById(`enemy-${enemy.id}`);
    if (el) el.remove();
}

// ─── Enemy Ranged Attack (projectile toward player) ───
function enemyShoot(enemy) {
    const now = Date.now();
    if (now - enemy.lastShot < enemy.shootCooldown) return;
    enemy.lastShot = now;
    const p = gameState.player;
    const angle = angleBetween(enemy.x, enemy.y, p.x, p.y);
    const spd = 3;
    const eb = {
        id: Date.now() + Math.random(),
        x: enemy.x + 20,
        y: enemy.y + 20,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        damage: Math.floor(enemy.damage * 0.8),
        alive: true
    };
    gameState.enemyBullets.push(eb);
    // create DOM element
    const el = document.createElement('div');
    el.className = 'enemy-bullet';
    el.id = `ebullet-${eb.id}`;
    el.style.left = eb.x + 'px';
    el.style.top  = eb.y + 'px';
    arena.appendChild(el);
}

function updateEnemyBullets() {
    const p = gameState.player;
    for (let i = gameState.enemyBullets.length - 1; i >= 0; i--) {
        const b = gameState.enemyBullets[i];
        b.x += b.vx;
        b.y += b.vy;

        // out of bounds
        if (b.x < -10 || b.x > arenaW() + 10 || b.y < -10 || b.y > arenaH() + 10) {
            removeEBullet(b, i);
            continue;
        }

        // hit player?
        if (dist(b.x, b.y, p.x + 24, p.y + 24) < 28) {
            const dmg = Math.max(1, b.damage - p.armor);
            p.health -= dmg;
            showDamageNumber(p.x + 10, p.y - 10, dmg, 'normal');
            if (p.health <= 0) gameOver();
            removeEBullet(b, i);
            continue;
        }

        // update position
        const el = document.getElementById(`ebullet-${b.id}`);
        if (el) { el.style.left = b.x + 'px'; el.style.top = b.y + 'px'; }
    }
}

function removeEBullet(b, idx) {
    const el = document.getElementById(`ebullet-${b.id}`);
    if (el) el.remove();
    gameState.enemyBullets.splice(idx, 1);
}

// ─── Enemy AI (called from game loop) ───
function updateEnemies() {
    const p = gameState.player;

    gameState.enemies.forEach(enemy => {
        const d = dist(p.x, p.y, enemy.x, enemy.y);
        const eSpdMul = p.enemySpeedMul || 1;

        // ranged enemies and bosses shoot from distance
        if ((enemy.type === 'ranged' || enemy.isBoss) && d < 300 && d > 60) {
            enemyShoot(enemy);
        }

        const attackDist = enemy.isBoss ? 50 : 34;

        if (d > attackDist) {
            // ranged enemies try to keep distance
            if (enemy.type === 'ranged' && d < 100) {
                // back away
                const angle = angleBetween(enemy.x, enemy.y, p.x, p.y);
                enemy.x -= Math.cos(angle) * enemy.speed * 0.5 * eSpdMul;
                enemy.y -= Math.sin(angle) * enemy.speed * 0.5 * eSpdMul;
            } else {
                const angle = angleBetween(enemy.x, enemy.y, p.x, p.y);
                enemy.x += Math.cos(angle) * enemy.speed * eSpdMul;
                enemy.y += Math.sin(angle) * enemy.speed * eSpdMul;
            }
        } else {
            enemyAttack(enemy);
        }

        updateEnemyEl(enemy);
    });

    updateEnemyBullets();
}

function enemyAttack(enemy) {
    const now = Date.now();
    if (now - enemy.lastAttack < 1000) return;
    enemy.lastAttack = now;

    const dmg = Math.max(1, enemy.damage - gameState.player.armor);
    gameState.player.health -= dmg;
    showDamageNumber(gameState.player.x + 10, gameState.player.y - 10, dmg, 'normal');

    if (gameState.player.health <= 0) gameOver();
}
