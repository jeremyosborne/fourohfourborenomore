/** Asset identifiers, passed to phaser to reference pre-loaded assets. */
export enum AssetNames {
    "box" = "box",
    "gasCloud" = "gasCloud",
    "ground" = "ground",
    "pig" = "pig",
    "player" = "player",
    "spike" = "spike",
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
    gasCloud: {
        type: "image",
        url: "assets/images/gas-cloud.png",
    },
    ground: {
        type: "image",
        url: "assets/images/ground.png",
    },
    pig: {
        type: "image",
        url: "assets/images/pig.png",
    },
    player: {
        type: "image",
        url: "assets/images/player.png",
    },
    spike: {
        type: "image",
        url: "assets/images/spike.png",
    },
} as const;
