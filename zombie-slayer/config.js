// ===================== GAME CONFIGURATION =====================
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const GROUND_Y = H - 80;

// ===================== ZOMBIE TYPES =====================
const ZOMBIE_TYPES = {
    normal: {
        name: 'Normal', color: '#2ecc71', hp: 50, speed: 1.2, damage: 8, w: 26, h: 44, score: 10, spawnWeight: 10
    },
    fast: {
        name: 'Fast', color: '#3498db', hp: 30, speed: 2.8, damage: 5, w: 22, h: 38, score: 15, spawnWeight: 6
    },
    strong: {
        name: 'Strong', color: '#e74c3c', hp: 70, speed: 1.0, damage: 18, w: 30, h: 48, score: 20, spawnWeight: 5
    },
    big: {
        name: 'Big', color: '#9b59b6', hp: 150, speed: 0.6, damage: 12, w: 42, h: 60, score: 30, spawnWeight: 3
    },
    berserker: {
        name: 'Berserker', color: '#f39c12', hp: 60, speed: 2.2, damage: 15, w: 28, h: 46, score: 25, spawnWeight: 2
    },
    boss: {
        name: 'BOSS', color: '#1abc9c', hp: 400, speed: 0.8, damage: 25, w: 56, h: 72, score: 100, spawnWeight: 0
    }
};
