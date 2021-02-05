const Guild = require('./Guild');

class GuildManager {
  constructor() {
    this.guildList = {};
    this.guildLocationList = {};
  }

  addGuild(location) {
    const newGuild = new Guild(location);
    this.guildList[newGuild.id] = newGuild;
    if (!{}.hasOwnProperty.call(this.guildLocationList, location)) {
      // if location doesn't exist yet, then initialize it
      this.guildLocationList[location] = {};
    }
    this.guildLocationList[location] = newGuild.id;
    return newGuild.id;
  }

  getGuild(location) {
    if (this.guildExists(location)) {
      return this.guildLocationList[location].id;
    }
    return false;
  }

  removeGuild(gid) {
    delete this.guildList[gid];
  }

  guildExists(location) {
    return {}.hasOwnProperty.call(this.guildLocationList, location);
  }
}

module.exports = GuildManager;
