const { generateID } = require('./utility');

class Entity {
  constructor(name, userID = '', guildID = '', textureKey = 'player') {
    // rebuild entity, move should be in engine/map, eid should generated an EID, etc
    this.eid = `EID${generateID()}`;
    this.uid = userID;
    this.gid = guildID;
    this.mid = '';
    this.name = name;
    this.hp = 5;
    this.textureKey = textureKey;
    this.visible = textureKey !== 'blank'; // default to hidden if texture blank
  }

  setUser(userId) {
    this.uid = userId;
  }

  setGuild(guildId) {
    this.gid = guildId;
  }

  setMap(mapId) {
    this.mid = mapId;
  }

  setTexture(textureKey) {
    this.textureKey = textureKey;
  }

  getMapId() {
    return this.mid;
  }

  setAi(aiObj) {
    this.ai = aiObj;
  }

  hasMap() {
    return this.mid.length > 0;
  }

  hasAi() {
    return !!this.ai;
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
}

module.exports = Entity;
