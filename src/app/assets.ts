/** Asset identifiers, passed to phaser to reference pre-loaded assets. */
export enum AssetNames {
    "box" = "box",
    "ground" = "ground",
    "player" = "player",
}

/**
 * Assets that will be preloaded before the game begins.
 *
 * @see AssetLoader
 */
export const assetConfigs: Record<AssetNames, AssetLoaderConfig> = {
    box: {
        type: "image",
        url: "assets/images/box.png",
    },
    ground: {
        type: "image",
        url: "assets/images/ground.png",
    },
    player: {
        type: "image",
        url: "assets/images/player.png",
    },
} as const;
