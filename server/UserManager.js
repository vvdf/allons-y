const User = require('./User');

class UserManager {
  constructor() {
    this.userList = {};
  }

  newUser() {
    const newestUser = new User();
    this.userList[newestUser.uid] = newestUser;
    return newestUser.uid;
  }

  userExists(uid) {
    return {}.hasOwnProperty.call(this.userList, uid);
  }

  userHasEntity(uid) {
    return this.userExists(uid) && this.userList[uid].hasEntity();
  }

  getEntityId(uid) {
    return this.userList[uid].eid;
  }

  setGuildId(uid, gid) {
    if (this.userExists(uid)) {
      this.userList[uid].setGuildId(gid);
    }
  }

  setEntityId(uid, eid) {
    if (this.userExists(uid)) {
      this.userList[uid].setEntityId(eid);
    }
  }

  clearEntity(uid) {
    if (this.userExists(uid)) {
      this.userList[uid].removeEntity();
    }
  }

  setSocketId(uid, sid) {
    this.userList[uid].setSocketId(sid);
  }

  getSocketId(uid) {
    return this.userList[uid].sid;
  }
}

module.exports = UserManager;
