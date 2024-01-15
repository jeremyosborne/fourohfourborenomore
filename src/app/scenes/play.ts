import { AssetNames } from "../assets";
import { Scene } from "phaser";
import { sceneNames } from "./scene-names";

export class Play extends Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor() {
        super({ key: sceneNames.play });
    }

    create() {
        // Create ground
        const ground = this.add.tileSprite(
            0,
            this.cameras.main.height - 20,
            this.cameras.main.width,
            40,
            AssetNames.ground,
        );
        this.physics.add.existing(ground, true); // true makes it a static body

        // Create player
        this.player = this.physics.add.sprite(
            100,
            this.cameras.main.height - 60,
            AssetNames.player,
        );
        this.player.setGravityY(300);

        // Player and ground collision
        this.physics.add.collider(this.player, ground);

        // Cursor keys for player control
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        // Player jump
        if (this.cursors.space.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-250);
        }
    }
}
