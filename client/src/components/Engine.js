import * as PIXI from 'pixi.js';

class Engine {
  constructor(targetEle) {
    // initialize game renderer, append as child to passed in element
    const game = new PIXI.Application({
      backgroundColor: 0xf0c5e9,
      width: 800,
      height: 500,
      resolution: 1,
    });

    this.game = game;
    this.state = this.play;
    this.loader = PIXI.Loader.shared;
    targetEle.appendChild(game.view);
    this.init();
  }

  init() {
    // initialize game Engine variables/systems/assets
    // create and populate scenes
    const setup = () => {
      const sprite = new PIXI.Sprite(
        this.loader.resources['assets/96x48_rally_police_girl.png'].texture,
      );

      sprite.x = 358;
      sprite.y = 200;

      const ground = PIXI.utils.TextureCache['grass.png'];
      const road = PIXI.utils.TextureCache['road.png'];
      const water = PIXI.utils.TextureCache['water1.png'];

      // refactor this logic into a grid->isometric converter helper methods
      const map = [
        ['g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'r', 'g', 'g', 'r', 'g', 'g', 'r', 'g', 'g', 'r', 'g'],
        ['g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'r', 'g', 'g', 'r', 'g', 'g', 'r', 'g', 'g', 'r', 'g'],
        ['r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r'],
        ['g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'r', 'g', 'g', 'r', 'g', 'g', 'r', 'g', 'g', 'r', 'g'],
        ['g', 'g', 'w', 'w', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g'],
        ['w', 'w', 'w', 'w', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g'],
        ['g', 'w', 'w', 'w', 'g', 'w', 'g', 'g', 'w', 'g', 'g', 'w', 'g', 'g', 'w', 'g', 'g', 'w', 'g'],
        ['g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'r', 'g', 'g', 'r', 'g', 'g', 'r', 'g', 'g', 'r', 'g'],
        ['g', 'g', 'w', 'w', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g'],
        ['w', 'w', 'w', 'w', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g'],
        ['g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'r', 'g', 'g', 'r', 'g', 'g', 'r', 'g', 'g', 'r', 'g'],
        ['g', 'g', 'w', 'w', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g'],
        ['w', 'w', 'w', 'w', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g'],
        ['g', 'w', 'w', 'w', 'g', 'w', 'g', 'g', 'w', 'g', 'g', 'w', 'g', 'g', 'w', 'g', 'g', 'w', 'g'],
        ['g', 'g', 'g', 'g', 'g', 'r', 'g', 'g', 'r', 'g', 'g', 'r', 'g', 'g', 'r', 'g', 'g', 'r', 'g'],
        ['g', 'g', 'w', 'w', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g'],
        ['w', 'w', 'w', 'w', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g', 'w', 'w', 'g'],
      ];

      // up right one is (+32, -16)

      const stageMap = () => {
        const startX = 350;
        const startY = 216;

        for (let i = 0; i < map.length; i++) {
          let y = startY + i * 14;
          for (let j = 0; j < map[i].length; j++) {
            let x = startX - i * 28;
            let tile;
            if (map[i][j] === 'g') {
              console.log('ground found');
              tile = new PIXI.Sprite(ground);
            } else if (map[i][j] === 'r') {
              console.log('road found');
              tile = new PIXI.Sprite(road);
            } else if (map[i][j] === 'w') {
              console.log('water found');
              tile = new PIXI.Sprite(water);
            } else {
              console.log('neither found', map[i][j]);
            }
            tile.x = x + j * 28;
            tile.y = y + j * 14;
            this.game.stage.addChild(tile);
          }
        }
      };

      stageMap();
      this.game.stage.addChild(sprite);
    };

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
