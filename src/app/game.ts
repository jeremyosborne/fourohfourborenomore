//
// Code making use of Phase 3.70.0
// This code must be transpiled before being run.
//

import { config } from "./config";
import { Game } from "phaser";
import { AssetLoader, Play } from "./scenes";

// Must equal the reference of our HTML game container.
const GAME_CONTAINER_ID = "game-container";

export const main = () => {
    const gameContainer = document.getElementById(GAME_CONTAINER_ID);
    new Game({
        // Game will work within whatever container is supplied. It is the
        // responsibility of the container provider to set appropriate dimensions.
        width: gameContainer.clientWidth,
        height: gameContainer.clientHeight,

        backgroundColor: "#000000",

        // Selects by element `id`.
        parent: "game-container",
        physics: {
            default: "arcade",
            arcade: {
                debug: config().PHASER_PHYSICS_ARCADE_DEBUG,
            },
        },
        scene: [AssetLoader, Play],
        type: Phaser.AUTO,
    });
};
