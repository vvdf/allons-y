const { clamp } = require('./utility');

class Entity {
  constructor(name, textureKey, x, y, gameMap, id = 0) {
    this.id = id;
    this.name = name;
    this.textureKey = textureKey;
    this.visible = textureKey !== 'blank'; // default to hidden if texture blank
    this.pos = {}; // TODO - refactor to use a 'pos' object as opposed to x/y, and
    // get rid of reference to gameMap objects on client/server, but rather have 'map'
    // refer to a name/key representing a reference to the specific base/guild's
    // generated map(s)
    if (!Number.isNaN(x) && !Number.isNaN(y) && gameMap) {
      this.x = x;
      this.y = y;
      this.gameMap = gameMap;
    }
  }

  init(x, y, mapName) {
    this.pos.x = x;
    this.pos.y = y;
    this.pos.map = mapName;
  }

  move(dx, dy) {
    this.x = clamp(this.x + dx, 0, this.gameMap.width - 1);
    this.y = clamp(this.y + dy, 0, this.gameMap.height - 1);
  }

  hasPos() {
    return this.pos.
  }

  setPos(x, y) {
    this.pos.x = x;
    this.pos.y = y;
    // this.x = x;
    // this.y = y;
  }

  clearPos() {
    this.pos = {};
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}

export default Entity;
