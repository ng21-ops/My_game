
function update() {
    // Movimiento de la nave
    if (keys["w"] && player.y > 0) player.y -= player.speed;
    if (keys["s"] && player.y < 365) player.y += player.speed;
    if (keys["a"] && player.x > 0) player.x -= player.speed;
    if (keys["d"] && player.x < 565) player.x += player.speed;

    // Movimiento de los disparos
    bullets.forEach(bullet => {
        bullet.y -= 7;
    });

    let remainingEnemies = [];

    for (let enemy of enemies) {
        let destroyed = false;

        // Revisar si una bala golpeó al enemigo
        for (let i = bullets.length - 1; i >= 0; i--) {
            let bullet = bullets[i];

            if (collision(bullet, enemy)) {
                score += 100;
                bullets.splice(i, 1);
                destroyed = true;
                break;
            }
        }

        // Si recibió un disparo, desaparece
        if (destroyed) {
            continue;
        }

        // Mover enemigo
        enemy.y += enemy.speed;

        // Solamente pierde vida si toca la nave
        if (collision(player, enemy)) {
            lives--;
            continue;
        }

        // Si llega al final, desaparece sin quitar vidas
        if (enemy.y > 400) {
            continue;
        }

        // Mantener enemigos que siguen en pantalla
        remainingEnemies.push(enemy);
    }

    enemies = remainingEnemies;

    // Eliminar disparos fuera de pantalla
    bullets = bullets.filter(bullet => bullet.y > -20);

    // Actualizar puntos y vidas
    document.getElementById("score").textContent = score;
    document.getElementById("lives").textContent = lives;

    if (lives <= 0) {
        gameOver = true;
    }
}
