const GameMap = require('./GameMap'); // TODO: refactor this and entity out into manager modules
const Entity = require('./Entity');
const UserManager = require('./UserManager');
const GuildManager = require('./GuildManager');
const EntityManager = require('./EntityManager');
const MapManager = require('./MapManager');
const { generateID, generateName } = require('./utility');

// guild system manager/director
class Engine {
  constructor(location) {
    this.name = `${location} ${generateName()}`;
    this.location = location;
    this.seed = ''; // generate on guild creation to allow consistency of procgen
    this.members = {}; // eid : entity
    this.maps = {}; // list of open maps from the guild's players
    // TODO - add progression info, stuff like guild level/rank/research tree/etc

    console.log(this.name, ' GUILD CREATED');

    this.UserManager = new UserManager();
    this.GuildManager = new GuildManager();
    this.EntityManager = new EntityManager();
    this.MapManager = new MapManager();
  }

  newUser() {
    return this.UserManager.newUser();
  }

  addUser(uid) {
    this.UserManager.addUser(uid);
  }

  userExists(uid) {
    return this.UserManager.userExists(uid);
  }

  userHasEntity(uid) {
    return this.UserManager.userHasEntity(uid);
  }

  newGuild(location) {
    this.GuildManager.addGuild(location); // TODO: update with player submitted name creation rather than gen'd
  }

  guildExists(location) {
    return this.GuildManager.guildExists(location);
  }

  newEntity(name) {
    this.EntityManager.addEntity(name)
  }


  userExists

  ////// refactor below to be handled by individual manager modules

  newMember(name) {
    const nextMember = new Entity(name);
    this.members[nextMember.eid] = nextMember;
    return nextMember;
  }

  removeMember(eid) {
    delete this.members[eid];
  }

  newMap(eid) {
    const mapId = `MID${generateID()}`;
    this.maps[mapId] = new GameMap(mapId);
    this.maps[mapId].addEntity(this.members[eid]);
    // spawn entities on map
    for (let i = 0; i < 10; i += 1) {
      // TODO - 10 is a placeholder enemy count value, replace
      const NPC = new Entity(generateName(), 'npc');
      this.maps[mapId].addEntity(NPC);
    }
  }

  processVision(eid) {
    // check area around ref'd entity for NPCs in view
    // TODO - implement vision, for now just using map wide actions
  }

  processNPCTurns(eid) {
    // check map of ref'd entity for NPCs (ie entities with no AI)
    // test if their turns should be processed, then process accordingly
  }

  closeMap() {
    
  }

  getMap(eid) {
    // get ref to actual map object without parsing for passing to client
    return this.maps[this.members[eid].getMap()];
  }

  getMapEntities(eid) {
    return this.getMap(eid).getEntities();
  }

  getMapObj(eid) {
    // takes eid and returns the map they're on
    console.log( this.members[eid].getPos());
    const mapObj = this.maps[this.members[eid].getMap()].getMapObj();
    mapObj.spawn = this.members[eid].getPos();
    return mapObj;
  }

  getMember(eid) {
    return this.members[eid];
  }
}

module.exports = Engine;
