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
const WORLD_SIZE = 5000; // Increased from 3000 to 5000
const FOOD_COUNT = 200;
const ENEMY_COUNT = 5; // Reduced from 10 to 5
const FOOD_SIZE = 10;
const PLAYER_START_SIZE = 30;
const COLORS = [
    '#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3',
    '#33FFF3', '#FF8C33', '#8C33FF', '#FF338C', '#338CFF'
];

// ... [rest of the original code remains the same, with changes in these functions]

function movePlayer() {
    // Normalize direction vector
    const length = Math.sqrt(player.targetX * player.targetX + player.targetY * player.targetY);
    if (length > 0) {
        const speed = 2 * (40 / player.radius) * player.speedMultiplier; // Reduced from 3 to 2
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
            const chaseSpeed = 1.5 * (40 / enemy.radius) * enemy.speedMultiplier; // Reduced from 2 to 1.5
            enemy.x += (player.x - enemy.x) / distToPlayer * chaseSpeed;
            enemy.y += (player.y - enemy.y) / distToPlayer * chaseSpeed;
        } else if (distToPlayer < 400 && enemy.radius < player.radius) {
            // Run away from player if enemy is smaller
            const fleeSpeed = 2 * (40 / enemy.radius) * enemy.speedMultiplier; // Reduced from 2.5 to 2
            enemy.x -= (player.x - enemy.x) / distToPlayer * fleeSpeed;
            enemy.y -= (player.y - enemy.y) / distToPlayer * fleeSpeed;
        } else if (length > 0) {
            // Move toward random target
            const speed = 1 * (40 / enemy.radius) * enemy.speedMultiplier; // Reduced from 1.5 to 1
            enemy.x += (dirX / length) * speed;
            enemy.y += (dirY / length) * speed;
        }
        
        // Keep enemy within world boundaries
        enemy.x = Math.max(enemy.radius, Math.min(WORLD_SIZE - enemy.radius, enemy.x));
        enemy.y = Math.max(enemy.radius, Math.min(WORLD_SIZE - enemy.radius, enemy.y));
    });
    
    // ... [rest of the function remains the same]
}

// ... [rest of the original code remains the same]
