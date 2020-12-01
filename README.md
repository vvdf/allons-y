# Paranormal Divide
## About
  Paranormal Divide is an open source multiplayer Roguelike, written in JavaScript, utilizing React and Pixi.js for page and game layer rendering.
  * **Plot**: The player Officer is a member of the Paranormal Division of a given city, going out on missions/cases to investigate and deal with whatever might be going on.
  * **Gameplay**: Classic turn based roguelike (permadeath, procedural generation, etc.), with multiplayer elements. Shared goals with development of a single base between multiple players (similar to a guild investment system in an MMO). And the eventual option to go on cases together with fellow Division members, this will be a shared turn system when all present players are involved in the same battle together, otherwise the world around each player will move at that player's pace.
  * **Aesthetic**: 2D Isometric sprite based visuals.

## Running the Game
  `npm install`
  `npm run build`
  `npm start`

  As it is, this will run the Node.js webserver on port 3000, and the websocket server on port 3001

## Development Roadmap
  High Priority
  
  Main Site
  * Build main page
  * Build sidebar
  * Build proper login page

  Game
  * Player UI while on field map screen
  * Connect dungeon/map generation on server to current gameplay flow
  * Build complete flow between character creation, base management screen, and entering a dungeon/map
    (Utilizing placeholder simple art assets for the base screen)
  * Back-end validation of player actions
  * Implement Battle system for individual player interactions including implementation of simple AI for enemies (represented with placeholder sprites)
  * Update/rebuild client entity module (particular x,y coords to be a pos object containing x/y)
  * Update/rebuild client gamemap module
  * Handle proper zIndexing for tiles (notably walls/entities)

  Med Priority
  * Possible expansion into options during character creation (also possible external page for character
    creation)
  * Character management page
  * Improve general page look

  Low Priority
  * Development of more art assets
    * Eventual blending of tiles based on adjacencies (ie on edge of tile, one ground tile like sand should
      blend in with dirt, or some similar effect)
  * Implementation of animations
  * Option for terminal-style aesthetics for a more traditional roguelike experience
  * Improve opening splash screen generated detail