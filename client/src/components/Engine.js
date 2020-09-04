import * as PIXI from 'pixi.js';

class Engine {
  constructor(targetEle) {
    const game = new PIXI.Application({
      backgroundColor: 0x20205f,
      width: 800,
      height: 500,
    });

    this.game = game;
    targetEle.appendChild(game.view);
  }
}

export default Engine;
