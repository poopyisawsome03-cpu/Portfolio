// ===================== RENDERING =====================

function draw() {
    ctx.save();

    // Screen shake
    if (screenShake > 0) {
        ctx.translate(
            (Math.random() - 0.5) * screenShake * 3,
            (Math.random() - 0.5) * screenShake * 3
        );
    }

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGrad.addColorStop(0, '#0d1117');
    skyGrad.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, GROUND_Y);

    // Moon
    ctx.fillStyle = '#ddd';
    ctx.beginPath();
    ctx.arc(750, 80, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0d1117';
    ctx.beginPath();
    ctx.arc(765, 72, 30, 0, Math.PI * 2);
    ctx.fill();

    // Stars
    ctx.fillStyle = '#555';
    for (let i = 0; i < 30; i++) {
        const sx = ((i * 137 + 50) % W);
        const sy = ((i * 89 + 20) % (GROUND_Y - 40));
        ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Ground
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(W, GROUND_Y);
    ctx.stroke();

    // Ground detail
    ctx.fillStyle = '#222';
    for (let i = 0; i < W; i += 40) {
        ctx.fillRect(i, GROUND_Y + 5, 20, 2);
    }

    // Damage flash
    if (damageFlash > 0) {
        ctx.fillStyle = `rgba(231, 76, 60, ${damageFlash * 0.04})`;
        ctx.fillRect(0, 0, W, H);
    }

    // Draw zombies
    for (const z of zombies) {
        drawZombie(z);
    }

    // Draw player
    drawPlayer();

    // Particles
    for (const p of particles) {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // Damage numbers
    ctx.font = 'bold 18px "Segoe UI"';
    ctx.textAlign = 'center';
    for (const d of damageNumbers) {
        const alpha = d.life / 40;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ff6b6b';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(d.text, d.x, d.y);
        ctx.fillText(d.text, d.x, d.y);
    }
    ctx.globalAlpha = 1;

    // Combo display
    if (player.combo >= 2) {
        ctx.font = 'bold 24px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f39c12';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`${player.combo}x COMBO!`, player.x, player.y - player.h - 25);
        ctx.fillText(`${player.combo}x COMBO!`, player.x, player.y - player.h - 25);
    }

    // Dash cooldown indicator
    if (player.dashCooldown > 0) {
        ctx.fillStyle = '#555';
        ctx.font = '12px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText(`Dash: ${Math.ceil(player.dashCooldown / 60)}s`, player.x, player.y + 20);
    }

    // Wave transition text
    if (!waveActive && waveDelay > 0 && wave > 1) {
        ctx.font = 'bold 22px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#aaa';
        ctx.fillText(`Next wave in ${Math.ceil(waveDelay / 60)}...`, W / 2, H / 2 - 60);
        ctx.fillStyle = '#4CAF50';
        ctx.font = '16px "Segoe UI"';
        ctx.fillText('+15 HP', W / 2, H / 2 - 35);
    }

    ctx.restore();
}

function drawPlayer() {
    const px = player.x;
    const py = player.y;
    const f = player.facing;

    // Invincible blink
    if (player.invincible > 0 && Math.floor(player.invincible / 2) % 2 === 0) {
        ctx.globalAlpha = 0.4;
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(px, py + 2, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    const legAnim = Math.sin(Date.now() * 0.01) * (keys['KeyA'] || keys['KeyD'] || keys['ArrowLeft'] || keys['ArrowRight'] ? 8 : 0);
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(px - 8, py - 16, 6, 16 + legAnim * 0.3);
    ctx.fillRect(px + 2, py - 16, 6, 16 - legAnim * 0.3);

    // Body
    ctx.fillStyle = '#34495e';
    ctx.fillRect(px - 12, py - 40, 24, 26);

    // Armor plate
    ctx.fillStyle = '#546e7a';
    ctx.fillRect(px - 10, py - 38, 20, 10);

    // Head
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(px - 8, py - 52, 16, 14);

    // Eyes
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(px + (f > 0 ? 2 : -6), py - 48, 4, 4);

    // Hair
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(px - 9, py - 54, 18, 4);

    // Sword
    ctx.save();
    ctx.translate(px + f * 14, py - 32);
    if (player.attacking) {
        ctx.rotate((f > 0 ? -1 : 1) * (player.swordAngle * Math.PI / 180 - Math.PI / 4));
    } else {
        ctx.rotate(f > 0 ? -0.3 : 0.3 + Math.PI);
    }
    // Blade
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(-2, -40, 5, 35);
    // Blade edge
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(-1, -40, 2, 35);
    // Guard
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(-6, -6, 13, 4);
    // Handle
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, -2, 3, 12);
    ctx.restore();

    ctx.globalAlpha = 1;
}

function drawZombie(z) {
    const zx = z.x;
    const zy = z.y;
    const dir = player.x > zx ? 1 : -1;
    const bob = Math.sin(z.animTimer * 2) * 2;

    // Flash on hit
    if (z.hitFlash > 0) {
        ctx.globalAlpha = 0.5 + Math.sin(z.hitFlash * 2) * 0.5;
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(zx, zy + 2, z.w * 0.6, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const scale = z.type === 'boss' ? 1.3 : (z.type === 'big' ? 1.15 : 1);

    ctx.save();
    ctx.translate(zx, zy + bob);

    // Legs
    const legAnim2 = Math.sin(z.animTimer * 3) * 5;
    ctx.fillStyle = darkenColor(z.color, 0.5);
    ctx.fillRect(-7 * scale, -14 * scale, 5 * scale, 14 * scale + legAnim2 * 0.3);
    ctx.fillRect(2 * scale, -14 * scale, 5 * scale, 14 * scale - legAnim2 * 0.3);

    // Body
    ctx.fillStyle = z.hitFlash > 0 ? '#fff' : z.color;
    ctx.fillRect(-z.w / 2, -z.h + 10 * scale, z.w, z.h - 22 * scale);

    // Torn clothes detail
    ctx.fillStyle = darkenColor(z.color, 0.7);
    ctx.fillRect(-z.w / 2 + 2, -z.h + 14 * scale, z.w - 4, 4 * scale);

    // Head
    ctx.fillStyle = z.hitFlash > 0 ? '#fff' : darkenColor(z.color, 0.8);
    const headSize = 12 * scale;
    ctx.fillRect(-headSize / 2, -z.h + 2, headSize, headSize);

    // Eyes (red glow)
    ctx.fillStyle = z.type === 'boss' ? '#ff0' : '#f00';
    ctx.fillRect(dir > 0 ? 1 * scale : -5 * scale, -z.h + 5, 3 * scale, 3 * scale);

    // Arms reaching out
    ctx.fillStyle = z.hitFlash > 0 ? '#fff' : z.color;
    const armReach = Math.sin(z.animTimer * 4) * 4;
    ctx.fillRect(dir * z.w / 2, -z.h + 18 * scale, dir * (12 + armReach), 5 * scale);

    // Boss crown
    if (z.type === 'boss') {
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(-8, -z.h - 4, 4, 6);
        ctx.fillRect(-2, -z.h - 7, 4, 9);
        ctx.fillRect(4, -z.h - 4, 4, 6);
    }

    // HP bar
    const hpW = z.w + 10;
    ctx.fillStyle = '#333';
    ctx.fillRect(-hpW / 2, -z.h - 10, hpW, 4);
    ctx.fillStyle = z.hp / z.maxHp > 0.5 ? '#2ecc71' : (z.hp / z.maxHp > 0.25 ? '#f39c12' : '#e74c3c');
    ctx.fillRect(-hpW / 2, -z.h - 10, hpW * (z.hp / z.maxHp), 4);

    // Name tag for special zombies
    if (z.type !== 'normal') {
        ctx.font = `bold ${10 * scale}px "Segoe UI"`;
        ctx.textAlign = 'center';
        ctx.fillStyle = z.color;
        ctx.fillText(z.name, 0, -z.h - 14);
    }

    ctx.restore();
    ctx.globalAlpha = 1;
}
