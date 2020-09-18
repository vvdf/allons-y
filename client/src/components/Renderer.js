import * as PIXI from 'pixi.js';

class Renderer {
  constructor(settings, constants, entities, gameMap) {
    this.settings = settings;
    this.constants = constants;
    this.game = new PIXI.Application(this.settings);
    this.entities = entities;
    this.entitySpriteMap = {};
    this.lastCameraPos = { x: 0, y: 0 };
    this.gameMap = gameMap;
    this.sprites = {};
    this.textures = {};
    this.loader = PIXI.Loader.shared;
  }

  setup() {
    let errorsCounted = 0;
    this.loader.onError.add(() => { errorsCounted += 1; });
    return new Promise((res, rej) => {
      // load assets into renderer and then run renderer setup using loaded assets
      this.loader
        .add('assets/96x48_rally_police_girl.png')
        .add('assets/643212_floor_tiles.json')
        .load(() => {
          this.textures.player = this.loader.resources['assets/96x48_rally_police_girl.png'].texture;
          this.textures.blank = PIXI.utils.TextureCache['blank.png'];
          this.textures.grass = PIXI.utils.TextureCache['grass.png'];
          this.textures.road = PIXI.utils.TextureCache['road.png'];
          this.textures.dirt = PIXI.utils.TextureCache['dirt.png'];
          this.textures.water1 = [
            PIXI.utils.TextureCache['water_01.png'],
            PIXI.utils.TextureCache['water_02.png'],
            PIXI.utils.TextureCache['water_03.png'],
          ];
          this.textures.water2 = [
            PIXI.utils.TextureCache['water_02.png'],
            PIXI.utils.TextureCache['water_01.png'],
            PIXI.utils.TextureCache['water_03.png'],
          ];
          this.textures.water3 = [
            PIXI.utils.TextureCache['water_03.png'],
            PIXI.utils.TextureCache['water_01.png'],
            PIXI.utils.TextureCache['water_02.png'],
          ];

          this.sprites.blank = new PIXI.Sprite(this.textures.blank);

          if (errorsCounted < 1) {
            console.log('ERROR LOADING RESOURCES', errorsCounted);
            res();
          } else {
            rej();
          }
        });
    });
  }

  addToTicker(gameLoopCallback) {
    this.game.ticker.add(gameLoopCallback);
  }

  updateEntitySprite(id, textureKey) {
    this.entitySpriteMap[id] = new PIXI.Sprite(this.textures[textureKey]);
  }

  getView() {
    return this.game.view;
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
    // clear and re-render everything from scratch
    this.updateCameraPos();
    this.renderClear();
    this.renderMap();
    this.renderEntities();
  }

  update() {
    // if no major state changes (ie death)/new entities
    // just shift sprites around instead
    const cameraDx = this.lastCameraPos.x - this.entities[0].x;
    const cameraDy = this.lastCameraPos.y - this.entities[0].y;
    this.updateCameraPos();
    this.updateMapPos(cameraDx, cameraDy);
    this.renderEntities();
  }

  updateCameraPos() {
    this.lastCameraPos = {
      x: this.entities[0].x,
      y: this.entities[0].y,
    };
  }

  updateMapPos(dx, dy) {
    this.sprites.map.x += (this.constants.tileWidth * dx) - (this.constants.tileWidth * dy);
    this.sprites.map.y += (this.constants.tileHeight * dx) + (this.constants.tileHeight * dy);
  }

  renderClear() {
    if (this.sprites.map) {
      // clear map sprites, incl children of map container
      this.game.stage.removeChild(this.sprites.map);
      this.sprites.map.destroy({ children: true });
    }

    if (this.sprites.entities) {
      // clear entity sprites
      this.game.stage.removeChild(this.sprites.entities);
      this.sprites.entities.destroy();
    }
  }

  renderMap() {
    this.sprites.map = new PIXI.Container();
    let waterStep = 0;
    for (let y = 0; y < this.gameMap.height; y += 1) {
      for (let x = 0; x < this.gameMap.width; x += 1) {
        const dx = x - this.entities[0].x;
        const dy = y - this.entities[0].y;
        let tile;
        if (this.gameMap.get(x, y) === 'g') {
          tile = new PIXI.Sprite(this.textures.grass);
        } else if (this.gameMap.get(x, y) === 'r') {
          tile = new PIXI.Sprite(this.textures.road);
        } else if (this.gameMap.get(x, y) === 'd') {
          tile = new PIXI.Sprite(this.textures.dirt);
        } else if (this.gameMap.get(x, y) === 'w') {
          if (waterStep === 0) {
            tile = new PIXI.AnimatedSprite(this.textures.water1);
          } else if (waterStep === 1) {
            tile = new PIXI.AnimatedSprite(this.textures.water2);
          } else {
            tile = new PIXI.AnimatedSprite(this.textures.water3);
          }
          waterStep = (waterStep + 3) % 7;
          tile.animationSpeed = 0.05;
          tile.play();
        }

        tile.x = this.gridToViewX(tile, dx, dy);
        tile.y = this.gridToViewY(tile, dx, dy);

        this.sprites.map.addChild(tile);
      }
    }

    this.game.stage.addChild(this.sprites.map);
  }

  renderEntities() {
    this.sprites.entities = new PIXI.Container();
    for (let i = 1; i < this.entities.length; i += 1) {
      // start at 1, as camera is 0 and is always blank
      const sprite = this.entitySpriteMap[this.entities[i].id];
      const dx = this.entities[i].x - this.entities[0].x;
      const dy = this.entities[i].y - this.entities[0].y;
      sprite.x = this.gridToViewX(sprite, dx, dy);
      sprite.y = this.gridToViewY(sprite, dx, dy, true);

      this.sprites.entities.addChild(sprite);
    }

    this.game.stage.addChild(this.sprites.entities);
  }
}

export default Renderer;
