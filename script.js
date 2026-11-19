
const gameScreen = document.getElementById("gameScreen");

// ===================================
// HIGH SCORES
// ===================================

function getHighScores() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("spaceDefenderScores")
        );

        return Array.isArray(saved)
            ? saved.filter(Number.isFinite)
            : [];
    } catch (error) {
        return [];
    }
}

function saveHighScore(score) {
    let scores = getHighScores();

    scores.push(score);

    scores.sort((a, b) => b - a);

    scores = scores.slice(0, 5);

    try {
        localStorage.setItem(
            "spaceDefenderScores",
            JSON.stringify(scores)
        );
    } catch (error) {
        console.log("Could not save high scores.");
    }
}

function displayHighScores() {
    const list = document.getElementById("highScoreList");
    if (!list) return;

    const scores = getHighScores();

    if (scores.length === 0) {
        list.innerHTML = "<li>No scores yet!</li>";
        return;
    }

    list.innerHTML = scores
        .map(score => `<li>${score} points</li>`)
        .join("");
}

// ===================================
// MAIN MENU
// ===================================

function showMenu() {
    document.onkeydown = null;
    document.onkeyup = null;

    gameScreen.innerHTML = `
        <h2>READY FOR BATTLE?</h2>

        <p>Defend the galaxy from enemy spaceships!</p>

        <button id="startButton">START GAME</button>

        <div class="high-score-section">
            <h2>TOP 5 HIGH SCORES</h2>
            <ol id="highScoreList"></ol>
        </div>
    `;

    document.getElementById("startButton")
        .addEventListener("click", startGame);

    displayHighScores();
}

// ===================================
// START GAME
// ===================================

function startGame() {

    document.onkeydown = null;
    document.onkeyup = null;

    gameScreen.innerHTML = `
        <div id="gameInfo">
            <span>SCORE: <span id="score">0</span></span>
            <span>LIVES: <span id="lives">3</span></span>
        </div>

        <canvas id="gameCanvas"
            width="600"
            height="400">
        </canvas>

        <p>Move: W A S D | Shoot: SPACE | Pause: P</p>

        <div id="gameControls">
            <button id="pauseButton">PAUSE</button>
            <button id="restartButton">RESTART GAME</button>
        </div>
    `;

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // Player
    const player = {
        x: 280,
        y: 330,
        width: 35,
        height: 35,
        speed: 5
    };

    // Game variables
    let score = 0;
    let lives = 3;

    let bullets = [];
    let enemies = [];
    let keys = {};

    let paused = false;
    let gameOver = false;
    let scoreSaved = false;

    let lastEnemy = Date.now();
    let animationId = null;

    // ===================================
    // CONTROLS
    // ===================================

    document.onkeydown = function(event) {

        const key = event.key.toLowerCase();

        keys[key] = true;

        if (event.code === "Space") {
            event.preventDefault();

            if (!paused && !gameOver && !event.repeat) {
                shoot();
            }
        }

        if (key === "p" && !gameOver && !event.repeat) {
            togglePause();
        }
    };

    document.onkeyup = function(event) {
        keys[event.key.toLowerCase()] = false;
    };

    function togglePause() {

        if (gameOver) return;

        paused = !paused;

        document.getElementById("pauseButton").textContent =
            paused ? "RESUME" : "PAUSE";

        if (paused) {
            keys = {};
        }
    }

    // ===================================
    // SHOOT
    // ===================================

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

    // ===================================
    // ENEMIES
    // ===================================

    function createEnemy() {

        enemies.push({
            x: Math.random() * 560,
            y: -30,
            width: 30,
            height: 30,
            speed: 2 + Math.random() * 2
        });
    }

    // ===================================
    // COLLISION
    // ===================================

    function collision(a, b) {

        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    // ===================================
    // UPDATE GAME
    // ===================================

    function update() {

        // Move player
        if (keys["w"] && player.y > 0) {
            player.y -= player.speed;
        }

        if (keys["s"] && player.y < 365) {
            player.y += player.speed;
        }

        if (keys["a"] && player.x > 0) {
            player.x -= player.speed;
        }

        if (keys["d"] && player.x < 565) {
            player.x += player.speed;
        }

        // Move bullets
        bullets.forEach(bullet => {
            bullet.y -= 7;
        });

        let remainingEnemies = [];

        // Check enemies
        for (let enemy of enemies) {

            let destroyed = false;

            // Check bullet collisions
            for (let i = bullets.length - 1; i >= 0; i--) {

                if (collision(bullets[i], enemy)) {

                    score += 100;

                    bullets.splice(i, 1);

                    destroyed = true;

                    break;
                }
            }

            // Destroyed enemies do not cause damage
            if (destroyed) {
                continue;
            }

            // Move enemy
            enemy.y += enemy.speed;

            // Only lose a life when enemy touches player
            if (collision(player, enemy)) {

                lives--;

                continue;
            }

            // Enemies that leave the screen disappear
            if (enemy.y > 400) {
                continue;
            }

            remainingEnemies.push(enemy);
        }

        enemies = remainingEnemies;

        // Remove bullets outside screen
        bullets = bullets.filter(bullet => bullet.y > -20);

        // Update score and lives
        document.getElementById("score").textContent = score;
        document.getElementById("lives").textContent = lives;

        if (lives <= 0) {
            gameOver = true;
        }
    }

    // ===================================
    // DRAW GAME
    // ===================================

    function draw() {

        // Background
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

        ctx.fillRect(
            player.x,
            player.y,
            player.width,
            player.height
        );

        ctx.fillStyle = "white";

        ctx.fillRect(
            player.x + 12,
            player.y + 5,
            10,
            10
        );

        // Bullets
        ctx.fillStyle = "#ffdd55";

        bullets.forEach(bullet => {

            ctx.fillRect(
                bullet.x,
                bullet.y,
                bullet.width,
                bullet.height
            );
        });

        // Enemies
        ctx.fillStyle = "#ff3366";

        enemies.forEach(enemy => {

            ctx.fillRect(
                enemy.x,
                enemy.y,
                enemy.width,
                enemy.height
            );
        });

        // Pause message
        if (paused) {

            ctx.fillStyle = "white";
            ctx.font = "35px Arial";
            ctx.textAlign = "center";

            ctx.fillText("PAUSED", 300, 200);

            ctx.textAlign = "left";
        }

        // Game Over message
        if (gameOver) {

            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.fillRect(0, 0, 600, 400);

            ctx.fillStyle = "#ff3366";
            ctx.font = "40px Arial";
            ctx.textAlign = "center";

            ctx.fillText("GAME OVER", 300, 180);

            ctx.fillStyle = "white";
            ctx.font = "22px Arial";

            ctx.fillText(
                "Final Score: " + score,
                300,
                220
            );

            ctx.textAlign = "left";
        }
    }

    // ===================================
    // GAME OVER
    // ===================================

    function finishGame() {

        if (scoreSaved) return;

        scoreSaved = true;

        saveHighScore(score);

        document.onkeydown = null;
        document.onkeyup = null;

        document.getElementById("gameControls").innerHTML = `
            <button id="restartButton">PLAY AGAIN</button>
            <button id="menuButton">MAIN MENU</button>
        `;

        document.getElementById("restartButton")
            .addEventListener("click", startGame);

        document.getElementById("menuButton")
            .addEventListener("click", showMenu);
    }

    // ===================================
    // GAME LOOP
    // ===================================

    function gameLoop() {

        if (!paused && !gameOver) {

            update();

            if (Date.now() - lastEnemy > 1000) {

                createEnemy();

                lastEnemy = Date.now();
            }
        }

        draw();

        if (gameOver) {

            finishGame();

            return;
        }

        animationId = requestAnimationFrame(gameLoop);
    }

    // ===================================
    // BUTTONS
    // ===================================

    document.getElementById("pauseButton")
        .addEventListener("click", togglePause);

    document.getElementById("restartButton")
        .addEventListener("click", startGame);

    // Start animation
    gameLoop();
}

// Show menu when page loads
displayHighScores();
document.getElementById("startButton")
    .addEventListener("click", startGame);
