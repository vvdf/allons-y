const { generateID, generateName } = require('./utility');

class Guild {
  constructor(location) {
    this.id = `GID${generateID()}`;
    this.name = `${location} ${generateName()}`;
    this.location = location;
    this.seed = ''; // generate on guild creation to allow consistency of procgen
  }
}

module.exports = Guild;