import { AssetNames } from "../assets";
import { Obstacle, Player } from "../game-objects";
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

    /** Value used to move ceiling and ground tiles during every call to update. */
    backgroundTileScrollXSpeed = 2;

    constructor() {
        super({ key: sceneNames.play });
    }

    create() {
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
            maxSize: 10,
            classType: Obstacle,
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
        // Player jump.
        if (this.cursors.space.isDown) {
            this.player.setVelocityY(-130);
            this.player.setVelocityX(50);
        }
        // Player can only jump so far forward.
        if (this.player.x > this.barrierX) {
            this.player.setVelocityX(0);
            this.player.x = this.barrierX;
        }

        // Background update provides a horizontal scrolling visual effect for the player.
        this.ceiling.tilePositionX += this.backgroundTileScrollXSpeed;
        this.ground.tilePositionX += this.backgroundTileScrollXSpeed;

        this.obstacles.preUpdate(gameTime, delta);
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
