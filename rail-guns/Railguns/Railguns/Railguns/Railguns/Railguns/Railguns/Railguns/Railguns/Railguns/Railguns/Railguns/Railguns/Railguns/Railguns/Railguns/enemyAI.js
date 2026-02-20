// Enemy AI class
class EnemyAI extends Character {
    constructor(x, y) {
        super(x, y, false);
        this.lastFireTime = 0;
        this.fireDelay = 100; // frames - slightly faster
        this.state = 'patrol'; // patrol or attack
        this.directionX = 1;
        this.stateTimer = 0;
        this.targetX = 500;
        this.difficulty = 'normal'; // Can be 'easy', 'normal', 'hard'
    }

    update(playerX, playerY) {
        super.update();

        this.stateTimer++;

        // Distance to player
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.abs(dx);

        // More aggressive attack behavior
        if (distance < 500) {
            this.state = 'attack';
            this.targetX = playerX;
        } else {
            this.state = 'patrol';
        }

        // Movement AI
        if (this.state === 'attack') {
            // Chase player more aggressively
            if (dx > 0) {
                this.moveRight();
            } else {
                this.moveLeft();
            }

            // Jump more frequently to reach player
            if (Math.abs(dy) > 60 && !this.isJumping && Math.random() > 0.80) {
                this.jump();
            }
            
            // Dodge incoming fire by jumping
            if (Math.random() > 0.90) {
                this.jump();
            }
        } else {
            // Patrol behavior - move back and forth more predictably
            if (this.stateTimer > 120) {
                this.directionX *= -1;
                this.stateTimer = 0;
            }

            if (this.directionX > 0) {
                this.moveRight();
            } else {
                this.moveLeft();
            }

            // Random jumping during patrol
            if (!this.isJumping && Math.random() > 0.970) {
                this.jump();
            }
        }

        this.lastFireTime++;
    }

    fire(playerX, playerY) {
        // Fire more frequently at close range
        const fireThreshold = this.state === 'attack' ? this.fireDelay : this.fireDelay * 2;
        
        if (this.lastFireTime > fireThreshold && this.state === 'attack') {
            this.lastFireTime = 0;
            return new LaserBeam(
                this.x + this.width / 2,
                this.y + this.height / 2,
                playerX,
                playerY,
                false
            );
        }
        return null;
    }

    draw() {
        super.draw();

        // Enemy specific - red indicator
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Show difficulty indicator
        if (this.health > 70) {
            ctx.fillStyle = '#ff6666';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('AI', this.x + this.width / 2, this.y - 20);
        }
    }
}
