/** Asset identifiers, passed to phaser to reference pre-loaded assets. */
export enum AssetNames {
    "box" = "box",
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
    player: {
        type: "image",
        url: "assets/images/player.png",
    },
} as const;
