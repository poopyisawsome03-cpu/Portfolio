// Game state initialization
let gameState = {
    player: null,
    enemy: null,
    projectiles: [],
    powerups: [],
    gameOver: false,
    gameWon: false,
    lastFireTime: 0,
    fireDelay: 30, // frames
    mouseX: CANVAS_WIDTH / 2,
    mouseY: CANVAS_HEIGHT / 2,
    score: 0,
    kills: 0,
    wave: 1,
    shakeIntensity: 0,
    shakeTime: 0,
};

// Initialize game after all classes are loaded
function initializeGame() {
    // Reset all game state
    const groundY = CANVAS_HEIGHT - 50;
    const spawnY = groundY - 40;
    gameState.player = new Character(CANVAS_WIDTH * 0.1, spawnY, true);
    gameState.enemy = new EnemyAI(CANVAS_WIDTH * 0.8, spawnY);
    gameState.projectiles = [];
    gameState.powerups = [];
    gameState.gameOver = false;
    gameState.gameWon = false;
    gameState.lastFireTime = 0;
    gameState.fireDelay = 30; // Reset to default
    gameState.score = 0;
    gameState.kills = 0;
    gameState.wave = 1;
    gameState.shakeIntensity = 0;
    gameState.shakeTime = 0;
    
    // Hide game over screen
    document.getElementById('gameOver').style.display = 'none';
}

// ==================== INPUT HANDLING ====================

const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === ' ') {
        gameState.player.jump();
        e.preventDefault();
    }
    
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    gameState.mouseX = e.clientX - rect.left;
    gameState.mouseY = e.clientY - rect.top;
});

window.addEventListener('click', () => {
    firePlayerRailgun();
});

// ==================== FIRING ====================

function firePlayerRailgun() {
    if (gameState.lastFireTime > gameState.fireDelay) {
        gameState.lastFireTime = 0;
        const beam = new LaserBeam(
            gameState.player.x + gameState.player.width / 2,
            gameState.player.y + gameState.player.height / 2,
            gameState.mouseX,
            gameState.mouseY,
            true
        );
        gameState.projectiles.push(beam);
    }
}

// ==================== COOLDOWN & HUD ====================

function triggerScreenShake(intensity = 5, duration = 8) {
    gameState.shakeIntensity = intensity;
    gameState.shakeTime = duration;
}

function updateCooldown() {
    gameState.lastFireTime++;
    
    // Update screen shake
    if (gameState.shakeTime > 0) {
        gameState.shakeTime--;
    } else {
        gameState.shakeIntensity = 0;
    }
}

function updateHUD() {
    document.getElementById('playerHealth').textContent = Math.ceil(gameState.player.health);
    const playerHealthPercent = Math.max(0, (gameState.player.health / gameState.player.maxHealth) * 100);
    document.getElementById('playerHealthBar').style.width = playerHealthPercent + '%';

    document.getElementById('enemyHealth').textContent = Math.ceil(gameState.enemy.health);
    const enemyHealthPercent = Math.max(0, (gameState.enemy.health / gameState.enemy.maxHealth) * 100);
    document.getElementById('enemyHealthBar').style.width = enemyHealthPercent + '%';

    const cooldownRemaining = Math.max(0, gameState.fireDelay - gameState.lastFireTime);
    document.getElementById('cooldown').textContent = (cooldownRemaining / 30).toFixed(1);
    
    // Update score
    if (document.getElementById('score')) {
        document.getElementById('score').textContent = gameState.score;
    }

    if (document.getElementById('wave')) {
        document.getElementById('wave').textContent = gameState.wave;
    }
}

// ==================== COLLISION DETECTION ====================

function lineRectangleIntersection(x1, y1, x2, y2, rect) {
    // Check if line segment from (x1,y1) to (x2,y2) intersects with rectangle
    const left = rect.x;
    const right = rect.x + rect.width;
    const top = rect.y;
    const bottom = rect.y + rect.height;

    // Check if either endpoint is inside the rectangle
    if ((x1 >= left && x1 <= right && y1 >= top && y1 <= bottom) ||
        (x2 >= left && x2 <= right && y2 >= top && y2 <= bottom)) {
        return true;
    }

    // Check if line segment intersects any edge
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Check left edge
    if (dx !== 0) {
        const t = (left - x1) / dx;
        if (t >= 0 && t <= 1) {
            const y = y1 + t * dy;
            if (y >= top && y <= bottom) return true;
        }
    }

    // Check right edge
    if (dx !== 0) {
        const t = (right - x1) / dx;
        if (t >= 0 && t <= 1) {
            const y = y1 + t * dy;
            if (y >= top && y <= bottom) return true;
        }
    }

    // Check top edge
    if (dy !== 0) {
        const t = (top - y1) / dy;
        if (t >= 0 && t <= 1) {
            const x = x1 + t * dx;
            if (x >= left && x <= right) return true;
        }
    }

    // Check bottom edge
    if (dy !== 0) {
        const t = (bottom - y1) / dy;
        if (t >= 0 && t <= 1) {
            const x = x1 + t * dx;
            if (x >= left && x <= right) return true;
        }
    }

    return false;
}

// ==================== POWER-UP HANDLING ====================

function spawnPowerUp(x, y) {
    const types = ['health', 'rapidfire', 'shield'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    gameState.powerups.push(new PowerUp(x, y, randomType));
}

function updatePowerUps() {
    // Update power-ups
    for (let i = gameState.powerups.length - 1; i >= 0; i--) {
        gameState.powerups[i].update();
        
        // Check if player collects power-up
        if (gameState.powerups[i].isColliding(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height)) {
            applyPowerUp(gameState.powerups[i].type, gameState.powerups[i].value);
            gameState.powerups.splice(i, 1);
            continue;
        }
        
        // Remove dead power-ups
        if (!gameState.powerups[i].isAlive()) {
            gameState.powerups.splice(i, 1);
        }
    }
}

function applyPowerUp(type, value) {
    if (type === 'health') {
        gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + value);
        gameState.score += 50;
    } else if (type === 'rapidfire') {
        gameState.fireDelay = Math.max(15, gameState.fireDelay - value);
        gameState.score += 100;
    } else if (type === 'shield') {
        gameState.player.shield = value;
        gameState.score += 150;
    }
    triggerScreenShake(3, 5); // Flash effect
}

function startNextWave() {
    gameState.wave++;

    const baseHealth = 100;
    const healthBonus = (gameState.wave - 1) * 20;
    const baseFireDelay = 100;
    const fireDelayBonus = (gameState.wave - 1) * 5;
    const baseSpeed = 3.5;
    const speedBonus = (gameState.wave - 1) * 0.2;

    gameState.enemy = new EnemyAI(800, 500);
    gameState.enemy.maxHealth = baseHealth + healthBonus;
    gameState.enemy.health = gameState.enemy.maxHealth;
    gameState.enemy.fireDelay = Math.max(40, baseFireDelay - fireDelayBonus);
    gameState.enemy.speed = Math.min(6, baseSpeed + speedBonus);

    gameState.projectiles = [];
    gameState.lastFireTime = 0;
}

function checkCollisions() {
    // Check projectile collisions with characters
    for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
        const proj = gameState.projectiles[i];

        // Check player hit (use line-rectangle intersection)
        if (proj.isPlayerProjectile === false) {
            if (lineRectangleIntersection(proj.startX, proj.startY, proj.endX, proj.endY, {
                x: gameState.player.x,
                y: gameState.player.y,
                width: gameState.player.width,
                height: gameState.player.height
            })) {
                if (!proj.hasDealtDamage) {
                    if (gameState.player.shield > 0) {
                        gameState.player.shield -= 15;
                    } else {
                        gameState.player.takeDamage(15);
                    }
                    proj.hasDealtDamage = true;
                    triggerScreenShake(8, 10);
                }
                continue;
            }
        }

        // Check enemy hit
        if (proj.isPlayerProjectile === true) {
            if (lineRectangleIntersection(proj.startX, proj.startY, proj.endX, proj.endY, {
                x: gameState.enemy.x,
                y: gameState.enemy.y,
                width: gameState.enemy.width,
                height: gameState.enemy.height
            })) {
                if (!proj.hasDealtDamage) {
                    gameState.enemy.takeDamage(20);
                    gameState.score += 10;
                    proj.hasDealtDamage = true;
                    triggerScreenShake(5, 8);
                }
                continue;
            }
        }

        // Remove dead projectiles
        if (!proj.isAlive()) {
            gameState.projectiles.splice(i, 1);
        }
    }
}

// ==================== GAME UPDATE ====================

function update() {
    if (gameState.gameOver) return;

    // Player movement
    gameState.player.stopMove();
    if (keys['ArrowLeft'] || keys['a']) {
        gameState.player.moveLeft();
    }
    if (keys['ArrowRight'] || keys['d']) {
        gameState.player.moveRight();
    }

    // Update characters
    gameState.player.update();
    gameState.enemy.update(gameState.player.x, gameState.player.y);

    // Enemy fire
    const enemyProjectile = gameState.enemy.fire(gameState.player.x, gameState.player.y);
    if (enemyProjectile) {
        gameState.projectiles.push(enemyProjectile);
    }

    // Update projectiles
    for (let proj of gameState.projectiles) {
        proj.update();
    }

    // Update power-ups
    updatePowerUps();

    // Check collisions
    checkCollisions();

    // Update cooldown
    updateCooldown();

    // Check game over
    if (gameState.player.health <= 0) {
        gameState.gameOver = true;
        gameState.gameWon = false;
        showGameOver('AI WINS!', `The AI defeated you! Score: ${gameState.score}`);
    } else if (gameState.enemy.health <= 0) {
        // Spawn power-ups when enemy dies
        spawnPowerUp(gameState.enemy.x, gameState.enemy.y - 50);
        spawnPowerUp(gameState.enemy.x, gameState.enemy.y - 50);
        gameState.kills++;
        gameState.score += 500; // Bonus for killing enemy
        triggerScreenShake(6, 10);
        startNextWave();
    }

    // Update HUD
    updateHUD();
}

// ==================== GAME RENDERING ====================

function draw() {
    // Apply screen shake
    ctx.save();
    if (gameState.shakeIntensity > 0) {
        const shakeX = (Math.random() - 0.5) * gameState.shakeIntensity;
        const shakeY = (Math.random() - 0.5) * gameState.shakeIntensity;
        ctx.translate(shakeX, shakeY);
    }
    
    // Clear canvas with sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#e0f6ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw platforms
    ctx.fillStyle = '#8b6914';
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    for (let platform of platforms) {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);

        // Platform pattern
        ctx.fillStyle = '#a0791a';
        for (let px = platform.x; px < platform.x + platform.width; px += 20) {
            ctx.fillRect(px, platform.y, 10, platform.height);
        }
        ctx.fillStyle = '#8b6914';
    }

    // Draw projectiles
    for (let proj of gameState.projectiles) {
        proj.draw();
    }

    // Draw power-ups
    for (let powerup of gameState.powerups) {
        powerup.draw();
    }

    // Draw characters
    gameState.player.draw();
    gameState.enemy.draw();

    // Draw aiming crosshair
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(gameState.mouseX, gameState.mouseY, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#00ffff';
    ctx.beginPath();
    ctx.moveTo(gameState.mouseX - 5, gameState.mouseY);
    ctx.lineTo(gameState.mouseX + 5, gameState.mouseY);
    ctx.moveTo(gameState.mouseX, gameState.mouseY - 5);
    ctx.lineTo(gameState.mouseX, gameState.mouseY + 5);
    ctx.stroke();
    
    ctx.restore();
}

// ==================== GAME OVER ====================

function showGameOver(title, message) {
    document.getElementById('gameOverTitle').textContent = title;
    document.getElementById('gameOverMessage').textContent = message;
    document.getElementById('gameOver').style.display = 'block';
}

// ==================== GAME LOOP ====================

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game when the page loads
window.addEventListener('load', () => {
    initializeGame();
    gameLoop();
});
