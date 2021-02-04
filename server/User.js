const { generateID } = require('./utility');

class User {
  constructor() {
    this.id = `UID${generateID()}`;
    this.eid = '';
    this.gid = '';
  }

  attachGuild(gid) {
    this.gid = gid;
  }

  hasEntity() {
    return this.eid.length > 0;
  }

  attachEntity(eid) {
    this.eid = eid;
  }

  removeEntity() {
    this.eid = '';
  }
}

module.exports = User;
