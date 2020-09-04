import * as PIXI from 'pixi.js';

class Engine {
  constructor(targetEle) {
    // initialize game renderer, append as child to passed in element
    const game = new PIXI.Application({
      backgroundColor: 0xf0c5e9,
      width: 800,
      height: 500,
    });

    this.game = game;
    this.loader = PIXI.Loader.shared;
    targetEle.appendChild(game.view);
    this.init();
  }

  init() {
    // initialize game Engine variables/systems/assets
    const setup = () => {
      const sprite = new PIXI.Sprite(
        this.loader.resources['assets/96x48_rally_police_girl.png'].texture,
      );

      sprite.x = 355;
      sprite.y = 208;

      const ground = PIXI.utils.TextureCache['assets/64x32_floor_tiles.png'];
      ground.frame = new PIXI.Rectangle(64, 0, 64, 32);
      const road = PIXI.utils.TextureCache['assets/64x32_floor_tiles.png'];
      road.frame = new PIXI.Rectangle(64, 0, 64, 32);

      // refactor this logic into a grid->isometric converter helper methods
      const map = [
        ['g', 'g', 'g', 'g', 'g'],
        ['g', 'g', 'g', 'g', 'g'],
        ['r', 'r', 'r', 'r', 'r'],
        ['g', 'g', 'g', 'g', 'g'],
        ['g', 'g', 'g', 'g', 'g'],
      ];

      // up right one is (+32, -16)

      const stageMap = () => {
        const startX = 350;
        const startY = 216;

        for (let i = 0; i < map.length; i++) {
          let y = startY + i * 16;
          for (let j = 0; j < map[i].length; j++) {
            let x = startX - i * 32;
            let tile;
            if (map[i][j] === 'g') {
              console.log('ground found');
              tile = new PIXI.Sprite(ground);
            } else if (map[i][j] === 'r') {
              console.log('road found');
              tile = new PIXI.Sprite(road);
            } else {
              console.log('neither found', map[i][j]);
            }
            tile.x = x + j * 32;
            tile.y = y + j * 16;
            this.game.stage.addChild(tile);
          }
        }
      };

      stageMap();
      this.game.stage.addChild(sprite);
    };

    this.loader
      .add('assets/96x48_rally_police_girl.png')
      .add('assets/64x32_floor_tiles.png')
      .load(setup);
  }
}

export default Engine;
