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

function updatePlayerDirection(e) {
    if (!gameRunning) return;
    
    // Calculate target direction relative to canvas center
    player.targetX = e.clientX - canvas.width / 2;
    player.targetY = e.clientY - canvas.height / 2;
}

function gameLoop() {
    if (!gameRunning) return;
    
    update();
    render();
    
    requestAnimationFrame(gameLoop);
}

function update() {
    // Update player position
    movePlayer();
    
    // Update enemy positions
    moveEnemies();
    
    // Check for collisions
    checkFoodCollisions();
    checkEnemyCollisions();
    
    // Replace eaten food
    while (foods.length < FOOD_COUNT) {
        createFood();
    }
    
    // Update camera position to follow player
    cameraX = player.x - canvas.width / 2;
    cameraY = player.y - canvas.height / 2;
}

function movePlayer() {
    // Normalize direction vector
    const length = Math.sqrt(player.targetX * player.targetX + player.targetY * player.targetY);
    if (length > 0) {
        const speed = 3 * (40 / player.radius) * player.speedMultiplier; // Speed decreases as player gets bigger
        player.x += (player.targetX / length) * speed;
        player.y += (player.targetY / length) * speed;
    }
    
    // Keep player within world boundaries
    player.x = Math.max(player.radius, Math.min(WORLD_SIZE - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(WORLD_SIZE - player.radius, player.y));
}

function moveEnemies() {
    enemies.forEach(enemy => {
        // Check if enemy reached target, then set new target
        const distToTarget = Math.sqrt(
            Math.pow(enemy.x - enemy.targetX, 2) + 
            Math.pow(enemy.y - enemy.targetY, 2)
        );
        
        if (distToTarget < 50) {
            enemy.targetX = Math.random() * WORLD_SIZE;
            enemy.targetY = Math.random() * WORLD_SIZE;
        }
        
        // Move toward target
        const dirX = enemy.targetX - enemy.x;
        const dirY = enemy.targetY - enemy.y;
        const length = Math.sqrt(dirX * dirX + dirY * dirY);
        
        // Enemy should chase player if close enough
        const distToPlayer = Math.sqrt(
            Math.pow(enemy.x - player.x, 2) + 
            Math.pow(enemy.y - player.y, 2)
        );
        
        if (distToPlayer < 500 && enemy.radius > player.radius) {
            // Chase player if enemy is bigger
            const chaseSpeed = 2 * (40 / enemy.radius) * enemy.speedMultiplier;
            enemy.x += (player.x - enemy.x) / distToPlayer * chaseSpeed;
            enemy.y += (player.y - enemy.y) / distToPlayer * chaseSpeed;
        } else if (distToPlayer < 400 && enemy.radius < player.radius) {
            // Run away from player if enemy is smaller
            const fleeSpeed = 2.5 * (40 / enemy.radius) * enemy.speedMultiplier;
            enemy.x -= (player.x - enemy.x) / distToPlayer * fleeSpeed;
            enemy.y -= (player.y - enemy.y) / distToPlayer * fleeSpeed;
        } else if (length > 0) {
            // Move toward random target
            const speed = 1.5 * (40 / enemy.radius) * enemy.speedMultiplier;
            enemy.x += (dirX / length) * speed;
            enemy.y += (dirY / length) * speed;
        }
        
        // Keep enemy within world boundaries
        enemy.x = Math.max(enemy.radius, Math.min(WORLD_SIZE - enemy.radius, enemy.x));
        enemy.y = Math.max(enemy.radius, Math.min(WORLD_SIZE - enemy.radius, enemy.y));
    });
    
    // Enemies eat food and other enemies
    enemies.forEach(enemy => {
        // Enemy eating food
        foods = foods.filter(food => {
            const dist = Math.sqrt(Math.pow(enemy.x - food.x, 2) + Math.pow(enemy.y - food.y, 2));
            if (dist < enemy.radius && enemy.radius > food.radius) {
                enemy.radius += food.radius / 10;
                return false;
            }
            return true;
        });
        
        // Enemy eating other enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (enemies[i] === enemy) continue;
            
            const otherEnemy = enemies[i];
            const dist = Math.sqrt(Math.pow(enemy.x - otherEnemy.x, 2) + Math.pow(enemy.y - otherEnemy.y, 2));
            
            if (dist < enemy.radius && enemy.radius > otherEnemy.radius * 1.2) {
                enemy.radius += otherEnemy.radius / 4;
                enemies.splice(i, 1);
                
                // Create new enemy
                const size = PLAYER_START_SIZE + Math.random() * 50 - 25;
                enemies.push({
                    x: Math.random() * WORLD_SIZE,
                    y: Math.random() * WORLD_SIZE,
                    radius: size,
                    color: getRandomColor(),
                    speedMultiplier: 4 - (size / 50),
                    targetX: Math.random() * WORLD_SIZE,
                    targetY: Math.random() * WORLD_SIZE
                });
            }
        }
    });
}