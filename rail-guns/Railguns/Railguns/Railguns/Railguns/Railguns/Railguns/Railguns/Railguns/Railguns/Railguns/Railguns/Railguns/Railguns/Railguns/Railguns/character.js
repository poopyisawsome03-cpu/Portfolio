// Character class
class Character {
    constructor(x, y, isPlayer = true) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isPlayer = isPlayer;
        this.health = 100;
        this.maxHealth = 100;
        this.isJumping = false;
        this.jumpPower = 12;
        this.maxJumps = 2;
        this.jumpsRemaining = this.maxJumps;
        this.speed = isPlayer ? 5 : 3.5;
        this.color = isPlayer ? '#2563eb' : '#dc2626';
        this.shield = 0; // Shield health
    }

    update() {
        // Apply gravity
        this.velocityY += GRAVITY;

        // Movement boundaries
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > CANVAS_WIDTH) this.x = CANVAS_WIDTH - this.width;

        // Apply velocity
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Platform collision
        this.velocityY = this.checkCollisions();

        // Kill if fell off screen
        if (this.y > CANVAS_HEIGHT) {
            this.health = 0;
        }
    }

    checkCollisions() {
        let collision = false;
        
        for (let platform of platforms) {
            // Check if character is falling and overlapping with platform
            if (this.velocityY >= 0 &&
                this.y + this.height >= platform.y &&
                this.y + this.height <= platform.y + 50 &&
                this.x + this.width > platform.x &&
                this.x < platform.x + platform.width) {
                // Only collide if actually falling onto it (not jumping through from below)
                if (this.y + this.height - this.velocityY <= platform.y + 5) {
                    this.isJumping = false;
                    this.jumpsRemaining = this.maxJumps;
                    this.y = platform.y - this.height;
                    collision = true;
                    break;
                }
            }
        }
        
        return collision ? 0 : this.velocityY;
    }

    jump() {
        if (this.jumpsRemaining > 0) {
            this.velocityY = -this.jumpPower;
            this.isJumping = true;
            this.jumpsRemaining--;
        }
    }

    moveLeft() {
        this.velocityX = -this.speed;
    }

    moveRight() {
        this.velocityX = this.speed;
    }

    stopMove() {
        this.velocityX = 0;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }

    draw() {
        // Body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 8, this.y + 10, 6, 6);
        ctx.fillRect(this.x + 16, this.y + 10, 6, 6);

        // Pupils
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 9, this.y + 11, 4, 4);
        ctx.fillRect(this.x + 17, this.y + 11, 4, 4);

        // Health bar above character
        const barWidth = this.width;
        const barHeight = 4;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y - 10, barWidth, barHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y - 10, (this.health / this.maxHealth) * barWidth, barHeight);
        
        // Shield rendering
        if (this.shield > 0) {
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.6;
            const shieldSize = 10 + (this.shield / 50) * 5;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, shieldSize, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
}
