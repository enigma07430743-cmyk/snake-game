
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const message = document.getElementById("message");

const tileSize = 20;
const tileCount = canvas.width / tileSize;

let snake;
let food;
let direction;
let nextDirection;
let score;
let gameRunning = false;
let gameOver = false;
let timer;

let highScore = Number(localStorage.getItem("snakeHighScore")) || 0;
highScoreElement.textContent = highScore;

function resetGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    scoreElement.textContent = score;

    createFood();
    drawGame();
}

function createFood() {
    do {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (
        snake.some(segment => segment.x === food.x && segment.y === food.y)
    );
}

function drawGame() {
    ctx.fillStyle = "#080d12";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the food
    ctx.fillStyle = "#ff4757";
    ctx.beginPath();
    ctx.arc(
        food.x * tileSize + tileSize / 2,
        food.y * tileSize + tileSize / 2,
        tileSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Draw the snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#8affaa" : "#35e875";
        ctx.fillRect(
            segment.x * tileSize + 1,
            segment.y * tileSize + 1,
            tileSize - 2,
            tileSize - 2
        );
    });
}

function gameLoop() {
    if (!gameRunning) return;

    direction = nextDirection;

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    // Check wall collision
    if (
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount
    ) {
        endGame();
        return;
    }

    const eatingFood = head.x === food.x && head.y === food.y;

    // Allow moving into the old tail position if the tail moves away
    const bodyToCheck = eatingFood ? snake : snake.slice(0, -1);

    if (
        bodyToCheck.some(
            segment => segment.x === head.x && segment.y === head.y
        )
    ) {
        endGame();
        return;
    }

    snake.unshift(head);

    if (eatingFood) {
        score += 10;
        scoreElement.textContent = score;

        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem("snakeHighScore", highScore);
        }

        createFood();
    } else {
        snake.pop();
    }

    drawGame();
}

function startGame() {
    clearInterval(timer);
    resetGame();

    gameRunning = true;
    gameOver = false;
    message.textContent = "Good luck! 🐍";

    timer = setInterval(gameLoop, 130);
}

function endGame() {
    gameRunning = false;
    gameOver = true;
    clearInterval(timer);
    message.textContent = `Game Over! Your score: ${score}`;
}

function togglePause() {
    if (gameOver || !snake) return;

    if (gameRunning) {
        gameRunning = false;
        clearInterval(timer);
        message.textContent = "Paused";
    } else {
        gameRunning = true;
        message.textContent = "Keep going! 🐍";
        timer = setInterval(gameLoop, 130);
    }
}

function changeDirection(newDirection) {
    if (
        newDirection.x === -direction.x &&
        newDirection.y === -direction.y
    ) {
        return;
    }

    nextDirection = newDirection;
}

document.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    const directions = {
        arrowup: { x: 0, y: -1 },
        w: { x: 0, y: -1 },
        arrowdown: { x: 0, y: 1 },
        s: { x: 0, y: 1 },
        arrowleft: { x: -1, y: 0 },
        a: { x: -1, y: 0 },
        arrowright: { x: 1, y: 0 },
        d: { x: 1, y: 0 }
    };

    if (directions[key]) {
        event.preventDefault();
        changeDirection(directions[key]);
    }
});

document.querySelectorAll("[data-dir]").forEach(button => {
    button.addEventListener("click", () => {
        const directions = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };

        changeDirection(directions[button.dataset.dir]);
    });
});

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", togglePause);

resetGame();
