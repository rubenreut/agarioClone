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
const WORLD_SIZE = 7000; // Increased world size
const FOOD_COUNT = 200;
const ENEMY_COUNT = 3; // Further reduced number of bots
const FOOD_SIZE = 10;
const PLAYER_START_SIZE = 30;
const COLORS = [
    '#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3',
    '#33FFF3', '#FF8C33', '#8C33FF', '#FF338C', '#338CFF'
];

function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Initialize player
    player = {
        x: WORLD_SIZE / 2,
        y: WORLD_SIZE / 2,
        radius: PLAYER_START_SIZE,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        targetX: 0,
        targetY: 0,
        speedMultiplier: 1
    };
    
    // Initialize foods
    foods = [];
    for (let i = 0; i < FOOD_COUNT; i++) {
        foods.push({
            x: Math.random() * WORLD_SIZE,
            y: Math.random() * WORLD_SIZE,
            radius: FOOD_SIZE,
            color: COLORS[Math.floor(Math.random() * COLORS.length)]
        });
    }
    
    // Initialize enemies
    enemies = [];
    for (let i = 0; i < ENEMY_COUNT; i++) {
        enemies.push({
            x: Math.random() * WORLD_SIZE,
            y: Math.random() * WORLD_SIZE,
            radius: PLAYER_START_SIZE + Math.random() * 20,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            targetX: Math.random() * WORLD_SIZE,
            targetY: Math.random() * WORLD_SIZE,
            speedMultiplier: 0.8 + Math.random() * 0.4
        });
    }
    
    // Setup mouse movement
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // Convert screen coordinates to world coordinates
        player.targetX = (mouseX + cameraX - canvas.width / 2) * (WORLD_SIZE / canvas.width);
        player.targetY = (mouseY + cameraY - canvas.height / 2) * (WORLD_SIZE / canvas.height);
    });
    
    gameRunning = true;
    gameLoop();
}

function movePlayer() {
    // Normalize direction vector
    const length = Math.sqrt(player.targetX * player.targetX + player.targetY * player.targetY);
    if (length > 0) {
        const speed = 1.5 * (40 / player.radius) * player.speedMultiplier; // Reduced speed
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
            const chaseSpeed = 1 * (40 / enemy.radius) * enemy.speedMultiplier; // Reduced chase speed
            enemy.x += (player.x - enemy.x) / distToPlayer * chaseSpeed;
            enemy.y += (player.y - enemy.y) / distToPlayer * chaseSpeed;
        } else if (distToPlayer < 400 && enemy.radius < player.radius) {
            // Run away from player if enemy is smaller
            const fleeSpeed = 1.5 * (40 / enemy.radius) * enemy.speedMultiplier; // Reduced flee speed
            enemy.x -= (player.x - enemy.x) / distToPlayer * fleeSpeed;
            enemy.y -= (player.y - enemy.y) / distToPlayer * fleeSpeed;
        } else if (length > 0) {
            // Move toward random target
            const speed = 0.75 * (40 / enemy.radius) * enemy.speedMultiplier; // Further reduced speed
            enemy.x += (dirX / length) * speed;
            enemy.y += (dirY / length) * speed;
        }
        
        // Keep enemy within world boundaries
        enemy.x = Math.max(enemy.radius, Math.min(WORLD_SIZE - enemy.radius, enemy.x));
        enemy.y = Math.max(enemy.radius, Math.min(WORLD_SIZE - enemy.radius, enemy.y));
    });
}

function checkCollisions() {
    // Food collision
    foods = foods.filter(food => {
        const dx = player.x - food.x;
        const dy = player.y - food.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < player.radius) {
            // Eat food
            player.radius += 1;
            score++;
            return false;
        }
        return true;
    });
    
    // Replenish food
    while (foods.length < FOOD_COUNT) {
        foods.push({
            x: Math.random() * WORLD_SIZE,
            y: Math.random() * WORLD_SIZE,
            radius: FOOD_SIZE,
            color: COLORS[Math.floor(Math.random() * COLORS.length)]
        });
    }
    
    // Enemy collision
    enemies.forEach((enemy, index) => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < player.radius + enemy.radius) {
            if (player.radius > enemy.radius) {
                // Player eats enemy
                player.radius += enemy.radius / 4;
                enemies.splice(index, 1);
                score += 10;
            } else {
                // Enemy eats player
                gameRunning = false;
            }
        }
    });
}

function updateCamera() {
    // Center camera on player
    cameraX = player.x - WORLD_SIZE / 2;
    cameraY = player.y - WORLD_SIZE / 2;
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = 'lightgray';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw world boundaries
    ctx.strokeStyle = 'black';
    ctx.strokeRect(
        -cameraX * (canvas.width / WORLD_SIZE), 
        -cameraY * (canvas.height / WORLD_SIZE), 
        canvas.width, 
        canvas.height
    );
    
    // Draw foods
    foods.forEach(food => {
        ctx.beginPath();
        ctx.fillStyle = food.color;
        ctx.arc(
            (food.x - cameraX) * (canvas.width / WORLD_SIZE), 
            (food.y - cameraY) * (canvas.height / WORLD_SIZE), 
            food.radius * (canvas.width / WORLD_SIZE), 
            0, 
            Math.PI * 2
        );
        ctx.fill();
    });
    
    // Draw enemies
    enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.fillStyle = enemy.color;
        ctx.arc(
            (enemy.x - cameraX) * (canvas.width / WORLD_SIZE), 
            (enemy.y - cameraY) * (canvas.height / WORLD_SIZE), 
            enemy.radius * (canvas.width / WORLD_SIZE), 
            0, 
            Math.PI * 2
        );
        ctx.fill();
    });
    
    // Draw player
    ctx.beginPath();
    ctx.fillStyle = player.color;
    ctx.arc(
        canvas.width / 2, 
        canvas.height / 2, 
        player.radius * (canvas.width / WORLD_SIZE), 
        0, 
        Math.PI * 2
    );
    ctx.fill();
    
    // Draw score
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function gameLoop() {
    if (!gameRunning) {
        ctx.fillStyle = 'black';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
        return;
    }
    
    movePlayer();
    moveEnemies();
    checkCollisions();
    updateCamera();
    drawGame();
    
    requestAnimationFrame(gameLoop);
}

// Start the game when the window loads
window.onload = initGame;
