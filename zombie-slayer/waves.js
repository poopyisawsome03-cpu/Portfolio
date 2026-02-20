// ===================== WAVE MANAGEMENT =====================

function startWave() {
    const numZombies = 4 + wave * 3;
    zombiesToSpawn = numZombies;
    waveZombiesLeft = numZombies;
    waveActive = true;
    spawnTimer = 0;

    // Boss wave every 5
    if (wave % 5 === 0) {
        zombiesToSpawn += 1; // boss
        waveZombiesLeft += 1;
    }

    announceWave(wave);
}

function announceWave(num) {
    const el = document.getElementById('waveAnnounce');
    el.textContent = `WAVE ${num}`;
    if (num % 5 === 0) el.textContent += ' — BOSS!';
    el.style.opacity = 1;
    setTimeout(() => el.style.opacity = 0, 2000);
}
