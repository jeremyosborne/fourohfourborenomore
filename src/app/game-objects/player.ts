import { AssetNames } from "../assets";
import { Physics, Scene } from "phaser";

/**
 * The purple dino is the main player.
 */
export class Player
    extends Physics.Arcade.Sprite
    implements IGameObjectLiveKill, IGameObjectSpawn
{
    constructor(scene: Scene, x = 0, y = 0) {
        super(scene, x, y, AssetNames.player);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setGravityY(300);
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

    spawn() {
        this.live();
    }
}
