// ===================== GAME UPDATE LOGIC =====================

function update() {
    if (!gameRunning) return;

    // Player movement
    let moveDir = 0;
    if (keys['KeyA'] || keys['ArrowLeft']) moveDir = -1;
    if (keys['KeyD'] || keys['ArrowRight']) moveDir = 1;
    if (keys['Space'] && !player.attacking) playerAttack();

    // Dash
    if (keys['ShiftLeft'] || keys['ShiftRight']) {
        if (player.dashCooldown <= 0 && moveDir !== 0) {
            player.dashTimer = 8;
            player.dashCooldown = 120;
            player.invincible = 12;
            spawnParticles(player.x, player.y - 20, '#fff', 8);
        }
    }

    if (player.dashTimer > 0) {
        player.x += player.facing * player.dashSpeed;
        player.dashTimer--;
    } else if (moveDir !== 0) {
        player.x += moveDir * player.speed;
        player.facing = moveDir;
    }

    player.x = Math.max(20, Math.min(W - 20, player.x));
    if (player.dashCooldown > 0) player.dashCooldown--;
    if (player.attackCooldown > 0) player.attackCooldown--;
    if (player.invincible > 0) player.invincible--;

    // Attack animation
    if (player.attacking) {
        player.swordAngle += 15;
        player.attackTimer--;
        if (player.attackTimer <= 0) player.attacking = false;
    }

    // Combo
    if (player.comboTimer > 0) {
        player.comboTimer--;
    } else {
        player.combo = 0;
    }

    // Wave management
    if (!waveActive) {
        waveDelay--;
        if (waveDelay <= 0) startWave();
    } else {
        // Spawn zombies over time
        spawnTimer--;
        if (spawnTimer <= 0 && zombiesToSpawn > 0) {
            if (wave % 5 === 0 && zombiesToSpawn === 1) {
                spawnZombie('boss');
            } else {
                spawnZombie(pickZombieType());
            }
            zombiesToSpawn--;
            spawnTimer = Math.max(15, 50 - wave * 2);
        }

        // Check if wave is cleared
        if (zombiesToSpawn <= 0 && zombies.length === 0) {
            waveActive = false;
            wave++;
            waveDelay = 120;
            // Small heal between waves
            player.hp = Math.min(player.maxHp, player.hp + 15);
        }
    }

    // Update zombies
    for (let i = zombies.length - 1; i >= 0; i--) {
        const z = zombies[i];
        z.animTimer += 0.1;

        // Move toward player
        const dir = player.x > z.x ? 1 : -1;
        if (z.knockback !== 0) {
            z.x += z.knockback;
            z.knockback *= 0.7;
            if (Math.abs(z.knockback) < 0.5) z.knockback = 0;
        } else {
            z.x += dir * z.speed;
        }

        if (z.hitFlash > 0) z.hitFlash--;
        if (z.attackCooldown > 0) z.attackCooldown--;

        // Attack player
        const dist = Math.abs(z.x - player.x);
        if (dist < z.w / 2 + player.w / 2 + 10 && z.attackCooldown <= 0) {
            if (player.invincible <= 0) {
                player.hp -= z.damage;
                damageFlash = 8;
                screenShake = 6;
                spawnParticles(player.x, player.y - 25, '#e74c3c', 5);
            }
            z.attackCooldown = 60;
        }

        // Dead zombie
        if (z.hp <= 0) {
            score += z.score * (1 + Math.floor(player.combo / 3));
            kills++;
            spawnParticles(z.x, z.y - z.h / 2, z.color, 15);
            zombies.splice(i, 1);
        }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }

    // Damage numbers
    for (let i = damageNumbers.length - 1; i >= 0; i--) {
        const d = damageNumbers[i];
        d.y += d.vy;
        d.life--;
        if (d.life <= 0) damageNumbers.splice(i, 1);
    }

    // Screen shake
    if (screenShake > 0) screenShake--;
    if (damageFlash > 0) damageFlash--;

    // Update UI
    updateUI();

    // Player death
    if (player.hp <= 0) {
        gameRunning = false;
        showGameOver();
    }
}
