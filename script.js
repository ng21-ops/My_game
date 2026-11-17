const startButton = document.getElementById("startButton");

if (startButton) {
    startButton.addEventListener("click", function() {
        const gameScreen = document.querySelector(".game-screen");

        gameScreen.innerHTML = `
            <h2>MISSION STARTED!</h2>
            <p>Your spaceship is preparing for battle.</p>
            <p>SPACE DEFENDER</p>
            <button onclick="location.reload()">BACK TO MENU</button>
        `;
    });
}
