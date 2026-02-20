/* ═══════════════════════════════════════════
   Game State & Utility Helpers
   ═══════════════════════════════════════════ */

// ─── Difficulty Multipliers ───
const DIFFICULTY = {
    easy:   { hpMul: 0.7, dmgMul: 0.7, spdMul: 0.85, spawnMul: 0.8,  label: 'Easy'   },
    normal: { hpMul: 1.0, dmgMul: 1.0, spdMul: 1.0,  spawnMul: 1.0,  label: 'Normal' },
    hard:   { hpMul: 1.5, dmgMul: 1.4, spdMul: 1.2,  spawnMul: 1.3,  label: 'Hard'   },
    insane: { hpMul: 2.2, dmgMul: 1.8, spdMul: 1.4,  spawnMul: 1.6,  label: 'Insane' }
};

const gameState = {
    running: false,
    animFrameId: null,
    wave: 1,
    kills: 0,
    cardsCollected: 0,
    enemiesRemaining: 0,
    enemiesSpawned: 0,
    enemiesExpected: 0,
    isBossWave: false,
    spawnTimers: [],
    difficulty: 'normal',      // key into DIFFICULTY

    player: {
        x: 350,
        y: 375,
        maxHealth: 100,
        health: 100,
        damage: 10,
        armor: 0,
        attackSpeed: 1,
        critChance: 0.05,
        critDamage: 1.5,
        lifesteal: 0,
        lifestealChance: 0,
        attackRange: 300,
        bulletSpeed: 8,
        lastAttack: 0,
        facingAngle: 0,

        // ─── Weapon flags (all stack) ───
        hasGun: true,           // starts with auto-pistol
        hasSword: false,        // spinning sword orbiting player
        hasCannon: false,       // slow heavy cannon

        // Sword stats
        swordDamage: 20,
        swordRadius: 70,        // orbit radius
        swordSpeed: 12,         // radians per second (spins fast)
        swordAngle: 0,          // current angle (updated per frame)
        swordHitCooldown: 300,  // ms between hits per enemy
        swordLastHits: {},      // enemyId -> timestamp
        swordSpawnInterval: 4000, // ms between sword appearances
        swordDuration: 2500,      // ms sword stays active
        swordActive: false,
        swordLastSpawn: 0,

        // Cannon stats
        cannonDamage: 80,
        cannonSpeed: 4,         // bullet speed (slow)
        cannonCooldown: 2500,   // ms between shots
        cannonLastShot: 0,
        cannonRange: 500,
        cannonAoeRadius: 60     // explosion splash radius
    },

    enemies: [],
    bullets: [],
    enemyBullets: [],           // projectiles shot BY enemies
    buffs: [],
    debuffs: [],                // mythical card debuff labels
    keys: {}
};

function defaultPlayer() {
    return {
        x: 350, y: 375,
        maxHealth: 100, health: 100,
        damage: 10, armor: 0,
        attackSpeed: 1, critChance: 0.05,
        critDamage: 1.5, lifesteal: 0, lifestealChance: 0,
        attackRange: 300, bulletSpeed: 8,
        lastAttack: 0, facingAngle: 0,
        hasGun: true, hasSword: false, hasCannon: false,
        swordDamage: 20, swordRadius: 70, swordSpeed: 12,
        swordAngle: 0, swordHitCooldown: 300, swordLastHits: {},
        swordSpawnInterval: 4000, swordDuration: 2500,
        swordActive: false, swordLastSpawn: 0,
        cannonDamage: 80, cannonSpeed: 4,
        cannonCooldown: 2500, cannonLastShot: 0, cannonRange: 500,
        cannonAoeRadius: 60
    };
}

// ─── Helpers ───
function dist(ax, ay, bx, by) {
    const dx = ax - bx, dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
}

function angleBetween(ax, ay, bx, by) {
    return Math.atan2(by - ay, bx - ax);
}

function clearSpawnTimers() {
    gameState.spawnTimers.forEach(id => clearTimeout(id));
    gameState.spawnTimers = [];
}

function diff() { return DIFFICULTY[gameState.difficulty]; }
