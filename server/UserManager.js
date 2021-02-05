const User = require('./User');

class UserManager {
  constructor() {
    this.userList = {};
  }

  newUser() {
    const newestUser = new User();
    this.userList[newestUser.id] = newestUser;
    return newestUser.id;
  }

  userExists(uid) {
    return {}.hasOwnProperty.call(this.userList, uid);
  }

  userHasEntity(uid) {
    return this.userExists(uid) && this.userList[uid].hasEntity();
  }

  attachEntity(uid, eid) {
    if (this.userExists(uid)) {
      this.userList[uid].attachEntity(eid);
    }
  }

  clearEntity(uid) {
    if (this.userExists(uid)) {
      this.userList[uid].removeEntity();
    }
  }
}

module.exports = UserManager;
