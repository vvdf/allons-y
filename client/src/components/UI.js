class UI {
  constructor(playerEntity) {
    this.state = 'Start';
    this.player = playerEntity;
  }

  getStartElements() {
    
  }

  getStationElements() {

  }

  getBattleElements() {
    return {
      name: this.player.name || 'Blank',
      health: this.player.health || 0,
      maxHealth: this.player.maxHealth || 1,
      armor: this.player.armor || 0,
      actions: [],
    };
  }
}

export default UI;
