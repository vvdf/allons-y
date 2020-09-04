import React from 'react';
import Engine from './Engine';

class Game extends React.Component {
  componentDidMount() {
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
