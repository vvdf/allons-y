const { generateID, clamp } = require('./utility');

class Entity {
  constructor(name, textureKey = 'player') {
    this.eid = generateID();
    this.name = name;
    this.hp = 5;
    this.textureKey = textureKey;
    this.visible = textureKey !== 'blank'; // default to hidden if texture blank
    this.pos = { x: 0, y: 0, mapId: '' };
    this.inCombat = false;
  }

  setOwner(clientID) {
    this.cid = clientID;
  }

  setCombat(status) {
    this.inCombat = status; // set combat status to true or false
  }

  setPos(x, y, mapId = '') {
    this.pos.x = x;
    this.pos.y = y;
    if (mapId.length > 0) {
      this.pos.mapId = mapId;
    }
  }

  setAi(aiObj) {
    this.ai = aiObj;
  }

  getPos() {
    return this.pos;
  }

  getMap() {
    return this.pos.mapId;
  }

  hasPos() {
    return !!this.pos;
  }

  hasMap() {
    return this.pos.mapId.length > 0;
  }

  hasAi() {
    return !!this.ai;
  }

  clearPos() {
    this.pos = {};
  }

  move(dx, dy, xMax = 100, yMax = 100) {
    this.pos.x = clamp(this.pos.x + dx, 0, xMax);
    this.pos.y = clamp(this.pos.y + dy, 0, yMax);
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}

module.exports = Entity;
