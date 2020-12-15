import { clamp } from './Utility';

class Position {
  constructor(x, y, xMax, yMax) {
    this.init(x, y, xMax, yMax);
  }

  init(x, y, xMax, yMax) {
    this.x = x;
    this.y = y;
    this.xMax = xMax;
    this.yMax = yMax;
  }

  equals(positionObj) {
    return this.x === positionObj.x && this.y === positionObj.y;
  }

  equalsCoord(x, y) {
    return this.x === x && this.y === y;
  }

  move(dx, dy) {
    this.x = clamp(this.x + dx, 0, this.xMax);
    this.y = clamp(this.y + dy, 0, this.yMax);
  }

  moveTest(dx, dy) {
    return { x: clamp(this.x + dx, 0, this.xMax), y: clamp(this.y + dy, 0, this.yMax) };
  }

  set(x, y) {
    this.x = clamp(x, 0, this.xMax);
    this.y = clamp(y, 0, this.yMax);
  }
}

export default Position;
