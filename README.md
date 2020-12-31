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
    * Build account management

  Game
  ~~* Refactor to utilize 'position' module for entities, and decouple interactions between gameMap and entities~~
  ~~* Player UI while on field map screen~~
  ~~* Player input blocking on illegal actions/movements~~
  ~~* Update/rebuild client entity module (particular x,y coords to be a pos object containing x/y)~~
  * Entity loading/action handling on server side
    * Partitioning of entity and map groups by "division/guild"
  * Connect dungeon/map generation on server to current gameplay flow
  * Build complete flow between character creation, base management screen, and entering a dungeon/map
    (Utilizing placeholder simple art assets for the base screen)
  * Back-end validation of player actions
  * Implement loading of nearby entities during player action validation
  * Build interaction layer between entities/player
  * Implement Battle system for individual player interactions including implementation of simple AI for enemies (represented with placeholder sprites)
  * Update/rebuild client gamemap module
  * Handle proper zIndexing for tiles (notably walls/entities)
  * Missions/Cases/Objective definitions (primary and secondary objectives)
  * Inventory/Ability management (grid based system)
    * Field relative temporary changes to inventory/ability loadout based on pickup
  * Guild/Division Research Trees
  * Develop Multiplayer interactions

  Med Priority
  * Improve dungeon generation
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