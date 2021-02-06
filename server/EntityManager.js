const Entity = require('./Entity');

class EntityManager {
  constructor() {
    this.entityList = {};
  }

  addEntity(name) {
    const newEntity = new Entity(name);
    this.entityList[newEntity.eid] = newEntity;
    return newEntity.eid;
  }

  removeEntity(eid) {
    delete this.entityList[eid];
  }

  getMapId(eid) {
    return this.entityList[eid].getMapId();
  }

  setMap(eid, mid) {
    this.entityList[eid].setMap(mid);
  }

  hasMap(eid) {
    return this.entityList[eid].hasMap();
  }

  setTexture(eid, textureKey) {
    this.entityList[eid].setTexture(textureKey);
  }

  getEntity(eid) {
    return this.entityList[eid];
  }
}

/*
  goals of the entity manager:
    handle all entity : entity interactions
      eg: a signal gets sent which is ENTITY_A does x skill on ENTITY_B
        -> perform calculation for x skill as long as the following conditions
          are met:
            E_A && E_B same map
            E_A has x skill
            E_A's x skill can target ENTITY_B (or it's location on the ground)
            E_A's x skill isn't on cd

  how does it handle and manage entities?
    eg: what if a ground cell is targetted instead of an entity?
      - find entities on map, run through entities to see if any are within range of
        target.
      - potential issue: too many entities on a map (will ultimately depend on how
        big of a map we plan to make)
*/

module.exports = EntityManager;
