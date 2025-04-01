// Game variables
let canvas;
let ctx;
let player;
let foods = [];
let enemies = [];
let cameraX = 0;
let cameraY = 0;
let score = 0;
let gameRunning = false;
let playerName = 'Player';

// Game settings
const WORLD_SIZE = 3000;
const FOOD_COUNT = 200;
const ENEMY_COUNT = 10;
const FOOD_SIZE = 10;
const PLAYER_START_SIZE = 30;
const COLORS = [
    '#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3',
    '#33FFF3', '#FF8C33', '#8C33FF', '#FF338C', '#338CFF'
];

// Initialize game
window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size to window size
    resizeCanvas();
    
    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', restartGame);
    canvas.addEventListener('mousemove', updatePlayerDirection);
    
    // Create initial game objects
    createInitialFood();
    createEnemies();
};

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function startGame() {
    // Get player name from input
    const nameInput = document.getElementById('nameInput');
    if (nameInput.value.trim() !== '') {
        playerName = nameInput.value.trim();
    }
    document.getElementById('playerName').textContent = playerName;
    
    // Hide start screen
    document.getElementById('startScreen').classList.add('hidden');
    
    // Create player
    player = {
        x: WORLD_SIZE / 2,
        y: WORLD_SIZE / 2,
        radius: PLAYER_START_SIZE,
        color: getRandomColor(),
        speedMultiplier: 4,
        targetX: 0,
        targetY: 0
    };
    
    gameRunning = true;
    score = 0;
    document.getElementById('scoreBoard').textContent = 'Score: 0';
    
    // Start game loop
    gameLoop();
}

function restartGame() {
    // Hide game over screen
    document.getElementById('gameOverScreen').classList.add('hidden');
    
    // Reset game state
    foods = [];
    enemies = [];
    createInitialFood();
    createEnemies();
    
    startGame();
}

function createInitialFood() {
    foods = [];
    for (let i = 0; i < FOOD_COUNT; i++) {
        createFood();
    }
}

function createFood() {
    foods.push({
        x: Math.random() * WORLD_SIZE,
        y: Math.random() * WORLD_SIZE,
        radius: FOOD_SIZE,
        color: getRandomColor()
    });
}

function createEnemies() {
    enemies = [];
    for (let i = 0; i < ENEMY_COUNT; i++) {
        const size = PLAYER_START_SIZE + Math.random() * 50 - 25; // Randomize enemy size
        enemies.push({
            x: Math.random() * WORLD_SIZE,
            y: Math.random() * WORLD_SIZE,
            radius: size,
            color: getRandomColor(),
            speedMultiplier: 4 - (size / 50), // Larger enemies move slower
            targetX: Math.random() * WORLD_SIZE,
            targetY: Math.random() * WORLD_SIZE
        });
    }
}