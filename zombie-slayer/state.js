// ===================== GAME STATE =====================
let gameRunning = false;
let score = 0;
let kills = 0;
let wave = 1;
let waveZombiesLeft = 0;
let waveActive = false;
let waveDelay = 0;
let spawnTimer = 0;
let zombiesToSpawn = 0;
let particles = [];
let screenShake = 0;
let damageFlash = 0;
let zombies = [];
let damageNumbers = [];

// ===================== INPUT KEYS =====================
const keys = {};
document.addEventListener('keydown', e => { keys[e.code] = true; if(e.code === 'Space') e.preventDefault(); });
document.addEventListener('keyup', e => keys[e.code] = false);
