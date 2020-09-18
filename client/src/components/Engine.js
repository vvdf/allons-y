import * as PIXI from 'pixi.js';
import GameMap from './GameMap';
import Entity from './Entity';
import Input from './Input';
import EventQueue from './EventQueue';

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
    this.eventQueue = new EventQueue();
    this.textures = {};
    this.sprites = {};
    this.entities = [];
    this.entityNextId = 0;
    this.entityIdMap = {};
    this.view = { x: 0, y: 0 };
    this.gameMap = new GameMap(20, 20, 'g');
    this.gameMap.load();
    this.input = new Input(this.eventQueue);
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

      this.createEntity('Apron', this.textures.player, 0, 0, this.gameMap);
      this.render();
      this.game.ticker.add((delta) => this.gameLoop(delta));
    };

    // load assets into renderer and then run renderer setup using loaded assets
    this.loader
      .add('assets/96x48_rally_police_girl.png')
      .add('assets/643212_floor_tiles.json')
      .load(setup);

    // define events for EventQueue/Reducer
    this.eventQueue.defineEvent('MOVE_ENTITY',
      (entityId, dx = 0, dy = 0) => {
        this.entityIdMap[entityId].move(dx, dy);
      });

    this.eventQueue.defineEvent('PAINT_MAP',
      (entityId, tile) => {
        this.gameMap.set(this.entityIdMap[entityId].x, this.entityIdMap[entityId].y, tile);
      });
  }

  gameLoop(delta) {
    this.state(delta);
  }

  play(delta) {
    // play state function
    // TODO - proper event/signal queue handling
    if (this.eventQueue.length > 0) {
      this.eventQueue.next(delta);
      if (this.entities[0].x !== this.view.x || this.entities[0].y !== this.view.y) {
        this.view.x = this.entities[0].x;
        this.view.y = this.entities[0].y;
      }
      if (this.eventQueue.length < 1) {
        this.render();
      }
    }
  }

  createEntity(name, texture, x, y, map) {
    const id = this.entityNextId;
    this.entityNextId += 1;
    const createdEntity = new Entity(name, texture, x, y, map, id);
    if (id < 1) {
      // establishing player as id 0
      this.input.setOwner(createdEntity);
    }
    this.entities.push(createdEntity);
    this.entityIdMap[id] = createdEntity;
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
    this.renderClear();
    this.renderMap();
    this.renderEntities();
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
        const dx = x - this.view.x;
        const dy = y - this.view.y;
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
    for (let i = 0; i < this.entities.length; i += 1) {
      const dx = this.entities[i].x - this.view.x;
      const dy = this.entities[i].y - this.view.y;
      this.entities[i].sprite.x = this.gridToViewX(this.entities[i].sprite, dx, dy);
      this.entities[i].sprite.y = this.gridToViewY(this.entities[i].sprite, dx, dy, true);

      this.sprites.entities.addChild(this.entities[i].sprite);
    }

    this.game.stage.addChild(this.sprites.entities);
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
