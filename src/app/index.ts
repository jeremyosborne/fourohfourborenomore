//
// Script loading
//
// Control loading screen, which we assume is present in the HTML,
// and turn off when our (quite large) game script has loaded.
//
document.addEventListener("DOMContentLoaded", () => {
    const gameLoadingContainer = document.getElementById("pk-bios-loading");
    const gameContainer = document.getElementById("game-container");

    import("./game").then((game) => {
        // The HTML page might not have a loading container.
        if (gameLoadingContainer) {
            gameLoadingContainer.classList.add("loaded");
        }
        // But it always must have a game container.
        gameContainer.classList.remove("hidden");
        game.main(); // Function to initialize and start your game
    });
});
