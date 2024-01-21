# four-oh-four bore-no-more

A diversion for those that hit a 404.


## Development

### One time

- [nvm with shell integration](https://github.com/nvm-sh/nvm?tab=readme-ov-file#deeper-shell-integration).
- `npm install`

### Dev server

`npm start`

### Production build

`npm run build`

Test the built files with:

`npx http-server ./dist`

### Notes

- [TypeScript](https://www.typescriptlang.org/) as programming language.
- [Phaser](https://phaser.io/) as game engine.
- [Webpack](https://webpack.js.org/) as code bundle-orchestration.
- [Github Pages](https://pages.github.com/) for hosting.
- Code and artifact organization:
  - `./.env.example`: contains documentation of all environment variables that can be passed at build time. The majority of environment variables are for developer convenience are not used during production builds.
  - `./.env`: if included (presumed via copy-paste from `.env.example`), will be used during build time.
  - `./src`: contents processed in some way and become transpiled output.
  - `./static`: not processed, but required in the output.'
    - `./static/assets`: game assets (images, sounds, etc.) live here.
      - Use relative references to assets in game, as the final deploy will be in an application document root, not the absolute path of the url.
  - `./dist`: target folder, becomes the application root of the final build.
- Code builds:
  - Development:
    - `webpack-dev-server` for code watching and application hosting.
    - Push work in progress changes to `main`.
  - Production:
    - Push `main` to `release` to publish a new version of the game.
    - Github actions run to build the code and push the changes into the `gh-pages` branch, which will be made available via Github Pages.


## Game notes

- Phaser is used mainly for rendering and entity management.
- Phaser arcade physics is used for motion and collision management.
- Game play flow:
  - Game starts immediately.
  - Spacebar / click / tap jumps dinosaur.
  - Objects fly horizontally at player from right side of screen.
  - Objects that exit off the left side of the screen score 1 point.
  - Difficulty from jump timing management, as both x and y movement can only be controlled via one action.
  - Dinosaur being pushed off left side of screen or hitting spiked ceiling ends game.
  - Spacebar / click / tap restarts game.

## Known issues / historical notes

- `.nvmrc` and `package.json#engines` need to be kept in sync manually.
- `.tsconfig.json` is contorted to support both a node build environment with a `TypeScript` config for `webpack` and the needs of our application.
- Note on choice of webpack: had trouble using rollup or plain tsc with phaser output, so picked out a simple webpack config and things seem to "just work."
- `Phaser` will cause `webpack` to complain (appropriately) about artifact size, and I have not investigated tree shaking or partial builds for `Phaser`.
- The `webpack dev server` does not watch the following files and will need a manual restart:
  - `.env`
  - `./src/app/types/*` global types
- The game code does not watch browser resize events.
