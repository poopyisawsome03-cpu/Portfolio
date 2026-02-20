// ===================== UI AND GAME OVER =====================

function showGameOver() {
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'flex';
    overlay.innerHTML = `
        <h1>GAME OVER</h1>
        <h2 style="color:#e74c3c">You were overwhelmed...</h2>
        <p style="font-size:20px;color:#eee;margin:8px 0">Score: <b style="color:#f39c12">${score}</b></p>
        <p style="font-size:18px;color:#ccc">Waves Survived: <b>${wave}</b></p>
        <p style="font-size:18px;color:#ccc">Zombies Killed: <b>${kills}</b></p>
        <p style="font-size:16px;color:#888;margin-top:8px">Best Combo: ${player.combo > 0 ? player.combo + 'x' : 'None'}</p>
        <button id="startBtn" onclick="resetGame()">PLAY AGAIN</button>
    `;
}

window.resetGame = function() {
    player.x = W / 2;
    player.hp = player.maxHp;
    player.attacking = false;
    player.attackTimer = 0;
    player.attackCooldown = 0;
    player.dashCooldown = 0;
    player.dashTimer = 0;
    player.invincible = 0;
    player.combo = 0;
    player.comboTimer = 0;
    player.facing = 1;
    score = 0;
    kills = 0;
    wave = 1;
    zombies = [];
    particles = [];
    damageNumbers = [];
    screenShake = 0;
    damageFlash = 0;
    waveActive = false;
    waveDelay = 60;
    zombiesToSpawn = 0;
    document.getElementById('overlay').style.display = 'none';
    gameRunning = true;
}

function updateUI() {
    document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
    document.getElementById('waveDisplay').textContent = `Wave: ${wave}`;
    document.getElementById('killDisplay').textContent = `Kills: ${kills}`;
    const hpPct = Math.max(0, player.hp / player.maxHp * 100);
    document.getElementById('healthBar').style.width = hpPct + '%';
}
