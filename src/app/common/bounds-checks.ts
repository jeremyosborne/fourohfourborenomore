import { Geom, Physics } from "phaser";

/**
 * Whether or not a sprite has completely left the view.
 */
export function isOutOfBounds(
    bounds: Geom.Rectangle,
    sprite: Physics.Arcade.Sprite,
): boolean {
    return (
        sprite.x - sprite.displayWidth < bounds.x ||
        sprite.y - sprite.displayHeight < bounds.y ||
        sprite.x > bounds.right ||
        sprite.y > bounds.bottom
    );
}
