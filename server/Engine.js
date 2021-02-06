const GameMap = require('./GameMap'); // TODO: refactor this and entity out into manager modules
const Entity = require('./Entity');
const UserManager = require('./UserManager');
const GuildManager = require('./GuildManager');
const EntityManager = require('./EntityManager');
const MapManager = require('./MapManager');
const { generateID, generateName } = require('./utility');

// guild system manager/director
class Engine {
  constructor() {
    // this.name = `${location} ${generateName()}`;
    // this.location = location;
    // this.seed = ''; // generate on guild creation to allow consistency of procgen
    // this.members = {}; // eid : entity
    // this.maps = {}; // list of open maps from the guild's players
    // TODO - add progression info, stuff like guild level/rank/research tree/etc

    // console.log(this.name, ' GUILD CREATED');

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

  getEntityId(uid) {
    return this.userManager.getEntityId(uid);
  }

  getEntityByUid(uid) {
    const eid = this.userManager.getEntityId(uid);
    return this.entityManager.getEntityForClient(eid);
  }

  hasMap(eid) {
    return this.entityManager.hasMap(eid);
  }

  // -- MAP MANAGEMENT METHODS
  newMap(eid) {
    // gen map, attach entityId to map, attach mapId to entity, return mapId
    const mapId = this.mapManager.newMap();
    this.mapManager.addEntity(mapId, eid);
    this.entityManager.setMap(eid, mapId);
    return mapId;
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
