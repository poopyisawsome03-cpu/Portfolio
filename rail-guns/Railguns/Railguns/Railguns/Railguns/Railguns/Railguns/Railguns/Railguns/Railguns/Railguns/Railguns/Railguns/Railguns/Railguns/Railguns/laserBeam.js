// Laser Beam class
class LaserBeam {
    constructor(x, y, targetX, targetY, isPlayerProjectile = true) {
        this.startX = x;
        this.startY = y;
        this.isPlayerProjectile = isPlayerProjectile;
        this.lifetime = 8; // frames - instant effect
        this.color = isPlayerProjectile ? '#00ffff' : '#ffff00';
        this.glowColor = isPlayerProjectile ? '#0099ff' : '#ffaa00';
        this.particles = [];
        this.hasHit = false;
        this.hasDealtDamage = false;

        // Calculate direction from start to target
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize direction
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        // Extend the beam far off-screen (use large distance)
        const maxDistance = 3000;
        let endX = x + dirX * maxDistance;
        let endY = y + dirY * maxDistance;
        
        // Check for platform collision
        let closestDistance = maxDistance;
        for (let platform of platforms) {
            const hitPoint = this.rayRectangleIntersection(x, y, dirX, dirY, platform);
            if (hitPoint !== null && hitPoint.distance < closestDistance) {
                closestDistance = hitPoint.distance;
                endX = hitPoint.x;
                endY = hitPoint.y;
                this.hasHit = true;
            }
        }
        
        this.endX = endX;
        this.endY = endY;

        // Create particles along the beam
        this.createParticles();
    }

    rayRectangleIntersection(rayX, rayY, dirX, dirY, rect) {
        // Check intersection of ray with rectangle
        // Ray: P = (rayX, rayY) + t * (dirX, dirY)
        
        const epsilon = 1e-9;
        let tMin = 0;
        let tMax = Infinity;
        
        // Check X axis
        if (Math.abs(dirX) > epsilon) {
            const t1 = (rect.x - rayX) / dirX;
            const t2 = (rect.x + rect.width - rayX) / dirX;
            const tXMin = Math.min(t1, t2);
            const tXMax = Math.max(t1, t2);
            tMin = Math.max(tMin, tXMin);
            tMax = Math.min(tMax, tXMax);
        } else {
            if (rayX < rect.x || rayX > rect.x + rect.width) {
                return null; // Ray parallel to X and outside rect
            }
        }
        
        // Check Y axis
        if (Math.abs(dirY) > epsilon) {
            const t1 = (rect.y - rayY) / dirY;
            const t2 = (rect.y + rect.height - rayY) / dirY;
            const tYMin = Math.min(t1, t2);
            const tYMax = Math.max(t1, t2);
            tMin = Math.max(tMin, tYMin);
            tMax = Math.min(tMax, tYMax);
        } else {
            if (rayY < rect.y || rayY > rect.y + rect.height) {
                return null; // Ray parallel to Y and outside rect
            }
        }
        
        // Valid intersection if tMin <= tMax and tMin > 0 (forward direction only)
        if (tMin <= tMax && tMin > 0.1) {
            const hitX = rayX + dirX * tMin;
            const hitY = rayY + dirY * tMin;
            return { x: hitX, y: hitY, distance: tMin };
        }
        
        return null;
    }

    createParticles() {
        const dx = this.endX - this.startX;
        const dy = this.endY - this.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.ceil(distance / 20);

        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const px = this.startX + dx * t;
            const py = this.startY + dy * t;

            // Perpendicular spread
            const angle = Math.atan2(dy, dx) + Math.PI / 2;
            const spread = (Math.random() - 0.5) * 20;

            const particle = new Particle(
                px + Math.cos(angle) * spread,
                py + Math.sin(angle) * spread,
                (Math.random() - 0.5) * 4,
                -Math.random() * 3 - 1,
                this.color,
                15
            );
            this.particles.push(particle);
        }

        // Impact particles at end
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const speed = Math.random() * 4 + 2;
            const particle = new Particle(
                this.endX,
                this.endY,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                this.color,
                20
            );
            this.particles.push(particle);
        }
    }

    update() {
        for (let particle of this.particles) {
            particle.update();
        }
        this.lifetime--;
    }

    draw() {
        const progress = 1 - (this.lifetime / 8);
        
        // Multiple glow layers for cool effect
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Outer glow (largest)
        ctx.strokeStyle = this.glowColor;
        ctx.globalAlpha = 0.15 * (1 - progress);
        ctx.lineWidth = 30;
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();

        // Middle glow
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = 0.4 * (1 - progress);
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();

        // Core beam
        ctx.strokeStyle = '#ffffff';
        ctx.globalAlpha = 0.8;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();

        // Inner bright core
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = 1;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();

        ctx.globalAlpha = 1;

        // Draw particles
        for (let particle of this.particles) {
            particle.draw();
        }
    }

    isAlive() {
        return this.lifetime > 0;
    }
}
