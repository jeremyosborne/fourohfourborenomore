import { AssetNames } from "../assets";
import { Obstacle, Player } from "../game-objects";
import { GameObjects, Math as PhaserMath, Scene, Types } from "phaser";
import { sceneNames } from "./scene-names";

export class Play extends Scene {
    ceiling: GameObjects.TileSprite;
    cursors: Types.Input.Keyboard.CursorKeys;
    ground: GameObjects.TileSprite;
    obstacles: GameObjects.Group;
    player: Player;

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

        this.player = new Player(this, 100, this.cameras.main.height - 60);
        this.player.spawn();

        this.obstacles = this.physics.add.group({
            maxSize: 10,
            classType: Obstacle,
            runChildUpdate: true,
        });

        // Player can't go below the ground.
        this.physics.add.collider(this.player, this.ground);
        // Obstacles can bounce off the ground.
        this.physics.add.collider(this.obstacles, this.ground);
        // Obstacles try to push the player out of the game bounds or into
        // a deadly obstacle.
        this.physics.add.collider(
            this.player,
            this.obstacles,
            this.collidePlayerObstacle,
            null,
            this,
        );

        this.addEventSpawnObstacle();

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update(gameTime: number, delta: number) {
        // Player jump
        if (this.cursors.space.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-250);
        }

        // Player horizontal scrolling visual effect.
        this.ceiling.tilePositionX += 2;
        this.ground.tilePositionX += 2;

        this.obstacles.preUpdate(gameTime, delta);
    }

    /** Queue up a random addition of an obstacle. */
    addEventSpawnObstacle() {
        this.time.addEvent({
            delay: PhaserMath.Between(400, 1500),
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: false,
        });
    }

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
            obstacle.spawn(spawnX, spawnY, 200);
        }
        this.addEventSpawnObstacle();
    }

    collidePlayerObstacle = (player: Player, obstacle: Obstacle) => {
        console.log("Player hit by box!");
        // Add your logic here for when the player collides with the box
    };
}
