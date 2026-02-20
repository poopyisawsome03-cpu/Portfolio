/* ═══════════════════════════════════════════
   Player – Multi-Weapon System
   Weapons: Auto-Gun, Spinning Sword, Heavy Cannon
   All stack – picking a weapon card adds it permanently
   ═══════════════════════════════════════════ */

// ─── 1) Auto-Pistol (original gun) ───
function playerAutoShoot() {
    if (!gameState.player.hasGun) return;
    if (gameState.enemies.length === 0) return;

    const now = Date.now();
    const cooldown = 400 / gameState.player.attackSpeed;
    if (now - gameState.player.lastAttack < cooldown) return;

    const p = gameState.player;
    let nearest = null, nearDist = Infinity;
    gameState.enemies.forEach(e => {
        const d = dist(p.x, p.y, e.x, e.y);
        if (d < nearDist) { nearDist = d; nearest = e; }
    });
    if (!nearest || nearDist > p.attackRange) return;

    p.lastAttack = now;
    playerEl.classList.add('shooting');
    setTimeout(() => playerEl.classList.remove('shooting'), 100);

    const angle = angleBetween(p.x, p.y, nearest.x, nearest.y);
    const bullet = {
        id: Date.now() + Math.random(),
        x: p.x + 24, y: p.y + 24,
        vx: Math.cos(angle) * p.bulletSpeed,
        vy: Math.sin(angle) * p.bulletSpeed,
        damage: p.damage,
        isCrit: Math.random() < p.critChance,
        alive: true,
        type: 'gun'
    };
    if (bullet.isCrit) bullet.damage = Math.floor(bullet.damage * p.critDamage);
    gameState.bullets.push(bullet);
    createBulletElement(bullet);
}

// ─── 2) Heavy Cannon (slow, big damage) ───
function playerCannonShoot() {
    if (!gameState.player.hasCannon) return;
    if (gameState.enemies.length === 0) return;

    const now = Date.now();
    const p = gameState.player;
    // Fire rate (attackSpeed) affects cannon cooldown
    const cooldown = p.cannonCooldown / p.attackSpeed;
    if (now - p.cannonLastShot < cooldown) return;

    let nearest = null, nearDist = Infinity;
    gameState.enemies.forEach(e => {
        const d = dist(p.x, p.y, e.x, e.y);
        if (d < nearDist) { nearDist = d; nearest = e; }
    });
    // Range (attackRange) affects cannon range
    const effectiveRange = p.cannonRange + (p.attackRange - 300);
    if (!nearest || nearDist > effectiveRange) return;

    p.cannonLastShot = now;

    const angle = angleBetween(p.x, p.y, nearest.x, nearest.y);
    const bullet = {
        id: Date.now() + Math.random(),
        x: p.x + 24, y: p.y + 24,
        vx: Math.cos(angle) * p.cannonSpeed,
        vy: Math.sin(angle) * p.cannonSpeed,
        damage: p.cannonDamage,
        isCrit: Math.random() < p.critChance,
        alive: true,
        type: 'cannon'
    };
    if (bullet.isCrit) bullet.damage = Math.floor(bullet.damage * p.critDamage);
    gameState.bullets.push(bullet);
    createBulletElement(bullet);
}

// ─── 3) Spinning Sword (spawns periodically, spins fast) ───
let swordEl = null;

function ensureSwordEl() {
    if (!swordEl) {
        swordEl = document.createElement('div');
        swordEl.className = 'spinning-sword';
        swordEl.textContent = '🗡️';
        arena.appendChild(swordEl);
    }
}

function hideSwordEl() {
    if (swordEl) { swordEl.remove(); swordEl = null; }
}

function updateSpinningSword(dt) {
    const p = gameState.player;
    if (!p.hasSword) {
        hideSwordEl();
        return;
    }

    const now = Date.now();

    // periodic spawn logic
    if (!p.swordActive) {
        hideSwordEl();
        if (now - p.swordLastSpawn >= p.swordSpawnInterval) {
            // activate sword
            p.swordActive = true;
            p.swordLastSpawn = now;
        }
        return;
    }

    // check if duration expired
    if (now - p.swordLastSpawn >= p.swordDuration) {
        p.swordActive = false;
        p.swordLastSpawn = now; // reset timer for next spawn
        hideSwordEl();
        return;
    }

    ensureSwordEl();

    // advance angle (fast spin)
    p.swordAngle += p.swordSpeed * dt;
    if (p.swordAngle > Math.PI * 2) p.swordAngle -= Math.PI * 2;

    const cx = p.x + 24 + Math.cos(p.swordAngle) * p.swordRadius;
    const cy = p.y + 24 + Math.sin(p.swordAngle) * p.swordRadius;

    swordEl.style.left = cx - 15 + 'px';
    swordEl.style.top  = cy - 15 + 'px';
    swordEl.style.transform = `rotate(${p.swordAngle * (180 / Math.PI) + 45}deg)`;

    // hit enemies
    const killed = [];
    gameState.enemies.forEach(enemy => {
        const hitR = enemy.isBoss ? 36 : 20;
        if (dist(cx, cy, enemy.x + hitR, enemy.y + hitR) < hitR + 17) {
            const lastHit = p.swordLastHits[enemy.id] || 0;
            if (now - lastHit < p.swordHitCooldown) return;
            p.swordLastHits[enemy.id] = now;

            let dmg = p.swordDamage;
            const isCrit = Math.random() < p.critChance;
            if (isCrit) dmg = Math.floor(dmg * p.critDamage);

            enemy.health -= dmg;
            showDamageNumber(enemy.x + 10, enemy.y - 10, dmg, isCrit ? 'crit' : 'sword');

            if (p.lifesteal > 0 && Math.random() < p.lifestealChance) {
                const heal = Math.floor(dmg * p.lifesteal);
                if (heal > 0) {
                    p.health = Math.min(p.maxHealth, p.health + heal);
                    showDamageNumber(p.x + 10, p.y - 10, heal, 'heal');
                }
            }

            if (enemy.health <= 0) killed.push(enemy);
        }
    });

    processKills(killed);
}

// ─── Explosion visual ───
function showExplosion(x, y) {
    const el = document.createElement('div');
    el.className = 'cannon-explosion';
    el.style.left = (x - 40) + 'px';
    el.style.top  = (y - 40) + 'px';
    arena.appendChild(el);
    setTimeout(() => el.remove(), 400);
}

// ─── Bullet DOM ───
function createBulletElement(bullet) {
    const el = document.createElement('div');
    let cls = 'bullet';
    if (bullet.type === 'cannon') cls += ' cannon-bullet';
    if (bullet.isCrit) cls += ' crit-bullet';
    el.className = cls;
    el.id = `bullet-${bullet.id}`;
    el.style.left = bullet.x + 'px';
    el.style.top  = bullet.y + 'px';
    arena.appendChild(el);
}

function removeBulletElement(bullet) {
    const el = document.getElementById(`bullet-${bullet.id}`);
    if (el) el.remove();
}

// ─── Shared kill processing ───
function processKills(killed) {
    killed.forEach(enemy => {
        removeEnemy(enemy);
        const idx = gameState.enemies.indexOf(enemy);
        if (idx > -1) gameState.enemies.splice(idx, 1);
        gameState.kills++;
        gameState.enemiesRemaining--;
    });

    if (killed.length > 0 && gameState.enemiesRemaining <= 0) {
        clearSpawnTimers();
        gameState.bullets.forEach(b => removeBulletElement(b));
        gameState.bullets = [];
        gameState.enemyBullets.forEach(b => {
            const el = document.getElementById(`ebullet-${b.id}`);
            if (el) el.remove();
        });
        gameState.enemyBullets = [];
        setTimeout(() => showCardSelection(), 500);
    }
}

// ─── Update Bullets (called every frame) ───
function updateBullets() {
    const killed = [];

    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const b = gameState.bullets[i];
        b.x += b.vx;
        b.y += b.vy;

        if (b.x < -10 || b.x > arenaW() + 10 || b.y < -10 || b.y > arenaH() + 10) {
            b.alive = false;
            removeBulletElement(b);
            gameState.bullets.splice(i, 1);
            continue;
        }

        let hit = false;
        for (let j = 0; j < gameState.enemies.length; j++) {
            const enemy = gameState.enemies[j];
            const hitRadius = enemy.isBoss ? 36 : 20;
            if (dist(b.x, b.y, enemy.x + hitRadius, enemy.y + hitRadius) < hitRadius + 5) {

                // ── Cannon AOE explosion ──
                if (b.type === 'cannon') {
                    showExplosion(b.x, b.y);
                    const p = gameState.player;
                    const aoeR = p.cannonAoeRadius;
                    gameState.enemies.forEach(ae => {
                        const aeHitR = ae.isBoss ? 36 : 20;
                        if (dist(b.x, b.y, ae.x + aeHitR, ae.y + aeHitR) < aoeR) {
                            const aoeDmg = (ae === enemy) ? b.damage : Math.floor(b.damage * 0.6);
                            ae.health -= aoeDmg;
                            showDamageNumber(ae.x + 10, ae.y - 10, aoeDmg, b.isCrit ? 'crit' : 'normal');
                            if (ae.health <= 0 && !killed.includes(ae)) killed.push(ae);
                        }
                    });
                    // lifesteal on primary (chance-based)
                    if (p.lifesteal > 0 && Math.random() < p.lifestealChance) {
                        const heal = Math.floor(b.damage * p.lifesteal);
                        if (heal > 0) {
                            p.health = Math.min(p.maxHealth, p.health + heal);
                            showDamageNumber(p.x + 10, p.y - 10, heal, 'heal');
                        }
                    }
                } else {
                    // ── Normal gun bullet (single target) ──
                    enemy.health -= b.damage;
                    showDamageNumber(enemy.x + 10, enemy.y - 10, b.damage, b.isCrit ? 'crit' : 'normal');

                    const p = gameState.player;
                    if (p.lifesteal > 0 && Math.random() < p.lifestealChance) {
                        const heal = Math.floor(b.damage * p.lifesteal);
                        if (heal > 0) {
                            p.health = Math.min(p.maxHealth, p.health + heal);
                            showDamageNumber(p.x + 10, p.y - 10, heal, 'heal');
                        }
                    }

                    if (enemy.health <= 0 && !killed.includes(enemy)) killed.push(enemy);
                }

                b.alive = false;
                removeBulletElement(b);
                gameState.bullets.splice(i, 1);
                hit = true;
                break;
            }
        }

        if (!hit && b.alive) {
            const el = document.getElementById(`bullet-${b.id}`);
            if (el) { el.style.left = b.x + 'px'; el.style.top = b.y + 'px'; }
        }
    }

    processKills(killed);
}

// ─── Player Movement (called from game loop) ───
function updatePlayer() {
    const p = gameState.player;
    const w = arenaW();
    const h = arenaH();
    const speed = 4 * (p.moveSpeedMul || 1);

    if (gameState.keys['ArrowUp']    || gameState.keys['KeyW']) p.y = Math.max(0, p.y - speed);
    if (gameState.keys['ArrowDown']  || gameState.keys['KeyS']) p.y = Math.min(h - 48, p.y + speed);
    if (gameState.keys['ArrowLeft']  || gameState.keys['KeyA']) p.x = Math.max(0, p.x - speed);
    if (gameState.keys['ArrowRight'] || gameState.keys['KeyD']) p.x = Math.min(w - 48, p.x + speed);

    if (gameState.enemies.length > 0) {
        let nearest = null, nearDist = Infinity;
        gameState.enemies.forEach(e => {
            const d = dist(p.x, p.y, e.x, e.y);
            if (d < nearDist) { nearDist = d; nearest = e; }
        });
        if (nearest) {
            p.facingAngle = angleBetween(p.x, p.y, nearest.x, nearest.y);
        }
    }
}
