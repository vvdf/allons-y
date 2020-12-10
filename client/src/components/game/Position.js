class Position {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  equals(positionObj) {
    return this.x === positionObj.x && this.y === positionObj.y;
  }

  equalsCoord(x, y) {
    return this.x === x && this.y === y;
  }
}

export default Position;
