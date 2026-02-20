// ===================== VISUAL EFFECTS =====================

function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 1) * 6,
            life: 20 + Math.random() * 20,
            maxLife: 40,
            color: color,
            size: 2 + Math.random() * 4,
        });
    }
}

function showDamageNumber(x, y, dmg) {
    damageNumbers.push({ x, y, text: dmg.toString(), life: 40, vy: -2 });
}

function darkenColor(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.floor(r * factor)},${Math.floor(g * factor)},${Math.floor(b * factor)})`;
}
