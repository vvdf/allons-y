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

      sprite.x = 300;
      sprite.y = 200;

      this.game.stage.addChild(sprite);
    };

    this.loader
      .add('assets/96x48_rally_police_girl.png')
      .load(setup);
  }
}

export default Engine;
