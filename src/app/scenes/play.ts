import { AssetNames } from "../assets";
import { isOutOfBounds } from "../common";
import { Obstacle, Player, Propulsion } from "../game-objects";
import { GameObjects, Math as PhaserMath, Physics, Scene, Types } from "phaser";
import { sceneNames } from "./scene-names";

export class Play extends Scene {
    /** Video game logic/physics: the player can progress only so far in the X direction. */
    barrierX: number;
    ceiling: GameObjects.TileSprite;
    cursors: Types.Input.Keyboard.CursorKeys;
    /** Which state the game is currently in. */
    gameState: "play" | "player-killed" | "game-over" | "restart" = "play";
    gameOverText: GameObjects.Text;
    /** The time at which the game is marked as over. Used for tap throttling. */
    gameOverAt: number;
    ground: GameObjects.TileSprite;
    obstacles: GameObjects.Group;
    particles: GameObjects.Particles.ParticleEmitter;
    player: Player;
    propulsions: GameObjects.Group;
    /** If true, does not launch another propulsion, even if the player leans on the spacebar. */
    propulsionCoolingDown: boolean = false;
    /** Score counter. */
    score: number = 0;
    /** Score display. */
    scoreText: GameObjects.Text;

    /** Value used to move ceiling and ground tiles during every call to update. */
    readonly backgroundTileScrollXSpeed = 2;

    constructor() {
        super({ key: sceneNames.play });
    }

    create() {
        this.particles = this.add.particles(0, 0, AssetNames.box, {
            emitting: false,
            gravityX: 0,
            gravityY: 150,
            lifespan: 2000,
            quantity: 10,
            rotate: { start: 0, end: 720 },
            scale: { start: 1.0, end: 0 },
            speed: 90,
            tint: [0x942fcd],
            tintFill: true,
        });

        this.scoreText = this.add
            // Position below the ceiling.
            .text(5, 40, "", {
                fontSize: "16px",
                color: "#ffffff",
            })
            .setOrigin(0, 0);
        // Sets the initial label, prevent duplicate strings.
        this.scoreIncrement(0);

        this.gameOverText = this.add
            .text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                "Game Over\nhit spacebar to play again",
                {
                    align: "center",
                    color: "#ffffff",
                    fontSize: "16px",
                },
            )
            .setOrigin(0.5, 0.5);
        // Game over text is initial invisible.
        this.gameOverText.setVisible(false);

        this.ceiling = this.add.tileSprite(
            0,
            0,
            this.cameras.main.width,
            32,
            AssetNames.spike,
        );
        this.ceiling.setOrigin(0, 0);
        this.physics.add.existing(this.ceiling, true);

        this.ground = this.add.tileSprite(
            0,
            this.cameras.main.height - 20,
            this.cameras.main.width,
            32,
            AssetNames.ground,
        );
        this.ground.setOrigin(0, 0);
        this.physics.add.existing(this.ground, true);

        this.barrierX = this.cameras.main.width * 0.3;

        this.player = new Player(this, 100, this.cameras.main.height - 60);
        this.player.spawn();

        this.obstacles = this.physics.add.group({
            classType: Obstacle,
            maxSize: 10,
            runChildUpdate: true,
        });

        // Visual but non-interactive.
        this.propulsions = this.add.group({
            classType: Propulsion,
            maxSize: 10,
            runChildUpdate: true,
        });

        // Player can't go below the ground or through the ceiling.
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(
            this.player,
            this.ceiling,
            this.collidePlayerCeiling,
            null,
            this,
        );
        // Obstacles can't go through the ground or ceiling.
        this.physics.add.collider(this.obstacles, this.ground);
        this.physics.add.collider(this.obstacles, this.ceiling);
        // Obstacles try to push the player out of the game bounds or into
        // a deadly obstacle.
        this.physics.add.collider(this.player, this.obstacles);

        // Begin the obstacle spawning.
        this.spawnObstacleAddEvent();

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update(gameTime: number, delta: number) {
        if (this.gameState === "play") {
            this.updatePlay(gameTime, delta);
        } else if (this.gameState === "player-killed") {
            this.updatePlayerKilled(gameTime, delta);
        } else if (this.gameState === "game-over") {
            this.updateGameOver(gameTime, delta);
        } else if (this.gameState === "restart") {
            this.updateRestart(gameTime, delta);
        }
    }

    /**
     * Instruct the player on what to do during game over.
     */
    updateGameOver(gameTime: number, delta: number) {
        // Prevent spacebar spamming from instant reset.
        if (this.cursors.space.isDown && gameTime - this.gameOverAt > 500) {
            this.gameState = "restart";
        }
    }

    /**
     * Normal game state, until the player is killed.
     */
    updatePlay(gameTime: number, delta: number) {
        // Spacebar = player jump.
        if (
            this.cursors.space.isDown &&
            // Can't jump if our propulsion system is empty or we are cooling down
            this.obstacles.countActive() < this.obstacles.maxSize &&
            !this.propulsionCoolingDown
        ) {
            // Propulsion to launch the dinosaur should occur from its behind.
            const propulsion = this.propulsions.get() as Propulsion;
            // I thought the above check would work, but it appears not to,
            // so we just add one more check in case null.
            if (propulsion) {
                this.player.setVelocityY(-230);
                this.player.setVelocityX(50);
                propulsion.spawn(
                    this.player.body.x - 5,
                    this.player.body.y + this.player.displayHeight - 5,
                );
                this.propulsionCoolingDown = true;
                this.time.addEvent({
                    delay: 400,
                    callback: () => (this.propulsionCoolingDown = false),
                    callbackScope: this,
                    loop: false,
                });
            }
        }
        // Player can only jump so far forward (video game logic).
        if (this.player.x > this.barrierX) {
            this.player.setVelocityX(0);
            this.player.x = this.barrierX;
        }

        // Background update provides a horizontal scrolling visual effect for the player.
        this.ceiling.tilePositionX += this.backgroundTileScrollXSpeed;
        this.ground.tilePositionX += this.backgroundTileScrollXSpeed;

        // Handle propulsion animation.
        this.propulsions.preUpdate(gameTime, delta);

        // Remove obstacles that have passed the left side of the screen.
        this.obstacles.preUpdate(gameTime, delta);
        for (const obstacle of this.obstacles.getChildren() as Array<Obstacle>) {
            if (
                obstacle.active &&
                isOutOfBounds(this.physics.world.bounds, obstacle)
            ) {
                obstacle.kill();
                this.scoreIncrement(1);
            }
        }

        // Handle game over condition.
        if (
            this.player.active &&
            // The dinosaur must be pushed entirely out of bounds.
            this.physics.world.bounds.x >
                this.player.x + this.player.displayWidth
        ) {
            this.gameState = "player-killed";
        }
    }

    /**
     * Transition from play state to game over state.
     */
    updatePlayerKilled(gameTime: number, delta: number) {
        this.player.kill();
        // Have all of the obstacles drop to the ground.
        for (const obstacle of this.obstacles.getChildren() as Array<Obstacle>) {
            if (obstacle.active) {
                obstacle.setVelocity(0, 250);
            }
        }
        this.gameOverText.setVisible(true);
        this.gameOverAt = gameTime;
        this.gameState = "game-over";
    }

    /**
     * Resets the game to an initial state for replay.
     */
    updateRestart(gameTime: number, delta: number) {
        // Reset the player.
        this.player.setPosition(100, this.cameras.main.height - 60);
        this.player.setVelocity(0, 0);
        this.player.spawn();
        // Reset the obstacles.
        for (const obstacle of this.obstacles.getChildren() as Array<Obstacle>) {
            obstacle.kill();
        }
        // Hide the game over text.
        this.gameOverText.setVisible(false);
        // Restart the obstacle spawning.
        this.gameState = "play";
    }

    /**
     * Update the score as well as the display value.
     */
    scoreIncrement(value: number = 1) {
        this.score += value;
        this.scoreText.setText("Score: " + this.score);
    }

    /**
     * Queue up addition of an obstacle.
     *
     * @see spawnObstacle
     */
    spawnObstacleAddEvent() {
        this.time.addEvent({
            delay: PhaserMath.Between(400, 1500),
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: false,
        });
    }

    /**
     * Hurls an obstacle at the player, and enqueues the
     * next obstacle spawn.
     *
     * @see spawnObstacleAddEvent
     */
    spawnObstacle() {
        if (this.gameState === "play") {
            // Add an obstacle if we don't have the maximum number of them
            // in the game and queue up the next call.
            console.log("spawnObstacle:", this.obstacles.countActive());
            if (this.obstacles.countActive() < this.obstacles.maxSize) {
                // Spawn on the right side of the game at a random height.
                const spawnX = this.cameras.main.width;
                const spawnY = Phaser.Math.Between(
                    100,
                    this.cameras.main.height - 40,
                );
                const obstacle = this.obstacles.get() as Obstacle;
                obstacle.spawn(spawnX, spawnY, -200);
            }
        }
        this.spawnObstacleAddEvent();
    }

    collidePlayerCeiling = (player: Player, ceiling: Physics.Arcade.Sprite) => {
        // Player disappears when killed, but since still on screen we want
        // a visual explosion.
        this.particles.emitParticleAt(
            this.player.body.x,
            this.player.body.y,
            15,
        );

        this.gameState = "player-killed";
    };
}
