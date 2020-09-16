class Input {
  constructor(ownerEntity, targetEventQueue) {
    this.owner = ownerEntity;
    this.eventQueue = targetEventQueue;

    this.keyMap = {};

    // key assignments
    this.moveUp = '38'; // arrow up
    this.moveDown = '40'; // arrow down
    this.moveLeft = '37'; // arrow left
    this.moveRight = '39'; // arrow right

    // debug key assignments
    // paint floor tiles
    this.paintGrass = '71'; // 'G'
    this.paintDirt = '68'; // 'D'
    this.paintRoad = '82'; // 'R'
    this.paintWater = '87'; // 'W'

    this.init();
  }

  init() {
    // assign keys to functions
    this.mapKeys();

    // initialize key listener
    window.addEventListener('keydown', ({ keyCode }) => {
      if (this.keyMap[keyCode]) {
        this.sendEvent(this.keyMap[keyCode]);
      } else {
        // unlisted key
        console.log('Unassigned Key Pressed: ', keyCode);
      }
    }, false);
  }

  mapKeys() {
    // key mapping
    this.keyMap[this.moveUp] = () => this.owner.move(0, -1);
    this.keyMap[this.moveDown] = () => this.owner.move(0, 1);
    this.keyMap[this.moveLeft] = () => this.owner.move(-1, 0);
    this.keyMap[this.moveRight] = () => this.owner.move(1, 0);

    // debug key mapping
    this.keyMap[this.paintGrass] = () => this.owner.map.set(this.owner.x, this.owner.y, 'g');
    this.keyMap[this.paintDirt] = () => this.owner.map.set(this.owner.x, this.owner.y, 'd');
    this.keyMap[this.paintRoad] = () => this.owner.map.set(this.owner.x, this.owner.y, 'r');
    this.keyMap[this.paintWater] = () => this.owner.map.set(this.owner.x, this.owner.y, 'w');
  }

  sendEvent(callback) {
    this.eventQueue.push(() => callback());
  }
}

export default Input;
