const GameMap = require('./GameMap'); // TODO: refactor this and entity out into manager modules
const Entity = require('./Entity');
const UserManager = require('./UserManager');
const GuildManager = require('./GuildManager');
const EntityManager = require('./EntityManager');
const MapManager = require('./MapManager');
const { generateID, generateName, rng } = require('./utility');

// guild system manager/director
class Engine {
  constructor() {
    this.userManager = new UserManager();
    this.guildManager = new GuildManager();
    this.entityManager = new EntityManager();
    this.mapManager = new MapManager();
  }

  // -- USER MANAGER METHODS
  newUser() {
    return this.userManager.newUser();
  }

  addUser(uid) {
    this.userManager.addUser(uid);
  }

  userExists(uid) {
    return this.userManager.userExists(uid);
  }

  userHasEntity(uid) {
    return this.userManager.userHasEntity(uid);
  }

  userOwnsEntity(uid, eid) {
    return this.userManager.getEntityId(uid) === eid;
  }

  setEntityId(uid, eid) {
    this.userManager.setEntityId(uid, eid);
  }

  setGuildId(uid, gid) {
    this.userManager.setGuildId(uid, gid);
  }

  // -- GUILD MANAGER METHODS
  newGuild(location) {
    return this.guildManager.addGuild(location); // TODO: update with player submitted name creation rather than gen'd
  }

  getGuild(location) {
    return this.guildManager.getGuild(location);
  }

  guildExists(location) {
    return this.guildManager.guildExists(location);
  }

  // -- ENTITY MANAGEMENT METHODS
  newEntity(name) {
    return this.entityManager.addEntity(name)
  }

  getEntity(eid) {
    return this.entityManager.getEntity(eid);
  }

  getEntityId(uid) {
    return this.userManager.getEntityId(uid);
  }

  getEntityByUid(uid) {
    const eid = this.userManager.getEntityId(uid);
    return this.entityManager.getEntity(eid);
  }

  hasMap(eid) {
    return this.entityManager.hasMap(eid);
  }

  setTexture(eid, textureKey) {
    this.entityManager.setTexture(eid, textureKey);
  }

  // -- MAP MANAGEMENT METHODS
  newMap(eid) {
    // gen map, attach entityId to map, attach mapId to entity, populate map, return mapId
    const mapId = this.mapManager.newMap();
    this.addEntityToMap(mapId, eid); // add player who instantiated the map to the map
    // populate map
    const textureList = ['bun', 'demoness', 'spider', 'dweller', 'rand'];
    for (let i = 0; i < 20; i += 1) {
      const textureKey = textureList[rng(0, textureList.length - 1)];
      const npcEid = this.newEntity(generateName());
      this.setTexture(npcEid, textureKey);
      this.addEntityToMap(mapId, npcEid);
    }
    return mapId;
  }

  addEntityToMap(mid, eid) {
    this.mapManager.addEntity(mid, eid);
    this.entityManager.setMap(eid, mid);
  }

  getMapId(eid) {
    return this.entityManager.getMapId(eid);
  }

  getMapObj(mid) {
    // retrieve mapObject, attach player spawn coordinates, return
    return this.mapManager.getMapObj(mid);
  }

  getEntityPos(eid) {
    const mapId = this.entityManager.getMapId(eid);
    return this.mapManager.getEntityPos(mapId, eid);
  }

  getEntities(mid) {
    // entity obj need to have data shape of eid, name, textureKey, pos
    const entityPosList = this.mapManager.getEntities(mid);
    const formattedEntityList = [];
    for (let eid in entityPosList) {
      const entityObj = this.getEntity(eid); // retrieve entity object
      entityObj.pos = entityPosList[eid]; // append position property to entity
      formattedEntityList.push(entityObj);
    }
    return formattedEntityList;
  }

  getEntitiesByUid(uid) {
    const eid = this.getEntityId(uid);
    const mid = this.getMapId(eid);
    return this.getEntities(mid);
  }

  moveEntity(eid, targetX, targetY) {
    const mapId = this.entityManager.getMapId(eid);
    return this.mapManager.moveEntity(mapId, eid, targetX, targetY);
  }

  // -- SOCKET MANAGEMENT METHODS
  setSocketId(uid, sid) {
    this.userManager.setSocketId(uid, sid);
  }

  getSocketId(uid) {
    return this.userManager.getSocketId(uid);
  }

  ////// refactor below to be handled by individual manager modules

  // newMember(name) {
  //   const nextMember = new Entity(name);
  //   this.members[nextMember.eid] = nextMember;
  //   return nextMember;
  // }

  // removeMember(eid) {
  //   delete this.members[eid];
  // }

  // newMap(eid) {
  //   const mapId = `MID${generateID()}`;
  //   this.maps[mapId] = new GameMap(mapId);
  //   this.maps[mapId].addEntity(this.members[eid]);
  //   // spawn entities on map
  //   for (let i = 0; i < 10; i += 1) {
  //     // TODO - 10 is a placeholder enemy count value, replace
  //     const NPC = new Entity(generateName(), 'npc');
  //     this.maps[mapId].addEntity(NPC);
  //   }
  // }

  // processVision(eid) {
  //   // check area around ref'd entity for NPCs in view
  //   // TODO - implement vision, for now just using map wide actions
  // }

  // processNPCTurns(eid) {
  //   // check map of ref'd entity for NPCs (ie entities with no AI)
  //   // test if their turns should be processed, then process accordingly
  // }

  // closeMap() {
    
  // }

  // getMap(eid) {
  //   // get ref to actual map object without parsing for passing to client
  //   return this.maps[this.members[eid].getMap()];
  // }

  // getMapEntities(eid) {
  //   return this.getMap(eid).getEntities();
  // }

  // getMapObj(eid) {
  //   // takes eid and returns the map they're on
  //   console.log( this.members[eid].getPos());
  //   const mapObj = this.maps[this.members[eid].getMap()].getMapObj();
  //   mapObj.spawn = this.members[eid].getPos();
  //   return mapObj;
  // }

  // getMember(eid) {
  //   return this.members[eid];
  // }
}

module.exports = Engine;
