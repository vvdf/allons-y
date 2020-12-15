import Position from './Position';

class Entity {
  constructor(name, textureKey, x, y, gameMap, id) {
    this.id = id;
    this.name = name;
    this.textureKey = textureKey;
    this.visible = textureKey !== 'blank'; // default to hidden if texture blank
    this.pos = new Position(
      x,
      y,
      gameMap ? gameMap.width - 1 : 100,
      gameMap ? gameMap.height - 1 : 100,
    );
  }

  move(dx, dy) {
    this.pos.move(dx, dy);
  }

  nextPos(dx, dy) {
    return this.pos.moveTest(dx, dy);
  }

  setPos(x, y) {
    this.pos.set(x, y);
  }

  newMap(x, y, gameMap) {
    this.pos.init(x, y, gameMap ? gameMap.width - 1 : 100, gameMap ? gameMap.height - 1 : 100);
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}

export default Entity;
