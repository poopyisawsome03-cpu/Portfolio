// ===================== ZOMBIE FUNCTIONS =====================

function spawnZombie(type) {
    const t = ZOMBIE_TYPES[type];
    const side = Math.random() < 0.5 ? -1 : 1;
    const waveScale = 1 + (wave - 1) * 0.12;
    zombies.push({
        x: side === -1 ? -30 : W + 30,
        y: GROUND_Y,
        w: t.w, h: t.h,
        hp: Math.floor(t.hp * waveScale),
        maxHp: Math.floor(t.hp * waveScale),
        speed: t.speed + (wave - 1) * 0.03,
        damage: Math.floor(t.damage * (1 + (wave - 1) * 0.08)),
        color: t.color,
        name: t.name,
        score: t.score,
        attackCooldown: 0,
        hitFlash: 0,
        knockback: 0,
        type: type,
        animTimer: Math.random() * 100,
    });
}

function pickZombieType() {
    const available = [];
    if (wave >= 1) available.push('normal');
    if (wave >= 2) available.push('fast');
    if (wave >= 3) available.push('strong');
    if (wave >= 4) available.push('big');
    if (wave >= 6) available.push('berserker');

    let totalWeight = 0;
    for (const t of available) totalWeight += ZOMBIE_TYPES[t].spawnWeight;
    let r = Math.random() * totalWeight;
    for (const t of available) {
        r -= ZOMBIE_TYPES[t].spawnWeight;
        if (r <= 0) return t;
    }
    return 'normal';
}
