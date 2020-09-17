class Input {
  constructor(targetEventQueue, ownerEntity) {
    this.eventQueue = targetEventQueue;
    this.owner = ownerEntity;

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
    if (this.owner) {
      this.mapKeys();
    }

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
    this.keyMap[this.moveUp] = { signal: 'MOVE_ENTITY', params: [this.owner.id, 0, -1] };
    this.keyMap[this.moveDown] = { signal: 'MOVE_ENTITY', params: [this.owner.id, 0, 1] };
    this.keyMap[this.moveLeft] = { signal: 'MOVE_ENTITY', params: [this.owner.id, -1, 0] };
    this.keyMap[this.moveRight] = { signal: 'MOVE_ENTITY', params: [this.owner.id, 1, 0] };

    // debug key mapping
    this.keyMap[this.paintGrass] = { signal: 'PAINT_MAP', params: [this.owner.id, 'g'] };
    this.keyMap[this.paintDirt] = { signal: 'PAINT_MAP', params: [this.owner.id, 'd'] };
    this.keyMap[this.paintRoad] = { signal: 'PAINT_MAP', params: [this.owner.id, 'r'] };
    this.keyMap[this.paintWater] = { signal: 'PAINT_MAP', params: [this.owner.id, 'w'] };
  }

  sendEvent(event) {
    this.eventQueue.enqueue(event);
  }

  setOwner(ownerEntity) {
    this.owner = ownerEntity;
    this.mapKeys();
  }
}

export default Input;
