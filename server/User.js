const { generateID } = require('./utility');

class User {
  constructor() {
    this.uid = `UID${generateID()}`;
    this.eid = '';
    this.gid = '';
    this.sid = '';
  }

  setGuildId(gid) {
    this.gid = gid;
  }

  setEntityId(eid) {
    this.eid = eid;
  }

  removeEntity() {
    this.eid = '';
  }

  hasEntity() {
    return this.eid.length > 0;
  }

  setSocketId(sid) {
    this.sid = sid;
  }
}

module.exports = User;
