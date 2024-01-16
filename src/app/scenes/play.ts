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
        this.physics.add.existing(ground, true);

        this.player = new Player(this, 100, this.cameras.main.height - 60);
        this.player.spawn();

        this.physics.add.collider(this.player, ground);

        this.boxes = this.physics.add.group({
            maxSize: 10,
            classType: Box,
        });
        this.physics.add.collider(
            this.player,
            this.boxes,
            this.onPlayerHit,
            null,
            this,
        );

        // Spawn boxes at random intervals
        this.time.addEvent({
            delay: 1000, // Spawn a box every 1000 milliseconds (1 second), adjust as needed
            callback: this.spawnBox,
            callbackScope: this,
            loop: true,
        });

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        // Player jump
        if (this.cursors.space.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-250);
        }

        for (const box of this.boxes.getChildren() as Array<Box>) {
            if (box.body.position.x < -box) {
                this.boxes.remove(box, true, true);
                box.kill();
            }
            return;
        }
    }

    spawnBox() {
        if (this.boxes.getLength() < 10) {
            const height = Phaser.Math.Between(
                100,
                this.cameras.main.height - 40,
            );
            const box = this.boxes.create(
                this.cameras.main.width,
                height,
                "ground",
            );
            box.setVelocityX(-200); // Adjust the speed as needed
        }
    }

    onPlayerHit = (player, box) => {
        console.log("Player hit by box!");
        // Add your logic here for when the player collides with the box
    };
}
