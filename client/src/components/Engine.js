import * as PIXI from 'pixi.js';
import GameMap from './GameMap';

class Engine {
  constructor(targetEle) {
    // initialize game renderer, append as child to passed in element
    this.settings = {
      backgroundColor: 0xf0c5e9,
      width: 800,
      height: 550,
      resolution: 1,
    };

    this.constants = {
      // these include pixel overlap
      tileWidth: 28,
      tileHeight: 14,
      tileDepth: 10,
    };

    const game = new PIXI.Application(this.settings);

    this.game = game;
    this.state = this.play;
    this.textures = {};
    this.entityList = {};
    this.player = {
      x: 0,
      y: 0,
    };
    this.gameMap = GameMap(10, 10, 'g');
    this.loader = PIXI.Loader.shared;
    targetEle.appendChild(game.view);
    this.init();
  }

  init() {
    // initialize game Engine variables/systems/assets
    // create and populate scenes
    const setup = () => {
      this.textures.player = this.loader.resources['assets/96x48_rally_police_girl.png'].texture;
      this.textures.grass = PIXI.utils.TextureCache['grass.png'];
      this.textures.road = PIXI.utils.TextureCache['road.png'];
      this.textures.water = PIXI.utils.TextureCache['water1.png'];

      this.render();
    };

    // load assets into renderer and then run renderer setup using loaded assets
    this.loader
      .add('assets/96x48_rally_police_girl.png')
      .add('assets/643212_floor_tiles.json')
      .load(setup);
  }

  gameLoop(delta) {
    this.state(delta);
  }

  play(delta) {
    // play state function

  }

  gridToViewX(sprite, dx = 0, dy = 0) {
    // convert grid X position on map to view X position on renderer, factoring iso coords
    // dx and dy are deltas between target grid pos, and center (aka player)
    return (this.settings.width / 2) - (sprite.width / 2)
      + (this.constants.tileWidth * dx) - (this.constants.tileWidth * dy);
  }

  gridToViewY(sprite, dx = 0, dy = 0, isEntity = false) {
    // convert grid Y position on map to view Y position on renderer, factoring iso coords
    // dx and dy are deltas between target grid pos, and center (aka player)
    if (isEntity) {
      return (this.settings.height / 2) - (sprite.height)
        + (this.constants.tileHeight * dx) + (this.constants.tileHeight * dy);
    }
    return (this.settings.height / 2) - (sprite.height / 2)
      + (this.constants.tileHeight * dx) + (this.constants.tileHeight * dy);
  }

  render() {
    this.renderMap();
    this.renderEntities();
  }

  renderMap() {
    const mapSprite = new PIXI.Container();
    for (let y = 0; y < this.gameMap.length; y += 1) {
      for (let x = 0; x < this.gameMap[y].length; x += 1) {
        const dy = y - this.player.y;
        const dx = x - this.player.x;
        let tile;
        if (this.gameMap[y][x] === 'g') {
          tile = new PIXI.Sprite(this.textures.grass);
        } else if (this.gameMap[y][x] === 'r') {
          tile = new PIXI.Sprite(this.textures.road);
        } else if (this.gameMap[y][x] === 'w') {
          tile = new PIXI.Sprite(this.textures.water);
        }

        tile.x = this.gridToViewX(tile, dx, dy);
        tile.y = this.gridToViewY(tile, dx, dy);

        mapSprite.addChild(tile);
      }
    }

    this.game.stage.addChild(mapSprite);
  }

  renderEntities() {
    const playerSprite = new PIXI.Sprite(this.textures.player);
    playerSprite.x = this.gridToViewX(playerSprite);
    playerSprite.y = this.gridToViewY(playerSprite, 0, 0, true);

    this.game.stage.addChild(playerSprite);
  }

  addToScene(spritesArr) {
    for (let i = 0; i < spritesArr.length; i += 1) {
      this.game.stage.addChild(spritesArr[i]);
    }
  }

  removeFromScene(spritesArr) {
    for (let i = 0; i < spritesArr.length; i += 1) {
      this.game.stage.removeChild(spritesArr[i]);
    }
  }
}

export default Engine;
