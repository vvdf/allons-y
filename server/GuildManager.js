const Guild = require('./Guild');

class GuildManager {
  constructor() {
    this.guildList = {};
  }

  addGuild(location) {
    const newGuild = new Guild(location);
    this.guildList[newGuild.id] = newGuild;
  }

  removeGuild(gid) {
    delete this.guildList[gid];
  }
}

module.exports = GuildManager;