
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");

const restartButton = document.getElementById("restartButton");
const playAgainButton = document.getElementById("playAgainButton");
const difficultySelect = document.getElementById("difficulty");
const pauseButton = document.getElementById("pauseButton");

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const startButton = document.getElementById("startButton");

// High score
let highScore = Number(localStorage.getItem("snakeHighScore")) || 0;

const highScoreDisplay = document.createElement("p");
highScoreDisplay.textContent = "High Score: " + highScore;
scoreDisplay.after(highScoreDisplay);

// Game settings
const gridSize = 10;
const columns = canvas.width / gridSize;
const rows = canvas.height / gridSize;

let snake;
let dx;
let dy;

let foodX;
let foodY;
let foodPoints = 1;

let powerUpX;
let powerUpY;
let speedBoostActive = false;

let score = 0;
let timer;
let boostTimer;

let normalSpeed;
const boostedSpeed = 70;
const boostDuration = 5000;

let gameOver = false;
let isPaused = false;
let gameStarted = false;

// Reset the game
function resetGame() {
    clearInterval(timer);
    clearTimeout(boostTimer);

    normalSpeed = Number(difficultySelect.value);
    speedBoostActive = false;

    snake = [
        { x: 50, y: 50 },
        { x: 40, y: 50 },
        { x: 30, y: 50 }
    ];

    dx = gridSize;
    dy = 0;

    score = 0;
    foodPoints = 1;
    gameOver = false;
    isPaused = false;

    scoreDisplay.textContent = "Score: 0";
    highScoreDisplay.textContent = "High Score: " + highScore;

    gameOverScreen.style.display = "none";
    finalScore.textContent = "Your score: 0";
    pauseButton.textContent = "Pause";
    pauseButton.disabled = false;

    placeFood();
    placePowerUp();
    drawGame();

    timer = setInterval(moveSnake, normalSpeed);
}

// Place regular food
function placeFood() {
    do {
        foodX = Math.floor(Math.random() * columns) * gridSize;
        foodY = Math.floor(Math.random() * rows) * gridSize;
    } while (
        snake.some(function(segment) {
            return segment.x === foodX && segment.y === foodY;
        })
    );

    // 20% chance of golden food worth 5 points
    foodPoints = Math.random() < 0.2 ? 5 : 1;
}

// Place the speed power-up
function placePowerUp() {
    do {
        powerUpX = Math.floor(Math.random() * columns) * gridSize;
        powerUpY = Math.floor(Math.random() * rows) * gridSize;
    } while (
        snake.some(function(segment) {
            return segment.x === powerUpX && segment.y === powerUpY;
        }) ||
        (foodX === powerUpX && foodY === powerUpY)
    );
}

// Activate temporary speed boost
function activateSpeedBoost() {
    clearTimeout(boostTimer);
    clearInterval(timer);

    speedBoostActive = true;
    timer = setInterval(moveSnake, boostedSpeed);

    boostTimer = setTimeout(function() {
        speedBoostActive = false;

        clearInterval(timer);

        if (!gameOver) {
            timer = setInterval(
                moveSnake,
                isPaused ? normalSpeed : normalSpeed
            );
        }

        drawGame();
    }, boostDuration);
}

// Move the snake
function moveSnake() {
    if (gameOver || isPaused) return;

    const head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };

    // Wall collision
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= canvas.width ||
        head.y >= canvas.height
    ) {
        endGame();
        return;
    }

    const ateFood =
        head.x === foodX && head.y === foodY;

    const atePowerUp =
        head.x === powerUpX && head.y === powerUpY;

    // Body collision
    const body = ateFood ? snake : snake.slice(0, -1);

    const hitBody = body.some(function(segment) {
        return segment.x === head.x && segment.y === head.y;
    });

    if (hitBody) {
        endGame();
        return;
    }

    snake.unshift(head);

    if (atePowerUp) {
        placePowerUp();
        activateSpeedBoost();
    }

    if (ateFood) {
        score += foodPoints;
        scoreDisplay.textContent = "Score: " + score;

        // Save a new high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("snakeHighScore", highScore);
            highScoreDisplay.textContent =
                "High Score: " + highScore;
        }

        placeFood();
    } else {
        snake.pop();
    }

    drawGame();
}

// Draw the game
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach(function(segment, index) {
        ctx.fillStyle = index === 0 ? "#7CFC00" : "green";

        ctx.fillRect(
            segment.x,
            segment.y,
            gridSize,
            gridSize
        );

        ctx.strokeStyle = "#222";
        ctx.strokeRect(
            segment.x,
            segment.y,
            gridSize,
            gridSize
        );
    });

    // Draw regular food
    ctx.fillStyle = foodPoints === 5 ? "gold" : "red";
    ctx.fillRect(foodX, foodY, gridSize, gridSize);

    // Draw blue power-up while boost is inactive
    if (!speedBoostActive) {
        ctx.fillStyle = "deepskyblue";
        ctx.fillRect(
            powerUpX,
            powerUpY,
            gridSize,
            gridSize
        );
    }
}

// Game Over
function endGame() {
    gameOver = true;

    clearInterval(timer);
    clearTimeout(boostTimer);

    speedBoostActive = false;

    pauseButton.disabled = true;
    finalScore.textContent = "Your score: " + score;
    gameOverScreen.style.display = "block";
}

// Keyboard controls
document.addEventListener("keydown", function(event) {
    if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]
            .includes(event.key)
    ) {
        event.preventDefault();
    }

    if (!gameStarted || gameOver || isPaused) return;

    if (event.key === "ArrowUp" && dy === 0) {
        dx = 0;
        dy = -gridSize;
    } else if (event.key === "ArrowDown" && dy === 0) {
        dx = 0;
        dy = gridSize;
    } else if (event.key === "ArrowLeft" && dx === 0) {
        dx = -gridSize;
        dy = 0;
    } else if (event.key === "ArrowRight" && dx === 0) {
        dx = gridSize;
        dy = 0;
    }
});

// Mobile controls
document.getElementById("upButton").addEventListener("click", function() {
    if (gameStarted && !gameOver && !isPaused && dy === 0) {
        dx = 0;
        dy = -gridSize;
    }
});

document.getElementById("downButton").addEventListener("click", function() {
    if (gameStarted && !gameOver && !isPaused && dy === 0) {
        dx = 0;
        dy = gridSize;
    }
});

document.getElementById("leftButton").addEventListener("click", function() {
    if (gameStarted && !gameOver && !isPaused && dx === 0) {
        dx = -gridSize;
        dy = 0;
    }
});

document.getElementById("rightButton").addEventListener("click", function() {
    if (gameStarted && !gameOver && !isPaused && dx === 0) {
        dx = gridSize;
        dy = 0;
    }
});

// Start menu
startButton.addEventListener("click", function() {
    gameStarted = true;
    startScreen.style.display = "none";
    gameScreen.style.display = "block";

    resetGame();
});

// Restart button
restartButton.addEventListener("click", function() {
    if (gameStarted) {
        resetGame();
    }
});

// Play Again button
playAgainButton.addEventListener("click", function() {
    resetGame();
});

// Pause and Resume
pauseButton.addEventListener("click", function() {
    if (!gameStarted || gameOver) return;

    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? "Resume" : "Pause";
});

// Change difficulty
difficultySelect.addEventListener("change", function() {
    if (gameStarted) {
        resetGame();
    }
});
