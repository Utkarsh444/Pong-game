// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameRunning = false;
let playerScore = 0;
let computerScore = 0;

// Paddle dimensions
const paddleWidth = 10;
const paddleHeight = 80;

// Player paddle (left)
const playerPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5
};

// Computer paddle (right)
const computerPaddle = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: 5,
    dy: 5,
    speed: 5
};

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse movement
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Keep paddle within canvas bounds
    if (mouseY > 0 && mouseY < canvas.height) {
        playerPaddle.y = mouseY - playerPaddle.height / 2;
    }
});

// Button controls
document.getElementById('startBtn').addEventListener('click', toggleGame);
document.getElementById('resetBtn').addEventListener('click', resetScore);

function toggleGame() {
    gameRunning = !gameRunning;
    const btn = document.getElementById('startBtn');
    btn.textContent = gameRunning ? 'Pause Game' : 'Start Game';
}

function resetScore() {
    playerScore = 0;
    computerScore = 0;
    updateScoreboard();
    resetBall();
}

function updateScoreboard() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed;
}

// Update player paddle position with arrow keys
function updatePlayerPaddle() {
    if (keys['ArrowUp'] && playerPaddle.y > 0) {
        playerPaddle.y -= playerPaddle.speed;
    }
    if (keys['ArrowDown'] && playerPaddle.y < canvas.height - playerPaddle.height) {
        playerPaddle.y += playerPaddle.speed;
    }
    
    // Keep paddle in bounds (mouse control)
    if (playerPaddle.y < 0) playerPaddle.y = 0;
    if (playerPaddle.y > canvas.height - playerPaddle.height) {
        playerPaddle.y = canvas.height - playerPaddle.height;
    }
}

// Update computer paddle with AI
function updateComputerPaddle() {
    const computerPaddleCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenter = ball.y;
    
    // Simple AI: follow the ball with a slight delay
    if (computerPaddleCenter < ballCenter - 35) {
        computerPaddle.y += computerPaddle.speed;
    } else if (computerPaddleCenter > ballCenter + 35) {
        computerPaddle.y -= computerPaddle.speed;
    }
    
    // Keep paddle in bounds
    if (computerPaddle.y < 0) computerPaddle.y = 0;
    if (computerPaddle.y > canvas.height - computerPaddle.height) {
        computerPaddle.y = canvas.height - computerPaddle.height;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Top and bottom collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        // Keep ball in bounds
        if (ball.y - ball.radius < 0) ball.y = ball.radius;
        if (ball.y + ball.radius > canvas.height) ball.y = canvas.height - ball.radius;
    }
    
    // Paddle collision detection
    // Player paddle
    if (ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height) {
        
        ball.dx = -ball.dx;
        ball.x = playerPaddle.x + playerPaddle.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const deltaY = ball.y - (playerPaddle.y + playerPaddle.height / 2);
        ball.dy += deltaY * 0.05;
    }
    
    // Computer paddle
    if (ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height) {
        
        ball.dx = -ball.dx;
        ball.x = computerPaddle.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        const deltaY = ball.y - (computerPaddle.y + computerPaddle.height / 2);
        ball.dy += deltaY * 0.05;
    }
    
    // Score points
    if (ball.x - ball.radius < 0) {
        computerScore++;
        updateScoreboard();
        resetBall();
    }
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        updateScoreboard();
        resetBall();
    }
}

// Draw functions
function drawPaddle(paddle, color) {
    ctx.fillStyle = color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    drawCenterLine();
    
    if (gameRunning) {
        // Update
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }
    
    // Draw
    drawPaddle(playerPaddle, '#00FF00');
    drawPaddle(computerPaddle, '#FF0000');
    drawBall();
    
    // Draw pause indicator
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
    
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();