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
  Main Site
  High Priority
  * Build main page
  * Build sidebar
  * Build proper login page
    * Build account management

  Game
  High Priority
  * Battle interactions/mechanics
    * Tile based cursor control targetting for skills/tile highlighting
    * Expand skill/action system/controls
    * Redefine input definitions to read externally from engine, possibly via json object
  * Build Manager modules for serverside
    * Turn Management when factoring in multiplayer battles
    * Expand Entity/Guild/Map managers
    * Simplify signal handling/lookup? for example sending more detail in signal to server to ease lookup on server side (ie passing a client and/or entity uid, along
    with a map uid and the designated payload)
  * User profiles/profile settings (including keymapping)
  * Build out message logging system
    * Eventually to expand into a working chat system
  * Back-end validation of player actions
  * Entity loading/action handling on server side
    * Partitioning of entity and map groups by "division/guild"
  * Heightened ground implementation
  * Build complete flow between character creation, base management screen, and entering a dungeon/map
    (Utilizing placeholder simple art assets for the base screen)
  * Implement loading of nearby entities during player action validation
  * Build interaction layer between entities/player
  * Implement Battle system for individual player interactions including implementation of simple AI for enemies (represented with placeholder sprites)
  * Handle proper zIndexing for tiles
  * Missions/Cases/Objective definitions (primary and secondary objectives)
  * Stat/ability progression
  * Inventory/Ability management (grid based system)
    * Field relative temporary changes to inventory/ability loadout based on pickup
  * Guild/Division Research Trees
  * Expand Multiplayer interactions
  * Vision handling

  Med Priority
  * Improve dungeon generation
  * Possible expansion into options during character creation (also possible external page for character
    creation)
  * Character management page
  * Improve general page look
  * Improve sprite handling (smaller sprites, better center calculations, proper
    handling of scaling, and user settings, etc)
  * Expand enemy list

  Low Priority
  * Development of more art assets
    * Eventual blending of tiles based on adjacencies (ie on edge of tile, one ground tile like sand should
      blend in with dirt, or some similar effect)
  * Implementation of animations
  * Option for terminal-style aesthetics for a more traditional roguelike experience
  * Improve opening splash screen generated detail