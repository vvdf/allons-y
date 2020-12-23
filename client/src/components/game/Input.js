class Input {
  constructor(targetEventQueue, ownerEntity) {
    this.eventQueue = targetEventQueue;
    this.owner = ownerEntity;
    this.mode = 'ui'; // ui menu, text (input), combat or field
    this.key = {};
    this.keyMap = {};
    this.init();
  }

  init() {
    // assign keys to functions
    this.registerKeys();
    this.mapKeys();

    // initialize key listener
    window.addEventListener('keydown', ({ keyCode }) => {
      if ({}.hasOwnProperty.call(this.keyMap[this.mode], keyCode)) {
        this.sendEvent(this.keyMap[this.mode][keyCode]);
      } else {
        // unlisted key for given mode
        console.log(`Unassigned Key Pressed / KEY CODE: ${keyCode} / INPUT MODE: ${this.mode}`);
      }
    }, false);
  }

  setMode(newMode) {
    if (newMode === 'ui' || newMode === 'text' || newMode === 'field') {
      this.mode = newMode;
    }
  }

  registerKeys() {
    // TODO - refactor to allow this to check for custom key assignments in user profile
    // key assignments
    this.key.moveUp = '38'; // arrow up
    this.key.moveDown = '40'; // arrow down
    this.key.moveLeft = '37'; // arrow left
    this.key.moveRight = '39'; // arrow right
    this.key.select = '13'; // enter
    this.key.back = '8'; // backspace
    this.key.space = '32'; // space
    this.key.minus = '173'; // space

    // debug key assignments
    // paint floor tiles
    this.key.paintGrass = '71'; // 'G'
    this.key.paintDirt = '68'; // 'D'
    this.key.paintRoad = '82'; // 'R'
    this.key.paintWater = '87'; // 'W'

    this.key.refresh = '192'; // tilde
    this.key.toggleUI = '85'; // 'U'

    for (let i = 0; i < 26; i += 1) {
      this.key[String.fromCharCode(97 + i)] = 65 + i;
    }
  }

  mapKeys() {
    // ui menu mappings
    this.keyMap.ui = {};
    this.keyMap.ui[this.key.moveUp] = { signal: 'UI_SELECT', params: [1] };
    this.keyMap.ui[this.key.moveDown] = { signal: 'UI_SELECT', params: [2] };
    this.keyMap.ui[this.key.moveLeft] = { signal: 'UI_SELECT', params: [3] };
    this.keyMap.ui[this.key.moveRight] = { signal: 'UI_SELECT', params: [4] };
    this.keyMap.ui[this.key.select] = { signal: 'UI_SELECT', params: [0] };

    // text input controls
    this.keyMap.text = {};
    this.keyMap.text[this.key.moveLeft] = { signal: 'UI_INPUT', params: [1] };
    this.keyMap.text[this.key.moveRight] = { signal: 'UI_INPUT', params: [2] };
    this.keyMap.text[this.key.select] = { signal: 'UI_INPUT', params: [0] };
    this.keyMap.text[this.key.back] = { signal: 'UI_INPUT', params: [-1] };
    this.keyMap.text[this.key.space] = { signal: 'UI_INPUT', params: [' '] };
    this.keyMap.text[this.key.minus] = { signal: 'UI_INPUT', params: ['-'] };
    for (let i = 0; i < 26; i += 1) {
      const char = String.fromCharCode(97 + i);
      this.keyMap.text[this.key[char]] = { signal: 'UI_INPUT', params: [char] };
    }

    // field key mapping, only allow if an owner entity is set
    if (this.owner) {
      this.keyMap.field = {};
      // player actions
      this.keyMap.field[this.key.moveUp] = { signal: 'MOVE_ENTITY', params: [this.owner.id, 0, -1] };
      this.keyMap.field[this.key.moveDown] = { signal: 'MOVE_ENTITY', params: [this.owner.id, 0, 1] };
      this.keyMap.field[this.key.moveLeft] = { signal: 'MOVE_ENTITY', params: [this.owner.id, -1, 0] };
      this.keyMap.field[this.key.moveRight] = { signal: 'MOVE_ENTITY', params: [this.owner.id, 1, 0] };

      this.keyMap.field[this.key.toggleUI] = { signal: 'TOGGLE_UI', params: [] };

      // debug field key mapping
      this.keyMap.field[this.key.refresh] = { signal: 'RERENDER', params: ['full'] };
      this.keyMap.field[this.key.paintGrass] = { signal: 'PAINT_MAP', params: [this.owner.id, 'g'] };
      this.keyMap.field[this.key.paintDirt] = { signal: 'PAINT_MAP', params: [this.owner.id, 'd'] };
      this.keyMap.field[this.key.paintRoad] = { signal: 'PAINT_MAP', params: [this.owner.id, 'r'] };
      this.keyMap.field[this.key.paintWater] = { signal: 'PAINT_MAP', params: [this.owner.id, 'w'] };
    }
  }

  sendEvent(event) {
    this.eventQueue.enqueue(event);
  }

  setOwner(ownerEntity) {
    this.owner = ownerEntity;
    this.mapKeys(); // refresh key mappings to factor in owner entity
  }
}

export default Input;
