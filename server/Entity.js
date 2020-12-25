const { generateID, clamp } = require('./utility');

class Entity {
  constructor(name, textureKey = 'player') {
    this.eid = generateID();
    this.name = name;
    this.textureKey = textureKey;
    this.visible = textureKey !== 'blank'; // default to hidden if texture blank
    this.pos = { x: 0, y: 0, mapId: '' };
  }
  
  setOwner(clientID) {
    this.cid = clientID;
  }

  setPos(x, y, mapId = '') {
    this.pos.x = x;
    this.pos.y = y;
    if (mapId.length > 0) {
      this.pos.mapId = mapId;
    }
  }

  getMap() {
    return this.pos.mapId;
  }

  hasMap() {
    return this.pos.mapId.length > 0;
  }

  move(dx, dy, xMax = 100, yMax = 100) {
    this.pos.x = clamp(this.pos.x + dx, 0, xMax);
    this.pos.y = clamp(this.pos.y + dy, 0, yMax);
  }

  hasPos() {
    return !!this.pos;
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

module.exports = Entity;
