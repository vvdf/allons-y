const GameMap = require('./GameMap');

class MapManager {
  constructor() {
    this.mapList = {};
  }

  newMap() {
    const newestMap = new GameMap();
    this.mapList[newestMap.mid] = newestMap;
    return newestMap.mid;
  }

  addEntity(mid, eid) {
    this.mapList[mid].addEntity(eid);
  }

  getEntities(mid) {
    return this.mapList[mid].getEntities();
  }

  getEntityPos(mid, eid) {
    return this.mapList[mid].getEntityPos(eid);
  }

  moveEntity(mid, eid, targetX, targetY) {
    return this.mapList[mid].moveEntity(eid, targetX, targetY);
  }
  
  getMapObj(mid) {
    return this.mapList[mid].getMapObj();
  }
}

module.exports = MapManager;
