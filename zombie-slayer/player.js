// ===================== PLAYER =====================
const player = {
    x: W / 2, y: GROUND_Y,
    w: 30, h: 50,
    speed: 4.5,
    hp: 100, maxHp: 100,
    attacking: false,
    attackTimer: 0,
    attackCooldown: 0,
    attackRange: 70,
    attackDamage: 25,
    facing: 1, // 1 = right, -1 = left
    dashCooldown: 0,
    dashTimer: 0,
    dashSpeed: 14,
    invincible: 0,
    combo: 0,
    comboTimer: 0,
    swordAngle: 0,
};

function playerAttack() {
    if (player.attackCooldown > 0 || player.attacking) return;
    player.attacking = true;
    player.attackTimer = 12;
    player.attackCooldown = 18;
    player.swordAngle = 0;

    // Hit zombies in range
    let hit = false;
    for (let z of zombies) {
        const dist = Math.abs(z.x - player.x);
        const inFront = (z.x - player.x) * player.facing > -20;
        if (dist < player.attackRange + z.w / 2 && inFront) {
            const dmg = player.attackDamage + (player.combo * 5);
            z.hp -= dmg;
            z.hitFlash = 6;
            z.knockback = player.facing * 8;
            hit = true;
            spawnParticles(z.x, z.y - z.h / 2, z.color, 6);
            showDamageNumber(z.x, z.y - z.h - 10, dmg);
            screenShake = 4;
        }
    }
    if (hit) {
        player.combo++;
        player.comboTimer = 90;
    }
}

// Setup mouse attack
canvas.addEventListener('mousedown', e => { if(gameRunning && e.button === 0) playerAttack(); });
