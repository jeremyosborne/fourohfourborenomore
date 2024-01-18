import { AssetNames } from "../assets";
import { Obstacle, Player, Propulsion } from "../game-objects";
import { GameObjects, Math as PhaserMath, Physics, Scene, Types } from "phaser";
import { sceneNames } from "./scene-names";

export class Play extends Scene {
    /** Video game logic/physics: the player can progress only so far in the X direction. */
    barrierX: number;
    ceiling: GameObjects.TileSprite;
    cursors: Types.Input.Keyboard.CursorKeys;
    ground: GameObjects.TileSprite;
    obstacles: GameObjects.Group;
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
        this.scoreText = this.add
            // Position below the ceiling.
            .text(5, 40, "", {
                fontSize: "16px",
                color: "#ffffff",
            })
            .setOrigin(0, 0);
        // Sets the initial label, prevent duplicate strings.
        this.scoreIncrement(0);

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
        this.physics.add.collider(
            this.player,
            this.obstacles,
            this.collidePlayerObstacle,
            null,
            this,
        );

        // Begin the obstacle spawning.
        this.spawnObstacleAddEvent();

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update(gameTime: number, delta: number) {
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
                this.player.setVelocityY(-130);
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
            if (obstacle.active && obstacle.body.position.x < -obstacle.width) {
                obstacle.kill();
                this.scoreIncrement(1);
            }
        }
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
        // Add an obstacle if we don't have the maximum number of them
        // in the game and queue up the next call.
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
        this.spawnObstacleAddEvent();
    }

    collidePlayerCeiling = (player: Player, ceiling: Physics.Arcade.Sprite) => {
        console.log("Player hit ceiling");
    };

    collidePlayerObstacle = (player: Player, obstacle: Obstacle) => {
        console.log("Player hit obstacle");
    };
}
