import * as PIXI from 'pixi.js';

class Engine {
  constructor(targetEle) {
    const game = new PIXI.Application({
      backgroundColor: 0x20205f,
      width: 250 * 2,
      height: 150 * 2,
    });

    this.game = game;
    targetEle.appendChild(game.view);
  }
}

export default Engine;
