// Power-up class
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = type; // 'health', 'rapidfire', 'shield'
        this.lifetime = 300; // frames (5 seconds)
        this.rotation = 0;
        this.bobOffset = 0;
        
        // Colors and values based on type
        if (type === 'health') {
            this.color = '#ff4444';
            this.value = 30;
            this.symbol = '+';
        } else if (type === 'rapidfire') {
            this.color = '#ffff00';
            this.value = 5; // cooldown reduction
            this.symbol = '⚡';
        } else if (type === 'shield') {
            this.color = '#00ff00';
            this.value = 50; // shield strength
            this.symbol = '◆';
        }
    }

    update() {
        this.lifetime--;
        this.rotation += 0.05;
        this.bobOffset = Math.sin(this.rotation) * 3;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2 + this.bobOffset);
        ctx.rotate(this.rotation);
        
        // Outer glow
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Main square
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Symbol
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, 0, 0);
        
        ctx.restore();
    }

    isAlive() {
        return this.lifetime > 0;
    }

    isColliding(x, y, width, height) {
        return x + width > this.x &&
               x < this.x + this.width &&
               y + height > this.y &&
               y < this.y + this.height;
    }
}
