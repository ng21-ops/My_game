
const startButton = document.getElementById("startButton");
const gameScreen = document.querySelector(".game-screen"); 

startButton.addEventListener("click", function() {
    gameScreen.innerHTML = `
        <div id="gameInfo">
            <span> SCORE: <span id="score">0</span></span>
            <span> LIVES: <span id="lives">3</span></span>
        </div>

        <canvas id="gameCanvas" width="600" height="400"></canvas>

        <p>Move: W A S D | Shoot: SPACE | Pause: P</p>
        <button id="pauseButton">PAUSE</button>
    `;

    startGame();
});

function startGame() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const player = {
        x: 280,
        y: 330,
        width: 35,
        height: 35,
        speed: 5
    };

    let score = 0;
    let lives = 3;
    let bullets = [];
    let enemies = [];
    let keys = {};
    let paused = false;
    let gameOver = false;
    let lastEnemy = 0;
    let animationId;

    document.onkeydown = function(event) {
        keys[event.key.toLowerCase()] = true;

        if (event.code === "Space") {
            event.preventDefault();
            if (!paused && !gameOver) {
                shoot();
            }
        }

        if (event.key.toLowerCase() === "p" && !gameOver) {
    paused = !paused;

    document.getElementById("pauseButton").textContent =
        paused ? "RESUME" : "PAUSE";
}
    };

    document.onkeyup = function(event) {
        keys[event.key.toLowerCase()] = false;
    };

    function shoot() {
        bullets.push({
            x: player.x + 8,
            y: player.y,
            width: 5,
            height: 12
        });

        bullets.push({
            x: player.x + 23,
            y: player.y,
            width: 5,
            height: 12
        });
    }

    function createEnemy() {
        enemies.push({
            x: Math.random() * 560,
            y: -30,
            width: 30,
            height: 30,
            speed: 2 + Math.random() * 2
        });
    }

    function collision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    function update() {
        if (keys["w"] && player.y > 0) player.y -= player.speed;
        if (keys["s"] && player.y < 365) player.y += player.speed;
        if (keys["a"] && player.x > 0) player.x -= player.speed;
        if (keys["d"] && player.x < 565) player.x += player.speed;

        bullets.forEach(b => b.y -= 7);
        bullets = bullets.filter(b => b.y > -20);

        enemies.forEach(e => e.y += e.speed);

        enemies.forEach(enemy => {
            if (collision(player, enemy)) {
                lives--;
                enemy.y = 500;
            }

            bullets.forEach(bullet => {
                if (collision(bullet, enemy)) {
                    score += 100;
                    enemy.y = 500;
                    bullet.y = -50;
                }
            });

            if (enemy.y > 400) {
                lives--;
                enemy.y = 500;
            }
        });

        enemies = enemies.filter(e => e.y < 450);
        bullets = bullets.filter(b => b.y > -20);

        document.getElementById("score").textContent = score;
        document.getElementById("lives").textContent = lives;

        if (lives <= 0) {
            gameOver = true;
        }
    }

    function draw() {
        ctx.fillStyle = "#08051c";
        ctx.fillRect(0, 0, 600, 400);

        // Stars
        ctx.fillStyle = "white";
        for (let i = 0; i < 40; i++) {
            const x = (i * 97) % 600;
            const y = (i * 53 + Date.now() / 30) % 400;
            ctx.fillRect(x, y, 2, 2);
        }

        // Player ship
        ctx.fillStyle = "#00eaff";
        ctx.fillRect(player.x, player.y, 35, 35);
        ctx.fillStyle = "white";
        ctx.fillRect(player.x + 12, player.y + 5, 10, 10);

        // Lasers
        ctx.fillStyle = "#ffdd55";
        bullets.forEach(b => {
            ctx.fillRect(b.x, b.y, b.width, b.height);
        });

        // Enemies
        ctx.fillStyle = "#ff3366";
        enemies.forEach(e => {
            ctx.fillRect(e.x, e.y, e.width, e.height);
        });

        if (paused) {
            ctx.fillStyle = "white";
            ctx.font = "35px Arial";
            ctx.fillText("PAUSED", 220, 200);
        }

        if (gameOver) {
            ctx.fillStyle = "white";
            ctx.font = "35px Arial";
            ctx.fillText("GAME OVER", 190, 190);
            ctx.font = "20px Arial";
            ctx.fillText("Final Score: " + score, 220, 230);
        }
    }

    function gameLoop() {
        draw();

        if (!paused && !gameOver) {
            update();

            if (Date.now() - lastEnemy > 1000) {
                createEnemy();
                lastEnemy = Date.now();
            }
        }

        if (!gameOver) {
            animationId = requestAnimationFrame(gameLoop);
        }

        if (gameOver) {
            draw();
        }
    }

    document.getElementById("pauseButton").addEventListener("click", function() {
    paused = !paused;
    this.textContent = paused ? "RESUME" : "PAUSE";
});

    gameLoop();
}
