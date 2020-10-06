import * as PIXI from 'pixi.js';
import * as Anim from './Animations';
console.log(Anim);

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
    this.tickerIdMap = [];
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
            res();
          } else {
            console.log('ERRORS LOADING RESOURCES:', errorsCounted, ' ERRORS');
            rej();
          }
        });
    });
  }

  addToTicker(callback) {
    this.game.ticker.add(callback);
  }

  removeFromTicker(callback) {
    this.game.ticker.remove(callback);
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

  renderClearUI() {
    if (this.sprites.ui) {
      this.game.stage.removeChild(this.sprites.ui);
      this.sprites.ui.destroy();
    }
  }

  renderClearBG() {
    if (this.sprites.bg) {
      this.sprites.bg.destroy({ children: true });
    }
  }

  renderClearScreen() {
    this.renderClearBG();
    this.renderClear();
    this.renderClearUI();
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

  renderMainUI() {
    // main menu screen, NEW OFFICER creation option -> officer creation + locale selection screen
    this.renderClearScreen();
    this.sprites.title = new PIXI.Container();
    this.sprites.ui = new PIXI.Container();
    this.sprites.bg = new PIXI.Container();

    // render backdrop
    const background = PIXI.Sprite.from(PIXI.Texture.WHITE);
    background.width = this.settings.width;
    background.height = this.settings.height;
    background.tint = 0x1d0047;
    this.sprites.bg.addChild(background);

    const colors = [0x000447, 0x000930];
    const rand = (min, max, avoidVal) => {
      const result = Math.floor((Math.random() * (max - min)) + min);
      return !avoidVal || Math.abs(avoidVal - result) > 20
        ? result
        : Math.floor((Math.random() * (max - min)) + min);
    };

    for (let colorIdx = 0; colorIdx < colors.length; colorIdx += 1) {
      const minHeight = this.settings.height * (0.4 - colorIdx * 0.2);
      const maxHeight = this.settings.height * (0.8 - colorIdx * 0.3);
      const minWidth = 40;
      const maxWidth = 90;
      let lastWidth = 0;
      let lastHeight = 0;

      for (let i = 0; i < this.settings.width; i += lastWidth) {
        const building = PIXI.Sprite.from(PIXI.Texture.WHITE);
        building.width = rand(minWidth, maxWidth);
        building.height = rand(minHeight, maxHeight, lastHeight) - i / 8;
        building.tint = colors[colorIdx];
        building.x = i;
        building.y = this.settings.height - building.height;
        lastWidth = building.width;
        lastHeight = building.height;
        this.sprites.bg.addChild(building);
      }
    }

    const title = new PIXI.Text('[ paranormal divide ]', {
      fontFamily: 'sans-serif', fontSize: 36, fill: 0xe0e0e5, align: 'center',
    });

    title.x = this.settings.width / 2 - title.width / 2;
    title.y = 25;

    const startGame = new PIXI.Text('[ new officer ]', {
      fontFamily: 'sans-serif', fontSize: 18, fill: 0xe07900, align: 'center',
    });

    startGame.x = this.settings.width / 2 - startGame.width / 2;
    startGame.y = this.settings.height - 75;

    this.sprites.title.addChild(title);
    this.sprites.ui.addChild(startGame);

    this.sprites.bg.alpha = 0;
    this.sprites.ui.alpha = 0;

    this.animate(['bg'], 'fadeIn')
      .then(() => this.animate(['ui', 'title'], 'fadeIn', 50));
  }

  renderBaseUI() {
    // clear screen first
    // base management/mission dispatch/loadout management etc UI
    this.renderClear();
  }

  renderFieldUI() {
    // field aka combat UI with equipment, actions, health, turns, etc
  }

  animate(spriteKeyArr, animFuncKey, delay = 200) {
    const animPromises = [];
    for (let i = 0; i < spriteKeyArr.length; i += 1) {
      animPromises.push(new Promise((resolve) => {
        this.game.stage.addChild(this.sprites[spriteKeyArr[i]]);
        const animTick = (delta) => {
          Anim[animFuncKey](delta, this.sprites[spriteKeyArr[i]], delay, () => {
            this.removeFromTicker(animTick);
            resolve();
          });
        };
        this.addToTicker(animTick);
      }));
    }
    return Promise.all(animPromises);
  }
}

export default Renderer;
