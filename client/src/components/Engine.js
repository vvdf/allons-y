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

    this.ticker = 0;
    this.game = game;
    this.state = this.play;
    this.textures = {};
    this.sprites = {};
    this.entityList = {};
    this.player = {
      x: 0,
      y: 0,
    };
    this.gameMap = new GameMap(10, 10, 'g');
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

      // this.render();
      this.game.ticker.add(delta => this.gameLoop(delta));
    };

    // load assets into renderer and then run renderer setup using loaded assets
    this.loader
      .add('assets/96x48_rally_police_girl.png')
      .add('assets/643212_floor_tiles.json')
      .load(setup);

    // TODO - refactor this code into a controls module
    window.addEventListener('keydown', ({ keyCode }) => {
      if (keyCode === 38) {
        // arrow up
        this.player.y = this.player.y < 1 ? 0 : this.player.y - 1;
      } else if (keyCode === 39) {
        // arrow right
        this.player.x = this.player.x === this.gameMap.width - 1
          ? this.player.x
          : this.player.x + 1;
      } else if (keyCode === 40) {
        // arrow down
        this.player.y = this.player.y === this.gameMap.height - 1
          ? this.player.y
          : this.player.y + 1;
      } else if (keyCode === 37) {
        // arrow left
        this.player.x = this.player.x < 1 ? 0 : this.player.x - 1;
      } else if (keyCode === 71) {
        // tile painting, 'G' for grass
        this.gameMap.set(this.player.x, this.player.y, 'g');
      } else if (keyCode === 87) {
        // tile painting, 'W' for water
        this.gameMap.set(this.player.x, this.player.y, 'w');
      } else if (keyCode === 82) {
        // tile painting, 'R' for rpad
        this.gameMap.set(this.player.x, this.player.y, 'r');
      } else if (keyCode === 83) {
        // saving map, 'S'
        this.gameMap.save();
      } else if (keyCode === 76) {
        // loading map, 'L'
        this.gameMap.load();
      } else {
        // unlisted key
        console.log('Unassigned Key Pressed: ', keyCode);
      }
    }, false);
  }

  gameLoop(delta) {
    this.state(delta);
  }

  play(delta) {
    // play state function
    this.ticker += delta;
    this.render();
    if (this.ticker >= 60) {
      this.ticker = this.ticker % 60;
    }
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
    this.game.stage.removeChild(this.sprites.map);
    const mapSprite = new PIXI.Container();
    this.sprites.map = mapSprite;
    for (let y = 0; y < this.gameMap.height; y += 1) {
      for (let x = 0; x < this.gameMap.width; x += 1) {
        const dy = y - this.player.y;
        const dx = x - this.player.x;
        let tile;
        if (this.gameMap.get(x, y) === 'g') {
          tile = new PIXI.Sprite(this.textures.grass);
        } else if (this.gameMap.get(x, y) === 'r') {
          tile = new PIXI.Sprite(this.textures.road);
        } else if (this.gameMap.get(x, y) === 'w') {
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
    this.game.stage.removeChild(this.sprites.player);
    const playerSprite = new PIXI.Sprite(this.textures.player);
    this.sprites.player = playerSprite;
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
