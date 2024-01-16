import { AssetNames } from "../assets";
import { Physics, Scene } from "phaser";

/**
 * The purple dino is the main player.
 */
export class Box
    extends Physics.Arcade.Sprite
    implements IGameObjectLiveKill, IGameObjectSpawn, IGameObjectUpdate
{
    constructor(scene: Scene, x = 0, y = 0) {
        super(scene, x, y, AssetNames.box);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        // Like most sprites, the player also starts off dead.
        this.kill();
    }

    live() {
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;
    }

    kill() {
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false;
    }

    spawn(x = 0, y = 0, speed = 200) {
        this.live();
        this.setPosition(x, y);
        this.setVelocityY(0);
        this.setVelocityX(-1 * speed);
    }

    update() {
        // Remove box from the left bounds of the game.
        if (this.body.position.x < -this.width) {
            this.kill();
        }
    }
}
