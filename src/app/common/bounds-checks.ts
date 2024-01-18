import { Physics, Scene } from "phaser";

/**
 * Whether or not a sprite has completely left the view.
 */
export function isOutOfBounds(
    scene: Scene,
    sprite: Physics.Arcade.Sprite,
): boolean {
    const bounds = scene.cameras.main.worldView;

    return (
        sprite.x - sprite.displayWidth < bounds.x ||
        sprite.y - sprite.displayHeight < bounds.y ||
        sprite.x > bounds.right ||
        sprite.y > bounds.bottom
    );
}
