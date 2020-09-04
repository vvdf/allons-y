import React from 'react';
import * as PIXI from 'pixi.js';

class Game extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  componentDidMount() {
    const app = new PIXI.Application({
      backgroundColor: 0x20205f,
      width: 250 * 2,
      height: 150 * 2,
    });

    this.app = app;
    this.gameContainer.appendChild(app.view);
  }

  render() {
    return (
      <div>
        <div ref={(el) => { this.gameContainer = el; }} />
      </div>
    );
  }
}

export default Game;
