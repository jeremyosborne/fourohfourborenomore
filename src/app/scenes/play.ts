import { AssetNames } from "../assets";
import { GameObjects, Scene } from "phaser";
import { sceneNames } from "./scene-names";
import { Box, Player } from "../game-objects";

export class Play extends Scene {
    player: Player;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    boxes: GameObjects.Group;

    constructor() {
        super({ key: sceneNames.play });
    }

    create() {
        const ground = this.add.tileSprite(
            0,
            this.cameras.main.height - 20,
            this.cameras.main.width,
            40,
            AssetNames.box,
        );
        ground.setOrigin(0, 0);
        this.physics.add.existing(ground, true);

        this.player = new Player(this, 100, this.cameras.main.height - 60);
        this.player.spawn();

        this.boxes = this.physics.add.group({
            maxSize: 10,
            classType: Box,
            runChildUpdate: true,
        });

        this.physics.add.collider(this.player, ground);
        this.physics.add.collider(
            this.player,
            this.boxes,
            this.onPlayerHit,
            null,
            this,
        );

        this.time.addEvent({
            delay: 1000,
            callback: this.spawnBox,
            callbackScope: this,
            loop: true,
        });

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update(gameTime: number, delta: number) {
        // Player jump
        if (this.cursors.space.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-250);
        }

        this.boxes.preUpdate(gameTime, delta);
    }

    spawnBox() {
        if (this.boxes.countActive() < this.boxes.maxSize) {
            // Spawn on the right side of the game at a random height.
            const spawnX = this.cameras.main.width;
            const spawnY = Phaser.Math.Between(
                100,
                this.cameras.main.height - 40,
            );
            const box = this.boxes.get() as Box;
            box.spawn(spawnX, spawnY, 200);
        }
    }

    onPlayerHit = (player, box) => {
        console.log("Player hit by box!");
        // Add your logic here for when the player collides with the box
    };
}
