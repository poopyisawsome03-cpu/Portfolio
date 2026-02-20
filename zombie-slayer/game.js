// ===================== MAIN GAME LOOP =====================

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ===================== GAME INITIALIZATION =====================
document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('overlay').style.display = 'none';
    gameRunning = true;
    waveDelay = 60;
});

// Start the game loop
gameLoop();
