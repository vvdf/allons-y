import React from 'react';
import Engine from './Engine';

class Game extends React.Component {
  componentDidMount() {
    // instantiate game engine once the container div is mounted
    const app = new Engine(this.gameContainer);
    this.app = app;
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
