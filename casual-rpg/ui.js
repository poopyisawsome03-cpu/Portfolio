/* ═══════════════════════════════════════════
   UI – DOM Cache, Updates, Damage Numbers, Buffs
   ═══════════════════════════════════════════ */

// ─── DOM Cache ───
const arena          = document.getElementById('gameArena');
const playerEl       = document.getElementById('player');
const healthBar      = document.getElementById('healthBar');
const healthText     = document.getElementById('healthText');
const damageText     = document.getElementById('damageText');
const armorText      = document.getElementById('armorText');
const killsText      = document.getElementById('killsText');
const waveInfo       = document.getElementById('waveInfo');
const buffsDisplay   = document.getElementById('buffsDisplay');
const cardModal      = document.getElementById('cardModal');
const cardsContainer = document.getElementById('cardsContainer');
const cardTitle      = document.getElementById('cardTitle');
const weaponsDisplay = document.getElementById('weaponsDisplay');
const debuffsDisplay = document.getElementById('debuffsDisplay');

function arenaW() { return arena.offsetWidth; }
function arenaH() { return arena.offsetHeight; }

// ─── HUD ───
function updateUI() {
    const p = gameState.player;
    healthBar.style.width = (p.health / p.maxHealth * 100) + '%';
    healthText.textContent = `${Math.ceil(p.health)}/${p.maxHealth}`;
    damageText.textContent = p.damage;
    armorText.textContent  = p.armor;
    killsText.textContent  = gameState.kills;

    // position player
    playerEl.style.left = p.x + 'px';
    playerEl.style.top  = p.y + 'px';

    // rotate gun to face direction
    const gun = playerEl.querySelector('.player-gun');
    if (gun) {
        const deg = p.facingAngle * (180 / Math.PI);
        gun.style.transform = `rotate(${deg}deg)`;
    }

    // weapons indicator
    if (weaponsDisplay) {
        const items = [];
        if (p.hasGun)    items.push(`<span class="weapon-tag gun-tag">🔫 Pistol (${p.damage})</span>`);
        if (p.hasSword)  items.push(`<span class="weapon-tag sword-tag">🗡️ Sword (${p.swordDamage})</span>`);
        if (p.hasCannon) items.push(`<span class="weapon-tag cannon-tag">💣 Cannon (${p.cannonDamage})</span>`);
        weaponsDisplay.innerHTML = items.length ? items.join('') : '<span style="color:#666">Pistol only</span>';
    }
}

function updateBuffsDisplay() {
    if (gameState.buffs.length === 0) {
        buffsDisplay.innerHTML = '<span style="color:#666;">No buffs yet – defeat enemies to earn cards!</span>';
    } else {
        buffsDisplay.innerHTML = gameState.buffs
            .map(b => `<div class="buff-icon">${b.icon} ${b.name}</div>`).join('');
    }
    updateDebuffsDisplay();
}

function updateDebuffsDisplay() {
    if (!debuffsDisplay) return;
    const debuffs = gameState.debuffs || [];
    if (debuffs.length === 0) {
        debuffsDisplay.innerHTML = '<span style="color:#666;">No debuffs – mythical cards carry a price!</span>';
    } else {
        debuffsDisplay.innerHTML = debuffs
            .map(d => `<div class="debuff-icon">💀 ${d}</div>`).join('');
    }
}

// Tab switching for side panel
function switchTab(tabName) {
    document.querySelectorAll('.side-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.side-tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`.side-tab[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// ─── Damage Numbers ───
function showDamageNumber(x, y, amount, type = 'normal') {
    const el = document.createElement('div');
    el.className = `damage-number ${type}`;
    el.textContent = type === 'heal' ? `+${amount}` : `-${amount}`;
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    arena.appendChild(el);
    setTimeout(() => el.remove(), 800);
}
