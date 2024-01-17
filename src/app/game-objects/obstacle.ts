import { AssetNames } from "../assets";
import { Physics, Scene } from "phaser";

/**
 * Obstacles fly at the player, and the player needs to dodge them.
 */
export class Obstacle
    extends Physics.Arcade.Sprite
    implements IGameObjectLiveKill, IGameObjectSpawn
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

    spawn(x = 0, y = 0, speedX = -200) {
        this.live();
        this.setPosition(x, y);
        this.setVelocityX(speedX);
        // We want to start at 0 Y velocity, in case some other body
        // previously collided with us and imparted a Y velocity onto us.
        this.setVelocityY(0);
    }
}
