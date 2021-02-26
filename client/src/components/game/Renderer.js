import * as PIXI from 'pixi.js';
import * as Anim from './Animations';
import tiles from './Tiles';

class Renderer {
  constructor(settings, constants, entities, gameMap, ui, messageLog) {
    this.settings = settings;
    this.uiSettings = {
      margin: 12,
      fieldUIX: 12,
      fieldUIY: this.settings.height - 180,
      textFont18: { fontFamily: 'terminus', fontSize: 18, fill: 0xffffeb, align: 'left' }, // white
      textFont16: { fontFamily: 'terminus', fontSize: 16, fill: 0xffffeb, align: 'left' }, // white
    };
    this.constants = constants;
    this.game = new PIXI.Application(this.settings);
    this.render = this.mainUIRender;
    this.update = this.mainUIUpdate;
    this.entities = entities;
    this.entitySpriteMap = {};
    this.lastCameraPos = { x: 0, y: 0 };
    this.gameMap = gameMap;
    this.ui = ui;
    this.messageLog = messageLog;
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
        .add('assets/96x96_rally.png')
        .add('assets/96x96_rand.png')
        .add('assets/96x96_demoness.png')
        .add('assets/96x96_munch.png')
        .add('assets/96x96_mon_spiderGreen.png')
        .add('assets/96x96_mon_deepDweller.png')
        .add('assets/96x96_highlighted_tile01.png')
        .add('assets/96x96_highlighted_tile02.png')
        .add('assets/96x96_highlighted_tile03.png')
        .add('assets/643212_floor_tiles.json')
        .load(() => {
          this.textures.player = this.loader.resources['assets/96x96_rally.png'].texture;
          this.textures.bun = this.loader.resources['assets/96x96_munch.png'].texture;
          this.textures.demoness = this.loader.resources['assets/96x96_demoness.png'].texture;
          this.textures.spider = this.loader.resources['assets/96x96_mon_spiderGreen.png'].texture;
          this.textures.dweller = this.loader.resources['assets/96x96_mon_deepDweller.png'].texture;
          this.textures.rand = this.loader.resources['assets/96x96_rand.png'].texture;
          this.textures.highlight = [
            this.loader.resources['assets/96x96_highlighted_tile01.png'].texture,
            this.loader.resources['assets/96x96_highlighted_tile02.png'].texture,
            this.loader.resources['assets/96x96_highlighted_tile03.png'].texture,
          ];
          // this.textures.blank = PIXI.utils.TextureCache['blank.png'];
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

          this.sprites.blank = new PIXI.Sprite(this.textures.wall);

          if (errorsCounted < 1) {
            res();
          } else {
            console.log('ERRORS LOADING RESOURCES:', errorsCounted, ' ERRORS');
            console.log(this.textures);
            rej();
          }
        });
    });
  }

  // ----------------------------------
  // renderer helper methods
  // ----------------------------------
  setMode(modeStr) {
    this.render = this[`${modeStr}Render`];
    this.update = this[`${modeStr}Update`];
  }

  addToTicker(callback) {
    this.game.ticker.add(callback);
  }

  removeFromTicker(callback) {
    this.game.ticker.remove(callback);
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

  clear(...args) {
    if (args.length > 0) {
      args.forEach((renderModuleStr) => {
        if (this.sprites[renderModuleStr]) {
          this.game.stage.removeChild(this.sprites[renderModuleStr]);
          this.sprites[renderModuleStr].destroy({ children: true });
        }
      });
    } else {
      this.clear('title', 'console', 'consoleText', 'ui', 'entities', 'map', 'bg');
    }
  }

  hide(...args) {
    if (args.length > 0) {
      args.forEach((renderModuleStr) => {
        if (this.sprites[renderModuleStr]) {
          this.sprites[renderModuleStr].alpha = 0;
        }
      });
    } else {
      this.hide('title', 'console', 'consoleText', 'ui', 'entities', 'map', 'bg');
    }
  }

  updateCameraPos() {
    this.lastCameraPos = {
      x: this.entities[0].pos.x,
      y: this.entities[0].pos.y,
    };
  }

  updateMapPos(dx, dy) {
    this.sprites.map.x += (this.constants.tileWidth * dx) - (this.constants.tileWidth * dy);
    this.sprites.map.y += (this.constants.tileHeight * dx) + (this.constants.tileHeight * dy);
  }

  createSubRect(color = 0xFFFFFF, pixelMargin = 0, alpha = 1) {
    // create a simple subordinate rectangle using a passed in px margin
    // as compared to the main window
    const rect = PIXI.Sprite.from(PIXI.Texture.WHITE);
    rect.x = pixelMargin;
    rect.y = pixelMargin;
    rect.width = this.settings.width - rect.x * 2;
    rect.height = this.settings.height - rect.y * 2;
    rect.tint = color;
    rect.alpha = alpha;
    return rect;
  }

  animate(spriteKeyArr, animFuncKey, delay = 200) {
    const animPromises = [];
    for (let i = 0; i < spriteKeyArr.length; i += 1) {
      const spriteKeys = spriteKeyArr[i].split('/');
      const spriteLayer = spriteKeys.length > 1
        ? this.sprites[spriteKeys[0]][spriteKeys[1]]
        : this.sprites[spriteKeys[0]];
      animPromises.push(new Promise((resolve) => {
        this.game.stage.addChild(spriteLayer);
        const animTick = (delta) => {
          Anim[animFuncKey](delta, spriteLayer, delay, () => {
            this.removeFromTicker(animTick);
            resolve();
          });
        };
        this.addToTicker(animTick);
      }));
    }
    return Promise.all(animPromises);
  }

  // ----------------------------------
  // render/update logic for game states
  // ----------------------------------
  mainUIRender() {
    // main menu screen, NEW OFFICER creation option -> officer creation + locale selection screen
    this.clear();
    this.sprites.title = new PIXI.Container();
    this.sprites.ui = new PIXI.Container();
    this.sprites.bg = new PIXI.Container();

    // render backdrop
    // TODO - expand on the procedural city generation and interaction
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

    const startGame = new PIXI.Text(`[ ${this.ui.getCurrentOption()} ]`, {
      fontFamily: 'sans-serif', fontSize: 18, fill: 0xe07900, align: 'center',
    });

    startGame.x = this.settings.width / 2 - startGame.width / 2;
    startGame.y = this.settings.height - 75;

    this.sprites.title.addChild(title);
    this.sprites.ui.addChild(startGame);

    this.sprites.bg.alpha = 0;
    this.sprites.title.alpha = 0;
    this.sprites.ui.alpha = 0;

    this.animate(['bg'], 'fadeIn', 50)
      .then(() => this.animate(['title'], 'fadeIn', 20))
      .then(() => this.animate(['ui'], 'fadeIn', 30));
  }

  mainUIUpdate() {
  }

  baseUIRender() {
    // clear screen first
    // base management/mission dispatch/loadout management etc UI
    this.clear('ui');
    this.sprites.ui = new PIXI.Container();
    const margin = this.settings.width / 30;
    const innerMargin = 30;
    const padding = 10;
    const menuBackdrop = this.createSubRect(0x020202, margin, 0.8);
    this.sprites.ui.addChild(menuBackdrop);
    const menuOptions = this.ui.getOptionText();
    const menuSelection = this.ui.getCurrentSelection();

    for (let i = 0; i < menuOptions.length; i += 1) {
      // highlight if currently selected
      const textColor = i === menuSelection ? 0xe07900 : 0xe0e0e5;
      const menuOption = new PIXI.Text(`${menuOptions[i]}`, {
        fontFamily: 'sans-serif', fontSize: 24, fill: textColor, align: 'center',
      });
      menuOption.x = margin + innerMargin;
      menuOption.y = margin + innerMargin * (i + 1) + (padding * i);

      this.sprites.ui.addChild(menuOption);
    }

    // this.sprites.ui.addChild(menuBackdrop);
    this.game.stage.addChild(this.sprites.ui);
  }

  baseUIUpdate() {
    this.baseUIRender();
  }

  fieldUIRender() {
    // draw out some basic  rectangles and text as placeholders
    // field UI consists of, health bar, energy bar, (enemy health), item/action selection display,
    // game/chat log
    this.clear('ui');
    this.sprites.ui = new PIXI.Container();
    this.fieldUIBarsRender();
    this.fieldUIActionsBoxRender();
    this.fieldUIMessageLogRender();
    this.game.stage.addChild(this.sprites.ui);
  }

  fieldUIUpdate() {
    this.fieldUIRender();
  }

  fieldRender() {
    // clear and re-render everything from scratch
    this.updateCameraPos();
    this.clear('map', 'entities', 'bg', 'ui');
    this.bgRender();
    this.mapRender();
    this.entitiesRender();
    this.fieldUIRender();
  }

  fieldUpdate() {
    // if no major state changes (ie death)/new entities
    // just shift sprites around instead
    const cameraDx = this.lastCameraPos.x - this.entities[0].pos.x;
    const cameraDy = this.lastCameraPos.y - this.entities[0].pos.y;
    this.updateCameraPos();
    this.updateMapPos(cameraDx, cameraDy);
    this.entitiesUpdate();
    // this.fieldUIUpdate();
  }

  // ----------------------------------
  // render/update logic for game components
  // ----------------------------------
  bgRender(bgColor = 0x131225) {
    this.sprites.bg = new PIXI.Container();
    const rect = this.createSubRect(bgColor);

    this.sprites.bg.addChild(rect);
    this.game.stage.addChild(this.sprites.bg);
  }

  mapRender() {
    this.sprites.map = new PIXI.Container();
    // using frame steps to stagger water animations when rendering multiple
    // TODO refactor this to use an object dictionary for conversions rather
    // than a long if/else statement
    let waterStep = 0;
    for (let y = 0; y < this.gameMap.height; y += 1) {
      for (let x = 0; x < this.gameMap.width; x += 1) {
        const dx = x - this.entities[0].pos.x;
        const dy = y - this.entities[0].pos.y;
        let tile;
        if (this.gameMap.get(x, y) === tiles.WALL) {
          tile = new PIXI.Sprite(this.textures.wall);
        } else if (this.gameMap.get(x, y) === tiles.GRASS) {
          tile = new PIXI.Sprite(this.textures.grass);
        } else if (this.gameMap.get(x, y) === tiles.ROAD) {
          tile = new PIXI.Sprite(this.textures.road);
        } else if (this.gameMap.get(x, y) === tiles.DIRT) {
          tile = new PIXI.Sprite(this.textures.dirt);
        } else if (this.gameMap.get(x, y) === tiles.WATER) {
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

  entitiesRender() {
    this.sprites.entities = new PIXI.Container();
    this.sprites.entities.sortableChildren = true;
    const { pos: cameraPos } = this.entities[0];
    for (let i = 1; i < this.entities.length; i += 1) {
      // start at 1, as camera is 0 and is always blank
      // const sprite = this.entitySpriteMap[this.entities[i].id];
      // TODO - add validity check to assure key exists, else blank or default
      const { textureKey, pos: entityPos, tint } = this.entities[i];
      const sprite = textureKey === 'highlight'
        ? new PIXI.AnimatedSprite(this.textures[textureKey])
        : new PIXI.Sprite(this.textures[textureKey]);
      const dx = entityPos.x - cameraPos.x;
      const dy = entityPos.y - cameraPos.y;
      sprite.x = this.gridToViewX(sprite, dx, dy);
      sprite.y = this.gridToViewY(sprite, dx, dy, true);
      sprite.zIndex = textureKey === 'highlight'
        ? entityPos.x + entityPos.y - 1
        : entityPos.x + entityPos.y;
      sprite.tint = !!tint ? tint : 0xFFFFFF;
      delete this.entities[i].sprite;
      this.entities[i].sprite = sprite;

      if (textureKey === 'highlight') {
        sprite.alpha = 0.7;
        sprite.animationSpeed = 0.05;
        sprite.play();
      }
      this.sprites.entities.addChild(sprite);
    }

    this.game.stage.addChild(this.sprites.entities);
  }

  entitiesUpdate() {
    // TODO - fix to utilize entitySpriteMap rather than mutating entities by adding
    // a sprite property
    for (let i = 1; i < this.entities.length; i += 1) {
      const dx = this.entities[i].pos.x - this.entities[0].pos.x;
      const dy = this.entities[i].pos.y - this.entities[0].pos.y;
      this.entities[i].sprite.x = this.gridToViewX(this.entities[i].sprite, dx, dy);
      this.entities[i].sprite.y = this.gridToViewY(this.entities[i].sprite, dx, dy, true);
      this.entities[i].sprite.zIndex = this.entities[i].pos.x + this.entities[i].pos.y;
    }
  }

  consoleRender() {
    this.clear('console', 'consoleText');
    this.sprites.console = new PIXI.Container();
    this.sprites.consoleText = new PIXI.Container();
    const rect = this.createSubRect(0x030303, this.settings.width / 20, 0.5);

    this.sprites.console.addChild(rect);

    const textLines = this.messageLog.consoleText.split('\n');
    for (let i = 0; i < textLines.length; i += 1) {
      const textLine = new PIXI.Text(textLines[i], {
        fontFamily: 'terminus', fontSize: 20, fill: 0xa0a0a0, align: 'left',
      });

      textLine.x = rect.x + 5;
      textLine.y = rect.y + 5 + i * 18;
      this.sprites.consoleText.addChild(textLine);
    }

    this.game.stage.addChild(this.sprites.console);
    this.game.stage.addChild(this.sprites.consoleText);
    this.update = this.consoleTextUpdate;
  }

  consoleTextUpdate() {
    this.clear('consoleText');
    this.sprites.consoleText = new PIXI.Container();

    const textLines = this.messageLog.consoleText.split('\n');
    const startLine = textLines.length >= 24 ? textLines.length - 24 : 0;
    for (let i = startLine; i < textLines.length; i += 1) {
      const text = `${textLines[i]}${i === textLines.length - 1 ? this.messageLog.consoleInput : ''}`;
      const textRender = new PIXI.Text(text, {
        fontFamily: 'terminus', fontSize: 20, fill: 0xa0a0a0, align: 'left',
      });

      textRender.x = this.sprites.console.getChildAt(0).x + 5;
      textRender.y = this.sprites.console.getChildAt(0).y + 5 + (i - startLine) * 18;
      this.sprites.consoleText.addChild(textRender);
    }

    this.game.stage.addChild(this.sprites.consoleText);
  }

  fieldUIBarsRender() {
    const { margin, fieldUIX, fieldUIY } = this.uiSettings;
    // health bar(s)
    const hpBarRect = PIXI.Sprite.from(PIXI.Texture.WHITE);
    hpBarRect.x = fieldUIX;
    hpBarRect.y = fieldUIY;
    hpBarRect.width = 150;
    hpBarRect.height = 20;
    hpBarRect.tint = 0xeb564b; // salmon-red
    hpBarRect.alpha = 0.8;

    // energy bar
    const energyBarRect = PIXI.Sprite.from(PIXI.Texture.WHITE);
    energyBarRect.x = fieldUIX;
    energyBarRect.y = fieldUIY + hpBarRect.height + margin;
    energyBarRect.width = 150;
    energyBarRect.height = 20;
    energyBarRect.tint = 0x4b5bab; // lightly muted blue
    energyBarRect.alpha = 0.8;

    // add hpbar, energybar to ui render group
    this.sprites.ui.addChild(hpBarRect);
    this.sprites.ui.addChild(energyBarRect);
  }

  fieldUIActionsBoxRender() {
    const { margin, fieldUIX, fieldUIY, textFont18, textFont16, textColor } = this.uiSettings;
    // items/actions
    const actionRect = PIXI.Sprite.from(PIXI.Texture.WHITE);
    actionRect.x = fieldUIX;
    actionRect.y = fieldUIY + 65;
    actionRect.width = 200;
    actionRect.height = 90;
    actionRect.tint = 0x43434f; // dark gray
    actionRect.alpha = 0.6;
    const actionList = [];

    actionList.push(new PIXI.Text(' ACTIONS:', textFont18));
    actionList.push(new PIXI.Text('  1: MK22  < 100 / 100 >', textFont16));
    actionList.push(new PIXI.Text('  2: AR-15 <  30 / 120 >', textFont16));
    actionList.push(new PIXI.Text('  3: FLASH <   1       >', textFont16));
    actionList.push(new PIXI.Text('  4: PFIRE < 100%      >', textFont16));

    for (let i = 0; i < actionList.length; i += 1) {
      actionList[i].x = fieldUIX;
      actionList[i].y = fieldUIY + margin + 40 + (i + 1) * (margin + 5);
    }

    this.sprites.ui.addChild(actionRect);
    actionList.forEach((actionText) => this.sprites.ui.addChild(actionText));
  }

  fieldUIMessageLogRender() {
    const { margin, fieldUIX, fieldUIY, textFont18, textFont16, textColor } = this.uiSettings;
    // logs
    // TODO probably build out log and log text functionality to being its own
    // function
    const logRect = PIXI.Sprite.from(PIXI.Texture.WHITE);
    logRect.x = fieldUIX + 200 + margin;
    logRect.y = fieldUIY;
    logRect.width = this.settings.width - logRect.x - margin;
    logRect.height = this.settings.height - logRect.y - margin;
    logRect.tint = 0x43434f; // dark gray
    logRect.alpha = 0.6;

    // log text
    const logList = [];
    logList.push(new PIXI.Text('You discovered some grass.', textFont18));
    logList.push(new PIXI.Text('You\'ve been shot for 5 damage.', textFont18));
    logList.push(new PIXI.Text('Sounds of something large are heard nearby.', textFont18));
    logList.push(new PIXI.Text('You sense danger.', textFont18));
    logList.push(new PIXI.Text('"Help me!" you hear in the distance.', textFont18));
    logList.push(new PIXI.Text('You reload your MK22.', textFont18));
    logList.push(new PIXI.Text('You waited.', textFont18));
    logList.push(new PIXI.Text('You waited.', textFont18));
    for (let i = 0; i < logList.length; i += 1) {
      logList[i].x = logRect.x + margin;
      logList[i].y = logRect.y + (i + 1) * (margin + 2);
    }
  
    this.sprites.ui.addChild(logRect);
    logList.forEach((logText) => this.sprites.ui.addChild(logText));
  }
}

export default Renderer;
