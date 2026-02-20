// Game constants
let CANVAS_WIDTH = window.innerWidth;
let CANVAS_HEIGHT = window.innerHeight;
const GRAVITY = 0.6;
const PLATFORM_HEIGHT = 20;

// Get canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Platforms
const platforms = [];

function createPlatforms() {
    const groundHeight = 50;
    const leftX = CANVAS_WIDTH * 0.15;
    const rightX = CANVAS_WIDTH * 0.60;
    const midX = CANVAS_WIDTH * 0.35;
    const upperLeftX = CANVAS_WIDTH * 0.10;
    const upperRightX = CANVAS_WIDTH * 0.70;

    platforms.length = 0;
    platforms.push(
        { x: 0, y: CANVAS_HEIGHT - groundHeight, width: CANVAS_WIDTH, height: groundHeight },
        { x: leftX, y: CANVAS_HEIGHT * 0.82, width: CANVAS_WIDTH * 0.32, height: PLATFORM_HEIGHT },
        { x: rightX, y: CANVAS_HEIGHT * 0.82, width: CANVAS_WIDTH * 0.32, height: PLATFORM_HEIGHT },
        { x: midX, y: CANVAS_HEIGHT * 0.68, width: CANVAS_WIDTH * 0.40, height: PLATFORM_HEIGHT },
        { x: upperLeftX, y: CANVAS_HEIGHT * 0.52, width: CANVAS_WIDTH * 0.28, height: PLATFORM_HEIGHT },
        { x: upperRightX, y: CANVAS_HEIGHT * 0.52, width: CANVAS_WIDTH * 0.28, height: PLATFORM_HEIGHT }
    );
}

function resizeCanvas() {
    CANVAS_WIDTH = window.innerWidth;
    CANVAS_HEIGHT = window.innerHeight;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    createPlatforms();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
