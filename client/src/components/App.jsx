import React from 'react';
import Game from './Game';

class App extends React.Component {
  componentDidMount() {
  }

  render() {
    return (
      <div className="main">
        ALLONS-Y, ALONSO!
        <Game />
      </div>
    );
  }
}

export default App;
